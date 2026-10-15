import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { prepareRegistration, registerMediaAsset, sha256, validateAssetRegistry } from "../scripts/register-media-asset.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const empty = { schemaVersion: "starlight.assetRegistry.v1", assets: [] };
const json = (path, value) => writeFileSync(path, JSON.stringify(value));

// Byte-only test artifacts: no generated image, creative review or human approval.
function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "starlight-media-registry-"));
  t.after(() => {
    assert.equal(dirname(realpathSync.native(directory)), realpathSync.native(tmpdir()));
    assert.ok(directory.split(/[\\/]/).at(-1).startsWith("starlight-media-registry-"));
    rmSync(directory, { recursive: true, force: true });
  });
  const assetRoot = join(directory, "assets");
  const jobRoot = join(assetRoot, "jobs", "edition");
  mkdirSync(jobRoot, { recursive: true });
  const registryPath = join(directory, "registry.json");
  json(registryPath, empty);
  const output = Buffer.from("Synthetic byte artifact; not reviewed artwork.\n");
  writeFileSync(join(jobRoot, "output.txt"), output);
  const evidence = Buffer.from("Synthetic review assertion; not an authenticated review.\n");
  writeFileSync(join(jobRoot, "evidence.txt"), evidence);
  const job = {
    jobId: "2026-10-04-fixture", brandId: "frankx", workflowId: "social-static",
    surface: "unit byte fixture", audience: "test runner", brief: "Byte verification only.",
    assetTier: "A", sourceMethod: "deterministic test bytes",
    paths: { jobRoot, outputs: ["output.txt"], evidence: "evidence.txt" },
    qa: { inspected: true, score30: 28, notes: "Synthetic assertion, not visual acceptance." },
    approval: { approver: "fixture approver", reviewedAt: "2026-10-04T00:00:00Z", notes: "Synthetic approval assertion." },
    decision: "approved", updatedAt: "2026-10-04"
  };
  const binding = {
    schemaVersion: "starlight.visAssetEvidenceBinding.v1",
    assets: [{ outputPath: "output.txt", assetId: "asset_" + "a".repeat(24), versionId: "ver_" + "b".repeat(32),
      sha256: sha256(output), rightsStatus: "owned", approvalStatus: "approved", provenanceEventId: "fixture-event",
      provenanceEventType: "indexed", lineage: { kind: "source" } }],
    releaseEvidence: { releaseRecordId: "fixture-release", evidencePath: "evidence.txt", evidenceSha256: sha256(evidence), recordedAt: "2026-10-04T00:00:00Z" }
  };
  const sidecar = {
    schema_version: "1.0.0", asset: { asset_id: binding.assets[0].assetId, version_id: binding.assets[0].versionId, sha256: sha256(output), media_type: "document" },
    generation: { prompt: "Synthetic byte fixture, no image generation", model: "fixture", provider: "local test", seed: null },
    agent: { coding_agent: "unit test", session_ref: "fixture-session" }
  };
  const jobPath = join(jobRoot, "media-job.json");
  const bindingPath = join(jobRoot, "vis-receipt.json");
  const sidecarPath = join(jobRoot, "output.txt.vis.provenance.json");
  json(jobPath, job); json(bindingPath, binding); json(sidecarPath, sidecar);
  return { directory, assetRoot, jobRoot, registryPath, jobPath, bindingPath, sidecarPath, job, binding, sidecar };
}

function apply(f) {
  const preview = registerMediaAsset(f);
  return registerMediaAsset({ ...f, apply: true, expectedRegistrySha256: preview.expectedRegistrySha256, expectedFingerprint: preview.fingerprint });
}

test("the fabricated legacy approval/usage sample fails the runtime gate", () => {
  const old = JSON.parse(readFileSync(join(root, "brand-image-system/runtime/examples/asset-registry.legacy-example.json")));
  assert.ok(validateAssetRegistry(old).length);
  assert.deepEqual(validateAssetRegistry(empty), []);
});

test("preview is read-only; apply reads back one exact registration; repeat is a no-op", t => {
  const f = fixture(t);
  const before = readFileSync(f.registryPath);
  const preview = registerMediaAsset(f);
  assert.equal(preview.outcome, "ready-to-register");
  assert.deepEqual(readFileSync(f.registryPath), before);
  assert.equal(existsSync(f.registryPath + ".lock"), false);
  assert.equal(apply(f).outcome, "registered");
  const written = readFileSync(f.registryPath);
  assert.equal(apply(f).outcome, "already-registered");
  assert.deepEqual(readFileSync(f.registryPath), written);
  const registry = JSON.parse(written);
  assert.equal(registry.assets.length, 1);
  assert.ok(validateAssetRegistry(registry).length, "inaccessible current bytes must not pass");
  assert.deepEqual(validateAssetRegistry(registry, f), []);
  assert.equal(registry.assets[0].status, "file-verified");
  assert.equal("usedIn" in registry.assets[0], false);
  assert.equal(written.includes(f.sidecar.generation.prompt), false);
  assert.equal(readdirSync(f.directory).some(name => name.endsWith(".tmp") || name.endsWith(".lock")), false);
});

