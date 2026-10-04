const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

async function run() {
  const frontend = "http://127.0.0.1:5179";
  const { artifacts } = await (await fetch("http://127.0.0.1:8009/__ux_e2e/evidence")).json();
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

  async function waitForUserPage() {
    await page
      .locator(".user-manage-page")
      .getByRole("row")
      .filter({ hasText: "admin" })
      .waitFor({ timeout: 30000 });
  }

  async function login() {
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('input[name="password"]').press("Enter");
    await waitForUserPage();
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
  }

  try {
    await page.goto(`${frontend}/#/system/user`);
    await login();
    checks.push("real login resumes an authorized dynamic route");
    await page.reload();
    await waitForUserPage();
    checks.push("browser refresh restores authorized dynamic routes");
    await page.evaluate(async () => {
      const { refreshMenuAndRoutes } = await import("/src/router/beforeEach.ts");
      await refreshMenuAndRoutes();
    });
    await waitForUserPage();
    checks.push("menu refresh replaces routes without losing the current page");
    await page.getByRole("button", { name: "打开账户菜单" }).click();
    await page.locator(".user-menu-action--logout").click();
    await page
      .locator(".login-out-dialog")
      .getByRole("button", { name: "确定", exact: true })
      .click();
    await page.locator('input[name="username"]').waitFor();
    const state = await page.evaluate(async () => {
      const { router } = await import("/src/router/index.ts");
      return {
        businessMatched: router
          .resolve("/system/user")
          .matched.some((route) => route.path === "/system/user"),
        home: router.hasRoute("Home"),
        iframeCache: sessionStorage.getItem("iframeRoutes"),
      };
    });
    assert.deepEqual(state, { businessMatched: false, home: true, iframeCache: null });
    checks.push("logout removes dynamic routes immediately and keeps the static shell");
    await login();
    await page.waitForTimeout(700);
    assert.match(page.url(), /#\/system\/user/);
    assert.ok(await page.locator(".user-manage-page").isVisible());
    await page.reload();
    await waitForUserPage();
    assert.deepEqual(errors, []);
    checks.push("relogin and refresh remain usable after the former delayed cleanup window");
    await page.screenshot({ path: path.join(artifacts, "route-lifecycle.png"), fullPage: true });
    fs.writeFileSync(
      path.join(artifacts, "route-lifecycle.json"),
      JSON.stringify({ passed: true, checks, errors }, null, 2)
    );
    console.log(JSON.stringify({ passed: true, checks, artifacts }));
  } catch (error) {
    await page
      .screenshot({ path: path.join(artifacts, "route-lifecycle-failure.png"), fullPage: true })
      .catch(() => {});
    fs.writeFileSync(
      path.join(artifacts, "route-lifecycle.json"),
      JSON.stringify({ passed: false, checks, errors, failure: error.message }, null, 2)
    );
    console.error(`Route lifecycle evidence: ${artifacts}`);
    throw error;
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
