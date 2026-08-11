import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { PNG } from "pngjs";
import { validateMediaJob } from "../scripts/validate-media-job.mjs";

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function writeArtifact(directory, name, content, mime, extra = {}) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  writeFileSync(join(directory, name), buffer);
  return { path: name, sha256: digest(buffer), bytes: buffer.length, mime, ...extra };
}

function rewriteReport(directory, name, report, changes) {
  const summary = { ...report, ...changes };
  delete summary.artifact;
  return {
    ...summary,
    artifact: writeArtifact(directory, name, JSON.stringify(summary), "application/json")
  };
}

function png(width, height, marker) {
  const image = new PNG({ width, height });
  image.data.fill(245);
  const markerHash = createHash("sha256").update(marker).digest();
  image.data[0] = markerHash[0];
  image.data[1] = markerHash[1];
  image.data[2] = markerHash[2];
  image.data[3] = 255;
  return PNG.sync.write(image);
}

function motionPng(width, height, state) {
  const image = new PNG({ width, height });
  image.data.fill(245);
  const positions = { initial: 0.08, active: 0.42, resting: 0.76 };
  const startX = Math.floor(width * positions[state]);
  const startY = Math.floor(height * 0.38);
  const boxWidth = Math.floor(width * 0.12);
  const boxHeight = Math.floor(height * 0.18);
  for (let y = startY; y < Math.min(height, startY + boxHeight); y += 1) {
    for (let x = startX; x < Math.min(width, startX + boxWidth); x += 1) {
      const offset = (y * width + x) * 4;
      image.data[offset] = 22;
      image.data[offset + 1] = 92;
      image.data[offset + 2] = 168;
      image.data[offset + 3] = 255;
    }
  }
  return PNG.sync.write(image);
}

function git(directory, args) {
  return execFileSync("git", args, { cwd: directory, encoding: "utf8" }).trim();
}

function initReleaseRepo(directory) {
  mkdirSync(join(directory, "app/proof"), { recursive: true });
  git(directory, ["init", "-q"]);
  git(directory, ["config", "user.email", "tests@frankx.ai"]);
  git(directory, ["config", "user.name", "Release Test"]);
  git(directory, ["remote", "add", "origin", "https://github.com/owner/repo.git"]);
  writeFileSync(join(directory, "app/proof/page.tsx"), "export default function Proof() { return null }\n");
  git(directory, ["add", "app/proof/page.tsx"]);
  git(directory, ["commit", "-qm", "base"]);
  const rollback = git(directory, ["rev-parse", "HEAD"]);
  writeFileSync(
    join(directory, "app/proof/page.tsx"),
    "export default function Proof() { return <main>Verified proof</main> }\n"
  );
  git(directory, ["add", "app/proof/page.tsx"]);
  git(directory, ["commit", "-qm", "release"]);
  return { production: git(directory, ["rev-parse", "HEAD"]), rollback };
}

function score(keys, value = 2) {
  return Object.fromEntries(keys.map((key) => [key, value]));
}

function buildShippedMotion(directory, testedUrl = "https://frankx.ai/proof") {
  const frame = (name, state, width, height) =>
    writeArtifact(directory, name, motionPng(width, height, state), "image/png", {
      width,
      height
    });
  const runtimeFrames = ["initial", "active", "resting"].map((state, index) => ({
    at_ms: index * 400,
    state,
    artifact: frame(`motion-desktop-${state}.png`, state, 1440, 900)
  }));
  const mobileFrames = ["initial", "active", "resting"].map((state, index) => ({
    at_ms: index * 400,
    state,
    artifact: frame(`motion-mobile-${state}.png`, state, 390, 844)
  }));
  const reducedArtifact = frame("motion-reduced-static.png", "resting", 1440, 900);
  return {
    decision: "ship",
    item_scores: score([
      "job",
      "static_foundation",
      "choreography",
      "control",
      "restraint",
      "mobile",
      "reduced_motion",
      "performance",
      "brand_memory"
    ]),
    score: 18,
    job: "Reveal how the source artifacts resolve into one usable brief.",
    reduced_motion: true,
    runtime_evidence: {
      kind: "frame-sequence",
      tested_url: testedUrl,
      viewport: { css_width: 1440, css_height: 900, device_pixel_ratio: 1 },
      frames: runtimeFrames
    },
    mobile_evidence: {
      kind: "frame-sequence",
      tested_url: testedUrl,
      viewport: { css_width: 390, css_height: 844, device_pixel_ratio: 1 },
      frames: mobileFrames
    },
    reduced_motion_evidence: {
      kind: "reduced-motion-stability",
      tested_url: testedUrl,
      preference: "reduce",
      viewport: { css_width: 1440, css_height: 900, device_pixel_ratio: 1 },
      frames: [
        { at_ms: 0, artifact: reducedArtifact },
        { at_ms: 1000, artifact: reducedArtifact }
      ]
    },
    verdict: "pass",
    verifier: "verifier",
    verified_at: "2026-07-24T12:15:00Z"
  };
}

