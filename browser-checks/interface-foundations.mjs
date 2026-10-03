import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { inspectInterfaceFoundations } from "../scripts/inspect-interface-foundations.mjs";
import { inspectRenderedSurface } from "../scripts/validate-interface-foundations.mjs";

const browser = await chromium.launch({ headless: true });
let checks = 0;
const base = (body, css = "") => `<!doctype html><html lang="en"><head><style>
body{margin:24px;font:16px/1.5 system-ui}button{min-height:44px;padding:8px 16px}svg{width:20px;height:20px}
${css}</style></head><body><main>${body}</main></body></html>`;
async function inspect(body, css) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  try {
    await page.setContent(base(body, css));
    return await page.evaluate(inspectInterfaceFoundations);
  } finally { await page.close(); }
}
async function detects(code, body, css) {
  const result = await inspect(body, css);
  assert.ok(result.failures.some((finding) => finding.code === code), JSON.stringify(result));
  checks += 1;
}
try {
  const good = '<h1>Review your project</h1><p>Save your draft and resume editing later.</p><button><svg aria-hidden="true"><path d="M2 2h16v16H2z"/></svg>Save draft</button><a href="/projects">Open projects</a><label for="title">Project title</label><input id="title">';
  assert.deepEqual((await inspect(good)).failures, []); checks += 1;
  await detects("emoji-interface", "<h1>&#x1F680; Launch</h1>");
  await detects("emoji-interface", '<h1 id="title">Launch</h1><script>document.getElementById("title").append(" \\u{1F680}")</script>');
  await detects("emoji-interface", "<button>Launch</button>", 'button::before{content:"\\1f680"}');
  await detects("emoji-interface", "<button>&#49;&#65039;&#8419; Step</button>");
  await detects("placeholder-copy", "<h1>Your brand name</h1><p>Lorem ipsum dolor.</p>");
  await detects("unnamed-control", '<h1>Editor</h1><button><svg aria-hidden="true"><path d="M2 2h4"/></svg></button>');
  await detects("unnamed-control", '<h1>Editor</h1><input placeholder="Project title">');
  await detects("unnamed-control", '<h1>Editor</h1><button><span aria-hidden="true">Save</span></button>');
  await detects("uppercase-interface", "<h1>Review your project</h1>", "h1{text-transform:uppercase}");
  for (const href of ["", "#", "javascript:void(0)"]) await detects("placeholder-link", `<h1>Editor</h1><a href="${href}">Start</a>`);
  await detects("icon-semantics", '<h1>Editor</h1><svg><path d="M2 2h4"/></svg>');
  await detects("focusable-decoration", '<h1>Editor</h1><svg aria-hidden="true" tabindex="0"><path d="M2 2h4"/></svg>');
  await detects("horizontal-overflow", "<h1>Editor</h1><div>Wide content</div>", "div{width:1500px}");
  await detects("empty-surface", "");
  await detects("inspection-limit", `<h1>Editor</h1>${"<span></span>".repeat(20001)}`);
  await detects("uninspected-subtree", '<h1>Editor</h1><iframe title="Embedded editor" srcdoc="<p>Content</p>"></iframe>');
  await detects("uninspected-subtree", '<h1>Editor</h1><div id="host"></div><script>document.getElementById("host").attachShadow({mode:"open"}).innerHTML="<button>🚀</button>"</script>');
  // Hidden branches, editable user text, examples and legal marks do not become interface findings.
  assert.deepEqual((await inspect('<h1>Reference</h1><p>Copyright © 2026. Registered ®. Trademark ™.</p><pre>🚀 example</pre><code>🚀</code><div hidden>🚀 Lorem ipsum</div><div style="display:none">🚀</div><div contenteditable>🚀 a user draft</div>')).failures, []); checks += 1;
  assert.deepEqual((await inspect('<h1>Energy</h1><svg role="img" aria-labelledby="graphic-title"><title id="graphic-title">Energy use</title><path d="M2 2h4"/></svg><button aria-label="Save"><svg aria-hidden="true"><path d="M2 2h4"/></svg></button>')).failures, []); checks += 1;
  const samples = await inspectRenderedSurface({ browser, html: base(good), readySelector: "h1" });
  assert.equal(samples.length, 4);
  assert.ok(samples.every((sample) => sample.complete && !sample.failures.length && /^[0-9a-f]{64}$/u.test(sample.dom_sha256)));
  assert.deepEqual(new Set(samples.map((sample) => sample.viewport.width)), new Set([390, 1440])); checks += 1;
  await assert.rejects(inspectRenderedSurface({ browser, html: base(good), readySelector: "#missing" }), /Timeout/u); checks += 1;
} finally { await browser.close(); }

// Exercise the real process, output receipt, meaningful failure exit and overwrite refusal.
const root = mkdtempSync(join(tmpdir(), "interface-foundations-"));
try {
  const html = join(root, "surface.html");
  const output = join(root, "receipt.json");
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const args = ["scripts/validate-interface-foundations.mjs", "--html", html, "--ready-selector", "h1", "--commit", sha, "--output", output];
  writeFileSync(html, base("<h1>Project editor</h1><button>Save draft</button>"));
  execFileSync(process.execPath, args, { timeout: 60000 });
  const receipt = JSON.parse(readFileSync(output, "utf8"));
  assert.equal(receipt.verdict, "PASS"); assert.equal(receipt.source_commit_sha, sha); checks += 1;
  assert.throws(() => execFileSync(process.execPath, args, { timeout: 60000, stdio: "pipe" }), (error) => error.status === 2); checks += 1;
  writeFileSync(html, base("<h1>🚀 Launch</h1>"));
  args[args.indexOf("--output") + 1] = join(root, "rejected.json");
  assert.throws(() => execFileSync(process.execPath, args, { timeout: 60000, stdio: "pipe" }), (error) => error.status === 1); checks += 1;
  assert.equal(JSON.parse(readFileSync(args.at(-1), "utf8")).verdict, "REVISE");
} finally { rmSync(root, { recursive: true, force: true }); }
console.log(`Interface foundations: ${checks} real-browser and process checks passed.`);
