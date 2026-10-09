import { createHash, randomUUID } from "node:crypto";
import {
  closeSync, existsSync, fstatSync, fsyncSync, lstatSync, openSync,
  readFileSync, readSync, realpathSync, renameSync, unlinkSync, writeFileSync
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual, parseArgs } from "node:util";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { validateMediaJob } from "./validate-media-job.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMAS = resolve(ROOT, "brand-image-system/runtime/schemas");
const REGISTRY = resolve(ROOT, "brand-image-system/runtime/asset-registry.json");
const MAX_JSON = 1024 * 1024;
const MAX_FILE = 64 * 1024 * 1024;
const MAX_TOTAL = 128 * 1024 * 1024;
const PATH = /^(?![A-Za-z]:)(?!\/)(?!.*\.\.)(?!.*\\)[A-Za-z0-9][A-Za-z0-9._/-]*$/;
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const decode = (bytes) => JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validators = Object.fromEntries([
  ["registry", "asset-registry.schema.json"],
  ["job", "media-job.schema.json"],
  ["binding", "vis-asset-evidence-binding.schema.json"],
  ["sidecar", "vis-provenance-sidecar.schema.json"]
].map(([key, file]) => [key, ajv.compile(decode(readFileSync(resolve(SCHEMAS, file))))]));

function check(kind, value) {
  if (!validators[kind](value)) {
    throw new Error(`${kind} schema invalid: ${validators[kind].errors.map(e => `${e.instancePath || "/"} ${e.message}`).join("; ")}`);
  }
}

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

// Check only selected ancestors; reject symlinks and Windows junctions.
function noLinks(path) {
  let cursor = resolve(path);
  for (;;) {
    if (lstatSync(cursor).isSymbolicLink()) throw new Error("Selected artifact path contains a symbolic link or junction");
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return realpathSync.native(path);
}

function artifact(base, path, budget, maximum = MAX_FILE) {
  if (typeof path !== "string" || !PATH.test(path)) throw new Error("Artifact path must be a contained portable relative path");
  const full = resolve(base, path);
  if (!inside(base, full)) throw new Error("Artifact path escapes its declared root");
  const canonical = noLinks(full);
  if (!inside(base, canonical)) throw new Error("Artifact resolves outside its declared root");
  if (!lstatSync(canonical).isFile()) throw new Error("Artifact is not a regular file");
  const fd = openSync(canonical, "r");
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size < 1 || stat.size > maximum) throw new Error("Artifact is not a nonempty bounded regular file");
    budget.bytes += stat.size;
    if (budget.bytes > MAX_TOTAL) throw new Error("Job exceeds total artifact byte budget");
    const bytes = Buffer.alloc(stat.size);
    let offset = 0;
    while (offset < bytes.length) {
      const count = readSync(fd, bytes, offset, bytes.length - offset, offset);
      if (!count) throw new Error("Artifact changed while being read");
      offset += count;
    }
    if (readSync(fd, Buffer.alloc(1), 0, 1, offset) || fstatSync(fd).size !== stat.size) throw new Error("Artifact changed while being read");
    return { bytes, canonical, record: { path, sha256: sha256(bytes) } };
  } finally { closeSync(fd); }
}

function readRegistry(path) {
  const canonical = noLinks(path);
  const stat = lstatSync(canonical);
  if (!stat.isFile() || stat.size < 1 || stat.size > MAX_JSON) throw new Error("Registry is not a bounded regular JSON file");
  const raw = readFileSync(canonical);
  const registry = decode(raw);
  check("registry", registry);
  const ids = registry.assets.map(asset => asset.id);
  if (new Set(ids).size !== ids.length) throw new Error("Registry contains duplicate asset registrations");
  return { path: canonical, raw, registry, sha256: sha256(raw) };
}

