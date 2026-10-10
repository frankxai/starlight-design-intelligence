import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { exportV0Import } from "../export-v0-import.mjs";

const sha = "a".repeat(40), old = "b".repeat(40), product = "c".repeat(40);
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "v0-import-test-"));
  t.after(() => { assert.equal(root.startsWith(join(tmpdir(), "v0-import-test-")), true); rmSync(root, { recursive: true, force: true }); });
  const bundle = join(root, "bundle"), out = join(root, "output");
  const path = "brand-image-system/runtime/brands/gencreator/brand-pack.json";
  const bytes = Buffer.from('{"brandId":"gencreator"}\n');
  mkdirSync(join(bundle, "sources", "brand-image-system/runtime/brands/gencreator"), { recursive: true });
  writeFileSync(join(bundle, "sources", path), bytes);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const manifest = { schema_version: "starlight.brand_handoff.v1", brand_id: "gencreator", kernel_repository: "frankxai/starlight-design-intelligence", kernel_commit_sha: sha, brand_pack_path: path, brand_pack_sha256: digest, product_repositories: ["frankxai/gencreator.ai"], sources: [{ path, sha256: digest, bytes: bytes.length }] };
  const profiles = { version: 1, registry_commit: sha, reference_kernel_commit: sha, profiles: [{ brand_id: "gencreator", repository: "frankxai/gencreator.ai", commit: product, app_root: ".", source_paths: ["design.md"], adopted_kernel_commit: old, job: "Edit and export an owned draft.", context_url: "https://gencreator.ai/creator-studio", reconciliation: "Review the old adopted pin." }] };
  const save = () => writeFileSync(join(bundle, "manifest.json"), JSON.stringify(manifest));
  save();
  return { bundle, out, profiles, manifest, save, brand: "gencreator" };
}

test("preserves immutable source identities without broken native SHA mounts or skill adoption", (t) => {
  const f = fixture(t), result = exportV0Import(f);
  assert.equal(result.status, "import-input-for-review");
  assert.equal(result.consumer_registered_in_handoff, true);
  assert.deepEqual(result.source_references.map((s) => s.commit), [sha, product, old]);
  assert.deepEqual(result.v0_reference_config.referenceWorkspace.sources, []);
  assert.deepEqual(JSON.parse(readFileSync(join(f.out, "v0.reference.json"))).referenceWorkspace.sources, []);
  assert.equal(result.source_references[1].url, `https://github.com/frankxai/gencreator.ai/tree/${product}`);
  assert.match(result.limits.join(" "), /provenance, not mounted files/);
  assert.deepEqual(result.v0_reference_config.starter, { source: "empty" });
  assert.match(readFileSync(join(f.out, "IMPORT.md"), "utf8"), /Review the old adopted pin/);
  assert.equal(JSON.parse(readFileSync(join(f.out, "import-packet.json"))).handoff_manifest_sha256.length, 64);
});

test("omits a redundant adopted reference", (t) => {
  const f = fixture(t); f.profiles.profiles[0].adopted_kernel_commit = sha;
  assert.equal(exportV0Import(f).source_references.length, 2);
});

for (const [name, change, error] of [
  ["unknown brand", (f) => { f.brand = "unknown"; }, /Unknown brand/],
  ["mutable consumer reference", (f) => { f.profiles.profiles[0].commit = "main"; }, /immutable commits/],
  ["different kernel revision", (f) => { f.manifest.kernel_commit_sha = old; f.save(); }, /revision disagree/],
  ["foreign consumer", (f) => { f.manifest.product_repositories = ["frankxai/arcanea-ai-app"]; f.save(); }, /not registered/],
  ["cross-brand source", (f) => { f.manifest.brand_id = "arcanea"; f.save(); }, /disagree/],
  ["consumer path traversal", (f) => { f.profiles.profiles[0].source_paths = ["../private.md"]; }, /stay inside/],
  ["duplicate manifest source", (f) => { f.manifest.sources.push(f.manifest.sources[0]); f.save(); }, /Invalid source/],
  ["tampered source bytes", (f) => { writeFileSync(join(f.bundle, "sources", f.manifest.brand_pack_path), "changed"); }, /Source bytes differ/],
  ["missing source", (f) => { f.manifest.sources.push({ path: "brand-packs/gencreator/BRAND.md", sha256: "d".repeat(64), bytes: 10 }); f.save(); }, /Missing source/],
  ["missing brand pack", (f) => { rmSync(join(f.bundle, "sources", f.manifest.brand_pack_path)); }, /Missing source/]
]) test(`rejects ${name} before creating output`, (t) => {
  const f = fixture(t); change(f);
  assert.throws(() => exportV0Import(f), error);
  assert.equal(existsSync(f.out), false);
});

