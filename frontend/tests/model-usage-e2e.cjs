const { observeSse } = require("./sse-events.cjs");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

process.env.UX_E2E_FEATURES = "1";

async function run() {
  const backend = "http://127.0.0.1:8009";
  const frontend = "http://127.0.0.1:5179";
  const initial = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
  const artifacts = initial.artifacts;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const events = [];
  let authorization;
  let phase = "login";
  page.on("pageerror", (error) => errors.push({ phase, message: error.message }));
  page.on("request", (request) => {
    if (request.url().startsWith(`${backend}/`) || request.url().startsWith(`${frontend}/`))
      authorization = request.headers().authorization || authorization;
  });
  const drainSse = observeSse(page, events);
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  const evidence = async () => await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
  const ownUsage = async () => {
    assert.ok(authorization, "authenticated request required");
    const response = await page.request.get(`${backend}/api/v1/ai/chat/usage?user_id=999999`, {
      headers: { Authorization: authorization },
    });
    assert.equal(response.status(), 200);
    const data = (await response.json()).data;
    assert.notEqual(data.user_id, 999999);
    return data;
  };
  const modelInput = () =>
    page
      .locator(".model-form .el-form-item")
      .filter({ hasText: "模型名称" })
      .locator("input")
      .first();
  const verifyCapabilities = async (status) => {
    const response = page.waitForResponse(
      (res) =>
        res.url().endsWith("/ai/chat/model-config/check") && res.request().method() === "POST"
    );
    await page.getByRole("button", { name: "验证 3 项能力", exact: true }).click();
    const received = await response;
    assert.equal(received.status(), 200);
    const data = (await received.json()).data;
    assert.deepEqual(
      data.results.map((item) => item.status),
      [status, status, status]
    );
    await page.locator(".check-results").waitFor();
    assert.equal(
      await page
        .locator(".check-results .el-tag")
        .filter({ hasText: status === "passed" ? "通过" : "失败" })
        .count(),
      3
    );
    return data;
  };
  const navigateChat = async () => {
    await page.goto(`${frontend}/#/ai/chat`);
    await page.waitForFunction(() =>
      document.querySelector(".composer-status")?.textContent.includes("就绪")
    );
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
  };
  const send = async (message, terminalType = "done") => {
    const offset = events.length;
    await page.locator(".message-input textarea").fill(message);
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page
      .getByRole("button", { name: "停止生成", exact: true })
      .waitFor({ state: "hidden", timeout: 20000 });
    await page.waitForTimeout(150);
    await drainSse();
    const received = events.slice(offset);
    const terminal = received.find((event) => event.type === terminalType);
    assert.ok(
      terminal?.request_id,
      `missing ${terminalType}; ${JSON.stringify(received.map(({ type, message }) => ({ type, message })))}`
    );
    return received.filter((event) => event.request_id === terminal.request_id);
  };
  try {
    await page.goto(frontend);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('input[name="password"]').press("Enter");
    await page.locator(".el-menu-item").filter({ hasText: "AI 对话" }).waitFor({ timeout: 30000 });
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
    phase = "model capability success";
    await page.goto(`${frontend}/#/ai/model-config`);
    await modelInput().waitFor();
    await page.getByRole("button", { name: "验证 3 项能力", exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector(".model-form .el-loading-mask"));
    assert.equal(
      (await evidence()).feature_provider_calls,
      0,
      "page load must not initiate provider calls"
    );
    const successful = await verifyCapabilities("passed");
    const usage3 = await ownUsage();
    assert.equal(usage3.calls, 3);
    assert.equal(usage3.daily_limit, null);
    assert.equal(
      usage3.items.reduce((total, row) => total + row.total_tokens, 0),
      17
    );
    const ledger3 = (await evidence()).feature_usage_ledger;
    assert.equal(ledger3.length, 3);
    assert.deepEqual(
      ledger3.map((row) => row.total_tokens),
      [5, 7, 5]
    );
    assert.ok(
      ledger3.every((row) => row.purpose === "capability_check" && row.status === "succeeded")
    );
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(150);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({
        path: path.join(artifacts, `model-capabilities-success-${width}.png`),
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    phase = "self usage drawer and unknown tokens";
    await navigateChat();
    await send("模型用量隔离验收：普通问题，请简短回答。");
    const usage5 = await ownUsage();
    assert.equal(usage5.calls, 5, "tool routing plus normal stream must count separately");
    assert.equal(
      usage5.items.reduce((total, row) => total + row.known_usage_calls, 0),
      3
    );
    assert.ok(usage5.items.some((row) => row.total_tokens === null && row.known_usage_calls === 0));
    const selfResponse = page.waitForResponse(
      (res) => res.url().endsWith("/ai/chat/usage") && res.request().method() === "GET"
    );
    await page.getByRole("button", { name: "今日用量", exact: true }).click();
    assert.equal((await selfResponse).status(), 200);
    await page.locator(".el-drawer .usage-panel").waitFor();
    assert.equal(
      await page.locator(".el-drawer .quota-form").count(),
      0,
      "self panel must hide other users and quota controls"
    );
    assert.ok((await page.locator(".el-drawer .usage-panel").innerText()).includes("未知"));
    await page.screenshot({ path: path.join(artifacts, "self-usage-drawer-desktop.png") });
    await page.locator(".el-drawer:visible .el-drawer__close-btn").click();
    phase = "model capability failure";
    await page.goto(`${frontend}/#/ai/model-config`);
    await page.waitForFunction(() => !document.querySelector(".model-form .el-loading-mask"));
    await modelInput().fill("unsupported-e2e-model");
    const failed = await verifyCapabilities("failed");
    assert.ok(failed.results.every((row) => !row.message.includes("Synthetic")));
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(artifacts, `model-capabilities-failed-${width}.png`),
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await modelInput().fill("local-e2e-model");
    phase = "zero quota prevents provider calls";
    const quotaInput = page.locator(".quota-form .el-input-number input");
    await quotaInput.fill("0");
    await quotaInput.blur();
    const quotaResponse = page.waitForResponse(
      (res) => res.url().includes("/ai/chat/usage/quota/") && res.request().method() === "PUT"
    );
    await page.getByRole("button", { name: "保存额度", exact: true }).click();
    assert.equal((await quotaResponse).status(), 200);
    const beforeDenied = await evidence();
    await navigateChat();
    const denied = await send("模型用量隔离验收：额度为0必须拒绝。", "error");
    assert.ok(denied.at(-1).message.includes("今日 AI 调用额度已用完"));
    const afterDenied = await evidence();
    assert.equal(afterDenied.feature_provider_calls, beforeDenied.feature_provider_calls);
    assert.equal(afterDenied.feature_usage_ledger.length, beforeDenied.feature_usage_ledger.length);
    assert.equal((await ownUsage()).remaining, 0);
    await page.screenshot({
      path: path.join(artifacts, "quota-zero-chat-error.png"),
      fullPage: true,
    });
    phase = "restore unlimited quota and resume chat";
    await page.goto(`${frontend}/#/ai/model-config`);
    await quotaInput.fill("");
    await quotaInput.blur();
    const resetResponse = page.waitForResponse(
      (res) => res.url().includes("/ai/chat/usage/quota/") && res.request().method() === "PUT"
    );
    await page.getByRole("button", { name: "保存额度", exact: true }).click();
    const reset = await resetResponse;
    assert.equal(reset.status(), 200);
    assert.equal((await reset.json()).data.daily_limit, null);
    await navigateChat();
    await send("模型用量隔离验收：恢复不限后应继续回答。");
    const final = await evidence();
    const finalUsage = await ownUsage();
    assert.equal(finalUsage.calls, 10);
    assert.equal(final.feature_provider_calls, 10);
    assert.equal(final.feature_usage_ledger.length, 10);
    assert.equal(final.feature_usage_ledger.filter((row) => row.status === "failed").length, 3);
    assert.ok(final.persisted_runs >= 2);
    assert.equal(errors.length, 0, JSON.stringify(errors));
    fs.writeFileSync(
      path.join(artifacts, "model-usage-results.json"),
      JSON.stringify(
        {
          passed: true,
          checks: {
            explicit_checks: true,
            three_capabilities: true,
            known_and_unknown_tokens: true,
            self_usage_isolation: true,
            zero_quota_blocks_provider: true,
            unlimited_recovery: true,
          },
          capability_success: successful,
          capability_failure: failed,
          usage: finalUsage,
          ledger: final.feature_usage_ledger,
          page_errors: errors,
          boundary:
            "real browser/auth/HTTP/SSE/temporary SQLite/RAG/provider adapter; deterministic llm stub and mock Redis; no production or paid provider acceptance",
        },
        null,
        2
      )
    );
    console.log(
      JSON.stringify({
        passed: true,
        artifacts,
        calls: finalUsage.calls,
        ledger_records: final.feature_usage_ledger.length,
        page_errors: errors.length,
      })
    );
  } catch (error) {
    await page
      .screenshot({ path: path.join(artifacts, "model-usage-failure.png"), fullPage: true })
      .catch(() => {});
    fs.writeFileSync(
      path.join(artifacts, "model-usage-failure.json"),
      JSON.stringify({ phase, error: error.message, page_errors: errors }, null, 2)
    );
    throw error;
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
