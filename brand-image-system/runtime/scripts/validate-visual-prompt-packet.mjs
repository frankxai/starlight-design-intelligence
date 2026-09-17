#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];

if (!input) {
  console.error("Usage: node validate-visual-prompt-packet.mjs <visual-prompt-packet.json|->");
  process.exit(2);
}

const packetPath = input === "-" ? null : path.resolve(input);
const packetLabel = packetPath ?? "<stdin>";
let packet;

try {
  packet = JSON.parse(fs.readFileSync(packetPath ?? 0, "utf8"));
} catch (error) {
  console.error(`FAIL ${packetLabel}: ${error.message}`);
  process.exit(1);
}

const errors = [];
const requireValue = (value, label) => {
  if (value === undefined || value === null || value === "") {
    errors.push(`${label} is required`);
  }
};

requireValue(packet.contractVersion, "contractVersion");
requireValue(packet.packetId, "packetId");
requireValue(packet.updatedAt, "updatedAt");
requireValue(packet.brand?.operatingUnit, "brand.operatingUnit");
requireValue(packet.brand?.brandPack, "brand.brandPack");
requireValue(packet.outcome?.surface, "outcome.surface");
requireValue(packet.outcome?.firstRead, "outcome.firstRead");
requireValue(packet.outcome?.productionLane, "outcome.productionLane");
requireValue(packet.semantic?.artifactClass, "semantic.artifactClass");
requireValue(packet.generation?.prompt, "generation.prompt");
requireValue(packet.generation?.capabilityReceipt, "generation.capabilityReceipt");
requireValue(packet.accessibility?.alt, "accessibility.alt");

if (packet.contractVersion !== "visual-prompt-packet.v1") {
  errors.push("contractVersion must be visual-prompt-packet.v1");
}

const productionLanes = new Set(["native-imagegen", "deterministic-composite"]);
if (!productionLanes.has(packet.outcome?.productionLane)) {
  errors.push("outcome.productionLane must be native-imagegen or deterministic-composite");
}

const sourceIds = new Set((packet.research?.sources ?? []).map((source) => source.id));
if (sourceIds.size === 0) {
  errors.push("research.sources must contain at least one source");
}

for (const claim of packet.semantic?.claims ?? []) {
  if (!claim.id || !claim.text) {
    errors.push("each semantic claim requires id and text");
  }
  if (!Array.isArray(claim.sourceIds) || claim.sourceIds.length === 0) {
    errors.push(`${claim.id ?? "claim"} requires at least one sourceId`);
  }
  for (const sourceId of claim.sourceIds ?? []) {
    if (!sourceIds.has(sourceId)) {
      errors.push(`${claim.id ?? "claim"} references unknown sourceId ${sourceId}`);
    }
  }
}