function buildValidRelease(directory, commits) {
  const image = (name, marker, width, height) =>
    writeArtifact(directory, name, png(width, height, marker), "image/png", {
      width,
      height
    });
  const text = (name, content = "Verified evidence") =>
    writeArtifact(directory, name, content, "text/markdown");
  const report = (name, summary) => ({
    ...summary,
    artifact: writeArtifact(directory, name, JSON.stringify(summary), "application/json")
  });

  const hostDesktop = image("host-desktop.png", "host-desktop", 1440, 900);
  const hostMobile = image("host-mobile.png", "host-mobile", 390, 844);
  const directionA = image("direction-a.png", "direction-a", 1200, 800);
  const directionB = image("direction-b.png", "direction-b", 1200, 800);
  const directionC = image("direction-c.png", "direction-c", 1200, 800);
  const copy = text("copy.md", "Specific reviewed production copy.");
  const testedUrl = "https://frankx.ai/proof";
  const viewports = ["desktop", "mobile"];
  const testedAt = "2026-07-24T12:20:00Z";

  return {
    schema_version: "starlight.web_release_evidence.v1",
    surface: {
      kind: "greenfield",
      name: "Flagship proof",
      brand_id: "frankx",
      repo: "owner/repo",
      route: "/proof",
      changed_paths: ["app/proof/page.tsx"],
      production_url: "https://frankx.ai/proof",
      recipient: "named decision-maker",
      job: "earn agreement to one bounded working trial"
    },
    owners: { maker: "maker", verifier: "verifier", approver: "Frank" },
    sources: {
      host_context: { desktop: hostDesktop, mobile: hostMobile },
      recipient_evidence: [text("recipient.md")],
      references: [text("reference.md")]
    },
    direction: {
      options: [
        {
          id: "editorial-proof",
          thesis: "A personal editorial note led by one observed truth.",
          composition: "Asymmetric letter with one proof interruption.",
          typography: "Humanist reading face with restrained display voice.",
          imagery: "Authorized documentary artifact from the actual work.",
          motion_posture: "One causal artifact sequence, otherwise still.",
          artifact: directionA
        },
        {
          id: "working-table",
          thesis: "A working table that makes the bounded experiment tangible.",
          composition: "Artifact-led split view with compact written proposition.",
          typography: "Direct grotesk with a quiet technical evidence register.",
          imagery: "Real source files and annotated working states.",
          motion_posture: "User-controlled comparison with no ambient movement.",
          artifact: directionB
        },
        {
          id: "documentary-sequence",
          thesis: "A documentary sequence built from the actual stage moment.",
          composition: "Full-bleed evidence followed by a narrow authored note.",
          typography: "Editorial serif reading voice with neutral utility labels.",
          imagery: "Licensed stage and process photography with provenance.",
          motion_posture: "A single scene transition that preserves reading stability.",
          artifact: directionC
        }
      ],
      selected: "editorial-proof",
      decision_owner: "Frank",
      selection_evidence: text("selection.md")
    },
    editorial: {
      item_scores: {
        ...score([
          "recipient_reality",
          "observed_truth",
          "proposition",
          "first_120_words",
          "sentence_craft",
          "taxonomy_restraint",
          "proof_adjacency",
          "voice",
          "deletion_discipline"
        ]),
        independent_read: 1
      },
      score: 19,
      verdict: "pass",
      read_aloud: true,
      name_swap: "pass",
      concrete_anchor: "pass",
      copy_artifact: copy,
      copy_sha256: copy.sha256,
      verifier: "verifier",
      verified_at: "2026-07-24T12:00:00Z"
    },
    typography: {
      mode: "existing_project",
      item_scores: score([
        "voice",
        "hierarchy",
        "specimens",
        "provenance",
        "loading",
        "reflow",
        "accessibility",
        "restraint"
      ]),
      score: 16,
      display: "Licensed Display",
      body: "Licensed Text",
      mono: null,
      font_files: [],
      source_and_license: text("type-license.md"),
      computed_fonts: report("computed-fonts.json", {
        kind: "computed-fonts",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        mode: "existing_project",
        display_family: "Licensed Display",
        body_family: "Licensed Text",
        weights_verified: [400, 600],
        fallback_readable: true,
        layout_shift: 0.01
      }),
      mobile_specimen: image("type-mobile.png", "type-mobile", 390, 844),
      fallback_specimen: image("type-fallback.png", "type-fallback", 1024, 600),
      verdict: "pass",
      verifier: "verifier",
      verified_at: "2026-07-24T12:05:00Z"
    },
    visual: {
      item_scores: { ...score(["recipient_fit", "composition", "typography", "evidence"], 5), responsive_craft: 4, distinctiveness: 5 },
      score: 29,
      after_desktop: image("after-desktop.png", "after-desktop", 1440, 900),
      after_mobile: image("after-mobile.png", "after-mobile", 390, 844),
      comparison: image("comparison.png", "comparison", 1600, 900),
      verdict: "pass",
      verifier: "verifier",
      verified_at: "2026-07-24T12:10:00Z"
    },
    motion: {
      decision: "cut",
      reason: "The static proof communicates the proposition more directly.",
      verifier: "verifier",
      verified_at: "2026-07-24T12:15:00Z"
    },
    engineering: {
      commit_sha: commits.production,
      checks: ["typecheck", "lint", "test", "build", "links", "claims", "accessibility", "performance", "privacy", "analytics"],
      accessibility: report("accessibility.json", {
        kind: "accessibility",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        serious_violations: 0,
        keyboard_pass: true,
        zoom_200_pass: true
      }),
      performance: report("performance.json", {
        kind: "performance",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        lcp_ms: 1800,
        cls: 0.02,
        inp_ms: 120
      }),
      links: report("links.json", {
        kind: "links",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        checked: 8,
        broken: 0
      }),
      claims: report("claims.json", {
        kind: "claims",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        checked: 3,
        unsupported: 0
      }),
      privacy: report("privacy.json", {
        kind: "privacy",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        named_entities: 1,
        consent: "verified",
        violations: 0
      }),
      analytics: report("analytics.json", {
        kind: "analytics",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        expected_events: ["proof_cta_click"],
        verified_events: ["proof_cta_click"]
      }),
      console: report("console.json", {
        kind: "console",
        status: "pass",
        tested_url: testedUrl,
        viewports,
        tested_at: testedAt,
        errors: 0
      })
    },
    release: {
      preview_url: "https://preview.frankx.ai/proof",
      production_url: "https://frankx.ai/proof",
      production_commit_sha: commits.production,
      commit_changed_paths: ["app/proof/page.tsx"],
      verified_at: "2026-07-24T12:30:00Z",
      post_deploy: report("post-deploy.json", {
        kind: "post-deploy",
        status: "pass",
        production_url: testedUrl,
        deployed_commit_sha: commits.production,
        tested_at: "2026-07-24T12:25:00Z"
      }),
      rollback: report("rollback.json", {
        kind: "rollback",
        target_commit_sha: commits.rollback,
        procedure: "Promote the named previous production deployment.",
        verified: true,
        tested_at: "2026-07-24T12:25:00Z"
      })
    }
  };
}

