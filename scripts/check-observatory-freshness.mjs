#!/usr/bin/env node
import { loadObservatory } from "./observatory-lib.mjs";

const asOfArg = process.argv.find((value) => value.startsWith("--as-of="));
const asOf = asOfArg ? new Date(asOfArg.slice("--as-of=".length)) : new Date();
if (Number.isNaN(asOf.valueOf())) {
  console.error("Invalid --as-of date.");
  process.exit(2);
}
const data = loadObservatory();
const targetById = new Map(data.targets.map((item) => [item.value.target_id, item.value]));
const stale = [];
const pending = [];
for (const item of data.snapshots) {
  const snapshot = item.value;
  const target = targetById.get(snapshot.target_id);
  const ageDays = Math.floor((asOf - new Date(snapshot.captured_at)) / 86_400_000);
  if (ageDays > target.capture_policy.freshness_days) {
    stale.push({ snapshot_id: snapshot.snapshot_id, age_days: ageDays });
  }
  if (Object.values(snapshot.artifacts).some((artifact) => artifact.storage_status === "pending-private-storage")) {
    pending.push(snapshot.snapshot_id);
  }
}
if (stale.length) {
  console.error(`Freshness check failed: ${stale.length} stale snapshots.`);
  for (const item of stale) console.error(`- ${item.snapshot_id}: ${item.age_days} days`);
  process.exit(1);
}
console.log(`Freshness valid: ${data.snapshots.length} manifests are inside their target windows.`);
if (pending.length) console.warn(`Private storage pending for ${pending.length} manifests; hashes and addresses are retained.`);
