#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_RUNNER_CEILING = 5;
const ANSI = /\u001b\[[0-9;]*m/g;

function usage() {
  return `Usage:
  node runtime/tools/higgsfield-bakeoff.mjs --job <model-bakeoff.json>
  node runtime/tools/higgsfield-bakeoff.mjs --job <model-bakeoff.json> --execute
  node runtime/tools/higgsfield-bakeoff.mjs --job <model-bakeoff.json> --offline

Modes:
  default     Validate, query live account status and model costs, and write preflight.json.
  --execute   Re-run live preflight, append a preflight ledger row, then generate sequentially.
  --offline   Validate and write a non-authoritative estimate from cost hints; cannot execute.

Safety:
  HIGGSFIELD_MAX_JOB_CREDITS defaults to 5. Raising it is an explicit operator action.
  HIGGSFIELD_CLI may point to a specific Higgsfield executable.`;
}

export function parseArgs(argv) {
  const parsed = { execute: false, offline: false, help: false, jobPath: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--execute") parsed.execute = true;
    else if (value === "--offline") parsed.offline = true;
    else if (value === "--help" || value === "-h") parsed.help = true;
    else if (value === "--job") parsed.jobPath = argv[++index] ?? null;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (parsed.execute && parsed.offline) {
    throw new Error("--execute and --offline cannot be combined");
  }
  return parsed;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, label, minimum = 1) {
  if (typeof value !== "string" || value.trim().length < minimum) {
    throw new Error(`${label} must be a string with at least ${minimum} characters`);
  }
}

function requireNumber(value, label, minimum = 0, exclusive = false) {
  if (!Number.isFinite(value) || (exclusive ? value <= minimum : value < minimum)) {
    const comparison = exclusive ? ">" : ">=";
    throw new Error(`${label} must be a finite number ${comparison} ${minimum}`);
  }
}

function rejectUnknownKeys(object, allowed, label) {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) throw new Error(`${label} contains unknown property: ${key}`);
  }
}

