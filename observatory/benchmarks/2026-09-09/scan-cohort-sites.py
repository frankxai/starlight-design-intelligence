#!/usr/bin/env python3
"""Bounded, non-rendered public-page font declaration observations.

Uses only the standard library. No scripts, font files, images, authentication,
challenge workarounds, recursive crawling, or retries are used.
"""

import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import socket
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import build_opener, HTTPRedirectHandler, Request


MAX_BYTES = 2 * 1024 * 1024
SITE_SECONDS = 25
USER_AGENT = "BrandTypographyResearch/1.0 (public HTML/CSS observation; no rendering)"
BLOCKED_TITLE = re.compile(
    r"access denied|forbidden|just a moment|attention required|request rejected|"
    r"pardon our interruption|robot or human|verify you are human|security verification|"
    r"captcha|service unavailable|website blocked", re.I
)
BLOCKED_BODY = re.compile(
    r"verify (?:that )?you (?:are|['’]re) (?:a )?human|please complete the security check|"
    r"enable javascript and cookies to continue|your request has been blocked|"
    r"automated access (?:is|has been) (?:denied|blocked)|checking your browser before accessing",
    re.I,
)

# Sampling distinctions are about the selected URL, not assertions of ownership.
PROXIES = {
    "Google": ("corporate/about proxy", "The search/product interface is not sampled."),
    "Microsoft": ("corporate/product-portfolio surface", "One marketing page does not represent Windows, Office, Azure, and product UI."),
    "Amazon": ("corporate/about proxy", "The Amazon retail and AWS interfaces are not sampled."),
    "Facebook": ("parent-company newsroom proxy", "Meta newsroom typography cannot establish Facebook product typography."),
    "Instagram": ("brand/about surface", "The logged-in social application is not sampled."),
    "Walmart": ("corporate proxy", "The retail application is not sampled."),
    "YouTube": ("brand/about surface", "The video product interface is not sampled."),
    "ChatGPT": ("parent-company product-marketing surface", "OpenAI marketing typography cannot establish ChatGPT application typography."),
    "Netflix": ("corporate/about proxy", "The streaming application is not sampled."),
    "Telekom/T-Mobile": ("group corporate proxy", "The combined ranking name includes multiple market identities; T-Mobile US is not sampled."),
    "Alibaba": ("group corporate proxy", "Alibaba marketplace product interfaces are not sampled."),
    "Coca-Cola": ("company corporate proxy", "The beverage consumer identity is broader than this corporate page."),
    "Claude": ("product-marketing surface", "The authenticated Claude application is not sampled."),
    "The Home Depot": ("corporate proxy", "The retail application is not sampled."),
    "Marlboro": ("parent-company product proxy", "PMI typography cannot establish Marlboro typography; no age gate is traversed."),
    "Starbucks": ("corporate/about proxy", "The retail and rewards interfaces are not sampled."),
    "Disney": ("parent-company corporate proxy", "Consumer, parks, and streaming identities are not sampled."),
    "IQOS": ("parent-company product proxy", "PMI typography cannot establish the IQOS retail identity; no age gate is traversed."),
    "Toyota": ("corporate/global proxy", "Local retail and vehicle product interfaces are not sampled."),
    "ExxonMobil": ("corporate proxy", "Consumer service-station identities are not sampled."),
    "L'Oréal Paris": ("regional brand-marketing surface", "The US market may differ from other markets."),
}
TITLE_ALIASES = {
    "Google": ["google"], "Facebook": ["facebook", "meta"],
    "ChatGPT": ["chatgpt", "openai"], "Claude": ["claude", "anthropic"],
    "Marlboro": ["marlboro", "philip morris", "pmi"],
    "IQOS": ["iqos", "philip morris", "pmi"],
    "Telekom/T-Mobile": ["telekom", "t-mobile"],
    "The Home Depot": ["home depot"], "RBC": ["rbc", "royal bank"],
    "ICBC": ["icbc", "industrial", "工商"],
    "China Mobile": ["china mobile", "中国移动"],
    "HDFC Bank": ["hdfc"], "CommBank": ["commbank", "commonwealth"],
    "Ping An": ["ping an", "pingan", "平安"],
    "Dell Technologies": ["dell"], "L'Oréal Paris": ["l’oréal", "l'oreal", "l'oréal", "loreal"],
    "Agricultural Bank of China": ["agricultural", "农业"],
    "Xiaomi": ["xiaomi", "小米"], "Tata Consultancy Services": ["tata", "tcs"],
    "China Construction Bank": ["construction bank", "建设银行"],
    "China Life": ["china life", "中国人寿"], "Moutai": ["moutai", "茅台"],
    "BCA": ["bca", "central asia"], "ADP": ["adp", "automatic data processing"],
    "VMware": ["vmware", "broadcom"], "Snapdragon": ["snapdragon", "qualcomm"],
    "UnitedHealthcare": ["unitedhealthcare", "uhc"],
}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.styles = []
        self.inline_attributes = []
        self.stylesheet_urls = []
        self.text_parts = []
        self.in_head = False
        self.in_title = False
        self.in_style = False
        self.in_script = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.in_head = True
        if tag == "title" and self.in_head:
            self.in_title = True
        if tag == "style":
            self.in_style = True
        if tag in {"script", "noscript"}:
            self.in_script = True
        if tag == "link" and "stylesheet" in attrs.get("rel", "").lower().split():
            if attrs.get("href"):
                self.stylesheet_urls.append(attrs["href"])
        if attrs.get("style"):
            self.inline_attributes.append(attrs["style"])

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
        if tag == "title":
            self.in_title = False
        if tag == "style":
            self.in_style = False
        if tag in {"script", "noscript"}:
            self.in_script = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self.in_style:
            self.styles.append(data)
        elif not self.in_script:
            self.text_parts.append(data)