export function prepareRegistration({ jobPath, bindingPath, assetRoot }) {
  if (!assetRoot || !isAbsolute(assetRoot)) throw new Error("An absolute --asset-root is required");
  const root = noLinks(assetRoot);
  if (!lstatSync(root).isDirectory()) throw new Error("Asset root must be a directory");
  const budget = { bytes: 0 };
  const jobFile = artifact(root, relative(root, noLinks(resolve(jobPath))).split(sep).join("/"), budget, MAX_JSON);
  const job = decode(jobFile.bytes);
  check("job", job);
  if (job?.decision !== "approved") throw new Error("Registration requires an approved media-job assertion; published claims need a separate publication verifier");
  if (!Array.isArray(job.paths?.outputs) || job.paths.outputs.length < 1 || job.paths.outputs.length > 32 || new Set(job.paths.outputs).size !== job.paths.outputs.length) {
    throw new Error("Declare 1–32 unique outputs");
  }
  if (!isAbsolute(job.paths.jobRoot)) throw new Error("jobRoot must be absolute");
  const jobRoot = noLinks(job.paths.jobRoot);
  if (!inside(root, jobRoot) || !inside(jobRoot, jobFile.canonical)) throw new Error("Job and artifacts must be inside the declared job root and asset root");
  const failures = validateMediaJob({ ...job, paths: { ...job.paths, jobRoot } }, { root: ROOT, assetRoot: root });
  if (failures.length) throw new Error(`Media job invalid: ${failures.join("; ")}`);
  const bindingFile = artifact(root, relative(root, noLinks(resolve(bindingPath))).split(sep).join("/"), budget, MAX_JSON);
  if (!inside(jobRoot, bindingFile.canonical)) throw new Error("VIS binding must be inside jobRoot");
  const binding = decode(bindingFile.bytes);
  check("binding", binding);
  if (binding.assets.length !== job.paths.outputs.length) throw new Error("VIS binding must cover exactly the declared outputs");
  const byPath = new Map(binding.assets.map(asset => [asset.outputPath, asset]));
  if (byPath.size !== binding.assets.length) throw new Error("VIS binding duplicates an output");
  const release = binding.releaseEvidence;
  if (release.evidencePath !== job.paths.evidence) throw new Error("VIS release evidence path differs from the media job");
  const evidence = artifact(jobRoot, release.evidencePath, budget, MAX_JSON);
  if (evidence.record.sha256 !== release.evidenceSha256) throw new Error("Release evidence bytes differ from the bound VIS receipt");
  const canonicalOutputs = new Set();
  const outputs = job.paths.outputs.map(path => {
    const bound = byPath.get(path);
    if (!bound) throw new Error("VIS binding is missing a declared output");
    const file = artifact(jobRoot, path, budget);
    if (canonicalOutputs.has(file.canonical)) throw new Error("Outputs alias the same canonical file");
    canonicalOutputs.add(file.canonical);
    if (file.record.sha256 !== bound.sha256) throw new Error("Output bytes differ from the bound VIS version");
    const provenance = artifact(jobRoot, path + ".vis.provenance.json", budget, MAX_JSON);
    const sidecar = decode(provenance.bytes);
    check("sidecar", sidecar);
    const generation = sidecar.generation;
    if (![generation.prompt, generation.model, generation.provider, sidecar.agent?.session_ref].every(value => typeof value === "string" && value.trim()) || !Object.hasOwn(generation, "seed")) {
      throw new Error("Sidecar must retain exact prompt, model, provider, seed (null if unavailable) and agent session");
    }
    if (sidecar.asset?.sha256 !== bound.sha256 || sidecar.asset?.asset_id !== bound.assetId || sidecar.asset?.version_id !== bound.versionId) {
      throw new Error("Sidecar asset identity/hash differs from the bound VIS version");
    }
    return { path: relative(root, file.canonical).split(sep).join("/"), sha256: bound.sha256,
      bytes: file.bytes.length, assetId: bound.assetId, versionId: bound.versionId,
      rightsStatus: bound.rightsStatus,
      provenance: { path: relative(root, provenance.canonical).split(sep).join("/"), sha256: provenance.record.sha256 } };
  });
  const proof = {
    id: `${job.brandId}/${job.jobId}`, jobId: job.jobId, brandId: job.brandId, workflowId: job.workflowId,
    status: "file-verified", job: jobFile.record, binding: bindingFile.record,
    evidence: { path: relative(root, evidence.canonical).split(sep).join("/"), sha256: evidence.record.sha256 },
    approvalAssertion: job.approval, outputs
  };
  return { ...proof, fingerprint: sha256(Buffer.from(JSON.stringify(proof))) };
}

export function validateAssetRegistry(registry, { assetRoot } = {}) {
  try {
    check("registry", registry);
    const ids = new Set();
    for (const entry of registry.assets) {
      if (ids.has(entry.id)) throw new Error("Registry contains duplicate asset registrations");
      ids.add(entry.id);
      if (!assetRoot) throw new Error("Nonempty registry requires --asset-root for current byte verification");
      const proof = prepareRegistration({ assetRoot, jobPath: resolve(assetRoot, entry.job.path), bindingPath: resolve(assetRoot, entry.binding.path) });
      const { registeredAt, ...stored } = entry;
      if (!isDeepStrictEqual(proof, stored)) throw new Error("Registry entry no longer matches its local job, receipt, outputs or sidecars");
    }
    return [];
  } catch (error) { return [error.message]; }
}

