import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

// Read committed blobs, never a mixture of committed sources and working edits.
export function exportBrandHandoff({ root = process.cwd(), brand, out, revision } = {}) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(brand ?? "")) throw new Error("Supply a known --brand ID.");
  if (!out) throw new Error("Supply a new --out directory.");
  const git = (args, encoding = "utf8") => execFileSync("git", ["-C", root, ...args], { encoding });
  const remote = git(["remote", "get-url", "origin"]).trim();
  const repository = remote.replace(/^https:\/\/github\.com\//, "").replace(/^git@github\.com:/, "").replace(/\.git$/, "");
  if (repository.toLowerCase() !== "frankxai/starlight-design-intelligence") throw new Error("Export only from the canonical design repository's origin.");
  const sha = revision ?? git(["rev-parse", "HEAD"]).trim();
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error("--revision must be a full lowercase commit SHA.");
  if (git(["cat-file", "-t", sha]).trim() !== "commit") throw new Error("Revision must identify a commit.");
  const blob = (path) => git(["show", `${sha}:${path}`], "buffer");
  const json = (path) => JSON.parse(blob(path).toString("utf8"));
  const packPath = `brand-image-system/runtime/brands/${brand}/brand-pack.json`;
  const packBytes = blob(packPath);
  const pack = JSON.parse(packBytes.toString("utf8"));
  const standard = json("portfolio/experience-standard.json");
  const registry = json("portfolio/core-surfaces.json");
  const owners = registry.repositories.filter((r) => r.brand_id === brand);
  if (pack.brandId !== brand || !owners.length) throw new Error("Brand must match a runtime pack and registered product owner.");
  for (const owner of owners) if (!pack.canonicalRepos.some((r) => r.toLowerCase() === owner.repository.toLowerCase())) throw new Error("Runtime pack and registry ownership disagree.");
  const flows = standard.flows.filter((f) => f.brand_id === brand);
  const domainIds = new Set(flows.map((f) => f.domain_id));
  const paths = new Set([packPath, "portfolio/design-toolchain.json", "playbooks/figma-template-pipeline.md", "templates/app-factory/README.md"]);
  const list = (prefix) => git(["ls-tree", "-r", "--name-only", sha, prefix]).trim().split("\n").filter(Boolean);
  for (const path of list(`brand-packs/${brand}/`)) if (path.endsWith(".md")) paths.add(path);
  for (const path of list("portfolio/domains/")) {
    const profile = parse(blob(path).toString("utf8"));
    if (domainIds.has(profile.domain_id)) {
      if (profile.brand_id !== brand) throw new Error("Domain and brand ownership disagree.");
      paths.add(path);
    }
  }
  for (const path of pack.sourceDocs) {
    if (!path.startsWith(`brand-packs/${brand}/`) || path.split("/").includes("..") || !path.endsWith(".md")) throw new Error("Source docs must remain inside the selected brand's document boundary.");
    paths.add(path);
  }
  for (const check of standard.checks) for (const path of check.gate_paths) paths.add(path);
  // Include source hashes for derived slices too, so their authority is inspectable.
  const sourcePaths = [...paths, "portfolio/experience-standard.json", "portfolio/core-surfaces.json"].sort();
  const sources = sourcePaths.map((path) => {
    const bytes = blob(path);
    return { path, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length, content: bytes };
  });
  const destination = resolve(out);
  if (existsSync(destination)) throw new Error("Output directory already exists; choose a new path.");
  const manifest = {
    schema_version: "starlight.brand_handoff.v1",
    status: "source-bundle-for-review",
    brand_id: brand,
    kernel_repository: "frankxai/starlight-design-intelligence",
    kernel_commit_sha: sha,
    brand_pack_path: packPath,
    brand_pack_sha256: createHash("sha256").update(packBytes).digest("hex"),
    product_repositories: owners.map((r) => r.repository),
    sources: sources.map(({ content, ...record }) => record),
    limitations: [
      "Source packaging does not approve an identity or establish production adoption.",
      "No fonts, media binaries, third-party kits or private design-tool identifiers are included.",
      "Figma variables, semantic aliases and components require a product-owned projection and actual flow verification.",
      "Canva Brand Kits and locked templates require approved identity, licensed fonts and inspected exports.",
      "No remote tool is modified; all current owner decisions and unresolved source conflicts must be reconciled before publishing."
    ]
  };
  // Gather all source bytes before creating the destination: missing sources leave no partial bundle.
  mkdirSync(destination, { recursive: true });
  for (const source of sources) if (paths.has(source.path)) {
    const target = join(destination, "sources", source.path);
    mkdirSync(resolve(target, ".."), { recursive: true });
    writeFileSync(target, source.content);
  }
  const adapterPlan = {
    brand_id: brand, source_commit_sha: sha, identity_selection: "unchanged",
    flows, checks: standard.checks,
    reference_applications: standard.references.map((r) => ({ ...r, applications: r.applications.filter((a) => domainIds.has(a.domain_id)) })).filter((r) => r.applications.length),
    upgrade_queue: standard.upgrades.filter((u) => u.domain_ids.some((id) => domainIds.has(id))),
    figma: ["Reconcile the local product contract and owner decision with this pinned pack.", "Generate semantic aliases and named text styles in the product repository; do not infer a full token API from this pack.", "Use the included Figma template pipeline and existing App Factory pointers; ship a native implementation and explicit component/state/asset map with the editable design.", "Validate a desktop and phone flow, then its component API and states before publishing."],
    canva: ["Resolve the kit-to-brand relationship without automatic rename.", "Use the approved type roles, logo assets and contrast pairs; lock identity fields in two pilot templates.", "Inspect actual exports and prove fillable fields separately before automating."]
  };
  for (const [name, value] of [["manifest.json", manifest], ["adapter-plan.json", adapterPlan]]) writeFileSync(join(destination, name), `${JSON.stringify(value, null, 2)}\n`);
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!["--brand", "--out", "--revision"].includes(args[i]) || !args[i + 1]) throw new Error("Usage: --brand <id> --out <new-directory> [--revision <full-sha>]");
      options[args[i].slice(2)] = args[i + 1];
    }
    const manifest = exportBrandHandoff(options);
    console.log(`Exported ${manifest.brand_id} at ${manifest.kernel_commit_sha}: ${manifest.sources.length} hashed source records. Review bundle only; no tool writes or identity approval.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
