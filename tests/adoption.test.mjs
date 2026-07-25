import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  CANONICAL_REPOSITORY,
  CANONICAL_WORKFLOW_PATH,
  validateAdoption,
  validatePortfolioRegistryData
} from "../scripts/validate-adoption.mjs";

const kernelRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const callerRepository = "frankxai/frankx.ai-vercel-website";

function git(root, args, encoding = "utf8") {
  return execFileSync("git", args, { cwd: root, encoding }).toString().trim();
}

function pinnedJson(sha, path) {
  return JSON.parse(git(kernelRoot, ["show", `${sha}:${path}`]));
}

function currentPortfolio() {
  const schema = JSON.parse(
    readFileSync(join(kernelRoot, "schemas/design-contract.schema.json"), "utf8")
  );
  const registry = JSON.parse(
    readFileSync(join(kernelRoot, "portfolio/core-surfaces.json"), "utf8")
  );
  const brandPacks = {};
  for (const brandId of new Set(registry.repositories.map((entry) => entry.brand_id))) {
    brandPacks[brandId] = JSON.parse(
      readFileSync(
        join(
          kernelRoot,
          `brand-image-system/runtime/brands/${brandId}/brand-pack.json`
        ),
        "utf8"
      )
    );
  }
  return { schema, registry, brandPacks };
}

function callerWorkflow(
  sha,
  { conditional = false, extraMutableJob = false, filtered = false, ref = sha } = {}
) {
  return `name: Starlight design contract
on:
  pull_request:${filtered ? "\n    paths:\n      - app/**" : ""}
permissions:
  contents: read
jobs:
  design-contract:
    ${conditional ? "if: false\n    " : ""}uses: ${CANONICAL_REPOSITORY}/${CANONICAL_WORKFLOW_PATH}@${ref}
${extraMutableJob ? `  mutable-shadow:\n    uses: ${CANONICAL_REPOSITORY}/${CANONICAL_WORKFLOW_PATH}@main\n` : ""}
`;
}

function createDownstream(
  t,
  {
    mutateContract = () => {},
    workflowOptions = {},
    replaceDesignWithSymlink = false,
    replaceDesignWithDanglingSymlink = false
  } = {}
) {
  const root = mkdtempSync(join(tmpdir(), "starlight-design-adoption-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, ".starlight"), { recursive: true });
  mkdirSync(join(root, ".github/workflows"), { recursive: true });

  const kernelSha = git(kernelRoot, ["rev-parse", "HEAD"]);
  const registry = pinnedJson(kernelSha, "portfolio/core-surfaces.json");
  const entry = registry.repositories.find(
    (candidate) => candidate.repository === callerRepository
  );
  const packPath = `brand-image-system/runtime/brands/${entry.brand_id}/brand-pack.json`;
  const packBytes = execFileSync("git", ["show", `${kernelSha}:${packPath}`], {
    cwd: kernelRoot,
    encoding: null
  });
  const contract = {
    schema_version: "starlight.design_contract.v1",
    repository: callerRepository,
    kernel_commit_sha: kernelSha,
    brand: {
      id: entry.brand_id,
      pack_sha256: createHash("sha256").update(packBytes).digest("hex")
    },
    surfaces: structuredClone(entry.surfaces),
    local_contracts: ["AGENTS.md", "DESIGN.md"],
    release_evidence: {
      schema_version: "starlight.web_release_evidence.v1",
      receipt_directory: ".starlight/release-evidence"
    }
  };
  mutateContract(contract);

  writeFileSync(join(root, "AGENTS.md"), "# Repository instructions\n");
  writeFileSync(join(root, "DESIGN.md"), "# Local design authority\n");
  writeFileSync(
    join(root, ".starlight/design-contract.json"),
    `${JSON.stringify(contract, null, 2)}\n`
  );
  writeFileSync(
    join(root, ".github/workflows/starlight-design-contract.yml"),
    callerWorkflow(kernelSha, workflowOptions)
  );

  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "tests@frankx.ai"]);
  git(root, ["config", "user.name", "Design Contract Tests"]);
  git(root, ["remote", "add", "origin", `https://github.com/${callerRepository}.git`]);
  if (replaceDesignWithSymlink) {
    rmSync(join(root, "DESIGN.md"));
    symlinkSync("AGENTS.md", join(root, "DESIGN.md"));
  }
  if (replaceDesignWithDanglingSymlink) {
    rmSync(join(root, "DESIGN.md"));
    symlinkSync("missing-design-authority.md", join(root, "DESIGN.md"));
  }
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "test fixture"]);

  return {
    root,
    kernelSha,
    validate() {
      return validateAdoption({
        downstreamRoot: root,
        kernelRoot,
        callerRepository,
        workflowRepository: CANONICAL_REPOSITORY,
        workflowPath: CANONICAL_WORKFLOW_PATH,
        workflowSha: kernelSha
      });
    }
  };
}

