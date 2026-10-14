import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { inspectInterfaceFoundations } from "../scripts/inspect-interface-foundations.mjs";
import { hashRenderedDom } from "../scripts/validate-interface-foundations.mjs";

// Public roots are observed without interactions; compiled mode can navigate locally.
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
const repairMode = process.env.PROTOCOL_REPAIR_TRIAL ?? "0";
if (!["0", "1"].includes(repairMode)) throw new Error("Invalid protocol repair trial mode");
const compiledPhase = process.env.PROTOCOL_COMPILED_PHASE ?? null;
if (compiledPhase && !["baseline", "candidate"].includes(compiledPhase)) throw new Error("Invalid compiled phase");
if (Boolean(compiledPhase) !== Boolean(process.env.PROTOCOL_COMPILED_ROOT)) throw new Error("Incomplete compiled configuration");
if (compiledPhase && repairMode !== "0") throw new Error("Compiled observation cannot inject a runtime repair");

function bindCompiledSource() {
  const root = resolve(process.env.PROTOCOL_COMPILED_ROOT ?? "");
  if (root !== resolve("protocol-candidate")) throw new Error("Unexpected compiled checkout path");
  const base = "12d794a389959a2360bd4c920689510f0949f02b";
  if (execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== base) throw new Error("Compiled base revision drift");
  const patchSha256 = digest(readFileSync(new URL("../evals/protocol-typography-repair-12d794a.patch", import.meta.url)));
  if (patchSha256 !== "d69fc72051351ffc1702c9f6cd6b9cc0a0ca1001604184bd235824b75057ef67") throw new Error("Compiled patch hash drift");
  const pins = [
    ["site/src/app/globals.css", "8278d88a44879a5c6879907321d33a935066cc646353b42832243714a4c5aac8", "6185aee430e7248898de50f2c4d09e55d3cb14fb734799df83415f6c89037999"],
    ["site/src/app/page.tsx", "c8aa2cded59b972b50de40142c88c296fd43c6644522944dd89039e678f03cef", "2658f32f2f8ab9b4c0fcf71d8ab49c43672059b3cc23a88ca49e4eaffea878b6"],
    ["site/src/components/EntryCard.tsx", "3d243c39430d5afbda80b8149d3172d90629b2cd79349fac323e9fbb4271a70a", "08c9ae1ccbb1a47bde16838f43b42ac496b917868ed55c05f6f812d3efb6cd0c"],
    ["site/src/components/OperationalProofConsole.tsx", "67d268a72614893410b7dce3766029ef3ae755236178c36da4ecae3e5b0fcf4e", "1dc2ec3e9397ffb28004e9d0918f2b875f1de5d8e66f0b86ca196b562a071925"]
  ];
  const sources = pins.map(([path, before, after]) => {
    const sha256 = digest(readFileSync(resolve(root, path)));
    if (sha256 !== (compiledPhase === "baseline" ? before : after)) throw new Error(`Compiled source mismatch: ${path}`);
    return { path, sha256 };
  });
  const changedPaths = execFileSync("git", ["-C", root, "diff", "--name-only"], { encoding: "utf8" }).trim().split("\n").filter(Boolean).sort();
  const expected = compiledPhase === "baseline" ? [] : pins.map(([path]) => path).sort();
  if (JSON.stringify(changedPaths) !== JSON.stringify(expected)) throw new Error("Unexpected compiled source changes");
  const buildId = readFileSync(resolve(root, "site/.next/BUILD_ID"), "utf8").trim();
  if (!buildId || buildId.length > 256) throw new Error("Missing compiled build ID");
  return { phase: compiledPhase, productRepo: "frankxai/Starlight-Intelligence-System", base, patchSha256, sources, changedPaths, buildId,
    scope: "Actual isolated compiled baseline/candidate; not a product commit, Vercel preview or production deployment." };
}
const compiled = compiledPhase ? bindCompiledSource() : null;