export function validateJob(job) {
  if (!isPlainObject(job)) throw new Error("Job must be a JSON object");
  rejectUnknownKeys(
    job,
    new Set([
      "$schema",
      "schemaVersion",
      "jobId",
      "repo",
      "brandId",
      "workflowId",
      "surface",
      "audience",
      "visualRole",
      "brief",
      "provider",
      "outputRoot",
      "ledgerPath",
      "budget",
      "prompt",
      "candidates",
      "execution",
      "qa",
      "downstream",
      "updatedAt",
    ]),
    "job",
  );

  if (job.schemaVersion !== "1.0.0") throw new Error("schemaVersion must be 1.0.0");
  requireString(job.jobId, "jobId");
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(job.jobId)) {
    throw new Error("jobId must begin with YYYY-MM-DD and contain lowercase letters, numbers, or hyphens");
  }
  for (const key of ["repo", "brandId", "surface", "audience", "visualRole", "brief", "outputRoot", "ledgerPath"]) {
    requireString(job[key], key);
  }
  if (job.workflowId !== "higgsfield-model-bakeoff") {
    throw new Error("workflowId must be higgsfield-model-bakeoff");
  }
  if (job.provider !== "higgsfield") throw new Error("provider must be higgsfield");

  if (!isPlainObject(job.budget)) throw new Error("budget must be an object");
  rejectUnknownKeys(
    job.budget,
    new Set(["maxCredits", "minimumBalanceAfter", "livePreflightRequired", "recentSpendLookbackMinutes"]),
    "budget",
  );
  requireNumber(job.budget.maxCredits, "budget.maxCredits", 0, true);
  requireNumber(job.budget.minimumBalanceAfter, "budget.minimumBalanceAfter", 0);
  if (job.budget.livePreflightRequired !== true) {
    throw new Error("budget.livePreflightRequired must be true");
  }
  requireNumber(job.budget.recentSpendLookbackMinutes, "budget.recentSpendLookbackMinutes", 0);
  if (!Number.isInteger(job.budget.recentSpendLookbackMinutes) || job.budget.recentSpendLookbackMinutes > 120) {
    throw new Error("budget.recentSpendLookbackMinutes must be an integer between 0 and 120");
  }

  if (!isPlainObject(job.prompt)) throw new Error("prompt must be an object");
  rejectUnknownKeys(job.prompt, new Set(["text", "negative", "sourcePath"]), "prompt");
  requireString(job.prompt.text, "prompt.text", 20);
  requireString(job.prompt.negative, "prompt.negative", 0);
  requireString(job.prompt.sourcePath, "prompt.sourcePath");

  if (!Array.isArray(job.candidates) || job.candidates.length < 2 || job.candidates.length > 6) {
    throw new Error("candidates must contain between 2 and 6 entries");
  }
  const candidateIds = new Set();
  for (const [index, candidate] of job.candidates.entries()) {
    if (!isPlainObject(candidate)) throw new Error(`candidates[${index}] must be an object`);
    rejectUnknownKeys(
      candidate,
      new Set(["candidateId", "jobType", "displayName", "role", "costHintCredits", "params"]),
      `candidates[${index}]`,
    );
    for (const key of ["candidateId", "jobType", "displayName", "role"]) {
      requireString(candidate[key], `candidates[${index}].${key}`);
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(candidate.candidateId)) {
      throw new Error(`candidates[${index}].candidateId is not filesystem safe`);
    }
    if (!/^[a-z0-9][a-z0-9_]*$/.test(candidate.jobType)) {
      throw new Error(`candidates[${index}].jobType is invalid`);
    }
    if (candidateIds.has(candidate.candidateId)) throw new Error(`Duplicate candidateId: ${candidate.candidateId}`);
    candidateIds.add(candidate.candidateId);
    if (candidate.costHintCredits !== undefined) {
      requireNumber(candidate.costHintCredits, `candidates[${index}].costHintCredits`, 0);
    }
    if (!isPlainObject(candidate.params)) throw new Error(`candidates[${index}].params must be an object`);
  }

  if (!isPlainObject(job.execution)) throw new Error("execution must be an object");
  if (job.execution.sequential !== true || job.execution.stopOnFailure !== true) {
    throw new Error("execution must be sequential and stopOnFailure must be true");
  }
  requireString(job.execution.waitTimeout, "execution.waitTimeout");
  requireString(job.execution.waitInterval, "execution.waitInterval");

  if (!isPlainObject(job.qa)) throw new Error("qa must be an object");
  requireNumber(job.qa.minimumScore30, "qa.minimumScore30", 0);
  requireNumber(job.qa.flagshipScore30, "qa.flagshipScore30", 0);
  if (job.qa.minimumScore30 > 30 || job.qa.flagshipScore30 > 30) {
    throw new Error("QA scores cannot exceed 30");
  }
  for (const key of ["actualExportInspection", "independentVerifier", "rightsReview"]) {
    if (job.qa[key] !== true) throw new Error(`qa.${key} must be true`);
  }

  if (!isPlainObject(job.downstream)) throw new Error("downstream must be an object");
  if (
    job.downstream.system !== "multi-brand-social-os" ||
    job.downstream.maximumState !== "approval_pending" ||
    job.downstream.publishingAllowed !== false
  ) {
    throw new Error("downstream must target multi-brand-social-os, stop at approval_pending, and disallow publishing");
  }
  return job;
}

export function buildParamArgs(params, promptText) {
  const args = ["--prompt", promptText];
  for (const [rawName, rawValue] of Object.entries(params)) {
    const name = `--${rawName.replaceAll("_", "-")}`;
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      if (!["string", "number", "boolean"].includes(typeof value)) {
        throw new Error(`Unsupported CLI param value for ${rawName}`);
      }
      args.push(name, String(value));
    }
  }
  return args;
}

function stripAnsi(value) {
  return value.replace(ANSI, "").trim();
}

export function parseJsonOutput(raw, label = "CLI output") {
  const clean = stripAnsi(String(raw ?? ""));
  if (!clean) throw new Error(`${label} was empty`);
  for (const candidate of [clean, clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1), clean.slice(clean.indexOf("["), clean.lastIndexOf("]") + 1)]) {
    if (!candidate || candidate.length < 2) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next framing; the CLI may print a short non-JSON prefix.
    }
  }
  throw new Error(`${label} was not valid JSON`);
}

function walk(value, visit) {
  if (Array.isArray(value)) {
    value.forEach((entry) => walk(entry, visit));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    visit(key, entry);
    walk(entry, visit);
  }
}

export function findNumber(value, preferredKeys) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = new Set(preferredKeys.map((key) => key.toLowerCase().replaceAll("_", "")));
  let found = null;
  walk(value, (key, entry) => {
    const comparable = key.toLowerCase().replaceAll("_", "");
    const numeric = typeof entry === "number" ? entry : typeof entry === "string" ? Number(entry) : Number.NaN;
    if (found === null && normalized.has(comparable) && Number.isFinite(numeric)) found = numeric;
  });
  return found;
}

