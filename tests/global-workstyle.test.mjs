import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("global installer preserves existing instructions and installs skills", () => {
  const home = mkdtempSync(join(tmpdir(), "frank-workstyle-"));
  mkdirSync(join(home, ".codex"), { recursive: true });
  writeFileSync(join(home, ".codex/AGENTS.md"), "# Existing\n\nPreserve me.\n");
  const args = ["scripts/install-global-workstyle.mjs", "--home", home];
  execFileSync("node", args, { cwd: process.cwd() });
  execFileSync("node", args, { cwd: process.cwd() });
  const agents = readFileSync(join(home, ".codex/AGENTS.md"), "utf8");
  assert.match(agents, /Preserve me\./u);
  assert.equal((agents.match(/FRANK-WORKSTYLE:START/gu) ?? []).length, 1);
  assert.match(
    readFileSync(join(home, ".agents/skills/frank-workstyle/SKILL.md"), "utf8"),
    /name: frank-workstyle/u
  );
});
