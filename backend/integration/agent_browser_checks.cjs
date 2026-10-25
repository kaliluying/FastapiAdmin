// Real Chrome -> isolated Vite -> production HTTP; no business response interception.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const { createHash } = require("node:crypto");
const { spawn } = require("node:child_process");
const { chromium } = require("../../frontend/node_modules/playwright");

async function run() {
  const root = process.env.FASTCORE_INTEGRATION_ROOT;
  assert.ok(root && path.basename(root).startsWith("fastcore-integration-"));
  assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
  const apiPort = Number(process.argv[2]);
  assert.ok(Number.isInteger(apiPort) && apiPort > 1024 && apiPort <= 65535);
  const source = path.resolve(__dirname, "../../frontend");
  const frontend = path.join(root, "frontend");
  // Vite and import plugins may write generated files: run against a temporary copy.
  fs.cpSync(source, frontend, {
    recursive: true,
    filter: (file) => !/^(?:\.env.*|node_modules|dist|\.local|\.vitest|\.git)$/.test(path.basename(file)),
  });
  fs.symlinkSync(path.join(source, "node_modules"), path.join(frontend, "node_modules"), "dir");
  const port = await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const selected = server.address().port;
      server.close(() => resolve(selected));
    });
  });
  const config = path.join(root, "vite-agent.mjs");
  fs.writeFileSync(config, `import base from ${JSON.stringify(path.join(frontend, "vite.config.ts"))};
export default (env) => {
  const config = base(env);
  config.envDir = ${JSON.stringify(frontend)};
  config.cacheDir = ${JSON.stringify(path.join(root, "vite-cache"))};
  config.server.open = false;
  config.server.proxy["/api/v1"].rewrite = (path) => path.replace(/^\\/api\\/v1/, "");
  return config;
};`);
  const log = fs.openSync(path.join(root, "agent-vite.log"), "w");
  const vite = spawn(process.execPath, [
    path.join(frontend, "node_modules/vite/bin/vite.js"), "--config", config,
    "--host", "127.0.0.1", "--port", String(port), "--strictPort",
  ], {
    cwd: frontend,
    env: {
      ...process.env, BROWSER: "none", VITE_API_BASE_URL: `http://127.0.0.1:${apiPort}`,
      VITE_APP_BASE_API: "/api/v1", VITE_APP_TITLE: "FastCore", VITE_APP_ENV: "development",
      VITE_PORT: String(port), VITE_BASE_URL: "/", VITE_VERSION: "agent-acceptance",
      VITE_MOCK_DEV_SERVER: "false",
    },
    stdio: ["ignore", log, log],
  });
  let browser;
  let page;
  const requests = [];
  const errors = [];
  try {
    for (let attempt = 0; attempt < 160; attempt++) {
      assert.equal(vite.exitCode, null, "Vite exited before readiness");
      try {
        if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
      } catch {}
      assert.ok(attempt < 159, "Vite readiness timed out");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, timezoneId: "UTC" });
    page.setDefaultTimeout(30000);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (url.pathname.startsWith("/api/v1/"))
        requests.push({ method: response.request().method(), path: url.pathname, status: response.status() });
    });
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return ["127.0.0.1", "localhost"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol)
        ? route.continue() : route.abort();
    });
    await page.goto(`http://127.0.0.1:${port}`);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("isolated-agent-acceptance");
    await page.locator('input[name="password"]').press("Enter");
    await page.locator(".home-workspace").waitFor();
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    await skip.waitFor({ timeout: 3000 }).catch(() => {});
    if (await skip.isVisible()) await skip.click();
    const menu = page.locator(".el-menu-item").filter({ hasText: "AI 对话" });
    if (!(await menu.isVisible()))
      await page.locator(".el-sub-menu__title").filter({ hasText: "AI 知识库" }).click();
    await menu.click();
    const entry = page.getByRole("button", { name: /只读诊断 Agent|诊断任务/ });
    await entry.click();
    let drawer = page.getByRole("dialog", { name: "只读诊断 Agent", exact: true });
    await drawer.waitFor();
    assert.match(await drawer.innerText(), /不修改业务数据/);
    await drawer.screenshot({ path: path.join(root, "agent-browser-entry.png"), animations: "disabled" });
    const blocked = process.env.FASTCORE_AGENT_BROWSER_BARRIER === "1";
    await drawer.getByRole("textbox", { name: "诊断目标", exact: true }).fill(
      `浏览器验收：${blocked ? "ACCEPT_BROWSER " : ""}结合运行日志和知识库分析 AGENTORCHIDEVIDENCE，并引用依据`
    );
    await drawer.locator(".el-select").filter({
      has: page.getByRole("combobox", { name: "诊断使用的知识库", exact: true }),
    }).click();
    await page.getByRole("option", { name: "Agent 隔离知识库", exact: true }).click();
    await page.keyboard.press("Escape");
    await drawer.locator(".el-checkbox").filter({ hasText: "查询运行日志" }).click();
    assert.equal(await drawer.getByRole("checkbox", { name: "查询运行日志", exact: true }).isChecked(), true);
    const creation = page.waitForResponse((response) =>
      response.url().endsWith("/ai/agent/runs") && response.request().method() === "POST"
    );
    await drawer.getByRole("button", { name: "开始诊断", exact: true }).click();
    const created = await (await creation).json();
    assert.equal(created.success, true);
    const runId = created.data.run_id;
    await drawer.locator(".agent-events li").first().waitFor();
    await page.screenshot({ path: path.join(root, "agent-browser-progress.png"), fullPage: true });
    if (blocked) {
      for (let attempt = 0; !fs.existsSync(path.join(root, "model-entered-BROWSER")); attempt++) {
        assert.ok(attempt < 100, "Browser model barrier was not reached");
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      await drawer.locator(".el-drawer__close-btn").click();
      await page.reload();
      await entry.click();
      drawer = page.getByRole("dialog", { name: "只读诊断 Agent", exact: true });
      await drawer.locator(".el-select").filter({
        has: page.getByRole("combobox", { name: "最近诊断任务", exact: true }),
      }).click();
      await page.getByRole("option").filter({ hasText: "浏览器验收：" }).click();
      await drawer.getByRole("button", { name: "取消任务", exact: true }).waitFor();
      assert.match(await drawer.locator(".agent-detail").innerText(), /诊断中/);
      await drawer.screenshot({ path: path.join(root, "agent-browser-running-restored.png"), animations: "disabled" });
      fs.writeFileSync(path.join(root, "model-release-BROWSER"), "");
      const summary = drawer.locator(".agent-analysis").first();
      await summary.getByText("正在核对所选数据源。", { exact: true }).waitFor();
      assert.match(await summary.innerText(), /生成中/);
      assert.equal(await drawer.locator(".agent-result").count(), 0);
      const totalBefore = await drawer.getByTestId("agent-total-time").innerText();
      const stageBefore = await drawer.getByTestId("agent-stage-time").innerText();
      assert.match(totalBefore, /^00:[0-5]\d$/, "A new task must not inherit a server/browser timezone offset");
      await page.waitForTimeout(1250);
      assert.notEqual(await drawer.getByTestId("agent-total-time").innerText(), totalBefore);
      assert.notEqual(await drawer.getByTestId("agent-stage-time").innerText(), stageBefore);
      fs.writeFileSync(path.join(root, "stream-release-BROWSER-1"), "");
      await summary.getByText(/将查询日志并对照知识库。/).waitFor();
      assert.equal(await drawer.locator(".agent-analysis").count(), 1, "Snapshots must update one summary card");
      assert.equal(await drawer.locator(".agent-result").count(), 0, "Summary must precede completion");
      await summary.scrollIntoViewIfNeeded();
      await drawer.screenshot({ path: path.join(root, "agent-browser-streaming.png"), animations: "disabled" });
      fs.writeFileSync(path.join(root, "stream-release-BROWSER-2"), "");
    }
    await drawer.locator(".agent-result").waitFor({ timeout: 45000 });
    assert.match(await drawer.locator(".agent-result").innerText(), /AGENTORCHIDEVIDENCE/);
    assert.match(await drawer.locator(".agent-events").innerText(), /已完成/);
    assert.match(await drawer.locator(".agent-events").innerText(), /运行日志/);
    assert.match(await drawer.locator(".agent-events").innerText(), /知识库检索/);
    const toggles = drawer.locator(".agent-tool-toggle");
    assert.equal(await toggles.count(), 2);
    const toggle = toggles.first();
    await toggle.scrollIntoViewIfNeeded();
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    await toggle.focus();
    await page.keyboard.press("Enter");
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    const toolBody = drawer.locator(".agent-tool-body").first();
    assert.match(await toolBody.innerText(), /查询参数/);
    assert.match(await toolBody.innerText(), /AGENTORCHIDEVIDENCE/);
    await drawer.screenshot({ path: path.join(root, "agent-browser-tool-expanded.png"), animations: "disabled" });
    await toggle.focus();
    await page.keyboard.press("Space");
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    const finishedTime = await drawer.getByTestId("agent-total-time").innerText();
    await page.waitForTimeout(1250);
    assert.equal(await drawer.getByTestId("agent-total-time").innerText(), finishedTime);
    await drawer.locator(".fa-citation-item__title").first().click();
    const citation = page.getByRole("dialog", { name: "引用片段", exact: true });
    await citation.waitFor();
    assert.match(await citation.innerText(), /AGENTORCHIDEVIDENCE/);
    await citation.screenshot({ path: path.join(root, "agent-browser-citation.png"), animations: "disabled" });
    await citation.locator(".el-dialog__headerbtn").click();
    await citation.waitFor({ state: "hidden" });
    await drawer.locator(".agent-result h3").scrollIntoViewIfNeeded();
    await drawer.screenshot({ path: path.join(root, "agent-browser-result.png"), animations: "disabled" });
    await page.reload();
    await entry.click();
    drawer = page.getByRole("dialog", { name: "只读诊断 Agent", exact: true });
    await drawer.locator(".el-select").filter({
      has: page.getByRole("combobox", { name: "最近诊断任务", exact: true }),
    }).click();
    await page.getByRole("option").filter({ hasText: "浏览器验收：" }).click();
    await drawer.locator(".agent-result").waitFor();
    assert.match(await drawer.locator(".agent-result").innerText(), /AGENTORCHIDEVIDENCE/);
    assert.equal(await drawer.getByTestId("agent-total-time").innerText(), finishedTime);
    assert.equal(await drawer.locator(".agent-tool-toggle").count(), 2);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const geometry = await drawer.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { width: bounds.width, x: bounds.x, right: bounds.right, viewport: innerWidth };
    });
    assert.ok(geometry.width <= 390 && geometry.x >= -1 && geometry.right <= 391, JSON.stringify(geometry));
    await drawer.locator(".agent-tool-toggle").first().click();
    const mobileTool = drawer.locator(".agent-tool-card").first();
    await mobileTool.scrollIntoViewIfNeeded();
    assert.equal(await mobileTool.evaluate((element) => element.scrollWidth > element.clientWidth), false);
    await drawer.screenshot({ path: path.join(root, "agent-browser-mobile-tool.png"), animations: "disabled" });
    await drawer.locator(".agent-notice").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, "agent-browser-mobile-form.png"), animations: "disabled" });
    await drawer.locator(".agent-result h3").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, "agent-browser-mobile.png"), animations: "disabled" });
    assert.deepEqual(errors, [], "Unhandled page errors");
    assert.equal(requests.filter((item) => item.method === "POST" && item.path.endsWith("/ai/agent/runs")).length, 1);
    fs.writeFileSync(path.join(root, "agent-browser-results.json"), JSON.stringify({
      passed: true, browser: await browser.version(), run_id: runId, pageErrors: errors, requests, geometry,
      copied_source_sha256: Object.fromEntries([
        "src/views/module_ai/chat/components/FaDiagnosticAgent.vue",
        "src/views/module_ai/chat/components/diagnosticAgentTimeline.ts",
        "src/views/module_ai/chat/index.vue", "src/api/module_ai/agent.ts",
      ].map((name) => [name, createHash("sha256").update(fs.readFileSync(path.join(frontend, name))).digest("hex")])),
      checks: ["UI login", "authorized menu -> AI chat -> diagnostic drawer",
        "visible readonly/continue-after-close instructions", "UI selects KB and runtime logs",
        "one task created", "durable steps and final report", "real evidence citation preview",
        ...(blocked ? ["close drawer + refresh while provider blocked -> task still running -> resume"] : []),
        ...(blocked ? ["two live summary snapshots before completion", "continuous total and stage timers"] : []),
        "keyboard expands/collapses tool cards with real arguments and citations",
        "terminal timer freezes and survives refresh", "UTC browser against server timestamps",
        "restored tool cards", "390px expanded tool fits viewport",
        "page refresh -> recent task -> restored report", "390px drawer stays inside viewport"],
      usability: {
        kind: "AI simulated user walk-through, not a human study",
        role: "first-use superadmin with seeded isolated documents",
        observations: "Visible entry, source choices, progress, result, evidence and recent-task recovery were usable.",
        not_covered: ["human comprehension", "physical mobile device", "Safari", "screen reader", "UI failure/retry states"],
      },
    }, null, 2));
  } catch (error) {
    if (page) {
      await page.screenshot({ path: path.join(root, "agent-browser-failure.png"), fullPage: true });
      fs.writeFileSync(path.join(root, "agent-browser-failure.txt"), await page.locator("body").innerText());
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
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