function loadRepairTrial() {
  const patch = readFileSync(new URL("../evals/protocol-typography-repair-12d794a.patch", import.meta.url), "utf8");
  const sha256 = digest(patch);
  if (sha256 !== "d69fc72051351ffc1702c9f6cd6b9cc0a0ca1001604184bd235824b75057ef67") throw new Error("Product patch hash mismatch");
  const lines = patch.split("\n"), classChanges = [], labelChanges = [], families = {};
  for (let i = 0; i < lines.length; i += 1) {
    const font = lines[i].match(/^\+  --font-(sans|mono|serif): (.+);$/u);
    if (font) families[font[1]] = font[2];
    const beforeClass = lines[i].match(/^-.*className="([^"]*\buppercase\b[^"]*)"/u);
    if (beforeClass) {
      const afterClass = lines[i + 1]?.match(/^\+.*className="([^"]+)"/u)?.[1];
      if (afterClass !== beforeClass[1].replace(/\buppercase\b/u, "normal-case")) throw new Error("Unsupported class repair");
      classChanges.push({ before: beforeClass[1], after: afterClass });
    }
    const beforeLabel = lines[i].match(/^-.*<CensusStat .*label="([^"]+)"/u);
    if (beforeLabel) {
      // The four label deletions are followed by four additions in this exact patch.
      const after = lines.slice(i + 1).find((line) => line.startsWith("+") && line.includes(`label="${beforeLabel[1][0].toUpperCase() + beforeLabel[1].slice(1)}"`));
      if (!after) throw new Error("Unsupported label repair");
      labelChanges.push({ before: beforeLabel[1], after: beforeLabel[1][0].toUpperCase() + beforeLabel[1].slice(1) });
    }
  }
  if (classChanges.length !== 14 || labelChanges.length !== 4 || Object.keys(families).length !== 3) throw new Error("Incomplete repair specification");
  // Tailwind @theme inline emits the value directly in the family utility.
  // Use the same layer and specificity, without overriding unrelated classes.
  const css = `@layer utilities {\n${Object.entries(families).map(([role, stack]) => `.font-${role} { font-family: ${stack}; }`).join("\n")}\n.normal-case { text-transform: none; }\n}`;
  return { productRepo: "frankxai/Starlight-Intelligence-System", issue: 197,
    productBase: "12d794a389959a2360bd4c920689510f0949f02b", patchPath: "evals/protocol-typography-repair-12d794a.patch", patchSha256: sha256,
    css, cssSha256: digest(css), classChanges, labelChanges,
    scope: "After-settlement CSS/class/text hypothesis on the existing public homepage, not a compiled product preview. The four global selector edits in the patch are not exercised. Product deployment SHA, initial loading/shift, other routes, visual, rights and release acceptance remain unverified." };
}

const repair = repairMode === "1" ? loadRepairTrial() : null;
const selectedSites = compiled ? [{ id: "protocol", url: "http://127.0.0.1:4173/" }] : repair ? sites.filter((site) => site.id === "protocol") : sites;
const repairStates = [
  { id: "repair-normal-phone", width: 390, height: 844, repair: true },
  { id: "repair-blocked-phone", width: 390, height: 844, blockFonts: true, repair: true },
  { id: "repair-blocked-narrow-phone", width: 320, height: 812, blockFonts: true, repair: true },
  { id: "repair-blocked-css-zoom-2x", width: 1440, height: 900, blockFonts: true, cssZoom: 2, repair: true }
];
const selectedStates = compiled ? compiledPhase === "baseline" ? states.filter((s) => ["phone", "blocked-webfonts"].includes(s.id)) : [
  ...states, { id: "blocked-narrow-phone", width: 320, height: 812, blockFonts: true },
  { id: "blocked-css-zoom-2x", width: 1440, height: 900, blockFonts: true, cssZoom: 2 },
  { id: "interrupted-motion-desktop", width: 1440, height: 900, interruptMotion: true }
] : repair ? [...states, ...repairStates] : states;

