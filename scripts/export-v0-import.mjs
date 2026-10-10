import { createHash } from "node:crypto";
import { closeSync, constants, existsSync, fstatSync, lstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, readSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const commit = (value) => /^[a-f0-9]{40}$/.test(value ?? "");
const repository = (value) => /^frankxai\/[A-Za-z0-9_.-]+$/.test(value ?? "");
const safePath = (value) => typeof value === "string" && /^[A-Za-z0-9_.\/-]+$/.test(value) && value.split("/").every((part) => part && part !== "." && part !== "..");
const inside = (root, path) => { const rel = relative(root, path); return rel !== ".." && !rel.startsWith("../") && !rel.startsWith("..\\") && !isAbsolute(rel); };

function readRegular(root, path, limit = 1024 * 1024) {
  if (!inside(root, path)) throw new Error("Source escapes the bundle boundary.");
  let current = root;
  for (const part of ["", ...relative(root, path).split(/[\\/]/)]) {
    if (part) current = join(current, part);
    if (lstatSync(current).isSymbolicLink()) throw new Error("Bundle paths must not contain symlinks.");
  }
  if (!inside(root, realpathSync(path))) throw new Error("Source escapes the bundle boundary.");
  const before = lstatSync(path);
  if (!before.isFile() || before.size > limit) throw new Error("Source must be a bounded regular file.");
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd);
    if (!opened.isFile() || opened.size > limit || opened.dev !== before.dev || opened.ino !== before.ino || !inside(root, realpathSync(path))) throw new Error("Source changed while opening the bundle.");
    // Read only this validated handle, bounded even if the file grows.
    const buffer = Buffer.alloc(limit + 1);
    let length = 0, count;
    do { count = readSync(fd, buffer, length, buffer.length - length, null); length += count; } while (count && length < buffer.length);
    if (length > limit) throw new Error("Source exceeds the bundle limit.");
    return buffer.subarray(0, length);
  } finally { closeSync(fd); }
}

