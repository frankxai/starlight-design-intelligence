import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);

if (!args[0]) {
  console.error("Usage: node render-carousel.mjs <data.json> [--root <asset-root>] [--png]");
  process.exit(1);
}

const dataPath = path.resolve(args[0]);
const rootIndex = args.indexOf("--root");
const assetRoot = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : path.dirname(dataPath);
const wantsPng = args.includes("--png");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const outDir = path.join(assetRoot, "crops", "carousel");
fs.mkdirSync(outDir, { recursive: true });

const W = 1080;
const H = 1350;
const ink = data.canvas.ink;
const paper = data.canvas.paper;
const background = data.canvas.background;

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function wrap(value, maxChars) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock({ x, y, width, value, fontSize, lineHeight, family = "Bahnschrift", weight = 400, fill = ink, maxLines = 3, anchor = "start" }) {
  const chars = Math.max(10, Math.floor(width / (fontSize * 0.56)));
  const lines = wrap(value, chars).slice(0, maxLines);
  const spans = lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join("");
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${spans}</text>`;
}

function fileDataUri(relativePath) {
  const resolved = path.resolve(assetRoot, relativePath);
  if (!fs.existsSync(resolved)) return null;
  const ext = path.extname(resolved).toLowerCase();
  const mime = ext === ".png" ? "image/png"
    : ext === ".webp" ? "image/webp"
    : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
    : ext === ".svg" ? "image/svg+xml"
    : null;
  return mime ? `data:${mime};base64,${fs.readFileSync(resolved).toString("base64")}` : null;
}

function sourceLabel(sourceIds) {
  if (!sourceIds?.length) return "";
  return sourceIds.length === 1 ? sourceIds[0] : `${sourceIds[0]} +${sourceIds.length - 1}`;
}

const sourceUri = fileDataUri(data.sourceImage);
if (!sourceUri) throw new Error(`Missing source image: ${path.resolve(assetRoot, data.sourceImage)}`);
const calloutById = new Map(data.callouts.map((item) => [item.id, item]));

function base({ index, eyebrow, title, subtitle = "" }) {
  const titleLines = wrap(title, 31).slice(0, 2);
  const subtitleY = titleLines.length > 1 ? 222 : 166;
  return `
    <rect width="${W}" height="${H}" fill="${background}"/>
    <text x="54" y="50" font-family="Bahnschrift" font-size="17" font-weight="700" letter-spacing="1.1" fill="${ink}" fill-opacity="0.64">${esc(eyebrow)}</text>
    <text x="1026" y="50" text-anchor="end" font-family="Bahnschrift" font-size="17" font-weight="700" fill="${ink}" fill-opacity="0.64">${String(index).padStart(2, "0")} / 05</text>
    ${textBlock({ x: 54, y: 112, width: 950, value: title, fontSize: 54, lineHeight: 58, family: "Cambria", weight: 700, maxLines: 2 })}
    ${subtitle ? textBlock({ x: 56, y: subtitleY, width: 920, value: subtitle, fontSize: 23, lineHeight: 28, weight: 600, maxLines: 2 }) : ""}
  `;
}

function footer(index) {
  return `
    <line x1="54" y1="1292" x2="1026" y2="1292" stroke="${ink}" stroke-opacity="0.18"/>
    <text x="54" y="1324" font-family="Bahnschrift" font-size="14" fill="${ink}" fill-opacity="0.58">Independent field guide · checked 21 August 2026 · sources.json</text>
    <text x="1026" y="1324" text-anchor="end" font-family="Bahnschrift" font-size="14" fill="${ink}" fill-opacity="0.58">No affiliation, ranking, or endorsement implied · ${index}/5</text>
  `;
}

function sourceArt({ x, y, width, height, opacity = 1 }) {
  return `<image href="${sourceUri}" x="${x}" y="${y}" width="${width}" height="${height}" opacity="${opacity}" preserveAspectRatio="xMidYMid meet"/>`;
}

function calloutCard(item, { x, y, width = 500, height = 192, number }) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="${paper}" fill-opacity="0.97" stroke="${ink}" stroke-opacity="0.2" filter="url(#shadow)"/>
    <rect x="${x}" y="${y}" width="11" height="${height}" rx="5.5" fill="${item.color}"/>
    <text x="${x + 30}" y="${y + 45}" font-family="Cambria" font-size="24" font-weight="700" fill="${item.color}">${String(number).padStart(2, "0")}</text>
    ${textBlock({ x: x + 80, y: y + 47, width: width - 112, value: item.title, fontSize: 31, lineHeight: 34, weight: 700, maxLines: 1 })}
    ${textBlock({ x: x + 30, y: y + 94, width: width - 60, value: item.body, fontSize: 22, lineHeight: 28, maxLines: 2 })}
    <text x="${x + width - 28}" y="${y + height - 22}" text-anchor="end" font-family="Bahnschrift" font-size="14" fill="${ink}" fill-opacity="0.54">${esc(sourceLabel(item.sourceIds))}</text>
  `;
}