function inspectCompiledCss() {
  const selectors = [".explainer-prose h4", ".console-display", ".console-md h1", ".console-md h2", ".console-md h3", ".console-md h4", ".console-md th"];
  const rules = [];
  const visit = (list) => {
    for (const rule of list) {
      if (rule.selectorText && rule.style?.textTransform) rules.push({ selector: rule.selectorText, textTransform: rule.style.textTransform });
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) visit(sheet.cssRules);
  // Probe actual compiled declarations on explicit fixture nodes. These are not
  // application-route or visual evidence; the page itself is never restyled.
  const fixture = document.createElement("section");
  fixture.hidden = true;
  fixture.innerHTML = '<div class="explainer-prose"><h4>Reading label</h4></div><div class="console-display">Console label</div><div class="console-md"><h1>First heading</h1><h2>Second heading</h2><h3>Third heading</h3><h4>Fourth heading</h4><table><thead><tr><th>Column label</th></tr></thead></table></div>';
  document.body.append(fixture);
  try {
    const matched = selectors.map((selector) => {
      const node = fixture.querySelector(selector);
      const owner = selector.split(" ")[0];
      return { selector, declarations: rules.filter((r) => r.selector.includes(owner) && node.matches(r.selector)) };
    });
    return { matched, fixtureTextTransforms: selectors.map((selector) => ({ selector, value: getComputedStyle(fixture.querySelector(selector)).textTransform })),
      scope: "Compiled CSSOM plus hidden diagnostic nodes; no claim that all owning application routes were exercised." };
  } finally { fixture.remove(); }
}

function sampleText() {
  const visible = (e) => e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && e.getClientRects().length;
  const elements = [...document.querySelectorAll("main h1, main h2, main p, main a, main button, main code, main em, main span, header a")].slice(0, 3000).filter(visible);
  const text = (e) => e.textContent.replace(/\s+/gu, " ").trim();
  const first = (selector) => elements.find((e) => e.matches(selector) && text(e));
  const longest = elements.filter((e) => e.matches("p") && text(e)).sort((a, b) => text(b).length - text(a).length)[0];
  const picks = [
    ["headline", first("h1")], ["reading", longest],
    ["action", elements.find((e) => e.matches("a[href],button") && e.closest("main") && text(e))],
    ["secondary-heading", first("h2")],
    ["mono", elements.find((e) => text(e) && /Plex|JetBrains|Mono/iu.test(getComputedStyle(e).fontFamily))],
    ["italic", elements.find((e) => text(e) && getComputedStyle(e).fontStyle === "italic")],
    ["numerals", elements.find((e) => text(e).length < 120 && /\d/u.test(text(e)))]
  ].filter(([, e]) => e);
  const selector = (e) => {
    if (e === document.body) return "body";
    const parts = [];
    for (let p = e; p && p !== document.body; p = p.parentElement) {
      const siblings = [...p.parentElement.children].filter((s) => s.localName === p.localName);
      parts.unshift(`${p.localName}:nth-of-type(${siblings.indexOf(p) + 1})`);
    }
    return `body > ${parts.join(" > ")}`;
  };
  const rect = (r) => ({ x: r.x, y: r.y, width: r.width, height: r.height });
  const clipping = (e) => {
    const ancestors = [];
    for (let p = e; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/hidden|clip|auto|scroll/u.test(`${s.overflowX} ${s.overflowY}`)) {
        ancestors.push({ selector: p === document.documentElement ? "html" : selector(p),
          bounds: rect(p.getBoundingClientRect()), overflowX: s.overflowX, overflowY: s.overflowY });
      }
      if (p === document.documentElement) break;
    }
    return ancestors;
  };
  const lightDom = [...document.body.querySelectorAll("*")];
  if (lightDom.length > 20000) throw new Error("Geometry diagnostic element limit exceeded");
  const overflowing = [], uppercase = [];
  for (const e of lightDom) {
    if (!visible(e)) continue;
    const s = getComputedStyle(e), bounds = e.getBoundingClientRect();
    if (bounds.width > 0 && (bounds.x < -1 || bounds.right > innerWidth + 1)) {
      overflowing.push({ selector: selector(e), class: e.getAttribute("class"), bounds: rect(bounds),
        text: text(e).slice(0, 160), display: s.display, position: s.position,
        minWidth: s.minWidth, maxWidth: s.maxWidth, whiteSpace: s.whiteSpace,
        overflowX: s.overflowX, clippingAncestors: clipping(e) });
    }
    if (s.textTransform === "uppercase" && !e.closest("pre,code,kbd,samp,textarea,[contenteditable],script,style,template,noscript") &&
      [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && /\p{L}/u.test(n.textContent))) {
      uppercase.push({ selector: selector(e), class: e.getAttribute("class"), text: text(e).slice(0, 160), fontFamily: s.fontFamily });
    }
  }
  return {
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    rootCssZoom: getComputedStyle(document.documentElement).zoom,
    fontStatus: document.fonts.status,
    rootFontTokens: Object.fromEntries(["--font-sans", "--font-serif", "--font-mono", "--font-inter", "--font-jbmono", "--font-newsreader"]
      .map((k) => [k, getComputedStyle(document.documentElement).getPropertyValue(k).trim()])),
    diagnostics: { inspectedLightDomElements: lightDom.length,
      overflowCandidateCount: overflowing.length, overflowCandidates: overflowing.slice(0, 64),
      overflowCandidatesTruncated: overflowing.length > 64,
      uppercaseCount: uppercase.length, uppercaseText: uppercase.slice(0, 64), uppercaseTextTruncated: uppercase.length > 64,
      scope: "Bounded light-DOM candidates with full paths; clipped/decorative elements can extend beyond the viewport without causing document overflow. No cause or visual verdict." },
    fontFaces: [...document.fonts].slice(0, 64).map((f) => ({ family: f.family, weight: f.weight, style: f.style, status: f.status })),
    samples: picks.map(([role, e]) => {
      const s = getComputedStyle(e);
      const range = document.createRange(); range.selectNodeContents(e);
      const lines = [...range.getClientRects()].slice(0, 160).map(rect);
      return { role, selector: selector(e), text: text(e).slice(0, 700), textLength: text(e).length,
        familyStack: s.fontFamily, size: s.fontSize, weight: s.fontWeight, style: s.fontStyle,
        lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform,
        bounds: rect(e.getBoundingClientRect()), textRects: lines, clippingAncestors: clipping(e),
        ...(role === "action" ? { href: e.getAttribute("href"), tag: e.localName } : {}) };
    })
  };
}

