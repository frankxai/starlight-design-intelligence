import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (!args[0]) {
  console.error("Usage: node validate-example.mjs <example-dir> [--root <job-root>]");
  process.exit(1);
}

const exampleDir = path.resolve(args[0]);
const rootIndex = args.indexOf("--root");
const jobRoot = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : null;
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(exampleDir, name), "utf8"));

const sources = readJson("sources.json");
const claims = readJson("claim-ledger.json");
const semantic = readJson("semantic-model.json");
const template = readJson("template-data.json");
const packet = readJson("visual-prompt-packet.json");
const hero = readJson("omega-hero-data.json");
const heroReceipt = readJson("omega-hero-generation-receipt.json");

const knownSourceIds = new Set(sources.sources.map((source) => source.id));
const references = [
  ...claims.claims.flatMap((claim) => claim.sourceIds),
  ...semantic.nodes.flatMap((node) => node.sourceIds),
  ...semantic.edges.flatMap((edge) => edge.sourceIds),
  ...template.callouts.flatMap((callout) => callout.sourceIds),
  ...template.interoperability.flatMap((item) => item.sourceIds),
  ...template.providers.flatMap((provider) => provider.sourceIds)
];

const missingSources = [...new Set(references)].filter((id) => !knownSourceIds.has(id));
if (missingSources.length) {
  throw new Error(`Unresolved source IDs: ${missingSources.join(", ")}`);
}

if (template.contractVersion !== "infogenius-social.v1") throw new Error("Unsupported template contract");
if (template.canvas.width !== 1440 || template.canvas.height !== 1800) throw new Error("Template must be 1440x1800");
if (template.callouts.length > 8) throw new Error("Template exceeds eight-callout limit");
if (template.providers.length !== 6) throw new Error("Pilot requires six provider cards");
if (template.gateway.slots.length !== template.providers.length) throw new Error("Gateway/provider count mismatch");
if (hero.contractVersion !== "infogenius-hero.v1") throw new Error("Unsupported hero contract");
if (hero.callouts.length > 4) throw new Error("Hero exceeds four-callout limit");
if (hero.providers.length !== 6) throw new Error("Hero provider rail must contain six names");

const providerIds = new Set(template.providers.map((provider) => provider.id));
for (const slot of template.gateway.slots) {
  if (!providerIds.has(slot.providerId)) throw new Error(`Unknown gateway provider: ${slot.providerId}`);
}

if (jobRoot) {
  const badHashes = [];
  for (const artifact of packet.output.artifacts) {
    if (!artifact.sha256) continue;
    const artifactPath = path.resolve(jobRoot, artifact.path);
    if (!fs.existsSync(artifactPath)) {
      badHashes.push(`${artifact.path}: missing`);
      continue;
    }
    const actual = crypto.createHash("sha256").update(fs.readFileSync(artifactPath)).digest("hex");
    if (actual !== artifact.sha256) badHashes.push(`${artifact.path}: hash mismatch`);
  }
  for (const artifact of heroReceipt.outputs) {
    if (!artifact.sha256) continue;
    const artifactPath = path.resolve(jobRoot, artifact.path);
    if (!fs.existsSync(artifactPath)) {
      badHashes.push(`${artifact.path}: missing`);
      continue;
    }
    const actual = crypto.createHash("sha256").update(fs.readFileSync(artifactPath)).digest("hex");
    if (actual !== artifact.sha256) badHashes.push(`${artifact.path}: hash mismatch`);
  }
  if (badHashes.length) throw new Error(`Artifact verification failed:\n${badHashes.join("\n")}`);
}

console.log("PASS Infogenius example packet");
console.log(`sources=${knownSourceIds.size}`);
console.log(`resolvedReferences=${new Set(references).size}`);
console.log(`claims=${claims.claims.length}`);
console.log(`nodes=${semantic.nodes.length}`);
console.log(`edges=${semantic.edges.length}`);
console.log(`providers=${template.providers.length}`);
console.log(`callouts=${template.callouts.length}`);
console.log(`artifacts=${packet.output.artifacts.length}`);
console.log(`heroCallouts=${hero.callouts.length}`);
console.log(`heroArtifacts=${heroReceipt.outputs.length}`);
