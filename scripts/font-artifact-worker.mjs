import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { brotliDecompressSync, inflateSync } from "node:zlib";
import { checkFontContainer, FONT_LIMITS } from "./inspect-font-artifact.mjs";

const reply = (value) => process.stdout.write(JSON.stringify(value));
let create;
try {
  ({ create } = await import("fontkit"));
} catch {
  reply({ ok: false, reason: "font-decoder-unavailable" });
  process.exit(0);
}

try {
  // The parent bounds stdin to 8 MiB and this process to five seconds/128 MiB heap.
  const buffer = readFileSync(0);
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) throw new Error();
  const magic = buffer.subarray(0, 4).toString("ascii");
  const container = checkFontContainer(buffer, magic === "wOF2" ? "font/woff2" : magic === "wOFF" ? "font/woff" : "font/ttf");
  if (!container.ok) throw new Error();
  // Bound actual decompression before Fontkit's lazy tables can allocate buffers.
  for (const stream of container.compression ?? []) {
    const decode = stream.format === "brotli" ? brotliDecompressSync : inflateSync;
    const data = decode(buffer.subarray(stream.offset, stream.offset + stream.length), { maxOutputLength: FONT_LIMITS.expandedBytes });
    if (data.length !== stream.decodedBytes) throw new Error();
  }
  const font = create(buffer);
  const text = (value, required = false) => {
    if (value === null || value === undefined) {
      if (required) throw new Error();
      return null;
    }
    if (typeof value !== "string" || value.length > 4096 || (required && !value.trim())) throw new Error();
    return value;
  };
  const family = text(font.familyName, true);
  const postscriptName = text(font.postscriptName, true);
  if (!Number.isInteger(font.numGlyphs) || font.numGlyphs < 1 || font.numGlyphs > 65535 ||
      !Number.isInteger(font.unitsPerEm) || font.unitsPerEm < 16 || font.unitsPerEm > 16384 ||
      !Number.isFinite(font.italicAngle)) throw new Error();
  const declaredCodepoints = font.characterSet;
  if (!Array.isArray(declaredCodepoints) || !declaredCodepoints.length || declaredCodepoints.length > 0x110000 ||
      declaredCodepoints.some((c) => !Number.isInteger(c) || c < 0 || c > 0x10ffff || (c >= 0xd800 && c <= 0xdfff))) {
    throw new Error();
  }
  // Fontkit includes cmap ranges that map to .notdef, including format-4's sentinel.
  const codepoints = [...new Set(declaredCodepoints.filter((c) => font.hasGlyphForCodePoint(c)))].sort((a, b) => a - b);
  if (!codepoints.length) throw new Error();
  const variationAxes = font.variationAxes;
  if (!variationAxes || Object.keys(variationAxes).length > 64) throw new Error();
  for (const [tag, axis] of Object.entries(variationAxes)) {
    if (!/^[\x20-\x7e]{4}$/.test(tag) || ![axis.min, axis.default, axis.max].every(Number.isFinite) ||
        axis.min > axis.default || axis.default > axis.max) throw new Error();
    text(axis.name);
  }
  // Force lazy outline/metric decoding for a bounded sample, including non-Latin fonts.
  const samples = [...new Set([codepoints[0], codepoints.at(-1), codepoints[Math.floor(codepoints.length / 2)],
    ...[65, 103, 49].filter((c) => font.hasGlyphForCodePoint(c))])];
  const sampledGlyphs = [];
  for (const codepoint of samples) {
    const glyph = font.glyphForCodePoint(codepoint);
    if (!Number.isInteger(glyph.id) || glyph.id < 1 || glyph.id >= font.numGlyphs ||
        !Number.isFinite(glyph.advanceWidth)) throw new Error();
    const commands = glyph.path.commands;
    if (!Array.isArray(commands) || commands.length > 200000 ||
        commands.some((c) => !Array.isArray(c.args) || !c.args.every(Number.isFinite))) throw new Error();
    sampledGlyphs.push({ codepoint, glyph: glyph.id, commands: commands.length });
  }
  const coverage = Buffer.alloc(codepoints.length * 4);
  codepoints.forEach((c, i) => coverage.writeUInt32BE(c, i * 4));
  reply({ ok: true, metadata: {
    decoder: "fontkit@2.0.4",
    family,
    subfamily: text(font.subfamilyName),
    postscriptName,
    fullName: text(font.fullName),
    version: text(font.version),
    copyright: text(font.copyright),
    unitsPerEm: font.unitsPerEm,
    glyphCount: font.numGlyphs,
    italicAngle: font.italicAngle,
    variationAxes,
    mappedCodepoints: codepoints.length,
    codepointsSha256: createHash("sha256").update(coverage).digest("hex"),
    printableAscii: Array.from({ length: 95 }, (_, i) => i + 32).every((c) => font.hasGlyphForCodePoint(c)),
    sampledGlyphs
  } });
} catch {
  reply({ ok: false, reason: "font-decode-rejected" });
}
