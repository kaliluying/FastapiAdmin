const { observeSse } = require("./sse-events.cjs");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

process.env.UX_E2E_LOG_ANALYSIS = "1";

async function run() {
  const backend = "http://127.0.0.1:8009";
  const frontend = "http://127.0.0.1:5179";
  const initial = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const events = [];
  let authorization;
  page.on("request", (request) => {
    if (request.url().startsWith(`${backend}/`) || request.url().startsWith(`${frontend}/`))
      authorization = request.headers().authorization || authorization;
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const drainSse = observeSse(page, events);
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  const send = async (question, expected = "done") => {
    const offset = events.length;
    await page.locator(".message-input textarea").fill(question);
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page
      .getByRole("button", { name: "停止生成", exact: true })
      .waitFor({ state: "hidden", timeout: 20000 });
    await drainSse();
    const received = events.slice(offset);
    const terminal = received.find((event) => event.type === expected);
    assert.ok(terminal?.request_id, `missing ${expected} response for this request`);
    return received.filter((event) => event.request_id === terminal.request_id);
  };
  const reset = async (expire = false) => {
    const response = await fetch(`${backend}/__ux_e2e/log-state?expire_context=${expire}`, {
      method: "POST",
    });
    assert.equal(response.status, 200);
  };
  try {
    await page.goto(frontend);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('input[name="password"]').press("Enter");
    await page.locator(".el-menu-item").filter({ hasText: "AI 对话" }).waitFor({ timeout: 30000 });
    await page.goto(`${frontend}/#/ai/chat`);
    await page.waitForFunction(() =>
      document.querySelector(".composer-status")?.textContent.includes("就绪")
    );
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
    const first = await send("查询最近60分钟 ERROR 日志，关键词 LOG-E2E-DIAG-42，请求ID abcde042");
    assert.ok(
      first.at(-1).log_context_id,
      JSON.stringify(
        first.map(({ type, request_id, log_context_id, error_code }) => ({
          type,
          request_id,
          hasLogContext: Boolean(log_context_id),
          error_code,
        }))
      )
    );
    assert.ok((await page.locator(".builtin-tool-notice").innerText()).includes("日志追问中"));
    const followup = await send("继续缩小到5分钟");
    assert.equal(
      followup.some((event) => event.type === "error"),
      false
    );
    const query = followup.find((event) => event.type === "tool_call").query;
    assert.equal(query.minutes, 5);
    assert.equal(query.keyword, "LOG-E2E-DIAG-42");
    assert.equal(query.correlation_id, "abcde042");
    assert.equal(followup.find((event) => event.type === "log_result").returned_count, 1);
    assert.notEqual(followup.at(-1).log_context_id, first.at(-1).log_context_id);
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const dark of [false, true]) {
        await page.evaluate(
          (value) => document.documentElement.classList.toggle("dark", value),
          dark
        );
        await page.waitForTimeout(250);
        await page.locator(".message-group.assistant").last().scrollIntoViewIfNeeded();
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false
        );
        await page.screenshot({
          path: path.join(
            initial.artifacts,
            `log-followup-${width}-${dark ? "dark" : "light"}.png`
          ),
        });
      }
    }
    await reset(true);
    const expired = await send("继续查询", "error");
    assert.equal(expired.at(-1).error_code, "log_context_expired");
    assert.equal(
      expired.some((event) => event.type === "chunk"),
      false
    );
    assert.equal(await page.getByRole("button", { name: "结束日志追问", exact: true }).count(), 0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    const degraded = await send("工具不支持测试：请解释排查思路");
    assert.ok(degraded.some((event) => event.type === "warning"));
    assert.ok(degraded.some((event) => event.type === "chunk"));
    assert.equal(degraded.at(-1).session_id, undefined);
    assert.ok(
      (await page.locator(".message-group.assistant").last().innerText()).includes("未读取运行日志")
    );
    assert.ok(authorization);
    const httpQuery = async (body) => {
      const response = await fetch(`${backend}/api/v1/ai/chat/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authorization },
        body: JSON.stringify(body),
      });
      assert.equal(response.status, 200);
      return (await response.json()).data;
    };
    await reset();
    const httpFirst = await httpQuery({
      message: "查询 ERROR 日志 LOG-E2E-DIAG-42 请求ID abcde042",
    });
    assert.equal(httpFirst.session_id, "");
    assert.ok(httpFirst.log_context_id, httpFirst.response.slice(0, 120));
    await reset();
    const httpFollowup = await httpQuery({
      message: "继续缩小到5分钟",
      log_context_id: httpFirst.log_context_id,
    });
    assert.notEqual(httpFollowup.log_context_id, httpFirst.log_context_id);
    assert.equal(httpFollowup.function_calls[0].query.minutes, 5);
    assert.equal(httpFollowup.function_calls[0].query.correlation_id, "abcde042");
    assert.ok(httpFollowup.response.includes("[1]"));
    let evidence;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      evidence = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
      if (evidence.ai_audits === 2) break;
      await page.waitForTimeout(100);
    }
    assert.equal(evidence.persisted_runs, initial.persisted_runs);
    assert.equal(evidence.sessions, initial.sessions);
    assert.equal(evidence.ai_audits, 2);
    assert.equal(evidence.ai_audit_payloads_omitted, true);
    assert.equal(evidence.log_secret_in_prompt, false);
    assert.equal(JSON.stringify(events).includes("SYNTHETIC-LOG-SECRET-42"), false);
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(initial.artifacts, "log-followup-results.json"),
      JSON.stringify(
        {
          passed: true,
          fresh_followup_evidence: true,
          immediate_followup_verified: true,
          expired_context_rejected: true,
          degraded_answer_not_saved: true,
          http_followup_verified: true,
          http_audit_metadata_only: true,
          boundary:
            "real browser/auth/HTTP/SSE/log reader; disposable SQLite/mock Redis/deterministic local model; no production acceptance",
        },
        null,
        2
      )
    );
    console.log(JSON.stringify({ passed: true, artifacts: initial.artifacts }));
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
