const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { execFileSync } = require("node:child_process");

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        /(?:api[_-]?key|password|authorization|secret|token|cookie)/i.test(key) &&
        typeof entry === "string"
          ? "[REDACTED]"
          : redact(entry),
      ])
    );
  }
  return typeof value === "string"
    ? value
        .replace(/\b(?:bearer|basic)\s+[^\s,;]+/gi, "[REDACTED]")
        .replace(
          /\b(api[_-]?key|password|authorization|secret|token)\s*[:=]\s*[^\s,;]+/gi,
          "$1=[REDACTED]"
        )
    : value;
}

function retainArtifacts(source, root, passed) {
  const parent = path.join(root, ".local/acceptance");
  fs.mkdirSync(parent, { recursive: true });
  const destination = fs.mkdtempSync(
    path.join(parent, `${new Date().toISOString().slice(0, 10)}-`)
  );
  const files = [];
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const input = path.join(source, entry.name);
    const output = path.join(destination, entry.name);
    if (/\.png$/.test(entry.name)) fs.copyFileSync(input, output);
    else if (
      /^(?:.+-(?:results|checkpoint|audit)|retry-geometry-\d+|mobile-layout)\.json$/.test(
        entry.name
      )
    ) {
      fs.writeFileSync(
        output,
        JSON.stringify(redact(JSON.parse(fs.readFileSync(input, "utf8"))), null, 2)
      );
    } else continue;
    files.push(entry.name);
  }
  const git = (args) => execFileSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  const changedFiles = git(["ls-files", "-m", "-o", "--exclude-standard", "-z"])
    .toString()
    .split("\0")
    .filter(Boolean)
    .sort();
  const changedFileHashes = changedFiles.map((name) => {
    const file = path.join(root, name);
    return [
      name,
      fs.existsSync(file) && fs.statSync(file).isFile()
        ? createHash("sha256").update(fs.readFileSync(file)).digest("hex")
        : "deleted",
    ];
  });
  const manifest = {
    passed,
    files,
    recordedAt: new Date().toISOString(),
    script: path.basename(process.argv[1]),
    boundary: "Local checks only; real provider and production acceptance are not implied",
    commit: git(["rev-parse", "HEAD"]).toString().trim(),
    dirty: Boolean(git(["status", "--porcelain"]).length),
    trackedDiffHash: createHash("sha256")
      .update(git(["diff", "HEAD"]))
      .digest("hex"),
    changedFilesHash: createHash("sha256").update(JSON.stringify(changedFileHashes)).digest("hex"),
  };
  fs.writeFileSync(path.join(destination, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Retained acceptance evidence: ${destination}`);
  return destination;
}

module.exports = { retainArtifacts };
