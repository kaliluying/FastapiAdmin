const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium, expect } = require("playwright/test");
const { runAcceptance } = require("./ux-e2e.cjs");

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function within(promise, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), 20000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const frontend = "http://127.0.0.1:5179";
  const backend = "http://127.0.0.1:8009";
  const evidence = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
  const artifacts = evidence.artifacts;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(20000);
  const checks = [];
  const pageErrors = [];
  const heldResponses = [];
  let phase = "login";
  page.on("pageerror", (error) => pageErrors.push({ phase, message: error.message }));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });

  const sidebar = page.locator(".sidebar-panel .sidebar");
  const input = page.locator(".message-input textarea");
  const messages = page.locator(".chat-messages");
  const row = (title) => sidebar.locator(".session-item").filter({ hasText: title });
  const listPattern = /\/ai\/chat\/list\?/;
  async function capture(name) {
    const filename = `audit-fixes-${name}.png`;
    await page.screenshot({ path: path.join(artifacts, filename), fullPage: true });
    return filename;
  }
  async function holdNext(pattern) {
    const captured = deferred();
    const release = deferred();
    const delivered = deferred();
    heldResponses.push(release);
    await page.route(
      pattern,
      async (route) => {
        try {
          const response = await route.fetch();
          assert.equal(response.status(), 200, "delayed response must come from the real app");
          const body = await response.body();
          captured.resolve({ status: response.status(), bytes: body.length });
          await release.promise;
          await route.fulfill({ response, body });
          delivered.resolve();
        } catch (error) {
          captured.resolve({ error: error.message });
          delivered.resolve({ error: error.message });
        }
      },
      { times: 1 }
    );
    return {
      async captured() {
        const result = await within(captured.promise, "capture real response");
        assert.ok(!result.error, result.error);
        return result;
      },
      async release() {
        release.resolve();
        const result = await within(delivered.promise, "deliver delayed response");
        assert.ok(!result?.error, result?.error);
        // Let the browser consume the fulfilled response and render its Vue update.
        await page.waitForTimeout(200);
      },
    };
  }
  async function send(question) {
    await expect(input).toBeEnabled();
    await input.fill(question);
    const response = page.waitForResponse(
      (item) => item.url().endsWith("/ai/chat/stream") && item.request().method() === "POST"
    );
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    const stream = await response;
    assert.equal(stream.status(), 200);
    const events = (await stream.text())
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => JSON.parse(line.slice(5).trim()));
    const done = events.find((event) => event.type === "done");
    assert.ok(done?.session_id, "real stream must confirm a persisted session");
    await expect(page.getByRole("button", { name: "停止生成" })).toHaveCount(0);
    await expect(messages).toContainText(question);
    await expect(messages).toContainText("隔离验收回答");
    return { id: done.session_id, sentSessionId: stream.request().postDataJSON().session_id };
  }
  async function create(title) {
    await sidebar.getByRole("button", { name: "开启新对话", exact: true }).click();
    const saved = await send(title);
    assert.equal(saved.sentSessionId, null);
    await expect(row(title)).toHaveCount(1);
    return saved.id;
  }
  async function select(title) {
    await row(title).locator(".session-select").click();
    await expect(input).toBeEnabled();
    await expect(messages).toContainText(title);
    await expect(row(title).locator(".session-select")).toHaveAttribute("aria-current", "true");
  }
  async function command(title, name) {
    await row(title).locator(".session-more").click();
    await page.locator(".el-dropdown-menu:visible").getByText(name, { exact: true }).click();
  }
  async function remove(title) {
    await command(title, "删除");
    const dialog = page.getByRole("dialog", { name: "确认删除", exact: true });
    await expect(dialog).toContainText("确定要删除此会话吗？");
    const response = page.waitForResponse(
      (item) => item.url().endsWith("/ai/chat/delete") && item.request().method() === "DELETE"
    );
    await dialog.getByRole("button", { name: "确定", exact: true }).click();
    assert.equal((await response).status(), 200);
    await expect(row(title)).toHaveCount(0);
    await expect(page.getByText("咨询对话已删除", { exact: true }).last()).toBeVisible();
  }
  async function rename(title, nextTitle) {
    await command(title, "重命名");
    const dialog = page.getByRole("dialog", { name: "重命名", exact: true });
    await dialog.locator("input").fill(nextTitle);
    const response = page.waitForResponse(
      (item) => /\/ai\/chat\/update\//.test(item.url()) && item.request().method() === "PUT"
    );
    await dialog.getByRole("button", { name: "确定", exact: true }).click();
    assert.equal((await response).status(), 200);
    await expect(row(title)).toHaveCount(0);
    await expect(row(nextTitle)).toHaveCount(1);
  }

  try {
    await page.goto(frontend);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    const login = page.waitForResponse((response) => response.url().endsWith("/system/auth/login"));
    await page.locator('input[name="password"]').press("Enter");
    assert.equal((await login).status(), 200);
    await page.locator(".home-workspace").waitFor({ timeout: 30000 });
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    await skip.waitFor({ timeout: 3000 }).catch(() => {});
    if (await skip.isVisible()) await skip.click();
    const chatMenu = page.locator(".el-menu-item").filter({ hasText: "AI 对话" });
    if (!(await chatMenu.isVisible())) {
      await page.locator(".el-sub-menu__title").filter({ hasText: "AI" }).click();
    }
    await chatMenu.click();
    await page.waitForURL("**/#/ai/chat");
    await expect(input).toBeVisible();
    await expect(sidebar).toContainText("暂无会话");
    checks.push({
      id: "navigation",
      status: "PASS",
      observation: "通过登录、工作台和 AI 对话菜单进入聊天；空态提示开始提问。",
    });

    phase = "normal-chat";
    const titleA = "AUDIT_A_正常会话";
    const titleB = "AUDIT_B_待删除";
    await create(titleA);
    const idB = await create(titleB);
    await select(titleA);
    checks.push({
      id: "normal-chat",
      status: "PASS",
      observation: "新对话收到本地模型回答并进入历史；点击历史恢复原问题和回答。",
      screenshot: await capture("normal-chat"),
    });

    for (const stage of ["detail", "feedback"]) {
      phase = `pending-delete-${stage}`;
      const title = stage === "detail" ? titleB : "AUDIT_FEEDBACK_待删除";
      const id = stage === "detail" ? idB : await create(title);
      if (stage === "feedback") await select(titleA);
      const delayed = await holdNext(
        stage === "detail"
          ? new RegExp(`/ai/chat/detail/${id}$`)
          : (url) =>
              url.pathname.endsWith("/ai/quality/feedback") &&
              url.searchParams.get("session_id") === id
      );
      await row(title).locator(".session-select").click();
      await delayed.captured();
      await expect(input).toBeDisabled();
      await remove(title);
      await expect(input).toBeEnabled();
      await delayed.release();
      await expect(messages.locator(".message-group")).toHaveCount(0);
      await expect(sidebar.locator('.session-select[aria-current="true"]')).toHaveCount(0);
      const screenshot = await capture(`pending-delete-${stage}`);
      const followup = await send(`AUDIT_${stage}_删除后发送`);
      assert.equal(followup.sentSessionId, null, "must not send to the deleted session");
      assert.notEqual(followup.id, id);
      await expect(row(title)).toHaveCount(0);
      checks.push({
        id: `pending-delete-${stage}`,
        status: "PASS",
        observation:
          "延迟真实响应期间删除待选会话，输入恢复可用；响应释放后消息区保持空白，下次发送创建新会话。",
        screenshot,
      });
    }

    phase = "list-reversed";
    const older = await holdNext(listPattern);
    await send("AUDIT_列表旧快照");
    await older.captured();
    const newer = await holdNext(listPattern);
    await sidebar.getByRole("button", { name: "开启新对话", exact: true }).click();
    const titleNewest = "AUDIT_NEW_最新会话";
    await send(titleNewest);
    await newer.captured();
    await newer.release();
    await expect(row(titleNewest)).toHaveCount(1);
    await older.release();
    await expect(row(titleNewest)).toHaveCount(1);
    checks.push({
      id: "list-reversed",
      status: "PASS",
      observation: "两个真实列表快照逆序返回，最新创建的会话仍保留在列表。",
      screenshot: await capture("list-reversed"),
    });

    phase = "delete-stale-list";
    const beforeDelete = await holdNext(listPattern);
    await send("AUDIT_删除前列表快照");
    await beforeDelete.captured();
    await remove(titleA);
    await beforeDelete.release();
    await expect(row(titleA)).toHaveCount(0);
    await expect(messages).toContainText(titleNewest);
    checks.push({
      id: "delete-stale-list",
      status: "PASS",
      observation: "删除完成后释放旧列表，会话保持已删除，当前对话内容保留。",
      screenshot: await capture("delete-stale-list"),
    });

    phase = "rename-stale-list";
    const beforeRename = await holdNext(listPattern);
    await send("AUDIT_改名前列表快照");
    await beforeRename.captured();
    const renamed = "AUDIT_RENAMED_新名称";
    await rename(titleNewest, renamed);
    await beforeRename.release();
    await expect(row(titleNewest)).toHaveCount(0);
    await expect(row(renamed)).toHaveCount(1);
    checks.push({
      id: "rename-stale-list",
      status: "PASS",
      observation: "通过会话操作菜单改名后释放旧列表，列表继续显示新名称。",
      screenshot: await capture("rename-stale-list"),
    });
    assert.deepEqual(pageErrors, [], "chat walkthrough must not produce browser exceptions");
    const finalEvidence = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
    assert.ok(finalEvidence.persisted_runs >= 8, "normal chat must persist real isolated runs");
    fs.writeFileSync(
      path.join(artifacts, "audit-fixes-results.json"),
      JSON.stringify(
        {
          passed: true,
          recordedAt: new Date().toISOString(),
          role: "隔离 admin 测试账号；AI 模拟普通用户走查，非真实首次用户研究",
          environment:
            "Chrome 1440x1000; temporary SQLite, in-memory Redis, deterministic local model",
          boundary:
            "只延迟真实本地响应，不替换业务数据；未覆盖移动端、生产数据库、外部模型和认证专项。",
          checks,
          pageErrors,
          persistedRuns: finalEvidence.persisted_runs,
          ports: [8009, 5179],
        },
        null,
        2
      )
    );
    console.log(JSON.stringify({ passed: true, checks: checks.length, artifacts }));
  } catch (error) {
    await capture("failure").catch(() => {});
    fs.writeFileSync(
      path.join(artifacts, "audit-fixes-results.json"),
      JSON.stringify(
        { passed: false, phase, error: error.message, checks, pageErrors, artifacts },
        null,
        2
      )
    );
    console.error(JSON.stringify({ passed: false, phase, error: error.message, artifacts }));
    throw error;
  } finally {
    for (const held of heldResponses) held.resolve();
    await browser.close();
  }
}

if (require.main === module) {
  console.log("Chat-only isolated acceptance will occupy 127.0.0.1:8009 and :5179 until cleanup.");
  runAcceptance(run)
    .then(() => console.log("Chat acceptance finished; harness released ports 8009 and 5179."))
    .catch((error) => {
      console.error(error.message.split("\n")[0]);
      process.exitCode = 1;
    });
}
