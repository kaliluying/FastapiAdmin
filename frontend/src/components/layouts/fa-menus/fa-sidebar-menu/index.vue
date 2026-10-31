<!-- 左侧菜单 或 双列菜单 -->
<template>
  <div
    class="layout-sidebar"
    v-if="showLeftMenu || isDualMenu"
    :class="{ 'no-border': menuList.length === 0 }"
  >
    <!-- 双列菜单（左侧） -->
    <div
      v-if="isDualMenu"
      class="dual-menu-left"
      :style="{ width: dualMenuShowText ? '80px' : '64px', background: getMenuTheme.background }"
    >
      <FaLogo v-if="showAppLogo" class="logo" :src="sidebarLogoSrc" @click="navigateToHome" />

      <ElScrollbar :style="{ height: 'calc(100% - 135px)' }">
        <ul>
          <li v-for="menu in firstLevelMenus" :key="menu.path" @click="handleMenuJump(menu, true)">
            <ElTooltip
              class="box-item"
              effect="dark"
              :content="formatMenuTitle(menu.meta.title)"
              placement="right"
              :offset="15"
              :hide-after="0"
              :disabled="dualMenuShowText"
            >
              <div
                :class="{
                  'is-active': menu.meta.isFirstLevel
                    ? menu.path === route.path
                    : menu.path === firstLevelMenuPath,
                }"
                :style="{
                  height: dualMenuShowText ? '60px' : '46px',
                }"
              >
                <FaMenuRouteIcon
                  class="menu-icon text-g-700 dark:text-g-800"
                  :icon="menu.meta.icon"
                  :style="{
                    marginBottom: dualMenuShowText ? '5px' : '0',
                  }"
                />
                <span v-if="dualMenuShowText" class="text-md text-g-700">
                  {{ formatMenuTitle(menu.meta.title) }}
                </span>
                <div v-if="menu.meta.showBadge" class="fa-badge fa-badge-dual" />
              </div>
            </ElTooltip>
          </li>
        </ul>
      </ElScrollbar>

      <FaIconButton
        class="switch-btn size-10"
        icon="ri:arrow-left-right-fill"
        label="切换导航显示方式"
        @click="toggleDualMenuMode"
      />
    </div>

    <!-- 左侧菜单 || 双列菜单（右侧） -->
    <div
      v-show="menuList.length > 0"
      class="menu-left"
      :class="`menu-left-${getMenuTheme.theme} menu-left-${!menuOpen ? 'close' : 'open'}`"
      :style="{ background: getMenuTheme.background }"
    >
      <!-- Logo、系统名称（开关同时控制 Logo 与标题） -->
      <div
        v-if="showAppLogo"
        class="header"
        @click="navigateToHome"
        :style="{
          background: getMenuTheme.background,
        }"
      >
        <button class="header-brand" type="button" aria-label="返回首页">
          <div class="header-brand__logo">
            <FaLogo v-if="!isDualMenu" class="logo" :src="sidebarLogoSrc" />
          </div>
          <div class="header-brand__text">
            <p
              :class="{ 'is-dual-menu-name': isDualMenu }"
              :style="{
                color: getMenuTheme.systemNameColor,
                opacity: !menuOpen ? 0 : 1,
              }"
            >
              {{ sidebarTitle }}
            </p>
            <span class="header-brand__subtitle">管理工作台</span>
          </div>
        </button>
        <!-- 主动折叠/展开按钮（仅在非双列菜单下显示） -->
        <button
          v-if="!isDualMenu"
          class="header-collapse-btn"
          :aria-label="menuOpen ? '收起侧边栏' : '展开侧边栏'"
          :title="menuOpen ? '收起侧边栏' : '展开侧边栏'"
          :aria-expanded="menuOpen"
          type="button"
          @click.stop="toggleMenuVisibility"
        >
          <FaSvgIcon :icon="menuOpen ? 'ri:menu-fold-3-line' : 'ri:menu-unfold-3-line'" />
        </button>
      </div>
      <ElScrollbar :style="scrollbarStyle">
        <ElMenu
          :class="'el-menu-' + getMenuTheme.theme"
          :collapse="!menuOpen"
          :default-active="routerPath"
          :text-color="getMenuTheme.textColor"
          :unique-opened="false"
          :background-color="getMenuTheme.background"
          :default-openeds="defaultOpenedMenus"
          :popper-class="`menu-left-popper menu-left-${getMenuTheme.theme}-popper`"
          :show-timeout="50"
          :hide-timeout="50"
        >
          <SidebarSubmenu
            :list="menuList"
            :isMobile="isMobileScreen"
            :theme="getMenuTheme"
            @close="handleMenuClose"
          />
        </ElMenu>
      </ElScrollbar>

      <!-- 双列菜单右侧折叠按钮 -->
      <div class="dual-menu-collapse-btn" v-if="isDualMenu" @click="toggleMenuVisibility">
        <FaSvgIcon
          class="text-g-500/70"
          :icon="menuOpen ? 'ri:arrow-left-wide-fill' : 'ri:arrow-right-wide-fill'"
        />
      </div>

      <div
        class="menu-model"
        @click="toggleMenuVisibility"
        :style="{
          opacity: !menuOpen ? 0 : 1,
          transform: showMobileModal ? 'scale(1)' : 'scale(0)',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppConfig from "@/config";
