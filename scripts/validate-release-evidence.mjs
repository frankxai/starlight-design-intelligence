import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { PNG } from "pngjs";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function formatAjvError(error) {
  const location = error.instancePath || "/";
  return `${location} ${error.message}`;
}

function sumScores(scores) {
  return Object.values(scores ?? {}).reduce((sum, score) => sum + score, 0);
}

function imageDimensions(buffer, mime) {
  if (mime === "image/png") {
    try {
      const decoded = PNG.sync.read(buffer, { checkCRC: true });
      return { width: decoded.width, height: decoded.height };
    } catch {
      return null;
    }
  }
  return null;
}

function hasValidMediaSignature(buffer, mime) {
  if (mime.startsWith("image/")) return Boolean(imageDimensions(buffer, mime));
  if (mime === "application/json") {
    try {
      JSON.parse(buffer.toString("utf8"));
      return true;
    } catch {
      return false;
    }
  }
  if (mime.startsWith("text/")) return !buffer.includes(0);
  if (mime === "font/woff") return buffer.subarray(0, 4).toString("ascii") === "wOFF";
  if (mime === "font/woff2") return buffer.subarray(0, 4).toString("ascii") === "wOF2";
  if (mime === "font/ttf") {
    const signature = buffer.subarray(0, 4).toString("hex");
    return signature === "00010000" || buffer.subarray(0, 4).toString("ascii") === "OTTO";
  }
  return false;
}

function collectArtifacts(value, path = "$", artifacts = []) {
  if (!value || typeof value !== "object") return artifacts;
  if (
    typeof value.sha256 === "string" &&
    Number.isInteger(value.bytes) &&
    typeof value.mime === "string" &&
    (typeof value.path === "string" || typeof value.url === "string")
  ) {
    artifacts.push({ value, path });
    return artifacts;
  }
  for (const [key, child] of Object.entries(value)) {
    collectArtifacts(child, `${path}.${key}`, artifacts);
  }
  return artifacts;
}

function inspectArtifact(artifact, label, evidenceRoot, failures) {
  if (artifact.mime.startsWith("image/") && (!artifact.width || !artifact.height)) {
    failures.push(`${label}: image evidence requires width and height`);
  }
  if (!artifact.path) {
    failures.push(`${label}: remote evidence is prohibited; provide a local content-addressed path`);
    return;
  }
  const absolute = resolve(evidenceRoot, artifact.path);
  const relativePath = relative(evidenceRoot, absolute);
  if (!relativePath || relativePath.startsWith("..") || resolve(relativePath) === relativePath) {
    failures.push(`${label}: artifact escapes the manifest directory`);
    return;
  }
  if (!existsSync(absolute) || !statSync(absolute).isFile()) {
    failures.push(`${label}: evidence file not found: ${artifact.path}`);
    return;
  }

  const buffer = readFileSync(absolute);
  if (buffer.length === 0) failures.push(`${label}: evidence file is empty`);
  if (buffer.length !== artifact.bytes) {
    failures.push(`${label}: bytes mismatch; manifest ${artifact.bytes}, actual ${buffer.length}`);
  }
  const digest = createHash("sha256").update(buffer).digest("hex");
  if (digest !== artifact.sha256) failures.push(`${label}: sha256 mismatch`);
  if (!hasValidMediaSignature(buffer, artifact.mime)) {
    failures.push(`${label}: content does not match declared MIME ${artifact.mime}`);
  }
  if (artifact.mime.startsWith("image/")) {
    const actual = imageDimensions(buffer, artifact.mime);
    if (actual && (actual.width !== artifact.width || actual.height !== artifact.height)) {
      failures.push(
        `${label}: dimensions mismatch; manifest ${artifact.width}x${artifact.height}, actual ${actual.width}x${actual.height}`
      );
    }
  }
}

function loadReportSummary(report, label, evidenceRoot, failures) {
  const artifact = report?.artifact;
  if (!artifact?.path) return;
  const path = resolve(evidenceRoot, artifact.path);
  if (!existsSync(path)) return;
  let actual;
  try {
    actual = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return;
  }
  const expected = Object.fromEntries(
    Object.entries(report).filter(([key]) => key !== "artifact")
  );
  if (!isDeepStrictEqual(actual, expected)) {
    failures.push(`${label}: JSON report content must exactly match the manifest summary`);
  }
}

