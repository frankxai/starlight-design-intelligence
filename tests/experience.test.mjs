import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateExperience } from "../scripts/validate-experience.mjs";
import { exportBrandHandoff } from "../scripts/export-brand-handoff.mjs";

const root = process.cwd();
const original = JSON.parse(readFileSync(join(root, "portfolio/experience-standard.json"), "utf8"));
const validate = (standard) => validateExperience({ root, standard, asOf: "2026-09-30" });
const changed = (fn) => { const value = structuredClone(original); fn(value); return value; };

test("experience standard covers every registered surface without making production claims", () => {
  assert.deepEqual(validate(original), []);
  assert.equal(original.policy.production_claim, "none");
});
test("experience validation detects a cross-brand owner or mode substitution", () => {
  const errors = validate(changed((v) => { v.flows[0].brand_id = "arcanea"; v.flows[0].mode = "mythic-world"; }));
  assert.match(errors.join("\n"), /brand ownership mismatch/);
  assert.match(errors.join("\n"), /surface mode mismatch/);
});
test("surface coverage uses repository plus surface, rejecting omission and duplication", () => {
  const errors = validate(changed((v) => { v.flows[2] = structuredClone(v.flows[0]); }));
  assert.match(errors.join("\n"), /duplicate/);
  assert.match(errors.join("\n"), /missing registered surface/);
});
test("reference application cannot approve an unrelated pattern or target", () => {
  const errors = validate(changed((v) => { v.references[0].applications[0].pattern_id = "pattern.low-chrome-discovery.v1"; v.references[1].source_url = "https://unrelated.example/proof"; }));
  assert.match(errors.join("\n"), /not approved for sis/);
  assert.match(errors.join("\n"), /not on target's official host/);
});
test("page text cannot masquerade as rendered evidence or a production pass", () => {
  const errors = validate(changed((v) => { v.references[0].evidence_kind = "mobile-verified"; v.policy.production_claim = "passed"; }));
  assert.match(errors.join("\n"), /must be equal to constant/);
});
test("upgrade queue rejects cycles, missing dependencies and invented completion", () => {
  const errors = validate(changed((v) => { v.upgrades[0].depends_on = [v.upgrades[1].id]; v.upgrades[1].depends_on = [v.upgrades[0].id, "missing"]; }));
  assert.match(errors.join("\n"), /dependency cycle/);
  assert.match(errors.join("\n"), /unknown dependency/);
  assert.ok(validate(changed((v) => { v.upgrades[0].state = "released"; })).length);
});
test("review dates and blockers cannot imply unperformed future work", () => {
  assert.match(validate(changed((v) => { v.references[0].reviewed_at = "2026-10-01"; })).join("\n"), /in the future/);
  assert.ok(validate(changed((v) => { v.upgrades[2].blocker = null; })).length);
});
test("bundle hashes committed bytes and excludes subsequent working-tree edits", () => {
  const fixture = mkdtempSync(join(tmpdir(), "brand-handoff-test-"));
  for (const path of ["brand-packs", "brand-image-system/runtime/brands", "portfolio", "evals", "playbooks", "templates/app-factory"]) cpSync(join(root, path), join(fixture, path), { recursive: true });
  const git = (args) => execFileSync("git", args, { cwd: fixture, encoding: "utf8" }).trim();
  git(["init", "-q"]); git(["config", "user.name", "Handoff test"]); git(["config", "user.email", "tests@frankx.ai"]);
  git(["remote", "add", "origin", "https://github.com/frankxai/starlight-design-intelligence.git"]);
  git(["add", "."]); git(["commit", "-qm", "source fixture"]);
  const sha = git(["rev-parse", "HEAD"]);
  const path = "brand-image-system/runtime/brands/frankx/brand-pack.json";
  const bytes = readFileSync(join(fixture, path));
  writeFileSync(join(fixture, path), "uncommitted corruption");
  const out = join(fixture, "bundle");
  const manifest = exportBrandHandoff({ root: fixture, brand: "frankx", out });
  assert.equal(manifest.kernel_commit_sha, sha);
  assert.equal(manifest.brand_pack_sha256, createHash("sha256").update(bytes).digest("hex"));
  assert.deepEqual(readFileSync(join(out, "sources", path)), bytes);
  for (const path of ["playbooks/figma-template-pipeline.md", "templates/app-factory/README.md"]) {
    const exported = readFileSync(join(out, "sources", path));
    assert.equal(createHash("sha256").update(exported).digest("hex"), manifest.sources.find(s => s.path === path).sha256);
  }
  const plan = JSON.parse(readFileSync(join(out, "adapter-plan.json"), "utf8"));
  assert.ok(plan.flows.every((f) => f.brand_id === "frankx"));
  assert.ok(plan.reference_applications.every((r) => r.applications.every((a) => a.domain_id === "frankx-ai")));
  assert.throws(() => exportBrandHandoff({ root: fixture, brand: "frankx", out }), /already exists/);
  const rejected = join(fixture, "rejected");
  assert.throws(() => exportBrandHandoff({ root: fixture, brand: "frankx", out: rejected, revision: "main" }), /full lowercase/);
  assert.equal(existsSync(rejected), false);
});
