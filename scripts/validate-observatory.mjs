#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  DOMAINS,
  OBSERVATORY,
  PATTERNS,
  ROOT,
  TARGETS,
  appendSchemaErrors,
  artifactExtension,
  createSchemaValidators,
  listFiles,
  loadObservatory,
  readJson,
  relativePath
} from "./observatory-lib.mjs";

const strictCoverage = process.argv.includes("--strict-coverage");
const failures = [];
const warnings = [];
const requiredWidths = [1440, 390, 320];
const requiredKinds = ["homepage", "product-overview", "feature", "conversion", "proof"];
const validators = createSchemaValidators();
const data = loadObservatory();

function validateAll(items, validate) {
  for (const item of items) {
    if (!validate(item.value)) appendSchemaErrors(failures, relativePath(item.path), validate);
  }
}
validateAll(data.targets, validators.target);
validateAll(data.snapshots, validators.snapshot);
validateAll(data.extractions, validators.extraction);
validateAll(data.patterns, validators.pattern);
validateAll(data.domains, validators.domain);

function duplicateValues(values) {
  const seen = new Set();
  return [...new Set(values.filter((value) => seen.size === seen.add(value).size))];
}

function uniqueBy(items, key, label) {
  for (const duplicate of duplicateValues(items.map(key))) failures.push(`duplicate ${label}: ${duplicate}`);
}

uniqueBy(data.targets, (item) => item.value.target_id, "target_id");
uniqueBy(data.snapshots, (item) => item.value.snapshot_id, "snapshot_id");
uniqueBy(data.patterns, (item) => item.value.pattern_id, "pattern_id");
uniqueBy(data.domains, (item) => item.value.domain_id, "domain_id");

const targetById = new Map(data.targets.map((item) => [item.value.target_id, item.value]));
const snapshotById = new Map(data.snapshots.map((item) => [item.value.snapshot_id, item.value]));
const patternById = new Map(data.patterns.map((item) => [item.value.pattern_id, item.value]));
const extractionByTarget = new Map(data.extractions.map((item) => [item.value.target_id, item.value]));

for (const item of data.targets) {
  const target = item.value;
  if (basename(dirname(item.path)) !== target.target_id) {
    failures.push(`${relativePath(item.path)}: directory must match target_id`);
  }
  const kinds = target.surfaces.map((surface) => surface.kind).sort();
  if (JSON.stringify(kinds) !== JSON.stringify([...requiredKinds].sort())) {
    failures.push(`${target.target_id}: must select exactly one surface of each required kind`);
  }
  uniqueBy(target.surfaces, (surface) => surface.surface_id, `${target.target_id} surface_id`);
  const viewports = target.capture_policy.viewports;
  for (const width of requiredWidths) {
    if (!viewports.some((viewport) => viewport.width === width)) {
      failures.push(`${target.target_id}: capture policy missing required width ${width}`);
    }
  }
  const targetSnapshots = data.snapshots.filter((entry) => entry.value.target_id === target.target_id);
  const extraction = extractionByTarget.get(target.target_id);
  if (!extraction) failures.push(`${target.target_id}: missing extraction.yaml`);
  for (const surface of target.surfaces) {
    const surfaceSnapshots = targetSnapshots.filter((entry) => entry.value.surface_id === surface.surface_id);
    if (!surfaceSnapshots.length) failures.push(`${target.target_id}/${surface.surface_id}: missing snapshot manifest`);
    const widths = new Set(surfaceSnapshots.map((entry) => entry.value.viewport.width));
    for (const width of requiredWidths) {
      if (!widths.has(width)) {
        const message = `${target.target_id}/${surface.surface_id}: exact viewport ${width}px pending`;
        if (strictCoverage) failures.push(message);
        else warnings.push(message);
      }
    }
  }
}

