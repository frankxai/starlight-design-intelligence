#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const root = process.cwd();
const captureRoot = process.argv[2];
if (!captureRoot) {
  console.error("Usage: node scripts/import-browser-observations.mjs <capture-metadata-directory>");
  process.exit(2);
}

const registry = parseYaml(readFileSync(join(root, "observatory/registry/targets.yaml"), "utf8"));
const rights = registry.rights.default;
const captureFiles = [
  "linear.json",
  "stripe.json",
  "vercel.json",
  "raycast.json",
  "anthropic.json",
  "google-deepmind.json",
  "runway.json",
  "cosmos.json",
  "canva.json",
  "beehiiv.json",
  "kajabi.json",
  "maven.json",
  "reforge.json",
  "league-universe.json",
  "circle.json",
  "luma.json",
  "othership.json",
  "maven-replacement.json",
  "corrected-wave-a.json",
  "corrected-wave-b.json",
  "corrected-wave-c.json",
  "beehiiv-replacement.json"
];

const captures = new Map();
for (const filename of captureFiles) {
  const path = join(captureRoot, filename);
  let rows;
  try {
    rows = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") continue;
    throw error;
  }
  for (const row of rows) {
    if (!row.ok) continue;
    captures.set(`${row.target_id}:${row.surface_id}`, row);
  }
}

function stableTag(timestamp) {
  return timestamp.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "z").toLowerCase();
}

function address(artifact) {
  return `sha256/${artifact.sha256.slice(0, 2)}/${artifact.sha256}.${artifact.ext}`;
}

function pageState(row) {
  const headings = (row.observations?.headings ?? []).map((heading) => heading.text).join(" ");
  const signal = `${row.title ?? ""} ${headings}`;
  if (/404|page not found|page doesn.?t exist|we probably shouldn.?t be here|profile not found/i.test(signal)) {
    return "not-found-content";
  }
  if (!(row.title || headings.trim())) return "empty-content";
  return "loaded";
}

function finding(targetId, slug, kind, statement, confidence, snapshotIds, data = undefined) {
  return {
    finding_id: `${targetId}.${slug}`,
    kind,
    statement,
    confidence,
    evidence_snapshot_ids: snapshotIds,
    ...(data ? { data } : {}),
    rights_safe_abstraction: true
  };
}

