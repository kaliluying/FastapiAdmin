const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const net = require("node:net");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { retainArtifacts } = require("../scripts/acceptance-artifacts.cjs");
const { runAcceptance } = require("./ux-e2e.cjs");

test("retain only regular evidence files, redact JSON secrets, and preserve failed runs", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "acceptance-retention-"));
  const source = path.join(root, "raw");
  fs.mkdirSync(source);
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync(
      "git",
      [
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@example.invalid",
        "-c",
        "core.hooksPath=/dev/null",
        "commit",
        "--allow-empty",
        "-qm",
        "fixture",
      ],
      { cwd: root }
    );
    fs.writeFileSync(
      path.join(source, "site-results.json"),
      JSON.stringify({
        password: "sensitive",
        text: "api_key=sensitive Authorization: Bearer sensitive",
        nested: [{ access_token: "sensitive" }],
        status: "failed",
      })
    );
    fs.writeFileSync(path.join(source, "view.png"), "fixture image");
    for (const name of ["raw.log", "environment.json", "database.db"])
      fs.writeFileSync(path.join(source, name), "sensitive");
    fs.symlinkSync(path.join(source, "raw.log"), path.join(source, "linked.png"));
    const destination = retainArtifacts(source, root, false);
    assert.deepEqual(fs.readdirSync(destination).sort(), [
      "manifest.json",
      "site-results.json",
      "view.png",
    ]);
    assert.equal(
      fs.readFileSync(path.join(destination, "site-results.json"), "utf8").includes("sensitive"),
      false
    );
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(destination, "manifest.json"))).passed,
      false
    );
    const again = retainArtifacts(source, root, true);
    assert.notEqual(again, destination);
    assert.ok(fs.existsSync(path.join(source, "raw.log")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("scoped checks stop on the first failure and retain a failed result", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "acceptance-check-"));
  const scripts = path.join(root, "frontend/scripts");
  const bin = path.join(root, "bin");
  fs.mkdirSync(scripts, { recursive: true });
  fs.mkdirSync(bin);
  try {
    for (const name of ["check.cjs", "acceptance-artifacts.cjs"])
      fs.copyFileSync(path.join(__dirname, "../scripts", name), path.join(scripts, name));
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync(
      "git",
      [
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@example.invalid",
        "-c",
        "core.hooksPath=/dev/null",
        "commit",
        "--allow-empty",
        "-qm",
        "fixture",
      ],
      { cwd: root }
    );
    fs.writeFileSync(
      path.join(bin, "corepack"),
      '#!/bin/sh\necho invoked >> "$CHECK_FIXTURE_LOG"\nexit 7\n',
      { mode: 0o755 }
    );
    const result = spawnSync(process.execPath, [path.join(scripts, "check.cjs"), "frontend"], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        CHECK_FIXTURE_LOG: path.join(root, "calls"),
      },
    });
    assert.equal(result.status, 1, result.stderr);
    assert.equal(fs.readFileSync(path.join(root, "calls"), "utf8"), "invoked\n");
    const parent = path.join(root, ".local/acceptance");
    const retained = path.join(parent, fs.readdirSync(parent)[0]);
    assert.equal(JSON.parse(fs.readFileSync(path.join(retained, "manifest.json"))).passed, false);
    const checks = JSON.parse(fs.readFileSync(path.join(retained, "check-results.json"))).checks;
    assert.equal(checks.length, 1);
    assert.equal(checks[0].status, 7);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("occupied acceptance port fails before running checks and retains the cause", async () => {
  const root = path.resolve(__dirname, "../..");
  const parent = path.join(root, ".local/acceptance");
  fs.mkdirSync(parent, { recursive: true });
  const before = new Set(fs.readdirSync(parent));
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(8009, "127.0.0.1", resolve);
  });
  let ran = false;
  try {
    await assert.rejects(
      runAcceptance(async () => {
        ran = true;
      }),
      /port 8009 is occupied/
    );
    assert.equal(ran, false);
    const name = fs.readdirSync(parent).find((entry) => !before.has(entry));
    const result = JSON.parse(fs.readFileSync(path.join(parent, name, "acceptance-results.json")));
    assert.equal(result.passed, false);
    assert.match(result.error.message, /port 8009 is occupied/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
