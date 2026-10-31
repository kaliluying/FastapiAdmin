import { computed, ref } from "vue";
import type { LocationQueryRaw } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { refreshAppCaches, useWorktabStore } from "@stores";
import type { MenuItemType } from "@/components/others/fa-menu-right/index.vue";
import { useCommon } from "@/hooks/core/useCommon";
import { formatMenuTitle, quickStartManager } from "@utils";
import type { WorkTab } from "@/types";

export type TabCloseType = "current" | "left" | "right" | "other" | "all";

interface WorkTabActionsOptions {
  /** 关闭标签后重算横向位置（由滚动逻辑提供） */
  adjustPositionAfterClose: () => void;
}

/**
 * 工作栏标签的交互操作
 * 负责：切换/关闭标签、右键菜单项与选中处理、收藏标签、刷新缓存
 */
export function useWorkTabActions({ adjustPositionAfterClose }: WorkTabActionsOptions) {
  const { t } = useI18n();
  const store = useWorktabStore();
  const route = useRoute();
  const router = useRouter();
  const { currentRoute } = router;

  /** 右键菜单当前指向的标签路径 */
  const clickedPath = ref("");
  const menuRef = ref<{ show: (e: MouseEvent) => void }>();

  const list = computed(() => store.opened);
  const activeTab = computed(() => currentRoute.value.path);
  const quickLinksRevision = ref(0);

  function clickTab(item: WorkTab): void {
    router.push({
      path: item.path,
      query: item.query as LocationQueryRaw,
    });
  }

  function closeWorktab(type: TabCloseType, tabPath: string): void {
    const path = typeof tabPath === "string" ? tabPath : route.path;

    const closeActions = {
      current: () => store.removeTab(path),
      left: () => store.removeLeft(path),
      right: () => store.removeRight(path),
      other: () => store.removeOthers(path),
      all: () => store.removeAll(),
    };

    closeActions[type]?.();

    setTimeout(() => {
      adjustPositionAfterClose();
    }, 100);
  }

  function onMiddleClickClose(item: WorkTab): void {
    if (!item.fixedTab && list.value.length > 1) {
      closeWorktab("current", item.path);
    }
  }

  function showMenu(e: MouseEvent, path?: string): void {
    clickedPath.value = path || "";
    menuRef.value?.show(e);
    e.preventDefault();
    e.stopPropagation();
  }

  function getClickedTabInfo() {
    const clickedIndex = list.value.findIndex((tab) => tab.path === clickedPath.value);
    return {
      clickedIndex,
      currentTab: list.value[clickedIndex],
      isLastTab: clickedIndex === list.value.length - 1,
      isOneTab: list.value.length === 1,
      isCurrentTab: clickedPath.value === activeTab.value,
    };
  }

  function checkTabsFixedStatus(clickedIndex: number) {
    const leftTabs = list.value.slice(0, clickedIndex);
    const rightTabs = list.value.slice(clickedIndex + 1);
    const otherTabs = list.value.filter((_, index) => index !== clickedIndex);

    return {
      areAllLeftTabsFixed: leftTabs.length > 0 && leftTabs.every((tab) => tab.fixedTab),
      areAllRightTabsFixed: rightTabs.length > 0 && rightTabs.every((tab) => tab.fixedTab),
      areAllOtherTabsFixed: otherTabs.length > 0 && otherTabs.every((tab) => tab.fixedTab),
      areAllTabsFixed: list.value.every((tab) => tab.fixedTab),
    };
  }

  const menuItems = computed(() => {
    const { clickedIndex, currentTab, isLastTab, isOneTab, isCurrentTab } = getClickedTabInfo();
    const fixedStatus = checkTabsFixedStatus(clickedIndex);

    return [
      {
        key: "refresh",
        label: t("worktab.btn.refresh"),
        icon: "ri:refresh-line",
        disabled: !isCurrentTab,
      },
      {
        key: "fixed",
        label: currentTab?.fixedTab ? t("worktab.btn.unfixed") : t("worktab.btn.fixed"),
        icon: "ri:pushpin-2-line",
        disabled: false,
        showLine: true,
      },
      {
        key: "current",
        label: t("worktab.btn.closeCurrent"),
        icon: "ri:close-line",
        disabled: !!currentTab?.fixedTab,
      },
      {
        key: "left",
        label: t("worktab.btn.closeLeft"),
        icon: "ri:arrow-left-s-line",
        disabled: clickedIndex === 0 || fixedStatus.areAllLeftTabsFixed,
      },
      {
        key: "right",
        label: t("worktab.btn.closeRight"),
        icon: "ri:arrow-right-s-line",
        disabled: isLastTab || fixedStatus.areAllRightTabsFixed,
      },
      {
        key: "other",
        label: t("worktab.btn.closeOther"),
        icon: "ri:close-fill",
        disabled: isOneTab || fixedStatus.areAllOtherTabsFixed,
      },
      {
        key: "all",
        label: t("worktab.btn.closeAll"),
        icon: "ri:close-circle-line",
        disabled: isOneTab || fixedStatus.areAllTabsFixed,
      },
    ];
  });

  function handleSelect(item: MenuItemType): void {
    const { key } = item;

    if (key === "refresh") {
      useCommon().refresh();
      return;
    }

    if (key === "fixed") {
      store.toggleFixedTab(clickedPath.value);
      return;
    }

    const activeIndex = list.value.findIndex((tab) => tab.path === activeTab.value);
    const clickedIndex = list.value.findIndex((tab) => tab.path === clickedPath.value);

    const navigationRules = {
      left: activeIndex < clickedIndex,
      right: activeIndex > clickedIndex,
      other: true,
    } as const;

    const shouldNavigate = navigationRules[key as keyof typeof navigationRules];

    if (shouldNavigate) {
      const dest = list.value.find((tab) => tab.path === clickedPath.value);
      if (dest) {
        router.push({
          path: dest.path,
          query: dest.query as LocationQueryRaw,
        });
      } else {
        router.push(clickedPath.value);
      }
    }

    closeWorktab(key as TabCloseType, clickedPath.value);
  }

  // ---- 快捷收藏 ----
  function bookmarkHref(item: WorkTab): string {
    const q = item.query as LocationQueryRaw | undefined;
    if (!q || !Object.keys(q).length) return item.path;
    const sp = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
      else sp.set(k, String(v));
    });
    const s = sp.toString();
    return s ? `${item.path}?${s}` : item.path;
  }

  function isQuickLinkBookmarked(item: WorkTab): boolean {
    void quickLinksRevision.value;
    return quickStartManager.isLinkExists(bookmarkHref(item));
  }

  function toggleQuickBookmark(item: WorkTab): void {
    const href = bookmarkHref(item);
    const title = item.customTitle || formatMenuTitle(item.title);
    try {
      if (quickStartManager.isLinkExists(href)) {
        quickStartManager.removeQuickLinkByHref(href);
        ElMessage.success(t("worktab.bookmarkRemoved"));
      } else {
        const link = quickStartManager.createQuickLinkFromRoute(
          { ...item, title, fullPath: href, path: item.path },
          title
        );
        link.href = href;
        if (quickStartManager.addQuickLink(link)) {
          ElMessage.success(t("worktab.bookmarkAdded"));
        }
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(t("worktab.bookmarkFail"));
    }
  }

  function onQuickLinksChanged(): void {
    quickLinksRevision.value++;
  }

  // ---- 缓存刷新 ----
  async function handleRefreshCache(): Promise<void> {
    try {
      await refreshAppCaches();
      useCommon().refresh();
      ElMessage.success(t("worktab.refreshCacheDone"));
    } catch (e) {
      console.error(e);
      ElMessage.error(t("worktab.refreshCacheFail"));
    }
  }

  return {
    menuRef,
    menuItems,
    list,
    activeTab,
    clickedPath,
    clickTab,
    closeWorktab,
    onMiddleClickClose,
    showMenu,
    handleSelect,
    isQuickLinkBookmarked,
    toggleQuickBookmark,
    onQuickLinksChanged,
    handleRefreshCache,
  };
}
