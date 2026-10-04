import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import test from "node:test";
import { brotliCompressSync, deflateSync } from "node:zlib";
import { FONT_LIMITS, checkFontContainer, inspectFontArtifact, readFontWorkerResult } from "../scripts/inspect-font-artifact.mjs";

let decoderInstalled = false;
try { createRequire(import.meta.url).resolve("fontkit"); decoderInstalled = true; } catch {}
if (process.env.REQUIRE_FONTKIT === "1") assert.equal(decoderInstalled, true, "CI must install the pinned decoder");

// Synthetic SFNT with one triangle mapped to A. No third-party font binary.
function fixtureTables() {
  const head = Buffer.alloc(54);
  head.writeUInt32BE(0x00010000, 0);
  head.writeUInt32BE(0x5f0f3cf5, 12);
  head.writeUInt16BE(1000, 18);
  const hhea = Buffer.alloc(36);
  hhea.writeUInt32BE(0x00010000, 0);
  hhea.writeUInt16BE(2, 34);
  const hmtx = Buffer.from([1, 244, 0, 0, 1, 244, 0, 0]);
  const maxp = Buffer.alloc(32);
  maxp.writeUInt32BE(0x00010000, 0);
  maxp.writeUInt16BE(2, 4);
  maxp.writeUInt16BE(3, 6);
  maxp.writeUInt16BE(1, 8);
  const post = Buffer.alloc(32);
  post.writeUInt32BE(0x00030000, 0);
  const cmap = Buffer.alloc(40);
  cmap.writeUInt16BE(1, 2);
  cmap.writeUInt16BE(3, 4);
  cmap.writeUInt16BE(10, 6);
  cmap.writeUInt32BE(12, 8);
  cmap.writeUInt16BE(12, 12);
  cmap.writeUInt32BE(28, 16);
  cmap.writeUInt32BE(1, 24);
  cmap.writeUInt32BE(65, 28);
  cmap.writeUInt32BE(65, 32);
  cmap.writeUInt32BE(1, 36);
  const glyf = Buffer.alloc(32);
  glyf.writeInt16BE(1, 0);
  glyf.writeInt16BE(100, 6);
  glyf.writeInt16BE(100, 8);
  glyf.writeUInt16BE(2, 10);
  glyf.fill(1, 14, 17);
  [0, 100, -100, 0, 0, 100].forEach((value, i) => glyf.writeInt16BE(value, 17 + i * 2));
  const loca = Buffer.from([0, 0, 0, 0, 0, 16]);
  const names = [[1, "Test Fixture"], [2, "Regular"], [4, "Test Fixture Regular"], [5, "Version 1.000"], [6, "TestFixture-Regular"]];
  const strings = names.map(([, value]) => {
    const b = Buffer.from(value, "utf16le"); b.swap16(); return b;
  });
  const name = Buffer.alloc(6 + names.length * 12 + strings.reduce((n, b) => n + b.length, 0));
  name.writeUInt16BE(names.length, 2);
  name.writeUInt16BE(6 + names.length * 12, 4);
  let offset = 0;
  names.forEach(([id], i) => {
    const p = 6 + i * 12;
    [3, 1, 0x409, id, strings[i].length, offset].forEach((v, j) => name.writeUInt16BE(v, p + j * 2));
    strings[i].copy(name, 6 + names.length * 12 + offset);
    offset += strings[i].length;
  });
  return Object.entries({ cmap, glyf, head, hhea, hmtx, loca, maxp, name, post });
}

function fixture(woff = false) {
  const tables = fixtureTables();
  const headSize = woff ? 44 : 12;
  const entrySize = woff ? 20 : 16;
  const encoded = tables.map(([tag, bytes]) => {
    const compressed = deflateSync(bytes);
    return { tag, bytes, data: woff && compressed.length < bytes.length ? compressed : bytes };
  });
  const expanded = 12 + tables.length * 16 + tables.reduce((n, [, b]) => n + Math.ceil(b.length / 4) * 4, 0);
  const size = headSize + tables.length * entrySize + encoded.reduce((n, t) => n + Math.ceil(t.data.length / 4) * 4, 0);
  const buffer = Buffer.alloc(size);
  buffer.writeUInt32BE(woff ? 0x774f4646 : 0x00010000, 0);
  if (woff) { buffer.writeUInt32BE(0x00010000, 4); buffer.writeUInt32BE(size, 8); buffer.writeUInt32BE(expanded, 16); }
  buffer.writeUInt16BE(tables.length, woff ? 12 : 4);
  let offset = headSize + tables.length * entrySize;
  encoded.forEach((t, i) => {
    const entry = headSize + i * entrySize;
    buffer.write(t.tag, entry, 4, "ascii");
    buffer.writeUInt32BE(offset, entry + (woff ? 4 : 8));
    buffer.writeUInt32BE(t.data.length, entry + (woff ? 8 : 12));
    if (woff) buffer.writeUInt32BE(t.bytes.length, entry + 12);
    t.data.copy(buffer, offset);
    offset += Math.ceil(t.data.length / 4) * 4;
  });
  return buffer;
}

