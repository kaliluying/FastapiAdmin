const TASK_STORAGE_KEY = "fastcloud-courseware-tasks";
const THEME_STORAGE_KEY = "fastcloud-courseware-theme";

function safeParse(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function resolveStorage(storage) {
  return storage ?? globalThis.localStorage ?? null;
}

export function createCoursewareState(storage) {
  const resolvedStorage = resolveStorage(storage);

  return {
    route: "overview",
    activeDayId: "day1",
    currentSlide: 0,
    query: "",
    completedTasks: safeParse(resolvedStorage?.getItem(TASK_STORAGE_KEY), {}),
    theme: resolvedStorage?.getItem(THEME_STORAGE_KEY) || "",
  };
}

export function persistCompletedTasks(storage, completedTasks) {
  resolveStorage(storage)?.setItem(TASK_STORAGE_KEY, JSON.stringify(completedTasks));
}

export function persistTheme(storage, theme) {
  resolveStorage(storage)?.setItem(THEME_STORAGE_KEY, theme);
}