test("canonical portfolio is non-vacuous and brand-owned", () => {
  const fixture = currentPortfolio();
  assert.deepEqual(validatePortfolioRegistryData(fixture), []);
  assert.equal(fixture.registry.repositories.length, 5);
  assert.deepEqual(
    new Set(fixture.registry.repositories.map((entry) => entry.brand_id)),
    new Set(["frankx", "sis", "arcanea", "gencreator"])
  );
});

test("portfolio rejects an empty registry", () => {
  const fixture = currentPortfolio();
  fixture.registry.repositories = [];
  assert.match(validatePortfolioRegistryData(fixture).join("\n"), /must NOT have fewer than 1/i);
});

test("portfolio rejects normalized repository duplicates", () => {
  const fixture = currentPortfolio();
  fixture.registry.repositories.push({
    ...structuredClone(fixture.registry.repositories[0]),
    repository: "frankxai/FRANKX.AI-VERCEL-WEBSITE"
  });
  assert.match(validatePortfolioRegistryData(fixture).join("\n"), /duplicate normalized repository/i);
});

test("portfolio rejects duplicate surfaces and modes absent from the brand pack", () => {
  const fixture = currentPortfolio();
  fixture.registry.repositories[0].surfaces.push({
    id: "homepage",
    mode: "invented-mode",
    claim_classes: ["capability"]
  });
  const failures = validatePortfolioRegistryData(fixture).join("\n");
  assert.match(failures, /duplicate normalized surface/i);
  assert.match(failures, /absent from frankx surfaceModes/i);
});

test("valid adoption binds caller, kernel, brand blob, surfaces, and local files", (t) => {
  assert.deepEqual(createDownstream(t).validate(), []);
});

test("adoption rejects a mutable reusable-workflow ref", (t) => {
  const failures = createDownstream(t, { workflowOptions: { ref: "main" } }).validate();
  assert.match(failures.join("\n"), /exactly one unconditioned/i);
});

test("adoption rejects a mutable shadow job beside one valid immutable job", (t) => {
  const failures = createDownstream(t, {
    workflowOptions: { extraMutableJob: true }
  }).validate();
  assert.match(failures.join("\n"), /exactly one canonical design-contract workflow reference/i);
});

test("adoption rejects conditional and filtered caller jobs", (t) => {
  const conditional = createDownstream(t, {
    workflowOptions: { conditional: true }
  }).validate();
  assert.match(conditional.join("\n"), /must not be conditional/i);

  const filtered = createDownstream(t, {
    workflowOptions: { filtered: true }
  }).validate();
  assert.match(filtered.join("\n"), /unfiltered pull_request/i);
});

test("adoption rejects a digest for anything except the pinned raw brand blob", (t) => {
  const failures = createDownstream(t, {
    mutateContract(contract) {
      contract.brand.pack_sha256 = "0".repeat(64);
    }
  }).validate();
  assert.match(failures.join("\n"), /raw Git blob/i);
});

test("adoption rejects surface subsets", (t) => {
  const failures = createDownstream(t, {
    mutateContract(contract) {
      contract.surfaces.pop();
    }
  }).validate();
  assert.match(failures.join("\n"), /exactly match the portfolio registry/i);
});

test("adoption rejects uppercase or non-commit kernel pins", (t) => {
  const failures = createDownstream(t, {
    mutateContract(contract) {
      contract.kernel_commit_sha = contract.kernel_commit_sha.toUpperCase();
    }
  }).validate();
  assert.match(failures.join("\n"), /must match pattern/i);
});

test("adoption rejects local contract symlinks even when they resolve inside the repo", (t) => {
  const failures = createDownstream(t, { replaceDesignWithSymlink: true }).validate();
  assert.match(failures.join("\n"), /symlinks are not allowed/i);
});

test("adoption rejects dangling local contract symlinks", (t) => {
  const failures = createDownstream(t, {
    replaceDesignWithDanglingSymlink: true
  }).validate();
  assert.match(failures.join("\n"), /symlinks are not allowed/i);
});
