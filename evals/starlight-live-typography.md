# Live Starlight typography observation

This probe gathers Chromium evidence from the existing lab, Academy and protocol
public roots. It uses the existing pinned Playwright and interface inspector.
It runs in a bounded cloud CI job; no local browser/dependency install is required.

The stacked protocol repair trial sets `PROTOCOL_REPAIR_TRIAL=1`. This selects only
the protocol root, with the six original baseline states and four additional
fresh repair contexts: normal 390 px, blocked fonts at 390 px and 320 px, and
blocked fonts with 2× CSS zoom. Its expected count is ten, not eighteen.
Without that flag the original three-site, eighteen-state observation remains.

The companion [four-file product patch](protocol-typography-repair-12d794a.patch)
targets protocol main `12d794a389959a2360bd4c920689510f0949f02b`, issue 197. It adds
fallback tails to the existing Inter/JetBrains Mono/Newsreader roles, replaces
fourteen source `uppercase` utilities, capitalizes four CensusStat labels, and
removes forced uppercase from four global CSS rules. It is a prepared integration
artifact, not applied product source. Existing product checkouts and PRs retain
their ownership.

The trial validates the patch SHA-256, derives its three family values and exact
class/label migrations, then adds a utility-layer stylesheet and migrates only
matching homepage class strings after fonts settle. Every applied change is
recorded beside the actual platform fonts and foundation findings. There is no
blanket uppercase override. The four global CSS selectors are outside this trial.
This is a runtime hypothesis on the current homepage, not a compiled preview of
the pinned product source. Initial loading and shift behavior are not simulated;
the raw early-load shift receipt precedes the intervention. Other routes, missing
source styles, deployed revision, visual craft and product acceptance stay open.
Use the matched normal-phone and blocked-phone baseline/trial pairs for causal
font comparisons; the additional blocked 320 px/zoom rows are separate stress
observations, without matching blocked baselines.

Each site receives fresh desktop, 390 px phone, 320 px phone, 2× CSS zoom,
blocked-webfont and fresh normal recovery contexts. The probe reads actual
headline/paragraph/action/secondary/mono/italic/numeral samples when present,
computed styles and geometry, and CDP platform fonts with glyph counts. A CSS
font-family stack alone cannot establish which face rendered those glyphs.
All contexts request reduced motion; normal-motion behavior is outside this run.

Font response hashes bind observed bytes; blocked requests and platform fonts
make fallback observable. Recovery uses a fresh navigation, not an in-page retry.
CDP's custom-font flag also includes locally resolved CSS faces, such as Next's
`local()` fallback faces. The receipt compares rendered names and intercepted
requests; it does not treat that flag as proof of a downloaded webfont.
Font queries target individual nonblank TextNodes. Chromium's element query
aggregates two layout levels, so summing every nested element would duplicate
glyph counts. Pseudo-generated text, canvas text and other subtrees remain outside
the typography sample; the separate foundation inspector covers its own scope.
Only five desktop Tab steps are sampled; no clicks, form submissions or signups.
The action sample is the first visible link/button in `main`, with its destination
recorded; it does not infer which action the product owner considers primary.
Light-DOM diagnostics include full paths, classes and clipping/scroll ancestors
for up to 64 elements outside the viewport and up to 64 uppercase text elements.
Their total counts and truncation flags remain explicit. An overflowing element
may be clipped or decorative; its geometry alone does not establish the cause
of document overflow. These diagnostics omit shadow and pseudo text; the separate
foundation inspector retains its existing coverage and shorter location labels.
No screenshots, videos, traces or generated visuals are exported. Existing
production designs and font choices are unchanged.

Read the JSON between `STARLIGHT_TYPOGRAPHY_REPORT_BEGIN` and
`STARLIGHT_TYPOGRAPHY_REPORT_END` in the CI log. Require both markers and parse the
actual receipt before relying on any observation. Exit zero means all expected
observations completed. Foundation defects, page errors and fallback
findings are still present in that report; job success is not a site PASS.
Missing rendered headline font samples, blocked-font scenarios without an intercepted request,
navigation/CDP errors or incomplete observations produce a nonzero exit.

CSS zoom is a reflow stress proxy, not native browser zoom. Early-load layout
shift entries include the browser's up to five impacted source nodes and a raw sum
over a bounded observation, not session-window CLS,
Lighthouse or field performance. Sampled text does not cover every used style,
language, component, viewport, browser or application. Platform font evidence
does not establish readability, taste, rights or accessible focus visibility.

The probe commit identifies the observer, not the product deployment. Before
release acceptance, bind each product to its actual deployed SHA and collect
desktop/mobile/fallback/native zoom visual specimens, rights and independent
review under its owning contract. Do not use this diagnostic log as the full
web release evidence bundle or close broader brand/product requirements with it.