function runManifest(path, repoRoot) {
  return spawnSync(process.execPath, [
    "scripts/validate-release-evidence.mjs",
    path,
    "--repo-root",
    repoRoot
  ], {
    encoding: "utf8"
  });
}

test("canonical kernel validates all skills, brand packs, workflows, and schemas", () => {
  const output = execFileSync(process.execPath, ["scripts/validate-kernel.mjs"], {
    encoding: "utf8"
  });
  assert.match(output, /7 brand packs, 4 workflows/);
});

test("skills gate validates portable frontmatter and content hygiene", () => {
  const output = execFileSync(process.execPath, ["scripts/validate-skills.mjs"], {
    encoding: "utf8"
  });
  assert.match(output, /Skills valid: portable frontmatter and content hygiene passed/);
});

function approvedMediaJob(assetRoot, score = 28) {
  const jobRoot = join(assetRoot, "jobs/approved");
  mkdirSync(jobRoot, { recursive: true });
  writeFileSync(join(jobRoot, "social.png"), "inspected visual export");
  writeFileSync(join(jobRoot, "evidence.json"), JSON.stringify({ score30: score }));
  return {
    jobId: "2026-07-24-frankx-social-static",
    brandId: "frankx",
    workflowId: "social-static",
    surface: "founder proof card",
    audience: "founders",
    brief: "Show one exact, sourced founder result.",
    assetTier: "A",
    sourceMethod: "deterministic renderer",
    paths: {
      jobRoot,
      outputs: ["social.png"],
      evidence: "evidence.json"
    },
    qa: {
      inspected: true,
      score30: score,
      notes: "Inspected at full size and contact-sheet scale."
    },
    review: {
      maker: "Design maker",
      verifier: "Independent verifier",
      reviewedAt: "2026-07-24T11:45:00Z",
      iteration: 2,
      verdict: "pass",
      notes: "Independent check passed at full size and contact-sheet scale."
    },
    approval: {
      approver: "Frank",
      reviewedAt: "2026-07-24T12:00:00Z",
      notes: "Approved for the named surface."
    },
    decision: "approved",
    updatedAt: "2026-07-24"
  };
}

