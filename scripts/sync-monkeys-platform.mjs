import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../skills/", import.meta.url));
const check = process.argv.includes("--check");
const skills = [
  "hyperframes",
  "hyperframes-cli",
  "hyperframes-registry",
  "media-use",
  "figma",
  "slideshow",
  "remotion-to-hyperframes",
];
const resources = ["references/platform.md", "scripts/platform-cli.mjs"];
const problems = [];

for (const resource of resources) {
  const canonical = path.join(root, "hyperframes", resource);
  const contents = readFileSync(canonical);
  for (const skill of skills) {
    const target = path.join(root, skill, resource);
    if (target === canonical) continue;
    if (!check) {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, contents);
    } else {
      try {
        if (!readFileSync(target).equals(contents)) problems.push(target);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        problems.push(target);
      }
    }
  }
}
if (problems.length) throw new Error(`Platform copies differ: ${problems.join(", ")}`);
console.log("Monkeys platform copies are in sync.");
