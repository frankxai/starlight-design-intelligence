import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function formatAjvError(error) {
  return `${error.instancePath || "/"} ${error.message}`;
}

function isInside(parent, child) {
  const path = relative(parent, child);
  return Boolean(path) && !path.startsWith("..") && !isAbsolute(path);
}

function resolveJobPath(jobRoot, path) {
  return resolve(jobRoot, path);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function validateVisReceipt(job, jobRoot, validateBinding, failures) {
  const binding = job.visBinding;
  if (!validateBinding(binding)) {
    failures.push(
      ...validateBinding.errors.map((error) => `/visBinding${formatAjvError(error)}`)
    );
    return;
  }

  const outputPaths = new Set(job.paths?.outputs ?? []);
  const bindingsByPath = new Map();
  for (const asset of binding.assets) {
    if (bindingsByPath.has(asset.outputPath)) {
      failures.push(`/visBinding/assets duplicates outputPath: ${asset.outputPath}`);
    }
    bindingsByPath.set(asset.outputPath, asset);
  }
  for (const outputPath of outputPaths) {
    const asset = bindingsByPath.get(outputPath);
    if (!asset) {
      failures.push(`/visBinding/assets missing output binding: ${outputPath}`);
      continue;
    }
    const output = resolveJobPath(jobRoot, outputPath);
    if (existsSync(output) && statSync(output).isFile() && sha256(output) !== asset.sha256) {
      failures.push(`/visBinding/assets SHA-256 mismatch for output: ${outputPath}`);
    }
  }
  for (const outputPath of bindingsByPath.keys()) {
    if (!outputPaths.has(outputPath)) {
      failures.push(`/visBinding/assets references undeclared output: ${outputPath}`);
    }
  }

  const release = binding.releaseEvidence;
  if (release?.evidencePath !== job.paths?.evidence) {
    failures.push("/visBinding/releaseEvidence/evidencePath must equal paths.evidence");
  }
  const evidence = resolveJobPath(jobRoot, release?.evidencePath ?? "");
  if (existsSync(evidence) && statSync(evidence).isFile() && sha256(evidence) !== release?.evidenceSha256) {
    failures.push("/visBinding/releaseEvidence/evidenceSha256 must match paths.evidence bytes");
  }
}

export function validateMediaJob(
  job,
  { root = scriptRoot, assetRoot = process.env.STARLIGHT_ASSET_ROOT } = {}
) {
  const failures = [];
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schema = loadJson(
    resolve(root, "brand-image-system/runtime/schemas/media-job.schema.json")
  );
  const visBindingSchema = loadJson(
    resolve(root, "brand-image-system/runtime/schemas/vis-asset-evidence-binding.schema.json")
  );
  ajv.addSchema(visBindingSchema);
  const validate = ajv.compile(schema);
  const validateBinding = ajv.getSchema(visBindingSchema.$id);
  if (!validate(job)) failures.push(...validate.errors.map(formatAjvError));

  const brandPath = resolve(
    root,
    "brand-image-system/runtime/brands",
    job.brandId ?? "",
    "brand-pack.json"
  );
  if (!existsSync(brandPath)) failures.push(`/brandId has no runtime brand pack: ${job.brandId}`);

  const workflowPath = resolve(
    root,
    "brand-image-system/runtime/workflows",
    job.workflowId ?? "",
    "workflow.json"
  );
  let workflow;
  if (!existsSync(workflowPath)) {
    failures.push(`/workflowId has no runtime workflow: ${job.workflowId}`);
  } else {
    workflow = loadJson(workflowPath);
  }

  if (["approved", "published"].includes(job.decision)) {
    const reviewers = [job.review?.maker, job.review?.verifier, job.approval?.approver];
    if (reviewers.every(Boolean) && new Set(reviewers).size !== 3) {
      failures.push("/review maker, verifier, and approval approver must be distinct");
    }
    if (job.qa?.score30 < workflow?.scoreThreshold) {
      failures.push(
        `/qa/score30 must be at least ${workflow.scoreThreshold} for ${job.workflowId}`
      );
    }
    if (!assetRoot) {
      failures.push("STARLIGHT_ASSET_ROOT or --asset-root is required for approval");
    } else {
      const resolvedAssetRoot = resolve(assetRoot);
      const jobRoot = resolve(job.paths?.jobRoot ?? "");
      if (!isInside(resolvedAssetRoot, jobRoot)) {
        failures.push("/paths/jobRoot must be inside the declared asset root");
      } else {
        const evidencePaths = [
          ...(job.paths?.outputs ?? []),
          ...(job.paths?.evidence ? [job.paths.evidence] : [])
        ];
        for (const path of evidencePaths) {
          const absolute = resolveJobPath(jobRoot, path);
          if (!isInside(jobRoot, absolute)) {
            failures.push(`/paths artifact escapes jobRoot: ${path}`);
          } else if (!existsSync(absolute) || !statSync(absolute).isFile()) {
            failures.push(`/paths artifact does not exist: ${path}`);
          } else if (statSync(absolute).size === 0) {
            failures.push(`/paths artifact is empty: ${path}`);
          }
        }
        validateVisReceipt(job, jobRoot, validateBinding, failures);
      }
    }
  }

  return [...new Set(failures)];
}

function main() {
  const args = process.argv.slice(2);
  const path = args[0];
  const assetRootIndex = args.indexOf("--asset-root");
  const assetRoot =
    assetRootIndex >= 0 ? args[assetRootIndex + 1] : process.env.STARLIGHT_ASSET_ROOT;
  if (!path) {
    console.error("Usage: npm run validate:media -- path/to/media-job.json [--asset-root /path]");
    process.exit(2);
  }
  let job;
  try {
    job = loadJson(resolve(path));
  } catch (error) {
    console.error(`Cannot read media job: ${error.message}`);
    process.exit(2);
  }
  const failures = validateMediaJob(job, { assetRoot });
  if (failures.length) {
    console.error(`Media job invalid (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Media job valid: ${job.jobId} (${job.qa.score30}/30, ${job.decision})`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