// Project the existing hashed brand handoff; never upload source or mutate a tool.
export function exportV0Import({ bundle, brand, out, profiles } = {}) {
  if (!bundle || !out) throw new Error("Supply --bundle and a new --out directory.");
  const config = profiles ?? JSON.parse(readFileSync(new URL("../portfolio/v0-imports.json", import.meta.url), "utf8"));
  const profile = config.profiles?.find((item) => item.brand_id === brand);
  if (config.version !== 1 || !profile || !commit(config.registry_commit) || !commit(config.reference_kernel_commit)) throw new Error("Unknown brand or invalid source configuration.");
  if (!repository(profile.repository) || !commit(profile.commit) || (profile.adopted_kernel_commit !== null && !commit(profile.adopted_kernel_commit))) throw new Error("Product references must use an owned repository and immutable commits.");
  if (!(profile.app_root === "." || safePath(profile.app_root)) || !Array.isArray(profile.source_paths) || !profile.source_paths.length || !profile.source_paths.every(safePath)) throw new Error("Product source paths must stay inside the repository.");
  const bundleRoot = resolve(bundle);
  if (lstatSync(bundleRoot).isSymbolicLink()) throw new Error("Bundle paths must not contain symlinks.");
  const canonicalRoot = realpathSync(bundleRoot);
  const manifestBytes = readRegular(canonicalRoot, join(canonicalRoot, "manifest.json"));
  const manifest = JSON.parse(manifestBytes);
  if (manifest.schema_version !== "starlight.brand_handoff.v1" || manifest.brand_id !== brand || manifest.kernel_repository !== "frankxai/starlight-design-intelligence" || manifest.kernel_commit_sha !== config.reference_kernel_commit) throw new Error("Brand bundle and configured reference revision disagree.");
  // SIS public-site ownership is unresolved: retain its explicit blocker instead
  // of pretending the central handoff already registers that consumer.
  const registered = manifest.product_repositories?.some((owner) => owner.toLowerCase() === profile.repository.toLowerCase());
  const unresolvedSis = brand === "sis" && profile.repository === "frankxai/starlightintelligence.ai" && profile.adopted_kernel_commit === null;
  if (!registered && !unresolvedSis) throw new Error("Consumer is not registered in the selected brand handoff.");
  if (!Array.isArray(manifest.sources) || !manifest.sources.length || manifest.sources.length > 100) throw new Error("Missing or oversized source manifest.");
  let total = 0;
  const seen = new Set();
  for (const source of manifest.sources) {
    if (!safePath(source.path) || seen.has(source.path) || !/^[a-f0-9]{64}$/.test(source.sha256 ?? "") || !Number.isSafeInteger(source.bytes) || source.bytes < 0 || source.bytes > 1024 * 1024) throw new Error("Invalid source record.");
    seen.add(source.path);
    const path = join(canonicalRoot, "sources", source.path);
    if (!existsSync(path)) {
      if (["portfolio/experience-standard.json", "portfolio/core-surfaces.json"].includes(source.path)) continue;
      throw new Error("Missing source from the brand handoff.");
    }
    const bytes = readRegular(canonicalRoot, path);
    total += bytes.length;
    if (bytes.length !== source.bytes || hash(bytes) !== source.sha256 || total > 10 * 1024 * 1024) throw new Error("Source bytes differ from the handoff or exceed the bundle limit.");
  }
  const pack = manifest.sources.find((source) => source.path === manifest.brand_pack_path);
  if (manifest.brand_pack_path !== `brand-image-system/runtime/brands/${brand}/brand-pack.json` || !pack || pack.sha256 !== manifest.brand_pack_sha256 || !existsSync(join(canonicalRoot, "sources", manifest.brand_pack_path))) throw new Error("Missing or mismatched brand pack.");
  if (JSON.parse(readRegular(canonicalRoot, join(canonicalRoot, "sources", manifest.brand_pack_path))).brandId !== brand) throw new Error("Brand pack identity disagrees with the selected brand.");
  const refs = [
    ["frankxai/starlight-design-intelligence", config.reference_kernel_commit],
    [profile.repository, profile.commit],
    ...(profile.adopted_kernel_commit && profile.adopted_kernel_commit !== config.reference_kernel_commit ? [["frankxai/starlight-design-intelligence", profile.adopted_kernel_commit]] : [])
  ];
  const referenceConfig = {
    version: 1,
    // Native attachment currently clones ref as a branch name and rejects SHAs.
    // Preserve immutable source identities separately; never silently use main.
    referenceWorkspace: { sources: [] },
    starter: { source: "empty" }
  };
  const packet = {
    version: 1, status: "import-input-for-review", brand_id: brand,
    registry_commit: config.registry_commit,
    handoff_manifest_sha256: hash(manifestBytes),
    reference_kernel_commit: config.reference_kernel_commit,
    brand_pack_sha256: manifest.brand_pack_sha256,
    consumer: profile, consumer_registered_in_handoff: Boolean(registered),
    source_references: refs.map(([repository, commit]) => ({ repository, commit, url: `https://github.com/${repository}/tree/${commit}` })),
    v0_reference_config: referenceConfig,
    limits: ["Not a saved v0 skill, native import command or production-adoption receipt.", "Native Git mounts are omitted after an observed SHA-as-branch checkout failure. Attach the hash-verified bundle and verified consumer snapshots; source URLs are provenance, not mounted files.", "Configured commit syntax is checked locally; resolve repositories, commits and consumer paths before accepting the import.", "Product references are read-only; verify current instructions, ownership and imported HEAD before editing.", "Reconcile source conflicts before saving a skill; verify its installable starter, fonts, providers, components and states.", "Figma is an optional projection; retain existing files and quota/plan limits.", "Preserve original chats and attach the existing Vercel project; do not create a second product project."]
  };
  const notes = `# ${brand} v0 import\n\nStatus: import inputs for review.\n\nJob: ${profile.job}\n\nConsumer: https://github.com/${profile.repository}/tree/${profile.commit}\nApp root: ${profile.app_root}\nCurrent context: ${profile.context_url}\n\nRead these consumer paths at the pinned commit:\n\n${profile.source_paths.map((path) => `- ${path}`).join("\n")}\n\nReconciliation: ${profile.reconciliation}\n\nAttach the hash-verified brand handoff plus verified consumer source snapshots, retaining repository, commit, path and SHA256. Native Git mounts are omitted because observed SHA checkout fails; source URLs are provenance only. Never silently substitute main. The reference JSON uses an empty starter until v0 creates and verifies a small installable starter. Do not save this draft as a design-system skill. Keep exactly one brand selected; preserve the existing team skills and defaults.\n\nBefore UI edits, capture current desktop and phone states, compare three compositions and select one. Verify the actual useful task, denied/interrupted operations, reflow, keyboard focus and reduced motion. Keep the skill revision, product SHA, chat, branch, preview and review receipt together in the existing product issue.\n\nSaving a skill requires inspected starter evidence. Product releases require the owning repository's exact-revision checks, independent review and approval. Existing apps adopt a changed skill explicitly.\n`;
  const destination = resolve(out);
  if (existsSync(destination)) throw new Error("Output already exists; use a new directory.");
  mkdirSync(dirname(destination), { recursive: true });
  const temporary = mkdtempSync(join(dirname(destination), ".v0-import-"));
  try {
    writeFileSync(join(temporary, "import-packet.json"), `${JSON.stringify(packet, null, 2)}\n`);
    writeFileSync(join(temporary, "v0.reference.json"), `${JSON.stringify(referenceConfig, null, 2)}\n`);
    writeFileSync(join(temporary, "IMPORT.md"), notes);
    if (existsSync(destination)) throw new Error("Output already exists; use a new directory.");
    renameSync(temporary, destination);
  } finally {
    if (dirname(resolve(temporary)) !== dirname(destination)) throw new Error("Temporary output left its assigned parent.");
    if (existsSync(temporary)) rmSync(temporary, { recursive: true, force: true });
  }
  return packet;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!["--bundle", "--brand", "--out"].includes(args[i]) || !args[i + 1]) throw new Error("Usage: --bundle <brand-handoff-directory> --brand <id> --out <new-directory>");
      options[args[i].slice(2)] = args[i + 1];
    }
    const packet = exportV0Import(options);
    console.log(`Prepared ${packet.brand_id}: ${packet.source_references.length} pinned source identities; native Git mounts disabled; attach verified source bytes. Starter and adoption require review.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
