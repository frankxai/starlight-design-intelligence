import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";

export const CANONICAL_REPOSITORY = "frankxai/starlight-design-intelligence";
export const CANONICAL_WORKFLOW_PATH = ".github/workflows/design-contract.yml";
export const CONTRACT_PATH = ".starlight/design-contract.json";
export const REGISTRY_PATH = "portfolio/core-surfaces.json";
export const SCHEMA_PATH = "schemas/design-contract.schema.json";

const normal = (value) => String(value).normalize("NFKC").toLowerCase();

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function gitText(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function gitBlob(root, commit, path) {
  return execFileSync("git", ["show", `${commit}:${path}`], {
    cwd: root,
    encoding: null,
    maxBuffer: 10 * 1024 * 1024
  });
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function compileSchemas(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const registrySchema = {
    $schema: schema.$schema,
    ...schema.$defs.portfolioRegistry,
    $defs: schema.$defs
  };
  return {
    contract: ajv.compile(schema),
    registry: ajv.compile(registrySchema)
  };
}

function appendSchemaErrors(failures, label, validate) {
  for (const error of validate.errors ?? []) {
    failures.push(`${label}${error.instancePath || "/"} ${error.message}`);
  }
}

function duplicateKeys(items, key) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of items) {
    const value = normal(key(item));
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function validatePortfolioRegistryData({ registry, schema, brandPacks }) {
  const failures = [];
  let validators;
  try {
    validators = compileSchemas(schema);
  } catch (error) {
    return [`${SCHEMA_PATH}: schema does not compile: ${error.message}`];
  }

  if (!validators.registry(registry)) {
    appendSchemaErrors(failures, REGISTRY_PATH, validators.registry);
    return failures;
  }

  for (const repository of duplicateKeys(registry.repositories, (entry) => entry.repository)) {
    failures.push(`${REGISTRY_PATH}: duplicate normalized repository ${repository}`);
  }

  for (const entry of registry.repositories) {
    const surfaceDuplicates = duplicateKeys(entry.surfaces, (surface) => surface.id);
    for (const surface of surfaceDuplicates) {
      failures.push(`${entry.repository}: duplicate normalized surface ${surface}`);
    }

    const pack = brandPacks[entry.brand_id];
    if (!pack) {
      failures.push(`${entry.repository}: missing canonical brand pack ${entry.brand_id}`);
      continue;
    }
    if (pack.brandId !== entry.brand_id) {
      failures.push(
        `${entry.repository}: registry brand ${entry.brand_id} does not match pack ${pack.brandId}`
      );
    }
    if (!(pack.canonicalRepos ?? []).some((repo) => normal(repo) === normal(entry.repository))) {
      failures.push(
        `${entry.repository}: canonical brand pack ${entry.brand_id} does not own repository`
      );
    }
    const allowedModes = new Set(pack.surfaceModes ?? []);
    for (const surface of entry.surfaces) {
      if (!allowedModes.has(surface.mode)) {
        failures.push(
          `${entry.repository}/${surface.id}: mode ${surface.mode} is absent from ${entry.brand_id} surfaceModes`
        );
      }
    }
  }
  return failures;
}

function brandPackPath(brandId) {
  return `brand-image-system/runtime/brands/${brandId}/brand-pack.json`;
}

export function validatePortfolioRegistry({ kernelRoot = process.cwd() } = {}) {
  try {
    const schema = readJson(join(kernelRoot, SCHEMA_PATH));
    const registry = readJson(join(kernelRoot, REGISTRY_PATH));
    const brandPacks = {};
    for (const brandId of new Set(registry.repositories?.map((entry) => entry.brand_id) ?? [])) {
      brandPacks[brandId] = readJson(join(kernelRoot, brandPackPath(brandId)));
    }
    return validatePortfolioRegistryData({ registry, schema, brandPacks });
  } catch (error) {
    return [`design portfolio could not be read: ${error.message}`];
  }
}

function isCleanRelativePath(path) {
  if (typeof path !== "string" || !path || isAbsolute(path)) return false;
  if (/[\u0000-\u001f\u007f\\]/u.test(path)) return false;
  const parts = path.split("/");
  return parts.every((part) => part && part !== "." && part !== "..");
}

function inspectRepositoryPath(
  repositoryRoot,
  repositoryPath,
  { label, mustExist, mustBeFile, mustBeDirectory = false, mustBeTracked }
) {
  const failures = [];
  if (!isCleanRelativePath(repositoryPath)) {
    return [`${label}: must be a clean repository-relative POSIX path`];
  }

  const root = realpathSync(repositoryRoot);
  let cursor = root;
  const parts = repositoryPath.split("/");
  for (let index = 0; index < parts.length; index += 1) {
    cursor = join(cursor, parts[index]);
    let stat;
    try {
      stat = lstatSync(cursor);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      if (mustExist) failures.push(`${label}: path does not exist`);
      break;
    }
    if (stat.isSymbolicLink()) failures.push(`${label}: symlinks are not allowed`);
    if (index < parts.length - 1 && !stat.isDirectory()) {
      failures.push(`${label}: intermediate component is not a directory`);
      break;
    }
    if (index === parts.length - 1 && mustBeFile && !stat.isFile()) {
      failures.push(`${label}: path is not a regular file`);
    }
    if (index === parts.length - 1 && mustBeDirectory && !stat.isDirectory()) {
      failures.push(`${label}: path is not a directory`);
    }
  }

  if (existsSync(cursor)) {
    const resolved = realpathSync(cursor);
    const rel = relative(root, resolved);
    if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
      failures.push(`${label}: path escapes the repository`);
    }
  }

  if (mustBeTracked) {
    const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "--", repositoryPath], {
      cwd: root,
      encoding: "utf8"
    });
    if (tracked.status !== 0) failures.push(`${label}: path is not tracked by Git`);
  }
  return failures;
}

