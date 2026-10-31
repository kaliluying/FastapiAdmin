<!-- 三种模式：tab-default / tab-card / tab-google -->
<template>
  <div
    v-if="showWorkTab"
    class="worktab-tags-shell fa-worktab-shell box-border w-full select-none"
    :class="[
      /** 三种模式统一底边线；谷歌模式底边与标签贴合，默认/卡片需要与底边留出间距（避免重合） */
      'border-b border-(--fa-card-border)',
      tabStyle === 'tab-google' ? 'worktab-tags-shell--google pt-1 pb-0' : 'py-1',
    ]"
  >
    <div
      class="worktab-tags-bar flex items-stretch gap-0 w-full min-h-8"
      :class="chromeTabStrip ? 'worktab-tags-bar--google' : ''"
    >
      <button
        v-if="tabOverflow"
        type="button"
        class="worktab-bar-btn worktab-bar-cell worktab-bar-cell--sep-r"
        :title="t('worktab.scrollLeft')"
        @click="scrollTabs(SCROLL_STEP)"
      >
        <FaSvgIcon icon="ri:arrow-left-double-line" class="text-lg text-current" />
      </button>

      <div
        class="worktab-scroll-wrap flex flex-1 min-w-0 items-center overflow-hidden"
        ref="scrollRef"
      >
        <ul
          class="float-left whitespace-nowrap bg-transparent! flex"
          :class="[chromeTabStrip ? 'pl-1' : '']"
          ref="tabsRef"
          :style="{
            transform: `translateX(${scrollState.translateX}px)`,
            transition: `${scrollState.transition}`,
          }"
        >
          <li
            class="worktab-tab fa-card-xs inline-flex flex items-center justify-center h-8 mr-1.5 text-xs cursor-pointer hover:text-theme group"
            :class="[
              item.path === activeTab
                ? chromeTabStrip
                  ? 'activ-tab'
                  : 'activ-tab text-theme!'
                : chromeTabStrip
                  ? ''
                  : 'text-g-600 dark:text-g-800',
              isCardTabs ? 'worktab-tab--card' : '',
              chromeTabStrip ? 'google-tab relative h-8! leading-8! border-none!' : '',
            ]"
            :style="
              tabStyle === 'tab-google'
                ? {
                    padding: item.fixedTab ? '0 10px' : '0 8px 0 12px',
                    borderRadius: 'calc(var(--custom-radius) / 2.5 + 4px)',
                  }
                : {
                    padding: item.fixedTab ? '0 10px' : '0 8px 0 12px',
                    borderRadius: 'calc(var(--custom-radius) / 2.5 + 2px)',
                  }
            "
            v-for="(item, index) in list"
            :key="item.path"
            :ref="item.path"
            :id="`scroll-li-${index}`"
            @click="clickTab(item)"
            @click.middle.prevent="onMiddleClickClose(item)"
            @contextmenu.prevent="(e: MouseEvent) => showMenu(e, item.path)"
          >
            <button
              type="button"
              class="worktab-star focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--el-color-primary) focus-visible:ring-offset-1 rounded"
              :class="{ 'worktab-star--on': isQuickLinkBookmarked(item) }"
              :title="
                isQuickLinkBookmarked(item) ? t('worktab.bookmarkRemove') : t('worktab.bookmarkAdd')
              "
              @click.prevent.stop="toggleQuickBookmark(item)"
            >
              <FaSvgIcon
                :icon="isQuickLinkBookmarked(item) ? 'ri:star-fill' : 'ri:star-line'"
                class="text-sm"
              />
            </button>
            <FaSvgIcon
              v-show="item.icon"
              :icon="item.icon"
              class="text-base mr-1 shrink-0 group-hover:text-theme"
              :class="[
                item.path === activeTab ? 'text-theme' : '',
                chromeTabStrip ? 'google-tab-route-icon' : 'text-g-600',
              ]"
            />
            {{ item.customTitle || formatMenuTitle(item.title) }}
            <FaSvgIcon
              v-if="item.fixedTab"
              icon="ri:pushpin-2-fill"
              class="worktab-pin shrink-0 text-sm ml-0.5"
            />
            <span
              v-if="list.length > 1 && !item.fixedTab"
              class="worktab-close inline-flex flex items-center justify-center relative ml-0.5 rounded-full p-1 transition duration-200"
              @click.stop="closeWorktab('current', item.path)"
            >
              <FaSvgIcon icon="ri:close-large-fill" class="text-[10px]" />
            </span>
            <div
              v-if="chromeTabStrip && showGoogleTabDivider(index)"
              class="worktab-google-divider"
              aria-hidden="true"
            />
          </li>
        </ul>
      </div>

      <!-- 竖线分格：用 scoped CSS 画线；divide-x 会被 .worktab-bar-btn { border:none } 盖掉 -->
      <div class="worktab-toolbar-end flex shrink-0 items-stretch" aria-label="tab-toolbar-actions">
        <button
          v-if="tabOverflow"
          type="button"
          class="worktab-bar-btn worktab-bar-cell"
          :title="t('worktab.scrollRight')"
          @click="scrollTabs(-SCROLL_STEP)"
        >
          <FaSvgIcon icon="ri:arrow-right-double-line" class="text-lg text-current" />
        </button>

        <button
          type="button"
          class="worktab-bar-btn worktab-bar-cell"
          :title="t('navbar.refreshCache')"
          @click="handleRefreshCache"
        >
          <FaSvgIcon icon="ri:loop-right-line" class="text-base text-current" />
        </button>

        <button
          type="button"
          class="worktab-bar-btn worktab-bar-cell"
          :title="t('worktab.menuMore')"
          @click="(e: MouseEvent) => showMenu(e, activeTab)"
        >
          <FaSvgIcon icon="ri:apps-2-line" class="text-base text-current" />
        </button>
      </div>
    </div>

    <FaMenuRight
      ref="menuRef"
      :menu-items="menuItems"
      :menu-width="140"
      :border-radius="10"
      @select="handleSelect"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 工作栏标签页组件：多标签导航 + 右键菜单 + KeepAlive 缓存管理。
 *
 * 三种模式（通过 settingStore.tabStyle 切换）：
 *   tab-default  —— 默认模式，独立标签卡
 *   tab-card     —— 卡片模式，标签有圆角边框
 *   tab-google   —— 谷歌模式，连体标签
 *
 * 核心流程：路由切换 → setWorktab (utils/navigation) 同步 → 本组件响应式渲染。
 * 关闭/切换/固定操作全部通过 worktabStore 管理；滚动见 composables/useWorkTabScroll，
 * 标签操作与右键菜单见 composables/useWorkTabActions。
 */
import { computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useSettingsStore, useUserStore } from "@stores";
import { formatMenuTitle, quickStartManager } from "@utils";
import { SCROLL_STEP, useWorkTabScroll } from "./composables/useWorkTabScroll";
import { useWorkTabActions } from "./composables/useWorkTabActions";

defineOptions({ name: "FaWorkTab" });

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const { currentRoute } = router;
const settingStore = useSettingsStore();
const { tabStyle, showWorkTab } = storeToRefs(settingStore);

/** tab-google：Chrome 顶栏标签（tab-default / tab-card 走原有样式） */
const chromeTabStrip = computed(() => tabStyle.value === "tab-google");
const isCardTabs = computed(() => tabStyle.value === "tab-card");

const {
  scrollRef,
  tabsRef,
  scrollState,
  tabOverflow,
  measureTabOverflow,
  setupTabOverflowObserver,
  teardownTabOverflowObserver,
  setTransition,
  autoPositionTab,
  adjustPositionAfterClose,
  scrollTabs,
  setupEventListeners,
  cleanupEventListeners,
} = useWorkTabScroll();

const {
  menuRef,
  menuItems,
  list,
  activeTab,
  clickTab,
  closeWorktab,
  onMiddleClickClose,
  showMenu,
  handleSelect,
  isQuickLinkBookmarked,
  toggleQuickBookmark,
  onQuickLinksChanged,
  handleRefreshCache,
} = useWorkTabActions({ adjustPositionAfterClose });

/**
 * Chrome 条竖线：固定区右侧必显；其余仅在「两侧都未选中」时显示（与 Vben 类控制台一致，避免贴激活标签显得碎）
 */
function showGoogleTabDivider(index: number): boolean {
  const tabs = list.value;
  if (index <= 0 || index >= tabs.length) return false;
  const prev = tabs[index - 1]!;
  const cur = tabs[index]!;
  if (prev.fixedTab && !cur.fixedTab) return true;
  if (prev.path === activeTab.value || cur.path === activeTab.value) return false;
  return true;
}

// 生命周期
onMounted(() => {
  setupEventListeners();
  quickStartManager.addListener(onQuickLinksChanged);
  autoPositionTab();
  nextTick(() => {
    measureTabOverflow();
    setupTabOverflowObserver();
  });
  window.addEventListener("resize", measureTabOverflow);
});

onUnmounted(() => {
  cleanupEventListeners();
  quickStartManager.removeListener(onQuickLinksChanged);
  teardownTabOverflowObserver();
  window.removeEventListener("resize", measureTabOverflow);
});

// 监听器
watch(tabOverflow, (overflow) => {
  if (!overflow) {
    scrollState.value.translateX = 0;
  }
});

watch(list, () => nextTick(measureTabOverflow), { deep: true });

watch(
  () => currentRoute.value,
  () => {
    setTransition();
    autoPositionTab();
    nextTick(measureTabOverflow);
  }
);

watch(
  () => userStore.language,
  () => {
    scrollState.value.translateX = 0;
    nextTick(() => {
      autoPositionTab();
      measureTabOverflow();
    });
  }
);
</script>

<style scoped src="./style.css"></style>
