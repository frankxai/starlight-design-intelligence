import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);

if (!args[0]) {
  console.error("Usage: node render.mjs <data.json> [--root <asset-root>] [--png]");
  process.exit(1);
}

const dataPath = path.resolve(args[0]);
const rootIndex = args.indexOf("--root");
const assetRoot = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : path.dirname(dataPath);
const wantsPng = args.includes("--png");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

if (data.contractVersion !== "infogenius-social.v1") {
  throw new Error(`Unsupported contractVersion: ${data.contractVersion}`);
}

const W = data.canvas.width;
const H = data.canvas.height;
const outDir = path.join(assetRoot, "masters");
fs.mkdirSync(outDir, { recursive: true });

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

function sourceLabel(sourceIds) {
  if (!sourceIds?.length) return "";
  return sourceIds.length === 1 ? sourceIds[0] : `${sourceIds[0]} +${sourceIds.length - 1}`;
}

function textBlock({ x, y, width, value, fontSize, lineHeight, family = "Bahnschrift", weight = 400, fill, maxLines = 3, anchor = "start" }) {
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
  if (!mime) return null;
  return `data:${mime};base64,${fs.readFileSync(resolved).toString("base64")}`;
}

const sourceUri = fileDataUri(data.sourceImage);
if (!sourceUri) throw new Error(`Missing source image: ${path.resolve(assetRoot, data.sourceImage)}`);

const providerById = new Map(data.providers.map((provider) => [provider.id, provider]));
const paper = data.canvas.paper;
const ink = data.canvas.ink;
const background = data.canvas.background;

const calloutSvg = data.callouts.map((item) => {
  const boxWidth = 360;
  const boxHeight = 118;
  const x = item.side === "left" ? 54 : W - 54 - boxWidth;
  const lineStartX = item.side === "left" ? x + boxWidth : x;
  const elbowX = item.side === "left" ? lineStartX + 38 : lineStartX - 38;
  const [anchorX, anchorY] = item.anchor;
  const titleX = x + 22;
  const bodyX = x + 22;
  const sourceX = x + boxWidth - 20;
  return `
    <path d="M ${lineStartX} ${item.y + 59} L ${elbowX} ${item.y + 59} L ${anchorX} ${anchorY}" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${anchorX}" cy="${anchorY}" r="6" fill="${paper}" stroke="${item.color}" stroke-width="3"/>
    <rect x="${x}" y="${item.y}" width="${boxWidth}" height="${boxHeight}" rx="16" fill="${paper}" fill-opacity="0.94" stroke="${ink}" stroke-opacity="0.22"/>
    <rect x="${x}" y="${item.y}" width="9" height="${boxHeight}" rx="4.5" fill="${item.color}"/>
    ${textBlock({ x: titleX, y: item.y + 34, width: boxWidth - 54, value: item.title, fontSize: 24, lineHeight: 27, weight: 700, fill: ink, maxLines: 1 })}
    ${textBlock({ x: bodyX, y: item.y + 66, width: boxWidth - 50, value: item.body, fontSize: 16, lineHeight: 20, fill: ink, maxLines: 2 })}
    <text x="${sourceX}" y="${item.y + 103}" text-anchor="end" font-family="Bahnschrift" font-size="11" fill="${ink}" fill-opacity="0.58">${esc(sourceLabel(item.sourceIds))}</text>
  `;
}).join("");

const gatewaySvg = data.gateway.slots.map((slot) => {
  const provider = providerById.get(slot.providerId);
  if (!provider) throw new Error(`Gateway slot references unknown provider: ${slot.providerId}`);
  const assetUri = provider.asset ? fileDataUri(provider.asset) : null;
  const y = 344;
  if (assetUri) {
    if (provider.id === "openai") {
      return `<image href="${assetUri}" x="${slot.x - 58}" y="${y - 13}" width="116" height="26" preserveAspectRatio="xMidYMid meet"/>`;
    }
    const width = 44;
    const height = provider.id === "mistral" ? 34 : 44;
    return `<image href="${assetUri}" x="${slot.x - width / 2}" y="${y - 24}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
      <text x="${slot.x}" y="${y + 32}" text-anchor="middle" font-family="Bahnschrift" font-size="15" font-weight="700" fill="${ink}">${esc(provider.name)}</text>`;
  }
  return `<text x="${slot.x}" y="${y + 7}" text-anchor="middle" font-family="Bahnschrift" font-size="20" font-weight="700" fill="${ink}">${esc(provider.name)}</text>`;
}).join("");

const interoperabilitySvg = data.interoperability.map((item, index) => {
  const x = index === 0 ? 54 : 735;
  const accent = index === 0 ? "#2F6BFF" : "#E5542E";
  return `
    <rect x="${x}" y="1280" width="651" height="116" rx="18" fill="${ink}"/>
    <circle cx="${x + 34}" cy="1316" r="9" fill="${accent}"/>
    ${textBlock({ x: x + 54, y: 1324, width: 560, value: item.title, fontSize: 22, lineHeight: 24, weight: 700, fill: paper, maxLines: 1 })}
    ${textBlock({ x: x + 28, y: 1358, width: 590, value: item.body, fontSize: 15, lineHeight: 18, fill: paper, maxLines: 2 })}
    <text x="${x + 623}" y="1390" text-anchor="end" font-family="Bahnschrift" font-size="11" fill="${paper}" fill-opacity="0.62">${esc(sourceLabel(item.sourceIds))}</text>
  `;
}).join("");

