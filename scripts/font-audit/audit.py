#!/usr/bin/env python3
"""Inspect pinned upstream font files, without treating evidence as release approval.

Raw downloads must stay outside the checkout. The report contains metadata,
hashes, source links and measurements; it does not redistribute font software.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import io
import json
import re
import string
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

import fontTools
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, features
import PIL

COMMIT = "334b789e33413f3aba4264d9aa6c97f7b94c5a2f"
FAMILIES = {
    "inter": "Inter", "instrumentsans": "Instrument Sans",
    "instrumentserif": "Instrument Serif", "geist": "Geist",
    "geistmono": "Geist Mono", "fraunces": "Fraunces",
    "newsreader": "Newsreader", "sourceserif4": "Source Serif 4",
    "ibmplexmono": "IBM Plex Mono", "jetbrainsmono": "JetBrains Mono",
    "poppins": "Poppins", "playfairdisplay": "Playfair Display",
    "manrope": "Manrope", "bricolagegrotesque": "Bricolage Grotesque",
}
SAMPLES = {
    "en": "Build something worth believing in. The quick brown fox jumps over the lazy dog. “Clear ideas”—we’re ready!",
    "nl": "Een heldere richting voor iedereen. IJsselmeer, naïef, ideeën, creëren, geëerd, ruïne, café.",
    "de": "Grüße aus Köln: Äpfel, Öl, Übermut, Straße und große Ideen. ÄÖÜäöüßẞ.",
    "fr": "L’idée prend forme : cœur, œuvre, français, Noël, où, sûr, bientôt. ÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸàâæçéèêëîïôœùûüÿ.",
    "es": "Diseña con claridad. ¿Cómo estás? ¡Qué alegría! ÁÉÍÓÚÜÑáéíóúüñ.",
    "symbols": "0O 1Il | 0123456789 € £ $ ¥ + − × ÷ → @ & % ( ) [ ] / : ; … – — ‘ ’ “ ”",
}
BODY = "Build something worth believing in. Clear ideas become useful tools when every detail helps people understand what comes next."
NAME_IDS = {0: "copyright", 1: "family", 2: "subfamily", 4: "full_name",
            5: "version", 6: "postscript", 8: "manufacturer", 9: "designer",
            11: "vendor_url", 13: "license", 14: "license_url",
            16: "typographic_family", 17: "typographic_subfamily"}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def raw_url(slug: str, filename: str) -> str:
    return f"https://raw.githubusercontent.com/google/fonts/{COMMIT}/ofl/{slug}/" + urllib.parse.quote(filename)


def download(slug: str, filename: str, cache: Path) -> Path:
    # Only METADATA-declared basenames can become cache paths.
    if Path(filename).name != filename or filename in {"", ".", ".."}:
        raise ValueError(f"Unsafe source filename: {filename!r}")
    path = cache / COMMIT / slug / filename
    if not path.exists():
        request = urllib.request.Request(raw_url(slug, filename), headers={"User-Agent": "Starlight-font-evidence/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read()
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".part")
        temporary.write_bytes(data)
        temporary.replace(path)
    return path


def quoted_field(text: str, key: str) -> str | None:
    match = re.search(r"^\s*" + re.escape(key) + r':\s*("(?:[^"\\]|\\.)*")', text, re.M)
    return json.loads(match.group(1)) if match else None


def metadata_fonts(text: str) -> list[dict]:
    # Each fonts block contains scalar fields in the pinned Google Fonts schema.
    blocks = re.findall(r"^fonts\s*\{([^{}]*)\}", text, re.M)
    result = []
    for block in blocks:
        weight = re.search(r"^\s*weight:\s*(\d+)", block, re.M)
        result.append({key: quoted_field(block, key) for key in
                       ("name", "filename", "style", "post_script_name", "full_name", "copyright")}
                      | {"weight": int(weight.group(1)) if weight else None})
    if not result or any(not item["filename"] for item in result):
        raise ValueError("No complete font entries in METADATA.pb")
    if len({item["filename"] for item in result}) != len(result):
        raise ValueError("Duplicate font entries in METADATA.pb")
    return result


def read_names(font: TTFont) -> dict[str, list[str]]:
    result = {}
    for number, key in NAME_IDS.items():
        values = sorted({record.toUnicode() for record in font["name"].names if record.nameID == number})
        result[key] = values
    return result


def coverage(cmap: dict, sample: str) -> dict:
    required = sorted({ord(char) for char in unicodedata.normalize("NFC", sample) if not char.isspace()})
    missing = [codepoint for codepoint in required if codepoint not in cmap or cmap[codepoint] == ".notdef"]
    return {"required_unique_codepoints": len(required), "missing": [f"U+{n:04X} {chr(n)}" for n in missing], "passed": not missing}


def lowercase_evidence(font: TTFont) -> dict:
    cmap = font.getBestCmap() or {}
    glyphs = font.getGlyphSet()
    missing, identical, distinct = [], [], []
    for lower, upper in zip(string.ascii_lowercase, string.ascii_uppercase):
        if ord(lower) not in cmap or ord(upper) not in cmap:
            missing.append(lower)
            continue
        outlines = []
        for char in (lower, upper):
            pen = DecomposingRecordingPen(glyphs)
            glyphs[cmap[ord(char)]].draw(pen)
            outlines.append(pen.value)
        (identical if outlines[0] == outlines[1] else distinct).append(lower)
    return {"scope": "ASCII a-z against A-Z; decomposed outlines at file default axes, exact coordinates",
            "distinct_pairs": distinct, "identical_pairs": identical, "missing_pairs": missing,
            "passed": len(distinct) == 26,
            "limitation": "An outline difference is not a visual judgment of lowercase design or readability. Scaled or translated uppercase outlines can pass; inspect rendered lowercase and small-caps behavior separately."}


def pillow_font(path: Path, size: int, axes: list[dict], weight: int | None = None):
    try:
        face = ImageFont.truetype(str(path), size)
    except OSError:
        if path.suffix.lower() not in {".woff", ".woff2"}:
            raise
        # Decode the container in memory for FreeType; hash/inspect original bytes.
        font = TTFont(path)
        font.flavor = None
        buffer = io.BytesIO()
        font.save(buffer)
        font.close()
        buffer.seek(0)
        face = ImageFont.truetype(buffer, size)
    if axes:
        values = [axis["default"] for axis in axes]
        if weight is not None:
            for index, axis in enumerate(axes):
                if axis["tag"] == "wght":
                    if not axis["min"] <= weight <= axis["max"]:
                        raise ValueError(f"Unavailable real weight: {weight}")
                    values[index] = weight
        face.set_variation_by_axes(values)
    return face


def wrap(text: str, face, width: int) -> list[str]:
    lines, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if line and face.getlength(candidate) > width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def inspect_file(path: Path, declared: dict, slug: str) -> dict:
    data = path.read_bytes()
    font = TTFont(path, checkChecksums=2)
    names = read_names(font)
    axes = [{"tag": axis.axisTag, "min": axis.minValue, "default": axis.defaultValue, "max": axis.maxValue}
            for axis in font["fvar"].axes] if "fvar" in font else []
    instances = [{"name": font["name"].getDebugName(instance.subfamilyNameID), "coordinates": instance.coordinates}
                 for instance in font["fvar"].instances] if "fvar" in font else []
    cmap = font.getBestCmap() or {}
    selection = font["OS/2"].fsSelection
    italic = bool(selection & 1)
    weights = next(({"kind": "variable", "min": a["min"], "max": a["max"], "default": a["default"]}
                    for a in axes if a["tag"] == "wght"),
                   {"kind": "static", "value": font["OS/2"].usWeightClass})
    face = pillow_font(path, 18, axes)
    layouts = {}
    for viewport, content in ((320, 288), (390, 358), (1440, 660)):
        lines = wrap(BODY, face, content)
        layouts[str(viewport)] = {"content_width_px": content, "font_px": 18, "line_height_px": 29,
                                  "line_count": len(lines), "max_line_advance_px": round(max(map(face.getlength, lines)), 3),
                                  "fits_by_advance": all(face.getlength(line) <= content for line in lines)}
    expected_style = "italic" if italic else "normal"
    checks = {
        "declared_family_matches_internal": declared["name"] in names["typographic_family"] + names["family"],
        "declared_postscript_matches_internal": declared["post_script_name"] in names["postscript"],
        "declared_style_matches_italic_flag": declared["style"] == expected_style,
        "declared_weight_supported": (weights["min"] <= declared["weight"] <= weights["max"])
        if weights["kind"] == "variable" else declared["weight"] == font["OS/2"].usWeightClass,
        "license_metadata_present": bool(names["license"] and names["license_url"]),
        "copyright_present": bool(names["copyright"]),
    }
    report = {"filename": path.name, "source_url": raw_url(slug, path.name), "sha256": sha256(data), "size_bytes": len(data),
              "declared": declared, "names": names, "axes": axes, "named_instances": instances,
              "weight_support": weights, "os2_weight_class": font["OS/2"].usWeightClass,
              "style": {"os2_italic": italic, "os2_oblique": bool(selection & 512), "post_italic_angle": font["post"].italicAngle,
                        "head_italic": bool(font["head"].macStyle & 2), "synthetic_transform_used": False},
              "embedding": {"fsType": font["OS/2"].fsType,
                            "meaning": "Technical embedding flag only; does not establish legal rights."},
              "metrics": {"units_per_em": font["head"].unitsPerEm, "glyph_count": font["maxp"].numGlyphs,
                          "unicode_codepoint_count": len(cmap), "x_height": getattr(font["OS/2"], "sxHeight", None),
                          "cap_height": getattr(font["OS/2"], "sCapHeight", None)},
              "checks": checks, "lowercase": lowercase_evidence(font),
              "sample_coverage": {language: coverage(cmap, sample) for language, sample in SAMPLES.items()},
              "layout_measurements": layouts}
    font.close()
    return report


def inspect_family(slug: str, cache: Path) -> dict:
    metadata_path = download(slug, "METADATA.pb", cache)
    metadata = metadata_path.read_text()
    if quoted_field(metadata, "license") != "OFL":
        raise ValueError(f"{slug}: unexpected license; stop and review")
    license_path = download(slug, "OFL.txt", cache)
    license_text = license_path.read_text()
    if "SIL OPEN FONT LICENSE Version 1.1" not in license_text:
        raise ValueError(f"{slug}: missing expected OFL 1.1 text; stop and review")
    # This header is evidence, not an automated opinion about all reserved names.
    header = re.split(r"This Font Software|This font software|SIL OPEN FONT LICENSE", license_text, maxsplit=1)[0].strip("\n -")
    entries = metadata_fonts(metadata)
    files = [inspect_file(download(slug, entry["filename"], cache), entry, slug) for entry in entries]
    return {"family": FAMILIES[slug], "slug": slug, "status": "evidence-collected; production-and-rights-review-required",
            "designer_declared": quoted_field(metadata, "designer"),
            "upstream_repository_declared": quoted_field(metadata, "repository_url"),
            "metadata_source": {"url": raw_url(slug, "METADATA.pb"), "sha256": sha256(metadata_path.read_bytes())},
            "license": {"name": "SIL Open Font License 1.1", "spdx": "OFL-1.1", "source_url": raw_url(slug, "OFL.txt"),
                        "sha256": sha256(license_path.read_bytes()), "copyright_and_reserved_name_header": header,
                        "reserved_name_declaration_in_header": bool(re.search(r"reserved\s+font\s+name", header, re.I)),
                        "human_review": "required; inspect exact header and accompanying metadata before modification/distribution"},
            "files": files}


def postscript_collisions(files: list[dict]) -> list[dict]:
    groups = {}
    for file in files:
        for name in file["names"]["postscript"]:
            groups.setdefault(name, []).append(file)
    return [{"postscript_name": name, "files": [file["filename"] for file in group],
             "sha256": [file["sha256"] for file in group]}
            for name, group in groups.items() if len({file["sha256"] for file in group}) > 1]


def markdown_report(report: dict) -> str:
    lines = ["# Exact font-file evidence", "", f"Collected {report['observed_on']} from one pinned Google Fonts distribution commit.", "",
             "This audit inspects upstream TTFs and their exact metadata/license files. It does not establish that a deployed website, Figma, Canva, PDF, or document uses those bytes. Production approval remains open.", "",
             f"Source: [`google/fonts@{COMMIT[:12]}`](https://github.com/google/fonts/tree/{COMMIT}).", "",
             "| Family | Files | Real styles and weights | Sample glyph gaps | Identity checks |",
             "| --- | ---: | --- | --- | --- |"]
    for family in report["families"]:
        supports = []
        for style in (False, True):
            matching = [file for file in family["files"] if file["style"]["os2_italic"] == style]
            if not matching:
                continue
            weight_descriptions = []
            for file in matching:
                support = file["weight_support"]
                if support["kind"] == "variable":
                    description = f"{support['min']:g}–{support['max']:g}"
                else:
                    description = str(file["declared"]["weight"])
                    if file["declared"]["weight"] != support["value"]:
                        description += f" (OS/2 {support['value']})"
                weight_descriptions.append(description)
            supports.append(("Italic " if style else "Roman ") + ", ".join(dict.fromkeys(weight_descriptions)))
        gaps = sorted({gap for file in family["files"] for sample in file["sample_coverage"].values() for gap in sample["missing"]})
        problems = sorted({name for file in family["files"] for name, passed in file["checks"].items() if not passed})
        lines.append(f"| {family['family']} | {len(family['files'])} | {'; '.join(supports)} | {', '.join(gaps) or 'None in the six samples'} | {', '.join(problems) or 'Pass'} |")
    lines += ["", "## What passed", "",
              f"- {report['summary']['file_count']} font files were parsed; hashes, internal names, exact versions, notices, axes and embedding flags are recorded in `font-evidence.json`.",
              f"- {report['summary']['lowercase_pass_count']} files have 26 distinct lowercase/uppercase outline pairs at default axes. This is a mechanical check, not proof of attractive lowercase design.",
              f"- {report['summary']['all_sample_coverage_pass_count']} files cover every codepoint in the English, Dutch, German, French, Spanish and symbol samples. This is sample coverage, not complete language certification.",
              "- Every file was measured at its real default style at 18 px in 288, 358 and 660 px text widths. No synthetic weight or slant was used.",
              f"- {len(report['summary']['postscript_collision_groups'])} groups reuse a PostScript name across different file hashes in this acquisition set.",
              "", "## Specific findings", "",
              "- Poppins Thin/ThinItalic declare weight 100 in METADATA but contain OS/2 weight 250. ExtraLight/ExtraLightItalic declare 200 but contain 275. Treat those four inconsistencies as review items; do not silently rewrite the font files or infer CSS weight mapping from filenames alone.",
              "- Variable font defaults can differ legitimately from the declared selection weight: Fraunces defaults to 900, Manrope to 200, and Bricolage Grotesque to 800, while all support 400. Set intended axis coordinates explicitly. A supported selection inside the axis range passes; a static mismatch is flagged.",
              "- Manrope and Bricolage Grotesque have no italic source file in this snapshot. Instrument Serif has Roman and italic 400 only. A requested bold Instrument Serif or italic Manrope/Bricolage would need an actual separately verified face; browser synthesis is rejected.",
              "- Instrument Serif, Fraunces and Newsreader lack the tested right arrow. Poppins also lacks the tested capital sharp S. Use a verified icon for arrows and inspect localized copy; never assume automatic fallback is visually acceptable.",
              "", "## What remains open", "",
              "- A second reviewer must inspect any failed identity checks and every family’s reserved-name header. OFL conditions and rights decisions are recorded separately in `rights-matrix.md`.",
              "- Google Fonts distribution files are candidates for controlled acquisition. Their hashes do not approve older repository copies, differently versioned app packages, hosted subsets or design-tool fonts.",
              "- Body measurements use Pillow/FreeType, not CSS. Browser shaping, wrapping, fallback state, loading, layout shift, 200% zoom, all supported languages, exported documents and actual Figma/Canva styles still require surface-specific evidence.",
              "- A variable font was inspected for all axes and named instances, but its continuous design space was not exhaustively rendered. Raster specimens show each source file at its defaults; the contact sheet uses real weight 400 when supported.",
              "- The report does not compare quality by file size or rank fonts automatically. Choose roles through rendered comparisons with real product copy.", ""]
    return "\n".join(lines)


def render_specimens(report: dict, cache: Path, output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    ui_path = cache / COMMIT / "inter" / report["families"][0]["files"][0]["filename"]
    ui_axes = report["families"][0]["files"][0]["axes"]
    ui = pillow_font(ui_path, 23, ui_axes, 400)
    label = pillow_font(ui_path, 19, ui_axes, 400)
    title = pillow_font(ui_path, 42, ui_axes, 600)
    ink, muted, line, paper = "#202725", "#54615d", "#d9ded8", "#f7f7f1"
    contact = Image.new("RGB", (2200, 3380), paper)
    draw = ImageDraw.Draw(contact)
    draw.text((70, 45), "Type that sounds like us", font=title, fill=ink)
    draw.text((70, 105), "Fourteen real font families · original copy · exact upstream files · 9 September 2026", font=ui, fill=muted)
    draw.text((70, 140), "Roman 400 at 42 px · default width and optical axes · same scale, no synthetic styles", font=ui, fill=muted)
    pages = []
    for index, family in enumerate(report["families"]):
        roman = next(file for file in family["files"] if not file["style"]["os2_italic"] and
                     (file["weight_support"]["kind"] == "variable" or file["weight_support"].get("value") == 400))
        path = cache / COMMIT / family["slug"] / roman["filename"]
        face = pillow_font(path, 42, roman["axes"], 400)
        body = pillow_font(path, 26, roman["axes"], 400)
        x, y = 70 + (index % 2) * 1080, 230 + (index // 2) * 440
        draw.text((x, y), family["family"], font=ui, fill=muted)
        draw.text((x, y + 46), "Build something", font=face, fill=ink)
        draw.text((x, y + 104), "worth believing in.", font=face, fill=ink)
        draw.text((x, y + 180), "Clear ideas. Useful tools. Human stories.", font=body, fill=ink)
        draw.text((x, y + 225), "a e g n r · 0O 1Il · 0123456789", font=body, fill=ink)
        draw.text((x, y + 270), "café · naïef · Straße · cœur · mañana", font=body, fill=ink)
        draw.line((x, y + 355, x + 970, y + 355), fill=line, width=1)
        height = max(1100, 280 + len(family["files"]) * 135)
        page = Image.new("RGB", (1500, height), paper)
        d = ImageDraw.Draw(page)
        d.text((70, 45), family["family"], font=title, fill=ink)
        d.text((70, 105), "Every declared font file · real file defaults · no synthetic styles", font=ui, fill=muted)
        for i, file in enumerate(family["files"]):
            f = pillow_font(cache / COMMIT / family["slug"] / file["filename"], 35, file["axes"])
            row = 190 + i * 135
            d.text((70, row), file["filename"], font=label, fill=muted)
            d.text((70, row + 37), "Clear ideas become useful tools. a e g n r · café · 0123456789", font=f, fill=ink)
            d.text((70, row + 85), "SHA-256 " + file["sha256"][:20] + "… · full identity and axes in font-evidence.json", font=label, fill=muted)
        pages.append(page)
    contact.save(output / "font-contact-sheet.png", optimize=True)
    contact.save(output / "font-file-specimens.pdf", "PDF", resolution=150, save_all=True, append_images=pages)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--observed-on", default="2026-09-09")
    parser.add_argument("--render-dir", type=Path)
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[2]
    if args.cache.resolve().is_relative_to(repo):
        parser.error("--cache must be outside the repository; do not add raw third-party fonts")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        families = list(executor.map(lambda slug: inspect_family(slug, args.cache), FAMILIES))
    files = [file for family in families for file in family["files"]]
    report = {"schema": "starlight.font_file_evidence.v1", "observed_on": args.observed_on,
              "source": {"repository": "https://github.com/google/fonts", "commit": COMMIT,
                         "scope": "Every font file declared in METADATA.pb for the fourteen named families; not every upstream release or format."},
              "tools": {"python": sys.version.split()[0], "fonttools": fontTools.__version__, "pillow": PIL.__version__,
                        "freetype": features.version("freetype2"), "raqm": features.version("raqm")},
              "samples": SAMPLES, "measurement_copy": BODY, "families": families,
              "summary": {"family_count": len(families), "file_count": len(files),
                          "lowercase_pass_count": sum(file["lowercase"]["passed"] for file in files),
                          "all_sample_coverage_pass_count": sum(all(sample["passed"] for sample in file["sample_coverage"].values()) for file in files),
                          "identity_checks_pass_count": sum(all(file["checks"].values()) for file in files),
                          "postscript_collision_groups": postscript_collisions(files),
                          "zero_embedding_flag_count": sum(file["embedding"]["fsType"] == 0 for file in files)}}
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "font-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    (args.output / "README.md").write_text(markdown_report(report))
    if args.render_dir:
        render_specimens(report, args.cache, args.render_dir)
    print(json.dumps(report["summary"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