function parseTime(value, label, failures) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  if (time > Date.now() + 5 * 60 * 1000) failures.push(`${label}: verification time is in the future`);
  return time;
}

function verifyFrameDimensions(sequence, label, failures) {
  if (!sequence?.viewport || !Array.isArray(sequence.frames)) return;
  const expectedWidth = sequence.viewport.css_width * sequence.viewport.device_pixel_ratio;
  const expectedHeight = sequence.viewport.css_height * sequence.viewport.device_pixel_ratio;
  for (const [index, frame] of sequence.frames.entries()) {
    if (
      frame.artifact?.width !== expectedWidth ||
      frame.artifact?.height !== expectedHeight
    ) {
      failures.push(
        `${label}/frames/${index}/artifact dimensions must equal CSS viewport × device pixel ratio (${expectedWidth}x${expectedHeight})`
      );
    }
  }
}

function decodedArtifact(artifact, evidenceRoot) {
  if (!artifact?.path) return null;
  const absolute = resolve(evidenceRoot, artifact.path);
  const relativePath = relative(evidenceRoot, absolute);
  if (!relativePath || relativePath.startsWith("..") || resolve(relativePath) === relativePath) return null;
  try {
    return PNG.sync.read(readFileSync(absolute), { checkCRC: true });
  } catch {
    return null;
  }
}

function changedPixelRatio(first, second) {
  if (!first || !second || first.width !== second.width || first.height !== second.height) return null;
  let changed = 0;
  for (let index = 0; index < first.data.length; index += 4) {
    const delta =
      Math.abs(first.data[index] - second.data[index]) +
      Math.abs(first.data[index + 1] - second.data[index + 1]) +
      Math.abs(first.data[index + 2] - second.data[index + 2]) +
      Math.abs(first.data[index + 3] - second.data[index + 3]);
    if (delta >= 12) changed += 1;
  }
  return changed / (first.width * first.height);
}

function verifyMotionEvidence(manifest, evidenceRoot, failures) {
  if (manifest.motion?.decision !== "ship") return;
  const sequences = [
    ["/motion/runtime_evidence", manifest.motion.runtime_evidence],
    ["/motion/mobile_evidence", manifest.motion.mobile_evidence]
  ];
  const allMotionHashes = [];
  for (const [label, sequence] of sequences) {
    verifyFrameDimensions(sequence, label, failures);
    const frames = sequence?.frames ?? [];
    const states = frames.map((frame) => frame.state);
    for (const required of ["initial", "active", "resting"]) {
      if (!states.includes(required)) failures.push(`${label} must include ${required} state`);
    }
    const hashes = frames.map((frame) => frame.artifact?.sha256);
    if (hashes.length && new Set(hashes).size !== hashes.length) {
      failures.push(`${label} must contain distinct decoded frames`);
    }
    for (let index = 1; index < frames.length; index += 1) {
      if (frames[index].at_ms <= frames[index - 1].at_ms) {
        failures.push(`${label} frame timestamps must be strictly increasing`);
      }
      const ratio = changedPixelRatio(
        decodedArtifact(frames[index - 1].artifact, evidenceRoot),
        decodedArtifact(frames[index].artifact, evidenceRoot)
      );
      if (ratio !== null && ratio < 0.001) {
        failures.push(`${label} adjacent frames must change at least 0.1% of pixels`);
      }
    }
    allMotionHashes.push(...hashes);
  }
  if (allMotionHashes.length && new Set(allMotionHashes).size !== allMotionHashes.length) {
    failures.push("/motion desktop and mobile frame evidence must be distinct");
  }

  const reduced = manifest.motion.reduced_motion_evidence;
  verifyFrameDimensions(reduced, "/motion/reduced_motion_evidence", failures);
  const reducedFrames = reduced?.frames ?? [];
  if (reducedFrames.length === 2) {
    if (reducedFrames[1].at_ms <= reducedFrames[0].at_ms) {
      failures.push("/motion/reduced_motion_evidence frame timestamps must be strictly increasing");
    }
    if (reducedFrames[0].artifact?.sha256 !== reducedFrames[1].artifact?.sha256) {
      failures.push("/motion/reduced_motion_evidence must remain visually stable");
    }
  }
}

