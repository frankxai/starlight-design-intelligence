import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const root = process.cwd();

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "design-observatory-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const path of ["observatory", "schemas", "portfolio", "brand-packs", "brand-image-system/runtime/brands"]) {
    cpSync(join(root, path), join(directory, path), { recursive: true });
  }
  return directory;
}

function run(script, directory = root, args = []) {
  return spawnSync(process.execPath, [join(root, "scripts", script), ...args], {
    cwd: directory,
    encoding: "utf8"
  });
}

function rejected(directory, diagnostic) {
  const result = run("validate-observatory.mjs", directory);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, diagnostic);
  assert.doesNotMatch(result.stderr, /TypeError|ReferenceError/u);
}

function updateExtraction(directory, change) {
  const path = join(directory, "observatory/targets/linear/extraction.yaml");
  const value = parseYaml(readFileSync(path, "utf8"));
  change(value);
  writeFileSync(path, stringifyYaml(value));
}

function updateLedger(directory, change) {
  const path = join(directory, "observatory/source-ledger.jsonl");
  const rows = readFileSync(path, "utf8").trim().split("\n").map(JSON.parse);
  change(rows);
  writeFileSync(path, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

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

test("retrieval index generation is deterministic without modifying the checkout", (t) => {
  const directory = fixture(t);
  const path = join(directory, "observatory/retrieval-index.json");
  assert.equal(run("build-observatory-index.mjs", directory).status, 0);
  const first = readFileSync(path, "utf8");
  assert.equal(run("build-observatory-index.mjs", directory).status, 0);
  const second = readFileSync(path, "utf8");
  assert.equal(second, first);
  const index = JSON.parse(first);
  assert.equal(Object.keys(index.domains).length, 11);
  assert.ok(index.domains["realityarchitect-ai"].latest_snapshots.length > 0);
});

test("committed retrieval index matches its source records", () => {
  const result = run("build-observatory-index.mjs", root, ["--check"]);
  assert.equal(result.status, 0, result.stderr);
});

test("index check rejects a stale artifact without repairing it", (t) => {
  const directory = fixture(t);
  const path = join(directory, "observatory/retrieval-index.json");
  writeFileSync(path, "{\"stale\":true}\n");
  const result = run("build-observatory-index.mjs", directory, ["--check"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing or stale/u);
  assert.equal(readFileSync(path, "utf8"), "{\"stale\":true}\n");
});

test("index check detects changed source records with an unchanged index", (t) => {
  const directory = fixture(t);
  const path = join(directory, "observatory/retrieval-index.json");
  const before = readFileSync(path, "utf8");
  const domainPath = join(directory, "portfolio/domains/realityarchitect-ai.yaml");
  const profile = parseYaml(readFileSync(domainPath, "utf8"));
  profile.domains.push("new-domain.example");
  writeFileSync(domainPath, stringifyYaml(profile));
  const result = run("build-observatory-index.mjs", directory, ["--check"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing or stale/u);
  assert.equal(readFileSync(path, "utf8"), before);
});

test("index check rejects a missing artifact without creating it", (t) => {
  const directory = fixture(t);
  const path = join(directory, "observatory/retrieval-index.json");
  rmSync(path);
  assert.equal(run("build-observatory-index.mjs", directory, ["--check"]).status, 1);
  assert.equal(existsSync(path), false);
});

test("misspelled index arguments fail without switching to write mode", (t) => {
  const directory = fixture(t);
  const path = join(directory, "observatory/retrieval-index.json");
  writeFileSync(path, "unchanged\n");
  assert.equal(run("build-observatory-index.mjs", directory, ["--chek"]).status, 2);
  assert.equal(readFileSync(path, "utf8"), "unchanged\n");
});

test("extraction rejects existing snapshots belonging to another target", (t) => {
  const directory = fixture(t);
  const ledger = readFileSync(join(directory, "observatory/source-ledger.jsonl"), "utf8")
    .trim().split("\n").map(JSON.parse);
  const foreignId = ledger.find((row) => row.target_id !== "linear").snapshot_id;
  updateExtraction(directory, (value) => value.snapshot_ids.push(foreignId));
  rejected(directory, /belongs to another target/u);
});

test("finding rejects evidence not declared by its extraction", (t) => {
  const directory = fixture(t);
  updateExtraction(directory, (value) => {
    value.snapshot_ids = value.snapshot_ids.slice(1);
  });
  rejected(directory, /is not declared by its extraction/u);
});

test("duplicate extraction cannot shadow the canonical target extraction", (t) => {
  const directory = fixture(t);
  const nested = join(directory, "observatory/targets/linear/duplicate");
  mkdirSync(nested);
  cpSync(join(directory, "observatory/targets/linear/extraction.yaml"), join(nested, "extraction.yaml"));
  rejected(directory, /duplicate extraction target_id: linear/u);
});

test("schema failures are reported before cross-record checks", (t) => {
  const directory = fixture(t);
  updateExtraction(directory, (value) => { delete value.findings; });
  rejected(directory, /must have required property 'findings'/u);
});

test("snapshot content hash must identify its HTML artifact", (t) => {
  const directory = fixture(t);
  const snapshots = join(directory, "observatory/targets/linear/snapshots");
  const path = join(snapshots, readdirSync(snapshots)[0]);
  const value = JSON.parse(readFileSync(path, "utf8"));
  value.content_hash = "0".repeat(64);
  writeFileSync(path, JSON.stringify(value));
  rejected(directory, /content_hash does not match HTML artifact/u);
});

for (const field of ["target_id", "surface_id", "source_owner", "capture_date", "rights_state", "allowed_use", "content_hash"]) {
  test(`ledger rejects contradictory ${field}`, (t) => {
    const directory = fixture(t);
    updateLedger(directory, (rows) => { rows[0][field] = "contradictory-value"; });
    rejected(directory, new RegExp(`ledger ${field} does not match snapshot`, "u"));
  });
}

for (const name of ["screenshot", "html"]) {
  test(`ledger rejects a substituted ${name} artifact hash`, (t) => {
    const directory = fixture(t);
    updateLedger(directory, (rows) => { rows[0].artifact_hashes[name] = "0".repeat(64); });
    rejected(directory, new RegExp(`ledger ${name} hash does not match snapshot`, "u"));
  });
}

for (const change of ["missing", "extra"]) {
  test(`ledger rejects ${change} artifact hash entries`, (t) => {
    const directory = fixture(t);
    updateLedger(directory, (rows) => {
      if (change === "missing") delete rows[0].artifact_hashes.html;
      else rows[0].artifact_hashes.unrecorded = "0".repeat(64);
    });
    rejected(directory, /artifact_hashes must cover exactly/u);
  });
}

test("ledger rejects unknown snapshots even when all provenance fields exist", (t) => {
  const directory = fixture(t);
  updateLedger(directory, (rows) => {
    rows.push({ ...rows[0], snapshot_id: "snapshot.unknown.homepage" });
  });
  rejected(directory, /ledger entry references unknown snapshot/u);
});

test("ledger rejects primitive JSON entries without throwing", (t) => {
  const directory = fixture(t);
  updateLedger(directory, (rows) => { rows.push(null, []); });
  rejected(directory, /entry must be an object/u);
});

test("kernel CI runs for every pull request and checks source integrity before tests", () => {
  const workflow = parseYaml(readFileSync(join(root, ".github/workflows/design-kernel.yml"), "utf8"));
  assert.ok(Object.hasOwn(workflow.on, "pull_request"));
  assert.equal(workflow.on.pull_request, null, "path and branch filters can bypass the required kernel check");
  const job = workflow.jobs.validate;
  assert.equal(job.if, undefined);
  assert.equal(job["continue-on-error"], undefined);
  const steps = job.steps.filter((step) => step.run);
  const testIndex = steps.findIndex((step) => step.run === "npm test");
  for (const command of ["npm run validate", "npm run validate:observatory", "npm run check:observatory-index"]) {
    const index = steps.findIndex((step) => step.run === command);
    assert.ok(index >= 0 && index < testIndex, `${command} must run before tests`);
    assert.equal(steps[index].if, undefined);
    assert.equal(steps[index]["continue-on-error"], undefined);
  }
});
