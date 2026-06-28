const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = __dirname;
const htmlPath = path.join(root, "index.html");
const cssPath = path.join(root, "styles.css");
const mainPath = path.join(root, "main.js");
const dataPath = path.join(root, "modules", "courseware-data.js");
const statePath = path.join(root, "modules", "courseware-state.js");
const rendererPath = path.join(root, "modules", "courseware-renderer.js");
const controllerPath = path.join(root, "modules", "courseware-controller.js");
const displayAuditPath = path.join(root, "audit_courseware_display.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const file of [htmlPath, cssPath, mainPath, dataPath, statePath, rendererPath, controllerPath, displayAuditPath]) {
  assert(fs.existsSync(file), `${path.basename(file)} should exist`);
}

const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const main = fs.readFileSync(mainPath, "utf8");
const dataSource = fs.readFileSync(dataPath, "utf8");
const stateSource = fs.readFileSync(statePath, "utf8");
const rendererSource = fs.readFileSync(rendererPath, "utf8");
const controllerSource = fs.readFileSync(controllerPath, "utf8");
const displayAuditSource = fs.readFileSync(displayAuditPath, "utf8");

for (const forbidden of ["作业", "课后作业", "homework"]) {
  assert(!dataSource.includes(forbidden), `courseware should not show homework wording: ${forbidden}`);
  assert(!rendererSource.includes(forbidden), `courseware should not show homework wording: ${forbidden}`);
}

for (const forbidden of ["加载演讲稿", "完整讲稿", "原文摘录", "根据演讲稿生成", "loadManuscript", "renderMarkdown", "fetch(`./content"]) {
  assert(!dataSource.includes(forbidden), `courseware should not expose manuscript reader behavior: ${forbidden}`);
  assert(!rendererSource.includes(forbidden), `courseware should not expose manuscript reader behavior: ${forbidden}`);
}

for (const source of [html, css, rendererSource, controllerSource, dataSource]) {
  assert(!/[�锟鍔瀹鍘鏍鎼鐩鍥璇涓婁笅褰撶爜]/.test(source), "courseware shell should not contain mojibake or replacement characters");
}

for (const required of [
  "topLevelSections",
  "programDays",
  "aiBuildSection",
  "teachingPlaybook",
  "aiPrompts",
  "acceptance",
  "keyTakeaway",
  "classroomFlow",
  "visual",
  "deepDive",
]) {
  assert(dataSource.includes(required), `missing structured courseware data feature: ${required}`);
}

for (const required of [
  "检索、Prompt 构建、模型调用",
  "RAG 链路中的检索、Prompt 构建和模型调用",
  "文件上下文",
  "会话历史",
  "append_run_crud",
  "ChatQuerySchema.files",
  "backend/app/plugin/module_ai/chat/ws.py",
  "backend/app/plugin/module_ai/chat/schema.py",
  "backend/app/core/dependencies.py",
]) {
  assert(dataSource.includes(required), `courseware should reflect the updated backend project: ${required}`);
}

for (const teacherOnly of ["AgnoFactory", "platform_menu.json", "套餐、订单、支付、退款、发票、插件市场"]) {
  assert(!dataSource.includes(teacherOnly), `student-facing courseware should not expose teacher-only implementation history: ${teacherOnly}`);
}

for (const outdated of [
  "[\"apps/api/v1/controller.py\"",
  "[\"apps/api/service.py\"",
  "[\"utils/vector_kb.py\"",
]) {
  assert(!dataSource.includes(outdated), `top-level code refs should not point at old backend paths: ${outdated}`);
}

for (const required of ["courseware-app", "presentationToggle", "presentationExit", "type=\"module\"", "main.js", "data-route=\"build-lab\""]) {
  assert(html.includes(required), `missing app shell structure: ${required}`);
}

for (const required of [
  "command-bar",
  "deck-shell",
  "deck-stage",
  "stage-grid",
  "lecture-strip",
  "slide-progress",
  "concept-panel",
  "talk-track",
  "question-panel",
  "rescue-panel",
  "prompt-panel",
  "prompt-card",
  "prompt-copy",
  "acceptance-panel",
  "student-task-panel",
  "visual-board",
  "deep-dive",
  "visual-node",
  "visual-connector",
  "slide-symbol",
  "course-progress-card",
  "rail-steps",
  "notes-title",
  "dock-preview",
  "deck-breadcrumb",
  "insight-card",
  "code-list i",
  "checkpoint-grid",
  "classroom-flow",
  "presentation-exit",
  "floating-notes",
  "chapter-drawer",
  "slide-dock",
  "route-button",
]) {
  assert(css.includes(required), `missing layout styles: ${required}`);
}