function topValues(rows, key, limit = 8) {
  const counts = new Map();
  for (const row of rows) {
    for (const value of row.observations?.foundations?.[key] ?? []) {
      counts.set(value.value, (counts.get(value.value) ?? 0) + value.count);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function compactTexts(rows, key, limit = 12) {
  const values = rows.flatMap((row) => row.observations?.[key] ?? []);
  const text = values.map((value) => (typeof value === "string" ? value : value.text)).filter(Boolean);
  return [...new Set(text)].slice(0, limit);
}

function extractionFor(target, rows, snapshotIds) {
  const all = snapshotIds;
  const proofRow = rows.find((row) => row.surface_id === "proof");
  const loadedRows = rows.filter((row) => pageState(row) === "loaded");
  const headings = compactTexts(loadedRows, "headings", 10);
  const ctas = compactTexts(loadedRows, "ctas", 10);
  const colors = topValues(loadedRows, "colors");
  const backgrounds = topValues(loadedRows, "backgrounds");
  const fonts = topValues(loadedRows, "fonts", 5);
  const fontSizes = topValues(loadedRows, "fontSizes", 8);
  const radii = topValues(loadedRows, "radii", 8);
  const shadows = topValues(loadedRows, "shadows", 5);
  const spacing = topValues(loadedRows, "spacing", 8);
  const accessibility = loadedRows.map((row) => ({
    surface_id: row.surface_id,
    ...row.observations.accessibility
  }));
  const motion = loadedRows.map((row) => ({
    surface_id: row.surface_id,
    ...row.observations.motion
  }));
  const unavailable = rows.filter((row) => pageState(row) !== "loaded");

  return {
    $schema: "../../../schemas/design-extraction.schema.json",
    schema_version: "starlight.design_extraction.v1",
    extraction_id: `extraction.${target.target_id}.wave-1.20260902`,
    target_id: target.target_id,
    snapshot_ids: snapshotIds,
    findings: {
      foundations: [
        finding(
          target.target_id,
          "foundations.observed",
          "observed",
          `Computed styles were normalized across ${loadedRows.length} loaded public surfaces; the values are observations, not reusable source tokens.`,
          0.95,
          all,
          { colors, backgrounds, fonts, font_sizes: fontSizes, radii, shadows, spacing, grid: "not measured", density: "surface element counts retained in snapshot observations", breakpoints: "not established from one fixed viewport" }
        )
      ],
      components: [
        finding(
          target.target_id,
          "components.observed",
          "observed",
          `Public surfaces exposed repeated navigation and action labels including: ${ctas.slice(0, 6).join("; ") || "no stable labels captured"}.`,
          0.86,
          all,
          { sampled_action_labels: ctas }
        )
      ],
      page_anatomy: [
        finding(
          target.target_id,
          "anatomy.observed",
          "observed",
          `The selected set covers homepage, product/category overview, feature, conversion, and proof roles; ${loadedRows.length} of five returned usable page content.`,
          0.98,
          all,
          { surfaces: rows.map((row) => ({ surface_id: row.surface_id, title: row.title, page_state: pageState(row), scroll_height: row.observations?.scrollHeight })) }
        )
      ],
      content_hierarchy: [
        finding(
          target.target_id,
          "hierarchy.observed",
          "observed",
          `The captured hierarchy starts from explicit page headings such as: ${headings.slice(0, 4).join("; ") || "no stable heading text captured"}.`,
          0.9,
          all,
          { sampled_headings: headings }
        )
      ],
      cta_behavior: [
        finding(
          target.target_id,
          "cta.inferred",
          "inferred",
          "Repeated action labels suggest a persistent path from explanation toward a bounded signup, purchase, or sales action; click outcomes were not exercised in this pass.",
          0.66,
          all,
          { sampled_action_labels: ctas }
        )
      ],
      proof_patterns: [
        finding(
          target.target_id,
          "proof.observed",
          "observed",
          `The selected proof surface is titled “${proofRow?.title || "untitled"}” and exposes ${proofRow?.observations?.headings?.length ?? 0} heading nodes in the loaded DOM.`,
          pageState(proofRow ?? {}) === "loaded" ? 0.9 : 0.4,
          proofRow ? [snapshotIds[rows.indexOf(proofRow)]] : [],
          { page_state: proofRow ? pageState(proofRow) : "missing", sampled_headings: (proofRow?.observations?.headings ?? []).slice(0, 8) }
        )
      ],
      responsive_transformations: [
        finding(
          target.target_id,
          "responsive.pending",
          "inferred",
          "Responsive transformations are not established: the cloud browser exposed one fixed desktop viewport and exact 390 px and 320 px evidence remains pending.",
          0.01,
          [],
          { required_widths: [1440, 390, 320], observed_width: rows[0]?.viewport?.width ?? null }
        )
      ],
      motion: [
        finding(
          target.target_id,
          "motion.observed",
          "observed",
          "DOM inspection counted active CSS animation and transition declarations at rest; this does not establish interaction choreography.",
          0.72,
          all,
          { surfaces: motion }
        )
      ],
      reduced_motion: [
        finding(
          target.target_id,
          "reduced-motion.pending",
          "inferred",
          "Reduced-motion behavior was not emulated and must be verified before any motion observation can become implementation guidance.",
          0.01,
          [],
          { status: "not-tested" }
        )
      ],
      accessibility: [
        finding(
          target.target_id,
          "accessibility.observed",
          "observed",
          "DOM structure was inspected for headings, landmarks, image alternative text presence, and unnamed buttons; this is a structural sample, not a full accessibility audit.",
          0.88,
          all,
          { surfaces: accessibility }
        )
      ]
    },
    anti_patterns: [
      ...(unavailable.length
        ? [finding(
            target.target_id,
            "anti.unavailable-route",
            "observed",
            `One or more selected public routes returned missing or empty content: ${unavailable.map((row) => row.surface_id).join(", ")}.`,
            0.99,
            unavailable.map((row) => snapshotIds[rows.indexOf(row)]),
            { affected_surfaces: unavailable.map((row) => ({ surface_id: row.surface_id, page_state: pageState(row) })) }
          )]
        : []),
      finding(
        target.target_id,
        "anti.density-risk",
        "inferred",
        "Large inventories of equal-weight links or cards can obscure the primary decision when hierarchy does not visibly narrow the next action.",
        0.55,
        all
      )
    ],
    category_saturation: [
      finding(
        target.target_id,
        "saturation.category",
        "inferred",
        "Dark gradients, oversized declarative headlines, pill controls, logo walls, and undifferentiated feature-card grids are highly saturated across the reference category.",
        0.63,
        all
      )
    ],
    pattern_candidates: [
      "pattern.outcome-led-entry.v1",
      "pattern.progressive-proof.v1",
      "pattern.bounded-conversion.v1",
      "pattern.editorial-depth-break.v1",
      "pattern.category-card-wall-saturation.v1"
    ],
    reviewed_at: "2026-09-02"
  };
}

const targetsRoot = join(root, "observatory/targets");
mkdirSync(targetsRoot, { recursive: true });
for (const entry of readdirSync(targetsRoot, { withFileTypes: true })) {
  if (entry.isDirectory()) rmSync(join(targetsRoot, entry.name), { recursive: true, force: true });
}

const ledger = [];
const status = {
  schema_version: "starlight.observatory_wave_status.v1",
  wave_id: "wave-1.20260902",
  generated_at: "2026-09-02T00:00:00Z",
  required_viewports: [1440, 390, 320],
  observed_viewport: { width: 1363, height: 936, dpr: 1 },
  exact_viewport_status: "pending",
  raw_storage_status: "pending-private-storage",
  targets: []
};

for (const target of registry.targets) {
  const directory = join(targetsRoot, target.target_id);
  const snapshotsDirectory = join(directory, "snapshots");
  mkdirSync(snapshotsDirectory, { recursive: true });
  writeFileSync(
    join(directory, "target.yaml"),
    stringifyYaml({
      $schema: "../../../schemas/design-research-target.schema.json",
      schema_version: "starlight.design_research_target.v1",
      target_id: target.target_id,
      display_name: target.display_name,
      source_owner: target.source_owner,
      canonical_url: target.canonical_url,
      why: target.why,
      capture_policy: registry.default_capture_policy,
      surfaces: target.surfaces,
      rights
    })
  );

  const rows = [];
  const snapshotIds = [];
  for (const surface of target.surfaces) {
    const row = captures.get(`${target.target_id}:${surface.surface_id}`);
    if (!row) throw new Error(`Missing browser observation for ${target.target_id}/${surface.surface_id}`);
    rows.push(row);
    const snapshotId = `snapshot.${target.target_id}.${surface.surface_id}.browser-observed.${stableTag(row.captured_at)}`;
    snapshotIds.push(snapshotId);
    const screenshot = {
      sha256: row.screenshot.sha256,
      bytes: row.screenshot.bytes,
      mime: row.screenshot.mime,
      width: row.screenshot.dimensions.width,
      height: row.screenshot.dimensions.height,
      content_address: address(row.screenshot),
      storage_status: "pending-private-storage"
    };
    const html = {
      sha256: row.html.sha256,
      bytes: row.html.bytes,
      mime: row.html.mime,
      content_address: address(row.html),
      storage_status: "pending-private-storage"
    };
    const manifest = {
      $schema: "../../../../schemas/design-snapshot-manifest.schema.json",
      schema_version: "starlight.design_snapshot_manifest.v1",
      snapshot_id: snapshotId,
      target_id: target.target_id,
      surface_id: surface.surface_id,
      captured_at: row.captured_at,
      locale: row.locale || "und",
      url: surface.url,
      route: new URL(surface.url).pathname,
      viewport: row.viewport,
      tool: { name: "codex-cloud-browser", version: "2026-09-02", method: "browser" },
      response: {
        status: null,
        status_source: "browser-api-unavailable",
        final_url: row.final_url,
        title: row.title || "",
        observed_page_state: pageState(row)
      },
      artifacts: { screenshot, html },
      content_hash: row.content_hash,
      rights,
      provenance: {
        source_owner: target.source_owner,
        captured_by: "Codex design-research operator",
        capture_purpose: "design-research-reference-only"
      },
      inspection: {
        menu_state: "not-tested",
        motion_state: "observed",
        reduced_motion: "not-tested",
        accessibility_structure: "observed"
      }
    };
    writeFileSync(join(snapshotsDirectory, `${snapshotId}.json`), JSON.stringify(manifest, null, 2) + "\n");
    ledger.push({
      snapshot_id: snapshotId,
      target_id: target.target_id,
      surface_id: surface.surface_id,
      source_owner: target.source_owner,
      capture_date: row.captured_at,
      rights_state: rights.state,
      allowed_use: rights.allowed_use,
      content_hash: row.content_hash,
      artifact_hashes: { screenshot: row.screenshot.sha256, html: row.html.sha256 },
      storage_status: "pending-private-storage"
    });
  }

  const extraction = extractionFor(target, rows, snapshotIds);
  writeFileSync(join(directory, "extraction.yaml"), stringifyYaml(extraction));
  status.targets.push({
    target_id: target.target_id,
    selected_surfaces: 5,
    browser_observed_snapshots: 5,
    loaded_surfaces: rows.filter((row) => pageState(row) === "loaded").length,
    source_defect_surfaces: rows.filter((row) => pageState(row) !== "loaded").map((row) => row.surface_id),
    exact_viewports_captured: [],
    pending_viewports: [1440, 390, 320]
  });
}

writeFileSync(
  join(root, "observatory/source-ledger.jsonl"),
  ledger.map((entry) => JSON.stringify(entry)).join("\n") + "\n"
);
writeFileSync(join(root, "observatory/wave-1-status.yaml"), stringifyYaml(status));
console.log(`Imported ${ledger.length} browser-observed snapshot manifests for ${registry.targets.length} targets.`);
