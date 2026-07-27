import { spawnSync } from "node:child_process";
const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "firebase",
    "emulators:export",
    "emulator-export",
    "--force",
    "--project",
    "golfer-goodies-local",
  ],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