function normalizeGitHubRemote(remote) {
  const match = remote.trim().match(/github\.com[/:]([^/]+)\/([^/\s]+?)(?:\.git)?$/i);
  return match ? `${match[1]}/${match[2]}` : null;
}

function git(repoRoot, args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function verifyRepositoryProof(manifest, repoRoot, manifestPath, failures) {
  try {
    const remoteRepo = normalizeGitHubRemote(git(repoRoot, ["remote", "get-url", "origin"]));
    if (remoteRepo !== manifest.surface?.repo) {
      failures.push(`/surface/repo does not match repo-root origin (${remoteRepo ?? "unresolved"})`);
    }
  } catch {
    failures.push("--repo-root must be a git repository with an origin remote");
    return;
  }

  const production = manifest.release?.production_commit_sha;
  const rollback = manifest.release?.rollback?.target_commit_sha;
  for (const [label, sha] of [["production", production], ["rollback", rollback]]) {
    try {
      git(repoRoot, ["cat-file", "-e", `${sha}^{commit}`]);
    } catch {
      failures.push(`/release ${label} commit does not exist in repo-root: ${sha}`);
    }
  }
  if (production && rollback && production === rollback) {
    failures.push("/release/rollback target must differ from production commit");
  } else if (production && rollback) {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", rollback, production], {
        cwd: repoRoot,
        stdio: "ignore"
      });
    } catch {
      failures.push("/release/rollback target must be an ancestor of production commit");
    }
  }

  if (production) {
    try {
      const changed = new Set(
        git(repoRoot, ["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", production])
          .split(/\r?\n/)
          .filter(Boolean)
      );
      for (const path of manifest.surface?.changed_paths ?? []) {
        if (!changed.has(path)) failures.push(`/surface/changed_paths is not changed by production commit: ${path}`);
      }
      const declared = new Set(manifest.release?.commit_changed_paths ?? []);
      for (const path of changed) {
        if (!declared.has(path)) failures.push(`/release/commit_changed_paths omits production change: ${path}`);
      }
      for (const path of declared) {
        if (!changed.has(path)) failures.push(`/release/commit_changed_paths contains unchanged path: ${path}`);
      }
      const relativeManifest = relative(repoRoot, resolve(manifestPath));
      const manifestIsInsideRepo =
        relativeManifest &&
        !relativeManifest.startsWith("..") &&
        resolve(relativeManifest) !== relativeManifest;
      if (manifestIsInsideRepo && changed.has(relativeManifest)) {
        try {
          const committedManifest = execFileSync(
            "git",
            ["show", `${production}:${relativeManifest}`],
            { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] }
          );
          const suppliedManifest = readFileSync(resolve(manifestPath));
          if (committedManifest.equals(suppliedManifest)) {
            failures.push("/release manifest content cannot be embedded in the production commit whose SHA it records");
          }
        } catch {
          // A deleted production path has no embedded receipt blob to compare.
        }
      }
    } catch {
      failures.push("/release could not inspect production commit paths");
    }
  }
}