test("media-job validator accepts inspected output at the workflow ship bar", () => {
  const assetRoot = mkdtempSync(join(tmpdir(), "starlight-media-"));
  const failures = validateMediaJob(approvedMediaJob(assetRoot), { assetRoot });
  assert.deepEqual(failures, []);
});

test("media-job validator rejects uninspected zero-score Tier D approval", () => {
  const assetRoot = mkdtempSync(join(tmpdir(), "starlight-media-"));
  const job = approvedMediaJob(assetRoot);
  job.assetTier = "D";
  job.qa.inspected = false;
  job.qa.score30 = 0;
  delete job.approval;
  const failures = validateMediaJob(job, { assetRoot });
  assert.match(failures.join("\n"), /must be equal to one of the allowed values/);
  assert.match(failures.join("\n"), /must be equal to constant/);
  assert.match(failures.join("\n"), /must be >= 26/);
  assert.match(failures.join("\n"), /must have required property 'approval'/);
});

test("media-job validator enforces the selected workflow threshold", () => {
  const assetRoot = mkdtempSync(join(tmpdir(), "starlight-media-"));
  const failures = validateMediaJob(approvedMediaJob(assetRoot, 27), { assetRoot });
  assert.match(failures.join("\n"), /must be at least 28 for social-static/);
});

test("media-job validator separates maker, verifier, and approver", () => {
  const assetRoot = mkdtempSync(join(tmpdir(), "starlight-media-"));
  const job = approvedMediaJob(assetRoot);
  job.review.verifier = job.review.maker;
  const failures = validateMediaJob(job, { assetRoot });
  assert.match(failures.join("\n"), /maker, verifier, and approval approver must be distinct/);
});

test("media-job validator requires a structured reflection record for iteration", () => {
  const job = {
    jobId: "2026-07-24-frankx-social-static-iterate",
    brandId: "frankx",
    workflowId: "social-static",
    surface: "social proof card",
    audience: "founders",
    brief: "Retry the evidence hierarchy with a clearer claim.",
    assetTier: "A",
    sourceMethod: "deterministic renderer",
    paths: { jobRoot: "/tmp/starlight-media/iterate" },
    qa: { inspected: true, score30: 24, notes: "Readable but not at the workflow ship bar." },
    decision: "iterate",
    updatedAt: "2026-07-24"
  };
  const failures = validateMediaJob(job);
  assert.match(failures.join("\n"), /must have required property 'review'/);
  job.review = {
    maker: "Design maker",
    verifier: "Independent verifier",
    reviewedAt: "2026-07-24T12:00:00Z",
    iteration: 1,
    verdict: "iterate",
    notes: "Clarify proof hierarchy and re-render the social card."
  };
  assert.deepEqual(validateMediaJob(job), []);
});

