import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const suites = [
  "expansion-suite.mjs",
  "legacy-suite.mjs",
  "units-mechanics-suite.mjs",
  "builders-suite.mjs",
  "regression-suite.mjs",
  "manifest-suite.mjs",
];
const tools = process.argv.slice(2);
const extra = tools.length > 0 ? tools : [];

let failed = false;
let totalChecks = 0;
for (const suite of suites) {
  const result = spawnSync(process.execPath, [`${here}${suite}`], {
    encoding: "utf8",
  });
  process.stdout.write(result.stdout);
  if (result.stderr) process.stdout.write(result.stderr);
  const match = /checks run: (\d+)/.exec(result.stdout);
  if (match) totalChecks += Number(match[1]);
  if (result.status !== 0) failed = true;
}

const coverageDir = `${here}.coverage`;
const covered = new Set();
for (const file of fs.readdirSync(coverageDir)) {
  if (!file.endsWith(".json") || file === "kinds.json") continue;
  for (const opcode of JSON.parse(
    fs.readFileSync(`${coverageDir}/${file}`, "utf8"),
  ))
    covered.add(opcode);
}
const { blockSpecs } = await import("./harness.mjs");
const all = blockSpecs().map((entry) => entry.opcode);
const missing = all.filter((opcode) => !covered.has(opcode));
console.log(`\ntotal checks: ${totalChecks}`);
console.log(`opcode coverage: ${covered.size} / ${all.length}`);
if (missing.length) {
  console.log(`not covered: ${missing.join(" ")}`);
  failed = true;
}

for (const tool of extra) {
  const result = spawnSync(process.execPath, [`${here}${tool}`], {
    encoding: "utf8",
  });
  process.stdout.write(result.stdout);
  if (result.stderr) process.stdout.write(result.stderr);
  if (result.status !== 0) failed = true;
}

console.log(failed ? "TESTS FAILED" : "TESTS PASSED");
process.exit(failed ? 1 : 0);
