import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { auditChangedLines, auditRoot, auditText, loadPolicy } from "../skills/frank-brand-editor/scripts/editorial-audit.mjs";

const policy = loadPolicy(join(process.cwd(), "editorial/language-policy.json"));

test("flags the screenshot's rhetorical contrast and pseudo-taxonomy", () => {
  const findings = auditText(
    "A decision atlas, not a logo cloud. Tool intelligence / current evidence. Official-source records.",
    { policy }
  );
  assert.ok(findings.some((finding) => finding.rule === "negative-parallelism-slogan"));
  assert.ok(findings.some((finding) => finding.rule === "pseudo-taxonomy"));
});

test("allows literal negation required for accuracy", () => {
  const findings = auditText("This plan is not available in Germany.", { policy });
  assert.equal(findings.filter((finding) => finding.severity === "hard_fail").length, 0);
});

test("preserves precise technical and Arcanea language", () => {
  const findings = auditText(
    "Optimize the database query after measuring latency. Enter the Ember Realm through the western gate.",
    { policy }
  );
  assert.equal(findings.filter((finding) => finding.severity === "hard_fail").length, 0);
});

test("respects explicit line exceptions", () => {
  const findings = auditText("A record, not a promise. // editorial-allow", { policy });
  assert.equal(findings.length, 0);
});

test("scans public source roots and ignores tests", () => {
  const root = mkdtempSync(join(tmpdir(), "editorial-audit-"));
  mkdirSync(join(root, "app"), { recursive: true });
  mkdirSync(join(root, "tests"), { recursive: true });
  writeFileSync(join(root, "app/page.tsx"), "export const copy = 'This is not a dashboard. It is an intelligence layer.'\n");
  writeFileSync(join(root, "tests/fixture.ts"), "export const copy = 'A map, not a list.'\n");
  const result = auditRoot(root, { policy });
  assert.equal(result.filesScanned, 1);
  assert.ok(result.findings.some((finding) => finding.severity === "hard_fail"));
});

test("changed-line mode ignores existing debt and catches new copy", () => {
  const root = mkdtempSync(join(tmpdir(), "editorial-diff-"));
  mkdirSync(join(root, "app"), { recursive: true });
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "tests@frankx.ai"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Editorial Test"], { cwd: root });
  writeFileSync(join(root, "app/page.tsx"), "export const oldCopy = 'A system, not a tool.'\n");
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: root });
  const base = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  writeFileSync(
    join(root, "app/page.tsx"),
    "export const oldCopy = 'A system, not a tool.'\nexport const newCopy = 'A decision atlas, not a logo cloud.'\n"
  );
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "change"], { cwd: root });
  const result = auditChangedLines(root, base, { policy });
  assert.equal(result.findings.filter((finding) => finding.severity === "hard_fail").length, 2);
  assert.ok(result.findings.every((finding) => finding.line === 2));
});
