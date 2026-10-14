import { brotliCompressSync, deflateSync } from "node:zlib";

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

export function fixture(woff = false) {
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

export function woff2Fixture() {
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

