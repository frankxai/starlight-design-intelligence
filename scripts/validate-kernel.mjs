import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function json(path) {
  return JSON.parse(read(path));
}

function listFiles(directory, filename) {
  return readdirSync(join(root, directory), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(directory, entry.name, filename))
    .filter((path) => existsSync(join(root, path)));
}

function formatErrors(path, errors) {
  for (const error of errors ?? []) {
    failures.push(`${path}${error.instancePath || "/"} ${error.message}`);
  }
}

const required = [
  "README.md",
  "AGENTS.md",
  "DESIGN_AGENT_OPERATING_SYSTEM.md",
  "SKILLS.md",
  "SYSTEM.md",
  "SCHEMA.md",
  "SECURITY.md",
  "brand-packs/frankx/COPY.md",
  "brand-packs/frankx/DESIGN.md",
  "brand-packs/frankx/SURFACE_MODES.md",
  "brand-packs/frankx/MOTION.md",
  "evals/editorial-articulation-gate.md",
  "evals/typography-quality-gate.md",
  "evals/motion-purpose-gate.md",
  "evals/web-visual-quality-rubric.md",
  "evals/web-release-gate.md",
  "playbooks/site-motion-rollout.md",
  "brand-image-system/runtime/schemas/media-job.schema.json",
  "brand-image-system/runtime/schemas/agent-adapter.schema.json",
  "brand-image-system/runtime/adapters/hermes/hermes-adapter.json",
  "brand-image-system/runtime/adapters/hermes/media-job-template.json",
  "schemas/web-release-evidence.schema.json",
  "scripts/validate-media-job.mjs",
  "skills/world-class-web-release/SKILL.md",
  "skills/editorial-articulation/SKILL.md",
  "skills/typography-art-direction/SKILL.md",
  "templates/SITE_MOTION_SPEC.md"
];
for (const path of required) {
  if (!existsSync(join(root, path))) failures.push(`missing required file: ${path}`);
}

const inventory = read("SKILLS.md");
const skillNames = readdirSync(join(root, "skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const path = `skills/${entry.name}/SKILL.md`;
    if (!existsSync(join(root, path))) {
      failures.push(`missing SKILL.md: skills/${entry.name}`);
      return entry.name;
    }
    const match = read(path).match(/^name:\s*(.+)$/m);
    if (!match) failures.push(`missing frontmatter name: ${path}`);
    if (match && match[1].trim() !== entry.name) {
      failures.push(`skill name mismatch: directory ${entry.name}, frontmatter ${match[1].trim()}`);
    }
    return entry.name;
  });