for (const required of [
  "--slide-title-size",
  "--slide-point-size",
  "--deck-stage-height",
  "calc(100vh - 198px)",
  "clamp(30px, 3.2vw, 48px)",
  "clamp(16px, 1.25vw, 20px)",
  "font-size: clamp(40px, 4vw, 62px)",
  "font-size: clamp(20px, 1.65vw, 28px)",
  "height: var(--deck-stage-height)",
  "overflow-y: auto",
]) {
  assert(css.includes(required), `courseware should use compact teaching typography and viewport-fit layout: ${required}`);
}

for (const required of ["开场话术", "课堂提问", "救场提醒", "AI 提示词", "验收标准", "学生任务", "复制"]) {
  assert(rendererSource.includes(required), `renderer should expose visible label: ${required}`);
}

for (const required of ["data-copy-prompt", "copyPromptToClipboard", "copyPromptWithTextarea", "clipboard", "execCommand", "复制成功"]) {
  assert(controllerSource.includes(required), `controller should support prompt copy behavior: ${required}`);
}

assert(css.includes("@media"), "missing responsive CSS");
assert(main.includes("initializeCourseware"), "main entry should initialize controller");
assert(main.includes("courseware-controller.js"), "main entry should import controller");
assert(stateSource.includes("createCoursewareState"), "state module should expose state factory");
assert(rendererSource.includes("renderProgramSection"), "renderer should render program section");
assert(rendererSource.includes("renderDeckShell"), "renderer should render deck-first shell");
assert(rendererSource.includes("renderSlideDock"), "renderer should render slide dock");
assert(rendererSource.includes("renderVisualBoard"), "renderer should render a visual board for each slide");
assert(rendererSource.includes("renderInsightCard"), "renderer should render richer insight content");
assert(rendererSource.includes("renderTopLevelSection"), "renderer should render top-level sections");
assert(controllerSource.includes("build-lab"), "controller should support zero-to-one build lab route");
assert(controllerSource.includes("filterSlides"), "controller should support course search");
assert(controllerSource.includes("aiPrompts"), "course search should include AI prompts");
assert(controllerSource.includes("acceptance"), "course search should include acceptance criteria");
assert(controllerSource.includes("Escape"), "controller should let teachers exit presentation mode with Escape");
assert(displayAuditSource.includes("courseware-display-audit.json"), "display audit should write a reusable report");
assert(displayAuditSource.includes("text-horizontal-overflow"), "display audit should catch text overflow");
assert(displayAuditSource.includes('"day1", "day2", "day3", "day4"'), "display audit should iterate through every program day");

(async () => {
  const dataModule = await import(pathToFileURL(dataPath).href);
  const stateModule = await import(pathToFileURL(statePath).href);

  assert(Array.isArray(dataModule.topLevelSections), "topLevelSections should be an array");
  assert(dataModule.topLevelSections.length === 5, "should expose five top-level sections");
  assert(
    dataModule.topLevelSections.map((section) => section.id).join(",") === "overview,build-lab,program,tech-map,defense",
    "top-level section order should be overview, build-lab, program, tech-map, defense",
  );
  assert(dataModule.aiBuildSection.slides.length >= 8, "zero-to-one build lab should include enough implementation slides");

  for (const slide of dataModule.aiBuildSection.slides) {
    assert(slide.aiPrompts?.length >= 1, `${slide.title} should include AI collaboration prompts`);
    assert(slide.acceptance?.length >= 1, `${slide.title} should include acceptance criteria`);
    assert(slide.practice, `${slide.title} should include a student task`);
    assert(slide.keyTakeaway, `${slide.title} should include a key takeaway`);
    assert(slide.classroomFlow?.length >= 3, `${slide.title} should include a richer classroom flow`);
    assert(slide.visual?.steps?.length >= 3, `${slide.title} should include a visual teaching diagram`);
    assert(slide.deepDive?.length >= 3, `${slide.title} should include richer central teaching content`);
  }

  const state = stateModule.createCoursewareState();
  assert(state.route === "overview", "default route should be overview");
  assert(state.activeDayId === "day1", "default active day should be day1");

  console.log("structured courseware verified");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