for (const item of data.snapshots) {
  const snapshot = item.value;
  const target = targetById.get(snapshot.target_id);
  if (!target) {
    failures.push(`${snapshot.snapshot_id}: unknown target_id ${snapshot.target_id}`);
    continue;
  }
  const surface = target.surfaces.find((candidate) => candidate.surface_id === snapshot.surface_id);
  if (!surface) failures.push(`${snapshot.snapshot_id}: unknown surface_id ${snapshot.surface_id}`);
  if (snapshot.provenance?.source_owner !== target.source_owner) {
    failures.push(`${snapshot.snapshot_id}: provenance source_owner does not match target`);
  }
  if (snapshot.rights?.state !== target.rights.state || !snapshot.rights?.allowed_use) {
    failures.push(`${snapshot.snapshot_id}: missing or inconsistent rights classification`);
  }
  if (snapshot.route !== new URL(snapshot.url).pathname) {
    failures.push(`${snapshot.snapshot_id}: route does not match captured URL pathname`);
  }
  for (const [name, artifact] of Object.entries(snapshot.artifacts ?? {})) {
    if (!artifact.sha256 || !artifact.content_address || !artifact.bytes) {
      failures.push(`${snapshot.snapshot_id}/${name}: capture hash metadata incomplete`);
      continue;
    }
    const extension = artifactExtension(artifact.mime);
    const expected = `sha256/${artifact.sha256.slice(0, 2)}/${artifact.sha256}.${extension}`;
    if (artifact.content_address !== expected) {
      failures.push(`${snapshot.snapshot_id}/${name}: invalid content-addressed path`);
    }
    if (artifact.storage_status === "stored-private" && !artifact.storage_uri) {
      failures.push(`${snapshot.snapshot_id}/${name}: stored-private requires storage_uri`);
    }
    if (name === "screenshot" && (!artifact.width || !artifact.height)) {
      failures.push(`${snapshot.snapshot_id}/screenshot: dimensions are required`);
    }
  }
}

for (const item of data.extractions) {
  const extraction = item.value;
  if (!targetById.has(extraction.target_id)) failures.push(`${extraction.extraction_id}: unknown target`);
  for (const snapshotId of extraction.snapshot_ids) {
    if (!snapshotById.has(snapshotId)) failures.push(`${extraction.extraction_id}: unknown snapshot ${snapshotId}`);
  }
  const groups = [
    ...Object.values(extraction.findings),
    extraction.anti_patterns,
    extraction.category_saturation
  ];
  for (const finding of groups.flat()) {
    if (!finding.rights_safe_abstraction) failures.push(`${finding.finding_id}: rights-safe abstraction must be explicit`);
    if (finding.kind === "observed" && !finding.evidence_snapshot_ids.length) {
      failures.push(`${finding.finding_id}: observed finding requires evidence`);
    }
    for (const snapshotId of finding.evidence_snapshot_ids) {
      if (!snapshotById.has(snapshotId)) failures.push(`${finding.finding_id}: unknown evidence ${snapshotId}`);
    }
  }
}

for (const item of data.patterns) {
  const pattern = item.value;
  if (basename(item.path, ".yaml") !== pattern.pattern_id) {
    failures.push(`${relativePath(item.path)}: filename must match pattern_id`);
  }
  for (const observed of pattern.observed_in) {
    if (!targetById.has(observed.target_id)) failures.push(`${pattern.pattern_id}: unknown target ${observed.target_id}`);
    for (const snapshotId of observed.snapshot_ids) {
      const snapshot = snapshotById.get(snapshotId);
      if (!snapshot) failures.push(`${pattern.pattern_id}: unknown snapshot ${snapshotId}`);
      else if (snapshot.target_id !== observed.target_id) failures.push(`${pattern.pattern_id}: evidence target mismatch`);
    }
  }
}

