import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
if (!args[0]) {
  console.error("Usage: node render-hero.mjs <data.json> [--root <asset-root>] [--png]");
  process.exit(1);
}

const dataPath = path.resolve(args[0]);
const rootIndex = args.indexOf("--root");
const assetRoot = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : path.dirname(dataPath);
const wantsPng = args.includes("--png");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
if (data.contractVersion !== "infogenius-hero.v1") throw new Error("Unsupported hero contract");

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const sourcePath = path.resolve(assetRoot, data.sourceImage);
if (!fs.existsSync(sourcePath)) throw new Error(`Missing source image: ${sourcePath}`);
const sourceUri = `data:image/png;base64,${fs.readFileSync(sourcePath).toString("base64")}`;
const W = data.canvas.width;
const H = data.canvas.height;
const ink = data.canvas.ink;
const paper = data.canvas.paper;

const callouts = data.callouts.map((item) => `
  <text x="${item.x + item.width / 2}" y="${item.y}" text-anchor="middle" font-family="Bahnschrift" font-size="${item.fontSize}" font-weight="700" fill="${ink}">${esc(item.title)}</text>
`).join("");

const providerStart = 430;
const providerGap = 157;
const providers = data.providers.map((provider, index) => `
  <text x="${providerStart + providerGap * index}" y="915" text-anchor="middle" font-family="Bahnschrift" font-size="15" font-weight="600" fill="${paper}" fill-opacity="0.9">${esc(provider)}</text>
`).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="headlineShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#060810" stop-opacity="0.9"/>
      <stop offset="72%" stop-color="#060810" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#060810" stop-opacity="0"/>
    </linearGradient>
    <filter id="headlineShadow" x="-20%" y="-30%" width="140%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <image href="${sourceUri}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
  <path d="M0 0 H970 V236 H0 Z" fill="url(#headlineShade)"/>
  <text x="56" y="50" font-family="Bahnschrift" font-size="17" font-weight="600" letter-spacing="0.7" fill="${paper}" fill-opacity="0.76">${esc(data.header.eyebrow)}</text>
  <text x="54" y="118" font-family="Cambria" font-size="58" font-weight="700" fill="${paper}" filter="url(#headlineShadow)">${esc(data.header.title)}</text>
  <text x="57" y="164" font-family="Bahnschrift" font-size="25" font-weight="600" fill="${paper}" fill-opacity="0.92">${esc(data.header.subtitle)}</text>
  ${callouts}
  <rect x="0" y="878" width="${W}" height="63" fill="#060810" fill-opacity="0.9"/>
  <text x="54" y="915" font-family="Bahnschrift" font-size="15" font-weight="700" fill="#6EDCFF">${esc(data.footer.railLabel)}</text>
  ${providers}
  <text x="1618" y="915" text-anchor="end" font-family="Bahnschrift" font-size="11" fill="${paper}" fill-opacity="0.56">${esc(data.footer.identityLine)}</text>
</svg>`;

const outDir = path.join(assetRoot, "masters");
fs.mkdirSync(outDir, { recursive: true });
const svgPath = path.join(outDir, "frank-omega-systems-atelier-hero.svg");
fs.writeFileSync(svgPath, svg, "utf8");
console.log(svgPath);

if (wantsPng) {
  const sharp = require("sharp");
  const pngPath = path.join(outDir, "frank-omega-systems-atelier-hero.png");
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngPath);
  console.log(pngPath);
}
