const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

test("Git hooks check both applications without rewriting staged or unstaged files", () => {
  const source = path.resolve(__dirname, "../..");
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "fastcore-hooks-"));

  function run(command, args, cwd = fixture) {
    const result = spawnSync(command, args, {
      cwd,
      encoding: "utf8",
      timeout: 30000,
      env: { ...process.env, HUSKY: "1" },
    });
    assert.ifError(result.error);
    return result;
  }

  function succeeds(command, args, cwd) {
    const result = run(command, args, cwd);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  }

  function checkFile(name, staged, working, expected) {
    const file = path.join(fixture, name);
    fs.writeFileSync(file, staged);
    succeeds("git", ["add", "--", name]);
    fs.writeFileSync(file, working);
    const result = run("git", ["hook", "run", "pre-commit"]);
    assert.equal(result.status === 0, expected, result.stdout + result.stderr);
    assert.equal(fs.readFileSync(file, "utf8"), working);
    assert.equal(run("git", ["show", `:${name}`]).stdout, staged);
    succeeds("git", ["reset", "--", name]);
  }

  try {
    for (const dir of ["frontend/.husky", "frontend/src", "backend"]) {
      fs.mkdirSync(path.join(fixture, dir), { recursive: true });
    }
    for (const file of [
      "frontend/package.json",
      "frontend/pnpm-workspace.yaml",
      "frontend/eslint.config.mjs",
      "frontend/.auto-import.json",
      "frontend/.prettierrc.yaml",
      "frontend/.stylelintrc.cjs",
      "frontend/commitlint.config.cjs",
      "frontend/.husky/pre-commit",
      "frontend/.husky/commit-msg",
      "backend/pyproject.toml",
    ]) {
      fs.copyFileSync(path.join(source, file), path.join(fixture, file));
    }
    for (const dir of ["frontend/node_modules", "backend/.venv"]) {
      fs.symlinkSync(path.join(source, dir), path.join(fixture, dir), "dir");
    }
    succeeds("git", ["init", "--quiet"]);
    succeeds("git", [
      "-c",
      "user.name=Hook Test",
      "-c",
      "user.email=hooks@example.invalid",
      "commit",
      "--allow-empty",
      "--quiet",
      "-m",
      "chore: fixture",
    ]);
    succeeds("corepack", ["pnpm", "run", "prepare"], path.join(fixture, "frontend"));
    assert.equal(
      run("git", ["config", "--get", "core.hooksPath"]).stdout.trim(),
      "frontend/.husky/_"
    );

    const goodJs = "export const value = 1;\n";
    const badJs = "const unused = 1;\n";
    checkFile("frontend/src/example.js", goodJs, badJs, true);
    checkFile("frontend/src/example.js", badJs, goodJs, false);
    const goodPython = "VALUE = 1\n";
    const badPython = "import os\n";
    checkFile("backend/example.py", goodPython, badPython, true);
    checkFile("backend/example.py", badPython, goodPython, false);

    const message = path.join(fixture, ".git/COMMIT_EDITMSG");
    fs.writeFileSync(message, "fix: 验证提交检查\n");
    succeeds("git", ["hook", "run", "commit-msg", "--", ".git/COMMIT_EDITMSG"]);
    fs.writeFileSync(message, "invalid message\n");
    assert.notEqual(run("git", ["hook", "run", "commit-msg", "--", message]).status, 0);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
