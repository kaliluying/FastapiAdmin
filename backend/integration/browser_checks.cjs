// 通过真实页面连接隔离生产后端，不拦截或伪造业务接口。
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { chromium } = require("../../frontend/node_modules/playwright");

async function run() {
  const root = process.env.FASTCORE_INTEGRATION_ROOT;
  assert.ok(root && path.basename(root).startsWith("fastcore-integration-"));
  const apiPort = Number(process.argv[2]);
  assert.ok(apiPort > 1024 && apiPort <= 65535);
  const frontend = path.resolve(__dirname, "../../frontend");
  const port = await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const selected = server.address().port;
      server.close(() => resolve(selected));
    });
  });
  const config = path.join(root, "vite-acceptance.mjs");
  fs.writeFileSync(config, `import base from ${JSON.stringify(path.join(frontend, "vite.config.ts"))};
export default (env) => {
  const config = base(env);
  config.server.open = false;
  config.server.proxy["/api/v1"].rewrite = (path) => path.replace(/^\\/api\\/v1/, "");
  return config;
};`);
  const log = fs.openSync(path.join(root, "vite.log"), "w");
  const vite = spawn(process.execPath, [
    path.join(frontend, "node_modules/vite/bin/vite.js"),
    "--config", config, "--host", "127.0.0.1", "--port", String(port), "--strictPort",
  ], {
    cwd: frontend,
    env: { ...process.env, BROWSER: "none", VITE_API_BASE_URL: `http://127.0.0.1:${apiPort}` },
    stdio: ["ignore", log, log],
  });
  let browser;
  let page;
  const errors = [];
  const requests = [];
  try {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      assert.equal(vite.exitCode, null, "Vite 提前退出");
      try {
        if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
      } catch {}
      assert.ok(attempt < 119, "Vite 启动超时");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(30000);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (url.pathname.startsWith("/api/v1/"))
        requests.push({ method: response.request().method(), path: url.pathname, status: response.status() });
    });
    // 页面只访问本机资源，避免供应商、遥测或第三方图片请求。
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return ["127.0.0.1", "localhost"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol)
        ? route.continue() : route.abort();
    });
    await page.goto(`http://127.0.0.1:${port}`);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("isolated-acceptance");
    await page.locator('input[name="password"]').press("Enter");
    await page.locator(".home-workspace").waitFor();
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    await skip.waitFor({ timeout: 3000 }).catch(() => {});
    if (await skip.isVisible()) await skip.click();
    const menu = page.locator(".el-menu-item").filter({ hasText: "知识库管理" });
    if (!(await menu.isVisible()))
      await page.locator(".el-sub-menu__title").filter({ hasText: "AI 知识库" }).click();
    await menu.click();
    await page.getByRole("button", { name: "新建知识库", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "新建知识库", exact: true });
    await dialog.locator(".el-form-item").filter({ hasText: "名称" }).locator("input").fill("浏览器全链路验收");
    await dialog.getByRole("button", { name: "保存", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    const row = page.locator(".el-table__row").filter({ hasText: "浏览器全链路验收" });
    await row.waitFor();
    const created = page.getByRole("dialog", { name: "去上传文档", exact: true });
    await created.waitFor();
    await page.screenshot({ path: path.join(root, "browser-knowledge.png"), fullPage: true });
    await created.getByRole("button", { name: "去上传文档", exact: true }).click();
    const upload = page.getByRole("dialog", { name: "上传文档", exact: true });
    await upload.waitFor();
    await upload.locator('input[type="file"]').setInputFiles({
      name: "browser.txt", mimeType: "text/plain", buffer: Buffer.from("验收事实：TCPORCHIDPERSISTENCE。"),
    });
    await upload.waitFor({ state: "hidden" });
    const document = page.locator(".el-table__row").filter({ hasText: "browser.txt" });
    await document.getByText("可用于检索和问答", { exact: true }).waitFor({ timeout: 45000 });
    await page.screenshot({ path: path.join(root, "browser-document.png"), fullPage: true });
    await page.locator(".el-menu-item").filter({ hasText: "AI 对话" }).click();
    await page.locator(".message-input textarea").waitFor();
    await page.locator(".knowledge-select").click();
    await page.getByRole("option", { name: "浏览器全链路验收", exact: true }).click();
    await page.keyboard.press("Escape");
    await page.locator(".message-input textarea").fill("请给出 TCPORCHIDPERSISTENCE 的资料事实");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page.waitForFunction(() =>
      document.querySelector(".message-group.assistant .message-text")?.textContent.includes("TCPORCHIDPERSISTENCE")
    );
    await page.getByRole("button", { name: "查看 1 条依据", exact: true }).click();
    await page.locator(".fa-citation-item__title").first().click();
    const citation = page.getByRole("dialog", { name: "引用片段" });
    await citation.waitFor();
    assert.match(await citation.innerText(), /TCPORCHIDPERSISTENCE/);
    await citation.screenshot({ path: path.join(root, "browser-citation-detail.png"), animations: "disabled" });
    await page.screenshot({ path: path.join(root, "browser-chat-citation.png"), fullPage: true });
    await citation.locator(".el-dialog__headerbtn").click();
    await page.reload();
    await page.locator(".session-item").first().click();
    await page.waitForFunction(() =>
      document.querySelector(".message-group.assistant .message-text")?.textContent.includes("TCPORCHIDPERSISTENCE")
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".sidebar-panel").waitFor({ state: "hidden" });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(root, "browser-chat-mobile.png"), animations: "disabled" });
    assert.deepEqual(errors, [], "页面存在未处理的运行错误");
    fs.writeFileSync(path.join(root, "browser-results.json"), JSON.stringify({
      passed: true, database: process.env.DATABASE_TYPE, browser: await browser.version(),
      checks: ["UI login and authorized menu navigation", "create knowledge base and upload document",
        "visible successful indexing", "select knowledge base, SSE answer and citation preview",
        "refresh restores persisted history", "390px chat has no horizontal page overflow"],
      usability: "AI simulated user walk-through; visible navigation, progress, success and citation feedback observed",
      pageErrors: errors, requests,
    }, null, 2));
  } catch (error) {
    if (page) {
      await page.screenshot({ path: path.join(root, "browser-failure.png"), fullPage: true });
      fs.writeFileSync(path.join(root, "browser-failure.txt"), await page.locator("body").innerText());
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    vite.kill("SIGTERM");
    await new Promise((resolve) => {
      if (vite.exitCode !== null || vite.signalCode !== null) resolve();
      else vite.once("exit", resolve);
    });
    fs.closeSync(log);
    fs.unlinkSync(config);
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