test("selected input paths use native canonical identity before containment checks", t => {
  const f = fixture(t);
  let selectedRoot = f.assetRoot;
  if (process.platform === "win32") {
    const escaped = f.directory.replaceAll("'", "''");
    const result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
      `(New-Object -ComObject Scripting.FileSystemObject).GetFolder('${escaped}').ShortPath`],
      { encoding: "utf8", timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    const shortDirectory = result.stdout.trim();
    assert.equal(realpathSync.native(shortDirectory), realpathSync.native(f.directory));
    selectedRoot = join(shortDirectory, "assets");
    t.diagnostic(`Native short path differs from canonical spelling: ${shortDirectory !== realpathSync.native(f.directory)}`);
  }
  const selectedJobRoot = join(selectedRoot, "jobs", "edition");
  json(f.jobPath, { ...f.job, paths: { ...f.job.paths, jobRoot: selectedJobRoot } });
  const input = { ...f, assetRoot: selectedRoot,
    jobPath: join(selectedJobRoot, "media-job.json"), bindingPath: join(selectedJobRoot, "vis-receipt.json") };
  assert.equal(registerMediaAsset(input).outcome, "ready-to-register");
  assert.equal(apply(input).outcome, "registered");
  assert.deepEqual(validateAssetRegistry(JSON.parse(readFileSync(f.registryPath)), { assetRoot: selectedRoot }), []);
});

test("a changed output or evidence fails against the original VIS hashes", t => {
  const f = fixture(t);
  writeFileSync(join(f.jobRoot, "output.txt"), "modified");
  assert.throws(() => prepareRegistration(f), /Output bytes differ/);
  writeFileSync(join(f.jobRoot, "output.txt"), "Synthetic byte artifact; not reviewed artwork.\n");
  writeFileSync(join(f.jobRoot, "evidence.txt"), "modified");
  assert.throws(() => prepareRegistration(f), /Release evidence bytes differ/);
});

test("sidecar removal, incomplete replication fields and identity mismatch fail", t => {
  const f = fixture(t);
  rmSync(f.sidecarPath);
  assert.throws(() => prepareRegistration(f));
  delete f.sidecar.generation.seed; json(f.sidecarPath, f.sidecar);
  assert.throws(() => prepareRegistration(f), /seed/);
  f.sidecar.generation.seed = null; f.sidecar.asset.sha256 = "0".repeat(64); json(f.sidecarPath, f.sidecar);
  assert.throws(() => prepareRegistration(f), /identity\/hash differs/);
});

test("unapproved, published, low-score and uninspected jobs cannot register", t => {
  const f = fixture(t);
  for (const decision of ["draft", "published"]) {
    json(f.jobPath, { ...f.job, decision });
    assert.throws(() => prepareRegistration(f), /approved media-job assertion/);
  }
  json(f.jobPath, { ...f.job, qa: { ...f.job.qa, score30: 27 } });
  assert.throws(() => prepareRegistration(f), /at least 28/);
  json(f.jobPath, { ...f.job, qa: { ...f.job.qa, inspected: false } });
  assert.throws(() => prepareRegistration(f), /schema invalid/);
});

test("unknown rights and incomplete or duplicate VIS output bindings fail", t => {
  const f = fixture(t);
  f.binding.assets[0].rightsStatus = "unknown"; json(f.bindingPath, f.binding);
  assert.throws(() => prepareRegistration(f), /binding schema invalid/);
  f.binding.assets[0].rightsStatus = "owned";
  f.binding.assets.push({ ...f.binding.assets[0] }); json(f.bindingPath, f.binding);
  assert.throws(() => prepareRegistration(f), /exactly the declared outputs/);
  f.binding.assets = []; json(f.bindingPath, f.binding);
  assert.throws(() => prepareRegistration(f), /binding schema invalid/);
});

test("traversal and a real symlink/junction cannot move source verification outside jobRoot", t => {
  const f = fixture(t);
  json(f.jobPath, { ...f.job, paths: { ...f.job.paths, outputs: ["../outside.txt"] } });
  assert.throws(() => prepareRegistration(f));
  json(f.jobPath, f.job);
  const outside = join(f.directory, "outside"); mkdirSync(outside);
  writeFileSync(join(outside, "media-job.json"), JSON.stringify(f.job));
  const link = join(f.assetRoot, "linked");
  symlinkSync(outside, link, process.platform === "win32" ? "junction" : "dir");
  assert.throws(() => prepareRegistration({ ...f, jobPath: join(link, "media-job.json") }), /symbolic link or junction/);
});