import type { AppRouteRecord } from "@/types/router";
import { useSettingsStore, useMenuStore } from "@stores";
import { MenuTypeEnum } from "@/enums/appEnum";
import { isIframe, handleMenuJump, formatMenuTitle } from "@utils";
import SidebarSubmenu from "./widgets/FaSidebarSubmenu.vue";
import { useWindowSize, useTimeoutFn, onKeyStroke } from "@vueuse/core";
import { navigateToHome as navigateToHomeRoute } from "@/router/homeNavigation";

defineOptions({ name: "FaSidebarMenu" });

const MOBILE_BREAKPOINT = 800;
const ANIMATION_DELAY = 350;

const route = useRoute();
const router = useRouter();
const settingStore = useSettingsStore();

/** 使用应用内置站点名称与 Logo */
const sidebarLogoSrc = computed(() => undefined);

const sidebarTitle = computed(() => AppConfig.systemInfo.name);

const { menuType, dualMenuShowText, menuOpen, getMenuTheme, showAppLogo } =
  storeToRefs(settingStore);

const showMobileModal = ref(false);

// 使用 VueUse 的窗口尺寸监听
const { width } = useWindowSize();

// 菜单类型判断
const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT);
const showLeftMenu = computed(
  () => menuType.value === MenuTypeEnum.LEFT || menuType.value === MenuTypeEnum.TOP_LEFT
);
const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU);

// 移动端屏幕判断（使用 computed 避免重复计算）
const isMobileScreen = computed(() => width.value < MOBILE_BREAKPOINT);

// 路由相关
const firstLevelMenuPath = computed(() => route.matched[0]?.path);
const routerPath = computed(() => String(route.meta.activePath || route.path));

// 菜单数据
const firstLevelMenus = computed(() => {
  return injectMenuGroup(useMenuStore().menuList).filter((menu) => !menu.meta.isHide);
});

/**
 * 临时：按一级路径为菜单注入 meta.group，用于前端展示分组标题。
 * 后续建议由后端菜单接口直接返回 meta.group，届时可移除此辅助函数。
 */