test("release validator accepts content-addressed greenfield production evidence", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(buildValidRelease(directory, commits)));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release evidence valid/);
});

test("release validator accepts decoded ordered shipped-motion evidence", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.motion = buildShippedMotion(directory);
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release evidence valid/);
});

test("release validator rejects a static desktop screenshot reused as motion proof", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.motion = buildShippedMotion(directory);
  for (const sequence of [manifest.motion.runtime_evidence, manifest.motion.mobile_evidence]) {
    for (const frame of sequence.frames) frame.artifact = manifest.visual.after_desktop;
  }
  for (const frame of manifest.motion.reduced_motion_evidence.frames) {
    frame.artifact = manifest.visual.after_desktop;
  }
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain distinct decoded frames/);
  assert.match(result.stderr, /dimensions must equal CSS viewport × device pixel ratio/);
});

test("release validator rejects nominally distinct motion frames with no visible change", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.motion = buildShippedMotion(directory);
  for (const [sequenceName, sequence] of [
    ["desktop", manifest.motion.runtime_evidence],
    ["mobile", manifest.motion.mobile_evidence]
  ]) {
    for (const [index, frame] of sequence.frames.entries()) {
      frame.artifact = writeArtifact(
        directory,
        `motion-${sequenceName}-nominal-${index}.png`,
        png(
          sequence.viewport.css_width,
          sequence.viewport.css_height,
          `${sequenceName}-${index}`
        ),
        "image/png",
        {
          width: sequence.viewport.css_width,
          height: sequence.viewport.css_height
        }
      );
    }
  }
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /adjacent frames must change at least 0.1% of pixels/);
});

test("release validator rejects the prior fabricated-evidence bypass", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const path = join(directory, "broken.json");
  writeFileSync(path, JSON.stringify({
    surface: {
      kind: "redesign",
      name: "x",
      brand_id: "missing",
      repo: "not-a-repo",
      route: "not-a-route",
      changed_paths: ["/outside"],
      production_url: "not-a-url",
      recipient: "x",
      job: "x"
    },
    owners: { maker: "same", verifier: "same", approver: "same" },
    sources: { recipient_evidence: [], references: [] },
    direction: { options: [], selected: "fake", decision_owner: "same" },
    editorial: { score: 999, verdict: "pass" },
    typography: { score: 999 },
    visual: { score: 999 },
    motion: { decision: "ship", score: 999 },
    engineering: { commit_sha: "bad", checks: [] },
    release: {
      preview_url: "bad",
      production_url: "bad",
      production_commit_sha: "bad",
      verified_at: "not-a-date",
      post_deploy: "pass",
      rollback: "claim"
    }
  }));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must match pattern|must NOT have fewer than 3 items/);
  assert.match(result.stderr, /must be <= 20|must be <= 16|must be <= 30/);
  assert.match(result.stderr, /maker, verifier, and approver must be distinct/);
});

test("release validator rejects empty or mislabeled visual evidence", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  writeFileSync(join(directory, "empty.png"), Buffer.alloc(0));
  manifest.visual.after_desktop = {
    path: "empty.png",
    sha256: digest(Buffer.alloc(0)),
    bytes: 1,
    mime: "image/png",
    width: 1440,
    height: 900
  };
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /evidence file is empty/);
  assert.match(result.stderr, /bytes mismatch/);
  assert.match(result.stderr, /does not match declared MIME/);
});

test("release validator decodes PNG evidence and rejects a rehashed corrupt file", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  const artifact = manifest.visual.after_desktop;
  const corrupt = readFileSync(join(directory, artifact.path));
  corrupt[corrupt.length - 13] ^= 0xff;
  writeFileSync(join(directory, artifact.path), corrupt);
  artifact.sha256 = digest(corrupt);
  artifact.bytes = corrupt.length;
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /content does not match declared MIME image\/png/);
});

