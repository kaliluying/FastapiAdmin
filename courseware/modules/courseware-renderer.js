import { teachingPlaybook, topLevelSections } from "./courseware-data.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTags(tags = []) {
  return `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function getEntityIndexLabel(route, days, activeDayId, activeEntity) {
  if (route === "program") {
    const dayIndex = Math.max(0, days.findIndex((day) => day.id === activeDayId));
    return `第 ${dayIndex + 1} 天`;
  }

  const sectionIndex = Math.max(0, topLevelSections.findIndex((section) => section.id === route));
  return `模块 ${sectionIndex + 1}`;
}

function getBreadcrumbLabel(route, days, activeDayId, activeEntity) {
  if (route === "program") {
    const dayIndex = Math.max(0, days.findIndex((day) => day.id === activeDayId));
    return `第 ${dayIndex + 1} 天`;
  }

  return `${getEntityIndexLabel(route, days, activeDayId, activeEntity)} · ${activeEntity.title}`;
}

function renderMiniList(items = [], className = "") {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function inferVisual(slide) {
  if (
    slide.visual?.steps?.length ||
    slide.visual?.layers?.length ||
    slide.visual?.groups?.length ||
    slide.visual?.columns?.length ||
    slide.visual?.participants?.length ||
    slide.visual?.messages?.length
  ) {
    return slide.visual;
  }

  const steps = (slide.demoSteps?.length ? slide.demoSteps : slide.points || []).slice(0, 4);
  return {
    title: "课堂图解",
    type: "flow",
    steps,
  };
}

function renderDiagramItems(items = [], className = "diagram-items") {
  return `<div class="${className}">
    ${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
  </div>`;
}

function renderArchitectureDiagram(visual) {
  return `<div class="diagram diagram-architecture">
    ${(visual.layers || [])
      .map(
        (layer, index) => `<section class="diagram-layer layer-${index + 1}">
          <div class="layer-label">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(layer.title)}</strong>
            ${layer.note ? `<em>${escapeHtml(layer.note)}</em>` : ""}
          </div>
          ${renderDiagramItems(layer.items || [])}
        </section>`,
      )
      .join("")}
  </div>`;
}

function renderCodeMapDiagram(visual) {
  return `<div class="diagram diagram-code-map">
    ${(visual.groups || [])
      .map(
        (group) => `<section class="code-map-group">
          <header>
            <span>${escapeHtml(group.label || "模块")}</span>
            <strong>${escapeHtml(group.title)}</strong>
          </header>
          ${renderDiagramItems(group.items || [], "code-map-files")}
        </section>`,
      )
      .join("")}
  </div>`;
}

function renderSequenceDiagram(visual) {
  return `<div class="diagram diagram-sequence">
    <div class="sequence-actors">
      ${(visual.participants || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
    <ol class="sequence-steps">
      ${(visual.messages || visual.steps || [])
        .map((message, index) => {
          const text = typeof message === "string" ? message : message.text;
          const from = typeof message === "string" ? "" : message.from;
          const to = typeof message === "string" ? "" : message.to;
          return `<li>
            <i>${String(index + 1).padStart(2, "0")}</i>
            <span>${from && to ? `${escapeHtml(from)} -> ${escapeHtml(to)}` : "链路节点"}</span>
            <strong>${escapeHtml(text)}</strong>
          </li>`;
        })
        .join("")}
    </ol>
  </div>`;
}

function renderPipelineDiagram(visual) {
  return `<div class="diagram diagram-pipeline">
    ${(visual.steps || [])
      .map(
        (step, index) => `<section class="pipeline-step">
          <i>${String(index + 1).padStart(2, "0")}</i>
          <strong>${escapeHtml(typeof step === "string" ? step : step.title)}</strong>
          ${typeof step === "string" || !step.detail ? "" : `<span>${escapeHtml(step.detail)}</span>`}
        </section>`,
      )
      .join("")}
  </div>`;
}

function renderMatrixDiagram(visual) {
  return `<div class="diagram diagram-matrix">
    ${(visual.columns || visual.groups || [])
      .map(
        (column) => `<section class="matrix-column">
          <strong>${escapeHtml(column.title)}</strong>
          ${renderDiagramItems(column.items || [])}
        </section>`,
      )
      .join("")}
  </div>`;
}

function renderVisualBoard(slide) {
  const visual = inferVisual(slide);
  const diagramMarkup =
    visual.type === "architecture"
      ? renderArchitectureDiagram(visual)
      : visual.type === "code-map"
        ? renderCodeMapDiagram(visual)
        : visual.type === "sequence"
          ? renderSequenceDiagram(visual)
          : visual.type === "pipeline"
            ? renderPipelineDiagram(visual)
            : visual.type === "matrix"
              ? renderMatrixDiagram(visual)
              : "";

  if (diagramMarkup) {
    return `<section class="visual-board visual-${escapeHtml(visual.type)} visual-diagram" aria-label="课堂图解">
      <div class="visual-header">
        <span>课堂图解</span>
        <strong>${escapeHtml(visual.title)}</strong>
      </div>
      ${diagramMarkup}
    </section>`;
  }

  return `<section class="visual-board visual-${escapeHtml(visual.type || "flow")}" aria-label="课堂图解">
    <div class="visual-header">
      <span>课堂图解</span>
      <strong>${escapeHtml(visual.title)}</strong>
    </div>
    <div class="visual-chain">
      ${visual.steps
        .map(
          (step, index) => `<div class="visual-node">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(step)}</strong>
          </div>${index < visual.steps.length - 1 ? '<i class="visual-connector"></i>' : ""}`,
        )
        .join("")}
    </div>
  </section>`;
}

function renderDeckPoints(slide) {
  const isPrimaryVisual = slide.visual?.priority === "primary";
  return `<ol class="deck-points ${isPrimaryVisual ? "deck-points-compact" : ""}">
    ${slide.points.map((point) => `<li><span>${escapeHtml(point)}</span></li>`).join("")}
  </ol>`;
}

function renderInsightCard(slide) {
  if (!slide.keyTakeaway) return "";
  return `<section class="insight-card">
    <span class="panel-kicker">关键结论</span>
    <p>${escapeHtml(slide.keyTakeaway)}</p>
  </section>`;
}

function renderDeepDive(slide) {
  if (!slide.deepDive?.length) return "";
  return `<section class="deep-dive" aria-label="讲课展开">
    ${slide.deepDive
      .slice(0, 3)
      .map(
        (item) => `<article>
          <span>${escapeHtml(item.label)}</span>
          <p>${escapeHtml(item.text)}</p>
        </article>`,
      )
      .join("")}
  </section>`;
}

function renderPromptCards(prompts = []) {
  if (!prompts.length) return "";
  return `<div class="prompt-card-list">
    ${prompts
      .map(
        (prompt, index) => `<div class="prompt-card">
          <p>${escapeHtml(prompt)}</p>
          <button class="prompt-copy" type="button" data-copy-prompt="${escapeHtml(prompt)}">复制 ${index + 1}</button>
        </div>`,
      )
      .join("")}
  </div>`;
}

function renderCodeRefs(codeRefs = []) {
  if (!codeRefs.length) {
    return `<p class="muted">当前页不需要打开代码文件。</p>`;
  }

  return `<ul class="code-list">
    ${codeRefs
      .map(
        ([file, desc]) => `<li>
          <i aria-hidden="true">${escapeHtml(file.split(".").pop()?.slice(0, 3).toUpperCase() || "REF")}</i>
          <div><code>${escapeHtml(file)}</code><span>${escapeHtml(desc)}</span></div>
        </li>`,
      )
      .join("")}
  </ul>`;
}

function renderChapterDrawer({ route, days, activeDayId, activeEntity, currentSlide }) {
  const routeItems = topLevelSections
    .map(
      (section) => `<button class="drawer-row ${section.id === route ? "active" : ""}" data-route="${escapeHtml(section.id)}">
        <strong>${escapeHtml(section.label)}</strong>
        <span>${escapeHtml(section.description)}</span>
      </button>`,
    )
    .join("");

  const dayItems =
    route === "program"
      ? `<div class="drawer-heading">四天课程</div>${days
          .map(
            (day) => `<button class="drawer-row ${day.id === activeDayId ? "active" : ""}" data-day="${escapeHtml(day.id)}">
              <strong>${escapeHtml(day.title)}</strong>
              <span>${day.slides.length} 个授课页 · ${day.tasks.length} 个课堂任务</span>
            </button>`,
          )
          .join("")}`
      : "";

  const slideItems = activeEntity.slides
    .map(
      (slide, index) => `<button class="drawer-row slide-jump ${index === currentSlide ? "active" : ""}" data-slide="${index}">
        <strong>${index + 1}. ${escapeHtml(slide.title)}</strong>
        <span>${escapeHtml(slide.time || "课堂讲解")}</span>
      </button>`,
    )
    .join("");

  return `<details class="chapter-drawer">
    <summary>目录</summary>
    <div class="drawer-panel">
      <div class="drawer-heading">模块</div>
      ${routeItems}
      ${dayItems}
      <div class="drawer-heading">当前页组</div>
      ${slideItems}
    </div>
  </details>`;
}

function renderFloatingNotes(activeEntity, slide) {
  const rescueTips = slide.rescueTips?.length ? slide.rescueTips : teachingPlaybook.rescueTips.slice(0, 2);
  return `<details class="floating-notes">
    <summary>备课</summary>
    <div class="notes-panel">
      <section>
        <h3>开场话术</h3>
        ${renderMiniList(slide.talkTrack || slide.teacherNotes)}
      </section>
      <section>
        <h3>课堂提问</h3>
        ${renderMiniList(slide.quickQuestions || [])}
      </section>
      <section>
        <h3>救场提醒</h3>
        ${renderMiniList(rescueTips)}
      </section>
      ${slide.aiPrompts?.length ? `<section><h3>AI 提示词</h3>${renderPromptCards(slide.aiPrompts)}</section>` : ""}
      ${slide.acceptance?.length ? `<section><h3>验收标准</h3>${renderMiniList(slide.acceptance)}</section>` : ""}
      <section>
        <h3>演示什么</h3>
        ${renderMiniList(slide.demoSteps)}
      </section>
      <section>
        <h3>代码入口</h3>
        ${renderCodeRefs(activeEntity.codeRefs)}
      </section>
    </div>
  </details>`;
}

function renderRailSlides(slides, currentSlide) {
  return `<ol class="rail-slide-list">
    ${slides
      .map(
        (item, slideIndex) => `<li>
          <button class="rail-slide ${slideIndex === currentSlide ? "active" : ""}" data-slide="${slideIndex}">
            <i>${slideIndex + 1}</i>
            <span>${escapeHtml(item.title)}</span>
          </button>
        </li>`,
      )
      .join("")}
  </ol>`;
}

function renderProgramRail(days, activeDayId, currentSlide) {
  const activeDayIndex = Math.max(0, days.findIndex((item) => item.id === activeDayId));

  return `<div class="program-rail">
    ${days
      .map((day, dayIndex) => {
        const isActive = day.id === activeDayId;
        const completed = isActive ? Math.min(currentSlide + 1, day.slides.length) : dayIndex < activeDayIndex ? day.slides.length : 0;
        return `<section class="rail-chapter ${isActive ? "active" : ""}">
          <button class="rail-chapter-head" data-day="${escapeHtml(day.id)}">
            <span></span>
            <strong>第${dayIndex + 1}天　${escapeHtml(day.title.replace(/^Day\s*\d+：?/, ""))}</strong>
            <em>${completed}/${day.slides.length}</em>
          </button>
          ${isActive ? renderRailSlides(day.slides, currentSlide) : ""}
        </section>`;
      })
      .join("")}
  </div>`;
}

function renderLectureStrip({ route, days, activeDayId, activeEntity, slide, index, total }) {
  const progress = Math.round(((index + 1) / total) * 100);
  const taskItems = activeEntity.tasks?.slice(0, 4) || [];
  const activeTaskCount = Math.ceil(((index + 1) / total) * taskItems.length);
  const outline =
    route === "program" && days.length
      ? renderProgramRail(days, activeDayId, index)
      : `<div class="single-rail">${renderRailSlides(activeEntity.slides, index)}</div>`;
  return `<aside class="lecture-strip">
    <div class="course-progress-card">
      <span>课程进度</span>
      <strong>${progress}%</strong>
      <div class="slide-progress" aria-label="当前页进度">
        <i style="width: ${progress}%"></i>
      </div>
    </div>
    <div class="strip-block outline-block">
      <span>课程目录</span>
      ${outline}
    </div>
    <div class="strip-block task-strip">
      <span>本页节奏</span>
      <ol class="rail-steps">
        ${taskItems
          .map(
            (item, taskIndex) => `<li class="${taskIndex < activeTaskCount ? "active" : ""}">
              <i></i><span>${escapeHtml(item)}</span>
            </li>`,
          )
          .join("")}
      </ol>
    </div>
    <div class="strip-block time-block">
      <span>当前讲授</span>
      <strong>${escapeHtml(slide.time || "课堂讲解")}</strong>
    </div>
  </aside>`;
}

function renderConceptPanel(activeEntity, slide) {
  const rescueTips = slide.rescueTips?.length ? slide.rescueTips : teachingPlaybook.rescueTips.slice(0, 1);
  return `<aside class="concept-panel">
    <div class="notes-title">
      <strong>教师讲解备注</strong>
      <span>课堂节奏 / 提问 / 资源</span>
    </div>
    ${renderInsightCard(slide)}
    <section class="talk-track">
      <span class="panel-kicker">开场话术</span>
      ${renderMiniList(slide.talkTrack || slide.teacherNotes)}
    </section>
    ${
      slide.classroomFlow?.length
        ? `<section class="classroom-flow">
          <span class="panel-kicker">课堂推进</span>
          ${renderMiniList(slide.classroomFlow)}
        </section>`
        : ""
    }
    <section class="question-panel">
      <span class="panel-kicker">课堂提问</span>
      ${renderMiniList(slide.quickQuestions || [])}
    </section>
    <section class="rescue-panel">
      <span class="panel-kicker">救场提醒</span>
      ${renderMiniList(rescueTips)}
    </section>
    ${
      slide.aiPrompts?.length
        ? `<section class="prompt-panel">
          <span class="panel-kicker">AI 提示词</span>
          ${renderPromptCards(slide.aiPrompts)}
        </section>`
        : ""
    }
    ${
      slide.acceptance?.length
        ? `<section class="acceptance-panel">
          <span class="panel-kicker">验收标准</span>
          ${renderMiniList(slide.acceptance)}
        </section>`
        : ""
    }
    <section>
      <span class="panel-kicker">演示</span>
      ${renderMiniList(slide.demoSteps, "demo-list")}
    </section>
    <section class="student-task-panel">
      <span class="panel-kicker">学生任务</span>
      <p>${escapeHtml(slide.practice)}</p>
    </section>
    <section>
      <span class="panel-kicker">代码入口</span>
      ${renderCodeRefs(activeEntity.codeRefs)}
    </section>
  </aside>`;
}

function renderDeckStage(slide, index, total, activeEntity, route, days, activeDayId) {
  const indexLabel = getEntityIndexLabel(route, days, activeDayId, activeEntity);
  const isPrimaryVisual = slide.visual?.priority === "primary";
  return `<article class="deck-stage" id="teaching-console">
    <div class="stage-grid">
      ${renderLectureStrip({ route, days, activeDayId, activeEntity, slide, index, total })}
      <section class="slide-canvas" aria-label="当前授课页">
        <div class="deck-title-block">
          <div class="slide-title-row">
            <span class="slide-symbol" aria-hidden="true">◎</span>
            <div>
              <span class="eyebrow">${escapeHtml(indexLabel)} · ${escapeHtml(activeEntity.title)}</span>
              <h1>${escapeHtml(slide.title)}</h1>
            </div>
          </div>
          ${renderTags(activeEntity.tags)}
        </div>
        ${isPrimaryVisual ? renderVisualBoard(slide) : ""}
        ${renderDeckPoints(slide)}
        ${renderDeepDive(slide)}
        ${isPrimaryVisual ? "" : renderVisualBoard(slide)}
        <div class="deck-actions">
          <button class="slide-action" data-prev-slide>上一页</button>
          <div class="slide-counter">${index + 1} / ${total}</div>
          <button class="slide-action primary" data-next-slide>下一页</button>
        </div>
      </section>
      ${renderConceptPanel(activeEntity, slide)}
    </div>
  </article>`;
}

function renderSlideDock(slides, currentSlide) {
  return `<nav class="slide-dock" aria-label="课件页缩略导航">
    ${slides
      .map(
        (slide, index) => `<button class="dock-card ${index === currentSlide ? "active" : ""}" data-slide="${index}">
          <i class="dock-preview" aria-hidden="true"><b></b><b></b><b></b></i>
          <span>${index + 1} / ${slides.length}</span>
          <strong>${escapeHtml(slide.title)}</strong>
          <em>${escapeHtml(slide.time || "课堂讲解")}</em>
        </button>`,
      )
      .join("")}
  </nav>`;
}

function renderSearchResults(results, query) {
  if (!query) return "";
  return `<section class="search-results">
    <div class="eyebrow">搜索结果</div>
    ${
      results.length
        ? results
            .map(
              (item) => `<button class="search-result" data-search-route="${escapeHtml(item.route)}" data-search-day="${escapeHtml(item.dayId || "")}" data-search-slide="${item.slideIndex}">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.context)}</span>
              </button>`,
            )
            .join("")
        : `<p>没有匹配的课程页。</p>`
    }
  </section>`;
}

export function renderDeckShell({ route, days, activeDayId, activeEntity, currentSlide, query = "", searchResults = [] }) {
  const slideIndex = Math.max(0, Math.min(currentSlide, activeEntity.slides.length - 1));
  const slide = activeEntity.slides[slideIndex];
  const indexLabel = getEntityIndexLabel(route, days, activeDayId, activeEntity);
  const breadcrumbLabel = getBreadcrumbLabel(route, days, activeDayId, activeEntity);

  return `<section class="deck-shell">
    <div class="deck-topline">
      ${renderChapterDrawer({ route, days, activeDayId, activeEntity, currentSlide: slideIndex })}
      <div class="deck-context">
        <span class="deck-breadcrumb">${escapeHtml(breadcrumbLabel)} <i></i> ${slideIndex + 1}. ${escapeHtml(slide.title)}</span>
        <strong>${escapeHtml(activeEntity.title)}</strong>
        <span>${escapeHtml(activeEntity.subtitle)}</span>
      </div>
      ${renderFloatingNotes(activeEntity, slide)}
    </div>
    ${renderSearchResults(searchResults, query)}
    ${renderDeckStage(slide, slideIndex, activeEntity.slides.length, activeEntity, route, days, activeDayId)}
    ${renderSlideDock(activeEntity.slides, slideIndex)}
  </section>`;
}

export function renderProgramSection(programSection, activeDay, currentSlide, days, query = "", searchResults = []) {
  return renderDeckShell({
    route: "program",
    days,
    activeDayId: activeDay.id,
    activeEntity: activeDay,
    currentSlide,
    query,
    searchResults,
  });
}

export function renderTopLevelSection(section, currentSlide, query = "", searchResults = []) {
  return renderDeckShell({
    route: section.id,
    days: [],
    activeDayId: "",
    activeEntity: section,
    currentSlide,
    query,
    searchResults,
  });
}

export function syncRouteButtons(documentRef, route) {
  documentRef.querySelectorAll("[data-route]").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === route);
  });
}
