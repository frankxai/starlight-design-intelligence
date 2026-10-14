import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const FONT_LIMITS = Object.freeze({
  fileBytes: 8 * 1024 * 1024,
  expandedBytes: 16 * 1024 * 1024,
  tables: 256,
  timeoutMs: 5000,
  heapMiB: 128,
  outputBytes: 64 * 1024
});

export function isFontMime(mime) {
  return ["font/woff", "font/woff2", "font/ttf"].includes(mime);
}

const deny = (reason) => ({ ok: false, reason });
const woff2Tags = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];

function checkWoff2Directory(buffer, count) {
  let cursor = 48;
  const byte = () => { if (cursor >= buffer.length) throw new Error(); return buffer[cursor++]; };
  const base128 = () => {
    let value = 0;
    for (let i = 0; i < 5; i += 1) {
      const next = byte();
      if ((i === 0 && next === 0x80) || value > 0x1ffffff) throw new Error();
      value = value * 128 + (next & 0x7f);
      if (!(next & 0x80)) return value;
    }
    throw new Error();
  };
  try {
    const tags = new Set();
    let expanded = 12 + count * 16;
    let decodedBytes = 0;
    for (let i = 0; i < count; i += 1) {
      const flag = byte();
      const index = flag & 63;
      const version = flag >> 6;
      let tag = woff2Tags[index];
      if (index === 63) tag = String.fromCharCode(byte(), byte(), byte(), byte());
      const original = base128();
      const outline = tag === "glyf" || tag === "loca";
      if ((outline && ![0, 3].includes(version)) || (!outline && version !== 0 && !(tag === "hmtx" && version === 1))) throw new Error();
      const transformed = outline ? version !== 3 : version !== 0;
      const length = transformed ? base128() : original;
      if (tags.has(tag) || (tag === "loca" && transformed && length !== 0)) throw new Error();
      tags.add(tag);
      expanded += Math.ceil(original / 4) * 4;
      decodedBytes += length;
      if (expanded > FONT_LIMITS.expandedBytes || decodedBytes > FONT_LIMITS.expandedBytes) throw new Error();
    }
    const length = buffer.readUInt32BE(20);
    if (expanded !== buffer.readUInt32BE(16) || cursor + length > buffer.length || !decodedBytes) throw new Error();
    return { ok: true, compression: [{ offset: cursor, length, decodedBytes, format: "brotli" }] };
  } catch {
    return deny("invalid-woff2-directory");
  }
}

// Cheap checks precede the isolated parser. These are not a font sanitizer.
export function checkFontContainer(buffer, mime) {
  if (!Buffer.isBuffer(buffer) || !isFontMime(mime)) return deny("unsupported-font");
  if (buffer.length > FONT_LIMITS.fileBytes) return deny("font-file-too-large");
  const compressed = mime !== "font/ttf";
  const headerSize = mime === "font/woff" ? 44 : mime === "font/woff2" ? 48 : 12;
  if (buffer.length < headerSize) return deny("truncated-font-header");
  const signature = buffer.subarray(0, 4).toString("hex");
  const sfnt = (value) => value === "00010000" || value === "4f54544f";
  if (mime === "font/woff" && signature !== "774f4646") return deny("font-mime-mismatch");
  if (mime === "font/woff2" && signature !== "774f4632") return deny("font-mime-mismatch");
  if (mime === "font/ttf" && !sfnt(signature)) return deny("font-mime-mismatch");
  if (compressed && !sfnt(buffer.subarray(4, 8).toString("hex"))) return deny("unsupported-font-flavor");
  const count = buffer.readUInt16BE(compressed ? 12 : 4);
  if (count < 1 || count > FONT_LIMITS.tables) return deny("font-table-count-out-of-range");
  if (compressed) {
    if (buffer.readUInt32BE(8) !== buffer.length || buffer.readUInt16BE(14) !== 0) {
      return deny("invalid-font-container-length");
    }
    const expanded = buffer.readUInt32BE(16);
    if (expanded < 12 + count * 16 || expanded > FONT_LIMITS.expandedBytes) {
      return deny("font-expanded-size-out-of-range");
    }
    if (mime === "font/woff2") {
      const compressedBytes = buffer.readUInt32BE(20);
      if (!compressedBytes || compressedBytes > buffer.length - headerSize - count) {
        return deny("invalid-font-compressed-length");
      }
      return checkWoff2Directory(buffer, count);
    }
  }
  const entrySize = compressed ? 20 : 16;
  const directoryEnd = headerSize + count * entrySize;
  if (directoryEnd > buffer.length) return deny("truncated-font-directory");
  const tags = new Set();
  const ranges = [];
  const compression = [];
  let expanded = 12 + count * 16;
  for (let i = 0; i < count; i += 1) {
    const entry = headerSize + i * entrySize;
    const tag = buffer.subarray(entry, entry + 4).toString("ascii");
    if (tags.has(tag)) return deny("duplicate-font-table");
    tags.add(tag);
    const offset = buffer.readUInt32BE(entry + (compressed ? 4 : 8));
    const length = buffer.readUInt32BE(entry + (compressed ? 8 : 12));
    const original = compressed ? buffer.readUInt32BE(entry + 12) : length;
    if (offset < directoryEnd || offset % 4 || offset + length > buffer.length || length > original) {
      return deny("font-table-out-of-range");
    }
    ranges.push([offset, offset + length]);
    if (compressed && length < original) compression.push({ offset, length, decodedBytes: original, format: "deflate" });
    expanded += Math.ceil(original / 4) * 4;
    if (expanded > FONT_LIMITS.expandedBytes) return deny("font-expanded-size-out-of-range");
  }
  ranges.sort((a, b) => a[0] - b[0]);
  if (ranges.some((range, i) => i && range[0] < ranges[i - 1][1])) return deny("overlapping-font-tables");
  if (compressed && expanded !== buffer.readUInt32BE(16)) return deny("invalid-font-expanded-length");
  return { ok: true, compression };
}

// Public for failure-contract tests; no paths, stderr or child diagnostics escape.
export function readFontWorkerResult(result) {
  if (result.error?.code === "ETIMEDOUT") return deny("font-decoder-timeout");
  if (result.error || result.signal || result.status !== 0) return deny("font-decoder-failed");
  try {
    const output = JSON.parse(result.stdout.toString("utf8"));
    if (output.ok === false && ["font-decoder-unavailable", "font-decode-rejected"].includes(output.reason)) {
      return deny(output.reason);
    }
    if (output.ok !== true || !output.metadata || typeof output.metadata.family !== "string" ||
        typeof output.metadata.postscriptName !== "string" || !Number.isInteger(output.metadata.glyphCount)) {
      return deny("invalid-font-decoder-response");
    }
    return { ok: true, metadata: output.metadata };
  } catch {
    return deny("invalid-font-decoder-response");
  }
}

export function inspectFontArtifact(buffer, mime) {
  const header = checkFontContainer(buffer, mime);
  if (!header.ok) return header;
  // Fixed executable/worker, binary stdin, no shell and no inherited Node preload.
  const env = process.platform === "win32" ? { SystemRoot: process.env.SystemRoot } : {};
  const result = spawnSync(process.execPath, [
    `--max-old-space-size=${FONT_LIMITS.heapMiB}`,
    fileURLToPath(new URL("./font-artifact-worker.mjs", import.meta.url))
  ], {
    input: buffer,
    timeout: FONT_LIMITS.timeoutMs,
    killSignal: "SIGKILL",
    maxBuffer: FONT_LIMITS.outputBytes,
    windowsHide: true,
    env
  });
  return readFontWorkerResult(result);
}
