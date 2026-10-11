const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

const root = path.resolve(__dirname, "../..");
const python = path.join(root, "backend/.venv/bin/python");
if (process.env.FASTCORE_OCR_RUNTIME) {
  const runtime = JSON.parse(fs.readFileSync(process.env.FASTCORE_OCR_RUNTIME, "utf8"));
  Object.assign(process.env, runtime.env);
  process.env.PATH = `${path.dirname(runtime.binary)}:${process.env.PATH}`;
}

async function run() {
  const backend = "http://127.0.0.1:8009";
  const frontend = "http://127.0.0.1:5179";
  const initial = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
  const artifacts = initial.artifacts;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const scenarios = [];
  const geometry = [];
  let accessToken;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      ["data:", "blob:"].includes(url.protocol)
      ? route.continue()
      : route.abort();
  });
  const api = async (endpoint, method = "GET", body) => {
    const response = await fetch(`${backend}/api/v1/ai/knowledge${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.equal(response.status, 200, `${method} ${endpoint}`);
    const result = await response.json();
    assert.equal(result.code, 0, result.msg);
    return result.data;
  };
  const inspect = (name) =>
    page
      .locator(".el-table__row")
      .filter({ hasText: name })
      .first()
      .getByRole("button", { name: "查看内容", exact: true })
      .click();
  const ready = async (id, name) => {
    let document;
    for (let attempt = 0; attempt < 300; attempt++) {
      const list = await api("/document/list?page_no=1&page_size=100");
      document = list.items.find((item) => item.id === id);
      if (document?.index_status === "failed")
        throw new Error(`Document failed: ${document.error_message}`);
      if (document?.index_status === "success") break;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    assert.equal(document?.index_status, "success");
    await page
      .locator(".el-table__row")
      .filter({ hasText: name })
      .first()
      .getByText("可检索", { exact: true })
      .waitFor({ timeout: 15000 });
    return document;
  };
  const upload = async (file, base) => {
    await page.getByRole("button", { name: "上传文档", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "上传文档", exact: true });
    const response = page.waitForResponse(
      (item) =>
        item.url().endsWith("/knowledge/document/upload") && item.request().method() === "POST"
    );
    await dialog.locator('input[type="file"]').setInputFiles(file);
    const payload = await (await response).json();
    assert.equal(payload.code, 0);
    assert.equal(payload.data.knowledge_base_id, base);
    await dialog.waitFor({ state: "hidden" });
    return ready(payload.data.id, path.basename(file));
  };
  try {
    await page.goto(frontend);
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("admin123");
    const login = page.waitForResponse((response) => response.url().endsWith("/system/auth/login"));
    await page.locator('input[name="password"]').press("Enter");
    accessToken = (await (await login).json()).data.access_token;
    assert.ok(accessToken);
    await page.locator(".el-menu-item").filter({ hasText: "AI 对话" }).waitFor({ timeout: 30000 });
    const skip = page.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
    const base = await api("/create", "POST", { name: "文档隔离验收", is_enabled: true });
    await page.goto(`${frontend}/#/ai/document?knowledge_base_id=${base.id}`);
    await page.getByRole("button", { name: "上传文档", exact: true }).waitFor();
    execFileSync(python, [
      "-c",
      `from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from docx import Document
import sys
out=Path(sys.argv[1])
font_candidates=[Path('/System/Library/Fonts/PingFang.ttc'),Path('/System/Library/Fonts/STHeiti Light.ttc'),Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')]
font_path=next((p for p in font_candidates if p.exists()),None)
if font_path is None: raise RuntimeError('Chinese font required for scanned fixture')
image=Image.new('RGB',(1800,600),'white')
draw=ImageDraw.Draw(image)
font=ImageFont.truetype(str(font_path),72)
draw.text((80,100),'扫描文档验收 中文内容',font=font,fill='black')
draw.text((80,270),'ORCHID7249 SCANNED DOCUMENT',font=font,fill='black')
image.save(out/'scanned.pdf','PDF',resolution=144)
doc=Document();doc.add_paragraph('BEFORETABLE7250')
table=doc.add_table(rows=2,cols=2);table.cell(0,0).text='品名';table.cell(0,1).text='价格';table.cell(1,0).text='TABLEMARKER7250';table.cell(1,1).text='88元'
doc.add_paragraph('AFTERTABLE7250');doc.save(out/'quotation.docx')
`,
      artifacts,
    ]);
    const longPath = path.join(artifacts, "long-source.txt");
    fs.writeFileSync(
      longPath,
      "ORIGINAL7192\n" +
        Array.from(
          { length: 90 },
          (_, index) =>
            `段落${index}：完整内容分页检查，不能截断正文。${"知识资料检查与维护。".repeat(25)}\n`
        ).join("") +
        "FINAL7193"
    );
    const original = await upload(longPath, base.id);
    assert.ok(original.chunk_count > 10);
    await inspect("long-source.txt");
    let dialog = page.getByRole("dialog", { name: "long-source.txt", exact: true });
    await dialog.locator("pre").first().waitFor();
    assert.match(await dialog.locator("pre").first().innerText(), /ORIGINAL7192/);
    const firstChunks = await api(`/document/${original.id}/chunks?page_no=1&page_size=10`);
    assert.equal(await dialog.locator("pre").count(), firstChunks.items.length);
    assert.equal(await dialog.locator("pre").first().innerText(), firstChunks.items[0].content);
    await dialog.locator(".btn-next").click();
    await dialog.getByRole("heading", { name: /^分块 10 / }).waitFor();
    const secondChunks = await api(`/document/${original.id}/chunks?page_no=2&page_size=10`);
    assert.equal(await dialog.locator("pre").first().innerText(), secondChunks.items[0].content);
    await page.screenshot({
      path: path.join(artifacts, "documents-chunks-desktop.png"),
      fullPage: true,
    });
    scenarios.push("real TXT upload/index/full chunk pagination");
    await dialog.getByRole("button", { name: "纠错全文", exact: true }).click();
    await page.waitForFunction(() =>
      document.querySelector(".el-dialog textarea")?.value.includes("FINAL7193")
    );
    await dialog
      .getByRole("textbox", { name: "文档全文" })
      .fill("CORRECTION7194 人工纠错后的正式正文。");
    await dialog.getByRole("button", { name: "保存纠错并重新索引", exact: true }).click();
    await page.getByRole("button", { name: "确定", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await ready(original.id, "long-source.txt");
    assert.equal(
      await api(`/document/${original.id}/content`),
      "CORRECTION7194 人工纠错后的正式正文。"
    );
    let result = await api("/retrieval/test", "POST", {
      query: "CORRECTION7194",
      knowledge_base_ids: [base.id],
      top_k: 5,
    });
    assert.ok(result.results.some((hit) => hit.content.includes("CORRECTION7194")));
    assert.ok(result.results.every((hit) => !hit.content.includes("ORIGINAL7192")));
    await inspect("long-source.txt");
    dialog = page.getByRole("dialog", { name: "long-source.txt", exact: true });
    const downloadPromise = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "下载原文件", exact: true }).click();
    const download = await downloadPromise;
    const downloaded = path.join(artifacts, "corrected-download.txt");
    await download.saveAs(downloaded);
    assert.equal(fs.readFileSync(downloaded, "utf8"), "CORRECTION7194 人工纠错后的正式正文。");
    scenarios.push("UI full text correction/reindex/retrieval/authenticated original download");
    const replacement = path.join(artifacts, "replaced.txt");
    fs.writeFileSync(replacement, "REPLACEMENT7195 全新替换正文。");
    await dialog.locator('input[type="file"]').setInputFiles(replacement);
    await page.getByRole("button", { name: "确定", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await ready(original.id, "replaced.txt");
    result = await api("/retrieval/test", "POST", {
      query: "REPLACEMENT7195",
      knowledge_base_ids: [base.id],
      top_k: 5,
    });
    assert.ok(result.results.some((hit) => hit.content.includes("REPLACEMENT7195")));
    assert.ok(result.results.every((hit) => !hit.content.includes("CORRECTION7194")));
    scenarios.push("UI file replacement retains document ID and replaces searchable content");
    const quote = await upload(path.join(artifacts, "quotation.docx"), base.id);
    const quoteText = await api(`/document/${quote.id}/content`);
    assert.ok(quoteText.indexOf("BEFORETABLE7250") < quoteText.indexOf("TABLEMARKER7250"));
    assert.ok(quoteText.indexOf("TABLEMARKER7250") < quoteText.indexOf("AFTERTABLE7250"));
    result = await api("/retrieval/test", "POST", {
      query: "TABLEMARKER7250",
      knowledge_base_ids: [base.id],
      top_k: 5,
    });
    assert.ok(result.results.some((hit) => hit.content.includes("TABLEMARKER7250")));
    scenarios.push("real DOCX table in paragraph order reaches SQL/BM25 retrieval");
    const scan = await upload(path.join(artifacts, "scanned.pdf"), base.id);
    const scannedText = await api(`/document/${scan.id}/content`);
    assert.match(scannedText.replace(/\s/g, ""), /ORCHID7249/);
    assert.match(scannedText.replace(/\s/g, ""), /扫描文档验收/);
    result = await api("/retrieval/test", "POST", {
      query: "ORCHID7249",
      knowledge_base_ids: [base.id],
      top_k: 5,
    });
    assert.ok(result.results.some((hit) => hit.content.replace(/\s/g, "").includes("ORCHID7249")));
    scenarios.push(
      "real bilingual bitmap PDF OCR via Poppler/Tesseract reaches SQL/BM25 retrieval"
    );
    await inspect("scanned.pdf");
    dialog = page.getByRole("dialog", { name: "scanned.pdf", exact: true });
    await dialog.locator("pre").waitFor();
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: width === 375 ? 844 : 1000 });
      await page.waitForTimeout(250);
      const audit = await page.evaluate(() => ({
        width: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
      }));
      const box = await dialog.boundingBox();
      audit.dialog = box && { left: box.x, right: box.x + box.width, width: box.width };
      assert.ok(audit.pageWidth <= width + 1, JSON.stringify(audit));
      assert.ok(
        audit.dialog && audit.dialog.left >= 0 && audit.dialog.right <= width + 1,
        JSON.stringify(audit)
      );
      geometry.push(audit);
      await page.screenshot({
        path: path.join(artifacts, `documents-ocr-${width}.png`),
        fullPage: false,
      });
    }
    const sql = JSON.parse(
      execFileSync(
        python,
        [
          "-c",
          "import sqlite3,json,sys; db=sqlite3.connect(sys.argv[1]); print(json.dumps({'documents':db.execute('select id,file_name,index_status,pending_file from ai_knowledge_document').fetchall(),'chunks':db.execute('select document_id,count(*) from ai_knowledge_chunk group by document_id').fetchall()}))",
          initial.database,
        ],
        { encoding: "utf8" }
      )
    );
    assert.equal(sql.documents.length, 3);
    assert.ok(sql.documents.every((item) => item[2] === "success" && item[3] == null));
    const final = await (await fetch(`${backend}/__ux_e2e/evidence`)).json();
    assert.equal(final.model_calls, 0);
    assert.deepEqual(errors, []);
    const report = {
      passed: true,
      scenarios,
      geometry,
      documents: sql,
      ocrText: scannedText,
      pageErrors: errors,
      boundary:
        "Real browser/auth/API/disposable SQLite/local BM25/Poppler/Tesseract; mock Redis; no production database or external model requests",
    };
    fs.writeFileSync(
      path.join(artifacts, "documents-results.json"),
      JSON.stringify(report, null, 2)
    );
    console.log(JSON.stringify({ passed: true, scenarios, artifacts, pageErrors: errors }));
  } catch (error) {
    await page
      .screenshot({ path: path.join(artifacts, "documents-failure.png"), fullPage: true })
      .catch(() => {});
    fs.writeFileSync(
      path.join(artifacts, "documents-results.json"),
      JSON.stringify(
        { passed: false, error: error.message, scenarios, pageErrors: errors },
        null,
        2
      )
    );
    throw error;
  } finally {
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
