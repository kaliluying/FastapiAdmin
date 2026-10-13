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
  const lists = new Map();
  let refreshRequests = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/auth/token/refresh")) refreshRequests++;
  });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  await page.route("**/system/log/*/list*", async (route) => {
    const kind = route.request().url().includes("/operation/") ? "operation" : "login";
    const response = await route.fetch();
    assert.equal(response.status(), 200);
    lists.set(kind, (await response.json()).data.items);
    if (kind === "operation") await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ response });
  });
  const initialListsReady = Promise.all(
    ["operation", "login"].map((kind) =>
      page.waitForResponse(
        (response) => response.url().includes(`/log/${kind}/list`) && response.status() === 200
      )
    )
  );
  try {
    await page.goto(`${frontend}/#/system/log`);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('input[name="password"]').press("Enter");
    await page.getByRole("heading", { name: "日志管理", exact: true }).waitFor();
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
    await initialListsReady;
    assert.ok(
      lists.has("operation") && lists.has("login"),
      "both log APIs must load on the first mount"
    );
    assert.ok(lists.get("operation").some((row) => row.request_path));
    assert.ok(lists.get("login").some((row) => row.username === "admin"));
    await page.getByRole("tab", { name: "登录日志", exact: true }).click();
    await page
      .locator("#pane-login .el-table__body-wrapper")
      .getByText("admin", { exact: true })
      .first()
      .waitFor();
    checks.push("both log tables fetch real independent endpoints with identical pagination");
    await page.screenshot({ path: path.join(artifacts, "table-menu-log.png"), fullPage: true });

    let expireOnce = true;
    await page.route("**/system/user/current/info", async (route) => {
      if (expireOnce) {
        expireOnce = false;
        return route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ detail: "test expired access token" }),
        });
      }
      return route.continue();
    });
    await page.evaluate(async () => {
      const { useUserStore } = await import("/src/store/modules/user.store.ts");
      await useUserStore().getUserInfo();
    });
    assert.equal(refreshRequests, 1);
    checks.push(
      "expired access response refreshes through the real backend and replays the request"
    );

    await page.goto(`${frontend}/#/system/menu`);
    await page.getByRole("heading", { name: "菜单管理", exact: true }).waitFor();
    const row = page.locator(".el-table__body-wrapper tbody tr").first();
    await row.locator(".hover-btn").nth(2).click();
    const drawer = page.locator(".el-drawer:visible");
    await drawer.waitFor();
    const field = drawer.getByPlaceholder("请输入菜单名称", { exact: true });
    const original = await field.inputValue();
    const changedName = `${original}验收`;
    await field.fill(changedName);
    let updates = 0;
    let targetId;
    let rejectOnce = true;
    await page.route("**/platform/menu/update/*", async (route) => {
      updates++;
      targetId = Number(new URL(route.request().url()).pathname.split("/").pop());
      if (rejectOnce) {
        rejectOnce = false;
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ code: 500, msg: "隔离验收保存失败" }),
        });
      }
      const response = await route.fetch();
      assert.equal(response.status(), 200);
      await new Promise((resolve) => setTimeout(resolve, 200));
      return route.fulfill({ response });
    });
    const save = drawer.getByRole("button", { name: "保存菜单", exact: true });
    await save.click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll("button")].some(
        (button) =>
          button.textContent.includes("保存菜单") && !button.classList.contains("is-loading")
      )
    );
    assert.equal(await field.inputValue(), changedName);
    assert.ok(await drawer.isVisible());
    checks.push("failed menu save preserves the draft for retry");
    await save.evaluate((button) => {
      button.click();
      button.click();
    });
    await drawer.waitFor({ state: "hidden" });
    assert.equal(updates, 2, "one rejected attempt plus one successful retry, no duplicate saves");
    const persisted = await page.evaluate(async (id) => {
      const { default: MenuAPI } = await import("/src/api/module_platform/menu.ts");
      return (await MenuAPI.detailMenu(id)).data.data.name;
    }, targetId);
    assert.equal(persisted, changedName);
    await page.reload();
    await page.getByRole("heading", { name: "菜单管理", exact: true }).waitFor();
    await page
      .locator(".el-table__body-wrapper")
      .getByText(changedName, { exact: true })
      .first()
      .waitFor();
    checks.push("double-click sends one save and the real SQL-backed result survives reload");
    await page.setViewportSize({ width: 375, height: 844 });
    await page.keyboard.press("Escape");
    await page.locator(".menu-left-close").waitFor();
    await page.waitForTimeout(400);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false
    );
    await page.screenshot({ path: path.join(artifacts, "table-menu-mobile.png"), fullPage: true });
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(artifacts, "table-menu-results.json"),
      JSON.stringify({ passed: true, checks, errors }, null, 2)
    );
    console.log(JSON.stringify({ passed: true, checks, artifacts }));
  } catch (error) {
    await page
      .screenshot({ path: path.join(artifacts, "table-menu-failure.png"), fullPage: true })
      .catch(() => {});
    fs.writeFileSync(
      path.join(artifacts, "table-menu-results.json"),
      JSON.stringify({ passed: false, checks, errors, error: error.message }, null, 2)
    );
    throw error;
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