test("file and count budgets reject oversized input without reading its body", t => {
  const f = fixture(t);
  truncateSync(join(f.jobRoot, "output.txt"), 64 * 1024 * 1024 + 1);
  assert.throws(() => prepareRegistration(f), /bounded regular file/);
  json(f.jobPath, { ...f.job, paths: { ...f.job.paths, outputs: Array.from({ length: 33 }, (_, i) => `output-${i}.txt`) } });
  assert.throws(() => prepareRegistration(f), /1–32 unique outputs/);
});

test("apply refuses a stale preview and preserves another writer's exact lock", t => {
  const f = fixture(t);
  const preview = registerMediaAsset(f);
  writeFileSync(f.registryPath, JSON.stringify(empty, null, 2));
  const current = readFileSync(f.registryPath);
  assert.throws(() => registerMediaAsset({ ...f, apply: true, expectedRegistrySha256: preview.expectedRegistrySha256 }), /current --expected-registry/);
  const ownPreview = registerMediaAsset(f);
  const foreign = Buffer.from("another writer's lock"); writeFileSync(f.registryPath + ".lock", foreign);
  assert.throws(() => registerMediaAsset({ ...f, apply: true, expectedRegistrySha256: ownPreview.expectedRegistrySha256 }), /EEXIST/);
  assert.deepEqual(readFileSync(f.registryPath + ".lock"), foreign);
  assert.deepEqual(readFileSync(f.registryPath), current);
});

test("apply is bound to the asset proof that was shown in preview", t => {
  const f = fixture(t);
  const preview = registerMediaAsset(f);
  const before = readFileSync(f.registryPath);
  f.job.brief = "Different proposed artifact after preview";
  json(f.jobPath, f.job);
  assert.throws(() => registerMediaAsset({ ...f, apply: true,
    expectedRegistrySha256: preview.expectedRegistrySha256,
    expectedFingerprint: preview.fingerprint }), /preview.*fingerprint/);
  assert.deepEqual(readFileSync(f.registryPath), before);
});

test("validation failure after acquiring our lock cleans only our lock and leaves registry untouched", t => {
  const f = fixture(t);
  const preview = registerMediaAsset(f); const before = readFileSync(f.registryPath);
  f.binding.assets[0].sha256 = "0".repeat(64); json(f.bindingPath, f.binding);
  assert.throws(() => registerMediaAsset({ ...f, apply: true, expectedRegistrySha256: preview.expectedRegistrySha256 }), /Output bytes differ/);
  assert.equal(existsSync(f.registryPath + ".lock"), false);
  assert.deepEqual(readFileSync(f.registryPath), before);
});

test("a changed sidecar invalidates an existing registration; the original record is retained", t => {
  const f = fixture(t); apply(f);
  const before = readFileSync(f.registryPath);
  f.sidecar.generation.prompt = "changed assertion"; json(f.sidecarPath, f.sidecar);
  assert.match(validateAssetRegistry(JSON.parse(before), f).join(" "), /no longer matches/);
  assert.throws(() => apply(f), /no longer matches/);
  assert.deepEqual(readFileSync(f.registryPath), before);
});

test("native CLI performs preview/apply/audit and reports failures with nonzero exit", t => {
  const f = fixture(t);
  const cli = args => spawnSync(process.execPath, [join(root, "scripts/register-media-asset.mjs"), ...args], { encoding: "utf8", timeout: 10000 });
  assert.equal(cli([]).status, 2);
  const args = ["--job", f.jobPath, "--binding", f.bindingPath, "--asset-root", f.assetRoot, "--registry", f.registryPath];
  const preview = cli(args); assert.equal(preview.status, 0, preview.stderr);
  const shown = JSON.parse(preview.stdout);
  const written = cli([...args, "--apply", "--expected-registry-sha256", shown.expectedRegistrySha256, "--expected-fingerprint", shown.fingerprint]);
  assert.equal(written.status, 0, written.stderr); assert.equal(JSON.parse(written.stdout).outcome, "registered");
  const audit = cli(["--audit", "--asset-root", f.assetRoot, "--registry", f.registryPath]);
  assert.equal(audit.status, 0, audit.stderr); assert.equal(JSON.parse(audit.stdout).entries, 1);
  writeFileSync(join(f.jobRoot, "output.txt"), "modified");
  assert.equal(cli(["--audit", "--asset-root", f.assetRoot, "--registry", f.registryPath]).status, 1);
});
