import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";

export const ROOT = process.cwd();
export const OBSERVATORY = join(ROOT, "observatory");
export const TARGETS = join(OBSERVATORY, "targets");
export const PATTERNS = join(OBSERVATORY, "patterns");
export const DOMAINS = join(ROOT, "portfolio/domains");

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readYaml(path) {
  return parseYaml(readFileSync(path, "utf8"));
}

export function readStructured(path) {
  return /\.json$/u.test(path) ? readJson(path) : readYaml(path);
}

export function listFiles(directory, pattern = /./u) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path, pattern));
    else if (entry.isFile() && pattern.test(entry.name)) files.push(path);
  }
  return files.sort();
}

export function relativePath(path) {
  return relative(ROOT, path).replaceAll("\\", "/");
}

export function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSchemaValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schemaPaths = {
    target: "schemas/design-research-target.schema.json",
    snapshot: "schemas/design-snapshot-manifest.schema.json",
    extraction: "schemas/design-extraction.schema.json",
    pattern: "schemas/design-pattern.schema.json",
    domain: "schemas/domain-design-profile.schema.json"
  };
  const schemas = Object.fromEntries(
    Object.entries(schemaPaths).map(([key, path]) => [key, readJson(join(ROOT, path))])
  );
  for (const schema of Object.values(schemas)) ajv.addSchema(schema);
  return Object.fromEntries(
    Object.entries(schemas).map(([key, schema]) => [key, ajv.getSchema(schema.$id)])
  );
}

export function appendSchemaErrors(failures, label, validate) {
  for (const error of validate.errors ?? []) {
    failures.push(`${label}${error.instancePath || "/"} ${error.message}`);
  }
}

export function loadObservatory() {
  const targetFiles = listFiles(TARGETS, /^target\.yaml$/u);
  const snapshotFiles = listFiles(TARGETS, /^snapshot\..+\.json$/u);
  const extractionFiles = listFiles(TARGETS, /^extraction\.yaml$/u);
  const patternFiles = listFiles(PATTERNS, /\.ya?ml$/u);
  const domainFiles = listFiles(DOMAINS, /\.ya?ml$/u);
  return {
    targets: targetFiles.map((path) => ({ path, value: readYaml(path) })),
    snapshots: snapshotFiles.map((path) => ({ path, value: readJson(path) })),
    extractions: extractionFiles.map((path) => ({ path, value: readYaml(path) })),
    patterns: patternFiles.map((path) => ({ path, value: readYaml(path) })),
    domains: domainFiles.map((path) => ({ path, value: readYaml(path) }))
  };
}

export function artifactExtension(mime) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "text/html": "html",
    "application/json": "json",
    "application/zip": "zip"
  }[mime];
}