function findString(value, preferredKeys) {
  const normalized = new Set(preferredKeys.map((key) => key.toLowerCase().replaceAll("_", "")));
  let found = null;
  walk(value, (key, entry) => {
    const comparable = key.toLowerCase().replaceAll("_", "");
    if (found === null && normalized.has(comparable) && typeof entry === "string" && entry.trim()) found = entry;
  });
  return found;
}

export function collectResultUrls(value) {
  const urls = new Set();
  const visit = (entry, parentKey = "") => {
    if (typeof entry === "string") {
      if (/^https?:\/\//i.test(entry) && (!parentKey || /(url|result|output|download|asset)/i.test(parentKey))) {
        urls.add(entry);
      }
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach((item) => visit(item, parentKey));
      return;
    }
    if (isPlainObject(entry)) {
      for (const [key, item] of Object.entries(entry)) visit(item, key);
    }
  };
  visit(value);
  return [...urls];
}

function resolveCli() {
  if (process.env.HIGGSFIELD_CLI) return path.resolve(process.env.HIGGSFIELD_CLI);
  if (process.platform === "win32" && process.env.APPDATA) {
    const vendor = path.join(process.env.APPDATA, "npm", "node_modules", "@higgsfield", "cli", "vendor", "hf.exe");
    if (existsSync(vendor)) return vendor;
  }
  return "higgsfield";
}

