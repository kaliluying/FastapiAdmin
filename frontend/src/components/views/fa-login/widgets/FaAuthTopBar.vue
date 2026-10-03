<!-- 授权页顶栏：左上 Logo / 标题 / 版本（固定），右上操作（固定）；切换布局时仅下方主体变化 -->
<template>
  <header
    class="auth-top-bar pointer-events-none fixed left-0 right-0 top-0 z-100 flex items-center justify-between gap-3 bg-transparent px-5 py-4.5 md:gap-4 md:px-10"
    :class="{ 'auth-top-bar--on-illustration': panelAlign === 'right' }"
  >
    <div class="pointer-events-auto flex min-w-0 flex-1 items-center gap-3">
      <FaLogo class="icon shrink-0" size="46" :src="webLogoSrc" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <p class="auth-top-bar__site-title">{{ siteTitle }}</p>
          <div class="logo-version-badge shrink-0" :title="displayVersion">
            <span class="logo-version-pill">{{ displayVersion }}</span>
          </div>
        </div>
      </div>
    </div>

    <nav
      class="auth-top-bar-actions-panel pointer-events-auto flex shrink-0 flex items-center justify-center gap-1.5 px-2 py-1.5 max-sm:mr-1"
      aria-label="登录页面设置"
    >
      <ElPopover placement="bottom-end" trigger="click" :width="224">
        <template #reference>
          <button
            type="button"
            class="btn palette-btn auth-top-bar__action"
            aria-label="选择主题色"
          >
            <FaSvgIcon icon="ri:palette-line" class="text-xl" />
          </button>
        </template>
        <div class="color-dots" aria-label="可用主题色">
          <button
            v-for="_color in mainColors"
            :key="_color"
            type="button"
            class="color-dot"
            :aria-label="`主题色 ${_color}`"
            :aria-pressed="_color === systemThemeColor"
            :class="{ active: _color === systemThemeColor }"
            :style="{ background: _color }"
            @click="changeThemeColor(_color)"
          >
            <FaSvgIcon v-if="_color === systemThemeColor" icon="ri:check-fill" class="text-white" />
          </button>
        </div>
      </ElPopover>
      <ElDropdown
        v-if="panelAlign != null"
        @command="onPanelAlign"
        popper-class="langDropDownStyle"
      >
        <button
          type="button"
          class="btn layout-align-btn auth-top-bar__action"
          :title="$t('login.panelAlign.label')"
          :aria-label="$t('login.panelAlign.label')"
        >
          <FaSvgIcon
            :icon="panelAlignTriggerIcon"
            class="text-xl text-g-800 transition-colors duration-300"
          />
        </button>
        <template #dropdown>
          <ElDropdownMenu>
            <div v-for="opt in layoutAlignOptions" :key="opt.value" class="lang-btn-item">
              <ElDropdownItem
                :command="opt.value"
                :class="{ 'is-selected': panelAlign === opt.value }"
              >
                <FaSvgIcon :icon="opt.icon" class="mr-2 text-base" />
                <span class="menu-txt">{{ $t(opt.labelKey) }}</span>
                <FaSvgIcon icon="ri:check-fill" class="text-base" v-if="panelAlign === opt.value" />
              </ElDropdownItem>
            </div>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <ElDropdown
        v-if="shouldShowLanguage"
        @command="changeLanguage"
        popper-class="langDropDownStyle"
      >
        <button
          type="button"
          class="btn language-btn auth-top-bar__action"
          :aria-label="$t('login.languageToggle')"
        >
          <FaSvgIcon
            icon="ri:translate-2"
            class="text-[19px] text-g-800 transition-colors duration-300"
          />
        </button>
        <template #dropdown>
          <ElDropdownMenu>
            <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
              <ElDropdownItem
                :command="lang.value"
                :class="{ 'is-selected': locale === lang.value }"
              >
                <span class="menu-txt">{{ lang.label }}</span>
                <FaSvgIcon icon="ri:check-fill" class="text-base" v-if="locale === lang.value" />
              </ElDropdownItem>
            </div>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <button
        v-if="shouldShowThemeToggle"
        type="button"
        class="btn theme-btn auth-top-bar__action"
        :aria-label="$t('login.themeToggle')"
        :aria-pressed="isDark"
        @click="toggleTheme"
      >
        <FaSvgIcon
          :icon="isDark ? 'ri:sun-fill' : 'ri:moon-line'"
          class="text-xl text-g-800 transition-colors duration-300"
        />
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useSettingsStore, useUserStore } from "@stores";
import { useHeaderBar } from "@/hooks/core/useHeaderBar";
import { useTheme } from "@/hooks/core/useTheme";
import { themeAnimation } from "@utils";
import { languageOptions } from "@/locales";
import { LanguageEnum, SystemThemeEnum } from "@/enums/appEnum";
import AppConfig from "@/config";
import { LoginPanelAlign } from "@/components/views/fa-login/composables/useLoginPanelAlign";

defineOptions({ name: "AuthTopBar" });

const DEFAULT_APP_VERSION = "3.0.0";

interface Props {
  /** 登录区表单水平对齐；未传入时不展示布局切换 */
  panelAlign?: LoginPanelAlign | null;
}

const props = withDefaults(defineProps<Props>(), {});

interface Emits {
  "update:panelAlign": [value: LoginPanelAlign];
}

const emit = defineEmits<Emits>();