const providerCardsSvg = data.providers.map((provider, index) => {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const x = 54 + col * 444;
  const y = 1472 + row * 112;
  const cardWidth = 416;
  const cardHeight = 98;
  const assetUri = provider.asset ? fileDataUri(provider.asset) : null;
  const isWide = provider.id === "openai";
  const icon = assetUri
    ? `<image href="${assetUri}" x="${x + 16}" y="${isWide ? y + 34 : y + 17}" width="${isWide ? 64 : 56}" height="${isWide ? 18 : 56}" preserveAspectRatio="xMidYMid meet"/>`
    : `<rect x="${x + 18}" y="${y + 20}" width="50" height="50" rx="12" fill="${ink}"/><text x="${x + 43}" y="${y + 53}" text-anchor="middle" font-family="Cambria" font-size="20" font-weight="700" fill="${paper}">${esc(provider.name.slice(0, 2))}</text>`;
  return `
    <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="17" fill="${paper}" stroke="${ink}" stroke-opacity="0.18"/>
    ${icon}
    ${textBlock({ x: x + 88, y: y + 31, width: 292, value: provider.name, fontSize: 22, lineHeight: 24, weight: 700, fill: ink, maxLines: 1 })}
    ${textBlock({ x: x + 88, y: y + 61, width: 298, value: provider.trait, fontSize: 16, lineHeight: 19, fill: ink, maxLines: 2 })}
  `;
}).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="headerFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${background}" stop-opacity="1"/>
      <stop offset="82%" stop-color="${background}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${background}" stop-opacity="0"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#2B2722" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${background}"/>
  <image href="${sourceUri}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="0" y="0" width="${W}" height="310" fill="url(#headerFade)"/>

  <text x="56" y="62" font-family="Bahnschrift" font-size="18" font-weight="600" letter-spacing="1.2" fill="${ink}" fill-opacity="0.68">${esc(data.header.eyebrow)}</text>
  ${textBlock({ x: 56, y: 134, width: 1160, value: data.header.title, fontSize: 70, lineHeight: 74, family: "Cambria", weight: 700, fill: ink, maxLines: 1 })}
  ${textBlock({ x: 58, y: 184, width: 1050, value: data.header.subtitle, fontSize: 29, lineHeight: 33, family: "Bahnschrift", weight: 600, fill: ink, maxLines: 1 })}
  ${textBlock({ x: 58, y: 226, width: 1180, value: data.header.thesis, fontSize: 20, lineHeight: 25, family: "Bahnschrift", fill: ink, maxLines: 2 })}

  <rect x="1118" y="66" width="266" height="102" rx="16" fill="${ink}" filter="url(#softShadow)"/>
  <text x="1251" y="99" text-anchor="middle" font-family="Bahnschrift" font-size="17" font-weight="700" fill="${paper}">${esc(data.gateway.label)}</text>
  ${textBlock({ x: 1251, y: 127, width: 226, value: data.gateway.note, fontSize: 14, lineHeight: 17, family: "Bahnschrift", fill: paper, maxLines: 2, anchor: "middle" })}

  ${gatewaySvg}
  ${calloutSvg}
  ${interoperabilitySvg}

  <rect x="0" y="1418" width="${W}" height="382" fill="${background}" fill-opacity="0.97"/>
  <text x="54" y="1453" font-family="Cambria" font-size="28" font-weight="700" fill="${ink}">Provider lens</text>
  <text x="258" y="1453" font-family="Bahnschrift" font-size="16" fill="${ink}" fill-opacity="0.66">Reference ecosystems · same gateway role · not ranked</text>
  ${providerCardsSvg}

  <line x1="54" y1="1713" x2="1386" y2="1713" stroke="${ink}" stroke-opacity="0.18"/>
  <text x="54" y="1743" font-family="Bahnschrift" font-size="14" fill="${ink}" fill-opacity="0.66">${esc(data.footer.sourceLine)}</text>
  <text x="54" y="1770" font-family="Bahnschrift" font-size="13" fill="${ink}" fill-opacity="0.58">${esc(data.footer.identityLine)}</text>
  <text x="1386" y="1753" text-anchor="end" font-family="Bahnschrift" font-size="19" font-weight="700" fill="${ink}">${esc(data.footer.cta)}</text>
</svg>`;

const svgPath = path.join(outDir, "master.svg");
fs.writeFileSync(svgPath, svg, "utf8");
console.log(svgPath);

if (wantsPng) {
  let sharp;
  try {
    sharp = require("sharp");
  } catch (error) {
    console.error("PNG render skipped: sharp is unavailable. SVG master was written.");
    process.exitCode = 2;
  }
  if (sharp) {
    const pngPath = path.join(outDir, "master.png");
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngPath);
    console.log(pngPath);
  }
}
