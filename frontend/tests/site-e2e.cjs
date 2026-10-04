const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

async function run() {
  const frontend = "http://127.0.0.1:5179";
  const evidence = await (await fetch("http://127.0.0.1:8009/__ux_e2e/evidence")).json();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const checks = [];
  const errors = [];
  let phase = "login";
  page.on("pageerror", (error) => errors.push({ phase, message: error.message }));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });

  await page.route("**/system/user/current/info", async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    const aiMenu = payload.data.menus.find((menu) => menu.route_name === "AI");
    assert.ok(aiMenu, "isolated AI menu missing");
    const memoryMenu = aiMenu.children.find(
      (menu) => menu.component_path === "module_ai/memory/index"
    );
    assert.ok(memoryMenu, "isolated memory menu missing");
    aiMenu.children.push({
      ...memoryMenu,
      id: -9009,
      name: "记忆管理验收入口",
      title: "记忆管理",
      route_name: "MemoryManageFixture",
      route_path: "memory-manage",
      component_path: "module_ai/memory-manage/index",
      children: [],
    });
    await route.fulfill({ response, json: payload });
  });

  async function capture(name, width, theme) {
    await page.waitForTimeout(350);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      false,
      `horizontal overflow: ${name}/${width}/${theme}`
    );
    assert.ok(await page.locator("h1").count(), `missing page heading: ${name}`);
    await page.screenshot({
      path: path.join(evidence.artifacts, `site-${name}-${width}-${theme}.png`),
      fullPage: true,
    });
    checks.push({ page: name, width, theme, menuFixture: name === "ai-memory-manage" });
  }

  async function setTheme(theme) {
    await page.evaluate(async (value) => {
      const { useSettingsStore } = await import("/src/store/modules/setting.store.ts");

      useSettingsStore().setGlopTheme(value, value);
    }, theme);
    assert.equal(
      await page.evaluate(() => document.documentElement.classList.contains("dark")),
      theme === "dark",
      "theme setter must update the rendered page"
    );
  }

  try {
    await page.goto(frontend);
    for (const width of [1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: width >= 1024 ? 1100 : 844 });
      await capture("login", width, "light");
    }
    await setTheme("dark");
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: width === 1440 ? 1100 : 844 });
      await capture("login", width, "dark");
    }
    await setTheme("light");
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('input[name="password"]').press("Enter");
    await page.locator(".home-workspace").waitFor({ timeout: 30000 });
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    await skip.waitFor({ timeout: 3000 }).catch(() => {});
    if (await skip.isVisible()) await skip.click();
    await page.locator(".el-notification").waitFor({ state: "hidden", timeout: 10000 });

    const routes = await page.evaluate(async () => {
      const { useMenuStore } = await import("/src/store/modules/menu.store.ts");
      const leaves = [];
      function collect(items) {
        for (const item of items) {
          if (item.meta?.isHide) continue;
          if (item.children?.length) collect(item.children);
          else leaves.push(item.path);
        }
      }
      collect(useMenuStore().menuList);
      return leaves;
    });
    routes.push("/profile", "/401", "/403", "/404", "/500");
    for (const theme of process.env.SITE_E2E_INTERACTIONS_ONLY === "1" ? [] : ["light", "dark"]) {
      await setTheme(theme);
      const widths = theme === "light" ? [1440, 1024, 768, 375] : [1440, 375];
      for (const width of widths) {
        await page.setViewportSize({ width, height: width >= 1024 ? 1100 : 844 });
        for (const destination of routes) {
          phase = `${destination}/${width}/${theme}`;
          await page.goto(`${frontend}/#${destination}`);
          const titles = {
            "/home": "工作台",
            "/system/user": "用户管理",
            "/system/role": "角色管理",
            "/system/menu": "菜单管理",
            "/system/log": "操作日志|日志管理",
            "/ai/chat": "知识问答|AI 对话",
            "/ai/memory": "会话记录|AI 记忆",
            "/ai/memory-manage": "记忆管理",
            "/ai/model-config": "模型配置",
            "/ai/retrieval": "检索测试",
            "/ai/knowledge": "知识库",
            "/ai/document": "文档",
            "/profile": "个人中心",
          };
          const heading = titles[destination]
            ? page.getByRole("heading", { name: new RegExp(titles[destination]), level: 1 })
            : page.locator(`#exception-title-${destination.slice(1)}`);
          await heading.waitFor({ timeout: 20000 });
          await page
            .locator(".el-loading-mask")
            .first()
            .waitFor({ state: "hidden" })
            .catch(() => {});
          await capture(destination.slice(1).replaceAll("/", "-"), width, theme);
          if (destination === "/ai/chat" && width === 375) {
            const composer = await page.locator(".message-input textarea").boundingBox();
            assert.ok(
              composer && composer.y >= 0 && composer.y + composer.height <= 844,
              `composer outside mobile viewport: ${JSON.stringify(composer)}`
            );
          }
        }
      }
    }

    if (process.env.SITE_E2E_INTERACTIONS_ONLY !== "1") {
      await page.locator(".fa-exception-panel button").click();
      await page.waitForURL("**/#/home");
      checks.push({ interaction: "exception recovery returns to authorized home" });
    }
    await page.setViewportSize({ width: 375, height: 844 });
    await page.goto(`${frontend}/#/home`);
    await page.locator(".home-workspace").waitFor();
    await page.waitForTimeout(400);
    const openMenu = page.getByRole("button", { name: "展开侧边栏", exact: true });
    await openMenu.focus();
    await page.keyboard.press("Enter");
    await page.locator(".menu-left-open").waitFor();
    await page.keyboard.press("Escape");
    await page.locator(".menu-left-close").waitFor();
    await openMenu.focus();
    await page.keyboard.press("Enter");
    await page.locator(".menu-left-open").waitFor();
    await page.locator(".el-menu-item").filter({ hasText: "用户管理" }).click();
    await page.waitForURL("**/#/system/user");
    await page.getByRole("heading", { name: "用户管理", level: 1 }).waitFor();
    await page.locator(".menu-left-close").waitFor();
    checks.push({ interaction: "keyboard mobile menu opens, navigates and closes" });

    phase = "mobile-table-and-form";
    let listFixture = "many";
    await page.route("**/system/user/list*", async (route) => {
      if (listFixture === "error") {
        return route.fulfill({
          status: 503,
          json: { success: false, msg: "验收模拟网络失败", code: 503 },
        });
      }
      const response = await route.fetch();
      if (listFixture === "real") return route.fulfill({ response });
      const payload = await response.json();
      payload.data.total = listFixture === "many" ? 2000 : 0;
      if (listFixture === "empty") payload.data.items = [];
      await route.fulfill({ response, json: payload });
    });
    await page.getByRole("button", { name: "刷新列表", exact: true }).click();
    await page.locator(".el-pagination__total").filter({ hasText: "2000" }).waitFor();
    const tableHeight = await page
      .locator(".fa-table")
      .evaluate((node) => node.getBoundingClientRect().height);
    assert.ok(tableHeight >= 240, "mobile table collapsed");
    const paginationBounds = await page.locator(".el-pagination").evaluate((node) => {
      const outer = node.closest(".fa-table-card").getBoundingClientRect();
      return [...node.children].map((child) => {
        const rect = child.getBoundingClientRect();
        return rect.left >= outer.left && rect.right <= outer.right;
      });
    });
    assert.ok(paginationBounds.every(Boolean), "multi-page mobile pagination clipped");
    await page.getByRole("button", { name: "新增", exact: true }).click();
    const drawer = page.locator(".el-drawer:visible");
    await drawer.waitFor();
    await page.waitForFunction(() => {
      const node = document.querySelector(".el-drawer");
      const rect = node?.getBoundingClientRect();
      return rect && rect.left >= 0 && rect.right <= innerWidth + 1;
    });
    const drawerBounds = await drawer.boundingBox();
    assert.ok(drawerBounds.x >= 0 && drawerBounds.x + drawerBounds.width <= 376);
    await drawer.getByRole("button", { name: "关闭抽屉", exact: true }).click();
    await drawer.waitFor({ state: "hidden" });
    await page.goto(`${frontend}/#/system/role`);
    await page.getByRole("heading", { name: "角色管理", level: 1 }).waitFor();
    await page.getByRole("button", { name: "新增", exact: true }).click();
    const dialog = page.locator(".el-dialog:visible");
    await dialog.waitFor();
    await page.waitForTimeout(350);
    const dialogBounds = await dialog.boundingBox();
    assert.ok(dialogBounds.x >= 0 && dialogBounds.x + dialogBounds.width <= 375);
    await dialog.getByRole("button", { name: "全屏对话框", exact: true }).click();
    await page.waitForTimeout(200);
    assert.ok(Math.round((await dialog.boundingBox()).width) >= 351);
    await dialog.getByRole("button", { name: "还原对话框", exact: true }).click();
    await dialog.getByRole("button", { name: "关闭对话框", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await page.goto(`${frontend}/#/system/user`);
    await page.getByRole("heading", { name: "用户管理", level: 1 }).waitFor();
    checks.push({
      interaction:
        "fixture 2000-row pagination, visible mobile table and real form/fullscreen controls",
    });

    listFixture = "error";
    await page.getByRole("button", { name: "刷新列表", exact: true }).click();
    await page.locator(".fa-table [role='alert']").waitFor();
    listFixture = "empty";
    await page
      .locator(".fa-table")
      .getByRole("button", { name: "重试", exact: true })
      .click({ force: true });
    await page.locator(".fa-table .el-empty").waitFor();
    assert.equal(await page.locator(".fa-table [role='alert']").count(), 0);
    listFixture = "real";
    await page.getByRole("button", { name: "刷新列表", exact: true }).click();
    await page.locator(".el-pagination__total").filter({ hasText: "3" }).waitFor();
    checks.push({
      interaction: "fixture list error/empty distinction and recovery to real backend",
    });

    const account = page.getByRole("button", { name: "打开账户菜单", exact: true });
    await account.focus();
    await page.keyboard.press("Enter");
    await page.locator(".user-menu-action").first().click();
    await page.waitForURL("**/#/profile");
    await page.getByRole("heading", { name: "个人中心", level: 1 }).waitFor();
    checks.push({ interaction: "keyboard account menu opens real profile route" });

    await page.emulateMedia({ reducedMotion: "reduce" });
    const transitionDuration = await page
      .locator(".menu-left")
      .evaluate((node) => getComputedStyle(node).transitionDuration);
    assert.ok(transitionDuration.split(",").every((value) => parseFloat(value) <= 0.001));
    checks.push({ interaction: "reduced motion" });
    assert.deepEqual(errors, [], "browser runtime errors");
    console.log(
      JSON.stringify({ checks: checks.length, routes, errors, artifacts: evidence.artifacts })
    );
  } catch (error) {
    await page
      .screenshot({ path: path.join(evidence.artifacts, "site-failure.png"), fullPage: true })
      .catch(() => {});
    throw error;
  } finally {
    fs.writeFileSync(
      path.join(evidence.artifacts, "site-results.json"),
      JSON.stringify({ phase, checks, errors, boundary: evidence.boundary }, null, 2)
    );
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
