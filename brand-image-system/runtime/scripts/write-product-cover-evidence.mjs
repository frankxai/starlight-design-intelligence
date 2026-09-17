import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const jobRoot = path.resolve(arg("--job-root", "C:/Users/frank/brands/image-system/jobs/2026-08-17/product-cover-overhaul-v2"));
const mediaJobRoot = path.join(jobRoot, "media-jobs");
fs.mkdirSync(mediaJobRoot, { recursive: true });

const experimentRoot = path.join(repoRoot, "brand-image-system/experiments/2026-08-17-product-cover-overhaul");
const promptSystem = JSON.parse(fs.readFileSync(path.join(experimentRoot, "prompt-system.v2.json"), "utf8"));

function toPortable(value) {
  return value.replaceAll("\\", "/");
}

function output(name) {
  const value = path.join(jobRoot, "exports", name);
  if (!fs.existsSync(value)) throw new Error(`Missing output: ${value}`);
  return toPortable(value);
}

const configs = [
  {
    slug: "frankx-venture-signal-sprint",
    productId: "fx-sprint",
    brandId: "frankx",
    productForm: "sprint",
    title: "Venture Signal Sprint",
    subtitle: "Five-day decision sprint",
    eyebrow: "FP–000 / Decision instrument",
    assetTier: "C",
    sourceMethod: "brand-locked deterministic composition",
    promptVersion: "frankx-sprint-render-v2",
    score: { brandFit: 5, formFit: 5, craft: 4, legibility: 5, truthfulness: 5, campaignUsefulness: 5 },
    brandAssets: {
      canonicalPack: "runtime/brands/frankx/brand-pack.json",
      logoDecision: "Canonical FrankX wordmark copied and non-destructively presentation-cropped; no typed substitute.",
      logos: ["assets/logos/frankx-wordmark.png", "assets/logos/frankx-wordmark-crop.png"],
      fonts: ["Outfit", "Inter", "IBM Plex Mono"],
      colors: ["#050914", "#00D4FF", "#F6FAFF", "#F2B84B"]
    }
  },
  {
    slug: "gencreator-creatorpack",
    productId: "gc-creatorpack",
    brandId: "gencreator",
    productForm: "pack",
    title: "CreatorPack / owned-work loop",
    subtitle: "One owned-work loop that resumes.",
    eyebrow: "Versioned creator instrument",
    assetTier: "C",
    sourceMethod: "brand-locked deterministic composition",
    promptVersion: "gencreator-creatorpack-render-v2",
    score: { brandFit: 5, formFit: 5, craft: 4, legibility: 5, truthfulness: 5, campaignUsefulness: 5 },
    brandAssets: {
      canonicalPack: "runtime/brands/gencreator/brand-pack.json",
      logoDecision: "Canonical GenCreator wordmark and mark used.",
      logos: ["assets/logos/gencreator-wordmark.svg", "assets/logos/gencreator-mark.svg"],
      fonts: ["Sora", "Inter", "IBM Plex Mono"],
      colors: ["#05060A", "#F1F7FF", "#6EA8FE", "#38BDF8", "#34D399"]
    }
  },
  {
    slug: "sis-sovereign-intelligence-starter-kit",
    productId: "sis-kit",
    brandId: "sis",
    productForm: "kit",
    title: "Sovereign Intelligence Starter Kit",
    subtitle: "Own the system. Inspect the proof. Keep the exit.",
    eyebrow: "Sovereign operator kit",
    assetTier: "A",
    sourceMethod: "owned proof media plus deterministic composition",
    promptVersion: "sis-starter-kit-hybrid-v2",
    score: { brandFit: 4, formFit: 5, craft: 5, legibility: 5, truthfulness: 5, campaignUsefulness: 5 },
    brandAssets: {
      canonicalPack: "runtime/brands/sis/brand-pack.json",
      logoDecision: "No canonical logo was verified; use a typographic signature and do not invent a mark.",
      logos: [],
      fonts: ["IBM Plex Sans", "IBM Plex Mono"],
      colors: ["#07090B", "#F3EFE7", "#B89A5A", "#C7AA69"]
    }
  },
  {
    slug: "arcanea-world-bible",
    productId: "ar-bible",
    brandId: "arcanea",
    productForm: "kit",
    title: "World Bible / Project Context Kit",
    subtitle: "Portable world context export",
    eyebrow: "Portable world context",
    assetTier: "B",
    sourceMethod: "premium generated codex source plus deterministic product chrome",
    promptVersion: "arcanea-world-bible-source-v2",
    score: { brandFit: 5, formFit: 5, craft: 5, legibility: 4, truthfulness: 5, campaignUsefulness: 5 },
    brandAssets: {
      canonicalPack: "runtime/brands/arcanea/brand-pack.json",
      logoDecision: "Canonical Arcanea wordmark used on the product rail.",
      logos: ["assets/logos/arcanea-wordmark.svg", "assets/logos/arcanea-logo.svg"],
      fonts: ["Plus Jakarta Sans", "Georgia", "IBM Plex Mono"],
      colors: ["#05040A", "#7FFFD4", "#A78BFA", "#9B59FF", "#C7A86B"]
    },
    generation: {
      modelLane: "codex-imagegen",
      declaredModel: null,
      modelKnown: false,
      capabilityReceipt: "render-receipt.json — runtime image lane returned a saved output path but no model id",
      promptVersion: "arcanea-world-bible-source-v2",
      sourceRole: "non-semantic world-bible source art under deterministic product chrome",
      settings: { requestedAspectRatio: "3:4", finalPublicTextInGeneratedSource: false }
    }
  }
];

