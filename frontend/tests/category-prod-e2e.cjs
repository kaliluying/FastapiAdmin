const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

process.env.UX_E2E_DEMO_ENV = "prod";

async function run() {
  const fixture = await (await fetch("http://127.0.0.1:8009/__ux_e2e/evidence")).json();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  try {
    await page.goto("http://127.0.0.1:5179");
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    const infoResponse = page.waitForResponse((response) =>
      response.url().endsWith("/system/user/current/info")
    );
    const loginResponse = page.waitForResponse((response) =>
      response.url().endsWith("/system/auth/login")
    );
    await page.locator('input[name="password"]').press("Enter");
    const response = await infoResponse;
    assert.equal(response.status(), 200);
    const info = await response.json();
    assert.equal(info.success, true);
    assert.equal(JSON.stringify(info.data.menus).includes("module_demo:"), false);
    assert.equal(JSON.stringify(info.data.menus).includes('"Demo"'), false);
    await page.locator(".home-workspace").waitFor();
    assert.equal(await page.getByText("开发范例", { exact: true }).count(), 0);
    assert.equal(await page.getByText("分类管理", { exact: true }).count(), 0);

    const token = (await (await loginResponse).json()).data.access_token;
    const statuses = [];
    for (const [method, endpoint] of [
      ["GET", "list"],
      ["GET", "detail/1"],
      ["POST", "create"],
      ["PUT", "update/1"],
      ["DELETE", "delete"],
    ]) {
      const response = await page.request.fetch(
        `http://127.0.0.1:8009/api/v1/demo/category/${endpoint}`,
        {
          method,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      statuses.push(response.status());
    }
    assert.deepEqual(statuses, [404, 404, 404, 404, 404]);
    await page.goto("http://127.0.0.1:5179/#/demo/category");
    await page.getByRole("heading", { name: /您访问的页面不存在/ }).waitFor();
    assert.equal(await page.getByRole("button", { name: "新增分类", exact: true }).count(), 0);

    const database = spawnSync(
      path.resolve(__dirname, "../../backend/.venv/bin/python"),
      [
        "-c",
        "import sqlite3,sys; db=sqlite3.connect(sys.argv[1]); print(db.execute(\"SELECT count(*) FROM platform_menu WHERE route_name IN ('Demo','DemoCategory')\").fetchone()[0])",
        fixture.database,
      ],
      { encoding: "utf8" }
    );
    assert.equal(database.status, 0, database.stderr);
    assert.equal(Number(database.stdout.trim()), 2);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: path.join(fixture.artifacts, "category-production.png") });
    const evidence = {
      passed: true,
      checks: [
        "legacy menus retained but absent from login navigation",
        "all demo endpoints return 404 for authenticated admin",
        "direct frontend URL cannot open demo",
        "production schema validation succeeds",
      ],
      statuses,
      errors,
      artifacts: fixture.artifacts,
    };
    fs.writeFileSync(
      path.join(fixture.artifacts, "category-production.json"),
      JSON.stringify(evidence, null, 2)
    );
    console.log(JSON.stringify(evidence, null, 2));
  } catch (error) {
    fs.writeFileSync(
      path.join(fixture.artifacts, "category-production-failure.json"),
      JSON.stringify({ error: error.message, stack: error.stack }, null, 2)
    );
    await page
      .screenshot({ path: path.join(fixture.artifacts, "category-production-failure.png") })
      .catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error.message.split("\n")[0]);
  process.exitCode = 1;
});
