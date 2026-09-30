import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse } from "yaml";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readYaml = (path) => parse(readFileSync(path, "utf8"));
const key = (repository, surface) => `${repository.toLowerCase()}:${surface}`;

export function validateExperience({ root = process.cwd(), standard, asOf = new Date().toISOString().slice(0, 10) } = {}) {
  const failures = [];
  const value = standard ?? readJson(join(root, "portfolio/experience-standard.json"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(readJson(join(root, "schemas/experience-standard.schema.json")));
  if (!validate(value)) return validate.errors.map((e) => `${e.instancePath || "/"} ${e.message}`);
  try {
    const toolchain = readJson(join(root, "portfolio/design-toolchain.json"));
    if (toolchain.schema_version !== "starlight.design_toolchain.v1") failures.push("toolchain: unexpected schema version");
  } catch { failures.push("toolchain: policy must be valid JSON"); }

  const profiles = readdirSync(join(root, "portfolio/domains")).filter((p) => p.endsWith(".yaml"))
    .map((p) => readYaml(join(root, "portfolio/domains", p))).filter((p) => p.active);
  const domains = new Map(profiles.map((p) => [p.domain_id, p]));
  const targets = new Map(readdirSync(join(root, "observatory/targets")).map((id) => {
    const path = join(root, "observatory/targets", id, "target.yaml");
    return existsSync(path) ? [id, readYaml(path)] : [id, null];
  }).filter(([, target]) => target));
  const canonical = new Map(readJson(join(root, "portfolio/core-surfaces.json")).repositories
    .flatMap((repo) => repo.surfaces.map((surface) => [key(repo.repository, surface.id), { ...surface, ...repo }])));

  function unique(records, label, getId = (record) => record.id) {
    const seen = new Set();
    for (const record of records) {
      const id = getId(record);
      if (seen.has(id)) failures.push(`${label}: duplicate ${id}`);
      seen.add(id);
    }
    return seen;
  }
  function date(date, label) {
    if (date > asOf) failures.push(`${label}: review date is in the future`);
    if (date > value.reviewed_at) failures.push(`${label}: review exceeds standard reviewed_at`);
  }
  function pattern(domainId, patternId, label) {
    const domain = domains.get(domainId);
    if (!domain) failures.push(`${label}: unknown active domain ${domainId}`);
    else if (!domain.approved_pattern_ids.includes(patternId)) failures.push(`${label}: pattern ${patternId} is not approved for ${domainId}`);
    if (!existsSync(join(root, "observatory/patterns", `${patternId}.yaml`))) failures.push(`${label}: missing pattern ${patternId}`);
  }
  date(value.reviewed_at, "standard");
  const checks = unique(value.checks, "checks");
  for (const id of ["task", "proof", "states", "accessibility", "typography", "motion", "portability", "release"]) {
    if (!checks.has(id)) failures.push(`checks: missing ${id}`);
  }
  for (const check of value.checks) for (const path of check.gate_paths) {
    if (!existsSync(join(root, path))) failures.push(`${check.id}: missing gate ${path}`);
  }
  unique(value.tool_reviews, "tool reviews");
  const tools = unique(value.tool_reviews, "tool names", (r) => r.tool);
  for (const tool of ["github", "figma", "canva"]) if (!tools.has(tool)) failures.push(`tool reviews: missing ${tool}`);
  for (const review of value.tool_reviews) date(review.reviewed_at, review.id);
  unique(value.references, "references");
  for (const reference of value.references) {
    date(reference.reviewed_at, reference.id);
    const target = targets.get(reference.target_id);
    if (!target) failures.push(`${reference.id}: unknown target ${reference.target_id}`);
    else {
      const targetUrl = target.url ?? target.canonical_url ?? target.homepage_url;
      const allowed = new Set([targetUrl ? new URL(targetUrl).hostname.replace(/^www\./, "") : ""]);
      if (!allowed.has(new URL(reference.source_url).hostname.replace(/^www\./, ""))) failures.push(`${reference.id}: source is not on target's official host`);
    }
    unique(reference.applications, reference.id, (a) => `${a.domain_id}:${a.pattern_id}`);
    for (const application of reference.applications) pattern(application.domain_id, application.pattern_id, reference.id);
  }
  const flows = unique(value.flows, "flows", (f) => key(f.repository, f.surface_id));
  for (const flow of value.flows) {
    const label = key(flow.repository, flow.surface_id);
    const registered = canonical.get(label);
    const domain = domains.get(flow.domain_id);
    const packPath = join(root, "brand-image-system/runtime/brands", flow.brand_id, "brand-pack.json");
    if (!existsSync(packPath)) failures.push(`${label}: missing runtime pack`);
    else {
      const pack = readJson(packPath);
      if (pack.brandId !== flow.brand_id || !pack.canonicalRepos.some((r) => r.toLowerCase() === flow.repository.toLowerCase()) || !pack.surfaceModes.includes(flow.mode)) failures.push(`${label}: runtime pack ownership or mode mismatch`);
    }
    if (!registered) failures.push(`${label}: surface is not registered`);
    else {
      if (registered.brand_id !== flow.brand_id) failures.push(`${label}: brand ownership mismatch`);
      if (registered.mode !== flow.mode) failures.push(`${label}: surface mode mismatch`);
    }
    if (!domain || domain.brand_id !== flow.brand_id || !domain.canonical_repositories.some((r) => r.toLowerCase() === flow.repository.toLowerCase()) || !domain.surface_ids.includes(flow.surface_id)) failures.push(`${label}: domain ownership mismatch`);
    for (const id of flow.pattern_ids) pattern(flow.domain_id, id, label);
  }
  for (const registered of canonical.keys()) if (!flows.has(registered)) failures.push(`flows: missing registered surface ${registered}`);
  const upgrades = unique(value.upgrades, "upgrades");
  for (const upgrade of value.upgrades) {
    for (const id of upgrade.domain_ids) if (!domains.has(id)) failures.push(`${upgrade.id}: unknown active domain ${id}`);
    for (const id of upgrade.depends_on) if (!upgrades.has(id)) failures.push(`${upgrade.id}: unknown dependency ${id}`);
  }
  const visited = new Set(), visiting = new Set();
  const byId = new Map(value.upgrades.map((u) => [u.id, u]));
  function visit(id) {
    if (visiting.has(id)) { failures.push(`upgrades: dependency cycle at ${id}`); return; }
    if (visited.has(id) || !byId.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).depends_on) visit(dependency);
    visiting.delete(id); visited.add(id);
  }
  for (const id of upgrades) visit(id);
  for (const id of domains.keys()) if (!value.upgrades.some((u) => u.domain_ids.includes(id))) failures.push(`upgrades: missing active domain ${id}`);
  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const failures = validateExperience();
    if (failures.length) { console.error(failures.map((f) => `- ${f}`).join("\n")); process.exitCode = 1; }
    else console.log("Experience standard valid: all registered surfaces covered; structure and authority checked. No live UX or release pass implied.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
