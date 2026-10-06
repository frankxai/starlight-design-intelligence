import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const read = path => JSON.parse(readFileSync(path, "utf8"));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const schema = ajv.compile(read(resolve(root, "schemas/content-asset-atlas.schema.json")));

export function validateAtlas(atlas, previous) {
  const errors = [];
  if (!schema(atlas)) return schema.errors.map(e => `${e.instancePath || "/"}: ${e.message}`);
  const index = new Map();
  for (const kind of ["assets", "contents", "lessons", "screens", "releases"]) {
    for (const entity of atlas[kind]) {
      if (index.has(entity.id)) errors.push(`Duplicate identity: ${entity.id}`);
      index.set(entity.id, { kind, entity });
    }
  }
  const lookup = (id, kind) => {
    const item = index.get(id);
    if (!item || item.kind !== kind) errors.push(`Missing ${kind} reference: ${id}`);
    return item?.kind === kind ? item.entity : null;
  };
  for (const kind of ["assets", "contents"]) {
    for (const entity of atlas[kind]) {
      if (new Set(entity.versions.map(v => v.sha256)).size !== entity.versions.length) errors.push(`Duplicate version hash: ${entity.id}`);
    }
  }
  for (const content of atlas.contents) {
    for (const version of content.versions) for (const ref of version.assets) {
      const asset = lookup(ref.asset_id, "assets");
      if (asset && !asset.versions.some(v => v.sha256 === ref.sha256)) errors.push(`Unknown rendition: ${ref.asset_id}:${ref.sha256}`);
      if (asset && asset.brand !== content.brand) errors.push(`Cross-brand asset requires a separate licensed record: ${content.id}`);
    }
  }
  for (const lesson of atlas.lessons) {
    const content = lookup(lesson.content_id, "contents");
    if (content?.kind !== "lesson" && !lesson.fragment) errors.push(`Embedded lesson requires a content fragment: ${lesson.id}`);
  }
  for (const screen of atlas.screens) {
    for (const id of screen.content_ids) lookup(id, "contents");
    if (screen.figma.status === "mapped" && (!screen.figma.file_key || !screen.figma.node_id)) errors.push(`Mapped screen lacks Figma identity: ${screen.id}`);
    if (screen.figma.status !== "mapped" && (screen.figma.file_key || screen.figma.node_id)) errors.push(`Unverified Figma identity must remain null: ${screen.id}`);
  }
  for (const release of atlas.releases) {
    const pins = release.content_pins.map(p => p.content_id);
    if (new Set(pins).size !== pins.length) errors.push(`Duplicate content pin: ${release.id}`);
    for (const pin of release.content_pins) {
      const content = lookup(pin.content_id, "contents");
      if (content && !content.versions.some(v => v.sha256 === pin.sha256)) errors.push(`Unknown content version: ${pin.content_id}`);
    }
    const screenContents = new Set();
    for (const id of release.screen_ids) {
      const screen = lookup(id, "screens");
      for (const contentId of screen?.content_ids ?? []) screenContents.add(contentId);
    }
    for (const id of screenContents) if (!pins.includes(id)) errors.push(`Released screen content is unpinned: ${id}`);
    for (const id of pins) if (!screenContents.has(id)) errors.push(`Release pin has no screen: ${id}`);
    if (release.status === "evidence-recorded") {
      for (const id of release.screen_ids) {
        const screen = index.get(id)?.entity;
        if (screen?.figma.status !== "mapped") errors.push(`Verified release lacks Figma mapping: ${id}`);
      }
      if (!release.evidence_url) errors.push(`Verified release lacks evidence: ${release.id}`);
      for (const pin of release.content_pins) {
        const content = index.get(pin.content_id)?.entity;
        const contentVersion = content?.versions.find(v => v.sha256 === pin.sha256);
        for (const ref of contentVersion?.assets ?? []) {
          const version = index.get(ref.asset_id)?.entity.versions.find(v => v.sha256 === ref.sha256);
          if (version?.approval.status !== "approved") errors.push(`Verified release lacks asset approval: ${ref.asset_id}`);
        }
      }
    }
  }
  if (previous) {
    const previousErrors = validateAtlas(previous);
    if (previousErrors.length) return [...errors, "Previous registry is invalid", ...previousErrors];
    for (const kind of ["assets", "contents"]) {
      for (const old of previous[kind]) {
        const current = index.get(old.id)?.entity;
        if (current && (current.brand !== old.brand || current.kind !== old.kind || JSON.stringify(current.rights) !== JSON.stringify(old.rights))) errors.push(`Historical identity metadata changed: ${old.id}`);
        for (const version of old.versions) {
          const kept = current?.versions.find(v => v.sha256 === version.sha256);
          const promoted = kind === "assets" && kept && version.approval.status === "source-reviewed" && kept.approval.status === "approved" &&
            Object.entries(version.approval).every(([key, value]) => key === "status" || kept.approval[key] === value) &&
            JSON.stringify({ ...kept, approval: version.approval }) === JSON.stringify(version);
          if (!kept || (!promoted && JSON.stringify(kept) !== JSON.stringify(version))) errors.push(`Immutable version changed or removed: ${old.id}:${version.sha256}`);
        }
      }
    }
    for (const release of previous.releases) {
      const current = index.get(release.id)?.entity;
      if (!current || JSON.stringify(current) !== JSON.stringify(release)) errors.push(`Release changed or removed: ${release.id}`);
    }
  }
  return errors;
}

