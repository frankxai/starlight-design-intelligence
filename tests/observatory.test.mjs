import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";

const root = process.cwd();

test("observatory integrity validation passes", () => {
  const output = execFileSync("node", ["scripts/validate-observatory.mjs"], {
    cwd: root,
    encoding: "utf8"
  });
  assert.match(output, /17 targets, 85 manifests, 11 patterns, 11 domains/u);
});

test("strict capture coverage fails honestly until exact states exist", () => {
  const result = spawnSync("node", ["scripts/validate-observatory.mjs", "--strict-coverage"], {
    cwd: root,
    encoding: "utf8"
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /exact viewport 1440px pending/u);
  assert.match(result.stderr, /exact viewport 390px pending/u);
  assert.match(result.stderr, /exact viewport 320px pending/u);
});

test("every active domain preserves exactly three directions and one brand", () => {
  const directory = join(root, "portfolio/domains");
  const profiles = readdirSync(directory)
    .filter((name) => name.endsWith(".yaml"))
    .map((name) => parseYaml(readFileSync(join(directory, name), "utf8")));
  assert.equal(profiles.length, 11);
  for (const profile of profiles) {
    assert.equal(profile.active, true);
    assert.equal(typeof profile.brand_id, "string");
    assert.equal(profile.directions.length, 3);
    assert.equal(new Set(profile.directions.map((direction) => direction.direction_id)).size, 3);
    assert.ok(profile.directions.some((direction) => direction.direction_id === profile.nominated_direction_id));
  }
});

test("snapshot schema rejects missing provenance, viewport, hash, and rights", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const targetSchema = JSON.parse(readFileSync(join(root, "schemas/design-research-target.schema.json"), "utf8"));
  const snapshotSchema = JSON.parse(readFileSync(join(root, "schemas/design-snapshot-manifest.schema.json"), "utf8"));
  ajv.addSchema(targetSchema);
  const validate = ajv.compile(snapshotSchema);
  const fixturePath = readdirSync(join(root, "observatory/targets/linear/snapshots"))[0];
  const fixture = JSON.parse(readFileSync(join(root, "observatory/targets/linear/snapshots", fixturePath), "utf8"));
  delete fixture.provenance;
  delete fixture.viewport;
  delete fixture.content_hash;
  delete fixture.rights;
  assert.equal(validate(fixture), false);
  const paths = new Set(validate.errors.map((error) => error.params.missingProperty));
  for (const property of ["provenance", "viewport", "content_hash", "rights"]) assert.ok(paths.has(property));
});

test("retrieval index generation is deterministic", () => {
  execFileSync("node", ["scripts/build-observatory-index.mjs"], { cwd: root });
  const first = readFileSync(join(root, "observatory/retrieval-index.json"), "utf8");
  execFileSync("node", ["scripts/build-observatory-index.mjs"], { cwd: root });
  const second = readFileSync(join(root, "observatory/retrieval-index.json"), "utf8");
  assert.equal(second, first);
  const index = JSON.parse(first);
  assert.equal(Object.keys(index.domains).length, 11);
  assert.ok(index.domains["realityarchitect-ai"].latest_snapshots.length > 0);
});
