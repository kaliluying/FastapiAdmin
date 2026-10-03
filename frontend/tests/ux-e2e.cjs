const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

async function run() {
  const backend = "http://127.0.0.1:8009";
  const frontend = "http://127.0.0.1:5179";
  const initial = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
  const artifacts = initial.artifacts;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const events = [];
  const errors = [];
  let phase = "login";
  page.on("pageerror", (error) =>
    errors.push({ message: error.message, stack: error.stack, phase })
  );
  page.on("websocket", (socket) => {
    socket.on("framereceived", ({ payload }) => {
      try {
        const event = JSON.parse(payload.toString());
        events.push({ type: event.type, stage: event.stage });
      } catch {}
    });
  });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  const waitVisible = (selector) =>
    page.locator(selector).waitFor({ state: "visible", timeout: 20000 });
  try {
    await page.goto(frontend);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    const loginResponse = page.waitForResponse((response) =>
      response.url().endsWith("/system/auth/login")
    );
    await page.locator('input[name="password"]').press("Enter");
    assert.equal((await loginResponse).status(), 200);
    await page
      .locator(".el-menu-item")
      .filter({ hasText: "AI 对话" })
      .waitFor({ state: "attached", timeout: 30000 });
    await page
      .getByRole("button", { name: "跳过", exact: true })
      .waitFor({ state: "visible", timeout: 3000 })
      .catch(() => {});
    if (await page.getByRole("button", { name: "跳过", exact: true }).isVisible())
      await page.getByRole("button", { name: "跳过", exact: true }).click();
    await page.goto(`${frontend}/#/ai/chat`);
    phase = "chat";
    await page
      .locator('button[aria-label="添加文档附件"]')
      .waitFor({ state: "visible", timeout: 30000 });
    if (await page.getByRole("button", { name: "跳过", exact: true }).isVisible())
      await page.getByRole("button", { name: "跳过", exact: true }).click();
    await page.waitForFunction(() =>
      document.querySelector(".composer-status")?.textContent.includes("已连接")
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: "e2e-evidence.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("附件事实：UX-E2E-ORCHID-42。验收主题是工作流改进。", "utf8"),
    });
    await waitVisible(".file-item");
    await page.waitForFunction(() =>
      document.querySelector(".file-item")?.textContent.includes("已解析")
    );
    await page.locator(".message-input textarea").fill("请依据附件说明验收事实");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page.getByRole("button", { name: "停止生成" }).waitFor();
    assert.equal(
      await page.getByRole("button", { name: "发送消息", exact: true }).isDisabled(),
      true
    );
    await page.waitForFunction(() =>
      document
        .querySelector(".message-group.assistant .message-text")
        ?.textContent.includes("UX-E2E-ORCHID-42")
    );
    await page
      .getByRole("button", { name: "停止生成" })
      .waitFor({ state: "hidden", timeout: 20000 });
    await waitVisible(".message-actions");
    await page.locator(".fa-citation-item__title").first().click();
    const preview = page.getByRole("dialog", { name: "引用片段" });
    await preview.waitFor();
    assert.match(await preview.innerText(), /UX-E2E-ORCHID-42/);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(artifacts, "chat-citation-desktop.png"),
      fullPage: true,
    });
    await preview.locator(".el-dialog__headerbtn").click();
    const completed = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
    assert.equal(completed.attachment_in_prompt, true);
    assert.ok(completed.persisted_runs >= 1);
    assert.ok(completed.persisted_citations >= 1);
    for (const type of ["stage", "citations", "chunk", "done"])
      assert.ok(
        events.some((event) => event.type === type),
        type
      );

    phase = "history-reload";
    await page.reload();
    await page.locator(".session-item").first().waitFor();
    await page.locator(".session-item").first().click();
    await page.locator(".message-group.assistant .message-text").waitFor();
    await page.locator(".fa-citation-item__title").first().waitFor();
    assert.match(
      await page.locator(".message-group.assistant .message-text").innerText(),
      /UX-E2E-ORCHID-42/
    );
    await page.locator(".message-input textarea").fill("停止测试：请慢速回复");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page.getByRole("button", { name: "停止生成" }).waitFor();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "停止生成" }).click();
    await waitVisible(".message-note");
    await page.waitForTimeout(800);
    const final = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
    assert.equal(final.persisted_runs, completed.persisted_runs);
    assert.ok(final.cancelled_calls >= 1);
    await page.locator(".message-input textarea").fill("错误测试：请验证失败后重试");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page.getByRole("button", { name: "重试这条问题" }).waitFor();
    await page.locator(".message-input textarea").fill("这是一条等待发送的新草稿");
    await page.getByRole("button", { name: "重试这条问题" }).click();
    await page
      .getByRole("button", { name: "停止生成" })
      .waitFor({ state: "hidden", timeout: 20000 });
    assert.equal(
      await page.locator(".message-input textarea").inputValue(),
      "这是一条等待发送的新草稿"
    );
    const recovered = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
    assert.equal(recovered.failed_calls, 1);
    assert.equal(recovered.persisted_runs, completed.persisted_runs + 1);
    assert.ok(events.some((event) => event.type === "error"));
    fs.writeFileSync(
      path.join(artifacts, "chat-desktop-checkpoint.json"),
      JSON.stringify(
        {
          scenariosPassed: [
            "attachment RAG",
            "stream done",
            "citation persistence/restore",
            "cancel without save",
            "failure retry/new draft",
          ],
          evidence: recovered,
          pageErrors: errors,
        },
        null,
        2
      )
    );
    console.log(
      `Desktop chat scenarios complete; artifacts: ${artifacts}; raw page errors: ${errors.length}`
    );
    await page.locator(".message-input textarea").fill("");
    await page
      .locator(".message-actions button")
      .filter({ hasText: "查看 1 条依据" })
      .first()
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const globalCollapse = page.getByRole("button", { name: "收起侧边栏", exact: true });
    if (await globalCollapse.isVisible()) await globalCollapse.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(artifacts, "chat-mobile-layout.png"),
      fullPage: false,
    });
    const mobileLayout = await page
      .locator(".chat-workspace, .main-chat, .center-panel, .chat-header, .chat-footer")
      .evaluateAll((elements) => ({
        viewport: { width: innerWidth, height: innerHeight },
        media768: matchMedia("(width <= 768px)").matches,
        sidebarPresent: !!document.querySelector(".sidebar-panel"),
        evidencePresent: !!document.querySelector(".evidence-panel"),
        elements: elements.map((element) => ({
          class: element.className,
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
        })),
      }));
    fs.writeFileSync(
      path.join(artifacts, "mobile-layout.json"),
      JSON.stringify(mobileLayout, null, 2)
    );
    console.log(`Mobile geometry: ${JSON.stringify(mobileLayout)}`);
    await page.getByRole("button", { name: /回答依据/ }).click({ timeout: 10000 });
    const evidenceDrawer = page.getByRole("dialog", { name: "回答依据" });
    await evidenceDrawer.waitFor();
    await evidenceDrawer.locator(".fa-citation-item__title").click();
    await preview.waitFor();
    assert.match(await preview.innerText(), /UX-E2E-ORCHID-42/);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(artifacts, "chat-citation-mobile.png"),
      fullPage: false,
    });
    await preview.locator(".el-dialog__headerbtn").click();
    await evidenceDrawer.locator(".el-drawer__close-btn").click();
    const mobileAudit = await page.locator(".chat-workspace, .chat-header, .chat-main, .chat-footer").evaluateAll((elements) => {
      const workspace = document.querySelector(".chat-workspace");
      const footer = document.querySelector(".chat-footer");
      const workspaceRect = workspace?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      return {
        viewport: { width: innerWidth, height: innerHeight },
        workspace: workspaceRect ? { top: workspaceRect.top, bottom: workspaceRect.bottom, height: workspaceRect.height } : null,
        composer: footerRect ? { top: footerRect.top, bottom: footerRect.bottom, height: footerRect.height, inViewport: footerRect.top >= 0 && footerRect.bottom <= innerHeight } : null,
        elements: elements.map((element) => ({ class: element.className, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })),
      };
    });
    fs.writeFileSync(path.join(artifacts, "mobile-viewport-audit.json"), JSON.stringify(mobileAudit, null, 2));
    console.log(`Mobile viewport audit: ${JSON.stringify(mobileAudit)}`);
    assert.equal(mobileAudit.composer?.inViewport, true, "Mobile composer is not fully inside the viewport");
    if (process.env.UX_E2E_EXTENDED !== "1") {
      const report = { passed: errors.length === 0, functionalScenariosPassed: true, scenarios: ["real chat attachment/RAG/stream/citations", "session citation restore", "stop", "model error/retry with draft preservation", "mobile composer viewport audit"], evidence: recovered, pageErrors: errors, artifacts };
      fs.writeFileSync(path.join(artifacts, "report.json"), JSON.stringify(report, null, 2));
      console.log(JSON.stringify(report, null, 2));
      assert.deepEqual(errors, [], "Raw browser errors remain in report.json; no errors are excluded");
      return;
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const ExcelJS = require("../node_modules/exceljs");
    const downloads = [];
    for (const kind of ["user", "role"]) {
      phase = `${kind}-export`;
      await page.goto(`${frontend}/#/system/${kind}`);
      await page.getByRole("button", { name: "导出", exact: true }).click();
      const exportDialog = page.getByRole("dialog", { name: "导出数据" });
      await exportDialog.locator(".el-select").click();
      await page.getByRole("option", { name: "全量数据 (所有分页的数据)", exact: true }).click();
      const downloadPromise = page.waitForEvent("download").catch(() => null);
      const responsePromise = page.waitForResponse((response) =>
        response.url().endsWith(`/system/${kind}/export`)
      );
      await exportDialog.getByRole("button", { name: /^确\s*定$/ }).click();
      const response = await responsePromise;
      assert.equal(response.status(), 200);
      const download = await downloadPromise;
      assert.ok(download, "Expected an actual browser download");
      const output = path.join(artifacts, `${kind}-export.xlsx`);
      await download.saveAs(output);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(output);
      assert.ok(workbook.worksheets[0].rowCount >= 4);
      const headers = workbook.worksheets[0].getRow(1).values;
      assert.ok(headers.includes(kind === "user" ? "性别" : "角色名称"));
      assert.ok(!headers.some((header) => /password|密码/i.test(String(header))));
      downloads.push({
        kind,
        rows: workbook.worksheets[0].rowCount - 1,
        filename: `${kind}-export.xlsx`,
        realBackendResponse: true,
      });
    }
    phase = "role-close-guard";
    await page.getByRole("button", { name: "新增", exact: true }).click();
    const roleName = page.getByPlaceholder("请输入角色名称").last();
    await roleName.fill("未保存的验收草稿");
    const roleDialog = page.locator(".el-dialog").filter({ has: roleName });
    await roleDialog.getByRole("button", { name: "取消", exact: true }).click();
    await page.getByRole("button", { name: "继续编辑", exact: true }).click();
    assert.equal(await roleName.inputValue(), "未保存的验收草稿");
    await page.screenshot({
      path: path.join(artifacts, "role-draft-preserved.png"),
      fullPage: true,
    });
    await roleDialog.getByRole("button", { name: "取消", exact: true }).click();
    await page.getByRole("button", { name: "放弃修改", exact: true }).click();
    await roleDialog.waitFor({ state: "hidden" });
    fs.writeFileSync(
      path.join(artifacts, "export-guard-checkpoint.json"),
      JSON.stringify({ downloads, roleDraftPreserved: true, pageErrors: errors }, null, 2)
    );
    console.log("Real user/role downloads and unsaved role guard complete");
    const report = {
      passed: errors.length === 0,
      functionalScenariosPassed: true,
      scenarios: [
        "Enter login",
        "real attachment parsing",
        "stream stages/chunks/done",
        "busy send lock",
        "SQLite answer/citation persistence",
        "history citation restore",
        "mobile citation preview",
        "server-side cancellation without persisted partial answer",
        "real model failure and retry preserving a new draft",
        "real user/role Excel downloads",
        "unsaved role close/cancel/discard",
      ],
      downloads,
      events: events.filter((event) =>
        ["stage", "citations", "chunk", "done", "error", "cancelled"].includes(event.type)
      ),
      evidence: recovered,
      pageErrors: errors,
    };
    fs.writeFileSync(path.join(artifacts, "report.json"), JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify(
        {
          passed: report.passed,
          functionalScenariosPassed: true,
          scenarios: report.scenarios,
          evidence: recovered,
          downloads,
          pageErrors: errors,
          artifacts,
        },
        null,
        2
      )
    );
    assert.deepEqual(
      errors,
      [],
      "Functional scenarios passed, but raw browser errors remain in report.json; no errors are excluded"
    );
  } catch (error) {
    await page
      .screenshot({ path: path.join(artifacts, "failure.png"), fullPage: true })
      .catch(() => {});
    const layout = await page
      .locator(
        ".main-chat, .sidebar-panel, .center-panel, .evidence-panel, .chat-header, .chat-navbar"
      )
      .evaluateAll((elements) => ({
        media768: matchMedia("(width <= 768px)").matches,
        media1024: matchMedia("(width <= 1024px)").matches,
        elements: elements.map((element) => ({
          class: element.className,
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
          display: getComputedStyle(element).display,
          flexBasis: getComputedStyle(element).flexBasis,
          minWidth: getComputedStyle(element).minWidth,
          scopedAttributes: element
            .getAttributeNames()
            .filter((name) => name.startsWith("data-v-")),
        })),
      }));
    const failure = {
      passed: false,
      error: error.message,
      url: page.url().split("?")[0],
      visibleText: (await page.locator("body").innerText()).slice(0, 1500),
      artifacts,
      pageErrors: errors,
      layout,
      events: events.filter((event) => !["custom", "connected", "update"].includes(event.type)),
    };
    fs.writeFileSync(path.join(artifacts, "failure.json"), JSON.stringify(failure, null, 2));
    console.error(
      JSON.stringify(
        {
          passed: false,
          error: error.message.split("\n")[0],
          artifacts,
          pageErrors: errors,
          layout,
          fullEvidence: path.join(artifacts, "failure.json"),
        },
        null,
        2
      )
    );
    throw error;
  } finally {
    await browser.close();
  }
}

