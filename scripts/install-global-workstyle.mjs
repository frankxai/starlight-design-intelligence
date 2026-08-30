#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const START = "<!-- FRANK-WORKSTYLE:START -->";
const END = "<!-- FRANK-WORKSTYLE:END -->";
const root = process.cwd();

function parseHome(argv) {
  const index = argv.indexOf("--home");
  if (index < 0) return homedir();
  if (!argv[index + 1]) throw new Error("--home requires a path");
  return resolve(argv[index + 1]);
}

function inject(path, body) {
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  const block = `${START}\n${body.trim()}\n${END}`;
  const start = current.indexOf(START);
  const end = current.indexOf(END);
  const next = start >= 0 && end > start
    ? `${current.slice(0, start)}${block}${current.slice(end + END.length)}`
    : `${current.trimEnd()}${current.trim() ? "\n\n" : ""}${block}\n`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, next.endsWith("\n") ? next : `${next}\n`);
}

const targetHome = parseHome(process.argv.slice(2));
const workstyle = readFileSync(join(root, "editorial/global-workstyle.md"), "utf8");
for (const path of [
  ".codex/AGENTS.md",
  ".claude/CLAUDE.md",
  ".gemini/GEMINI.md",
  ".copilot/copilot-instructions.md"
]) {
  inject(join(targetHome, path), workstyle);
}

for (const skill of ["frank-workstyle", "frank-brand-editor"]) {
  const target = join(targetHome, ".agents/skills", skill);
  mkdirSync(target, { recursive: true });
  cpSync(join(root, "skills", skill), target, { recursive: true, force: true });
}

console.log(`Installed global Frank workstyle and editorial skills under ${targetHome}.`);
