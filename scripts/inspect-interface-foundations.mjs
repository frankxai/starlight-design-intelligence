// Pass this function directly to Playwright page.evaluate. Keep it self-contained.
// This checks observable defects. It does not score taste or implement WCAG auditing.
export function inspectInterfaceFoundations() {
  const failures = [];
  const seen = new Set();
  const elements = [...document.body.querySelectorAll("*")];
  const emoji = /\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]\uFE0F?\u20E3/u;
  const filler = /\blorem ipsum\b|\byour (?:brand|company|product) (?:name|here)\b/iu;
  const location = (element) => {
    const parts = [];
    let current = element;
    while (current && current !== document.body && parts.length < 6) {
      const siblings = current.parentElement
        ? [...current.parentElement.children].filter((item) => item.localName === current.localName)
        : [current];
      parts.unshift(`${current.localName}:nth-of-type(${siblings.indexOf(current) + 1})`);
      current = current.parentElement;
    }
    return `body > ${parts.join(" > ")}`;
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
  const hasEmoji = (text) => emoji.test(text.replace(/[\u00A9\u00AE\u2122]/gu, ""));
  const name = (element) => {
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const value = labelledBy.split(/\s+/u)
        .map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
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
      if (!parent.closest('[aria-hidden="true"],script,style,template') && visible(parent)) {
        text.push(walker.currentNode.textContent);
      }
    }
    const image = [...element.querySelectorAll("img[alt]")]
      .find((item) => !item.closest('[aria-hidden="true"]') && visible(item));
    const svgTitle = element.localName === "svg" ? element.querySelector("title")?.textContent : "";
    return (text.join(" ").trim() || svgTitle || image?.getAttribute("alt") ||
      element.getAttribute("title") || "").trim();
  };
  if (!document.body.innerText.trim()) {
    fail("empty-surface", document.body, "The rendered surface has no visible text.");
  }
  if (elements.length > 20000) {
    fail("inspection-limit", document.body, "Surface exceeds the bounded 20,000-element inspection limit.");
    return { failures, inspected_elements: 0, complete: false };
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,template,noscript,pre,code,kbd,samp,textarea,[contenteditable]") ||
      !visible(parent)) continue;
    if (hasEmoji(node.textContent)) {
      fail("emoji-interface", parent, "Replace interface emoji with intentional text or a licensed vector icon.");
    }
    if (filler.test(node.textContent)) {
      fail("placeholder-copy", parent, "Replace placeholder copy with source-backed product content.");
    }
  }
  for (const element of elements) {
    if (!visible(element)) continue;
    if (element.matches("iframe,object,embed") || element.shadowRoot) {
      fail("uninspected-subtree", element, "Inspect this embedded or shadow-DOM surface in its owning journey before accepting coverage.");
    }
    const style = getComputedStyle(element);
    for (const pseudo of ["::before", "::after"]) {
      const pseudoStyle = getComputedStyle(element, pseudo);
      if (pseudoStyle.display !== "none" && pseudoStyle.visibility !== "hidden" &&
        Number(pseudoStyle.opacity) > 0 && hasEmoji(pseudoStyle.content)) {
        fail("emoji-interface", element, "Replace CSS-generated emoji with a licensed vector icon.");
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
      const hidden = element.closest('[aria-hidden="true"]');
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
  return { failures, inspected_elements: elements.length, complete: true };
}
