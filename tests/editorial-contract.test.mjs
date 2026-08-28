import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("installer preserves host instructions and updates one managed block", () => {
  const repo = mkdtempSync(join(tmpdir(), "editorial-contract-"));
  writeFileSync(join(repo, "AGENTS.md"), "# Host rules\n\nKeep this line.\n");
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: process.cwd(), encoding: "utf8" }).trim();
  const args = [
    "scripts/install-editorial-contract.mjs",
    "--repo-root",
    repo,
    "--brand",
    "frankx",
    "--source-ref",
    sha
  ];
  execFileSync("node", args, { cwd: process.cwd() });
  execFileSync("node", args, { cwd: process.cwd() });
  const agents = readFileSync(join(repo, "AGENTS.md"), "utf8");
  assert.match(agents, /Keep this line\./u);
  assert.equal((agents.match(/STARLIGHT-EDITORIAL:START/gu) ?? []).length, 1);
  const contract = JSON.parse(readFileSync(join(repo, ".starlight/editorial-contract.json"), "utf8"));
  assert.equal(contract.brand_id, "frankx");
  assert.equal(contract.source.ref, sha);
  const workflow = readFileSync(
    join(repo, ".github/workflows/starlight-editorial-contract.yml"),
    "utf8"
  );
  assert.match(workflow, new RegExp(`editorial-contract\\.yml@${sha}`, "u"));
});