async function observe(browser, site, state) {
  const started = new Date().toISOString();
  const context = await browser.newContext({
    viewport: { width: state.width, height: state.height },
    locale: "en-GB", reducedMotion: state.interruptMotion ? "no-preference" : "reduce", serviceWorkers: "block",
    ...(compiled ? { isMobile: state.width < 500, hasTouch: state.width < 500 } : {})
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
      const rect = (r) => ({ x: r.x, y: r.y, width: r.width, height: r.height });
      if (window.__starlightFontProbe.supported) new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) {
          if (window.__starlightFontProbe.shifts.length < 256) window.__starlightFontProbe.shifts.push({ value: e.value, startTime: e.startTime,
            sources: (e.sources ?? []).slice(0, 5).map((source) => {
              const node = source.node?.nodeType === Node.TEXT_NODE ? source.node.parentElement : source.node;
              return { tag: node?.localName ?? null, id: node?.id ?? null, class: node?.getAttribute?.("class") ?? null,
                text: (node?.textContent ?? "").replace(/\s+/gu, " ").trim().slice(0, 160),
                previousRect: rect(source.previousRect), currentRect: rect(source.currentRect) };
            }) });
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
    let motionInterruption = null;
    if (compiled && state.interruptMotion) {
      stage = "interrupt-entrance";
      const selector = 'figure[aria-label^="Starlight release room console"]';
      await page.waitForFunction((s) => {
        const element = document.querySelector(s);
        if (!element) return false;
        const opacity = Number(getComputedStyle(element).opacity);
        return opacity > 0 && opacity < 0.98;
      }, selector);
      const before = await page.locator(selector).evaluate((e) => ({ opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform }));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction((s) => {
        const style = getComputedStyle(document.querySelector(s));
        const matrix = new DOMMatrixReadOnly(style.transform);
        return Number(style.opacity) === 1 && Math.abs(matrix.m41) < 0.01 && Math.abs(matrix.m42) < 0.01 && Math.abs(matrix.a - 1) < 0.001;
      }, selector);
      motionInterruption = { selector, before, after: await page.locator(selector).evaluate((e) => ({ opacity: getComputedStyle(e).opacity,
        transform: getComputedStyle(e).transform, reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches })),
        scope: "One actual entrance interrupted by a reduced-motion change; no frame sequence, gesture or full motion acceptance." };
    }
    stage = "font-settlement";
    await page.waitForFunction(() => document.fonts.status === "loaded");
    await page.waitForTimeout(1500);
    const shifts = await page.evaluate(() => ({ ...window.__starlightFontProbe, observedThroughMs: performance.now() }));
    if (shifts.truncated) throw new Error("Layout-shift observation cap reached");
    let intervention = null;
    if (state.repair) {
      stage = "repair-hypothesis";
      await page.addStyleTag({ content: repair.css });
      intervention = await page.evaluate(({ classChanges, labelChanges }) => {
        const elements = [...document.querySelectorAll("main [class]")];
        if (elements.length > 20000) throw new Error("Repair element limit exceeded");
        const changedClasses = [], changedLabels = [];
        for (const e of elements) {
          const before = e.classList.value.trim().replace(/\s+/gu, " ");
          const change = classChanges.find((item) => item.before === before);
          if (change) {
            e.setAttribute("class", change.after);
            changedClasses.push({ tag: e.localName, text: e.textContent.trim().slice(0, 160), ...change });
            if (e.matches("dt")) {
              const label = labelChanges.find((item) => item.before === e.textContent.trim());
              if (label) { e.textContent = label.after; changedLabels.push(label); }
            }
          }
        }
        if (!changedClasses.length || changedClasses.length > 128 || changedLabels.length !== 4) throw new Error("Missing, drifted or oversized homepage repair targets");
        return { changedClasses, changedLabels, appliedThroughMs: performance.now() };
      }, repair);
      await page.waitForFunction(() => document.fonts.status === "loaded");
      await page.waitForTimeout(300);
    }
    // CSS zoom stresses reflow; this is explicitly not native browser zoom.
    if (state.cssZoom) {
      await page.evaluate((zoom) => { document.documentElement.style.zoom = String(zoom); }, state.cssZoom);
      await page.waitForTimeout(300);
    }
    stage = "inspection";
    const dom = await hashRenderedDom(page);
    const typography = await page.evaluate(sampleText);
    const foundations = await page.evaluate(inspectInterfaceFoundations);
    const compiledCss = compiled ? await page.evaluate(inspectCompiledCss) : null;
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
    let touchNavigation = null;
    if (compiled && state.id === "fresh-recovery") {
      const action = page.locator('main a[href="/quickstart"]').first();
      await action.tap();
      await page.waitForURL("http://127.0.0.1:4173/quickstart");
      await page.locator("h1").first().waitFor({ state: "visible" });
      await page.goBack();
      await page.waitForURL("http://127.0.0.1:4173/");
      await page.locator("h1").first().waitFor({ state: "visible" });
      touchNavigation = { target: "/quickstart", returnedToRoot: true, touchEmulation: true,
        scope: "One local compiled navigation/back recovery; not physical-device or interrupted-animation verification." };
    }
    return { site: site.id, requestedUrl: site.url, resolvedUrl: page.url(), state, started,
      finished: new Date().toISOString(), complete: true, httpStatus: response.status(),
      responseMetadata: Object.fromEntries(["date", "etag", "x-vercel-id", "x-matched-path"].filter((k) => headers[k]).map((k) => [k, headers[k]])),
      ...dom, typography, foundations, focus, pageErrors, fontResponses, blockedFontRequests: blocked, intervention, compiledCss, touchNavigation, motionInterruption,
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
  for (const site of selectedSites) for (const state of selectedStates) rows.push(await observe(browser, site, state));
} finally { await browser.close(); }
const report = {
  format: "starlight-live-typography-observation-v1",
  at: new Date().toISOString(),
  probeCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  candidateSourceCommit: process.env.PROBE_SOURCE_SHA ?? null,
  sourceBinding: compiled ? compiled.scope : "Probe revision only; live product deployment SHAs are unverified",
  browser: browser.version(),
  scope: compiled ? "Isolated compiled source-bound text/font/layout observations, CSS diagnostic nodes and limited local keyboard/touch navigation. No screenshots, visual/rights/human approval, native zoom, interrupted-animation, complete type inventory, WCAG or product-value verdict." : "Anonymous public-root text/font/layout observations. No screenshots, visual/rights/human approval, native zoom, complete type inventory, WCAG or product-value verdict.",
  rows,
  repairTrial: repair,
  compiledProduct: compiled,
  fallbackComparisons: selectedSites.map((site) => {
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
  expectedSamples: selectedSites.length * selectedStates.length
};
// Public-root observation completion still preserves defects. A compiled candidate
// additionally fails on the concrete repair regressions, never on visual taste.
const compiledChecks = compiledPhase !== "candidate" || rows.every((r) => r.complete &&
  r.typography.documentWidth <= r.typography.viewport.width && r.typography.diagnostics.uppercaseCount === 0 &&
  r.compiledCss.matched.every((m) => m.declarations.length && m.declarations.every((d) => d.textTransform === "none")) &&
  r.compiledCss.fixtureTextTransforms.every((m) => m.value === "none") &&
  (!r.state.blockFonts || ["reading", "action", "mono"].every((role) => {
    const sample = r.typography.samples.find((s) => s.role === role);
    return sample && sample.usedFonts.length && sample.usedFonts.every((f) => !/Serif/iu.test(f.family));
  }))) &&
  report.fallbackComparisons.every((c) => c.recoveredFaceSetEqualsNormal === true);
report.compiledRepairChecks = compiledPhase === "candidate" ? compiledChecks : null;
// Keep log lines bounded: large single-line reports can disappear in log readers.
console.log("STARLIGHT_TYPOGRAPHY_REPORT_BEGIN");
console.log(JSON.stringify(report, null, 2));
console.log("STARLIGHT_TYPOGRAPHY_REPORT_END");
process.exitCode = report.completeSamples === report.expectedSamples && compiledChecks ? 0 : 1;
