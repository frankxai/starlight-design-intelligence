import fs from "node:fs";
import path from "node:path";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const input = arg("--input");
const output = arg("--output");

if (!input || !output) {
  console.error("Usage: node build-product-asset-portfolio.mjs --input <overlay.json> --output <product-asset-portfolio.json>");
  process.exit(2);
}

const source = JSON.parse(fs.readFileSync(path.resolve(input), "utf8"));
if (!Array.isArray(source.slate) || source.slate.length === 0) {
  throw new Error("Input does not contain a non-empty slate array.");
}

const formByKind = {
  architect: "course",
  blueprint: "kit",
  book: "book",
  commons: "platform",
  community: "community",
  course: "course",
  diagnostic: "diagnostic",
  "free-proof": "guide",
  "high-touch": "implementation",
  hold: "internal-hold",
  implementation: "implementation",
  kit: "kit",
  "lead-magnet": "guide",
  mastery: "course",
  "open-core": "platform",
  pack: "pack",
  pdf: "guide",
  platform: "platform",
  retainer: "retainer",
  saas: "saas",
  sprint: "sprint",
  substrate: "platform",
  toolkit: "kit",
  workbook: "workbook"
};

const assetFamilies = {
  book: ["editorial-cover", "thumbnail", "sample-spread", "open-graph"],
  community: ["program-card", "cadence-map", "audience-card", "open-graph"],
  course: ["course-card", "curriculum-map", "lesson-proof", "open-graph"],
  diagnostic: ["instrument-cover", "process-strip", "output-preview", "open-graph"],
  guide: ["document-cover", "interior-preview", "download-card", "open-graph"],
  implementation: ["offer-cover", "scope-map", "deliverable-stack", "application-card"],
  kit: ["kit-cover", "contents-card", "mechanism-infographic", "delivery-preview"],
  pack: ["pack-cover", "contents-card", "owned-work-mechanism", "delivery-preview"],
  platform: ["product-card", "verified-ui-proof", "mechanism-diagram", "open-graph"],
  retainer: ["program-card", "cadence-map", "deliverable-proof", "application-card"],
  saas: ["product-card", "desktop-proof", "mobile-proof", "open-graph"],
  sprint: ["offer-cover", "process-strip", "deliverable-stack", "scope-page-open-graph"],
  workbook: ["workbook-cover", "exercise-preview", "completion-artifact", "open-graph"],
  "internal-hold": ["internal-registry-tile"]
};

const publicStatuses = new Set(["live", "open-core"]);
const internalStatuses = new Set(["unverified", "later", "hold", "hold-rights", "hold-claims"]);

function releaseState(item) {
  if (item.kind === "hold" || internalStatuses.has(item.status)) return "internal-only";
  if (publicStatuses.has(item.status)) return "public";
  return "validation";
}

function coverPolicy(state) {
  if (state === "internal-only") return "Internal registry tile only; show the blocking state and do not create launch theater.";
  if (state === "validation") return "Concept/validation cover allowed with exact status; no price, availability, customer, or launch claim.";
  return "Proof-first public cover; use verified product state and approved public copy.";
}

const brands = {
  frankx: {
    name: "FrankX",
    brandPack: "brand-image-system/runtime/brands/frankx/brand-pack.json",
    canonicalLogos: [
      "frankx.ai-vercel-website/public/images/brand/logo-full-v2.png",
      "frankx.ai-vercel-website/public/images/brand/logo-mark-v2.png"
    ],
    fonts: ["Outfit", "Inter", "IBM Plex Mono"],
    colors: ["#050914", "#00D4FF", "#F6FAFF", "#F2B84B"],
    identityRule: "Use the actual cyan FrankX assets; never type a substitute wordmark."
  },
  gencreator: {
    name: "GenCreator",
    brandPack: "brand-image-system/runtime/brands/gencreator/brand-pack.json",
    canonicalLogos: [
      "gencreator.ai/public/brand/gencreator-wordmark.svg",
      "gencreator.ai/public/brand/gencreator-mark.svg"
    ],
    fonts: ["Inter", "Sora"],
    colors: ["#05060A", "#F1F7FF", "#6EA8FE", "#38BDF8", "#34D399"],
    identityRule: "Use the canonical wordmark and mark; center the owned-work mechanism."
  },
  sis: {
    name: "Starlight Intelligence",
    brandPack: "brand-image-system/runtime/brands/sis/brand-pack.json",
    canonicalLogos: [],
    fonts: ["IBM Plex Sans", "IBM Plex Mono"],
    colors: ["#07090B", "#E7E0D2", "#B89A5A", "#8EA6A0"],
    identityRule: "No canonical logo was verified in this experiment. Use a typographic signature; do not invent a mark."
  },
  arcanea: {
    name: "Arcanea",
    brandPack: "brand-image-system/runtime/brands/arcanea/brand-pack.json",
    canonicalLogos: [
      "arcanea-ai-app/apps/web/public/brand/arcanea-wordmark.svg",
      "arcanea-ai-app/apps/web/public/brand/arcanea-logo.svg"
    ],
    fonts: ["Plus Jakarta Sans", "Georgia"],
    colors: ["#05040A", "#7FFFD4", "#A78BFA", "#9B59FF", "#C7A86B"],
    identityRule: "Use canonical product chrome; generated world media remains a source layer."
  }
};

const products = source.slate.map((item) => {
  const productForm = formByKind[item.kind];
  if (!productForm) throw new Error(`No form mapping for kind: ${item.kind}`);
  const state = releaseState(item);
  return {
    id: item.id,
    brandId: item.brand,
    name: item.name,
    sourceKind: item.kind,
    productForm,
    status: item.status,
    commercialState: item.commercial_state ?? null,
    releaseState: state,
    coverPolicy: coverPolicy(state),
    targetUrl: item.target_url ?? item.live_url ?? null,
    assetFamilies: assetFamilies[productForm]
  };
});

const portfolio = {
  $schema: "../../runtime/schemas/product-asset-portfolio.schema.json",
  portfolioId: "hermes-product-slate-2026-08-17",
  source: path.resolve(input).replaceAll("\\", "/"),
  scope: `Complete classification of the ${products.length}-item slate supplied to the audited Hermes Product Funnel OS; not an exhaustive claim over every estate idea.`,
  summary: {
    productCount: products.length,
    byBrand: Object.fromEntries(Object.keys(brands).map((brandId) => [brandId, products.filter((p) => p.brandId === brandId).length])),
    byReleaseState: Object.fromEntries(["public", "validation", "internal-only"].map((state) => [state, products.filter((p) => p.releaseState === state).length]))
  },
  brands,
  products,
  assetFamilies,
  updatedAt: "2026-08-17"
};

fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(path.resolve(output), `${JSON.stringify(portfolio, null, 2)}\n`, "utf8");
console.log(`Wrote ${products.length} products to ${path.resolve(output)}`);
