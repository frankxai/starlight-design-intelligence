"""Tests against false-positive evidence, not snapshots of report formatting."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

spec = importlib.util.spec_from_file_location("font_audit", Path(__file__).with_name("audit.py"))
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def square(height):
    pen = TTGlyphPen(None)
    pen.moveTo((0, 0))
    pen.lineTo((400, 0))
    pen.lineTo((400, height))
    pen.lineTo((0, height))
    pen.closePath()
    return pen.glyph()


def case_fixture(same_outlines):
    builder = FontBuilder(1000, isTTF=True)
    order = [".notdef"] + list(audit.string.ascii_letters)
    builder.setupGlyphOrder(order)
    builder.setupCharacterMap({ord(char): char for char in audit.string.ascii_letters})
    builder.setupGlyf({name: square(700 if same_outlines or name.isupper() else 500) for name in order})
    builder.setupHorizontalMetrics({name: (500, 0) for name in order})
    builder.setupHorizontalHeader(ascent=800, descent=-200)
    builder.setupNameTable({"familyName": "Evidence fixture", "styleName": "Regular"})
    builder.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
    builder.setupPost()
    return builder.font


class EvidenceTests(unittest.TestCase):
    def test_distinct_glyph_ids_do_not_pass_caps_only_outlines(self):
        evidence = audit.lowercase_evidence(case_fixture(True))
        self.assertFalse(evidence["passed"])
        self.assertEqual(evidence["identical_pairs"], list(audit.string.ascii_lowercase))

    def test_actual_distinct_lowercase_outlines_pass(self):
        self.assertTrue(audit.lowercase_evidence(case_fixture(False))["passed"])

    def test_missing_and_notdef_codepoints_are_gaps(self):
        evidence = audit.coverage({ord("a"): "a", ord("é"): ".notdef"}, "a é ñ")
        self.assertFalse(evidence["passed"])
        self.assertEqual(evidence["missing"], ["U+00E9 é", "U+00F1 ñ"])

    def test_source_filename_cannot_escape_cache(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError):
                audit.download("inter", "../unexpected.ttf", Path(directory))

    def test_duplicate_metadata_file_cannot_inflate_audit_coverage(self):
        entry = 'fonts {\n name: "Example"\n filename: "Example.ttf"\n}\n'
        with self.assertRaises(ValueError):
            audit.metadata_fonts(entry + entry)

    def test_different_fonts_with_one_postscript_name_raise_collision_evidence(self):
        files = [{"filename": "Regular.ttf", "sha256": "first", "names": {"postscript": ["Example-Regular"]}},
                 {"filename": "Bold.ttf", "sha256": "second", "names": {"postscript": ["Example-Regular"]}}]
        self.assertEqual(len(audit.postscript_collisions(files)), 1)
        files[1]["sha256"] = "first"
        self.assertEqual(audit.postscript_collisions(files), [])


if __name__ == "__main__":
    unittest.main()