test("release validator ties scores, selection, copy, and production to reviewed evidence", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.editorial.score = 20;
  manifest.direction.selected = "invented";
  manifest.direction.options[2].artifact = manifest.direction.options[1].artifact;
  manifest.editorial.copy_sha256 = "f".repeat(64);
  manifest.release.production_commit_sha = commits.rollback;
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /score must equal item_scores total/);
  assert.match(result.stderr, /selected must match/);
  assert.match(result.stderr, /three distinct visual artifacts/);
  assert.match(result.stderr, /copy_sha256 must equal/);
  assert.match(result.stderr, /production_commit_sha must equal/);
});

test("release validator rejects generic AI slang in reviewed public copy", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  const copy = writeArtifact(
    directory,
    "copy.md",
    "An AI-powered, next-gen, revolutionary system for your workflow.",
    "text/markdown"
  );
  manifest.editorial.copy_artifact = copy;
  manifest.editorial.copy_sha256 = copy.sha256;
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /contains prohibited generic AI slang: AI-powered, next-gen, revolutionary/);
});

test("release validator rejects remote or non-visual screenshot evidence", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.sources.host_context.desktop = {
    url: "https://evidence.invalid/fabricated.png",
    sha256: "a".repeat(64),
    bytes: 9000,
    mime: "image/png",
    width: 1440,
    height: 900
  };
  manifest.visual.after_desktop = manifest.editorial.copy_artifact;
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must have required property 'path'|must NOT have additional properties/);
  assert.match(result.stderr, /must be equal to one of the allowed values|must have required property 'width'/);
});

test("release validator rejects empty category reports even when rehashed", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.engineering.performance.artifact = writeArtifact(
    directory,
    "performance-empty.json",
    "{}",
    "application/json"
  );
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /JSON report content must exactly match/);
});

test("release validator rejects a rehashed report for an unrelated URL", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.engineering.performance = rewriteReport(
    directory,
    "performance-unrelated.json",
    manifest.engineering.performance,
    { tested_url: "https://unrelated.example/proof" }
  );
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tested_url must equal preview_url or production_url/);
});

test("release validator rejects computed font claims that contradict the selected type", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.typography.computed_fonts = rewriteReport(
    directory,
    "computed-fonts-contradiction.json",
    manifest.typography.computed_fonts,
    {
      mode: "system",
      display_family: "Arial",
      body_family: "Arial"
    }
  );
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /typography\/mode must equal computed_fonts.mode/);
  assert.match(result.stderr, /typography\/display must equal computed_fonts.display_family/);
  assert.match(result.stderr, /typography\/body must equal computed_fonts.body_family/);
});

test("release validator rejects analytics reports with missing expected events", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  manifest.engineering.analytics = rewriteReport(
    directory,
    "analytics-mismatch.json",
    manifest.engineering.analytics,
    {
      expected_events: ["proof_cta_click", "proof_reply_click"],
      verified_events: ["proof_cta_click"]
    }
  );
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /verified_events must equal expected_events/);
});

test("release validator rejects rollback to the deployed commit", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "docs/release-evidence/proof");
  mkdirSync(directory, { recursive: true });
  const manifest = buildValidRelease(directory, commits);
  const rollbackSummary = {
    kind: "rollback",
    target_commit_sha: commits.production,
    procedure: "Promote the named previous production deployment.",
    verified: true,
    tested_at: "2026-07-24T12:25:00Z"
  };
  manifest.release.rollback = {
    ...rollbackSummary,
    artifact: writeArtifact(
      directory,
      "rollback-current.json",
      JSON.stringify(rollbackSummary),
      "application/json"
    )
  };
  const path = join(directory, "release.json");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /rollback target must differ from production commit/);
});

test("release validator accepts a later receipt at a path touched by production", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "starlight-release-"));
  const commits = initReleaseRepo(repoRoot);
  const directory = join(repoRoot, "app/proof");
  const manifest = buildValidRelease(directory, commits);
  const path = join(directory, "page.tsx");
  writeFileSync(path, JSON.stringify(manifest));
  const result = runManifest(path, repoRoot);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release evidence valid/);
});
