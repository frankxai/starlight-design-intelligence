import test from "node:test";
import assert from "node:assert/strict";
import { validateAtlas, usage, refreshQueue } from "../scripts/content-asset-atlas.mjs";

export function fixture() {
  const sha = "a".repeat(64), commit = "b".repeat(40);
  const source = { repository: "example/product", commit, path: "content/lesson.json" };
  return {
    schema_version: "starlight.content_asset_atlas.v1",
    assets: [{ id: "example.hero", brand: "example", rights: { claim: "owned fixture", evidence_url: "https://example.com/rights" }, versions: [{ sha256: sha, source, delivery_url: "https://example.com/hero.webp", mime: "image/webp", alt: "A learning illustration", approval: { status: "source-reviewed", evidence_url: "https://example.com/review" } }] }],
    contents: [{ id: "example.lesson", brand: "example", kind: "lesson", versions: [{ sha256: sha, source, assets: [{ asset_id: "example.hero", sha256: sha, role: "hero" }] }] }],
    lessons: [{ id: "example.practice", content_id: "example.lesson", objectives: ["Explain one permission boundary"], learner_store: "browser-local", fragment: null }],
    screens: [{ id: "example.mobile", route: "https://example.com/learn", role: "anonymous", state: "initial", viewport: { width: 390, height: 844 }, content_ids: ["example.lesson"], figma: { status: "pending", file_key: null, node_id: null, reason: "Native mapping pending" } }],
    releases: [{ id: "example.release", status: "observed", commit, content_pins: [{ content_id: "example.lesson", sha256: sha }], screen_ids: ["example.mobile"], evidence_url: null }]
  };
}

test("valid observed slice derives actual usage and pending refresh", () => {
  const data = fixture();
  assert.deepEqual(validateAtlas(data), []);
  assert.equal(usage(data)[0].placements[0].lesson_ids[0], "example.practice");
  assert.equal(refreshQueue(data).length, 1);
  assert.deepEqual(validateAtlas(data, structuredClone(data)), []);
});
test("unknown assets and rendition hashes fail closed", () => {
  const data = fixture();
  data.contents[0].versions[0].assets[0].asset_id = "example.missing";
  assert.match(validateAtlas(data).join(), /Missing assets/);
  data.contents[0].versions[0].assets[0].asset_id = "example.hero";
  data.contents[0].versions[0].assets[0].sha256 = "c".repeat(64);
  assert.match(validateAtlas(data).join(), /Unknown rendition/);
});
test("learner PII and unexpected metadata cannot enter editorial registry", () => {
  const data = fixture(); data.lessons[0].email = "private@example.com";
  assert.match(validateAtlas(data).join(), /additional properties/);
});
test("duplicate entity IDs and cross-brand unlicensed reuse fail", () => {
  const data = fixture(); data.lessons[0].id = data.contents[0].id;
  assert.match(validateAtlas(data).join(), /Duplicate identity/);
  const other = fixture(); other.assets[0].brand = "another";
  assert.match(validateAtlas(other).join(), /Cross-brand/);
});
test("immutable versions and historical releases cannot be changed or deleted", () => {
  const previous = fixture(), next = structuredClone(previous);
  next.assets[0].versions[0].delivery_url = "https://example.com/replaced.webp";
  assert.match(validateAtlas(next, previous).join(), /Immutable version changed/);
  const deleted = fixture(); deleted.releases = [];
  assert.match(validateAtlas(deleted, previous).join(), /Release changed or removed/);
});
test("append a new content version without rebinding the previous release", () => {
  const previous = fixture(), next = structuredClone(previous);
  next.contents[0].versions.push({ ...structuredClone(next.contents[0].versions[0]), sha256: "c".repeat(64) });
  assert.deepEqual(validateAtlas(next, previous), []);
  assert.equal(next.releases[0].content_pins[0].sha256, "a".repeat(64));
});
test("verified status requires mapping, recorded approval and evidence", () => {
  const data = fixture(); data.releases[0].status = "evidence-recorded";
  assert.match(validateAtlas(data).join(), /lacks Figma mapping/);
  assert.match(validateAtlas(data).join(), /lacks asset approval/);
  data.screens[0].figma = {status:"mapped",file_key:"example",node_id:"1:2",reason:""};
  data.releases[0].evidence_url = "https://example.com/receipt";
  data.assets[0].versions[0].approval = {status:"approved", evidence_url:"https://example.com/review", reviewer:"fixture reviewer", approved_at:"2026-10-07T00:00:00Z"};
  assert.deepEqual(validateAtlas(data), []);
});
test("unverified Figma IDs and source traversal fail", () => {
  const data = fixture(); data.screens[0].figma.file_key = "guessed";
  assert.match(validateAtlas(data).join(), /Unverified Figma identity/);
  const escaped = fixture(); escaped.assets[0].versions[0].source.path = "../private";
  assert.ok(validateAtlas(escaped).length);
});
test("duplicate versions and release pins are rejected", () => {
  for (const kind of ["assets", "contents"]) {
    const data = fixture(); data[kind][0].versions.push(structuredClone(data[kind][0].versions[0]));
    assert.match(validateAtlas(data).join(), /Duplicate version hash/);
  }
  const data = fixture(); data.releases[0].content_pins.push(structuredClone(data.releases[0].content_pins[0]));
  assert.match(validateAtlas(data).join(), /Duplicate content pin/);
});
test("release screen content must match pinned content", () => {
  const data = fixture(); const extra = structuredClone(data.contents[0]); extra.id = "example.other";
  data.contents.push(extra); data.screens[0].content_ids.push(extra.id);
  assert.match(validateAtlas(data).join(), /Released screen content is unpinned/);
  data.screens[0].content_ids = [extra.id];
  assert.match(validateAtlas(data).join(), /Release pin has no screen/);
});
test("historical identity cannot be silently reassigned", () => {
  const previous = fixture(), next = structuredClone(previous);
  next.assets[0].brand = next.contents[0].brand = "other";
  assert.match(validateAtlas(next, previous).join(), /Historical identity metadata changed/);
});
test("an embedded lesson identifies its fragment", () => {
  const data = fixture(); data.contents[0].kind = "page";
  assert.match(validateAtlas(data).join(), /Embedded lesson requires/);
  data.lessons[0].fragment = "#practice";
  assert.deepEqual(validateAtlas(data), []);
});
test("review promotion preserves bytes and evidence, then freezes approval", () => {
  const previous = fixture(), next = structuredClone(previous);
  next.assets[0].versions[0].approval = {...next.assets[0].versions[0].approval, status:"approved", reviewer:"named reviewer", approved_at:"2026-10-07T00:00:00Z"};
  assert.deepEqual(validateAtlas(next, previous), []);
  const changedBytes = structuredClone(next); changedBytes.assets[0].versions[0].delivery_url = "https://example.com/replaced.webp";
  assert.match(validateAtlas(changedBytes, previous).join(), /Immutable version/);
  const changedEvidence = structuredClone(next); changedEvidence.assets[0].versions[0].approval.evidence_url = "https://example.com/other";
  assert.match(validateAtlas(changedEvidence, previous).join(), /Immutable version/);
  const changedReviewer = structuredClone(next); changedReviewer.assets[0].versions[0].approval.reviewer = "other reviewer";
  assert.match(validateAtlas(changedReviewer, next).join(), /Immutable version/);
  const downgrade = structuredClone(next); downgrade.assets[0].versions[0].approval.status = "source-reviewed";
  assert.match(validateAtlas(downgrade, next).join(), /Immutable version/);
});
