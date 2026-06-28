const fs = require("fs");
const path = require("path");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "frontend-demo.html"), "utf8");
const css = fs.readFileSync(path.join(root, "frontend-demo.css"), "utf8");
const js = fs.readFileSync(path.join(root, "frontend-demo.js"), "utf8");
const visibleSource = `${html}\n${js}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const required of [
  "AI 劳动仲裁辅助系统",
  "智能咨询",
  "证据上传",
  "证据分析",
  "生成仲裁申请书",
  "案件列表",
  "检索依据",
  "证据材料",
  "系统状态",
]) {
  assert(visibleSource.includes(required), `frontend demo should include visible label: ${required}`);
}

for (const tab of ['data-tab="consult"', 'data-tab="upload"', 'data-tab="analysis"', 'data-tab="document"']) {
  assert(html.includes(tab), `frontend demo should include tab hook: ${tab}`);
}

for (const requiredClass of [
  ".topbar",
  ".feature-tabs",
  ".case-panel",
  ".main-stage",
  ".side-stage",
  ".chat-panel",
  ".answer-card",
  ".upload-workbench",
  ".drop-zone",
  ".evidence-table",
  ".analysis-dashboard",
  ".score-grid",
  ".proof-map",
  ".document-editor",
  ".document-preview",
  ".citation-item",
  ".upload-box",
  ".status-bar",
]) {
  assert(css.includes(requiredClass), `frontend demo should style ${requiredClass}`);
}

for (const requiredBehavior of [
  "renderConsult",
  "renderUpload",
  "renderAnalysis",
  "renderDocument",
  "setActiveTab",
  "renderCases",
  "renderCitations",
  "renderEvidenceMini",
]) {
  assert(js.includes(requiredBehavior), `frontend demo should implement ${requiredBehavior}`);
}

for (const forbidden of ["FastCloud", "作业", "homework"]) {
  assert(!html.includes(forbidden), `frontend demo should not include forbidden html word: ${forbidden}`);
  assert(!js.includes(forbidden), `frontend demo should not include forbidden js word: ${forbidden}`);
}

console.log("frontend demo verified");
