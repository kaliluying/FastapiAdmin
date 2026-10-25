const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

async function run() {
  const frontend = "http://127.0.0.1:5179";
  const { artifacts } = await (await fetch("http://127.0.0.1:8009/__ux_e2e/evidence")).json();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    hasTouch: true,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  const checks = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const clipboard = () => page.evaluate(() => navigator.clipboard.readText());
  const check = async (name, expected) => {
    assert.equal(await clipboard(), expected);
    checks.push(name);
  };
  try {
    await page.goto(frontend);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('input[name="password"]').press("Enter");
    const menu = page.locator(".el-menu-item").filter({ hasText: "AI 对话" });
    await menu.waitFor({ state: "attached" });
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    await skip.waitFor({ timeout: 3000 }).catch(() => {});
    if (await skip.isVisible()) await skip.click();
    await menu.click();
    await page.locator(".message-input textarea").fill("请回答复制验收问题");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    const copy = page.getByRole("button", { name: "复制回答", exact: true });
    const firstSession = page.locator(".session-item").filter({ hasText: "请回答复制验" });
    await copy.waitFor();
    await page.getByRole("button", { name: "停止生成" }).waitFor({ state: "hidden" });
    const answer = await page.locator(".message-group.assistant .message-text").innerText();
    await page.mouse.move(0, 0);
    assert.equal(await copy.evaluate((element) => getComputedStyle(element).opacity), "1");
    await copy.click();
    await page.getByText("复制成功", { exact: true }).waitFor();
    await check("desktop answer copied without hover", answer);
    await page.screenshot({ path: path.join(artifacts, "answer-copy-desktop.png") });
    await page.reload();
    await copy.waitFor();
    await copy.click();
    await check("saved answer copied after reload", answer);
    assert.equal(
      await page.locator(".message-group.user .message-text").innerText(),
      "请回答复制验收问题"
    );
    await page.screenshot({ path: path.join(artifacts, "chat-restore-desktop.png") });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await copy.waitFor();
    await copy.tap();
    await check("mobile answer restored and copied after reload", answer);
    await page.screenshot({ path: path.join(artifacts, "answer-copy-mobile.png") });

    // A failed detail request must preserve the bookmark and offer a real retry.
    await page.route(
      "**/ai/chat/detail/**",
      (route) => route.fulfill({ status: 503, json: { code: 503, msg: "隔离验收临时故障" } }),
      { times: 1 }
    );
    await page.reload();
    await page.getByText("对话恢复失败", { exact: true }).waitFor();
    assert.equal(await page.locator(".message-input textarea").isDisabled(), true);
    await page.screenshot({ path: path.join(artifacts, "chat-restore-error-mobile.png") });
    await page.getByRole("button", { name: "重试加载对话", exact: true }).click();
    await copy.waitFor();
    assert.equal(await page.locator(".message-group.assistant .message-text").innerText(), answer);
    checks.push("failed restoration blocks sending and retries successfully on mobile");
    await page.setViewportSize({ width: 1440, height: 1000 });

    let detailFailures = 0;
    await page.route(
      "**/ai/chat/detail/**",
      (route) =>
        route.fulfill(
          detailFailures++ === 0
            ? { json: { code: 0, success: true, data: null } }
            : { status: 503, json: { code: 503, msg: "隔离验收再次失败" } }
        ),
      { times: 2 }
    );
    await page.reload();
    await page.getByText("对话恢复失败", { exact: true }).waitFor();
    await firstSession.locator(".session-select").click();
    await page.getByText("对话恢复失败", { exact: true }).waitFor();
    assert.equal(await page.locator(".message-input textarea").isDisabled(), true);
    await page.getByRole("button", { name: "重试加载对话", exact: true }).click();
    await copy.waitFor();
    checks.push(
      "missing detail and a failed manual selection preserve recovery and block accidental new chat"
    );

    let releaseDetail;
    const delayedDetail = new Promise((resolve) => {
      releaseDetail = resolve;
    });
    await page.route(
      "**/ai/chat/detail/**",
      async (route) => {
        await delayedDetail;
        await route.continue();
      },
      { times: 1 }
    );
    await page.reload();
    await page.getByText("正在加载对话…", { exact: true }).waitFor();
    await page.locator(".el-menu-item").filter({ hasText: "首页" }).click();
    await page.locator(".chat-workspace").waitFor({ state: "hidden" });
    await menu.click();
    await copy.waitFor();
    releaseDetail();
    assert.equal(
      await page.locator(".message-group.user .message-text").innerText(),
      "请回答复制验收问题"
    );
    checks.push("returning to a cached page restarts an interrupted restoration");

    await page.getByRole("button", { name: "开启新对话", exact: true }).click();
    await page.reload();
    await page.locator(".message-input textarea").waitFor();
    assert.equal(await page.locator(".message-group").count(), 0);
    checks.push("new conversation remains empty after reload");
    await page.locator(".message-input textarea").fill("请回答第二段会话问题");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await copy.waitFor();
    await page.getByRole("button", { name: "停止生成" }).waitFor({ state: "hidden" });
    await firstSession.locator(".session-select").click();
    await page
      .locator(".message-group.user .message-text")
      .filter({ hasText: "请回答复制验收问题" })
      .waitFor();
    await page.reload();
    await copy.waitFor();
    assert.equal(
      await page.locator(".message-group.user .message-text").innerText(),
      "请回答复制验收问题"
    );
    await firstSession.locator('[aria-current="true"]').waitFor();
    checks.push(
      "explicit historical selection survives reload instead of opening the newest session"
    );
    await firstSession.locator(".session-more").click();
    await page.getByRole("menuitem", { name: "删除", exact: true }).click();
    await page
      .getByRole("dialog", { name: "确认删除" })
      .getByRole("button", { name: "确定", exact: true })
      .click();
    await firstSession.waitFor({ state: "detached" });
    await page.reload();
    await page.locator(".message-input textarea").waitFor();
    assert.equal(await page.locator(".message-group").count(), 0);
    checks.push("deleting the current session clears restoration after reload");

    // Only the Agent report is synthetic; chat uses the existing isolated HTTP fixture.
    const result = "## 诊断报告\n\n- 检查连接池\n- 查看日志\n\n```sql\nSELECT 1;\n```";
    const run = {
      run_id: "copy-acceptance",
      goal: "复制报告验收",
      status: "succeeded",
      created_at: "2026-10-25T10:00:00",
      updated_at: "2026-10-25T10:00:01",
      result,
      error: null,
      knowledge_base_ids: [],
      use_runtime_logs: false,
      model_calls: 1,
      tool_calls: 0,
      attempts: 1,
      last_seq: 0,
      citations: [],
      events: [],
    };
    await page.route("**/ai/agent/runs**", (route) =>
      route.fulfill({
        json: {
          code: 0,
          success: true,
          msg: "操作成功",
          data: new URL(route.request().url()).pathname.endsWith("/runs") ? [run] : run,
        },
      })
    );
    await page.getByRole("button", { name: "只读诊断 Agent", exact: true }).click();
    await page.locator(".agent-history .el-select__wrapper").click();
    await page.getByRole("option").filter({ hasText: "复制报告验收" }).click();
    await page.getByRole("button", { name: "复制诊断结果", exact: true }).click();
    await check("Agent Markdown report copied intact (synthetic run)", result);
    await page.screenshot({ path: path.join(artifacts, "answer-copy-agent.png") });
    assert.deepEqual(errors, []);
    console.log(`Answer copy browser acceptance passed: ${checks.length} checks`);
  } catch (error) {
    await page.screenshot({ path: path.join(artifacts, "answer-copy-failure.png") });
    throw error;
  } finally {
    fs.writeFileSync(
      path.join(artifacts, "answer-copy-results.json"),
      JSON.stringify(
        {
          checks,
          pageErrors: errors,
          boundary:
            "Isolated SQLite/mock Redis/local model chat; synthetic Agent report; real Chrome clipboard",
        },
        null,
        2
      )
    );
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
