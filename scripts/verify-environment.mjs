import { spawnSync } from "node:child_process";
const failures = [];
const nodeMajor = Number(process.versions.node.split(".")[0]);
console.log(`Node ${process.version}`);
if (nodeMajor < 22) failures.push("Node.js 22 or newer is required.");
for (const [name, args, hint] of [
  [
    "Java",
    ["-version"],
    "Install a supported Java runtime for Firebase emulators.",
  ],
  ["Firebase CLI", ["--version"], "Run npm install at the repository root."],
]) {
  const command = name === "Java" ? "java" : "firebase";
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error || result.status !== 0)
    failures.push(`${name} unavailable. ${hint}`);
  else
    console.log(`${name}: ${(result.stdout || result.stderr).split("\n")[0]}`);
}
if (failures.length) {
  for (const f of failures) console.error(`ERROR: ${f}`);
  process.exitCode = 1;
} else console.log("Local emulator prerequisites verified.");
