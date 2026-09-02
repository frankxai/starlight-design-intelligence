#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { parse as parseYaml } from "yaml";

const require = createRequire(import.meta.url);
const playwrightVersion = require("playwright/package.json").version;
const root = process.cwd();
const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...rest] = argument.replace(/^--/u, "").split("=");
    return [key, rest.length ? rest.join("=") : true];
  })
);
if (args.help) {
  console.log("Usage: npm run capture:reference -- --target=<target_id> --out=<external-directory> [--surface=<surface_id>] [--method=auto|browser|firecrawl]");
  process.exit(0);
}
if (!args.target || !args.out) {
  console.error("--target and --out are required. Use --help for details.");
  process.exit(2);
}
const outputRoot = resolve(String(args.out));
const relativeOutput = relative(root, outputRoot);
if (!relativeOutput.startsWith(`..${sep}`) && relativeOutput !== "..") {
  console.error("Raw capture output must be outside the repository.");
  process.exit(2);
}
const registry = parseYaml(readFileSync(join(root, "observatory/registry/targets.yaml"), "utf8"));
const target = registry.targets.find((candidate) => candidate.target_id === args.target);
if (!target) {
  console.error(`Unknown target_id: ${args.target}`);
  process.exit(2);
}
const surfaces = args.surface
  ? target.surfaces.filter((surface) => surface.surface_id === args.surface)
  : target.surfaces;
if (!surfaces.length) {
  console.error(`Unknown surface_id for ${target.target_id}: ${args.surface}`);
  process.exit(2);
}
const requestedMethod = String(args.method ?? "auto");
if (!["auto", "browser", "firecrawl"].includes(requestedMethod)) {
  console.error("--method must be auto, browser, or firecrawl.");
  process.exit(2);
}
if (requestedMethod === "firecrawl" && !process.env.FIRECRAWL_API_KEY) {
  console.error("FIRECRAWL_API_KEY is required for --method=firecrawl.");
  process.exit(2);
}

const hash = (value) => createHash("sha256").update(value).digest("hex");
const tag = (value) => value.replace(/[-:]/gu, "").replace(/\.\d{3}Z$/u, "z").toLowerCase();
function persistRaw(bytes, extension) {
  const sha256 = hash(bytes);
  const contentAddress = `sha256/${sha256.slice(0, 2)}/${sha256}.${extension}`;
  const path = join(outputRoot, contentAddress);
  mkdirSync(join(outputRoot, "sha256", sha256.slice(0, 2)), { recursive: true });
  if (!existsSync(path)) writeFileSync(path, bytes);
  return { sha256, bytes: bytes.length, content_address: contentAddress, storage_status: "pending-private-storage" };
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const counts = (values) =>
      [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map())]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([value, count]) => ({ value, count }));
    const elements = [...document.querySelectorAll("body *")].slice(0, 2500);
    const styles = elements.map((element) => getComputedStyle(element));
    const landmarks = Object.fromEntries(
      ["header", "nav", "main", "footer"].map((name) => [name, document.querySelectorAll(name).length])
    );
    const images = [...document.images];
    const unnamedButtons = [...document.querySelectorAll("button")].filter(
      (button) => !(button.innerText || button.getAttribute("aria-label") || button.getAttribute("title"))
    ).length;
    return {
      locale: document.documentElement.lang || navigator.language || "und",
      headings: [...document.querySelectorAll("h1,h2,h3")].slice(0, 80).map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: heading.textContent.replace(/\s+/gu, " ").trim().slice(0, 240)
      })).filter((heading) => heading.text),
      actions: [...document.querySelectorAll("a[href],button")].slice(0, 120).map((element) =>
        (element.innerText || element.getAttribute("aria-label") || "").replace(/\s+/gu, " ").trim().slice(0, 160)
      ).filter(Boolean),
      foundations: {
        colors: counts(styles.map((style) => style.color).filter(Boolean)),
        backgrounds: counts(styles.map((style) => style.backgroundColor).filter((value) => value && value !== "rgba(0, 0, 0, 0)")),
        fonts: counts(styles.map((style) => style.fontFamily).filter(Boolean)),
        fontSizes: counts(styles.map((style) => style.fontSize).filter(Boolean)),
        radii: counts(styles.map((style) => style.borderRadius).filter(Boolean)),
        shadows: counts(styles.map((style) => style.boxShadow).filter((value) => value && value !== "none")),
        spacing: counts(styles.map((style) => style.padding).filter(Boolean))
      },
      accessibility: {
        landmarks,
        heading_levels: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => Number(heading.tagName.slice(1))),
        images: images.length,
        missing_alt: images.filter((image) => !image.hasAttribute("alt")).length,
        unnamed_buttons: unnamedButtons
      },
      menus: {
        nav_count: document.querySelectorAll("nav").length,
        disclosure_count: document.querySelectorAll("details,[aria-expanded],[aria-haspopup]").length,
        open_disclosure_count: document.querySelectorAll("details[open],[aria-expanded=true]").length
      },
      motion: {
        animated_elements: styles.filter((style) => style.animationName !== "none").length,
        transitioned_elements: styles.filter((style) => style.transitionDuration !== "0s").length
      },
      scroll_height: document.documentElement.scrollHeight
    };
  });
}

