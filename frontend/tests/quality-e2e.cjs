const { observeSse } = require("./sse-events.cjs");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

async function run() {
  const backend = "http://127.0.0.1:8009";
  const frontend = "http://127.0.0.1:5179";
  const fixture = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const events = [];
  let phase = "login";
  page.on("pageerror", (error) => errors.push({ phase, message: error.message }));
  const drainSse = observeSse(page, events);
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  try {
    await page.goto(frontend);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    const login = page.waitForResponse((response) => response.url().endsWith("/system/auth/login"));
    await page.locator('input[name="password"]').press("Enter");
    const auth = { Authorization: `Bearer ${(await (await login).json()).data.access_token}` };
    await page.locator(".el-menu-item").filter({ hasText: "AI 对话" }).waitFor({ timeout: 30000 });
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
    const api = async (method, url, options = {}) => {
      const response = await page.request.fetch(`${backend}/api/v1${url}`, {
        method,
        headers: auth,
        ...options,
      });
      assert.equal(response.status(), 200, `${method} ${url} failed`);
      return (await response.json()).data;
    };
    phase = "indexed-fixture";
    const base = await api("POST", "/ai/knowledge/create", { data: { name: "质量验收资料" } });
    const document = await api("POST", "/ai/knowledge/document/upload", {
      multipart: {
        knowledge_base_id: String(base.id),
        file: {
          name: "quality-orchid.txt",
          mimeType: "text/plain",
          buffer: Buffer.from(
            "质量验收独特标记 ORCHID7429。产品手册事实：备份前必须停止写入。",
            "utf8"
          ),
        },
      },
    });
    let indexed = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      const listing = await api("GET", `/ai/knowledge/document/list?knowledge_base_id=${base.id}`);
      if (listing.items.find((item) => item.id === document.id)?.index_status === "success") {
        indexed = true;
        break;
      }
      await page.waitForTimeout(250);
    }
    assert.ok(indexed, "Document must finish indexing before evaluation");
    phase = "evaluation-empty-validation";
    await page.goto(`${frontend}/#/ai/retrieval`);
    await page.getByRole("button", { name: "批量评测与反馈" }).click();
    await page.getByText("暂无评测，填写问题集开始检查", { exact: true }).waitFor();
    await page.getByRole("button", { name: "运行评测", exact: true }).click();
    await page.getByRole("alert").filter({ hasText: "问题集格式不正确" }).waitFor();
    await page.getByPlaceholder("例如：产品手册回归").fill("资料回归一");
    await page
      .locator(".quality-panel .el-form-item")
      .nth(1)
      .locator(".el-select__wrapper")
      .click();
    await page.getByRole("option", { name: base.name, exact: true }).click();
    await page.locator(".quality-panel h3").first().click();
    await page.getByRole("textbox", { name: "评测问题集 JSON" }).fill(
      JSON.stringify([
        { query: "ORCHID7429", expected_document_ids: [document.id] },
        { query: "停止写入", expected_document_ids: [document.id] },
      ])
    );
    phase = "evaluation-first";
    const evaluate = async () => {
      const response = page.waitForResponse(
        (response) =>
          response.url().endsWith("/ai/quality/evaluation") &&
          response.request().method() === "POST"
      );
      await page.getByRole("button", { name: "运行评测", exact: true }).click();
      const result = await (await response).json();
      assert.equal(result.success, true);
      assert.equal(result.data.report.hit_rate, 1);
      assert.equal(result.data.report.recall, 1);
      assert.ok(result.data.report.mrr > 0);
      await page.getByRole("region", { name: "评测结果" }).waitFor();
      return result.data;
    };
    const first = await evaluate();
    phase = "evaluation-compare-reuse";
    await page.getByPlaceholder("例如：产品手册回归").fill("资料回归二");
    const second = await evaluate();
    assert.equal(first.dataset_hash, second.dataset_hash);
    await page.getByText(/与同问题集、同知识库和片段数量的上次结果相比/).waitFor();
    await page.getByRole("button", { name: "复用问题集", exact: true }).first().click();
    assert.match(
      await page.getByRole("textbox", { name: "评测问题集 JSON" }).inputValue(),
      /ORCHID7429/
    );
    phase = "evaluation-error-recovery";
    await page.route(
      "**/ai/quality/evaluation*",
      (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ code: -1, msg: "Synthetic local outage" }),
        }),
      { times: 1 }
    );
    await page.getByRole("button", { name: "刷新历史", exact: true }).click();
    await page.getByText("评测历史加载失败", { exact: true }).waitFor();
    await page.getByRole("button", { name: "重试", exact: true }).click();
    await page.getByText("资料回归二", { exact: true }).first().waitFor();
    await page.screenshot({
      path: path.join(fixture.artifacts, "quality-evaluation-desktop.png"),
      fullPage: true,
    });
    phase = "chat-persisted-feedback";
    await page.goto(`${frontend}/#/ai/chat`);
    await page.waitForFunction(() =>
      document.querySelector(".composer-status")?.textContent.includes("就绪")
    );
    if (await skip.isVisible()) await skip.click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "feedback.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("附件事实 UX-E2E-ORCHID-42，供回答反馈验收。", "utf8"),
    });
    await page.waitForFunction(() =>
      document.querySelector(".file-item")?.textContent.includes("已解析")
    );
    await page.locator(".message-input textarea").fill("请依据附件说明验收事实");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page
      .getByRole("button", { name: "反馈问题", exact: true })
      .first()
      .waitFor({ timeout: 20000 });
    await drainSse();
    const done = events.find((event) => event.type === "done");
    assert.ok(done?.run_id && done?.session_id);
    await page.getByRole("button", { name: "反馈问题", exact: true }).first().click();
    const dialog = page.getByRole("dialog", { name: "反馈这条回答" });
    await dialog.getByRole("textbox").fill("需核对 ORCHID42 的来源依据");
    await page.route(
      "**/ai/quality/feedback",
      (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ code: -1, msg: "Synthetic local outage" }),
        }),
      { times: 1 }
    );
    await dialog.getByRole("button", { name: "保存反馈", exact: true }).click();
    await dialog.getByRole("alert").waitFor();
    assert.equal(await dialog.getByRole("textbox").inputValue(), "需核对 ORCHID42 的来源依据");
    await dialog.getByRole("button", { name: "保存反馈", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await page.getByText("已反馈", { exact: true }).waitFor();
    const feedback = (await api("GET", `/ai/quality/feedback?session_id=${done.session_id}`))
      .items[0];
    assert.equal(feedback.run_id, done.run_id);
    assert.match(feedback.answer, /UX-E2E-ORCHID-42/);
    phase = "feedback-history-reload";
    await page.reload();
    await page.locator(".session-item").first().waitFor();
    await page.locator(".session-item").first().click();
    await page.getByText("已反馈", { exact: true }).waitFor();
    await page.getByRole("button", { name: "反馈问题", exact: true }).first().click();
    assert.equal(await dialog.getByRole("textbox").inputValue(), feedback.comment);
    await dialog.getByRole("button", { name: "取消", exact: true }).click();
    phase = "admin-review";
    await page.goto(`${frontend}/#/ai/retrieval`);
    await page.getByRole("button", { name: "批量评测与反馈" }).click();
    await page.getByRole("tab", { name: "回答反馈处理" }).click();
    await page.getByRole("button", { name: "查看处理", exact: true }).first().click();
    const review = page.getByRole("dialog", { name: "处理回答反馈" });
    assert.match(await review.innerText(), /UX-E2E-ORCHID-42/);
    await review.getByRole("textbox").fill("已核对合成资料，确认测试证据来源");
    await review.getByRole("button", { name: "标记已处理", exact: true }).click();
    await review.waitFor({ state: "hidden" });
    const reviewed = (await api("GET", `/ai/quality/feedback?session_id=${done.session_id}`))
      .items[0];
    assert.equal(reviewed.status, "resolved");
    assert.ok(reviewed.revision > feedback.revision);
    phase = "responsive-reload";
    await page.getByRole("tab", { name: "批量检索评测" }).click();
    await page.getByRole("button", { name: "查看结果", exact: true }).first().click();
    const geometry = [];
    for (const width of [375, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      // Responsive menu switching rebuilds the route; wait before inspecting its controls.
      await page.waitForTimeout(350);
      const collapse = page.getByRole("button", { name: "收起侧边栏", exact: true });
      if (await collapse.isVisible()) await collapse.click();
      if (!(await page.locator(".quality-panel").isVisible())) {
        await page.getByRole("button", { name: "批量评测与反馈", exact: true }).click();
        await page.getByRole("button", { name: "查看结果", exact: true }).first().click();
      }
      await page.waitForTimeout(350);
      const layout = await page.locator(".quality-panel").evaluate((element) => ({
        viewport: innerWidth,
        left: element.getBoundingClientRect().left,
        right: element.getBoundingClientRect().right,
        documentWidth: document.documentElement.scrollWidth,
      }));
      assert.ok(layout.right <= width + 1 && layout.left >= 0, JSON.stringify(layout));
      assert.ok(layout.documentWidth <= width + 1, JSON.stringify(layout));
      geometry.push(layout);
      await page.screenshot({
        path: path.join(fixture.artifacts, `quality-evaluation-${width}.png`),
        fullPage: true,
      });
    }
    const sql = JSON.parse(
      execFileSync(
        path.resolve(__dirname, "../../backend/.venv/bin/python"),
        [
          "-c",
          "import json,sqlite3,sys; db=sqlite3.connect(sys.argv[1]); print(json.dumps({'feedback':db.execute('select count(*) from ai_answer_feedback where status=\"resolved\"').fetchone()[0], 'evaluations':db.execute('select count(*) from ai_retrieval_evaluation').fetchone()[0]}))",
          fixture.database,
        ],
        { encoding: "utf8" }
      )
    );
    assert.equal(sql.feedback, 1);
    assert.equal(sql.evaluations, 2);
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(fixture.artifacts, "quality-results.json"),
      JSON.stringify(
        {
          passed: true,
          sql,
          metrics: second.report,
          geometry,
          pageErrors: errors,
          scenarios: [
            "real indexed BM25 batch evaluation",
            "same dataset comparison/reuse",
            "history failure retry",
            "persisted answer feedback",
            "feedback failure preserves input",
            "feedback reload",
            "admin review with version check",
            "375/768/1024 responsive",
          ],
        },
        null,
        2
      )
    );
    console.log("Quality workflow browser and SQLite checks passed");
  } catch (error) {
    await page
      .screenshot({ path: path.join(fixture.artifacts, "quality-failure.png"), fullPage: true })
      .catch(() => {});
    throw new Error(`${phase}: ${error.message}`);
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error.message.split("\n")[0]);
  process.exitCode = 1;
});
