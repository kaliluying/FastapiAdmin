const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { retainArtifacts } = require("./acceptance-artifacts.cjs");

const root = path.resolve(__dirname, "../..");
const scope = process.argv[2] || "frontend";
if (!["frontend", "backend", "table", "logs"].includes(scope)) {
  console.error("Usage: corepack pnpm check [frontend|backend|table|logs]");
  process.exit(2);
}
const commands = [];
if (scope !== "backend") {
  commands.push(["frontend", "corepack", "pnpm", "run", "type-check"]);
  commands.push(["frontend", "corepack", "pnpm", "test"]);
}
if (scope === "backend" || scope === "logs") {
  commands.push([
    "backend",
    path.join(root, "backend/.venv/bin/python"),
    "-m",
    "pytest",
    "-q",
    "-p",
    "no:cacheprovider",
    ...(scope === "logs"
      ? [
          "tests/test_runtime_logs.py",
          "tests/test_ai_log_analysis.py",
          "tests/test_ai_log_followup.py",
        ]
      : ["tests/"]),
  ]);
}
if (scope === "table" || scope === "logs") {
  commands.push([
    "frontend",
    process.execPath,
    scope === "table" ? "tests/site-e2e.cjs" : "tests/log-followup-e2e.cjs",
  ]);
}
const source = fs.mkdtempSync(path.join(os.tmpdir(), "fastapiadmin-check-"));
const checks = [];
try {
  for (const [cwd, command, ...args] of commands) {
    console.log(`Checking ${scope}: ${path.basename(command)} ${args.join(" ")}`);
    const result = spawnSync(command, args, {
      cwd: path.join(root, cwd),
      stdio: "inherit",
      env: { ...process.env, ...(scope === "table" ? { SITE_E2E_INTERACTIONS_ONLY: "1" } : {}) },
    });
    checks.push({ cwd, command: path.basename(command), args, status: result.status });
    if (result.error || result.status !== 0) {
      process.exitCode = 1;
      break;
    }
  }
} finally {
  fs.writeFileSync(
    path.join(source, "check-results.json"),
    JSON.stringify({ scope, checks }, null, 2)
  );
  retainArtifacts(source, root, !process.exitCode);
  fs.rmSync(source, { recursive: true, force: true });
}
