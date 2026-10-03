import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { inspectInterfaceFoundations } from "./inspect-interface-foundations.mjs";

export async function inspectRenderedSurface({ browser, url, html, readySelector }) {
  const samples = [];
  for (const width of [390, 1440]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion
      });
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.setDefaultNavigationTimeout(20000);
        if (url) {
          const response = await page.goto(url, { waitUntil: "domcontentloaded" });
          if (!response?.ok()) throw new Error(`Navigation failed with HTTP ${response?.status() ?? "unknown"}`);
        } else {
          await page.setContent(html, { waitUntil: "domcontentloaded" });
        }
        await page.locator(readySelector).first().waitFor({ state: "visible" });
        await page.waitForFunction(() => document.fonts.status === "loaded");
        const result = await page.evaluate(inspectInterfaceFoundations);
        samples.push({
          viewport: { width, height: 900 }, reduced_motion: reducedMotion,
          resolved_url: page.url(),
          dom_sha256: createHash("sha256").update(await page.content()).digest("hex"),
          ...result
        });
      } finally {
        await context.close();
      }
    }
  }
  return samples;
}

async function main() {
  const { values } = parseArgs({ options: {
    url: { type: "string" }, html: { type: "string" },
    "ready-selector": { type: "string" }, output: { type: "string" },
    commit: { type: "string" }, help: { type: "boolean" }
  } });
  if (values.help) {
    console.log("Usage: node scripts/validate-interface-foundations.mjs (--url URL | --html FILE) --ready-selector CSS --commit FULL_SHA [--output FILE]");
    return;
  }
  if (Boolean(values.url) === Boolean(values.html) || !values["ready-selector"] ||
    !/^[0-9a-f]{40}$/u.test(values.commit ?? "")) {
    throw new Error("Provide exactly one URL/HTML file, a visible ready selector and a full lowercase source commit SHA.");
  }
  if (values.url) {
    const parsed = new URL(values.url);
    if (!/^https?:$/u.test(parsed.protocol) || parsed.username || parsed.password) {
      throw new Error("Only HTTP(S) URLs without embedded credentials are supported.");
    }
  }
  const { chromium } = await import("playwright");
  // Never overwrite an existing evidence receipt.
  if (values.output && existsSync(resolve(values.output))) throw new Error("Output already exists; choose a new receipt path.");
  const html = values.html ? readFileSync(resolve(values.html), "utf8") : undefined;
  const browser = await chromium.launch({ headless: true });
  try {
    const samples = await inspectRenderedSurface({
      browser, url: values.url, html, readySelector: values["ready-selector"]
    });
    const passed = samples.length === 4 && samples.every((sample) => sample.complete && !sample.failures.length);
    const report = {
      schema_version: "starlight.interface_foundations.v1",
      source_commit_sha: values.commit,
      source_binding: "caller-supplied; deployment identity must be verified separately",
      inspected_at: new Date().toISOString(),
      input: values.url ? { url: values.url } : {
        html_sha256: createHash("sha256").update(html).digest("hex")
      },
      ready_selector: values["ready-selector"],
      verdict: passed ? "PASS" : "REVISE", samples
    };
    const serialized = `${JSON.stringify(report, null, 2)}\n`;
    if (values.output) writeFileSync(resolve(values.output), serialized, { flag: "wx" });
    else process.stdout.write(serialized);
    process.exitCode = passed ? 0 : 1;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Interface inspection failed: ${error.message}`);
    process.exitCode = 2;
  });
}