test("preserves an existing output directory", (t) => {
  const f = fixture(t); mkdirSync(f.out); writeFileSync(join(f.out, "keep.txt"), "keep");
  assert.throws(() => exportV0Import(f), /Output already exists/);
  assert.equal(readFileSync(join(f.out, "keep.txt"), "utf8"), "keep");
});

test("records unresolved SIS ownership explicitly in a review packet", (t) => {
  const f = fixture(t), source = f.manifest.sources[0];
  const path = "brand-image-system/runtime/brands/sis/brand-pack.json", bytes = Buffer.from('{"brandId":"sis"}');
  mkdirSync(join(f.bundle, "sources", "brand-image-system/runtime/brands/sis"), { recursive: true });
  writeFileSync(join(f.bundle, "sources", path), bytes);
  Object.assign(source, { path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
  Object.assign(f.manifest, { brand_id: "sis", brand_pack_path: path, brand_pack_sha256: source.sha256, product_repositories: ["frankxai/Starlight-Intelligence-System"] }); f.save();
  Object.assign(f.profiles.profiles[0], { brand_id: "sis", repository: "frankxai/starlightintelligence.ai", adopted_kernel_commit: null });
  f.brand = "sis";
  const result = exportV0Import(f);
  assert.equal(result.consumer_registered_in_handoff, false);
  assert.equal(result.status, "import-input-for-review");
});

for (const path of ["portfolio/experience-standard.json", "portfolio/core-surfaces.json"]) {
  test(`accepts the documented hash-only ${path} record`, (t) => {
    const f = fixture(t);
    f.manifest.sources.push({ path, sha256: "d".repeat(64), bytes: 10 }); f.save();
    assert.equal(exportV0Import(f).status, "import-input-for-review");
  });
}

test("rejects a parent-directory symlink outside the handoff", (t) => {
  const f = fixture(t), parent = join(f.bundle, "sources", "brand-image-system/runtime/brands");
  const escaped = join(f.bundle, "outside-sources");
  renameSync(parent, escaped);
  try { symlinkSync(escaped, parent, "junction"); }
  catch (error) { if (error.code === "EPERM") { t.skip("Host does not permit symlink fixtures."); return; } throw error; }
  assert.throws(() => exportV0Import(f), /symlinks/);
  assert.equal(existsSync(f.out), false);
});

for (const [name, change, error] of [
  ["source path alias", (f) => { f.manifest.sources.push({ ...f.manifest.sources[0], path: "brand-image-system/runtime/brands/./gencreator/brand-pack.json" }); f.save(); }, /Invalid source/],
  ["empty path segment", (f) => { f.profiles.profiles[0].source_paths = ["app//page.tsx"]; }, /stay inside/],
  ["invalid source hash", (f) => { f.manifest.sources[0].sha256 = "wrong"; f.save(); }, /Invalid source/],
  ["unsafe byte count", (f) => { f.manifest.sources[0].bytes = -1; f.save(); }, /Invalid source/],
  ["oversized declared source", (f) => { f.manifest.sources[0].bytes = 1024 * 1024 + 1; f.save(); }, /Invalid source/],
  ["oversized actual source", (f) => { writeFileSync(join(f.bundle, "sources", f.manifest.brand_pack_path), Buffer.alloc(1024 * 1024 + 1)); }, /bounded regular file/],
  ["oversized source count", (f) => { f.manifest.sources = Array.from({ length: 101 }, () => f.manifest.sources[0]); f.save(); }, /oversized source manifest/],
  ["wrong schema", (f) => { f.manifest.schema_version = "unknown"; f.save(); }, /disagree/],
  ["malformed manifest", (f) => { writeFileSync(join(f.bundle, "manifest.json"), "{"); }, /JSON|property name/]
]) test(`rejects ${name} without writing a packet`, (t) => {
  const f = fixture(t); change(f);
  assert.throws(() => exportV0Import(f), error);
  assert.equal(existsSync(f.out), false);
});

for (const [name, repository, adopted] of [
  ["another repository", "frankxai/other-product", null],
  ["invented adoption", "frankxai/starlightintelligence.ai", old]
]) test(`SIS exception rejects ${name}`, (t) => {
  const f = fixture(t);
  Object.assign(f.profiles.profiles[0], { brand_id: "sis", repository, adopted_kernel_commit: adopted });
  f.manifest.brand_id = "sis"; f.save(); f.brand = "sis";
  assert.throws(() => exportV0Import(f), /not registered/);
  assert.equal(existsSync(f.out), false);
});
