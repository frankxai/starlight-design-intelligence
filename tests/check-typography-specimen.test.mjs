import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkTypographySpecimen as check } from "../scripts/check-typography-specimen.mjs";

function fixture() {
  return { scope: "controlled-specimen", expectedFamilies: ["Instrument Sans"],
    fonts: [{ family: '"Instrument Sans"', status: "loaded" }], viewport: { width: 320, scrollWidth: 320 },
    text: [{ text: "Build with intelligence", fontFamily: '"Instrument Sans", sans-serif',
      fontSize: "18px", lineHeight: 27, fontWeight: "400", fontStyle: "normal", fontSynthesis: "none",
      textTransform: "none", fontVariantCaps: "normal", letterSpacing: "normal", clientWidth: 288, scrollWidth: 288 }] };
}
test("accepts observed primary load and numeric or resolved pixel metrics", () => {
  const result = check(fixture());
  assert.equal(result.passed, true);
  assert.equal(result.verdict, "primary-pass");
  assert.equal(result.primaryFontLoadsVerified, true);
});
test("rejects empty and malformed reports instead of vacuous passing", () => {
  for (const report of [null, {}, [], { ...fixture(), text: [] }, { ...fixture(), text: [null] }])
    assert.equal(check(report).passed, false);
});
test("rejects missing fonts, missing expected families and partially unloaded faces", () => {
  for (const changes of [{ fonts: [] }, { expectedFamilies: [] }, { fonts: [{ family: "Instrument Sans", status: "loading" }] },
    { fonts: [...fixture().fonts, { family: "Instrument Sans", status: "error" }] }])
    assert.equal(check({ ...fixture(), ...changes }).passed, false);
});
test("rejects transformed and literal uppercase while preserving acronyms, IDs and exact exceptions", () => {
  const report = fixture();
  report.text[0].textTransform = "uppercase";
  assert.equal(check(report).passed, false);
  report.text[0].textTransform = "none";
  for (const text of ["BUILD YOUR FUTURE", "POWER", "AI FOR CREATORS", "Meet THE FUTURE today"]) {
    report.text[0].text = text;
    assert.equal(check(report).passed, false, text);
  }
  for (const text of ["AI", "AI/API", "IBM / AI", "API UI UX DNS HTML CSS IBM", "ID-003", "01", "Build your AI system"]) {
    report.text[0].text = text;
    assert.equal(check(report).passed, true, text);
  }
  report.text[0].text = "NASA";
  report.allowedExact = ["NASA"];
  assert.equal(check(report).passed, true);
});
test("rejects text and viewport overflow independently", () => {
  const report = fixture();
  report.text[0].scrollWidth = 289;
  assert.equal(check(report).passed, false);
  report.text[0].scrollWidth = 288;
  report.viewport.scrollWidth = 321;
  assert.equal(check(report).passed, false);
});
test("rejects unresolved, invalid, tiny and synthetic type measurements", () => {
  for (const [key, value] of [["fontSize", 13], ["fontSize", "18em"], ["lineHeight", "normal"],
    ["clientWidth", 0], ["scrollWidth", Infinity], ["fontWeight", NaN], ["fontStyle", ""],
    ["fontSynthesis", "weight style"], ["fontVariantCaps", "small-caps"], ["letterSpacing", "0.6px"]]) {
    const report = fixture(); report.text[0][key] = value;
    assert.equal(check(report).passed, false, key);
  }
});
test("fallback explicitly skips loading, retains layout gates and cannot claim primary verification", () => {
  const report = { ...fixture(), mode: "fallback", fonts: [] };
  assert.equal(check(report).verdict, "fallback-pass");
  assert.equal(check(report).primaryFontLoadsVerified, false);
  report.text[0].scrollWidth = 400;
  assert.equal(check(report).passed, false);
});
test("CLI emits structured failure and exits nonzero for an empty report", () => {
  const directory = mkdtempSync(join(tmpdir(), "typography-preflight-"));
  try {
    const path = join(directory, "report.json"); writeFileSync(path, "{}");
    const result = spawnSync(process.execPath, [new URL("../scripts/check-typography-specimen.mjs", import.meta.url).pathname, path], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stdout).verdict, "fail");
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