const diagram = packet.semantic?.diagram;
if (diagram) {
  const nodeIds = new Set((diagram.nodes ?? []).map((node) => node.id));
  for (const edge of diagram.edges ?? []) {
    if (!nodeIds.has(edge.from)) {
      errors.push(`${edge.id ?? "edge"} references unknown from node ${edge.from}`);
    }
    if (!nodeIds.has(edge.to)) {
      errors.push(`${edge.id ?? "edge"} references unknown to node ${edge.to}`);
    }
    if (!edge.relationship || !edge.condition) {
      errors.push(`${edge.id ?? "edge"} requires relationship and condition`);
    }
    for (const sourceId of edge.sourceIds ?? []) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${edge.id ?? "edge"} references unknown sourceId ${sourceId}`);
      }
    }
  }
}

const semanticClasses = new Set(["infographic", "diagram", "chart"]);
if (semanticClasses.has(packet.semantic?.artifactClass)) {
  if (packet.semantic.required !== true) {
    errors.push("semantic.required must be true for infographics, diagrams, and charts");
  }
  if ((packet.semantic.claims ?? []).length === 0) {
    errors.push("semantic claims are required for infographics, diagrams, and charts");
  }
  if (!diagram || diagram.grammar === "none") {
    errors.push("a non-empty diagram grammar is required for infographics, diagrams, and charts");
  }
  if (packet.outcome?.productionLane === "native-imagegen") {
    if (packet.generation?.sourceRole !== "final-native-infographic") {
      errors.push("native-imagegen semantic assets require generation.sourceRole=final-native-infographic");
    }
    if (packet.deterministic?.required !== false) {
      errors.push("native-imagegen semantic assets require deterministic.required=false");
    }
    if (packet.deterministic?.exactText !== false || packet.deterministic?.exactData !== false) {
      errors.push("native-imagegen semantic assets must not claim deterministic text or data");
    }
    if ((packet.identity?.thirdPartyBrands ?? []).length > 0) {
      errors.push("native-imagegen semantic assets cannot contain official third-party brand assets; use plain-text names or deterministic-composite");
    }
  }
  if (packet.outcome?.productionLane === "deterministic-composite") {
    if (!["illustration-layer", "draft-composition"].includes(packet.generation?.sourceRole)) {
      errors.push("deterministic-composite semantic assets require an illustration layer or draft composition");
    }
    if (packet.deterministic?.required !== true) {
      errors.push("deterministic.required must be true for deterministic-composite semantic assets");
    }
    if (packet.deterministic?.exactText !== true) {
      errors.push("deterministic.exactText must be true for deterministic-composite semantic assets");
    }
    if (packet.deterministic?.exactData !== true) {
      errors.push("deterministic.exactData must be true for deterministic-composite semantic assets");
    }
  }
  requireValue(packet.accessibility?.longDescriptionPath, "accessibility.longDescriptionPath");
}

for (const brand of packet.identity?.thirdPartyBrands ?? []) {
  if (brand.transformation !== "none") {
    errors.push(`third-party brand ${brand.name ?? "unknown"} must not be transformed`);
  }
  if (["blocked", undefined, null, ""].includes(brand.rightsStatus)) {
    errors.push(`third-party brand ${brand.name ?? "unknown"} has no usable rights status`);
  }
  requireValue(brand.assetSource, `third-party brand ${brand.name ?? "unknown"} assetSource`);
}

if ((packet.identity?.thirdPartyBrands ?? []).length > 0 && packet.deterministic?.exactLogos !== true) {
  errors.push("deterministic.exactLogos must be true when third-party brands appear");
}

for (const character of packet.identity?.characters ?? []) {
  if (character.status === "official-first-party-verified" && !character.source) {
    errors.push(`official character ${character.name ?? "unknown"} requires a first-party source`);
  }
  if (character.status === "blocked") {
    errors.push(`blocked character ${character.name ?? "unknown"} cannot appear in the packet`);
  }
}

if (packet.brand?.mode === "arcanea") {
  requireValue(packet.brand.arcaneaGate, "brand.arcaneaGate");
  requireValue(packet.brand.canonSource, "brand.canonSource");
}

if (["candidate", "published"].includes(packet.outcome?.publicationState)) {
  for (const claim of packet.semantic?.claims ?? []) {
    if (claim.verificationStatus !== "independently-verified") {
      errors.push(`${claim.id ?? "claim"} must be independently verified for candidate or published work`);
    }
  }
  if (packet.qa?.semanticReview?.status !== "pass") {
    errors.push("semantic review must pass for candidate or published work");
  }
  if (packet.qa?.visualReview?.status !== "pass") {
    errors.push("visual review must pass for candidate or published work");
  }
  if (packet.qa?.inspected !== true) {
    errors.push("qa.inspected must be true for candidate or published work");
  }
  if ((packet.qa?.score30 ?? 0) < 26) {
    errors.push("qa.score30 must be at least 26 for candidate or published work");
  }
  if ((packet.output?.artifacts ?? []).some((artifact) => artifact.inspected !== true)) {
    errors.push("every candidate or published artifact must be inspected");
  }
}

if (["approved", "published"].includes(packet.qa?.decision) && packet.qa?.humanDecision !== "approve") {
  errors.push("approved or published decisions require humanDecision=approve");
}

if (packet.generation?.modelStatus === "blocked") {
  errors.push("generation.modelStatus is blocked");
}

if (errors.length > 0) {
  console.error(`FAIL ${packetLabel}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`PASS ${packetLabel}`);
console.log(`packet=${packet.packetId}`);
console.log(`class=${packet.semantic.artifactClass}`);
console.log(`productionLane=${packet.outcome.productionLane}`);
console.log(`publicationState=${packet.outcome.publicationState}`);
console.log(`claims=${packet.semantic.claims.length}`);
console.log(`sources=${packet.research.sources.length}`);