export function usage(atlas) {
  const errors = validateAtlas(atlas);
  if (errors.length) throw new Error(errors.join("\n"));
  return atlas.assets.map(asset => ({
    asset_id: asset.id,
    placements: atlas.contents.flatMap(content => content.versions.flatMap(version => version.assets.filter(ref => ref.asset_id === asset.id).map(ref => ({
      content_id: content.id, content_sha256: version.sha256, rendition_sha256: ref.sha256, role: ref.role,
      lesson_ids: atlas.lessons.filter(l => l.content_id === content.id).map(l => l.id),
      screen_ids: atlas.screens.filter(s => s.content_ids.includes(content.id)).map(s => s.id)
    }))))
  }));
}

export function refreshQueue(atlas) {
  const errors = validateAtlas(atlas);
  if (errors.length) throw new Error(errors.join("\n"));
  return atlas.screens.filter(s => s.figma.status !== "mapped").map(s => ({
    screen_id: s.id, route: s.route, viewport: s.viewport, section: "Production",
    reason: s.figma.reason, action: "Capture and inspect destination, then record exact node identity; preserve Exploration and Approved."
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [command, file, baseline, output] = process.argv.slice(2);
    if (!file || !["validate", "usage", "queue", "compare"].includes(command)) throw new Error("Usage: node scripts/content-asset-atlas.mjs validate|usage|queue <registry.json> or compare <registry.json> <previous.json> [receipt.json]");
    const atlas = read(file);
    const errors = validateAtlas(atlas, command === "compare" ? read(baseline) : undefined);
    if (errors.length) throw new Error(errors.join("\n"));
    const result = command === "usage" ? usage(atlas) : command === "queue" ? refreshQueue(atlas) : {
      status: "REGISTRY_VALID_ONLY", registry_sha256: digest(readFileSync(file)),
      counts: Object.fromEntries(["assets", "contents", "lessons", "screens", "releases"].map(k => [k, atlas[k].length])),
      figma_pending: refreshQueue(atlas).length,
      limitation: "Structural and supplied-identity checks only; not proof of approval, live bytes, browser rendering or deployment."
    };
    const text = JSON.stringify(result, null, 2) + "\n";
    if (output) writeFileSync(output, text, { flag: "wx" });
    console.log(text.trim());
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
