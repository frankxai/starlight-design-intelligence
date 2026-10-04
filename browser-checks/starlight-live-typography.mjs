import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { inspectInterfaceFoundations } from "../scripts/inspect-interface-foundations.mjs";
import { hashRenderedDom } from "../scripts/validate-interface-foundations.mjs";

// Anonymous observations of owned public roots. No forms, clicks, images or artifacts.
const sites = [
  { id: "lab", url: "https://starlightintelligence.ai/" },
  { id: "academy", url: "https://starlightintelligence.academy/" },
  { id: "protocol", url: "https://starlightintelligence.org/" }
];
const states = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "phone", width: 390, height: 844 },
  { id: "narrow-phone", width: 320, height: 812 },
  { id: "css-zoom-2x", width: 1440, height: 900, cssZoom: 2 },
  { id: "blocked-webfonts", width: 390, height: 844, blockFonts: true },
  { id: "fresh-recovery", width: 390, height: 844 }
];
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

function sampleText() {
  const visible = (e) => e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && e.getClientRects().length;
  const elements = [...document.querySelectorAll("main h1, main h2, main p, main a, main button, main code, main em, main span, header a")].slice(0, 3000).filter(visible);
  const text = (e) => e.textContent.replace(/\s+/gu, " ").trim();
  const first = (selector) => elements.find((e) => e.matches(selector) && text(e));
  const longest = elements.filter((e) => e.matches("p") && text(e)).sort((a, b) => text(b).length - text(a).length)[0];
  const picks = [
    ["headline", first("h1")], ["reading", longest], ["action", first("a,button")],
    ["secondary-heading", first("h2")],
    ["mono", elements.find((e) => text(e) && /Plex|JetBrains|Mono/iu.test(getComputedStyle(e).fontFamily))],
    ["italic", elements.find((e) => text(e) && getComputedStyle(e).fontStyle === "italic")],
    ["numerals", elements.find((e) => text(e).length < 120 && /\d/u.test(text(e)))]
  ].filter(([, e]) => e);
  const selector = (e) => {
    const parts = [];
    for (let p = e; p && p !== document.body; p = p.parentElement) {
      const siblings = [...p.parentElement.children].filter((s) => s.localName === p.localName);
      parts.unshift(`${p.localName}:nth-of-type(${siblings.indexOf(p) + 1})`);
    }
    return `body > ${parts.join(" > ")}`;
  };
  const rect = (r) => ({ x: r.x, y: r.y, width: r.width, height: r.height });
  return {
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    rootCssZoom: getComputedStyle(document.documentElement).zoom,
    fontStatus: document.fonts.status,
    fontFaces: [...document.fonts].slice(0, 64).map((f) => ({ family: f.family, weight: f.weight, style: f.style, status: f.status })),
    samples: picks.map(([role, e]) => {
      const s = getComputedStyle(e);
      const range = document.createRange(); range.selectNodeContents(e);
      const lines = [...range.getClientRects()].slice(0, 160).map(rect);
      const clippingAncestors = [];
      for (let p = e; p && p !== document.body; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (/hidden|clip/u.test(`${ps.overflowX} ${ps.overflowY}`)) {
          clippingAncestors.push({ selector: selector(p), bounds: rect(p.getBoundingClientRect()), overflowX: ps.overflowX, overflowY: ps.overflowY });
        }
      }
      return { role, selector: selector(e), text: text(e).slice(0, 700), textLength: text(e).length,
        familyStack: s.fontFamily, size: s.fontSize, weight: s.fontWeight, style: s.fontStyle,
        lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform,
        bounds: rect(e.getBoundingClientRect()), textRects: lines, clippingAncestors };
    })
  };
}