function normalizeRemote(remote) {
  return remote
    .trim()
    .replace(/^git@github\.com:/u, "")
    .replace(/^https:\/\/github\.com\//u, "")
    .replace(/\.git$/u, "");
}

function normalizedWorkflowPath(value) {
  const withoutRef = String(value).split("@", 1)[0];
  const prefix = `${CANONICAL_REPOSITORY}/`;
  return withoutRef.startsWith(prefix) ? withoutRef.slice(prefix.length) : withoutRef;
}

function canonicalSurface(surface) {
  return JSON.stringify({
    id: normal(surface.id),
    mode: surface.mode,
    claim_classes: [...surface.claim_classes].sort()
  });
}

function validateCallerWorkflow(downstreamRoot, kernelSha) {
  const failures = [];
  const workflowDirectory = join(downstreamRoot, ".github/workflows");
  if (!existsSync(workflowDirectory)) return ["downstream: .github/workflows is missing"];

  const expectedUses = `${CANONICAL_REPOSITORY}/${CANONICAL_WORKFLOW_PATH}@${kernelSha}`;
  let canonicalReferences = 0;
  let validJobs = 0;

  for (const entry of readdirSync(workflowDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.ya?ml$/u.test(entry.name)) continue;
    const path = `.github/workflows/${entry.name}`;
    failures.push(
      ...inspectRepositoryPath(downstreamRoot, path, {
        label: path,
        mustExist: true,
        mustBeFile: true,
        mustBeTracked: true
      })
    );

    let workflow;
    try {
      workflow = parseYaml(readFileSync(join(downstreamRoot, path), "utf8"));
    } catch (error) {
      failures.push(`${path}: invalid YAML: ${error.message}`);
      continue;
    }
    if (!workflow || typeof workflow !== "object") continue;

    const trigger = workflow.on;
    const hasPullRequest =
      trigger &&
      typeof trigger === "object" &&
      Object.prototype.hasOwnProperty.call(trigger, "pull_request");
    const pullRequest = hasPullRequest ? trigger.pull_request : undefined;
    const unfilteredPullRequest =
      hasPullRequest &&
      (pullRequest === null ||
        (typeof pullRequest === "object" &&
          !Array.isArray(pullRequest) &&
          Object.keys(pullRequest).length === 0));

    for (const [jobName, job] of Object.entries(workflow.jobs ?? {})) {
      if (!job || typeof job !== "object" || typeof job.uses !== "string") continue;
      if (job.uses.startsWith(`${CANONICAL_REPOSITORY}/${CANONICAL_WORKFLOW_PATH}@`)) {
        canonicalReferences += 1;
      }
      if (job.uses !== expectedUses) continue;
      if (Object.prototype.hasOwnProperty.call(job, "if")) {
        failures.push(`${path}#${jobName}: canonical design job must not be conditional`);
        continue;
      }
      if (!unfilteredPullRequest) {
        failures.push(
          `${path}#${jobName}: canonical design job requires an unfiltered pull_request trigger`
        );
        continue;
      }
      validJobs += 1;
    }
  }

  if (canonicalReferences === 0) {
    failures.push("downstream: no parsed canonical design-contract workflow job exists");
  }
  if (canonicalReferences !== 1) {
    failures.push(
      `downstream: expected exactly one canonical design-contract workflow reference, found ${canonicalReferences}`
    );
  }
  if (validJobs !== 1) {
    failures.push(
      `downstream: expected exactly one unconditioned ${expectedUses} job, found ${validJobs}`
    );
  }
  return failures;
}

function loadPinnedJson(kernelRoot, commit, path) {
  return JSON.parse(gitBlob(kernelRoot, commit, path).toString("utf8"));
}

export function validateAdoption({
  downstreamRoot,
  kernelRoot,
  callerRepository,
  workflowRepository,
  workflowPath,
  workflowSha
}) {
  const failures = [];
  const downstream = resolve(downstreamRoot);
  const kernel = resolve(kernelRoot);

  if (workflowRepository !== CANONICAL_REPOSITORY) {
    failures.push(`workflow repository must be ${CANONICAL_REPOSITORY}`);
  }
  if (normalizedWorkflowPath(workflowPath) !== CANONICAL_WORKFLOW_PATH) {
    failures.push(`workflow path must be ${CANONICAL_WORKFLOW_PATH}`);
  }
  if (!/^[0-9a-f]{40}$/u.test(workflowSha)) {
    failures.push("workflow SHA must be a full lowercase Git commit SHA");
    return failures;
  }

  let kernelHead;
  try {
    kernelHead = gitText(kernel, ["rev-parse", "HEAD"]);
    if (kernelHead !== workflowSha) {
      failures.push(`kernel checkout ${kernelHead} does not match workflow SHA ${workflowSha}`);
    }
    const remote = gitText(kernel, ["config", "--get", "remote.origin.url"]);
    if (normalizeRemote(remote) !== CANONICAL_REPOSITORY) {
      failures.push(`kernel remote must be ${CANONICAL_REPOSITORY}`);
    }
    for (const args of [
      ["diff", "--quiet", "HEAD", "--"],
      ["diff", "--cached", "--quiet", "HEAD", "--"]
    ]) {
      const clean = spawnSync("git", args, { cwd: kernel });
      if (clean.status !== 0) failures.push("kernel checkout has tracked modifications");
    }
  } catch (error) {
    failures.push(`kernel Git identity could not be verified: ${error.message}`);
    return failures;
  }

  let schema;
  let registry;
  let contract;
  try {
    schema = loadPinnedJson(kernel, workflowSha, SCHEMA_PATH);
    registry = loadPinnedJson(kernel, workflowSha, REGISTRY_PATH);
    contract = readJson(join(downstream, CONTRACT_PATH));
  } catch (error) {
    failures.push(`design contract inputs could not be read: ${error.message}`);
    return failures;
  }

  let validators;
  try {
    validators = compileSchemas(schema);
  } catch (error) {
    failures.push(`pinned design-contract schema does not compile: ${error.message}`);
    return failures;
  }
  if (!validators.contract(contract)) {
    appendSchemaErrors(failures, CONTRACT_PATH, validators.contract);
    return failures;
  }

  if (contract.kernel_commit_sha !== workflowSha) {
    failures.push("contract kernel_commit_sha does not match reusable workflow SHA");
  }
  if (normal(contract.repository) !== normal(callerRepository)) {
    failures.push("contract repository does not match the trusted caller repository");
  }

  const brandPacks = {};
  for (const brandId of new Set(registry.repositories.map((entry) => entry.brand_id))) {
    try {
      brandPacks[brandId] = loadPinnedJson(kernel, workflowSha, brandPackPath(brandId));
    } catch (error) {
      failures.push(`pinned brand pack ${brandId} could not be read: ${error.message}`);
    }
  }
  failures.push(...validatePortfolioRegistryData({ registry, schema, brandPacks }));

  const registryEntries = registry.repositories.filter(
    (entry) => normal(entry.repository) === normal(callerRepository)
  );
  if (registryEntries.length !== 1) {
    failures.push(
      `portfolio registry must contain exactly one caller entry, found ${registryEntries.length}`
    );
  } else {
    const entry = registryEntries[0];
    if (contract.brand.id !== entry.brand_id) {
      failures.push("contract brand does not match the portfolio registry");
    }
    const contractSurfaces = contract.surfaces.map(canonicalSurface).sort();
    const registrySurfaces = entry.surfaces.map(canonicalSurface).sort();
    if (JSON.stringify(contractSurfaces) !== JSON.stringify(registrySurfaces)) {
      failures.push("contract surfaces must exactly match the portfolio registry");
    }
  }

  const packPath = brandPackPath(contract.brand.id);
  try {
    const bytes = gitBlob(kernel, workflowSha, packPath);
    const pack = JSON.parse(bytes.toString("utf8"));
    if (pack.brandId !== contract.brand.id) {
      failures.push("contract brand does not match the pinned brand pack");
    }
    if (!(pack.canonicalRepos ?? []).some((repo) => normal(repo) === normal(callerRepository))) {
      failures.push("pinned brand pack does not own the caller repository");
    }
    if (sha256(bytes) !== contract.brand.pack_sha256) {
      failures.push("brand pack digest does not match the pinned raw Git blob");
    }
  } catch (error) {
    failures.push(`pinned caller brand pack could not be verified: ${error.message}`);
  }

  failures.push(
    ...inspectRepositoryPath(downstream, CONTRACT_PATH, {
      label: CONTRACT_PATH,
      mustExist: true,
      mustBeFile: true,
      mustBeTracked: true
    })
  );
  for (const path of duplicateKeys(contract.local_contracts, (value) => value)) {
    failures.push(`local_contracts: duplicate normalized path ${path}`);
  }
  for (const path of contract.local_contracts) {
    failures.push(
      ...inspectRepositoryPath(downstream, path, {
        label: `local_contracts:${path}`,
        mustExist: true,
        mustBeFile: true,
        mustBeTracked: true
      })
    );
  }
  failures.push(
    ...inspectRepositoryPath(downstream, contract.release_evidence.receipt_directory, {
      label: "release_evidence.receipt_directory",
      mustExist: false,
      mustBeFile: false,
      mustBeDirectory: true,
      mustBeTracked: false
    })
  );
  failures.push(...validateCallerWorkflow(downstream, workflowSha));

  return [...new Set(failures)];
}

function option(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  return args[index + 1];
}

function runCli() {
  const args = process.argv.slice(2);
  let failures;
  if (args.includes("--registry-only") || !args.includes("--downstream-root")) {
    const kernelRoot = option(args, "--kernel-root", process.cwd());
    failures = validatePortfolioRegistry({ kernelRoot });
    if (!failures.length) {
      const registry = readJson(join(kernelRoot, REGISTRY_PATH));
      console.log(
        `Design portfolio valid: ${registry.repositories.length} repositories with canonical brand ownership.`
      );
    }
  } else {
    const options = {
      downstreamRoot: option(args, "--downstream-root"),
      kernelRoot: option(args, "--kernel-root", process.cwd()),
      callerRepository: option(args, "--caller-repository"),
      workflowRepository: option(args, "--workflow-repository"),
      workflowPath: option(args, "--workflow-path"),
      workflowSha: option(args, "--workflow-sha")
    };
    failures = validateAdoption(options);
    if (!failures.length) {
      console.log(
        `Design adoption valid: ${options.callerRepository}@${options.workflowSha}.`
      );
    }
  }

  if (failures.length) {
    console.error(`Design adoption validation failed (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  try {
    runCli();
  } catch (error) {
    console.error(`Design adoption validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
