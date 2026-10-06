import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { compileNativeScript, compileProjection, containedFile, parseColor } from '../scripts/compile-figma-projection.mjs';
import { verifyPreviewBinding } from '../scripts/verify-preview-binding.mjs';

const hash = s => createHash('sha256').update(s).digest('hex');
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'figma-projection-'));
  const source = '--surface: #102030;\n--text: #ffffff;\n--gap: 1.5rem;\n--fast: 180ms;\n';
  writeFileSync(join(root, 'source.css'), source);
  const m = { schema_version: 'starlight.figma_projection.v1', brand_id: 'fixture', surface_id: 'interface', revision: 'review-1', name: 'Fixture', repository: 'example/fixture', commit: 'a'.repeat(40), readiness: 'implemented-source', root_font_size: 16, sources: [{ path: 'source.css', sha256: hash(source) }], tokens: [
    { name: 'color/surface', type: 'color', extract: { path: 'source.css', line: 1, pattern: ': (#[a-f0-9]+);' }, transform: 'color' },
    { name: 'color/text', type: 'color', extract: { path: 'source.css', line: 2, pattern: ': (#[a-f0-9]+);' }, transform: 'color' },
    { name: 'space/gap', type: 'dimension', extract: { path: 'source.css', line: 3, pattern: ': ([\\d.]+rem);' }, transform: 'px' },
    { name: 'duration/fast', type: 'duration', extract: { path: 'source.css', line: 4, pattern: ': (\\d+ms);' }, transform: 'seconds' },
    { name: 'color/accent', type: 'color', alias: 'color/text' }
  ], review_roles: { surface: 'color/surface', text: 'color/text' }, text_styles: [{ name: 'Body', font: { family: 'Fixture Sans', style: 'Regular' }, font_size: 16, line_height: 150, source_path: 'source.css' }], components: [{ name: 'Action', code_path: 'source.css', export_name: 'Button', props: { size: 'md' }, variants: [{ state: 'Default', height: 44, padding_x: 20, radius: 8, fill_token: 'color/surface', text_token: 'color/text', text_style: 'Body' }] }] };
  const save = () => writeFileSync(join(root, 'input.json'), JSON.stringify(m));
  const compile = () => { save(); return compileProjection({ manifestPath: join(root, 'input.json'), sourcesRoot: root }); };
  return { root, m, compile };
}
test('source values produce typed DTCG, preserved aliases and pending native verdict', () => {
  const { compile } = fixture(), result = compile();
  assert.deepEqual(result.dtcg.space.gap.$value, { value: 24, unit: 'px' });
  assert.deepEqual(result.dtcg.duration.fast.$value, { value: 0.18, unit: 's' });
  assert.equal(result.dtcg.color.accent.$value, '{color.text}');
  assert.equal(result.projection.native_status, 'NOT_EXECUTED');
  assert.match(compileNativeScript(result.projection), /return await runProjection/);
});
test('hash drift, ambiguous extraction and wrong declared Git blob fail before compilation', () => {
  const a = fixture(); writeFileSync(join(a.root, 'source.css'), 'changed'); assert.throws(a.compile, /hash drift/);
  const b = fixture(); b.m.tokens[0].extract.pattern = '(.)'; assert.throws(b.compile, /exactly one/);
  const c = fixture(); c.m.sources[0].git_blob = 'b'.repeat(40); assert.throws(c.compile, /blob mismatch/);
});
test('aliases cannot cycle, change type, or reference missing variables', () => {
  for (const alias of ['color/accent', 'space/gap', 'color/missing']) {
    const f = fixture(); f.m.tokens[4].alias = alias; assert.throws(f.compile, /alias|Alias/);
  }
});
test('normalized collisions and token/group collisions cannot silently drop a variable', () => {
  const a = fixture(); a.m.tokens.push({ ...a.m.tokens[0], name: 'color.surface' }); assert.throws(a.compile, /duplicate/);
  const b = fixture(); b.m.tokens.push({ ...b.m.tokens[0], name: 'color' }); assert.throws(b.compile, /collision/);
  const c = fixture(); c.m.tokens.push({ ...c.m.tokens[0], name: '__proto__/polluted' }); assert.throws(c.compile, /Reserved/); assert.equal({}.polluted, undefined);
  const d = fixture(); d.m.tokens[0].type = 'string'; d.m.tokens[0].transform = 'string'; assert.throws(d.compile, /Unsupported token type/);
});
test('unowned component sources, fabricated states and fallback fonts are denied', () => {
  const a = fixture(); a.m.components[0].code_path = 'unowned.tsx'; assert.throws(a.compile, /owner/);
  const b = fixture(); b.m.components[0].variants.push({ ...b.m.components[0].variants[0], state: 'Loading' }); assert.throws(b.compile, /Unsupported/);
  const c = fixture(); c.m.text_styles[0].font.family = 'Fixture Sans, Arial'; assert.throws(c.compile, /fallback/);
  const d = fixture(); delete d.m.root_font_size; assert.throws(d.compile, /16px/);
});
test('path traversal and symlink escape cannot read external sources', () => {
  const a = fixture(), b = fixture();
  assert.throws(() => containedFile(a.root, '../source.css'), /contained/);
  symlinkSync(join(b.root, 'source.css'), join(a.root, 'escape.css'));
  assert.throws(() => containedFile(a.root, 'escape.css'), /escapes/);
});
test('JSON pointers cannot read inherited object properties', () => {
  const f = fixture(), source = '{"surface":"#ffffff"}'; writeFileSync(join(f.root, 'source.json'), source);
  f.m.sources.push({ path: 'source.json', sha256: hash(source) });
  f.m.tokens.push({ name: 'font/family', type: 'fontFamily', transform: 'string', extract: { path: 'source.json', pointer: '/__proto__/constructor/name' } });
  assert.throws(f.compile, /scalar/);
});
test('source easing becomes standard DTCG cubicBezier with bounded time control points', () => {
  const f = fixture(), source = '{"ease":"cubic-bezier(0.23, 1, 0.32, 1)"}'; writeFileSync(join(f.root, 'ease.json'), source);
  f.m.sources.push({ path: 'ease.json', sha256: hash(source) });
  f.m.tokens.push({ name: 'ease/out', type: 'cubicBezier', transform: 'bezier', extract: { path: 'ease.json', pointer: '/ease' } });
  assert.deepEqual(f.compile().dtcg.ease.out, { $type: 'cubicBezier', $value: [0.23,1,0.32,1], $description: `Projection of example/fixture@${'a'.repeat(40)}; source ease.json.` });
  const bad = '{"ease":"cubic-bezier(2, 1, 0.32, 1)"}'; writeFileSync(join(f.root, 'ease.json'), bad); f.m.sources[1].sha256 = hash(bad); assert.throws(f.compile, /control points/);
});
test('sRGB, HSL and OKLCH conversion preserves alpha and explicitly records gamut clipping', () => {
  assert.deepEqual(parseColor('#ffffff').components, [1, 1, 1]);
  assert.deepEqual(parseColor('180 70% 50%').components.map(v => Math.round(v * 255)), [38, 217, 217]);
  assert.equal(parseColor('rgba(20, 30, 40, 0.5)').alpha, 0.5);
  assert.ok(parseColor('oklch(0.55 0.4 27)').gamut_clipped);
  assert.ok(parseColor('oklch(1 0 0)').components.every(v => v > 0.999));
  assert.throws(() => parseColor('rgba(300,0,0,1)'), /range/);
  assert.throws(() => parseColor('oklch(NaN 0 0)'), /range/);
  for (const value of ['rgb(20,30,40X', 'hsl(120 50% 50%X', 'rgba(20X%,30%,40%,1)', 'oklch(0.5 0.1 27X']) assert.throws(() => parseColor(value));
});
test('native preflight fails without any mutation when the exact font is unavailable', async () => {
  const { projection } = fixture().compile(); let mutated = false;
  const figma = { root: { children: [] }, listAvailableFontsAsync: async () => [], createPage: () => { mutated = true; } };
  const receipt = await vm.runInNewContext('(async()=>{' + compileNativeScript(projection) + '})()', { figma });
  assert.equal(receipt.status, 'PREFLIGHT_FAILED'); assert.equal(mutated, false); assert.equal(receipt.created_node_ids.length, 0);
});
test('existing projection is preserved and never mistaken for verified native output', async () => {
  const { projection } = fixture().compile();
  const figma = { root: { children: [{ id: 'existing', name: projection.name + ' / ' + projection.revision + ' / ' + projection.manifest_sha256.slice(0, 8) }] } };
  const receipt = await vm.runInNewContext('(async()=>{' + compileNativeScript(projection) + '})()', { figma });
  assert.equal(receipt.status, 'EXISTS_UNVERIFIED'); assert.equal(receipt.page_id, 'existing');
});
test('partial style assignment failure retains the created style ID for scoped cleanup', async () => {
  const { projection } = fixture().compile();
  const page = { id: 'page', setPluginData() {} };
  const figma = { root: { children: [] }, listAvailableFontsAsync: async () => [{ fontName: projection.text_styles[0].font }], loadFontAsync: async () => {}, createPage: () => page, setCurrentPageAsync: async () => {}, variables: { createVariableCollection: () => ({ id: 'collection', defaultModeId: 'mode' }), createVariable: () => ({ id: 'var', setValueForMode() {}, setVariableCodeSyntax() {} }) }, createTextStyle: () => new Proxy({ id: 'created-style' }, { set() { throw new Error('style assignment failure'); } }) };
  const receipt = await vm.runInNewContext('(async()=>{' + compileNativeScript(projection) + '})()', { figma });
  assert.equal(receipt.status, 'PARTIAL_FAILED'); assert.deepEqual(Array.from(receipt.style_ids), ['created-style']);
});
const expected = { repository: 'example/product', commit: 'c'.repeat(40), project: 'product' };
function preview() { return { source: 'vercel-connector', observed_at: '2025-10-06T14:00:00Z', deployment: { id: 'dpl_123abc', state: 'READY', target: null, repository: expected.repository, commit: expected.commit, project: expected.project, url: 'https://product-abcdef-example.vercel.app' } }; }
test('preview binding has an explicit narrow verdict and rejects production, custom domains and wrong ownership', () => {
  assert.equal(verifyPreviewBinding(expected, preview()).verdict, 'IDENTITY_BOUND_ONLY');
  for (const change of [{ target: 'production' }, { commit: 'd'.repeat(40) }, { repository: 'example/other' }, { project: 'other' }, { url: 'https://example.com' }, { url: 'https://product-abcdef-example.vercel.app/?token=secret' }, { state: 'ERROR' }]) {
    const p = preview(); Object.assign(p.deployment, change); assert.throws(() => verifyPreviewBinding(expected, p));
  }
  const p = preview(); p.observed_at = '2100-01-01T00:00:00Z'; assert.throws(() => verifyPreviewBinding(expected, p), /future/);
  assert.throws(() => verifyPreviewBinding({ ...expected, project: undefined }, preview()), /project/);
});
