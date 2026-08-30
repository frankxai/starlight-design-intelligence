#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const kernelRoot = process.cwd();
const START = "<!-- STARLIGHT-EDITORIAL:START -->";
const END = "<!-- STARLIGHT-EDITORIAL:END -->";

function parseArgs(argv) {
  const options = { repoRoot: null, brandId: null, sourceRef: null, contentRoots: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") options.repoRoot = argv[++index];
    else if (arg === "--brand") options.brandId = argv[++index];
    else if (arg === "--source-ref") options.sourceRef = argv[++index];
    else if (arg === "--content-root") options.contentRoots.push(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.repoRoot || !options.brandId) throw new Error("--repo-root and --brand are required");
  return options;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function injectWithMarkers(path, body, prefix = "", startMarker = START, endMarker = END) {
  const current = existsSync(path) ? readFileSync(path, "utf8") : prefix;
  const block = `${startMarker}\n${body.trim()}\n${endMarker}`;
  const start = current.indexOf(startMarker);
  const end = current.indexOf(endMarker);
  let next;
  if (start >= 0 && end > start) {
    next = `${current.slice(0, start)}${block}${current.slice(end + endMarker.length)}`;
  } else {
    next = `${current.trimEnd()}${current.trim() ? "\n\n" : ""}${block}\n`;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, next.endsWith("\n") ? next : `${next}\n`);
}

function inject(path, body, prefix = "") {
  injectWithMarkers(path, body, prefix);
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.endsWith("\n") ? content : `${content}\n`);
}

const options = parseArgs(process.argv.slice(2));
const repoRoot = resolve(options.repoRoot);
const registry = JSON.parse(readFileSync(join(kernelRoot, "editorial/brand-registry.json"), "utf8"));
const brand = registry.brands[options.brandId];
if (!brand) throw new Error(`Unknown editorial brand: ${options.brandId}`);
const sourceRef = options.sourceRef || execFileSync("git", ["rev-parse", "HEAD"], { cwd: kernelRoot, encoding: "utf8" }).trim();
if (!/^[a-f0-9]{40}$/u.test(sourceRef)) throw new Error("--source-ref must be a full 40-character commit SHA");

const profile = readFileSync(join(kernelRoot, brand.profile), "utf8").trim();
const sourceUrl = `https://github.com/frankxai/starlight-design-intelligence/blob/${sourceRef}/${brand.profile}`;
const compactBlock = `## Editorial contract\n\nBrand: **${brand.display_name}** (\`${options.brandId}\`)\n\n- Read \`CREATOR.md\` before changing public or customer-facing copy.\n- Apply the registered brand voice and the shared editorial gate.\n- Reject generated prestige language, rhetorical contrast formulas, invented claims, and abstract labels that hide simple facts.\n- Keep public labels in sentence case.\n- Run the changed-copy editorial audit before release.\n\nPinned source: ${sourceUrl}`;
const creatorBlock = `# ${brand.display_name} voice\n\nPinned source: ${sourceUrl}\n\n${profile}`;

const managedFiles = [
  "CREATOR.md",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  ".github/copilot-instructions.md"
];
inject(join(repoRoot, "CREATOR.md"), creatorBlock);
for (const path of managedFiles.slice(1)) inject(join(repoRoot, path), compactBlock);
inject(
  join(repoRoot, ".cursor/rules/editorial.mdc"),
  compactBlock,
  "---\ndescription: Portfolio brand and editorial contract\nalwaysApply: true\n---\n\n"
);

const localSkill = `---\nname: frank-brand-editor\ndescription: Use for any public copy in this repository. Load CREATOR.md, preserve facts and search intent, and run the Starlight editorial gate.\n---\n\n# Repository brand editor\n\nRead \`CREATOR.md\` and the managed editorial block in \`AGENTS.md\`. Apply them to websites, UI labels, articles, social copy, email, sales material, and scripts. Preserve exact quotations, code, legal wording, and necessary technical terms. Run the repository's pinned editorial audit before release.\n`;
write(join(repoRoot, ".agents/skills/frank-brand-editor/SKILL.md"), localSkill);

const callerWorkflow = `name: Starlight editorial contract

on:
  pull_request:

permissions:
  contents: read

jobs:
  editorial-contract:
    uses: frankxai/starlight-design-intelligence/.github/workflows/editorial-contract.yml@${sourceRef}
`;
write(join(repoRoot, ".github/workflows/starlight-editorial-contract.yml"), callerWorkflow);
injectWithMarkers(
  join(repoRoot, ".prettierignore"),
  ".starlight/editorial-contract.json",
  "",
  "# STARLIGHT-EDITORIAL:START",
  "# STARLIGHT-EDITORIAL:END"
);

const generatedFiles = [
  ...managedFiles,
  ".cursor/rules/editorial.mdc",
  ".agents/skills/frank-brand-editor/SKILL.md",
  ".github/workflows/starlight-editorial-contract.yml",
  ".prettierignore",
  ".starlight/editorial-contract.json"
];
const contract = {
  schema_version: "starlight.editorial_contract.v1",
  brand_id: options.brandId,
  source: {
    repository: "frankxai/starlight-design-intelligence",
    ref: sourceRef,
    profile: brand.profile,
    profile_sha256: sha256(`${profile}\n`)
  },
  content_roots: options.contentRoots.length ? options.contentRoots : ["app", "components", "content", "data", "lib", "pages", "src"],
  generated_files: generatedFiles
};
write(join(repoRoot, ".starlight/editorial-contract.json"), JSON.stringify(contract, null, 2));
console.log(`Installed ${options.brandId} editorial contract into ${repoRoot}.`);