function runCli(cli, args, label) {
  const result = spawnSync(cli, args, {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw new Error(`${label} failed to start: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = stripAnsi(result.stderr || result.stdout || "unknown CLI error");
    throw new Error(`${label} failed with exit ${result.status}: ${detail}`);
  }
  return parseJsonOutput(result.stdout, label);
}

function fullPrompt(prompt) {
  return prompt.negative.trim() ? `${prompt.text.trim()}\n\nAvoid: ${prompt.negative.trim()}` : prompt.text.trim();
}

function getAccountSnapshot(cli) {
  const raw = runCli(cli, ["account", "status", "--json", "--no-color"], "Higgsfield account status");
  const balance = findNumber(raw, ["credits", "available_credits", "credit_balance", "balance"]);
  if (!Number.isFinite(balance)) throw new Error("Higgsfield account status did not contain a numeric credit balance");
  return {
    plan:
      findString(raw, ["plan", "plan_name", "subscription", "subscription_plan", "subscription_plan_type"]) ??
      "unknown",
    balance,
  };
}

function getRecentSpendSnapshot(cli, lookbackMinutes) {
  const raw = runCli(
    cli,
    ["account", "transactions", "--size", "20", "--json", "--no-color"],
    "Higgsfield recent transactions",
  );
  const items = Array.isArray(raw) ? raw : Array.isArray(raw.items) ? raw.items : [];
  const cutoff = Date.now() - lookbackMinutes * 60 * 1000;
  const recent = items
    .filter(
      (item) =>
        item?.action === "spend" &&
        Number.isFinite(Date.parse(item.created_at)) &&
        Date.parse(item.created_at) >= cutoff,
    )
    .map((item) => ({
      createdAt: item.created_at,
      credits: Number(item.credits),
      displayName: typeof item.display_name === "string" ? item.display_name : "unknown",
    }));
  return {
    lookbackMinutes,
    recentSpendCount: recent.length,
    recentSpendCredits: recent.reduce(
      (sum, item) => sum + Math.abs(Number.isFinite(item.credits) ? item.credits : 0),
      0,
    ),
    latestSpendAt: recent[0]?.createdAt ?? null,
    recentModels: [...new Set(recent.map((item) => item.displayName))],
    decision: recent.length ? "blocked_concurrent_spend" : "quiet",
  };
}

function getCandidateCost(cli, job, candidate) {
  const params = buildParamArgs(candidate.params, fullPrompt(job.prompt));
  const raw = runCli(
    cli,
    ["generate", "cost", candidate.jobType, ...params, "--json", "--no-color"],
    `Cost preflight for ${candidate.candidateId}`,
  );
  const cost = findNumber(raw, ["cost", "credits", "credit_cost", "cost_credits", "total_cost", "total_credits"]);
  if (!Number.isFinite(cost)) throw new Error(`Cost preflight for ${candidate.candidateId} did not return a numeric cost`);
  return cost;
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function appendLedger(filePath, row) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  appendFileSync(filePath, `${JSON.stringify(row)}\n`, "utf8");
}

function acquireExecutionLock(job) {
  const lockPath = path.join(path.dirname(job.ledgerPath), ".higgsfield-cli-generation.lock.json");
  let descriptor;
  try {
    descriptor = openSync(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(
        `Shared Higgsfield execution lock exists: ${lockPath}. Verify the owning run before removing a stale lock.`,
      );
    }
    throw error;
  }
  const lock = {
    schemaVersion: "1.0.0",
    jobId: job.jobId,
    pid: process.pid,
    createdAt: new Date().toISOString(),
  };
  writeFileSync(descriptor, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  closeSync(descriptor);
  return { lockPath, lock };
}

function releaseExecutionLock(handle) {
  if (!handle || !existsSync(handle.lockPath)) return;
  const current = JSON.parse(readFileSync(handle.lockPath, "utf8"));
  if (current.jobId !== handle.lock.jobId || current.pid !== handle.lock.pid) {
    throw new Error(`Execution lock ownership changed; refusing to remove ${handle.lockPath}`);
  }
  unlinkSync(handle.lockPath);
}

function ledgerRow(job, overrides) {
  return {
    timestamp: new Date().toISOString(),
    event_type: overrides.event_type,
    repo: job.repo,
    brand: job.brandId,
    purpose: job.brief,
    model: overrides.model,
    prompt_path: job.prompt.sourcePath,
    cost: overrides.cost ?? 0,
    job_id: overrides.job_id ?? "none",
    result_url: overrides.result_url ?? "none",
    status: overrides.status,
    next_action: overrides.next_action,
    notes: overrides.notes ?? `Brand Image System job ${job.jobId}`,
  };
}

function extensionFrom(url, contentType) {
  const fromType = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  }[contentType?.split(";")[0]?.trim()?.toLowerCase()];
  if (fromType) return fromType;
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext === ".jpeg" ? ".jpg" : ext;
  } catch {
    // The fetch step will report an invalid URL.
  }
  return ".bin";
}

async function downloadResult(url, destinationBase) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const extension = extensionFrom(url, response.headers.get("content-type"));
  const outputPath = `${destinationBase}${extension}`;
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, bytes);
  return {
    outputPath,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.length,
  };
}

function writeProvenance(job, candidate, downloaded, jobId, promptText) {
  const sidecarPath = `${downloaded.outputPath}.vis.provenance.json`;
  writeJson(sidecarPath, {
    "$schema": "https://frankx.ai/schemas/vis-provenance-sidecar.schema.json",
    schema_version: "1.0.0",
    asset: {
      asset_id: null,
      version_id: null,
      media_type: "image",
      sha256: downloaded.sha256,
      local_path: downloaded.outputPath.replaceAll("\\", "/"),
      relative_path: path.relative(job.outputRoot, downloaded.outputPath).replaceAll("\\", "/"),
    },
    generation: {
      provider: "higgsfield",
      model: candidate.jobType,
      prompt: promptText,
      negative_prompt: job.prompt.negative,
      seed: null,
      settings: {
        ...candidate.params,
        higgsfield_job_id: jobId,
        brand_image_job_id: job.jobId,
        candidate_id: candidate.candidateId,
      },
      output_paths: [downloaded.outputPath.replaceAll("\\", "/")],
      created_at: new Date().toISOString(),
    },
    agent: {
      coding_agent: "codex",
      repo: "starlight-design-intelligence",
      thread_ref: null,
      session_ref: null,
      summary: `Higgsfield model bake-off candidate for ${job.brandId}`,
      metadata: { workflow: job.workflowId, surface: job.surface },
    },
    skill: {
      name: "higgsfield-generate",
      metadata: { orchestration: "brand-image-system" },
    },
    evaluation: {
      status: "pending_actual_export_inspection",
      minimum_score_30: job.qa.minimumScore30,
      independent_verifier_required: true,
    },
    rights: {
      status: "needs-review",
      basis: "Generated through the operator's Higgsfield workspace; verify provider terms and source inputs before public use.",
      approval_status: "not-approved",
    },
  });
  return sidecarPath;
}

function preflight(job, { cli, offline, runnerCeiling }) {
  if (job.budget.maxCredits > runnerCeiling) {
    throw new Error(
      `Job cap ${job.budget.maxCredits} exceeds runner ceiling ${runnerCeiling}. Do not raise HIGGSFIELD_MAX_JOB_CREDITS without the required approval.`,
    );
  }

  const candidates = job.candidates.map((candidate) => {
    const credits = offline ? candidate.costHintCredits : getCandidateCost(cli, job, candidate);
    if (!Number.isFinite(credits)) {
      throw new Error(`Candidate ${candidate.candidateId} has no cost hint; offline preflight is not possible`);
    }
    return {
      candidateId: candidate.candidateId,
      jobType: candidate.jobType,
      displayName: candidate.displayName,
      credits,
      costSource: offline ? "recorded-hint-non-authoritative" : "live-higgsfield-cli",
    };
  });
  const account = offline ? { plan: "not-queried", balance: null } : getAccountSnapshot(cli);
  const recentSpend = offline
    ? {
        lookbackMinutes: job.budget.recentSpendLookbackMinutes,
        recentSpendCount: null,
        recentSpendCredits: null,
        latestSpendAt: null,
        recentModels: [],
        decision: "not-queried",
      }
    : getRecentSpendSnapshot(cli, job.budget.recentSpendLookbackMinutes);
  const predictedCredits = candidates.reduce((sum, candidate) => sum + candidate.credits, 0);
  const reasons = [];
  if (predictedCredits > job.budget.maxCredits) {
    reasons.push(`Predicted cost ${predictedCredits} exceeds job cap ${job.budget.maxCredits}`);
  }
  if (!offline && account.balance - predictedCredits < job.budget.minimumBalanceAfter) {
    reasons.push(
      `Predicted post-run balance ${account.balance - predictedCredits} is below guardrail ${job.budget.minimumBalanceAfter}`,
    );
  }
  if (!offline && recentSpend.recentSpendCount > 0) {
    reasons.push(
      `Detected ${recentSpend.recentSpendCount} other spend event(s) totaling ${recentSpend.recentSpendCredits.toFixed(2)} credits within the ${recentSpend.lookbackMinutes}-minute quiet window`,
    );
  }
  const decision = offline ? "offline_estimate_only" : reasons.length ? "blocked" : "allow";
  return {
    schemaVersion: "1.0.0",
    jobId: job.jobId,
    checkedAt: new Date().toISOString(),
    mode: offline ? "offline" : "live",
    cli: offline ? "not-invoked" : cli,
    account,
    recentSpend,
    candidates,
    predictedCredits,
    jobCapCredits: job.budget.maxCredits,
    runnerCeilingCredits: runnerCeiling,
    predictedBalanceAfter: offline ? null : account.balance - predictedCredits,
    minimumBalanceAfter: job.budget.minimumBalanceAfter,
    decision,
    reasons,
  };
}

async function executeJob(job, jobPath, cli, livePreflight) {
  const outputRoot = job.outputRoot;
  const receiptPath = path.join(outputRoot, "run-receipt.json");
  if (existsSync(receiptPath)) {
    const existing = JSON.parse(readFileSync(receiptPath, "utf8"));
    if (["running", "generated_unreviewed", "complete"].includes(existing.status)) {
      throw new Error(`Refusing to overwrite existing run receipt with status ${existing.status}: ${receiptPath}`);
    }
  }

  appendLedger(
    job.ledgerPath,
    ledgerRow(job, {
      event_type: "preflight",
      model: "multi-model-bakeoff",
      status: "preflighted",
      next_action: "generate sequential candidates and preserve provenance",
      notes: `Predicted ${livePreflight.predictedCredits} credits; cap ${job.budget.maxCredits}; balance ${livePreflight.account.balance}; runner job ${jobPath}`,
    }),
  );

  const receipt = {
    schemaVersion: "1.0.0",
    jobId: job.jobId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "running",
    predictedCredits: livePreflight.predictedCredits,
    candidates: [],
    accountBefore: livePreflight.account,
    accountAfter: null,
    nextAction: "independent actual-export inspection",
  };
  writeJson(receiptPath, receipt);

  const promptText = fullPrompt(job.prompt);
  for (const candidate of job.candidates) {
    const cost = livePreflight.candidates.find((entry) => entry.candidateId === candidate.candidateId)?.credits;
    try {
      const raw = runCli(
        cli,
        [
          "generate",
          "create",
          candidate.jobType,
          ...buildParamArgs(candidate.params, promptText),
          "--wait",
          "--wait-timeout",
          job.execution.waitTimeout,
          "--wait-interval",
          job.execution.waitInterval,
          "--json",
          "--no-color",
        ],
        `Generation for ${candidate.candidateId}`,
      );
      const urls = collectResultUrls(raw);
      if (!urls.length) throw new Error("Generation completed without a downloadable result URL");
      const providerJobId = findString(raw, ["job_id", "jobId", "id"]) ?? "unknown";
      const outputs = [];
      for (const [index, url] of urls.entries()) {
        const base = path.join(outputRoot, "candidates", candidate.candidateId, `result-${index + 1}`);
        const downloaded = await downloadResult(url, base);
        const sidecarPath = writeProvenance(job, candidate, downloaded, providerJobId, job.prompt.text);
        outputs.push({
          path: downloaded.outputPath.replaceAll("\\", "/"),
          sidecarPath: sidecarPath.replaceAll("\\", "/"),
          sha256: downloaded.sha256,
          bytes: downloaded.bytes,
        });
      }
      receipt.candidates.push({
        candidateId: candidate.candidateId,
        jobType: candidate.jobType,
        providerJobId,
        costCredits: cost,
        resultUrls: urls,
        outputs,
        status: "generated_unreviewed",
      });
      writeJson(receiptPath, receipt);
      appendLedger(
        job.ledgerPath,
        ledgerRow(job, {
          event_type: "generation",
          model: candidate.jobType,
          cost,
          job_id: providerJobId,
          result_url: urls[0],
          status: "complete",
          next_action: "inspect actual export and score against the 30 point gate",
          notes: `Candidate ${candidate.candidateId}; ${outputs.length} local output(s); rights and approval remain needs-review`,
        }),
      );
    } catch (error) {
      receipt.status = "blocked";
      receipt.completedAt = new Date().toISOString();
      receipt.nextAction = "verify Higgsfield transactions and resolve the failed candidate before resuming";
      receipt.failure = { candidateId: candidate.candidateId, message: error.message };
      writeJson(receiptPath, receipt);
      appendLedger(
        job.ledgerPath,
        ledgerRow(job, {
          event_type: "generation",
          model: candidate.jobType,
          cost: cost ?? 0,
          status: "blocked",
          next_action: "verify transactions and resolve generation failure; do not continue automatically",
          notes: `Candidate ${candidate.candidateId} failed: ${error.message}`,
        }),
      );
      throw error;
    }
  }

  receipt.accountAfter = getAccountSnapshot(cli);
  receipt.status = "generated_unreviewed";
  receipt.completedAt = new Date().toISOString();
  receipt.nextAction = "independent actual-export inspection, rights review, scorecard, and selection";
  writeJson(receiptPath, receipt);
  return receipt;
}

export async function runMain(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (!args.jobPath) throw new Error("--job is required\n\n" + usage());
  const jobPath = path.resolve(args.jobPath);
  if (!existsSync(jobPath)) throw new Error(`Job file does not exist: ${jobPath}`);
  const job = validateJob(JSON.parse(readFileSync(jobPath, "utf8")));
  job.outputRoot = path.resolve(path.dirname(jobPath), job.outputRoot);
  job.ledgerPath = path.resolve(path.dirname(jobPath), job.ledgerPath);
  job.prompt.sourcePath = path.resolve(path.dirname(jobPath), job.prompt.sourcePath);

  const runnerCeiling = Number(process.env.HIGGSFIELD_MAX_JOB_CREDITS ?? DEFAULT_RUNNER_CEILING);
  requireNumber(runnerCeiling, "HIGGSFIELD_MAX_JOB_CREDITS", 0, true);
  const cli = resolveCli();
  const result = preflight(job, { cli, offline: args.offline, runnerCeiling });
  const preflightPath = path.join(job.outputRoot, "preflight.json");
  writeJson(preflightPath, result);

  if (!args.execute) {
    process.stdout.write(`${JSON.stringify({ ...result, preflightPath }, null, 2)}\n`);
    return;
  }
  if (result.decision !== "allow") {
    throw new Error(`Execution blocked by preflight: ${result.reasons.join("; ") || result.decision}`);
  }
  if (!existsSync(job.prompt.sourcePath)) {
    throw new Error(`Prompt source/brief does not exist: ${job.prompt.sourcePath}`);
  }
  const lock = acquireExecutionLock(job);
  try {
    const receipt = await executeJob(job, jobPath, cli, result);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  } finally {
    releaseExecutionLock(lock);
  }
}

const invokedAsMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invokedAsMain) {
  runMain().catch((error) => {
    process.stderr.write(`higgsfield-bakeoff: ${error.message}\n`);
    process.exitCode = 1;
  });
}