function darkBand({ x = 54, y, width = 972, height = 146, title, body, sourceIds = [] }) {
  const bodyFont = width < 600 ? 18 : 20;
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="26" fill="${ink}"/>
    <circle cx="${x + 34}" cy="${y + 38}" r="9" fill="#2F6BFF"/>
    ${textBlock({ x: x + 56, y: y + 47, width: width - 90, value: title, fontSize: 26, lineHeight: 29, weight: 700, fill: paper, maxLines: 1 })}
    ${textBlock({ x: x + 28, y: y + 88, width: width - 56, value: body, fontSize: bodyFont, lineHeight: 23, fill: paper, maxLines: 3 })}
    <text x="${x + width - 28}" y="${y + height - 18}" text-anchor="end" font-family="Bahnschrift" font-size="13" fill="${paper}" fill-opacity="0.58">${esc(sourceLabel(sourceIds))}</text>
  `;
}

function providerCard(provider, { x, y }) {
  const width = 472;
  const height = 162;
  const assetUri = provider.asset ? fileDataUri(provider.asset) : null;
  let icon;
  if (assetUri) {
    const isWide = provider.id === "openai";
    icon = `<image href="${assetUri}" x="${x + 24}" y="${isWide ? y + 52 : y + 25}" width="${isWide ? 82 : 82}" height="${isWide ? 24 : 82}" preserveAspectRatio="xMidYMid meet"/>`;
  } else {
    icon = `<rect x="${x + 24}" y="${y + 32}" width="76" height="76" rx="18" fill="${ink}"/><text x="${x + 62}" y="${y + 82}" text-anchor="middle" font-family="Cambria" font-size="26" font-weight="700" fill="${paper}">${esc(provider.name.slice(0, 2))}</text>`;
  }
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="${paper}" stroke="${ink}" stroke-opacity="0.18"/>
    ${icon}
    ${textBlock({ x: x + 132, y: y + 46, width: 306, value: provider.name, fontSize: 29, lineHeight: 32, weight: 700, maxLines: 1 })}
    ${textBlock({ x: x + 132, y: y + 86, width: 306, value: provider.trait, fontSize: 21, lineHeight: 25, maxLines: 3 })}
  `;
}

const slides = [];

slides.push({
  name: "cover",
  body: `
    ${base({ index: 1, eyebrow: "THE ULTIMATE AI ARCHITECTURE", title: "Build the system, not just the model list", subtitle: "A production architecture for multi-agent work" })}
    ${sourceArt({ x: 170, y: 248, width: 740, height: 890 })}
    <rect x="54" y="1014" width="972" height="208" rx="28" fill="${ink}" fill-opacity="0.96" filter="url(#shadow)"/>
    ${textBlock({ x: 86, y: 1066, width: 900, value: "The durable advantage", fontSize: 29, lineHeight: 32, weight: 700, fill: paper, maxLines: 1 })}
    ${textBlock({ x: 86, y: 1112, width: 900, value: "Orchestration, context, trusted action, recovery, and evaluation turn models into a production system.", fontSize: 25, lineHeight: 31, fill: paper, maxLines: 3 })}
    <text x="86" y="1194" font-family="Bahnschrift" font-size="17" font-weight="700" fill="#6EA1FF">SWIPE FOR THE SYSTEM ANATOMY →</text>
    ${footer(1)}
  `
});

const slideTwoItems = ["model-gateway", "agent-control-plane", "multi-agent-workshop"].map((id) => calloutById.get(id));
slides.push({
  name: "orchestration",
  body: `
    ${base({ index: 2, eyebrow: "SYSTEM ANATOMY", title: "Orchestration before autonomy", subtitle: "Route deliberately. Delegate by contract. Stop safely." })}
    ${sourceArt({ x: 385, y: 220, width: 700, height: 890, opacity: 0.94 })}
    ${calloutCard(slideTwoItems[0], { x: 54, y: 270, number: 1 })}
    ${calloutCard(slideTwoItems[1], { x: 54, y: 500, number: 2 })}
    ${calloutCard(slideTwoItems[2], { x: 54, y: 730, number: 3 })}
    ${darkBand({ y: 1012, title: "Operating rule", body: "Use one agent when one agent is enough. Add specialists only when decomposition, tools, or review materially improve the result.", sourceIds: ["anthropic-agents", "openai-orchestration"] })}
    ${footer(2)}
  `
});

