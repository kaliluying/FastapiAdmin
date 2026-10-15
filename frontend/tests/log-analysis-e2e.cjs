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
  const sentMessages = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const drainSse = observeSse(page, events, sentMessages);
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  const send = async (question, duringGeneration) => {
    await page.locator(".message-input textarea").fill(question);
    const eventOffset = events.length;
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    if (duringGeneration) await duringGeneration();
    await page.waitForFunction(() => !document.querySelector('button[aria-label="停止生成"]'));
    await page.waitForFunction(
      () => document.querySelector(".message-group.assistant .message-text")?.textContent.length > 0
    );
    await drainSse();
    const responseEvents = events.slice(eventOffset);
    assert.ok(responseEvents.some((event) => event.type === "done"));
    return responseEvents;
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
    assert.equal(await page.getByRole("checkbox", { name: "运行日志分析" }).count(), 0);
    assert.ok(await page.locator(".builtin-tool-notice").isVisible());
    const input = page.locator(".message-input textarea");
    await input.fill("确认中文输入不会误发");
    const imeEventOffset = sentMessages.length;
    await input.evaluate((textarea) => {
      textarea.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      textarea.dispatchEvent(enter);
      if (enter.defaultPrevented) throw new Error("IME confirmation must not be prevented");
      textarea.dispatchEvent(new CompositionEvent("compositionend", { data: "发", bubbles: true }));
    });
    await page.waitForTimeout(150);
    assert.equal(
      sentMessages
        .slice(imeEventOffset)
        .some((message) => message.message === "确认中文输入不会误发"),
      false
    );
    assert.equal(await input.inputValue(), "确认中文输入不会误发");
    assert.equal(await page.locator(".evidence-panel").count(), 0);
    const resultEvents = await send(
      "两次查询：先查询最近60分钟 ERROR 日志，再缩小至15分钟。关键词 LOG-E2E-DIAG-42，请求ID abcde042，分析索引超时并提供日志依据",
      async () => {
        await page.locator(".request-progress").filter({ hasText: "正在分析日志证据" }).waitFor();
        await input.fill("准备下一条问题");
        await input.press("Enter");
        assert.ok(await page.getByRole("button", { name: "停止生成", exact: true }).isVisible());
        await page.waitForFunction(() =>
          /[1-9]\d* 秒/.test(document.querySelector(".request-progress")?.textContent || "")
        );
        await page.screenshot({ path: path.join(initial.artifacts, "log-analysis-progress.png") });
      }
    );
    assert.equal(await input.inputValue(), "准备下一条问题");
    assert.deepEqual(
      resultEvents.filter((event) => event.type === "stage").map((event) => event.stage),
      ["routing", "querying_logs", "analyzing", "querying_logs", "analyzing"]
    );
    assert.equal(resultEvents.filter((event) => event.type === "log_result").length, 2);
    assert.equal(
      resultEvents.find((event) => event.type === "tool_call").name,
      "query_runtime_logs"
    );
    assert.equal(
      resultEvents.find((event) => event.type === "tool_call").query.keyword,
      "LOG-E2E-DIAG-42"
    );
    assert.equal(resultEvents.find((event) => event.type === "log_result").returned_count, 1);
    assert.equal(
      resultEvents.filter((event) => event.type === "citations").at(-1).citations.length,
      2
    );
    assert.ok(!JSON.stringify(resultEvents).includes("SYNTHETIC-LOG-SECRET-42"));
    await input.fill("");
    await page.screenshot({ path: path.join(initial.artifacts, "log-workspace-1440.png") });
    await page.getByRole("button", { name: "查看 2 条依据", exact: true }).last().click();
    assert.equal(await page.locator(".query-card").count(), 2);
    assert.ok((await page.locator(".runtime-log-report").innerText()).includes("最近 15 分钟"));
    assert.equal(await page.locator(".query-details[open]").count(), 0);
    await page.locator(".query-details summary").first().click();
    assert.ok((await page.locator(".query-details").first().innerText()).includes("仅本实例"));
    await page.locator(".fa-citation-item__title").first().click();
    const preview = page.getByRole("dialog", { name: "引用片段" });
    await preview.waitFor();
    assert.ok((await preview.innerText()).includes("LOG-E2E-DIAG-42"));
    assert.ok(!(await preview.innerText()).includes("SYNTHETIC-LOG-SECRET-42"));
    await preview.locator(".el-dialog__headerbtn").click();
    await preview.waitFor({ state: "hidden" });
    await page.screenshot({ path: path.join(initial.artifacts, "log-evidence-1440.png") });
    await page.getByRole("button", { name: "关闭回答依据", exact: true }).click();
    await page.waitForTimeout(4000);
    const screenshots = [];
    const checkComposerTheme = async (dark, accent) => {
      const colors = await page.evaluate(
        ({ dark, accent }) => {
          document.documentElement.classList.toggle("dark", dark);
          document.documentElement.style.setProperty("--theme-color", accent);
          const composer = document.querySelector(".input-container");
          const textarea = composer.querySelector("textarea");
          const probe = document.createElement("div");
          probe.style.backgroundColor = "var(--fa-color-surface)";
          probe.style.color = "var(--fa-color-text)";
          composer.append(probe);
          const result = {
            surface: getComputedStyle(composer).backgroundColor,
            expectedSurface: getComputedStyle(probe).backgroundColor,
            text: getComputedStyle(textarea).color,
            expectedText: getComputedStyle(probe).color,
            textareaBackground: getComputedStyle(textarea).backgroundColor,
            navbarSurface: getComputedStyle(document.querySelector(".chat-navbar")).backgroundColor,
          };
          const bubble = document.querySelector(".message-group.user .message-text");
          const paragraph = bubble.querySelector("p") || bubble;
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const context = canvas.getContext("2d");
          const luminance = (color) => {
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const channels = [...context.getImageData(0, 0, 1, 1).data]
              .slice(0, 3)
              .map((channel) => {
                const value = channel / 255;
                return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
              });
            return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
          };
          const textLuminance = luminance(getComputedStyle(paragraph).color);
          const backgroundLuminance = luminance(getComputedStyle(bubble).backgroundColor);
          result.messageContrast =
            (Math.max(textLuminance, backgroundLuminance) + 0.05) /
            (Math.min(textLuminance, backgroundLuminance) + 0.05);
          probe.remove();
          return result;
        },
        { dark, accent }
      );
      assert.equal(colors.surface, colors.expectedSurface);
      assert.equal(colors.text, colors.expectedText);
      assert.equal(colors.textareaBackground, "rgba(0, 0, 0, 0)");
      assert.equal(colors.navbarSurface, colors.expectedSurface);
      assert.ok(
        colors.messageContrast >= 4.5,
        `User message contrast is ${colors.messageContrast}`
      );
    };
    for (const width of [1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const dark of [false, true]) {
        await checkComposerTheme(dark, "#3b73e8");
        await page.waitForTimeout(150);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true
        );
        if (width <= 768) {
          const sendButton = await page
            .getByRole("button", { name: "发送消息", exact: true })
            .boundingBox();
          assert.ok(sendButton && sendButton.height >= 44 && sendButton.width >= 44);
        }
        if (width === 375) {
          const select = await page.locator(".knowledge-select").boundingBox();
          assert.ok(select && select.width > 200);
        }
        const screenshot = path.join(
          initial.artifacts,
          `log-analysis-${width}${dark ? "-dark" : ""}.png`
        );
        await page.screenshot({ path: screenshot });
        screenshots.push(screenshot);
        if (width === 375) {
          await page.getByRole("button", { name: "查看 2 条依据", exact: true }).click();
          const drawer = page.getByRole("dialog", { name: "回答依据", exact: true });
          await drawer.waitFor();
          await page.waitForTimeout(350);
          assert.equal(await drawer.locator(".query-card").count(), 2);
          assert.equal(
            await drawer.evaluate((element) => {
              const title = element.querySelector(".el-drawer__title");
              const bounds = title.getBoundingClientRect();
              return document.elementFromPoint(bounds.left + 2, bounds.top + 2) === title;
            }),
            true,
            "Evidence drawer title must not be covered by the global sidebar"
          );
          const evidenceScreenshot = path.join(
            initial.artifacts,
            `log-evidence-375${dark ? "-dark" : ""}.png`
          );
          await page.screenshot({ path: evidenceScreenshot });
          screenshots.push(evidenceScreenshot);
          await drawer.locator(".el-drawer__close-btn").click();
          await drawer.waitFor({ state: "hidden" });
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await checkComposerTheme(false, "#7c3aed");
    assert.ok(await page.locator('button[aria-label="添加文档附件"]').isVisible());
    await page.locator(".message-input textarea").fill("主题跟随检查");
    await page.waitForTimeout(200);
    assert.equal(
      await page
        .getByRole("button", { name: "发送消息", exact: true })
        .evaluate((button) => getComputedStyle(button).backgroundColor),
      "rgb(124, 58, 237)"
    );
    const customThemeScreenshot = path.join(initial.artifacts, "chat-composer-custom-theme.png");
    await page.screenshot({ path: customThemeScreenshot });
    screenshots.push(customThemeScreenshot);
    const evidence = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
    assert.equal(evidence.log_model_calls, 2);
    assert.equal(evidence.log_tool_schema_received, true);
    assert.equal(evidence.log_evidence_in_prompt, true);
    assert.equal(evidence.log_secret_in_prompt, false);
    assert.equal(evidence.persisted_runs, initial.persisted_runs);
    assert.equal(evidence.sessions, initial.sessions);
    await page.getByRole("button", { name: "结束日志追问", exact: true }).click();
    const completeEvents = await send(
      "完整日志验收：比较三天内 INFO 和 ERROR 日志，并继续查询请求 fulle042 的全部上下文"
    );
    const completeResults = completeEvents.filter((event) => event.type === "log_result");
    assert.equal(completeResults.length, 4);
    assert.equal(completeResults[0].returned_count, 70);
    assert.equal(completeResults[1].returned_count, 2);
    assert.ok(
      completeResults.every(
        (result) => result.returned_count === result.matched_count && !result.truncated
      )
    );
    assert.ok(
      completeResults.some((result) => result.scanned_files.some((file) => file.endsWith(".gz")))
    );
    const completeCitations = completeEvents
      .filter((event) => event.type === "citations")
      .at(-1).citations;
    const rootIndex = completeCitations.findIndex((citation) =>
      citation.snippet.includes("FULL-ROOT-CAUSE")
    );
    assert.ok(rootIndex >= 0);
    assert.ok(completeCitations[rootIndex].snippet.length > 12000);
    assert.ok(completeCitations.some((citation) => citation.snippet.includes("ARCHIVE-ROOT")));
    assert.equal(JSON.stringify(completeEvents).includes("SYNTHETIC-LOG-SECRET-42"), false);
    await page
      .getByRole("button", { name: `查看 ${completeCitations.length} 条依据`, exact: true })
      .click();
    await page.locator(".fa-citation-item__title").nth(rootIndex).click();
    await preview.waitFor();
    assert.ok((await preview.innerText()).includes("FULL-ROOT-CAUSE"));
    assert.ok((await preview.innerText()).length > 12000);
    const tracePreview = preview.locator(".citation-preview");
    assert.equal(
      await tracePreview.evaluate((element) => element.scrollHeight > element.clientHeight),
      true
    );
    await tracePreview.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await page.waitForTimeout(350);
    const previewBounds = await preview.boundingBox();
    assert.ok(
      previewBounds && previewBounds.y >= 0 && previewBounds.y + previewBounds.height <= 1000
    );
    await page.screenshot({ path: path.join(initial.artifacts, "log-complete-trace-preview.png") });
    await preview.locator(".el-dialog__headerbtn").click();
    await preview.waitFor({ state: "hidden" });
    const completeEvidence = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
    assert.equal(completeEvidence.complete_log_evidence, true);
    assert.equal(completeEvidence.archive_evidence, true);
    assert.equal(completeEvidence.sessions, initial.sessions);
    assert.equal(completeEvidence.persisted_runs, initial.persisted_runs);
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(initial.artifacts, "log-analysis-results.json"),
      JSON.stringify(
        {
          model_received_redacted_evidence: true,
          log_history_persisted: false,
          citation_preview_verified: true,
          full_trace_preview_verified: true,
          archive_evidence_verified: true,
          batch_and_continued_queries_verified: true,
          screenshots,
          boundary:
            "real browser/auth/HTTP/SSE/log reader; isolated SQLite and in-memory Redis; deterministic local model, no production/provider acceptance",
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
