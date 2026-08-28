#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const skillRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fallbackPolicyPath = resolve(skillRoot, "references/language-policy.json");

function compilePolicy(policy) {
  const compile = (item) => ({
    ...item,
    regex: new RegExp(item.pattern, item.case_sensitive ? "gu" : "giu")
  });
  return {
    ...policy,
    hard_fail: policy.hard_fail.map(compile),
    review: policy.review.map(compile),
    excludeRegexes: policy.exclude_path_patterns.map((pattern) => new RegExp(pattern, "u")),
    extensionSet: new Set(policy.scan_extensions)
  };
}

export function loadPolicy(path = fallbackPolicyPath) {
  return compilePolicy(JSON.parse(readFileSync(path, "utf8")));
}

function stripCodeFences(text) {
  return text.replace(/```[\s\S]*?```/gu, "");
}

function lineAllowed(line, marker) {
  return line.includes(marker);
}

export function auditText(text, { file = "inline", policy = loadPolicy() } = {}) {
  const findings = [];
  const source = stripCodeFences(text);
  const lines = source.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (lineAllowed(line, policy.allow_marker)) continue;
    for (const severity of ["hard_fail", "review"]) {
      for (const rule of policy[severity]) {
        rule.regex.lastIndex = 0;
        const match = rule.regex.exec(line);
        if (!match) continue;
        findings.push({
          severity,
          rule: rule.id,
          reason: rule.reason,
          file,
          line: index + 1,
          match: match[0].slice(0, 160),
          snippet: line.trim().slice(0, 220)
        });
      }
    }
  }

  const words = source.match(/[\p{L}\p{N}'-]+/gu) ?? [];
  const emDashes = source.match(/—/gu)?.length ?? 0;
  if (words.length >= 80 && emDashes > Math.max(2, Math.floor(words.length / 180))) {
    findings.push({
      severity: "review",
      rule: "em-dash-density",
      reason: "Em dashes appear often enough to create generated rhythm",
      file,
      line: 1,
      match: `${emDashes} em dashes`,
      snippet: `${words.length} words`
    });
  }
  return findings;
}

function shouldExclude(path, policy) {
  return policy.excludeRegexes.some((regex) => regex.test(path));
}

function walk(directory, root, policy, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    const relPath = relative(root, fullPath).replaceAll("\\", "/");
    if (shouldExclude(relPath, policy)) continue;
    if (entry.isDirectory()) walk(fullPath, root, policy, files);
    if (entry.isFile() && policy.extensionSet.has(extname(entry.name))) files.push(fullPath);
  }
}

export function auditRoot(root, { policy = loadPolicy(), files: selectedFiles = [] } = {}) {
  const absoluteRoot = resolve(root);
  const files = [];
  if (selectedFiles.length) {
    for (const selected of selectedFiles) {
      const path = resolve(absoluteRoot, selected);
      const relPath = relative(absoluteRoot, path).replaceAll("\\", "/");
      if (existsSync(path) && !shouldExclude(relPath, policy)) files.push(path);
    }
  } else {
    for (const directory of policy.scan_directories) {
      const path = join(absoluteRoot, directory);
      if (existsSync(path)) walk(path, absoluteRoot, policy, files);
    }
  }
  const findings = files.flatMap((file) =>
    auditText(readFileSync(file, "utf8"), {
      file: relative(absoluteRoot, file).replaceAll("\\", "/"),
      policy
    })
  );
  return { root: absoluteRoot, filesScanned: files.length, findings };
}

function parseAddedLines(diff) {
  const output = new Map();
  let file = null;
  let newLine = 0;
  for (const line of diff.split(/\r?\n/u)) {
    if (line.startsWith("+++ b/")) {
      file = line.slice(6);
      if (!output.has(file)) output.set(file, []);
      continue;
    }
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/u);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (!file || line.startsWith("diff --git ") || line.startsWith("--- ")) continue;
    if (line.startsWith("+") && !line.startsWith("+++")) {
      output.get(file).push({ line: newLine, text: line.slice(1) });
      newLine += 1;
      continue;
    }
    if (line.startsWith("-") && !line.startsWith("---")) continue;
    if (!line.startsWith("\\ No newline")) newLine += 1;
  }
  return output;
}

export function auditChangedLines(root, baseRef, { policy = loadPolicy() } = {}) {
  const absoluteRoot = resolve(root);
  const result = spawnSync(
    "git",
    ["diff", "--unified=0", "--no-color", `${baseRef}...HEAD`, "--", ...policy.scan_directories],
    { cwd: absoluteRoot, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    throw new Error(`Unable to diff from ${baseRef}: ${(result.stderr || result.stdout).trim()}`);
  }
  const added = parseAddedLines(result.stdout);
  const findings = [];
  let filesScanned = 0;
  for (const [file, lines] of added) {
    if (shouldExclude(file, policy) || !policy.extensionSet.has(extname(file))) continue;
    filesScanned += 1;
    for (const item of lines) {
      findings.push(
        ...auditText(item.text, { file, policy }).map((finding) => ({ ...finding, line: item.line }))
      );
    }
  }
  return { root: absoluteRoot, baseRef, filesScanned, findings };
}

function parseArgs(argv) {
  const options = { root: process.cwd(), strict: false, json: false, policyPath: fallbackPolicyPath, files: [], changedFrom: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--strict") options.strict = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--root") options.root = argv[++index];
    else if (arg === "--policy") options.policyPath = argv[++index];
    else if (arg === "--file") options.files.push(argv[++index]);
    else if (arg === "--changed-from") options.changedFrom = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const policy = loadPolicy(options.policyPath);
  const result = options.changedFrom
    ? auditChangedLines(options.root, options.changedFrom, { policy })
    : auditRoot(options.root, { policy, files: options.files });
  const hardFailures = result.findings.filter((finding) => finding.severity === "hard_fail");
  if (options.json) {
    console.log(JSON.stringify({ ...result, hardFailureCount: hardFailures.length }, null, 2));
  } else if (result.findings.length === 0) {
    console.log(`Editorial audit passed: ${result.filesScanned} files scanned.`);
  } else {
    console.log(`Editorial audit found ${hardFailures.length} hard failures and ${result.findings.length - hardFailures.length} review signals.`);
    for (const finding of result.findings) {
      console.log(`${finding.severity.toUpperCase()} ${finding.file}:${finding.line} ${finding.rule} — ${finding.match}`);
    }
  }
  if (options.strict && hardFailures.length) process.exitCode = 1;
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