function woff2Fixture() {
  const tables = fixtureTables();
  const base128 = (n) => {
    const bytes = [n & 127];
    while ((n = Math.floor(n / 128))) bytes.unshift((n & 127) | 128);
    return Buffer.from(bytes);
  };
  const directory = Buffer.concat(tables.flatMap(([tag, bytes]) => [
    Buffer.from([tag === "glyf" || tag === "loca" ? 255 : 63]), Buffer.from(tag), base128(bytes.length)
  ]));
  const compressed = brotliCompressSync(Buffer.concat(tables.map(([, bytes]) => bytes)));
  const header = Buffer.alloc(48);
  header.write("wOF2"); header.writeUInt32BE(0x00010000, 4);
  header.writeUInt32BE(48 + directory.length + compressed.length, 8);
  header.writeUInt16BE(tables.length, 12);
  header.writeUInt32BE(12 + tables.length * 16 + tables.reduce((n, [, b]) => n + Math.ceil(b.length / 4) * 4, 0), 16);
  header.writeUInt32BE(compressed.length, 20);
  return Buffer.concat([header, directory, compressed]);
}

test("signature-only fonts, truncation and incompatible MIME are rejected", () => {
  for (const [mime, bytes] of [["font/woff", "wOFF"], ["font/woff2", "wOF2"], ["font/ttf", "OTTO"]]) {
    assert.equal(inspectFontArtifact(Buffer.from(bytes), mime).ok, false);
  }
  const ttf = fixture();
  assert.equal(inspectFontArtifact(ttf.subarray(0, -20), "font/ttf").ok, false);
  assert.equal(inspectFontArtifact(ttf, "font/woff2").reason, "font-mime-mismatch");
});

test("table overlap, duplicate tags and oversized declarations fail before decoding", () => {
  const ttf = fixture();
  const overlap = Buffer.from(ttf); overlap.writeUInt32BE(ttf.readUInt32BE(20), 36);
  assert.equal(checkFontContainer(overlap, "font/ttf").reason, "overlapping-font-tables");
  const duplicate = Buffer.from(ttf); ttf.copy(duplicate, 28, 12, 16);
  assert.equal(checkFontContainer(duplicate, "font/ttf").reason, "duplicate-font-table");
  const woff = fixture(true); woff.writeUInt32BE(FONT_LIMITS.expandedBytes + 1, 16);
  assert.equal(checkFontContainer(woff, "font/woff").reason, "font-expanded-size-out-of-range");
  assert.equal(inspectFontArtifact(Buffer.alloc(FONT_LIMITS.fileBytes + 1), "font/woff2").reason, "font-file-too-large");
  const woff2 = woff2Fixture();
  assert.equal(checkFontContainer(woff2, "font/woff2").ok, true);
  const overlong = Buffer.from(woff2); overlong[53] = 0x80;
  assert.equal(checkFontContainer(overlong, "font/woff2").reason, "invalid-woff2-directory");
});

test("decoder deadline, crash, output overflow and malformed output fail closed without diagnostics", () => {
  assert.deepEqual(readFontWorkerResult({ error: { code: "ETIMEDOUT", message: "private path" } }), { ok: false, reason: "font-decoder-timeout" });
  for (const result of [{ status: 1, stderr: "private path" }, { signal: "SIGKILL" }, { error: { code: "ENOBUFS" } }]) {
    assert.deepEqual(readFontWorkerResult(result), { ok: false, reason: "font-decoder-failed" });
  }
  assert.equal(readFontWorkerResult({ status: 0, stdout: Buffer.from("not-json") }).ok, false);
  assert.equal(readFontWorkerResult({ status: 0, stdout: Buffer.from('{"ok":true}') }).ok, false);
});

test("missing decoder denies structurally valid fonts", { skip: decoderInstalled }, () => {
  assert.equal(inspectFontArtifact(fixture(), "font/ttf").reason, "font-decoder-unavailable");
});

