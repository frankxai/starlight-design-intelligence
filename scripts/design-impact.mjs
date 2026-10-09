import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const id = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(value);
const pathValid = value => typeof value === 'string' && value.length <= 500 && !value.startsWith('/') && !/[\\\x00-\x1f*?]/.test(value) && !value.split('/').some(x => !x || x === '.' || x === '..');
export function validateAtlas(atlas) {
  requireValue(atlas?.schema_version === 'starlight.screen_atlas.v1', 'Unknown atlas version.');
  requireValue(/^[\w.-]+\/[\w.-]+$/.test(atlas.repository) && /^[a-f0-9]{40}$/.test(atlas.source_commit), 'Immutable source owner required.');
  requireValue(id(atlas.brand_id), 'Brand ID required.');
  requireValue(Array.isArray(atlas.screens) && atlas.screens.length > 0 && atlas.screens.length <= 2000, 'Bounded screen inventory required.');
  const ids = new Set();
  for (const screen of atlas.screens) {
    requireValue(id(screen.id) && !ids.has(screen.id), 'Screen ID invalid or duplicated.'); ids.add(screen.id);
    requireValue(typeof screen.route === 'string' && screen.route.startsWith('/') && !/[?#\x00-\x20]/.test(screen.route) && !screen.route.startsWith('//') && !screen.route.split('/').some(x => x === '.' || x === '..'), 'Clean route required.');
    requireValue(['static', 'dynamic-template'].includes(screen.route_kind), 'Route kind required.');
    requireValue(screen.route_kind !== 'dynamic-template' || screen.route.includes('['), 'Dynamic template marker required.');
    requireValue(['source-known', 'captured', 'reviewed'].includes(screen.status), 'Explicit screen evidence status required.');
    if (screen.status !== 'source-known') requireValue(id(screen.capture_ref), 'Captured status requires an evidence reference.');
    if (screen.status === 'reviewed') requireValue(id(screen.review_ref), 'Reviewed status requires a review reference.');
    requireValue(Array.isArray(screen.states) && screen.states.length > 0 && screen.states.every(id) && new Set(screen.states).size === screen.states.length, 'Distinct scenario states required.');
    requireValue(Array.isArray(screen.sources) && screen.sources.length > 0 && screen.sources.every(pathValid), 'Exact source paths required.');
    requireValue(Array.isArray(screen.prefixes) && screen.prefixes.every(p => p.endsWith('/') && pathValid(p.slice(0, -1))), 'Contained directory prefixes required.');
    requireValue(screen.figma_status === 'unmapped' || screen.figma_status === 'mapped', 'Explicit Figma mapping status required.');
    if (screen.figma_status === 'mapped') requireValue(id(screen.figma_ref), 'Private mapping reference required.');
  }
  requireValue(Array.isArray(atlas.shared_sources) && atlas.shared_sources.every(pathValid), 'Shared source paths required.');
  requireValue(Array.isArray(atlas.shared_prefixes) && atlas.shared_prefixes.every(p => p.endsWith('/') && pathValid(p.slice(0, -1))), 'Shared prefixes required.');
  return atlas;
}
const matches = (path, sources, prefixes) => sources.includes(path) || prefixes.some(prefix => path.startsWith(prefix));
export function planDesignImpact(atlas, change, { maxCaptures = 40 } = {}) {
  validateAtlas(atlas);
  requireValue(change?.repository === atlas.repository && change.base_commit === atlas.source_commit && /^[a-f0-9]{40}$/.test(change.head_commit), 'Change owner/base must match the atlas revision.');
  requireValue(change.head_commit !== change.base_commit, 'Distinct change revision required.');
  requireValue(Number.isInteger(maxCaptures) && maxCaptures > 0 && maxCaptures <= 10000, 'Bounded capture budget required.');
  requireValue(Array.isArray(change.files) && change.files.length > 0 && change.files.length <= 10000, 'Complete changed-file inventory required.');
  const paths = new Set(), inventoryChanges = [];
  const routeEntry = path => /^(?:src\/)?app\/(?:.*\/)?page\.[cm]?[jt]sx?$/.test(path) || /^(?:src\/)?pages\/.*\.[cm]?[jt]sx?$/.test(path) || /^public\/.*\.html$/.test(path);
  for (const file of change.files) {
    requireValue(['added', 'modified', 'removed', 'renamed'].includes(file.status) && pathValid(file.path), 'Valid changed path/status required.');
    paths.add(file.path);
    if (routeEntry(file.path) && ['added', 'removed', 'renamed'].includes(file.status)) inventoryChanges.push(file.path);
    if (file.status === 'renamed') {
      requireValue(pathValid(file.previous_path), 'Rename requires previous path.'); paths.add(file.previous_path);
      if (routeEntry(file.previous_path)) inventoryChanges.push(file.previous_path);
    }
  }
  const touched = new Map(), unknown = [];
  for (const path of [...paths].sort()) {
    const shared = matches(path, atlas.shared_sources, atlas.shared_prefixes);
    const affected = atlas.screens.filter(screen => shared || matches(path, screen.sources, screen.prefixes));
    if (!affected.length) unknown.push(path);
    for (const screen of affected) touched.set(screen.id, [...(touched.get(screen.id) || []), path]);
  }
  // Unmapped changes cannot silently become 'no visual impact'. Conservatively inspect all.
  if (unknown.length || inventoryChanges.length) for (const screen of atlas.screens) touched.set(screen.id, [...new Set([...(touched.get(screen.id) || []), ...unknown, ...inventoryChanges])]);
  const screens = atlas.screens.filter(s => touched.has(s.id)).map(screen => ({
    id: screen.id, route: screen.route, route_kind: screen.route_kind, states: screen.states,
    changed_dependencies: touched.get(screen.id), figma_status: screen.figma_status,
    ...(screen.figma_ref ? { figma_ref: screen.figma_ref } : {}),
    action: screen.route_kind === 'dynamic-template' ? 'RESOLVE_FIXTURE_THEN_CAPTURE' : 'CAPTURE_AND_REVIEW',
    viewports: [{ width: 1440, height: 1000, dpr: 1 }, { width: 390, height: 844, dpr: 1 }]
  })).sort((a, b) => a.id.localeCompare(b.id));
  const captureCount = screens.reduce((n, s) => n + s.states.length * s.viewports.length, 0);
  const blockers = [
    ...(unknown.length ? ['UNMAPPED_CHANGE_REQUIRES_DEPENDENCY_REVIEW'] : []),
    ...(inventoryChanges.length ? ['INVENTORY_REFRESH_REQUIRED'] : []),
    ...(captureCount > maxCaptures ? ['CAPTURE_BUDGET_EXCEEDED'] : []),
    ...(screens.some(s => s.route_kind === 'dynamic-template') ? ['DYNAMIC_FIXTURES_REQUIRED'] : [])
  ];
  return {
    schema_version: 'starlight.design_impact.v1', repository: atlas.repository,
    base_commit: change.base_commit, head_commit: change.head_commit,
    verdict: 'PLANNED_NOT_CAPTURED', unknown_paths: unknown, inventory_changes: inventoryChanges, blockers,
    capture_count: captureCount, max_captures: maxCaptures,
    screens, figma_mapping_queue: screens.filter(s => s.figma_status === 'unmapped').map(s => s.id),
    execution: 'READ_ONLY_PLAN', approval: 'NOT_REQUESTED',
    next: 'Bind an authenticated deployment to head_commit, then capture resolved scenarios. Preserve approved design baselines.'
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [atlasPath, changePath, budget] = process.argv.slice(2);
  requireValue(atlasPath && changePath, 'Usage: node scripts/design-impact.mjs atlas.json change.json [max-captures]');
  const report = planDesignImpact(JSON.parse(readFileSync(atlasPath)), JSON.parse(readFileSync(changePath)), budget === undefined ? {} : { maxCaptures: Number(budget) });
  console.log(JSON.stringify(report, null, 2));
  if (report.blockers.length) process.exitCode = 2;
}