function injectMenuGroup(menus: AppRouteRecord[]): AppRouteRecord[] {
  const groupMap: Record<string, string> = {
    home: "总览",
    monitor: "总览",
    dashboard: "总览",
    system: "系统",
    ai: "AI 中枢",
  };

  return menus.map((menu) => {
    const key = menu.path?.replace(/^\//, "").split("/")[0];
    if (!key || !groupMap[key]) return menu;
    return {
      ...menu,
      meta: { ...menu.meta, group: groupMap[key] },
    };
  });
}

const menuList = computed(() => {
  const menuStore = useMenuStore();
  const allMenus = injectMenuGroup(menuStore.menuList);

  // 如果不是顶部左侧菜单或双列菜单，直接返回完整菜单列表
  if (!isTopLeftMenu.value && !isDualMenu.value) {
    return allMenus;
  }

  // 处理 iframe 路径
  if (isIframe(route.path)) {
    return findIframeMenuList(route.path, allMenus);
  }

  // 处理一级菜单
  if (route.meta.isFirstLevel) {
    return [];
  }

  // 返回当前顶级路径对应的子菜单
  const currentTopPath = `/${route.path.split("/")[1]}`;
  let currentMenu = allMenus.find((menu) => menu.path === currentTopPath);
  if (!currentMenu && allMenus.length > 0) {
    currentMenu =
      allMenus.find((menu) => !menu.meta?.isHide && menu.children?.length) ?? allMenus[0];
  }
  const sub = currentMenu?.children ?? [];
  // 顶部+左侧 / 双列：顶级为叶子时右侧展示自身
  if (sub.length === 0 && currentMenu?.path && !currentMenu.meta?.isHide) {
    return [currentMenu];
  }
  return sub;
});

const defaultOpenedMenus = computed(() => {
  const indexes: string[] = [];
  const collect = (items: AppRouteRecord[]) => {
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        indexes.push(item.path || item.meta.title);
        collect(item.children);
      }
    });
  };
  collect(menuList.value);
  return indexes;
});

// 双列菜单收起时的滚动条样式
const scrollbarStyle = computed(() => {
  const isCollapsed = isDualMenu.value && !menuOpen.value;
  return {
    transform: isCollapsed ? "translateY(-50px)" : "translateY(0)",
    height: isCollapsed ? "calc(100% + 50px)" : "calc(100% - 60px)",
    transition: "transform 0.3s ease",
  };
});

/**
 * 延迟隐藏移动端模态框（使用 VueUse 的 useTimeoutFn）
 */
const { start: delayHideMobileModal } = useTimeoutFn(
  () => {
    showMobileModal.value = false;
  },
  ANIMATION_DELAY,
  { immediate: false }
);

/**
 * 查找 iframe 对应的二级菜单列表
 */
const findIframeMenuList = (currentPath: string, menuList: any[]) => {
  // 递归查找包含当前路径的菜单项
  const hasPath = (items: any[]): boolean => {
    for (const item of items) {
      if (item.path === currentPath) {
        return true;
      }
      if (item.children && hasPath(item.children)) {
        return true;
      }
    }
    return false;
  };

  // 遍历一级菜单查找匹配的子菜单
  for (const menu of menuList) {
    if (menu.children && hasPath(menu.children)) {
      return menu.children;
    }
  }
  return [];
};

/**
 * 导航到首页
 */
const navigateToHome = (): void => {
  void navigateToHomeRoute(router);
};

/**
 * 切换菜单显示/隐藏
 */
const toggleMenuVisibility = (): void => {
  settingStore.setMenuOpen(!menuOpen.value);
};

/**
 * 处理菜单关闭（来自子组件）
 */
const handleMenuClose = (): void => {
  if (isMobileScreen.value) {
    settingStore.setMenuOpen(false);
    delayHideMobileModal();
  }
};

onKeyStroke("Escape", handleMenuClose);

/**
 * 切换双列菜单模式
 */
const toggleDualMenuMode = (): void => {
  settingStore.setDualMenuShowText(!dualMenuShowText.value);
};

/**
 * 监听窗口尺寸变化，自动处理移动端菜单
 */
watch(width, (newWidth) => {
  if (newWidth < MOBILE_BREAKPOINT) {
    settingStore.setMenuOpen(false);
    if (!menuOpen.value) {
      showMobileModal.value = false;
    }
  } else {
    showMobileModal.value = false;
  }
});

/**
 * 监听菜单开关状态变化
 */
watch(menuOpen, (isMenuOpen: boolean) => {
  if (!isMobileScreen.value) {
    // 大屏幕设备上，模态框始终隐藏
    showMobileModal.value = false;
  } else {
    // 小屏幕设备上，根据菜单状态控制模态框
    if (isMenuOpen) {
      // 菜单打开时立即显示模态框
      showMobileModal.value = true;
    } else {
      // 菜单关闭时延迟隐藏模态框，确保动画完成
      delayHideMobileModal();
    }
  }
});
</script>

<style lang="scss" scoped src="./styles/sidebar-menu.scoped.scss"></style>

<style lang="scss" src="./styles/sidebar-menu.global.scss"></style>
