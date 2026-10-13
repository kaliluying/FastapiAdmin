const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { test } = require("node:test");

const root = path.resolve(__dirname, "../src");
const graph = new Map();
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(file);
    else if (/\.(ts|vue)$/.test(file) && !/(\.d\.ts|\.(spec|test)\.ts)$/.test(file))
      graph.set(file, []);
  }
}
collect(root);
const aliases = {
  "@/": `${root}/`,
  "@utils": `${root}/utils`,
  "@stores": `${root}/store`,
  "@api": `${root}/api`,
  "@views": `${root}/views`,
  "@plugins": `${root}/plugins`,
};
const barrelImports = [];
for (const [file, edges] of graph) {
  let source = fs.readFileSync(file, "utf8");
  if (file.endsWith(".vue"))
    source = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => match[1])
      .join("\n");
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  for (const node of ast.statements) {
    if (
      !(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) ||
      !node.moduleSpecifier ||
      node.importClause?.isTypeOnly ||
      node.isTypeOnly
    )
      continue;
    const name = node.moduleSpecifier.text;
    if (
      ["@utils", "@/utils"].includes(name) &&
      (file.startsWith(`${root}/api/`) || file.startsWith(`${root}/utils/`))
    )
      barrelImports.push(path.relative(root, file));
    let target;
    if (name.startsWith(".")) target = path.resolve(path.dirname(file), name);
    else
      for (const [prefix, directory] of Object.entries(aliases)) {
        if (name === prefix || name.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`)) {
          target = directory + name.slice(prefix.length);
          break;
        }
      }
    if (!target) continue;
    const resolved = [target, `${target}.ts`, `${target}.vue`, `${target}/index.ts`].find(
      (candidate) => graph.has(candidate)
    );
    if (resolved) edges.push(resolved);
  }
}

test("API and utility internals import concrete modules instead of the utility barrel", () => {
  assert.deepEqual(barrelImports, []);
});

test("static imports reachable from utilities do not form circular dependencies", () => {
  const visited = new Set();
  const active = new Set();
  const stack = [];
  function visit(file) {
    assert.equal(
      active.has(file),
      false,
      `Import cycle: ${[...stack, file].map((item) => path.relative(root, item)).join(" -> ")}`
    );
    if (visited.has(file)) return;
    active.add(file);
    stack.push(file);
    for (const dependency of graph.get(file)) visit(dependency);
    stack.pop();
    active.delete(file);
    visited.add(file);
  }
  for (const file of graph.keys()) if (file.startsWith(`${root}/utils/`)) visit(file);
});