async function browserCapture(browser, surface, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.dpr,
    locale: registry.default_capture_policy.locales[0]
  });
  const page = await context.newPage();
  const response = await page.goto(surface.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(800);
  const htmlText = await page.content();
  const screenshotBytes = await page.screenshot({ type: "png", fullPage: false });
  const normal = await inspectPage(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await inspectPage(page);
  const result = {
    final_url: page.url(),
    title: await page.title(),
    status: response?.status() ?? 0,
    html: Buffer.from(htmlText),
    screenshot: screenshotBytes,
    inspection: { ...normal, reduced_motion: reduced.motion }
  };
  await context.close();
  return result;
}

async function firecrawlCapture(surface, viewport) {
  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: surface.url,
      onlyMainContent: false,
      waitFor: 1200,
      mobile: viewport.width <= 390,
      formats: [
        "html",
        "branding",
        { type: "screenshot", fullPage: false, quality: 90, viewport: { width: viewport.width, height: viewport.height } }
      ]
    })
  });
  if (!response.ok) throw new Error(`Firecrawl ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const data = payload.data ?? payload;
  let screenshot = data.screenshot;
  if (typeof screenshot === "string" && /^https?:/u.test(screenshot)) {
    const screenshotResponse = await fetch(screenshot);
    if (!screenshotResponse.ok) throw new Error(`Screenshot download failed: ${screenshotResponse.status}`);
    screenshot = Buffer.from(await screenshotResponse.arrayBuffer());
  } else if (typeof screenshot === "string" && screenshot.startsWith("data:")) {
    screenshot = Buffer.from(screenshot.split(",", 2)[1], "base64");
  }
  return {
    final_url: data.metadata?.sourceURL ?? surface.url,
    title: data.metadata?.title ?? "",
    status: data.metadata?.statusCode ?? response.status,
    html: Buffer.from(data.html ?? ""),
    screenshot: Buffer.isBuffer(screenshot) ? screenshot : null,
    branding: data.branding ?? null,
    metadata: data.metadata ?? {}
  };
}

mkdirSync(join(outputRoot, "manifests"), { recursive: true });
let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (error) {
  if (!process.env.FIRECRAWL_API_KEY) throw error;
  console.warn(`Browser inspection unavailable; continuing with Firecrawl only: ${error.message}`);
}

const manifests = [];
for (const surface of surfaces) {
  for (const viewport of registry.default_capture_policy.viewports) {
    const capturedAt = new Date().toISOString();
    let crawl = null;
    let observed = null;
    if (process.env.FIRECRAWL_API_KEY && requestedMethod !== "browser") {
      crawl = await firecrawlCapture(surface, viewport);
    }
    if (browser && requestedMethod !== "firecrawl") {
      observed = await browserCapture(browser, surface, viewport);
    }
    const primary = observed ?? crawl;
    if (!primary?.html?.length || !primary?.screenshot?.length) {
      throw new Error(`Capture incomplete for ${surface.surface_id} at ${viewport.width}px`);
    }
    const html = persistRaw(primary.html, "html");
    const screenshot = persistRaw(primary.screenshot, "png");
    const artifacts = {
      html: { ...html, mime: "text/html" },
      screenshot: { ...screenshot, mime: "image/png", width: viewport.width, height: viewport.height }
    };
    if (crawl) {
      const bundleBytes = Buffer.from(JSON.stringify({
        branding: crawl.branding,
        metadata: crawl.metadata,
        browser_inspection: observed?.inspection ?? null
      }));
      artifacts.crawler_bundle = { ...persistRaw(bundleBytes, "json"), mime: "application/json" };
    }
    const snapshotId = `snapshot.${target.target_id}.${surface.surface_id}.${viewport.name}.${tag(capturedAt)}`;
    const pageSignal = `${primary.title} ${observed?.inspection?.headings?.map((item) => item.text).join(" ") ?? ""}`;
    const pageState = /404|page not found|page doesn.?t exist/i.test(pageSignal)
      ? "not-found-content"
      : primary.title || observed?.inspection?.headings?.length
        ? "loaded"
        : "empty-content";
    const manifest = {
      $schema: "schemas/design-snapshot-manifest.schema.json",
      schema_version: "starlight.design_snapshot_manifest.v1",
      snapshot_id: snapshotId,
      target_id: target.target_id,
      surface_id: surface.surface_id,
      captured_at: capturedAt,
      locale: observed?.inspection?.locale ?? registry.default_capture_policy.locales[0],
      url: surface.url,
      route: new URL(surface.url).pathname,
      viewport,
      tool: {
        name: crawl && observed ? "firecrawl+playwright" : crawl ? "firecrawl" : "playwright",
        version: crawl && observed ? `v2+${playwrightVersion}` : crawl ? "v2" : playwrightVersion,
        method: crawl && observed ? "hybrid" : crawl ? "firecrawl" : "browser"
      },
      response: {
        status: Math.max(200, primary.status || 200),
        status_source: "network-response",
        final_url: primary.final_url,
        title: primary.title,
        observed_page_state: pageState
      },
      artifacts,
      content_hash: hash(primary.html),
      rights: registry.rights.default,
      provenance: {
        source_owner: target.source_owner,
        captured_by: "scripts/capture-reference.mjs",
        capture_purpose: "design-research-reference-only"
      },
      inspection: {
        menu_state: observed ? "observed" : "not-tested",
        motion_state: observed ? "observed" : "not-tested",
        reduced_motion: observed ? "observed" : "not-tested",
        accessibility_structure: observed ? "observed" : "not-tested"
      }
    };
    writeFileSync(join(outputRoot, "manifests", `${snapshotId}.json`), JSON.stringify(manifest, null, 2) + "\n");
    manifests.push(manifest);
    console.log(`${target.target_id}/${surface.surface_id} ${viewport.width}px -> ${snapshotId}`);
  }
}
await browser?.close();
console.log(`Captured ${manifests.length} manifests. Raw artifacts remain outside Git and pending private R2 upload.`);