const runtimeBrandsRoot = join(ROOT, "brand-image-system/runtime/brands");
const runtimeBrandFiles = listFiles(runtimeBrandsRoot, /^brand-pack\.json$/u);
const runtimeBrands = new Map(runtimeBrandFiles.map((path) => {
  const value = readJson(path);
  return [value.brandId, value];
}));
const humanBrands = new Set(
  readdirSync(join(ROOT, "brand-packs"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
);
const runtimeBrandIds = new Set(runtimeBrands.keys());
for (const brandId of new Set([...humanBrands, ...runtimeBrandIds])) {
  if (!humanBrands.has(brandId)) failures.push(`runtime brand ${brandId} has no human-readable brand pack`);
  if (!runtimeBrandIds.has(brandId)) failures.push(`human-readable brand ${brandId} has no runtime brand pack`);
}

const portfolio = readJson(join(ROOT, "portfolio/core-surfaces.json"));
const portfolioByRepo = new Map(portfolio.repositories.map((entry) => [entry.repository.toLowerCase(), entry]));
for (const item of data.domains) {
  const profile = item.value;
  if (basename(item.path, ".yaml") !== profile.domain_id) {
    failures.push(`${relativePath(item.path)}: filename must match domain_id`);
  }
  const brand = runtimeBrands.get(profile.brand_id);
  if (!brand) {
    failures.push(`${profile.domain_id}: unknown canonical brand ${profile.brand_id}`);
    continue;
  }
  for (const repo of profile.canonical_repositories) {
    if (!(brand.canonicalRepos ?? []).some((owned) => owned.toLowerCase() === repo.toLowerCase())) {
      failures.push(`${profile.domain_id}: brand ${profile.brand_id} does not own ${repo}`);
    }
    const enrolled = portfolioByRepo.get(repo.toLowerCase());
    if (!enrolled) failures.push(`${profile.domain_id}: ${repo} missing from core-surfaces.json`);
    else if (enrolled.brand_id !== profile.brand_id) failures.push(`${profile.domain_id}: enrolled domain ownership mismatch for ${repo}`);
  }
  for (const surfaceId of profile.surface_ids) {
    const owned = profile.canonical_repositories.some((repo) =>
      portfolioByRepo.get(repo.toLowerCase())?.surfaces.some((surface) => surface.id === surfaceId)
    );
    if (!owned) failures.push(`${profile.domain_id}: unowned surface_id ${surfaceId}`);
  }
  for (const patternId of profile.approved_pattern_ids) {
    const pattern = patternById.get(patternId);
    if (!pattern) failures.push(`${profile.domain_id}: unknown pattern ${patternId}`);
    else if (pattern.status !== "approved") failures.push(`${profile.domain_id}: pattern ${patternId} is not approved`);
  }
  for (const influence of profile.influence_map) {
    if (!profile.approved_pattern_ids.includes(influence.pattern_id)) {
      failures.push(`${profile.domain_id}: influence pattern ${influence.pattern_id} is not selected`);
    }
    if (!targetById.has(influence.target_id)) failures.push(`${profile.domain_id}: unknown influence target ${influence.target_id}`);
    const pattern = patternById.get(influence.pattern_id);
    if (pattern && !pattern.observed_in.some((entry) => entry.target_id === influence.target_id)) {
      failures.push(
        `${profile.domain_id}: influence target ${influence.target_id} is not evidence for ${influence.pattern_id}`
      );
    }
  }
  const ids = profile.directions.map((direction) => direction.direction_id);
  if (new Set(ids).size !== 3) failures.push(`${profile.domain_id}: directions must be three distinct IDs`);
  if (new Set(profile.directions.map((direction) => direction.composition)).size !== 3) {
    failures.push(`${profile.domain_id}: directions must be materially different compositions`);
  }
  if (!ids.includes(profile.nominated_direction_id)) failures.push(`${profile.domain_id}: nominated direction not preserved`);
  for (const direction of profile.directions) {
    const total = Object.values(direction.scores).reduce((sum, value) => sum + value, 0);
    if (total !== direction.total) failures.push(`${direction.direction_id}: total ${direction.total} should be ${total}`);
    for (const patternId of direction.selected_pattern_ids) {
      if (!profile.approved_pattern_ids.includes(patternId)) failures.push(`${direction.direction_id}: unapproved selected pattern ${patternId}`);
    }
  }
}

const ledgerPath = join(OBSERVATORY, "source-ledger.jsonl");
if (!existsSync(ledgerPath)) failures.push("observatory/source-ledger.jsonl is missing");
else {
  const rows = readFileSync(ledgerPath, "utf8").trim().split("\n").filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); } catch (error) {
      failures.push(`source-ledger.jsonl line ${index + 1}: invalid JSON`);
      return null;
    }
  }).filter(Boolean);
  uniqueBy(rows, (row) => row.snapshot_id, "source-ledger snapshot_id");
  const ledgerIds = new Set(rows.map((row) => row.snapshot_id));
  for (const snapshotId of snapshotById.keys()) if (!ledgerIds.has(snapshotId)) failures.push(`${snapshotId}: missing source ledger entry`);
  for (const row of rows) {
    if (!row.source_owner || !row.capture_date || !row.rights_state || !row.allowed_use || !row.content_hash) {
      failures.push(`${row.snapshot_id}: ledger provenance incomplete`);
    }
  }
}

const prohibitedRaw = listFiles(OBSERVATORY, /\.(png|jpe?g|webp|gif|html?|zip)$/iu);
for (const path of prohibitedRaw) failures.push(`raw evidence must not be committed: ${relativePath(path)}`);

if (failures.length) {
  console.error(`Observatory validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) console.error(`Warnings: ${warnings.length} (exact viewport captures pending)`);
  process.exit(1);
}
console.log(
  `Observatory valid: ${data.targets.length} targets, ${data.snapshots.length} manifests, ${data.patterns.length} patterns, ${data.domains.length} domains.`
);
if (warnings.length) console.warn(`Coverage warnings: ${warnings.length} exact surface/viewports pending (run with --strict-coverage to fail).`);