export function validateReleaseManifest(
  manifest,
  manifestPath,
  { root = scriptRoot, repoRoot = process.cwd() } = {}
) {
  const failures = [];
  const schemaPath = join(root, "schemas/web-release-evidence.schema.json");
  const schema = loadJson(schemaPath);
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(manifest)) failures.push(...validate.errors.map(formatAjvError));

  const ids = manifest.direction?.options?.map((option) => option.id) ?? [];
  if (new Set(ids).size !== ids.length) failures.push("/direction/options ids must be unique");
  const directionHashes = manifest.direction?.options?.map((option) => option.artifact?.sha256) ?? [];
  if (directionHashes.length === 3 && new Set(directionHashes).size !== 3) {
    failures.push("/direction/options must contain three distinct visual artifacts");
  }
  if (manifest.direction?.selected && !ids.includes(manifest.direction.selected)) {
    failures.push("/direction/selected must match one of the three option ids");
  }

  for (const section of ["editorial", "typography", "visual"]) {
    if (manifest[section]?.score !== undefined) {
      const total = sumScores(manifest[section].item_scores);
      if (manifest[section].score !== total) {
        failures.push(`/${section}/score must equal item_scores total (${total})`);
      }
    }
  }
  if (manifest.motion?.decision === "ship") {
    const total = sumScores(manifest.motion.item_scores);
    if (manifest.motion.score !== total) {
      failures.push(`/motion/score must equal item_scores total (${total})`);
    }
  }

  const owners = [manifest.owners?.maker, manifest.owners?.verifier, manifest.owners?.approver];
  if (new Set(owners).size !== 3) failures.push("/owners maker, verifier, and approver must be distinct");
  for (const section of ["editorial", "typography", "visual", "motion"]) {
    if (manifest[section]?.verifier && manifest[section].verifier !== manifest.owners?.verifier) {
      failures.push(`/${section}/verifier must equal owners.verifier`);
    }
  }
  if (manifest.direction?.decision_owner !== manifest.owners?.approver) {
    failures.push("/direction/decision_owner must equal owners.approver");
  }
  if (manifest.editorial?.copy_sha256 !== manifest.editorial?.copy_artifact?.sha256) {
    failures.push("/editorial/copy_sha256 must equal copy_artifact.sha256");
  }
  if (manifest.surface?.production_url !== manifest.release?.production_url) {
    failures.push("/release/production_url must equal surface.production_url");
  }
  if (manifest.engineering?.commit_sha !== manifest.release?.production_commit_sha) {
    failures.push("/release/production_commit_sha must equal engineering.commit_sha");
  }
  if (manifest.release?.post_deploy?.deployed_commit_sha !== manifest.release?.production_commit_sha) {
    failures.push("/release/post_deploy/deployed_commit_sha must equal production_commit_sha");
  }
  if (manifest.release?.post_deploy?.production_url !== manifest.release?.production_url) {
    failures.push("/release/post_deploy/production_url must equal release.production_url");
  }
  if (manifest.typography?.mode !== manifest.typography?.computed_fonts?.mode) {
    failures.push("/typography/mode must equal computed_fonts.mode");
  }
  if (manifest.typography?.display !== manifest.typography?.computed_fonts?.display_family) {
    failures.push("/typography/display must equal computed_fonts.display_family");
  }
  if (manifest.typography?.body !== manifest.typography?.computed_fonts?.body_family) {
    failures.push("/typography/body must equal computed_fonts.body_family");
  }
  const declaredWeights = new Set(
    (manifest.typography?.font_files ?? []).flatMap((font) => font.weights ?? [])
  );
  const verifiedWeights = new Set(manifest.typography?.computed_fonts?.weights_verified ?? []);
  for (const weight of declaredWeights) {
    if (!verifiedWeights.has(weight)) failures.push(`/typography/computed_fonts omits declared weight: ${weight}`);
  }
  const expectedEvents = manifest.engineering?.analytics?.expected_events ?? [];
  const verifiedEvents = manifest.engineering?.analytics?.verified_events ?? [];
  if (
    expectedEvents.length !== verifiedEvents.length ||
    expectedEvents.some((event) => !verifiedEvents.includes(event))
  ) failures.push("/engineering/analytics verified_events must equal expected_events");
  const allowedTestUrls = new Set([manifest.release?.preview_url, manifest.release?.production_url]);
  for (const [label, report] of [
    ["/typography/computed_fonts", manifest.typography?.computed_fonts],
    ["/engineering/accessibility", manifest.engineering?.accessibility],
    ["/engineering/performance", manifest.engineering?.performance],
    ["/engineering/links", manifest.engineering?.links],
    ["/engineering/claims", manifest.engineering?.claims],
    ["/engineering/privacy", manifest.engineering?.privacy],
    ["/engineering/analytics", manifest.engineering?.analytics],
    ["/engineering/console", manifest.engineering?.console],
    ["/motion/runtime_evidence", manifest.motion?.runtime_evidence],
    ["/motion/mobile_evidence", manifest.motion?.mobile_evidence],
    ["/motion/reduced_motion_evidence", manifest.motion?.reduced_motion_evidence]
  ]) {
    if (report?.tested_url && !allowedTestUrls.has(report.tested_url)) {
      failures.push(`${label}/tested_url must equal preview_url or production_url`);
    }
  }

  const brandId = manifest.surface?.brand_id;
  if (brandId) {
    const brandPack = join(root, "brand-image-system/runtime/brands", brandId, "brand-pack.json");
    if (!existsSync(brandPack)) failures.push(`/surface/brand_id has no runtime brand pack: ${brandId}`);
  }

  const evidenceRoot = dirname(resolve(manifestPath));
  verifyMotionEvidence(manifest, evidenceRoot, failures);
  for (const { value, path } of collectArtifacts(manifest)) {
    inspectArtifact(value, path, evidenceRoot, failures);
  }
  for (const [label, report] of [
    ["/typography/computed_fonts", manifest.typography?.computed_fonts],
    ["/engineering/accessibility", manifest.engineering?.accessibility],
    ["/engineering/performance", manifest.engineering?.performance],
    ["/engineering/links", manifest.engineering?.links],
    ["/engineering/claims", manifest.engineering?.claims],
    ["/engineering/privacy", manifest.engineering?.privacy],
    ["/engineering/analytics", manifest.engineering?.analytics],
    ["/engineering/console", manifest.engineering?.console],
    ["/release/post_deploy", manifest.release?.post_deploy],
    ["/release/rollback", manifest.release?.rollback]
  ]) loadReportSummary(report, label, evidenceRoot, failures);

  const releaseTime = parseTime(manifest.release?.verified_at, "/release/verified_at", failures);
  for (const [label, value] of [
    ["/editorial/verified_at", manifest.editorial?.verified_at],
    ["/typography/verified_at", manifest.typography?.verified_at],
    ["/visual/verified_at", manifest.visual?.verified_at],
    ["/motion/verified_at", manifest.motion?.verified_at],
    ["/typography/computed_fonts/tested_at", manifest.typography?.computed_fonts?.tested_at],
    ["/engineering/accessibility/tested_at", manifest.engineering?.accessibility?.tested_at],
    ["/engineering/performance/tested_at", manifest.engineering?.performance?.tested_at],
    ["/engineering/links/tested_at", manifest.engineering?.links?.tested_at],
    ["/engineering/claims/tested_at", manifest.engineering?.claims?.tested_at],
    ["/engineering/privacy/tested_at", manifest.engineering?.privacy?.tested_at],
    ["/engineering/analytics/tested_at", manifest.engineering?.analytics?.tested_at],
    ["/engineering/console/tested_at", manifest.engineering?.console?.tested_at],
    ["/release/post_deploy/tested_at", manifest.release?.post_deploy?.tested_at],
    ["/release/rollback/tested_at", manifest.release?.rollback?.tested_at]
  ]) {
    const time = parseTime(value, label, failures);
    if (releaseTime && time && time > releaseTime) failures.push(`${label}: occurs after release.verified_at`);
  }

  const phaseTimes = [
    ["/editorial/verified_at", Date.parse(manifest.editorial?.verified_at)],
    ["/typography/verified_at", Date.parse(manifest.typography?.verified_at)],
    ["/visual/verified_at", Date.parse(manifest.visual?.verified_at)],
    ["/motion/verified_at", Date.parse(manifest.motion?.verified_at)],
    ["/engineering/tested_at", Date.parse(manifest.engineering?.performance?.tested_at)],
    ["/release/post_deploy/tested_at", Date.parse(manifest.release?.post_deploy?.tested_at)],
    ["/release/verified_at", releaseTime]
  ];
  for (let index = 1; index < phaseTimes.length; index += 1) {
    const [previousLabel, previous] = phaseTimes[index - 1];
    const [label, current] = phaseTimes[index];
    if (Number.isFinite(previous) && Number.isFinite(current) && current < previous) {
      failures.push(`${label}: phase occurs before ${previousLabel}`);
    }
  }

  verifyRepositoryProof(manifest, resolve(repoRoot), manifestPath, failures);

  return [...new Set(failures)];
}

function main() {
  const args = process.argv.slice(2);
  const manifestPath = args[0];
  const repoRootIndex = args.indexOf("--repo-root");
  const repoRoot = repoRootIndex >= 0 ? args[repoRootIndex + 1] : process.cwd();
  if (!manifestPath) {
    console.error("Usage: npm run validate:release -- path/to/release.json");
    process.exit(2);
  }

  let manifest;
  const absolute = resolve(manifestPath);
  try {
    manifest = loadJson(absolute);
  } catch (error) {
    console.error(`Cannot read release manifest: ${error.message}`);
    process.exit(2);
  }

  const failures = validateReleaseManifest(manifest, absolute, { repoRoot });
  if (failures.length) {
    console.error(`Release evidence failed (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Release evidence valid for ${manifest.surface.name}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