const promptLog = {
  jobId: "2026-08-17-product-cover-overhaul-v2",
  promptSystemId: promptSystem.promptSystemId,
  promptSystemPath: toPortable(path.join(experimentRoot, "prompt-system.v2.json")),
  routes: configs.map((config) => ({
    productId: config.productId,
    promptVersion: config.promptVersion,
    route: config.generation?.modelLane ?? "deterministic-only",
    declaredModel: config.generation?.declaredModel ?? null,
    modelReceipt: config.generation?.capabilityReceipt ?? "No image model used.",
    prompt: promptSystem.benchmarkPrompts[config.promptVersion]?.prompt ?? null
  })),
  updatedAt: "2026-08-17"
};
fs.writeFileSync(path.join(jobRoot, "prompt-log.json"), `${JSON.stringify(promptLog, null, 2)}\n`, "utf8");

for (const config of configs) {
  const portrait = output(`${config.slug}.png`);
  const catalog = output(`${config.slug}.webp`);
  const og = output(`${config.slug}-og.png`);
  const scores = config.score;
  const score30 = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const mediaJob = {
    jobId: `2026-08-17-${config.slug}`,
    brandId: config.brandId,
    workflowId: "product-cover",
    productId: config.productId,
    productForm: config.productForm,
    assetRole: "cover-master",
    surface: "product catalog, launch validation, and open graph",
    audience: "The product ICP recorded in the Product Funnel OS catalog.",
    brief: `Create a form-specific validation cover for ${config.title} without inventing release, price, customer, or availability claims.`,
    assetTier: config.assetTier,
    sourceMethod: config.sourceMethod,
    stylePackId: `${config.brandId}-product-cover-v2`,
    rail: "product",
    brandAssets: config.brandAssets,
    exactCopy: {
      title: config.title,
      subtitle: config.subtitle,
      eyebrow: config.eyebrow,
      statusLabel: "Validation concept",
      claims: []
    },
    ...(config.generation ? { generation: config.generation } : {}),
    experiment: {
      experimentId: "2026-08-17-product-cover-overhaul",
      candidateId: `${config.productId}-cover-v2`,
      baselineId: "hermes-product-cover-v1",
      hypothesis: "Form-specific art direction plus canonical identity will outperform the generic cover baseline."
    },
    promptLog: toPortable(path.join(jobRoot, "prompt-log.json")),
    paths: {
      jobRoot: toPortable(jobRoot),
      source: config.brandId === "arcanea" ? [toPortable(path.join(jobRoot, "assets/source/arcanea-world-bible-source.png"))] : [],
      outputs: [portrait, catalog, og],
      evidence: toPortable(path.join(jobRoot, "evidence.json"))
    },
    qa: {
      inspected: true,
      score30,
      notes: "Portrait and open graph exports inspected. This is a local ship candidate pending human approval for public placement.",
      dimensionScores: scores,
      exportInspections: [`${portrait} at 1080x1440`, `${og} at 1200x630`]
    },
    decision: "draft",
    updatedAt: "2026-08-17"
  };
  fs.writeFileSync(path.join(mediaJobRoot, `${config.slug}.json`), `${JSON.stringify(mediaJob, null, 2)}\n`, "utf8");
}

const exportFiles = fs.readdirSync(path.join(jobRoot, "exports")).filter((name) => /\.(png|webp)$/.test(name)).sort();
const evidence = {
  jobId: "2026-08-17-product-cover-overhaul-v2",
  inspected: true,
  inspectionSummary: "Four portrait covers, four open graph crops, and the portfolio overview were visually inspected from actual exports.",
  releaseBoundary: "Local ship candidates only; human approval is required before public placement.",
  artifacts: exportFiles.map((name) => {
    const file = path.join(jobRoot, "exports", name);
    const bytes = fs.readFileSync(file);
    return {
      path: toPortable(file),
      bytes: bytes.byteLength,
      sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      inspected: name.endsWith(".png")
    };
  }),
  updatedAt: new Date().toISOString()
};
fs.writeFileSync(path.join(jobRoot, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

for (const file of ["experiment-ledger.json", "design-loop-evidence.json", "product-asset-portfolio.json"]) {
  fs.copyFileSync(path.join(experimentRoot, file), path.join(jobRoot, file));
}

console.log(`Wrote ${configs.length} media jobs, prompt log, hashed evidence, and tracked experiment receipts to ${jobRoot}`);