async function observe(browser, site, state) {
  const started = new Date().toISOString();
  const context = await browser.newContext({
    viewport: { width: state.width, height: state.height },
    locale: "en-GB", reducedMotion: "reduce", serviceWorkers: "block"
  });
  const blocked = [];
  const fontResponses = [];
  const fontReads = [];
  const pageErrors = [];
  let stage = "init";
  try {
    // Same route in every fresh context: caching is disabled consistently.
    await context.route("**/*", async (route) => {
      const request = route.request();
      const font = request.resourceType() === "font" || /\.(?:woff2?|ttf|otf)(?:\?|$)/iu.test(request.url());
      if (state.blockFonts && font) {
        blocked.push(request.url());
        await route.abort("blockedbyclient");
      } else await route.continue();
    });
    await context.addInitScript(() => {
      window.__starlightFontProbe = { shifts: [], truncated: false, supported: PerformanceObserver.supportedEntryTypes.includes("layout-shift") };
      if (window.__starlightFontProbe.supported) new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) {
          if (window.__starlightFontProbe.shifts.length < 256) window.__starlightFontProbe.shifts.push({ value: e.value, startTime: e.startTime });
          else window.__starlightFontProbe.truncated = true;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => { if (pageErrors.length < 16) pageErrors.push(e.message.slice(0, 600)); });
    page.on("response", (response) => {
      if (response.request().resourceType() !== "font" || fontReads.length >= 32) return;
      fontReads.push((async () => {
        const row = { url: response.url(), status: response.status() };
        try {
          if (Number(response.headers()["content-length"]) > 8 * 1024 * 1024) throw new Error();
          const bytes = await response.body();
          if (bytes.length > 8 * 1024 * 1024) throw new Error();
          Object.assign(row, { bytes: bytes.length, sha256: digest(bytes) });
        } catch { row.bodyUnavailable = true; }
        fontResponses.push(row);
      })());
    });
    page.setDefaultTimeout(12000);
    stage = "navigation";
    const response = await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 20000 });
    if (!response || response.status() !== 200 || new URL(page.url()).origin !== new URL(site.url).origin) throw new Error("Unexpected root response/origin");
    await page.locator("h1").first().waitFor({ state: "visible" });
    stage = "font-settlement";
    await page.waitForFunction(() => document.fonts.status === "loaded");
    await page.waitForTimeout(1500);
    const shifts = await page.evaluate(() => ({ ...window.__starlightFontProbe, observedThroughMs: performance.now() }));
    if (shifts.truncated) throw new Error("Layout-shift observation cap reached");
    // CSS zoom stresses reflow; this is explicitly not native browser zoom.
    if (state.cssZoom) {
      await page.evaluate((zoom) => { document.documentElement.style.zoom = String(zoom); }, state.cssZoom);
      await page.waitForTimeout(300);
    }
    stage = "inspection";
    const dom = await hashRenderedDom(page);
    const typography = await page.evaluate(sampleText);
    const foundations = await page.evaluate(inspectInterfaceFoundations);
    const cdp = await context.newCDPSession(page);
    try {
      await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
      const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
      for (const sample of typography.samples) {
        // Chromium aggregates two layout levels for an element. Query individual
        // TextNodes to cover deeper spans without double-counting nested glyphs.
        const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: `${sample.selector}, ${sample.selector} *` });
        if (!nodeIds.length || nodeIds.length > 128) throw new Error("Missing or oversized font sample subtree");
        const used = new Map();
        const backendTextNodes = new Set();
        for (const nodeId of nodeIds) {
          const { node } = await cdp.send("DOM.describeNode", { nodeId, depth: 1 });
          for (const child of node.children ?? []) if (child.nodeType === 3 && child.nodeValue.trim()) backendTextNodes.add(child.backendNodeId);
        }
        if (backendTextNodes.size > 256) throw new Error("Font TextNode sample limit exceeded");
        const { nodeIds: textNodeIds } = await cdp.send("DOM.pushNodesByBackendIdsToFrontend", { backendNodeIds: [...backendTextNodes] });
        for (const nodeId of textNodeIds) {
          if (!nodeId) throw new Error("Text sample detached during font inspection");
          const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
          for (const f of fonts.filter((f) => f.glyphCount > 0)) {
            const key = JSON.stringify([f.familyName, f.postScriptName, f.isCustomFont]);
            const row = used.get(key) ?? { family: f.familyName, postscriptName: f.postScriptName,
              customOrLocallyResolvedFace: f.isCustomFont, glyphCount: 0 };
            row.glyphCount += f.glyphCount; used.set(key, row);
          }
        }
        sample.inspectedFontElements = nodeIds.length;
        sample.inspectedNonblankTextNodes = textNodeIds.length;
        sample.usedFonts = [...used.values()];
      }
    } finally { await cdp.detach(); }
    const focus = [];
    if (state.id === "desktop") for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press("Tab");
      focus.push(await page.evaluate(() => {
        const e = document.activeElement, s = getComputedStyle(e);
        return { tag: e.localName, label: (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 120), outline: s.outline, boxShadow: s.boxShadow, bounds: { x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y } };
      }));
    }
    await Promise.allSettled(fontReads);
    if (!typography.samples.some((s) => s.role === "headline" && s.usedFonts.length)) throw new Error("No rendered headline font sample");
    if (state.blockFonts && !blocked.length) throw new Error("Fallback scenario blocked no font request");
    const headers = response.headers();
    return { site: site.id, requestedUrl: site.url, resolvedUrl: page.url(), state, started,
      finished: new Date().toISOString(), complete: true, httpStatus: response.status(),
      responseMetadata: Object.fromEntries(["date", "etag", "x-vercel-id", "x-matched-path"].filter((k) => headers[k]).map((k) => [k, headers[k]])),
      ...dom, typography, foundations, focus, pageErrors, fontResponses, blockedFontRequests: blocked,
      layoutShifts: { supported: shifts.supported, settlementWaitMs: 1500, observedThroughMs: shifts.observedThroughMs, entries: shifts.shifts,
        rawSum: shifts.shifts.reduce((n, e) => n + e.value, 0), scope: "Early-load raw shift sum, excludes recent input; not CLS session-window/Lighthouse/field performance" } };
  } catch (e) {
    return { site: site.id, requestedUrl: site.url, state, started, finished: new Date().toISOString(), complete: false,
      stage, error: e.message.slice(0, 700), pageErrors, fontResponses, blockedFontRequests: blocked };
  } finally { await context.close(); }
}

