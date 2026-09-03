#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { OBSERVATORY, digest, loadObservatory } from "./observatory-lib.mjs";

const data = loadObservatory();
const snapshots = new Map(data.snapshots.map((item) => [item.value.snapshot_id, item.value]));
const patterns = new Map(data.patterns.map((item) => [item.value.pattern_id, item.value]));

function latestBySurface(snapshotIds) {
  const latest = new Map();
  for (const snapshotId of snapshotIds) {
    const snapshot = snapshots.get(snapshotId);
    if (!snapshot) continue;
    const key = `${snapshot.target_id}/${snapshot.surface_id}/${snapshot.viewport.width}`;
    const current = latest.get(key);
    if (!current || snapshot.captured_at > current.captured_at) latest.set(key, snapshot);
  }
  return [...latest.values()]
    .sort((a, b) => a.target_id.localeCompare(b.target_id) || a.surface_id.localeCompare(b.surface_id))
    .map((snapshot) => ({
      snapshot_id: snapshot.snapshot_id,
      target_id: snapshot.target_id,
      surface_id: snapshot.surface_id,
      captured_at: snapshot.captured_at,
      viewport: snapshot.viewport,
      content_hash: snapshot.content_hash,
      page_state: snapshot.response.observed_page_state
    }));
}

const domains = {};
for (const item of data.domains.sort((a, b) => a.value.domain_id.localeCompare(b.value.domain_id))) {
  const profile = item.value;
  const selectedPatterns = profile.approved_pattern_ids.map((patternId) => {
    const pattern = patterns.get(patternId);
    const snapshotIds = pattern.observed_in.flatMap((entry) => entry.snapshot_ids);
    return {
      pattern_id: patternId,
      title: pattern.title,
      kind: pattern.kind,
      source_targets: [...new Set(pattern.observed_in.map((entry) => entry.target_id))].sort(),
      latest_snapshots: latestBySurface(snapshotIds)
    };
  });
  const allSnapshotIds = selectedPatterns.flatMap((pattern) =>
    pattern.latest_snapshots.map((snapshot) => snapshot.snapshot_id)
  );
  domains[profile.domain_id] = {
    domains: profile.domains,
    brand_id: profile.brand_id,
    selected_pattern_ids: profile.approved_pattern_ids,
    nominated_direction_id: profile.nominated_direction_id,
    patterns: selectedPatterns,
    latest_snapshots: latestBySurface(allSnapshotIds)
  };
}

const index = {
  schema_version: "starlight.design_retrieval_index.v1",
  generated_from_latest_capture: [...snapshots.values()]
    .map((snapshot) => snapshot.captured_at)
    .sort()
    .at(-1),
  domains
};
const canonical = JSON.stringify(index);
const output = { ...index, index_sha256: digest(canonical) };
writeFileSync(join(OBSERVATORY, "retrieval-index.json"), JSON.stringify(output, null, 2) + "\n");
console.log(
  `Retrieval index written for ${Object.keys(domains).length} domains (${output.index_sha256.slice(0, 12)}).`
);