for (const name of skillNames) {
  if (!inventory.includes(`\`${name}\``)) failures.push(`skill missing from SKILLS.md: ${name}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const releaseSchema = json("schemas/web-release-evidence.schema.json");
try {
  ajv.compile(releaseSchema);
} catch (error) {
  failures.push(`release schema does not compile: ${error.message}`);
}

const brandSchema = json("brand-image-system/runtime/schemas/brand-pack.schema.json");
const workflowSchema = json("brand-image-system/runtime/schemas/workflow-pack.schema.json");
const mediaJobSchema = json("brand-image-system/runtime/schemas/media-job.schema.json");
const agentAdapterSchema = json("brand-image-system/runtime/schemas/agent-adapter.schema.json");
const validateBrand = ajv.compile(brandSchema);
const validateWorkflow = ajv.compile(workflowSchema);
const validateMediaJob = ajv.compile(mediaJobSchema);
const validateAgentAdapter = ajv.compile(agentAdapterSchema);
const brandFiles = listFiles("brand-image-system/runtime/brands", "brand-pack.json");
const workflowFiles = readdirSync(join(root, "brand-image-system/runtime/workflows"), {
  withFileTypes: true
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => `brand-image-system/runtime/workflows/${entry.name}/workflow.json`);

for (const path of brandFiles) {
  const pack = json(path);
  if (!validateBrand(pack)) formatErrors(path, validateBrand.errors);
  for (const source of pack.sourceDocs ?? []) {
    if (!existsSync(join(root, source))) failures.push(`${path}: sourceDoc does not exist: ${source}`);
  }
  if (basename(dirname(path)) !== pack.brandId) {
    failures.push(`${path}: directory must match brandId ${pack.brandId}`);
  }
}
for (const path of workflowFiles) {
  const pack = json(path);
  if (!validateWorkflow(pack)) formatErrors(path, validateWorkflow.errors);
  if (basename(dirname(path)) !== pack.workflowId) {
    failures.push(`${path}: directory must match workflowId ${pack.workflowId}`);
  }
  if (!pack.qaGates?.some((gate) => /inspect|review/i.test(gate))) {
    failures.push(`${path}: qaGates must require inspection or review`);
  }
}

const invalidApprovedMediaJob = {
  jobId: "2026-07-24-invalid-approved",
  brandId: "frankx",
  workflowId: "social-static",
  surface: "social proof",
  audience: "founders",
  brief: "Regression fixture.",
  assetTier: "D",
  sourceMethod: "generic filler",
  paths: { jobRoot: "/tmp/invalid" },
  qa: { inspected: false, score30: 0, notes: "Not inspected." },
  decision: "approved",
  updatedAt: "2026-07-24"
};
if (validateMediaJob(invalidApprovedMediaJob)) {
  failures.push("media-job schema permits uninspected zero-score Tier D approval");
}

const hermesAdapterPath = "brand-image-system/runtime/adapters/hermes/hermes-adapter.json";
const hermesAdapter = json(hermesAdapterPath);
if (!validateAgentAdapter(hermesAdapter)) formatErrors(hermesAdapterPath, validateAgentAdapter.errors);
if (hermesAdapter.targetAgent !== "hermes") {
  failures.push(`${hermesAdapterPath}: targetAgent must be hermes`);
}
if (!hermesAdapter.requiredReads?.includes("brand-image-system/runtime/adapters/hermes/media-job-template.json")) {
  failures.push(`${hermesAdapterPath}: requiredReads must include the schema-valid media-job template`);
}

const hermesMediaTemplatePath = "brand-image-system/runtime/adapters/hermes/media-job-template.json";
const hermesMediaTemplate = json(hermesMediaTemplatePath);
if (!validateMediaJob(hermesMediaTemplate)) formatErrors(hermesMediaTemplatePath, validateMediaJob.errors);
if (hermesMediaTemplate.decision !== "draft") {
  failures.push(`${hermesMediaTemplatePath}: template must remain a non-promotable draft`);
}

const canonicalDocs = [
  ".agent-harness.json",
  "AGENTS.md",
  "README.md",
  "SKILLS.md",
  "SYSTEM.md",
  "SCHEMA.md",
  "SECURITY.md",
  "DESIGN.md",
  "RUNBOOK.md",
  "TESTING.md",
  "SKILLS_BRIDGE.md",
  "DESIGN_AGENT_OPERATING_SYSTEM.md",
  "brand-packs/frankx/DESIGN.md",
  "brand-image-system/runtime/README.md",
  "brand-image-system/runtime/dam/ASSET_MANAGEMENT_SYSTEM.md",
  "brand-image-system/runtime/adapters/hermes/AGENTS.fragment.md"
];
for (const path of canonicalDocs) {
  const source = read(path);
  if (source.includes("music-media-release-team")) failures.push(`wrong team routing in ${path}`);
  if (/C:\\\\Users\\\\frank/i.test(source)) failures.push(`machine-specific required path in ${path}`);
  if (/Poppins\/Outfit|Source Serif 4\s*\/\s*Playfair/.test(source)) {
    failures.push(`unresolved typography alternative in ${path}`);
  }
  if (path !== "README.md" && source.includes("starlight-design-agent-skills")) {
    failures.push(`nonexistent canonical companion referenced in ${path}`);
  }
}

const harness = json(".agent-harness.json");
const routing = harness.extensions?.legacy_v1?.agentGuidance?.designTasteKernel?.brandRouting;
if (routing?.selector !== "surface.brand_id" || routing?.unknownBrand !== "fail") {
  failures.push(".agent-harness.json must resolve brand packs from surface.brand_id and fail unknown brands");
}
if (harness.delivery?.promotion_policy !== "independent-verifier-and-named-human-approval") {
  failures.push(".agent-harness.json promotion_policy contradicts SYSTEM.md");
}

if (brandFiles.length !== 7) failures.push(`expected 7 runtime brand packs, found ${brandFiles.length}`);
if (workflowFiles.length !== 4) failures.push(`expected 4 runtime workflow packs, found ${workflowFiles.length}`);

if (failures.length) {
  console.error(`Design kernel validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `Design kernel valid: ${skillNames.length} skills, ${brandFiles.length} brand packs, ${workflowFiles.length} workflows, ${required.length} required artifacts.`
);