const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (const site of sites) for (const state of states) rows.push(await observe(browser, site, state));
} finally { await browser.close(); }
const report = {
  format: "starlight-live-typography-observation-v1",
  at: new Date().toISOString(),
  probeCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  candidateSourceCommit: process.env.PROBE_SOURCE_SHA ?? null,
  sourceBinding: "Probe revision only; live product deployment SHAs are unverified",
  browser: browser.version(),
  scope: "Anonymous public-root text/font/layout observations. No screenshots, visual/rights/human approval, native zoom, complete type inventory, WCAG or product-value verdict.",
  rows,
  fallbackComparisons: sites.map((site) => {
    const row = (id) => rows.find((r) => r.site === site.id && r.state.id === id);
    const faces = (r) => r?.complete ? [...new Set(r.typography.samples.flatMap((s) => s.usedFonts.map((f) => `${f.family} / ${f.postscriptName}`)))].sort() : null;
    const normal = row("phone"), blocked = row("blocked-webfonts"), recovery = row("fresh-recovery");
    const normalFaces = faces(normal), blockedFaces = faces(blocked), recoveredFaces = faces(recovery);
    return { site: site.id, normalFaces, blockedFaces, recoveredFaces,
      blockedRequests: blocked?.blockedFontRequests.length ?? 0,
      normalFontResponses: normal?.fontResponses.length ?? 0,
      recoveredFontResponses: recovery?.fontResponses.length ?? 0,
      recoveredFaceSetEqualsNormal: normalFaces && recoveredFaces ? JSON.stringify(normalFaces) === JSON.stringify(recoveredFaces) : null,
      scope: "Rendered-name comparison, not proof of all font sources, weight availability or fallback readability" };
  }),
  completeSamples: rows.filter((r) => r.complete).length,
  expectedSamples: sites.length * states.length
};
// Keep log lines bounded: large single-line reports can disappear in log readers.
console.log("STARLIGHT_TYPOGRAPHY_REPORT_BEGIN");
console.log(JSON.stringify(report, null, 2));
console.log("STARLIGHT_TYPOGRAPHY_REPORT_END");
// A green observation job means complete observations, including actual defects.
process.exitCode = report.completeSamples === report.expectedSamples ? 0 : 1;
