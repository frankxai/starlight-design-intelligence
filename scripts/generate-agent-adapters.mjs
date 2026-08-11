import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = "brand-image-system/runtime/adapters/agent-adapter-contract.json";
const contractSchemaPath = "brand-image-system/runtime/schemas/agent-adapter-contract.schema.json";

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function isInside(parent, child) {
  const path = relative(parent, child);
  return Boolean(path) && !path.startsWith("..") && !isAbsolute(path);
}

function validateContract(contract) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(loadJson(contractSchemaPath));
  if (!validate(contract)) {
    const errors = validate.errors.map((error) => `${error.instancePath || "/"} ${error.message}`);
    throw new Error(`invalid adapter contract: ${errors.join("; ")}`);
  }
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
  validateContract(contract);
  return contract.targets.map((target) => {
    const destination = resolve(root, target.outputPath);
    if (!isInside(root, destination)) {
      throw new Error(`adapter output escapes repository root: ${target.outputPath}`);
    }
    return {
      path: target.outputPath,
      content: `${JSON.stringify(renderAdapter(contract, target), null, 2)}\n`
    };
  });
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