const layoutAlignOptions: {
  value: LoginPanelAlign;
  icon: string;
  labelKey: string;
}[] = [
  { value: "left", icon: "ri:layout-left-2-line", labelKey: "login.panelAlign.left" },
  { value: "center", icon: "ri:layout-column-line", labelKey: "login.panelAlign.center" },
  { value: "right", icon: "ri:layout-right-2-line", labelKey: "login.panelAlign.right" },
];

/** 与当前选中项同一套 icon，避免触发器与菜单不一致 */
const panelAlignTriggerIcon = computed(() => {
  const opt = layoutAlignOptions.find((o) => o.value === props.panelAlign);
  return opt?.icon ?? "ri:layout-column-line";
});

function onPanelAlign(cmd: string) {
  if (cmd === "left" || cmd === "center" || cmd === "right") {
    emit("update:panelAlign", cmd);
  }
}

const settingStore = useSettingsStore();
const userStore = useUserStore();
const { isDark, systemThemeColor } = storeToRefs(settingStore);
const { shouldShowThemeToggle, shouldShowLanguage } = useHeaderBar();
const { switchThemeStyles } = useTheme();
const { locale } = useI18n();

const mainColors = AppConfig.systemMainColor;
/** 与 Element 主题主色同步，供调色盘图标与展开态使用 */
const themeColorForCss = computed(() => systemThemeColor.value);

const webLogoSrc = computed(() => undefined);

const siteTitle = computed(() => AppConfig.systemInfo.name);

const displayVersion = computed(() => `v${DEFAULT_APP_VERSION}`);

function toggleTheme(event: MouseEvent): void {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    switchThemeStyles(isDark.value ? SystemThemeEnum.LIGHT : SystemThemeEnum.DARK);
    return;
  }
  themeAnimation(event);
}

const changeLanguage = (lang: LanguageEnum) => {
  if (locale.value === lang) return;
  locale.value = lang;
  userStore.setLanguage(lang);
};

const changeThemeColor = (color: string) => {
  if (systemThemeColor.value === color) return;
  settingStore.setElementTheme(color);
  settingStore.reload();
};
</script>

<style scoped>
.auth-top-bar__site-title {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  font-weight: 600;
  line-height: 1.35;
  color: var(--el-text-color-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.logo-version-pill {
  display: inline-block;
  padding: 0.28rem 0.6rem;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  color: var(--el-color-primary);
  letter-spacing: 0.02em;
  background: color-mix(in srgb, var(--el-color-primary) 11%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  border-radius: 999px;
}

/* 右上角操作的整体衬底 */
.auth-top-bar-actions-panel {
  gap: 4px;
  background-color: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);

  /* 胶囊形：左右两端为半圆弧 */
  border-radius: var(--fa-radius-overlay, 14px);
  box-shadow: var(--fa-soft-shadow);
}

.dark .auth-top-bar-actions-panel {
  background-color: rgb(255 255 255 / 8%);
  border-color: rgb(255 255 255 / 12%);
  box-shadow: 0 4px 20px rgb(0 0 0 / 35%);
}

/* 右上角三个操作按钮：悬浮抬升 + 浅底 + 图标随主色 */
.auth-top-bar__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: var(--fa-color-text);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--fa-radius-control, 10px);
  transition: background-color 150ms ease;
}

.auth-top-bar__action:hover {
  background-color: var(--el-fill-color-light);
}

.auth-top-bar__action:hover :deep(.fa-svg-icon) {
  color: var(--el-color-primary);
}

.auth-top-bar__action:active {
  background-color: var(--el-color-primary-light-9);
}

.auth-top-bar__action:focus-visible,
.color-dot:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 3px;
}

.dark .auth-top-bar__action:hover {
  background-color: rgb(255 255 255 / 10%);
  box-shadow: 0 4px 18px rgb(0 0 0 / 45%);
}

.color-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px;
}

.color-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  border: 1px solid var(--fa-color-border);
  border-radius: 50%;
}

/* 仅展开调色条后，单颗色块悬浮：描边 + 略放大 */
.color-dot.active {
  outline: 2px solid var(--fa-color-text);
  outline-offset: 3px;
}

.dark .color-dots {
  background-color: var(--fa-gray-200);
  box-shadow: none;
}

/* 调色盘：图标颜色与当前主题主色一致（含单独悬浮、整块调色区悬浮） */
.palette-btn :deep(.fa-svg-icon) {
  color: v-bind("themeColorForCss");
}

.auth-top-bar__action.palette-btn:hover :deep(.fa-svg-icon) {
  color: v-bind("themeColorForCss");
}

@media (width <= 640px) {
  .auth-top-bar {
    gap: 8px;
    padding: 16px;
    background: var(--fa-color-canvas);
  }

  .auth-top-bar-actions-panel {
    gap: 2px;
    padding: 4px;
  }

  .auth-top-bar__action {
    width: 44px;
    height: 44px;
  }

  .logo-version-badge {
    display: none;
  }

  .auth-top-bar__site-title {
    font-size: 14px;
  }
}

@media (width >= 1181px) {
  .auth-top-bar--on-illustration .auth-top-bar__site-title {
    color: var(--el-color-white);
  }

  .auth-top-bar--on-illustration .logo-version-pill {
    color: var(--el-color-white);
    background: rgb(255 255 255 / 8%);
    border-color: rgb(255 255 255 / 20%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-top-bar__action,
  .auth-top-bar__action :deep(.fa-svg-icon) {
    transition: none;
  }
}
</style>
