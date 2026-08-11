export const PROHIBITED_AI_SLANG = [
  ["AI-powered", /\bai[-\s]powered\b/iu],
  ["next-gen", /\bnext[-\s]?(?:gen|generation)\b/iu],
  ["game-changing", /\bgame[-\s]changing\b/iu],
  ["revolutionary", /\brevolutionary\b/iu],
  ["hyper-personalized", /\bhyper[-\s]personalized\b/iu],
  ["future-forward", /\bfuture[-\s]forward\b/iu],
  ["cutting-edge", /\bcutting[-\s]edge\b/iu],
  ["seamless", /\bseamless(?:ly)?\b/iu],
  ["world-class", /\bworld[-\s]class\b/iu]
];

export function findProhibitedAiSlang(copy) {
  if (typeof copy !== "string") return [];
  return PROHIBITED_AI_SLANG.flatMap(([label, pattern]) =>
    pattern.test(copy) ? [label] : []
  );
}
