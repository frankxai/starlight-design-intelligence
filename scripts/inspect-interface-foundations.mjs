// Pass this function directly to Playwright page.evaluate. Keep it self-contained.
// This checks observable defects. It does not score taste or implement WCAG auditing.
export function inspectInterfaceFoundations() {
  const failures = [];
  const seen = new Set();
  const elements = [];
  const roots = [document.body];
  const emoji = /\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]\uFE0F?\u20E3/u;
  const filler = /\blorem ipsum\b|\byour (?:brand|company|product) (?:name|here)\b/iu;
  const location = (element) => {
    const parts = [];
    let current = element;
    while (current && current !== document.body && parts.length < 6) {
      const siblings = current.parentNode?.children
        ? [...current.parentNode.children].filter((item) => item.localName === current.localName)
        : [current];
      parts.unshift(`${current.localName}:nth-of-type(${siblings.indexOf(current) + 1})`);
      if (!current.parentElement && current.getRootNode().host) {
        parts.unshift("#shadow-root");
        current = current.getRootNode().host;
      } else current = current.parentElement;
    }
    return `body > ${parts.join(" > ")}`.replaceAll(" > #shadow-root > ", " >>> ");
  };
  const fail = (code, element, message) => {
    const selector = element === document.body ? "body" : location(element);
    const key = `${code}:${selector}`;
    if (seen.has(key)) return;
    seen.add(key);
    failures.push({ code, selector, message });
  };
  const visible = (element) => element.checkVisibility({
    checkOpacity: true,
    checkVisibilityCSS: true
  }) && element.getClientRects().length > 0;
  // Plain directional arrows are text. An explicit emoji presentation selector
  // still rejects them. Do not exempt pictographic symbols or arbitrary spans.
  const hasEmoji = (text) => emoji.test(text.replace(/[\u00A9\u00AE\u2122]/gu, "")
    .replace(/[\u2194-\u2199\u21A9\u21AA](?!\uFE0F)/gu, ""));
  const closest = (element, selector) => {
    for (let current = element; current; current = current.getRootNode().host) {
      const match = current.closest(selector);
      if (match) return match;
    }
    return null;
  };
  // Inspect top-level text tokens, not quoted URLs nested inside image functions.
  const hasPseudoText = (content) => {
    const textFunction = /(?:counters?|attr)\(/uy;
    let depth = 0;
    for (let index = 0; index < content.length; index += 1) {
      const character = content[index];
      if (character === '"' || character === "'") {
        const start = index + 1;
        for (index += 1; index < content.length && content[index] !== character; index += 1) {
          if (content[index] === "\\") index += 1;
        }
        if (depth === 0 && /\p{L}/u.test(content.slice(start, index))) return true;
      } else if (character === "(") depth += 1;
      else if (character === ")") depth = Math.max(0, depth - 1);
      else if (depth === 0) {
        textFunction.lastIndex = index;
        if (textFunction.test(content)) return true;
      }
    }
    return false;
  };
  const name = (element) => {
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const value = labelledBy.split(/\s+/u)
        .map((id) => element.getRootNode().getElementById(id)?.textContent ?? "").join(" ").trim();
      if (value) return value;
    }
    const explicit = element.getAttribute("aria-label")?.trim();
    if (explicit) return explicit;
    const labels = [...(element.labels ?? [])].map((label) => label.textContent).join(" ").trim();
    if (labels) return labels;
    if (element.localName === "input" && /^(button|submit|reset)$/u.test(element.type)) {
      return element.value || ({ submit: "Submit", reset: "Reset" })[element.type] || "";
    }
    const text = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (!closest(parent, '[aria-hidden="true"],script,style,template') && visible(parent)) {
        text.push(walker.currentNode.textContent);
      }
    }
    const image = [...element.querySelectorAll("img[alt]")]
      .find((item) => !closest(item, '[aria-hidden="true"]') && visible(item));
    const svgTitle = element.localName === "svg" ? element.querySelector("title")?.textContent : "";
    return (text.join(" ").trim() || svgTitle || image?.getAttribute("alt") ||
      element.getAttribute("title") || "").trim();
  };
  // Collect reachable open roots iteratively. The one budget covers light DOM
  // and every nested open shadow root; closed roots remain outside our scope.
  for (let index = 0; index < roots.length; index += 1) {
    for (const element of roots[index].querySelectorAll("*")) {
      elements.push(element);
      if (elements.length > 20000) {
        fail("inspection-limit", document.body, "Surface exceeds the bounded 20,000-element inspection limit.");
        return { failures, inspected_elements: 0, complete: false };
      }
      if (element.shadowRoot) roots.push(element.shadowRoot);
    }
  }
  let hasVisibleText = false;
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement ?? root.host;
      if (!parent || closest(parent, "script,style,template,noscript") || !visible(parent)) continue;
      if (node.textContent.trim()) hasVisibleText = true;
      if (closest(parent, "pre,code,kbd,samp,textarea,[contenteditable]")) continue;
      // Labels, badges and captions are visible interface text too. Restricting
      // this rule to headings/controls missed real product uppercase styling.
      if (/\p{L}/u.test(node.textContent) && getComputedStyle(parent).textTransform === "uppercase") {
        fail("uppercase-interface", parent, "Use sentence case; remove forced uppercase styling.");
      }
      if (hasEmoji(node.textContent)) {
        fail("emoji-interface", parent, "Replace interface emoji with intentional text or a licensed vector icon.");
      }
      if (filler.test(node.textContent)) {
        fail("placeholder-copy", parent, "Replace placeholder copy with source-backed product content.");
      }
    }
  }
  if (!hasVisibleText) fail("empty-surface", document.body, "The rendered surface has no visible text.");
  for (const element of elements) {
    if (!visible(element)) continue;
    if (element.matches("iframe,object,embed")) {
      fail("uninspected-subtree", element, "Inspect this embedded surface in its owning journey before accepting coverage.");
    }
    const style = getComputedStyle(element);
    for (const pseudo of ["::before", "::after"]) {
      const pseudoStyle = getComputedStyle(element, pseudo);
      if (pseudoStyle.display === "none" || pseudoStyle.visibility === "hidden" ||
        Number(pseudoStyle.opacity) <= 0) continue;
      if (hasEmoji(pseudoStyle.content)) {
        fail("emoji-interface", element, "Replace CSS-generated emoji with a licensed vector icon.");
      }
      if (!closest(element, "pre,code,kbd,samp,textarea,[contenteditable]") &&
        hasPseudoText(pseudoStyle.content) &&
        pseudoStyle.textTransform === "uppercase") {
        fail("uppercase-interface", element, "Use sentence case; remove forced uppercase styling.");
      }
    }
    const interactive = element.matches(
      "button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=link],[role=checkbox],[role=combobox],[role=radio],[role=switch],[role=textbox]"
    );
    if (interactive && !name(element)) {
      fail("unnamed-control", element, "Give this control an explicit accessible name.");
    }
    if ((interactive || element.matches("h1,h2,h3,h4,h5,h6,[role=heading]")) &&
      style.textTransform === "uppercase") {
      fail("uppercase-interface", element, "Use sentence case; remove forced uppercase styling.");
    }
    if (element.matches("a[href]")) {
      const href = element.getAttribute("href").trim();
      if (!href || href === "#" || /^javascript:/iu.test(href)) {
        fail("placeholder-link", element, "Use a real destination or a button for an in-page action.");
      }
    }
    if (element.localName === "svg") {
      const hidden = closest(element, '[aria-hidden="true"]');
      if (hidden && element.matches('[tabindex]:not([tabindex="-1"])')) {
        fail("focusable-decoration", element, "A decorative icon must not receive keyboard focus.");
      } else if (!hidden && !(element.getAttribute("role") === "img" && name(element))) {
        fail("icon-semantics", element, "Hide decorative SVGs from assistive technology; give meaningful graphics role=img and a name.");
      }
    }
  }
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    fail("horizontal-overflow", document.body, "The surface overflows the CSS viewport horizontally.");
  }
  return { failures, inspected_elements: elements.length, inspected_open_shadow_roots: roots.length - 1, complete: true };
}
