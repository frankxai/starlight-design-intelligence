import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const allowedFrontmatter = new Set([
  "name",
  "description",
  "version",
  "argument-hint",
  "allowed-tools"
]);
const forbidden = [
  ["machine-specific Windows path", /[A-Z]:\\\\Users\\/i],
  ["machine-specific Unix home path", /(?:^|[^A-Za-z])\/Users\//m],
  ["home-directory shorthand", /(?:^|\s)~\//m],
  ["OpenAI-style secret", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\bgh[opsu]_[A-Za-z0-9_]{20,}\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/]
];

function parseFrontmatter(content, path, failures) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    failures.push(`${path}: missing YAML frontmatter`);
    return {};
  }
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const entry = line.match(/^([A-Za-z][A-Za-z-]*):\s*(.*)$/);
    if (!entry) {
      failures.push(`${path}: invalid frontmatter entry: ${line}`);
      continue;
    }
    const [, key, value] = entry;
    if (!allowedFrontmatter.has(key)) failures.push(`${path}: unsupported frontmatter key: ${key}`);
    if (key in fields) failures.push(`${path}: duplicate frontmatter key: ${key}`);
    fields[key] = value.replace(/^"|"$/g, "");
  }
  return fields;
}

const failures = [];
const skillsRoot = join(root, "skills");
for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const path = join("skills", entry.name, "SKILL.md");
  let content;
  try {
    content = readFileSync(join(root, path), "utf8");
  } catch {
    failures.push(`${path}: missing`);
    continue;
  }
  const fields = parseFrontmatter(content, path, failures);
  if (fields.name !== entry.name) failures.push(`${path}: frontmatter name must equal directory name`);
  if (!fields.description || fields.description.length > 1024) {
    failures.push(`${path}: description is required and must be at most 1024 characters`);
  }
  for (const [label, pattern] of forbidden) {
    if (pattern.test(content)) failures.push(`${path}: contains ${label}`);
  }
}

if (failures.length) {
  console.error(`Skill validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Skills valid: portable frontmatter and content hygiene passed.");