const slideThreeItems = ["context-memory", "capability-mesh", "durable-runtime"].map((id) => calloutById.get(id));
slides.push({
  name: "context-action-runtime",
  body: `
    ${base({ index: 3, eyebrow: "SYSTEM ANATOMY", title: "Grounded action needs a runtime", subtitle: "Context enters through contracts; work survives through state." })}
    ${sourceArt({ x: 385, y: 220, width: 700, height: 890, opacity: 0.94 })}
    ${calloutCard(slideThreeItems[0], { x: 54, y: 270, number: 4 })}
    ${calloutCard(slideThreeItems[1], { x: 54, y: 500, number: 5 })}
    ${calloutCard(slideThreeItems[2], { x: 54, y: 730, number: 6 })}
    ${darkBand({ y: 1012, title: "Protocol boundary", body: "MCP connects an AI system to tools and context. A2A coordinates work between independent agents.", sourceIds: ["anthropic-mcp", "google-a2a", "a2a-spec"] })}
    ${footer(3)}
  `
});

const trust = calloutById.get("trust-human-approval");
const evals = calloutById.get("evals-observability");
slides.push({
  name: "trust-learning",
  body: `
    ${base({ index: 4, eyebrow: "SYSTEM ANATOMY", title: "Trust is a control loop", subtitle: "High-impact action is gated; every run becomes evidence." })}
    ${sourceArt({ x: 165, y: 210, width: 750, height: 940, opacity: 0.93 })}
    ${calloutCard(trust, { x: 54, y: 330, width: 520, height: 224, number: 7 })}
    ${calloutCard(evals, { x: 506, y: 650, width: 520, height: 224, number: 8 })}
    ${darkBand({ y: 1012, title: "Reviewed feedback", body: "Traces, evaluations, cost, latency, and incidents inform changes to prompts, routes, tools, policies, and models.", sourceIds: ["openai-tracing", "anthropic-trust", "microsoft-framework"] })}
    ${footer(4)}
  `
});

const providerCards = data.providers.map((provider, index) => providerCard(provider, {
  x: index % 2 === 0 ? 54 : 554,
  y: 280 + Math.floor(index / 2) * 174
})).join("");

slides.push({
  name: "ecosystem-map",
  body: `
    ${base({ index: 5, eyebrow: "ECOSYSTEM LENS · NOT A RANKING", title: "Choose providers and runtimes by role", subtitle: "Providers sit behind the gateway. Protocols and runtimes solve different layers." })}
    ${providerCards}
    ${darkBand({ x: 54, y: 808, width: 472, height: 188, title: data.interoperability[0].title, body: data.interoperability[0].body, sourceIds: data.interoperability[0].sourceIds })}
    ${darkBand({ x: 554, y: 808, width: 472, height: 188, title: data.interoperability[1].title, body: "Microsoft Agent Framework, LangGraph, and CrewAI add workflows, state, durability, memory, HITL, and observability.", sourceIds: data.interoperability[1].sourceIds })}
    <rect x="54" y="1026" width="972" height="192" rx="28" fill="#E9DFD0" stroke="${ink}" stroke-opacity="0.18"/>
    ${textBlock({ x: 82, y: 1082, width: 900, value: "Save the architecture. Audit the claims. Choose the stack per workload.", fontSize: 31, lineHeight: 36, family: "Cambria", weight: 700, maxLines: 2 })}
    ${textBlock({ x: 82, y: 1162, width: 900, value: "Full source ledger, long description, and reusable template are included in the Infogenius production packet.", fontSize: 21, lineHeight: 26, maxLines: 2 })}
    ${footer(5)}
  `
});

let sharp;
if (wantsPng) {
  try {
    sharp = require("sharp");
  } catch {
    console.error("PNG render skipped: sharp is unavailable. SVG slides will still be written.");
    process.exitCode = 2;
  }
}

for (const [index, slide] of slides.entries()) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#2B2722" flood-opacity="0.13"/>
      </filter>
    </defs>
    ${slide.body}
  </svg>`;
  const fileBase = `${String(index + 1).padStart(2, "0")}-${slide.name}`;
  const svgPath = path.join(outDir, `${fileBase}.svg`);
  fs.writeFileSync(svgPath, svg, "utf8");
  console.log(svgPath);
  if (sharp) {
    const pngPath = path.join(outDir, `${fileBase}.png`);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngPath);
    console.log(pngPath);
  }
}