export function registerMediaAsset({ registryPath = REGISTRY, apply = false, expectedRegistrySha256, expectedFingerprint, ...input }) {
  const before = readRegistry(registryPath);
  if (apply && expectedRegistrySha256 !== before.sha256) throw new Error("Apply requires the current --expected-registry-sha256 from preview");
  const run = randomUUID();
  const lock = before.path + ".lock";
  let fd;
  let temp;
  let tempIdentity;
  const lockBytes = Buffer.from(JSON.stringify({ run, pid: process.pid }));
  try {
    if (apply) {
      fd = openSync(lock, "wx", 0o600);
      writeFileSync(fd, lockBytes);
      fsyncSync(fd);
      if (!readFileSync(before.path).equals(before.raw)) throw new Error("Registry changed after lock acquisition");
    }
    const proof = prepareRegistration(input);
    if (apply && proof.fingerprint !== expectedFingerprint) throw new Error("Apply requires the preview artifact fingerprint; inspect changed evidence before retrying");
    const failures = validateAssetRegistry(before.registry, { assetRoot: input.assetRoot });
    if (failures.length) throw new Error(failures.join("; "));
    const existing = before.registry.assets.find(asset => asset.id === proof.id);
    if (existing && existing.fingerprint !== proof.fingerprint) throw new Error("Registration ID already binds different bytes; retain the existing version and issue a new media job");
    const next = { ...before.registry, assets: [...before.registry.assets] };
    if (!existing) next.assets.push({ ...proof, registeredAt: new Date().toISOString() });
    check("registry", next);
    if (apply && !existing) {
      temp = before.path + `.${run}.tmp`;
      const candidate = Buffer.from(JSON.stringify(next, null, 2) + "\n");
      if (candidate.length > MAX_JSON) throw new Error("Registry exceeds its byte budget");
      const tempFd = openSync(temp, "wx", 0o600);
      try {
        tempIdentity = fstatSync(tempFd);
        writeFileSync(tempFd, candidate);
        fsyncSync(tempFd);
      } finally { closeSync(tempFd); }
      if (!isDeepStrictEqual(proof, prepareRegistration(input))) throw new Error("Asset evidence changed during registration");
      if (!readFileSync(before.path).equals(before.raw)) throw new Error("Registry changed during registration");
      renameSync(temp, before.path);
      temp = undefined;
      if (!readFileSync(before.path).equals(candidate)) throw new Error("Registry readback differs after commit; inspect before retrying");
    }
    return { mode: apply ? "apply" : "preview", id: proof.id, outcome: existing ? "already-registered" : apply ? "registered" : "ready-to-register",
      expectedRegistrySha256: before.sha256, outputCount: proof.outputs.length, fingerprint: proof.fingerprint,
      verification: "Local bytes and exported assertions only; human identity, live VIS state, ledger synchronization, creative quality and publication are not authenticated" };
  } finally {
    if (temp && existsSync(temp)) {
      const current = lstatSync(temp);
      if (current.dev === tempIdentity?.dev && current.ino === tempIdentity?.ino) unlinkSync(temp);
    }
    if (fd !== undefined) {
      closeSync(fd);
      if (existsSync(lock) && readFileSync(lock).equals(lockBytes)) unlinkSync(lock);
    }
  }
}

function main() {
  try {
    const { values } = parseArgs({ options: {
      job: { type: "string" }, binding: { type: "string" }, "asset-root": { type: "string" },
      registry: { type: "string" }, apply: { type: "boolean" }, audit: { type: "boolean" },
      "expected-registry-sha256": { type: "string" }, "expected-fingerprint": { type: "string" }
    } });
    if (values.audit) {
      if (values.apply || values.job || values.binding) throw new Error("Audit cannot be combined with registration");
      const current = readRegistry(values.registry ?? REGISTRY);
      const failures = validateAssetRegistry(current.registry, { assetRoot: values["asset-root"] });
      if (failures.length) throw new Error(failures.join("; "));
      console.log(JSON.stringify({ mode: "audit", entries: current.registry.assets.length, scope: "Current local bytes and exported assertions; no creative/publication acceptance" }));
    } else {
      if (!values.job || !values.binding || !values["asset-root"]) {
        console.error("Usage: node scripts/register-media-asset.mjs --job <media-job.json> --binding <vis-receipt.json> --asset-root <absolute-root> [--registry <json>] [--apply --expected-registry-sha256 <preview-hash> --expected-fingerprint <preview-fingerprint>]; or --audit");
        process.exitCode = 2;
        return;
      }
      console.log(JSON.stringify(registerMediaAsset({ jobPath: values.job, bindingPath: values.binding,
        assetRoot: values["asset-root"], registryPath: values.registry, apply: values.apply,
        expectedRegistrySha256: values["expected-registry-sha256"], expectedFingerprint: values["expected-fingerprint"] })));
    }
  } catch (error) {
    console.error(`Asset registration failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
