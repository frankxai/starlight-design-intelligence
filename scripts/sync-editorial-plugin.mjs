#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const pluginRoot = join(root, "plugins/starlight-editorial-os");
const sourceSkillsRoot = join(root, "skills");
const pluginSkillsRoot = join(pluginRoot, "skills");
const brandSkillRefs = join(sourceSkillsRoot, "frank-brand-editor/references");
const skills = ["frank-workstyle", "frank-brand-editor"];

const registryPath = join(root, "editorial/brand-registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));

const referenceCopies = [
  [registryPath, join(brandSkillRefs, "brand-registry.json")],
  [join(root, "editorial/shared-editorial-standard.md"), join(brandSkillRefs, "shared-editorial-standard.md")],
  [join(root, "editorial/language-policy.json"), join(brandSkillRefs, "language-policy.json")],
  [join(root, "editorial/PROVENANCE.md"), join(brandSkillRefs, "PROVENANCE.md")]
];

for (const [brandId, brand] of Object.entries(registry.brands)) {
  referenceCopies.push([join(root, brand.profile), join(brandSkillRefs, `brands/${brandId}.md`)]);
}

function files(directory) {
  if (!existsSync(directory)) return [];
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...files(path));
    else if (entry.isFile()) output.push(path);
  }
  return output;
}

function same(left, right) {
  return existsSync(right) && readFileSync(left).equals(readFileSync(right));
}

const drift = [];
for (const [source, target] of referenceCopies) {
  if (!existsSync(source)) throw new Error(`Missing editorial source: ${relative(root, source)}`);
  if (checkOnly) {
    if (!same(source, target)) drift.push(`${relative(root, target)} differs from ${relative(root, source)}`);
  } else {
    mkdirSync(dirname(target), { recursive: true });
    cpSync(source, target);
  }
}

for (const skill of skills) {
  const source = join(sourceSkillsRoot, skill);
  const target = join(pluginSkillsRoot, skill);
  if (!existsSync(source)) throw new Error(`Missing skill source: skills/${skill}`);
  if (checkOnly) {
    for (const sourceFile of files(source)) {
      const targetFile = join(target, relative(source, sourceFile));
      if (!same(sourceFile, targetFile)) drift.push(`${relative(root, targetFile)} differs from ${relative(root, sourceFile)}`);
    }
  } else {
    mkdirSync(target, { recursive: true });
    cpSync(source, target, { recursive: true, force: true });
  }
}

if (drift.length) {
  console.error(`Editorial distribution drift (${drift.length}):`);
  for (const item of drift) console.error(`- ${item}`);
  process.exit(1);
}

console.log(checkOnly ? "Editorial distribution matches canonical source." : "Editorial plugin distribution updated.");
