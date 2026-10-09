import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { planDesignImpact, validateAtlas } from '../scripts/design-impact.mjs';

const fixture = () => ({ schema_version: 'starlight.screen_atlas.v1', repository: 'example/product', brand_id: 'example', source_commit: 'a'.repeat(40), shared_sources: ['app/layout.tsx'], shared_prefixes: ['components/'], screens: [
  { id: 'home', route: '/', route_kind: 'static', status: 'source-known', states: ['default'], sources: ['app/page.tsx'], prefixes: ['app/home/'], figma_status: 'unmapped' },
  { id: 'pricing', route: '/pricing', route_kind: 'static', status: 'source-known', states: ['default', 'error'], sources: ['app/pricing/page.tsx'], prefixes: ['app/pricing/'], figma_status: 'mapped', figma_ref: 'pricing-review' }
] });
const change = files => ({ repository: 'example/product', base_commit: 'a'.repeat(40), head_commit: 'b'.repeat(40), files });
test('local changes select exact screens and explicit pending Figma work', () => {
  const r = planDesignImpact(fixture(), change([{ path: 'app/page.tsx', status: 'modified' }]));
  assert.deepEqual(r.screens.map(s => s.id), ['home']); assert.equal(r.capture_count, 2);
  assert.deepEqual(r.figma_mapping_queue, ['home']); assert.equal(r.verdict, 'PLANNED_NOT_CAPTURED');
});
test('shared dependencies select all states and both viewports without duplication', () => {
  const r = planDesignImpact(fixture(), change([{ path: 'app/layout.tsx', status: 'modified' }, { path: 'components/Button.tsx', status: 'modified' }]));
  assert.equal(r.screens.length, 2); assert.equal(r.capture_count, 6);
});
test('renames consider old and new paths and removals retain affected screens', () => {
  const r = planDesignImpact(fixture(), change([{ path: 'app/pricing/new.tsx', previous_path: 'app/home/old.tsx', status: 'renamed' }]));
  assert.equal(r.screens.length, 2);
  const removed = planDesignImpact(fixture(), change([{ path: 'app/page.tsx', status: 'removed' }]));
  assert.deepEqual(removed.screens.map(s => s.id), ['home', 'pricing']); assert.ok(removed.blockers.includes('INVENTORY_REFRESH_REQUIRED'));
  const retired = planDesignImpact(fixture(), change([{ path: 'app/pricing/retired.tsx', previous_path: 'app/pricing/page.tsx', status: 'renamed' }]));
  assert.ok(retired.blockers.includes('INVENTORY_REFRESH_REQUIRED'));
});
test('unknown paths conservatively select the entire inventory and block unattended execution', () => {
  const r = planDesignImpact(fixture(), change([{ path: 'lib/unmapped.ts', status: 'modified' }]));
  assert.equal(r.screens.length, 2); assert.deepEqual(r.unknown_paths, ['lib/unmapped.ts']);
  assert.ok(r.blockers.includes('UNMAPPED_CHANGE_REQUIRES_DEPENDENCY_REVIEW'));
});
test('nested added routes cannot hide behind an existing directory mapping', () => {
  for (const path of ['app/page.tsx', 'app/pricing/new/page.tsx', 'src/app/new/page.tsx', 'pages/new.tsx', 'public/labs/new/index.html']) {
    const r = planDesignImpact(fixture(), change([{ path, status: 'added' }]));
    assert.equal(r.screens.length, 2); assert.ok(r.blockers.includes('INVENTORY_REFRESH_REQUIRED'));
    assert.deepEqual(r.inventory_changes, [path]);
  }
});
test('captured and reviewed statuses require separate evidence references', () => {
  const a = fixture(); a.screens[0].status = 'reviewed'; assert.throws(() => validateAtlas(a), /evidence/);
  a.screens[0].capture_ref = 'capture-home'; assert.throws(() => validateAtlas(a), /review reference/);
  a.screens[0].review_ref = 'review-home'; assert.equal(validateAtlas(a), a);
});
test('dynamic templates require fixtures and budget excess cannot return a green plan', () => {
  const atlas = fixture(); atlas.screens[1].route = '/pricing/[tier]'; atlas.screens[1].route_kind = 'dynamic-template';
  const r = planDesignImpact(atlas, change([{ path: 'app/layout.tsx', status: 'modified' }]), { maxCaptures: 2 });
  assert.ok(r.blockers.includes('DYNAMIC_FIXTURES_REQUIRED')); assert.ok(r.blockers.includes('CAPTURE_BUDGET_EXCEEDED'));
});
test('cross-owner, stale-base, incomplete renames and unsafe paths are rejected', () => {
  const c = change([{ path: 'app/page.tsx', status: 'modified' }]);
  for (const patch of [{ repository: 'example/other' }, { base_commit: 'c'.repeat(40) }, { head_commit: 'main' }, { files: [{ path: '../secret', status: 'modified' }] }, { files: [{ path: 'app/home/new.tsx', status: 'renamed' }] }]) assert.throws(() => planDesignImpact(fixture(), { ...c, ...patch }));
  for (const p of ['app\\home.tsx', '/etc/passwd', 'app//page.tsx', 'app/*', 'app/./page.tsx']) assert.throws(() => planDesignImpact(fixture(), change([{ path: p, status: 'added' }])));
});
test('malformed route, state and duplicate screen inventories fail closed', () => {
  for (const mutation of [a => a.screens.push(a.screens[0]), a => a.screens[0].states.push('default'), a => a.screens[0].route = '//evil.test', a => a.screens[0].route = '/../private', a => a.screens[0].prefixes = ['../']]) { const a = fixture(); mutation(a); assert.throws(() => validateAtlas(a)); }
});
test('source-derived GenCreator atlas remains explicitly unverified', () => {
  const a = validateAtlas(JSON.parse(readFileSync(new URL('../portfolio/screen-atlases/gencreator.json', import.meta.url))));
  assert.ok(a.screens.length > 50); assert.ok(a.screens.every(s => s.status === 'source-known' && s.figma_status === 'unmapped'));
  assert.ok(a.screens.find(s => s.route === '/workspace')); assert.ok(a.screens.find(s => s.route_kind === 'dynamic-template'));
});