async function main(runCheck = run) {
  if (process.env.UX_E2E_EXTERNAL_SERVICES === "1") return runCheck();
  const root = path.resolve(__dirname, "../..");
  const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), "fastapiadmin-ux-e2e-"));
  const children = [];
  const logs = [];
  try {
    for (const port of [8009, 5179]) {
      await new Promise((resolve, reject) => {
        const probe = net.createServer();
        probe.once("error", () =>
          reject(
            new Error(`Acceptance port ${port} is occupied; refusing to reuse another service`)
          )
        );
        probe.listen(port, "127.0.0.1", () => probe.close(resolve));
      });
    }
    for (const [command, args, cwd, environment, name] of [
      [
        path.join(root, "backend/.venv/bin/python"),
        ["tests/ux_e2e_server.py"],
        path.join(root, "backend"),
        { UX_E2E_DIR: artifacts },
        "backend",
      ],
      [
        "pnpm",
        ["exec", "vite", "--host", "127.0.0.1", "--port", "5179", "--strictPort"],
        path.join(root, "frontend"),
        {
          BROWSER: "none",
          VITE_API_BASE_URL: "http://127.0.0.1:8009",
          VITE_APP_WS_ENDPOINT: "ws://127.0.0.1:8009",
          VITE_PORT: "5179",
        },
        "frontend",
      ],
    ]) {
      const log = fs.openSync(path.join(artifacts, `${name}.log`), "w");
      logs.push(log);
      const child = spawn(command, args, {
        cwd,
        detached: true,
        env: { ...process.env, ...environment },
        stdio: ["ignore", log, log],
      });
      children.push(child);
      child.on("error", () => {});
    }
    for (const url of ["http://127.0.0.1:8009/__ux_e2e/evidence", "http://127.0.0.1:5179"]) {
      let ready = false;
      for (let attempt = 0; attempt < 120; attempt += 1) {
        if (children.some((child) => child.exitCode !== null))
          throw new Error(`Acceptance service exited; see ${artifacts}`);
        try {
          ready = (await fetch(url)).ok;
        } catch {}
        if (ready) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (!ready) throw new Error(`Acceptance service did not become ready; see ${artifacts}`);
    }
    await runCheck();
  } finally {
    for (const child of children) {
      if (!child.pid) continue;
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {}
    }
    await Promise.all(
      children.map((child) =>
        child.exitCode !== null
          ? Promise.resolve()
          : new Promise((resolve) => {
              child.once("exit", resolve);
              setTimeout(() => {
                try {
                  process.kill(-child.pid, "SIGKILL");
                } catch {}
                resolve();
              }, 5000).unref();
            })
      )
    );
    for (const log of logs) fs.closeSync(log);
  }
}

module.exports = { runAcceptance: main };

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message.split("\n")[0]);
    process.exitCode = 1;
  });
}
