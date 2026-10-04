const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

async function run() {
  const fixture = await (await fetch("http://127.0.0.1:8009/__ux_e2e/evidence")).json();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const checks = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  const name = `验收分类-${Date.now()}`;
  const updatedName = `${name}-修改`;
  const dialog = page.locator(".el-dialog");
  const row = () => page.getByRole("row").filter({ hasText: updatedName });

  try {
    await page.goto("http://127.0.0.1:5179/#/demo/category");
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('input[name="password"]').press("Enter");
    await page.getByRole("heading", { name: "分类管理", exact: true }).waitFor();
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
    checks.push("authorized menu registers the category page after real login");

    await page.getByRole("button", { name: "新增分类", exact: true }).click();
    await dialog.getByLabel("分类名称", { exact: true }).fill(name);
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/demo/category/create") && response.request().method() === "POST"
    );
    await dialog.getByRole("button", { name: "保存", exact: true }).click();
    assert.equal((await created).status(), 200);
    await page.getByRole("row").filter({ hasText: name }).waitFor();
    checks.push("create persists and appears in the real list");

    await page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("button", { name: "编辑", exact: true })
      .click();
    await dialog.getByLabel("分类名称", { exact: true }).fill(updatedName);
    await dialog.getByText("停用", { exact: true }).click();
    await dialog.getByRole("button", { name: "保存", exact: true }).click();
    await row().waitFor();
    assert.ok(await row().getByText("停用", { exact: true }).isVisible());
    await page.reload();
    await row().waitFor();
    checks.push("edit and status survive browser refresh");

    await page.getByRole("button", { name: "新增分类", exact: true }).click();
    await dialog.getByLabel("分类名称", { exact: true }).fill(updatedName);
    const conflict = page.waitForResponse(
      (response) =>
        response.url().endsWith("/demo/category/create") && response.request().method() === "POST"
    );
    await dialog.getByRole("button", { name: "保存", exact: true }).click();
    assert.equal((await conflict).status(), 409);
    await dialog.getByRole("alert").waitFor();
    assert.equal(await dialog.getByLabel("分类名称", { exact: true }).inputValue(), updatedName);
    await dialog.getByRole("button", { name: "取消", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    checks.push("duplicate fails without losing form input");

    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      if (width <= 768) {
        const collapse = page.getByRole("button", { name: "收起侧边栏", exact: true });
        if (await collapse.isVisible()) await collapse.click();
      }
      await page.getByRole("button", { name: "新增分类", exact: true }).click();
      await dialog.getByLabel("分类名称", { exact: true }).fill("窄屏表单检查");
      await dialog.getByRole("button", { name: "取消", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      assert.ok(await page.getByRole("button", { name: "新增分类", exact: true }).isVisible());
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      );
      await page.screenshot({
        path: path.join(fixture.artifacts, `category-${width}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
    checks.push("375/768/1024/1440 layouts remain usable without page overflow");

    await row().getByRole("button", { name: "删除", exact: true }).click();
    await page
      .locator(".el-message-box")
      .getByRole("button", { name: "确定", exact: true })
      .click();
    await row().waitFor({ state: "detached" });
    checks.push("delete removes the row from the real page");

    const persisted = spawnSync(
      path.resolve(__dirname, "../../backend/.venv/bin/python"),
      [
        "-c",
        `
import sqlite3, json, sys
db = sqlite3.connect(sys.argv[1])
row = db.execute("SELECT status, is_deleted, created_id, updated_id, deleted_id FROM demo_category WHERE name=?", (sys.argv[2],)).fetchone()
audits = db.execute("SELECT request_method FROM sys_operation_log WHERE request_path LIKE '%/demo/category/%' AND response_code=200").fetchall()
print(json.dumps({"row": row, "methods": [item[0] for item in audits]}))
`,
        fixture.database,
        updatedName,
      ],
      { encoding: "utf8" }
    );
    assert.equal(persisted.status, 0, persisted.stderr);
    const database = JSON.parse(persisted.stdout);
    assert.equal(database.row[0], 1);
    assert.equal(database.row[1], 1);
    assert.ok(database.row.slice(2).every((id) => id === database.row[2] && id > 0));
    for (const method of ["POST", "PUT", "DELETE"]) assert.ok(database.methods.includes(method));
    assert.deepEqual(errors, []);
    checks.push("SQLite retains soft deletion and actor fields; operation audits persist");
    const result = { passed: true, checks, errors, database, artifacts: fixture.artifacts };
    fs.writeFileSync(
      path.join(fixture.artifacts, "category.json"),
      JSON.stringify(result, null, 2)
    );
    console.log(JSON.stringify(result));
  } catch (error) {
    await page
      .screenshot({ path: path.join(fixture.artifacts, "category-failure.png"), fullPage: true })
      .catch(() => {});
    console.error(`Category evidence: ${fixture.artifacts}`);
    throw error;
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
