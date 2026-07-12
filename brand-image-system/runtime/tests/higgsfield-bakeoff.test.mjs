import assert from "node:assert/strict";
import test from "node:test";

import {
  buildParamArgs,
  collectResultUrls,
  findNumber,
  parseArgs,
  parseJsonOutput,
  validateJob,
} from "../tools/higgsfield-bakeoff.mjs";

function validJob() {
  return {
    schemaVersion: "1.0.0",
    jobId: "2026-07-12-test-bakeoff",
    repo: "example-repo",
    brandId: "frankx-demand",
    workflowId: "higgsfield-model-bakeoff",
    surface: "social source frame",
    audience: "operators",
    visualRole: "editorial source frame",
    brief: "Compare model behavior under one controlled visual outcome.",
    provider: "higgsfield",
    outputRoot: "C:/tmp/higgsfield-test",
    ledgerPath: "C:/tmp/higgsfield-ledger.jsonl",
    budget: { maxCredits: 5, minimumBalanceAfter: 100, livePreflightRequired: true, recentSpendLookbackMinutes: 20 },
    prompt: {
      text: "A detailed controlled editorial scene with clear material hierarchy.",
      negative: "No text or fake UI.",
      sourcePath: "C:/tmp/brief.md",
    },
    candidates: [
      { candidateId: "one", jobType: "flux_2", displayName: "One", role: "craft", costHintCredits: 1, params: { aspect_ratio: "1:1" } },
      { candidateId: "two", jobType: "seedream_v5_lite", displayName: "Two", role: "composition", costHintCredits: 1, params: { quality: "basic" } },
    ],
    execution: { waitTimeout: "20m", waitInterval: "5s", sequential: true, stopOnFailure: true },
    qa: { minimumScore30: 26, flagshipScore30: 28, actualExportInspection: true, independentVerifier: true, rightsReview: true },
    downstream: { system: "multi-brand-social-os", maximumState: "approval_pending", publishingAllowed: false },
    updatedAt: "2026-07-12",
  };
}

test("argument parsing defaults to live dry-run", () => {
  assert.deepEqual(parseArgs(["--job", "job.json"]), {
    execute: false,
    offline: false,
    help: false,
    jobPath: "job.json",
  });
});

test("job validation accepts the bounded contract", () => {
  assert.equal(validateJob(validJob()).jobId, "2026-07-12-test-bakeoff");
});

test("job validation rejects publishing", () => {
  const job = validJob();
  job.downstream.publishingAllowed = true;
  assert.throws(() => validateJob(job), /disallow publishing/);
});

test("job validation rejects duplicate candidates", () => {
  const job = validJob();
  job.candidates[1].candidateId = "one";
  assert.throws(() => validateJob(job), /Duplicate candidateId/);
});

test("CLI params translate snake case to safe flags", () => {
  assert.deepEqual(buildParamArgs({ aspect_ratio: "1:1", resolution: "1k" }, "Prompt"), [
    "--prompt",
    "Prompt",
    "--aspect-ratio",
    "1:1",
    "--resolution",
    "1k",
  ]);
});

test("CLI JSON framing and recursive cost extraction are robust", () => {
  const parsed = parseJsonOutput('notice\n{"data":{"cost_credits":1.5}}');
  assert.equal(findNumber(parsed, ["cost_credits"]), 1.5);
});

test("result URL collection ignores unrelated strings", () => {
  assert.deepEqual(
    collectResultUrls({ prompt: "https://example.test/reference", outputs: [{ result_url: "https://cdn.test/result.png" }] }),
    ["https://cdn.test/result.png"],
  );
});

test("result URL collection accepts a bare CLI URL array", () => {
  assert.deepEqual(collectResultUrls(["https://cdn.test/one.png", "https://cdn.test/two.png"]), [
    "https://cdn.test/one.png",
    "https://cdn.test/two.png",
  ]);
});

test("result URL collection accepts URL arrays nested under outputs", () => {
  assert.deepEqual(collectResultUrls({ outputs: ["https://cdn.test/one.png"] }), ["https://cdn.test/one.png"]);
});
