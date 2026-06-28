import {
  aiBuildSection,
  defenseSection,
  overviewSection,
  programDays,
  programSection,
  techMapSection,
} from "./courseware-data.js?v=20260627-fullstack2";
import { createCoursewareState, persistCompletedTasks, persistTheme } from "./courseware-state.js?v=20260627-fullstack2";
import {
  renderProgramSection,
  renderTopLevelSection,
  syncRouteButtons,
} from "./courseware-renderer.js?v=20260627-fullstack2";

const topLevelMap = {
  overview: overviewSection,
  "build-lab": aiBuildSection,
  "tech-map": techMapSection,
  defense: defenseSection,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getActiveDay(state) {
  return programDays.find((day) => day.id === state.activeDayId) || programDays[0];
}

function getActiveEntity(state) {
  return state.route === "program" ? getActiveDay(state) : topLevelMap[state.route] || overviewSection;
}

function filterSlides(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const matches = [];
  const scan = (entity, route, dayId = "") => {
    entity.slides.forEach((slide, slideIndex) => {
      const haystack = [
        entity.title,
        slide.title,
        slide.time,
        ...slide.points,
        ...slide.teacherNotes,
        ...(slide.talkTrack || []),
        ...(slide.quickQuestions || []),
        ...(slide.rescueTips || []),
        ...(slide.aiPrompts || []),
        ...(slide.acceptance || []),
        ...slide.demoSteps,
        slide.practice,
      ]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(normalized)) {
        matches.push({
          route,
          dayId,
          slideIndex,
          title: slide.title,
          context: route === "program" ? entity.title : topLevelMap[route]?.title || entity.title,
        });
      }
    });
  };

  scan(overviewSection, "overview");
  scan(aiBuildSection, "build-lab");
  programDays.forEach((day) => scan(day, "program", day.id));
  scan(techMapSection, "tech-map");
  scan(defenseSection, "defense");
  return matches.slice(0, 8);
}

function scrollToTop(windowRef) {
  windowRef?.scrollTo?.({ top: 0, behavior: "smooth" });
}

function setTemporaryButtonLabel(button, label, windowRef) {
  if (!button) {
    return;
  }

  const originalLabel = button.textContent || "";
  button.textContent = label;
  windowRef.setTimeout?.(() => {
    button.textContent = originalLabel;
  }, 1200);
}

function copyPromptWithTextarea(text, documentRef) {
  const textArea = documentRef.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  documentRef.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const copied = documentRef.execCommand?.("copy") !== false;
  textArea.remove();
  return copied;
}

async function copyPromptToClipboard(text, button, documentRef, windowRef) {
  if (!text) {
    return;
  }

  let copied = false;

  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    try {
      copied = copyPromptWithTextarea(text, documentRef);
    } catch {
      copied = false;
    }
  }

  setTemporaryButtonLabel(button, copied ? "复制成功" : "复制失败", windowRef);
}

export function initializeCourseware({
  documentRef = document,
  windowRef = window,
  storage = globalThis.localStorage ?? null,
} = {}) {
  const state = createCoursewareState(storage);
  const app = documentRef.getElementById("courseware-app");
  const content = documentRef.getElementById("content");
  const courseSearch = documentRef.getElementById("courseSearch");
  const presentationToggle = documentRef.getElementById("presentationToggle");
  const presentationExit = documentRef.getElementById("presentationExit");
  const themeToggle = documentRef.getElementById("themeToggle");

  function render() {
    const activeEntity = getActiveEntity(state);
    const activeDay = getActiveDay(state);
    const searchResults = filterSlides(state.query);

    content.innerHTML =
      state.route === "program"
        ? renderProgramSection(programSection, activeDay, state.currentSlide, programDays, state.query, searchResults)
        : renderTopLevelSection(activeEntity, state.currentSlide, state.query, searchResults);

    syncRouteButtons(documentRef, state.route);
    documentRef.documentElement.dataset.theme = state.theme;
    content.focus({ preventScroll: true });
    if (courseSearch && courseSearch.value !== state.query) {
      courseSearch.value = state.query;
    }
  }

  function selectRoute(route) {
    if (!route) {
      return;
    }

    state.route = route;
    state.currentSlide = 0;
    render();
    scrollToTop(windowRef);
  }

  function selectDay(dayId) {
    const matchedDay = programDays.find((day) => day.id === dayId);
    if (!matchedDay) {
      return;
    }

    state.route = "program";
    state.activeDayId = matchedDay.id;
    state.currentSlide = 0;
    render();
    scrollToTop(windowRef);
  }

  function goToSlide(index) {
    const slides = getActiveEntity(state).slides;
    state.currentSlide = clamp(index, 0, slides.length - 1);
    render();
    documentRef.getElementById("teaching-console")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleTask(index, checked) {
    const entity = getActiveEntity(state);
    const completed = new Set(state.completedTasks[entity.id] || []);

    if (checked) completed.add(index);
    else completed.delete(index);

    state.completedTasks[entity.id] = [...completed].sort((left, right) => left - right);
    persistCompletedTasks(storage, state.completedTasks);
    render();
  }

  function selectSearchResult(route, dayId, slideIndex) {
    state.route = route;
    if (dayId) state.activeDayId = dayId;
    state.currentSlide = Number(slideIndex) || 0;
    state.query = "";
    render();
    scrollToTop(windowRef);
  }

  documentRef.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy-prompt]");
    if (copyButton) {
      copyPromptToClipboard(copyButton.dataset.copyPrompt, copyButton, documentRef, windowRef);
      return;
    }

    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      selectRoute(routeButton.dataset.route);
      return;
    }

    const dayButton = event.target.closest("[data-day]");
    if (dayButton) {
      selectDay(dayButton.dataset.day);
      return;
    }

    const slideButton = event.target.closest("[data-slide]");
    if (slideButton) {
      goToSlide(Number(slideButton.dataset.slide));
      return;
    }

    if (event.target.closest("[data-prev-slide]")) {
      goToSlide(state.currentSlide - 1);
      return;
    }

    if (event.target.closest("[data-next-slide]")) {
      goToSlide(state.currentSlide + 1);
      return;
    }

    const searchResult = event.target.closest("[data-search-route]");
    if (searchResult) {
      selectSearchResult(searchResult.dataset.searchRoute, searchResult.dataset.searchDay, searchResult.dataset.searchSlide);
    }
  });

  documentRef.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-task]");
    if (checkbox) {
      toggleTask(Number(checkbox.dataset.task), checkbox.checked);
    }
  });

  function setPresentationMode(enabled) {
    app.classList.toggle("presentation", enabled);
    presentationToggle?.classList.toggle("active", enabled);
  }

  documentRef.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown") goToSlide(state.currentSlide + 1);
    if (event.key === "ArrowLeft" || event.key === "PageUp") goToSlide(state.currentSlide - 1);
    if (event.key === "Escape") setPresentationMode(false);
  });

  courseSearch?.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  presentationToggle.addEventListener("click", (event) => {
    setPresentationMode(!app.classList.contains("presentation"));
  });

  presentationExit?.addEventListener("click", () => {
    setPresentationMode(false);
  });

  themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "" : "dark";
    documentRef.documentElement.dataset.theme = state.theme;
    persistTheme(storage, state.theme);
  });

  render();

  return {
    filterSlides,
    goToSlide,
    selectDay,
    selectRoute,
  };
}
