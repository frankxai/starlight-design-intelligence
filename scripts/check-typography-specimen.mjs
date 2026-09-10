#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Accept resolved CSS pixels, never parse a partial value such as "14em" as px.
const px = (value) => typeof value === "number" ? value :
  typeof value === "string" && /^-?(?:\d+(?:\.\d+)?|\.\d+)px$/.test(value) ? Number(value.slice(0, -2)) : NaN;
const family = (value) => typeof value === "string" ? value.trim().replace(/^['"]|['"]$/g, "").toLowerCase() : "";
const acronyms = new Set(["AI", "API", "UI", "UX", "DNS", "HTML", "CSS", "IBM"]);
const identifier = (word) => /^(?:[A-Z]{1,8}[-_:#])?\d+(?:[-_.:/]\d+)*$/.test(word);
const allowedCaps = (word) => identifier(word) || word.split(/[./:-]+/).filter(Boolean).every((part) => acronyms.has(part));

export function checkTypographySpecimen(report) {
  const errors = [];
  const fail = (path, message) => errors.push({ path, message });
  if (!report || typeof report !== "object" || Array.isArray(report)) report = {};
  const mode = report.mode ?? "primary";
  if (report.scope !== "controlled-specimen") fail("scope", "Must identify a controlled-specimen report.");
  if (!["primary", "fallback"].includes(mode)) fail("mode", "Must be primary or fallback.");
  const expected = Array.isArray(report.expectedFamilies) ? report.expectedFamilies : [];
  const expectedValid = Array.isArray(report.expectedFamilies) && !expected.some((item) => !family(item)) && expected.length > 0;
  if (!Array.isArray(report.expectedFamilies) || expected.some((item) => !family(item)) || (mode !== "fallback" && !expected.length))
    fail("expectedFamilies", "Primary mode requires a nonempty array of font family names.");
  const fonts = Array.isArray(report.fonts) ? report.fonts : [];
  if (!Array.isArray(report.fonts)) fail("fonts", "Must contain observed font loading records.");
  let loaded = mode === "primary" && expectedValid;
  if (mode !== "fallback") for (const name of expected) {
    const matches = fonts.filter((font) => family(font?.family) === family(name));
    if (!matches.length || matches.some((font) => font.status !== "loaded")) {
      loaded = false;
      fail("fonts", `Expected family ${JSON.stringify(name)} is absent or has a face that is not loaded.`);
    }
  }
  const allowed = report.allowedExact ?? [];
  if (!Array.isArray(allowed) || allowed.some((item) => typeof item !== "string" || !item.trim()))
    fail("allowedExact", "Must be an array of nonempty exact text exceptions.");
  const exceptions = new Set(Array.isArray(allowed) ? allowed : []);
  const positive = (value, path) => {
    const number = px(value);
    if (!Number.isFinite(number) || number <= 0) fail(path, "Must be a finite positive CSS-pixel measurement.");
    return number;
  };
  const width = positive(report.viewport?.width, "viewport.width");
  const scroll = positive(report.viewport?.scrollWidth, "viewport.scrollWidth");
  if (scroll > width) fail("viewport", "Horizontal viewport overflow.");
  const text = Array.isArray(report.text) ? report.text : [];
  if (!text.length) fail("text", "Must contain at least one visible nonempty text observation.");
  text.forEach((node, index) => {
    const path = `text[${index}]`;
    if (!node || typeof node !== "object") { fail(path, "Must be a text observation."); return; }
    const content = typeof node.text === "string" ? node.text.trim() : "";
    if (!content) fail(`${path}.text`, "Must contain visible text.");
    const tokens = content.match(/[\p{L}\p{N}][\p{L}\p{N}_:#./-]*/gu) ?? [];
    const allCaps = /\p{Lu}/u.test(content) && !/\p{Ll}/u.test(content);
    const upper = (token) => /\p{Lu}/u.test(token ?? "") && !/\p{Ll}/u.test(token ?? "");
    const capPhrase = tokens.some((token, i) => upper(token) && upper(tokens[i + 1]) && !(allowedCaps(token) && allowedCaps(tokens[i + 1])));
    if (!exceptions.has(node.text) && ((allCaps && !tokens.every(allowedCaps)) || capPhrase))
      fail(`${path}.text`, "Decorative literal all-cap text requires correction or an exact source/identity exception.");
    if (!family(node.fontFamily)) fail(`${path}.fontFamily`, "Must record computed font-family.");
    if (typeof node.textTransform !== "string" || !node.textTransform.trim() || node.textTransform.includes("uppercase"))
      fail(`${path}.textTransform`, "Missing transform evidence or uppercase transform.");
    if (node.fontVariantCaps !== "normal") fail(`${path}.fontVariantCaps`, "Small caps and other caps variants are disallowed.");
    if (node.fontSynthesis !== "none") fail(`${path}.fontSynthesis`, "Font synthesis must be disabled.");
    const size = positive(node.fontSize, `${path}.fontSize`);
    if (size < 14) fail(`${path}.fontSize`, "Visible specimen text must be at least 14 CSS px.");
    positive(node.lineHeight, `${path}.lineHeight`);
    const client = positive(node.clientWidth, `${path}.clientWidth`);
    const extent = positive(node.scrollWidth, `${path}.scrollWidth`);
    if (extent > client) fail(path, "Horizontal text overflow.");
    const spacing = node.letterSpacing === "normal" ? 0 : px(node.letterSpacing);
    if (!Number.isFinite(spacing) || spacing > 0.5) fail(`${path}.letterSpacing`, "Tracking must be resolved and no greater than 0.5 CSS px.");
    const weight = ({ normal: 400, bold: 700 })[node.fontWeight] ?? Number(node.fontWeight);
    if (!["number", "string"].includes(typeof node.fontWeight) || !Number.isFinite(weight) || weight < 1 || weight > 1000)
      fail(`${path}.fontWeight`, "Must record a valid computed weight.");
    if (typeof node.fontStyle !== "string" || !/^(normal|italic|oblique(?: -?\d+(?:\.\d+)?deg)?)$/.test(node.fontStyle))
      fail(`${path}.fontStyle`, "Must record a valid computed style.");
  });
  return {
    scope: "controlled-specimen", mode, passed: errors.length === 0,
    verdict: errors.length ? "fail" : mode === "fallback" ? "fallback-pass" : "primary-pass",
    primaryFontLoadsVerified: loaded, textObservations: text.length, errors,
    limitations: "Validates supplied DOM observations only; does not prove rendered glyph identity, licenses, omitted content, or compliance across applications. Fallback-pass never verifies primary font loading."
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw new Error("Usage: node scripts/check-typography-specimen.mjs report.json");
    const result = checkTypographySpecimen(JSON.parse(readFileSync(process.argv[2], "utf8")));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.passed ? 0 : 1;
  } catch (error) {
    console.log(JSON.stringify({ passed: false, verdict: "fail", errors: [{ path: "$", message: error.message }] }, null, 2));
    process.exitCode = 1;
  }
}
