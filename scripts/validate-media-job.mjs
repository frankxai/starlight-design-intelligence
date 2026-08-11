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
  const validate = ajv.compile(schema);
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
