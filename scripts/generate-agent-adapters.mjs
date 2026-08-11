import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = "brand-image-system/runtime/adapters/agent-adapter-contract.json";

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function renderAdapter(contract, target) {
  return {
    adapterId: target.adapterId,
    targetAgent: target.targetAgent,
    generatedFrom: contract.common.generatedFrom,
    requiredReads: contract.common.requiredReads,
    allowedActions: contract.common.allowedActions,
    blockedActions: contract.common.blockedActions,
    handoffFields: contract.common.handoffFields,
    updatedAt: contract.updatedAt
  };
}

export function generatedAdapters(contract = loadJson(contractPath)) {
  return contract.targets.map((target) => ({
    path: target.outputPath,
    content: `${JSON.stringify(renderAdapter(contract, target), null, 2)}\n`
  }));
}

function main() {
  const check = process.argv.includes("--check");
  const failures = [];
  for (const adapter of generatedAdapters()) {
    const destination = resolve(root, adapter.path);
    if (check) {
      if (!existsSync(destination)) {
        failures.push(`${adapter.path}: generated adapter is missing`);
      } else if (readFileSync(destination, "utf8") !== adapter.content) {
        failures.push(`${adapter.path}: generated adapter drifted from the shared contract`);
      }
      continue;
    }
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, adapter.content);
    console.log(`generated ${adapter.path}`);
  }
  if (failures.length) {
    console.error(`Adapter generation check failed (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  if (check) console.log("Generated adapters match the shared contract.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
