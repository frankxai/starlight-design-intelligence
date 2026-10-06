import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const gitBlob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
function requireValue(condition, message) { if (!condition) throw new Error(message); }
export function containedFile(root, path) {
  requireValue(typeof path === 'string' && path && !isAbsolute(path) && !path.split(/[\\/]/).includes('..'), 'Source path must be relative and contained.');
  const base = realpathSync(root), full = realpathSync(resolve(base, path)), rel = relative(base, full);
  requireValue(rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel), 'Source symlink escapes root.');
  return full;
}
const clamp = n => Math.min(1, Math.max(0, n));
export function parseColor(raw) {
  requireValue(typeof raw === 'string', 'Color must be a source string.');
  const s = raw.trim(); let c, alpha = 1;
  if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(s)) {
    c = [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
    if (s.length === 9) alpha = parseInt(s.slice(7, 9), 16) / 255;
  } else if (/^rgba?\([^()]+\)$/.test(s)) {
    const values = s.slice(s.indexOf('(') + 1, -1).split(/[,\s/]+/).filter(Boolean);
    requireValue(values.length === 3 || values.length === 4, 'Unsupported rgb syntax.');
    requireValue(values.every(v => /^-?(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(v)), 'Malformed rgb channel.');
    c = values.slice(0, 3).map(v => v.endsWith('%') ? parseFloat(v) / 100 : Number(v) / 255);
    if (values[3]) alpha = values[3].endsWith('%') ? parseFloat(values[3]) / 100 : Number(values[3]);
  } else if (/^hsl\([^()]+\)$/.test(s) || /^-?\d+(?:\.\d+)?\s+[\d.]+%\s+[\d.]+%$/.test(s)) {
    const values = (s.startsWith('hsl(') ? s.slice(4, -1) : s).split(/[,\s/]+/).filter(Boolean);
    requireValue((values.length === 3 || values.length === 4) && values[1].endsWith('%') && values[2].endsWith('%'), 'Unsupported hsl syntax.');
    requireValue(values.every(v => /^-?(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(v)), 'Malformed hsl channel.');
    const h = ((Number(values[0]) % 360) + 360) % 360 / 360, saturation = parseFloat(values[1]) / 100, l = parseFloat(values[2]) / 100;
    requireValue(saturation >= 0 && saturation <= 1 && l >= 0 && l <= 1, 'HSL range invalid.');
    const a = saturation * Math.min(l, 1 - l);
    c = [0, 8, 4].map(n => { const k = (n + h * 12) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); });
    if (values[3]) alpha = Number(values[3]);
  } else if (/^oklch\([^()]+\)$/.test(s)) {
    const values = s.slice(6, -1).split(/[\s/]+/).filter(Boolean);
    requireValue(values.length === 3 || values.length === 4, 'Unsupported OKLCH syntax.');
    const [l, chroma, degrees] = values.slice(0, 3).map(Number), h = degrees * Math.PI / 180;
    requireValue(l >= 0 && l <= 1 && chroma >= 0, 'OKLCH range invalid.');
    const a = chroma * Math.cos(h), b = chroma * Math.sin(h);
    const ll = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const ss = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    const linear = [4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss, -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss, -0.0041960863 * ll - 0.7034186147 * mm + 1.7076147010 * ss];
    c = linear.map(v => v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
    if (values[3]) alpha = Number(values[3]);
    // Figma variable import uses sRGB. Keep the original and disclose gamut clipping.
    const clipped = c.some(v => v < -0.00001 || v > 1.00001);
    requireValue([...c, alpha].every(Number.isFinite) && alpha >= 0 && alpha <= 1, 'Color is non-finite or alpha invalid.');
    return { colorSpace: 'srgb', components: c.map(clamp), alpha, ...(clipped ? { gamut_clipped: true } : {}) };
  } else throw new Error('Unsupported source color: ' + s);
  requireValue([...c, alpha].every(Number.isFinite) && [...c, alpha].every(v => v >= 0 && v <= 1), 'Color range invalid.');
  return { colorSpace: 'srgb', components: c, alpha };
}
function extractValue(spec, texts) {
  requireValue(spec && texts.has(spec.path), 'Extraction source not pinned.');
  const text = texts.get(spec.path);
  if (typeof spec.pointer === 'string') {
    requireValue(spec.pointer.startsWith('/'), 'JSON pointer must begin with /.');
    const value = spec.pointer.slice(1).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~')).reduce((v, k) => v !== null && typeof v === 'object' && Object.hasOwn(v, k) ? v[k] : undefined, JSON.parse(text));
    requireValue(value !== undefined && (typeof value === 'string' || typeof value === 'number'), 'JSON pointer must select a scalar.');
    return value;
  }
  requireValue(Number.isInteger(spec.line) && spec.line > 0 && typeof spec.pattern === 'string' && spec.pattern.length <= 512, 'Bounded single-line selector required.');
  const line = text.split(/\r?\n/)[spec.line - 1];
  requireValue(line !== undefined, 'Source line absent.');
  const matches = [...line.matchAll(new RegExp(spec.pattern, 'g'))];
  requireValue(matches.length === 1 && matches[0].length === 2, 'Source selector must capture exactly one value once.');
  return matches[0][1];
}
function transform(raw, token, rootFontSize) {
  if (token.transform === 'color') return parseColor(raw);
  if (token.transform === 'string') { requireValue(typeof raw === 'string' && raw.length > 0 && raw.length <= 80 && !/[,{;}]/.test(raw), 'Font family token must be a single exact family.'); return raw; }
  if (token.transform === 'number') { const n = Number(raw); requireValue(Number.isFinite(n), 'Number token invalid.'); return n; }
  const match = String(raw).trim().match(/^(-?[\d.]+)(px|rem|ms|s)?$/);
  requireValue(match && Number.isFinite(Number(match[1])), 'Dimension or duration invalid.');
  const n = Number(match[1]);
  if (token.transform === 'px') {
    requireValue(match[2] === 'px' || (match[2] === 'rem' && rootFontSize === 16) || (!match[2] && n === 0), 'Dimension requires px, or explicitly assumed 16px rem.');
    return { value: n * (match[2] === 'rem' ? rootFontSize : 1), unit: 'px' };
  }
  requireValue(token.transform === 'seconds' && ['ms', 's'].includes(match[2]) && n >= 0, 'Duration requires seconds or ms.');
  return { value: n / (match[2] === 'ms' ? 1000 : 1), unit: 's' };
}
export function compileProjection({ manifestPath, sourcesRoot }) {
  const manifestBytes = readFileSync(manifestPath), m = JSON.parse(manifestBytes);
  requireValue(m.schema_version === 'starlight.figma_projection.v1', 'Unknown projection version.');
  for (const k of ['brand_id', 'surface_id', 'revision']) requireValue(typeof m[k] === 'string' && /^[a-zA-Z0-9-]+$/.test(m[k]), 'Invalid ' + k);
  requireValue(/^[\w.-]+\/[\w.-]+$/.test(m.repository) && /^[a-f0-9]{40}$/.test(m.commit), 'Immutable repository commit required.');
  requireValue(['implemented-source', 'migration-candidate'].includes(m.readiness), 'Source readiness required.');
  requireValue(typeof m.name === 'string' && m.name.length <= 120, 'Projection name invalid.');
  requireValue(Array.isArray(m.sources) && m.sources.length > 0, 'Pinned source inventory required.');
  const texts = new Map();
  for (const s of m.sources) {
    requireValue(!texts.has(s.path) && /^[a-f0-9]{64}$/.test(s.sha256), 'Duplicate source or invalid source digest.');
    const bytes = readFileSync(containedFile(sourcesRoot, s.path));
    requireValue(bytes.length <= 2_000_000 && sha256(bytes) === s.sha256, 'Source hash drift: ' + s.path);
    if (s.git_blob) requireValue(gitBlob(bytes) === s.git_blob, 'Git blob mismatch: ' + s.path);
    texts.set(s.path, bytes.toString('utf8'));
  }
  requireValue(Array.isArray(m.tokens) && m.tokens.length > 0 && m.tokens.length <= 500, 'Token inventory invalid.');
  const tokens = [], seen = new Set();
  const transforms = { color: 'color', dimension: 'px', number: 'number', duration: 'seconds', fontFamily: 'string' };
  for (const t of m.tokens) {
    requireValue(typeof t.name === 'string', 'Token name required.');
    const name = t.name.replaceAll('.', '/');
    requireValue(/^[\w-]+(?:\/[\w-]+)*$/.test(name) && !seen.has(name), 'Invalid or normalized duplicate token name.'); seen.add(name);
    requireValue(!name.split('/').some(part => ['__proto__', 'constructor', 'prototype'].includes(part)), 'Reserved token path segment.');
    requireValue(Object.hasOwn(transforms, t.type), 'Unsupported token type.');
    requireValue(!t.alias || !t.extract, 'Alias cannot also extract.');
    if (!t.alias) requireValue(t.transform === transforms[t.type], 'Token type/transform mismatch.');
    const value = t.alias ? undefined : transform(extractValue(t.extract, texts), t, m.root_font_size);
    tokens.push({ name, type: t.type, ...(t.alias ? { alias: t.alias.replaceAll('.', '/') } : { value, original: extractValue(t.extract, texts) }), ...(t.codeSyntax ? { codeSyntax: t.codeSyntax } : {}), source: t.extract || null });
  }
  const byName = new Map(tokens.map(t => [t.name, t]));
  function resolveToken(name, chain = new Set()) {
    requireValue(!chain.has(name), 'Token alias cycle.'); chain.add(name);
    const t = byName.get(name); requireValue(t, 'Unresolved token alias.');
    if (!t.alias) return t.value;
    requireValue(byName.get(t.alias)?.type === t.type, 'Alias type mismatch.'); return resolveToken(t.alias, chain);
  }
  for (const t of tokens) resolveToken(t.name);
  requireValue(m.review_roles && byName.get(m.review_roles.surface)?.type === 'color' && byName.get(m.review_roles.text)?.type === 'color', 'Explicit source-owned review surface and text colors required.');
  requireValue(Array.isArray(m.text_styles) && m.text_styles.length > 0 && m.text_styles.length <= 50, 'Source typography required.');
  const styleNames = new Set();
  for (const s of m.text_styles) {
    requireValue(typeof s.name === 'string' && s.name && !styleNames.has(s.name), 'Text style name invalid or duplicate.'); styleNames.add(s.name);
    requireValue(texts.has(s.source_path), 'Typography source not pinned.');
    requireValue(typeof s.font?.family === 'string' && !/[,{;}]/.test(s.font.family) && s.font.family.length <= 80 && typeof s.font.style === 'string' && s.font.style.length <= 40, 'Exact font family/style required; no fallback stack.');
    requireValue(Number.isFinite(s.font_size) && s.font_size > 0 && Number.isFinite(s.line_height) && s.line_height > 0 && s.line_height <= 300, 'Text metrics invalid.');
  }
  const components = m.components || [];
  requireValue(Array.isArray(components) && components.length <= 10, 'Component inventory invalid.');
  const componentNames = new Set();
  for (const c of components) {
    requireValue(c.name && !componentNames.has(c.name) && texts.has(c.code_path), 'Component owner/source invalid.'); componentNames.add(c.name);
    requireValue(Array.isArray(c.variants) && c.variants.length > 0 && c.variants.length <= 12, 'Bounded component variants required.');
    const names = new Set();
    for (const v of c.variants) {
      requireValue(['Default', 'Hover', 'Focus', 'Disabled'].includes(v.state) && !names.has(v.state), 'Unsupported or duplicate visual state.'); names.add(v.state);
      requireValue(styleNames.has(v.text_style) && byName.get(v.fill_token)?.type === 'color' && byName.get(v.text_token)?.type === 'color', 'Component style/token reference invalid.');
      if (v.stroke_token) requireValue(byName.get(v.stroke_token)?.type === 'color', 'Component stroke token invalid.');
      for (const k of ['height', 'padding_x', 'radius']) requireValue(Number.isFinite(v[k]) && v[k] >= 0, 'Component dimensions invalid.');
      requireValue(v.height >= 24 && v.height <= 120 && (v.opacity === undefined || (v.opacity >= 0 && v.opacity <= 1)), 'Component visual bounds invalid.');
    }
  }
  const dtcg = {};
  for (const t of tokens) {
    const parts = t.name.split('/'); let group = dtcg;
    for (const p of parts.slice(0, -1)) { requireValue(!group[p] || !Object.hasOwn(group[p], '$value'), 'Token/group name collision.'); group = group[p] ||= {}; }
    requireValue(!group[parts.at(-1)], 'Token/group name collision.');
    const value = t.alias ? '{' + t.alias.replaceAll('/', '.') + '}' : t.value;
    const clean = t.type === 'color' && !t.alias ? { colorSpace: value.colorSpace, components: value.components, alpha: value.alpha } : value;
    group[parts.at(-1)] = { $type: t.type, $value: clean, $description: `Projection of ${m.repository}@${m.commit}; source ${t.source?.path || t.alias}.` };
  }
  const projection = { ...m, tokens, manifest_sha256: sha256(manifestBytes), source_verification: 'bytes-and-declared-blob-checked', native_status: 'NOT_EXECUTED', parity: 'SOURCE_PROJECTION_NOT_RENDERED_PARITY', gamut_notes: tokens.filter(t => t.value?.gamut_clipped).map(t => t.name) };
  return { projection, dtcg };
}
export function compileNativeScript(projection, { plugin = false } = {}) {
  const builder = readFileSync(resolve(here, 'figma-native-projection.js'), 'utf8');
  const input = JSON.stringify(projection).replaceAll('<', '\\u003c');
  return `/* Generated source projection. Native review and product acceptance remain pending. */\nconst PROJECTION = ${input};\n${builder}\n` + (plugin ? `runProjection(PROJECTION).then(receipt => { console.log(JSON.stringify(receipt)); figma.closePlugin(JSON.stringify(receipt)); }).catch(error => figma.closePlugin(error.message));\n` : `return await runProjection(PROJECTION);\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [manifestPath, sourcesRoot, outputBase] = process.argv.slice(2);
  requireValue(manifestPath && sourcesRoot && outputBase, 'Usage: node scripts/compile-figma-projection.mjs manifest.json source-root output-base');
  const result = compileProjection({ manifestPath, sourcesRoot });
  writeFileSync(outputBase + '.projection.json', JSON.stringify(result.projection, null, 2) + '\n');
  writeFileSync(outputBase + '.tokens.json', JSON.stringify(result.dtcg, null, 2) + '\n');
  writeFileSync(outputBase + '.mcp.js', compileNativeScript(result.projection));
  writeFileSync(outputBase + '.plugin.js', compileNativeScript(result.projection, { plugin: true }));
  console.log(JSON.stringify({ output: outputBase, tokens: result.projection.tokens.length, styles: result.projection.text_styles.length, components: result.projection.components?.length || 0, gamut_notes: result.projection.gamut_notes, native_status: 'NOT_EXECUTED' }));
}