test("valid synthetic TTF, WOFF and WOFF2 decode; broken cmap denies then valid retry recovers", { skip: !decoderInstalled }, () => {
  for (const [buffer, mime] of [[fixture(), "font/ttf"], [fixture(true), "font/woff"], [woff2Fixture(), "font/woff2"]]) {
    const result = inspectFontArtifact(buffer, mime);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.metadata.family, "Test Fixture");
    assert.equal(result.metadata.postscriptName, "TestFixture-Regular");
    assert.equal(result.metadata.glyphCount, 2);
    assert.equal(result.metadata.sampledGlyphs[0].glyph, 1);
    assert.ok(result.metadata.sampledGlyphs[0].commands > 0);
  }
  const broken = fixture();
  broken.writeUInt32BE(9999, broken.readUInt32BE(20) + 36);
  assert.equal(inspectFontArtifact(broken, "font/ttf").reason, "font-decode-rejected");
  assert.equal(inspectFontArtifact(fixture(), "font/ttf").ok, true);
});

// Current public resources are opt-in, SHA-pinned observations, never test fixtures for rights/rendering.
const observedFonts = [
  {
    "url": "https://starlightintelligence.ai/_next/static/immutable/media/7ebf22b5a21034f8-s.p.3strvg7o-g5v2.woff2",
    "sha256": "6ee678c33f388dd7ba59700ebea635deb98821baafd817b09891f7927177f702",
    "family": "Instrument Serif",
    "postscriptName": "InstrumentSerif-Italic",
    "glyphCount": 220,
    "mappedCodepoints": 206,
    "codepointsSha256": "393ef1d92b5476985906aea6db568ce3a0c02507915ce528b7ae6c0d810929f4",
    "axes": {}
  },
  {
    "url": "https://starlightintelligence.ai/_next/static/immutable/media/99e609270109b47d-s.p.1dgcou5jor5q_.woff2",
    "sha256": "c36f509c0a8f9f85f29cb44bc8701d8a9e0b14c499e77a884f789ead7093a7ac",
    "family": "IBM Plex Mono",
    "postscriptName": "IBMPlexMono-Regular",
    "glyphCount": 280,
    "mappedCodepoints": 229,
    "codepointsSha256": "e6d303dcbef0960e5ae678b407ff2b334b8ebafe353edf807e593be16d761cc5",
    "axes": {}
  },
  {
    "url": "https://starlightintelligence.ai/_next/static/immutable/media/effe91970fc4db64-s.p.28xcb7557rbh2.woff2",
    "sha256": "a76f53ca6612e7b3828eec2311098675b7f9849ae4169a8bcef6302aec02a6c0",
    "family": "IBM Plex Mono Medium",
    "postscriptName": "IBMPlexMono-Medium",
    "glyphCount": 280,
    "mappedCodepoints": 229,
    "codepointsSha256": "e6d303dcbef0960e5ae678b407ff2b334b8ebafe353edf807e593be16d761cc5",
    "axes": {}
  },
  {
    "url": "https://starlightintelligence.ai/_next/static/immutable/media/f06bf9da926bae75-s.p.3uuun_-7zsf1g.woff2",
    "sha256": "6219bc4bfdfc5d9b2201dcdf046218b122a758f932e25ed5f168f929b7ca2311",
    "family": "Instrument Sans",
    "postscriptName": "InstrumentSans-Regular",
    "glyphCount": 244,
    "mappedCodepoints": 208,
    "codepointsSha256": "a9867e9c9f362035b6b8b6b120d85181ef4d6068aa2b5c64abd8349ee55d7968",
    "axes": {
      "wght": [
        400,
        400,
        700
      ]
    }
  },
  {
    "url": "https://starlightintelligence.academy/_next/static/immutable/media/23b7a97ae3b5c134-s.p.0fcfx2a-jndc5.woff2",
    "sha256": "ad4580d8cb4b5f627c2d18457656732f7f7b070f7837fbc380e08054157e6f6c",
    "family": "IBM Plex Mono SemiBold",
    "postscriptName": "IBMPlexMono-SemiBold",
    "glyphCount": 280,
    "mappedCodepoints": 229,
    "codepointsSha256": "e6d303dcbef0960e5ae678b407ff2b334b8ebafe353edf807e593be16d761cc5",
    "axes": {}
  },
  {
    "url": "https://starlightintelligence.org/_next/static/immutable/media/5f402bd2d8eef81a-s.p.23oeb0afa3wba.woff2",
    "sha256": "2a69ec1c0fb79a464de0e19957cdb3a65b5f626d85fffd164f9de557d3a64878",
    "family": "Newsreader 16pt 16pt",
    "postscriptName": "Newsreader16pt16pt-Regular",
    "glyphCount": 262,
    "mappedCodepoints": 224,
    "codepointsSha256": "5dc3eb1f35812593ce485ee54700d01c90973622cb5cf008ac08316b4f8930b9",
    "axes": {
      "wght": [
        200,
        400,
        800
      ]
    }
  },
  {
    "url": "https://starlightintelligence.org/_next/static/immutable/media/70bc3e132a0a741e-s.p.269kn9uafm0ti.woff2",
    "sha256": "1e06740a02a443fb7f3eeda8fcaa685a0f6c620e3f01e6666e847295469ce3ad",
    "family": "JetBrains Mono",
    "postscriptName": "JetBrainsMono-Regular",
    "glyphCount": 394,
    "mappedCodepoints": 229,
    "codepointsSha256": "9691e1a3272c027d249697bdfed1e16b3b87fff5c437ba2486280b4d9f216116",
    "axes": {
      "wght": [
        100,
        400,
        800
      ]
    }
  },
  {
    "url": "https://starlightintelligence.org/_next/static/immutable/media/83afe278b6a6bb3c-s.p.45535valc9rzk.woff2",
    "sha256": "c940764593d0fe5d596be327ca7558855e018039fb78509aa21921fd3644c3e4",
    "family": "Inter",
    "postscriptName": "Inter-Regular",
    "glyphCount": 518,
    "mappedCodepoints": 230,
    "codepointsSha256": "c7ed088159f68a09f4a199c4156a72ef3d9777a52bfd7d9cca7a85c98191eb93",
    "axes": {
      "wght": [
        100,
        400,
        900
      ]
    }
  },
  {
    "url": "https://starlightintelligence.org/_next/static/immutable/media/9433d1a810498265-s.p.3z77xcxvtx9_e.woff2",
    "sha256": "19a83cc7ce02aab990c0f5fb8bd8f12f2f8e4f56430d5a3459521cabd852a51c",
    "family": "Newsreader 16pt 16pt",
    "postscriptName": "Newsreader16pt16pt-Italic",
    "glyphCount": 262,
    "mappedCodepoints": 224,
    "codepointsSha256": "5dc3eb1f35812593ce485ee54700d01c90973622cb5cf008ac08316b4f8930b9",
    "axes": {
      "wght": [
        200,
        400,
        800
      ]
    }
  }
];