class BoundedRedirect(HTTPRedirectHandler):
    max_repeats = 2
    max_redirections = 5


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def normalize_space(text):
    return " ".join(text.split())


def fetch(url, deadline, raw_path, kind="html"):
    result = {"requested_url": url, "observed_at": utc_now()}
    if urlparse(url).scheme not in {"http", "https"}:
        return {**result, "status": "unsupported-url-scheme"}, ""
    if re.search(r"\.(?:woff2?|ttf|otf|eot)(?:$|\?)", url, re.I):
        return {**result, "status": "font-binary-url-skipped"}, ""
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        return {**result, "status": "site-time-budget-exhausted"}, ""
    try:
        opener = build_opener(BoundedRedirect())
        request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,text/css;q=0.9,*/*;q=0.1"})
        response = opener.open(request, timeout=min(8, remaining))
        with response:
            result.update({"http_status": response.status, "final_url": response.url,
                           "content_type": response.headers.get_content_type()})
            allowed_types = {"text/html", "application/xhtml+xml"} if kind == "html" else {"text/css", "text/plain"}
            if result["content_type"] not in allowed_types:
                return {**result, "status": "unsupported-content-type"}, ""
            data = bytearray()
            while len(data) <= MAX_BYTES and time.monotonic() < deadline:
                piece = response.read(min(65536, MAX_BYTES + 1 - len(data)))
                if not piece:
                    break
                data.extend(piece)
            truncated = len(data) > MAX_BYTES or time.monotonic() >= deadline
            payload = bytes(data[:MAX_BYTES])
            raw_path.write_bytes(payload)
            result.update({"status": "received", "bytes_observed": len(payload),
                           "sha256": hashlib.sha256(payload).hexdigest(), "truncated": truncated})
            encoding = response.headers.get_content_charset() or "utf-8"
            try:
                text = payload.decode(encoding, errors="replace")
            except LookupError:
                text = payload.decode("utf-8", errors="replace")
            return result, text
    except HTTPError as error:
        # Do not read/crawl error bodies or retry blocked requests.
        return {**result, "http_status": error.code, "final_url": error.url,
                "status": "http-blocked" if error.code in {401, 403, 429, 451} else "http-error"}, ""
    except (URLError, TimeoutError, socket.timeout, OSError) as error:
        return {**result, "status": "network-error", "error_type": type(error).__name__,
                "error_summary": str(error)[:200]}, ""


def css_observations(css):
    # Deliberately bounded declaration extraction, not a full CSS/layout engine.
    clean = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    values = re.findall(r"(?<![-\w])font-family\s*:\s*([^;}]+)", clean, re.I)
    families = set()
    unresolved = set()
    keywords = set()
    for value in values:
        if "var(" in value or "${" in value:
            unresolved.add(normalize_space(value)[:200])
        # Quoted names and unquoted identifiers; comma split does not resolve vars.
        for family in re.split(r",(?![^()]*\))", value):
            family = normalize_space(re.sub(r"\s*!important\s*$", "", family, flags=re.I)).strip("\"'")
            if family.casefold() in {"inherit", "initial", "unset", "revert", "revert-layer"}:
                keywords.add(family.casefold())
                continue
            if family and not any(c in family for c in "()${}<>;"):
                families.add(family[:120])
    faces = []
    for block in re.findall(r"@font-face\s*\{([^{}]*)\}", clean, re.I):
        face = {}
        for name in ("font-family", "font-style", "font-weight", "font-stretch", "font-display"):
            match = re.search(r"(?<![-\w])" + name + r"\s*:\s*([^;}]+)", block, re.I)
            if match:
                face[name.replace("-", "_")] = normalize_space(match.group(1)).strip("\"'")[:200]
        face["unicode_range_declared"] = bool(re.search(r"unicode-range\s*:", block, re.I))
        if face.get("font_family"):
            faces.append(face)
    deduped_faces = list({json.dumps(face, sort_keys=True): face for face in faces}.values())
    return {"declared_font_families": sorted(families, key=str.casefold),
            "css_font_family_keywords": sorted(keywords),
            "unresolved_font_family_values": sorted(unresolved),
            "font_face_definitions": deduped_faces,
            "uppercase_text_transform_declarations": len(re.findall(r"text-transform\s*:\s*uppercase\b", clean, re.I)),
            "small_caps_declarations": len(re.findall(r"font-variant(?:-caps)?\s*:\s*(?:all-)?small-caps\b", clean, re.I)),
            "font_family_declaration_count": len(values)}


def scan_brand(brand, raw_root, observed_date):
    started = time.monotonic()
    deadline = started + SITE_SECONDS
    raw_dir = raw_root / f"{brand['rank']:03d}"
    raw_dir.mkdir(parents=True, exist_ok=True)
    surface, limitation = PROXIES.get(brand["brand"], ("candidate public homepage", "A single response and locale cannot represent the full brand system or application."))
    item = {"rank": brand["rank"], "brand": brand["brand"], "candidate_url": brand["candidate_official_url"],
            "observed_date": observed_date, "official_ownership_status": "not-established-by-this-scan",
            "sample_surface": surface, "sampling_limitation": limitation,
            "identity_guidelines_status": "not-audited-by-this-scan", "sources": []}
    source, html = fetch(item["candidate_url"], deadline, raw_dir / "page.html")
    item["sources"].append({"kind": "html", **source})
    item["response_status"] = source["status"]
    item["page_title"] = None
    item["domain_relevance"] = "not-assessed"
    item["title_relevance"] = "not-assessed"
    if source["status"] != "received":
        item["observation_status"] = "blocked" if source["status"] == "http-blocked" else "unavailable"
        item["elapsed_seconds"] = round(time.monotonic() - started, 2)
        return item
    parser = PageParser()
    parser.feed(html)
    title = normalize_space(" ".join(parser.title_parts))[:500]
    body_text = normalize_space(" ".join(parser.text_parts))
    item["page_title"] = title or None
    host = (urlparse(source["final_url"]).hostname or "").removeprefix("www.")
    expected_host = (urlparse(item["candidate_url"]).hostname or "").removeprefix("www.")
    item["domain_relevance"] = "matches-candidate-host" if host == expected_host else "redirected-host-review-required"
    if item["brand"] == "ChatGPT" and host == "chatgpt.com":
        item["sample_surface"] = "redirected public product surface"
        item["sampling_limitation"] = "The OpenAI candidate URL redirected to ChatGPT's public surface. No authenticated session, actual rendered font, or application states were inspected."
    if item["brand"] == "Facebook" and host == "meta.com":
        item["sample_surface"] = "redirected parent-company corporate proxy"
        item["sampling_limitation"] = "The Meta corporate response cannot establish Facebook product typography."
    aliases = TITLE_ALIASES.get(item["brand"], [item["brand"].casefold()])
    item["title_relevance"] = "brand-or-parent-name-present" if any(a.casefold() in title.casefold() for a in aliases) else "manual-review-required"
    item["visible_text_characters_nonrendered"] = len(body_text)
    if BLOCKED_TITLE.search(title) or (len(body_text) < 5000 and BLOCKED_BODY.search(body_text)):
        item["observation_status"] = "blocked-challenge-page"
        item["elapsed_seconds"] = round(time.monotonic() - started, 2)
        return item
    if len(body_text) < 80:
        item["observation_status"] = "empty-or-script-dependent-page"
        item["elapsed_seconds"] = round(time.monotonic() - started, 2)
        return item
    css_chunks = parser.styles + [";".join(parser.inline_attributes)]
    item["inline_style_text_chunks"] = len(parser.styles)
    item["inline_style_attributes"] = len(parser.inline_attributes)
    links = list(dict.fromkeys(urljoin(source["final_url"], href) for href in parser.stylesheet_urls))
    item["linked_stylesheets_discovered"] = len(links)
    item["linked_stylesheets_sampled_limit"] = 3
    for i, url in enumerate(links[:3]):
        css_source, css = fetch(url, deadline, raw_dir / f"stylesheet-{i+1}.css", kind="stylesheet")
        # A CDN denial or text/html challenge must not be counted as CSS.
        css_source["kind"] = "linked-stylesheet"
        if css_source["status"] == "received":
            if css_source.get("content_type") not in {"text/css", "text/plain"} or re.search(r"<html\b|<!doctype\s+html", css[:1000], re.I):
                css_source["status"] = "non-css-response"
            else:
                css_chunks.append(css)
        item["sources"].append(css_source)
    item.update(css_observations("\n".join(css_chunks)))
    item["observation_status"] = "declarations-observed" if item["declared_font_families"] or item["unresolved_font_family_values"] else "css-font-keywords-only" if item["css_font_family_keywords"] else "page-observed-no-font-declarations-in-sample"
    item["elapsed_seconds"] = round(time.monotonic() - started, 2)
    return item


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cohort", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--raw-dir", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()
    repo_root = Path(__file__).resolve().parents[3]
    if args.raw_dir.resolve().is_relative_to(repo_root):
        parser.error("Raw third-party HTML/CSS must be stored outside the repository.")
    cohort = json.loads(args.cohort.read_text())
    brands = cohort["brands"]
    if len(brands) != 100 or sorted(b["rank"] for b in brands) != list(range(1, 101)):
        parser.error("Expected the complete, uniquely ranked 100-brand cohort.")
    args.raw_dir.mkdir(parents=True, exist_ok=True)
    results = []
    started_at = utc_now()
    with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 8))) as executor:
        futures = {executor.submit(scan_brand, brand, args.raw_dir, started_at[:10]): brand for brand in brands}
        for future in as_completed(futures):
            brand = futures[future]
            try:
                result = future.result()
            except Exception as error:
                result = {"rank": brand["rank"], "brand": brand["brand"],
                          "candidate_url": brand["candidate_official_url"], "observed_date": started_at[:10],
                          "observation_status": "scanner-error", "error_type": type(error).__name__,
                          "official_ownership_status": "not-established-by-this-scan"}
            results.append(result)
            if len(results) % 10 == 0:
                print(f"Attempted {len(results)}/100", flush=True)
    report = {"schema_version": "1.0.0", "cohort": cohort["cohort"],
              "ranking_source": cohort["ranking_source"], "started_at": started_at, "finished_at": utc_now(),
              "method": "Non-rendered public HTTP observations; inline styles plus first 3 linked stylesheets; no JS, imports, font files, authentication, retries or challenge bypass.",
              "evidence_scope": "Font names are declarations in the sampled response, not proof of computed fonts, licensed use, identity guidelines, or official domain ownership. Counts of uppercase CSS are not counts of rendered uppercase elements.",
              "limits": {"workers": max(1, min(args.workers, 8)), "site_budget_seconds": SITE_SECONDS,
                         "request_socket_timeout_max_seconds": 8, "max_bytes_per_response": MAX_BYTES,
                         "max_linked_stylesheets": 3, "max_redirects": 5},
              "coverage": {"cohort_size": 100, "attempted": len(results),
                           "observation_status_counts": dict(Counter(r["observation_status"] for r in results))},
              "brands": sorted(results, key=lambda row: row["rank"])}
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report["coverage"], ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