test("nine pinned public WOFF2 resources decode with expected internal metadata", { skip: process.env.FONT_ARTIFACT_LIVE_PROBE !== "1" }, async () => {
  assert.equal(decoderInstalled, true);
  assert.equal(observedFonts.length, 9);
  for (const expected of observedFonts) {
    const response = await fetch(expected.url, { signal: AbortSignal.timeout(10000), redirect: "error" });
    assert.equal(response.status, 200, expected.url);
    assert.ok(Number(response.headers.get("content-length")) <= FONT_LIMITS.fileBytes);
    const chunks = []; let bytes = 0;
    for await (const chunk of response.body) {
      bytes += chunk.length;
      if (bytes > FONT_LIMITS.fileBytes) { await response.body.cancel().catch(() => {}); throw new Error("Font response exceeds limit"); }
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    assert.equal(createHash("sha256").update(buffer).digest("hex"), expected.sha256);
    const result = inspectFontArtifact(buffer, "font/woff2");
    assert.equal(result.ok, true, JSON.stringify({ url: expected.url, result }));
    assert.equal(result.metadata.family, expected.family);
    assert.equal(result.metadata.postscriptName, expected.postscriptName);
    assert.equal(result.metadata.glyphCount, expected.glyphCount);
    assert.equal(result.metadata.printableAscii, true);
    assert.equal(result.metadata.mappedCodepoints, expected.mappedCodepoints);
    assert.equal(result.metadata.codepointsSha256, expected.codepointsSha256);
    assert.deepEqual(Object.fromEntries(Object.entries(result.metadata.variationAxes).map(([tag, a]) => [tag, [a.min, a.default, a.max]])), expected.axes);
    console.log(JSON.stringify({ fontObservation: { url: expected.url, sha256: expected.sha256, bytes, ...result.metadata } }));
    const truncated = inspectFontArtifact(buffer.subarray(0, -1), "font/woff2");
    assert.equal(truncated.ok, false);
    assert.equal(inspectFontArtifact(buffer, "font/woff2").ok, true, "Valid retry must recover after denial");
  }
});
