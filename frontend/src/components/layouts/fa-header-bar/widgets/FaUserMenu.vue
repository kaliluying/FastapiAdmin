<template>
  <!-- 保持触发器为 inline-flex，让弹层锚点跟随头像尺寸。 -->
  <div class="fa-user-menu inline-flex shrink-0 items-center leading-none">
    <ElPopover
      ref="userMenuPopover"
      placement="bottom-end"
      :width="240"
      :hide-after="0"
      :offset="10"
      trigger="hover"
      :show-arrow="false"
      popper-class="user-menu-popover"
      popper-style="padding: 5px 16px;"
    >
      <template #reference>
        <div
          class="fa-user-menu__avatar-ref mr-5 max-sm:mr-[16px] cursor-pointer flex size-8.5 max-sm:w-6.5 max-sm:h-6.5 shrink-0 items-center justify-center"
        >
          <img
            v-if="userAvatar"
            class="size-full rounded-full object-cover block"
            :src="userAvatar"
            alt="avatar"
          />
          <img
            v-else
            class="size-full rounded-full block"
            src="@imgs/user/avatar.webp"
            alt="avatar"
          />
          <!-- 在线状态指示点。 -->
          <span class="fa-user-menu__online-dot" aria-hidden="true" />
        </div>
      </template>
      <template #default>
        <div class="pt-3">
          <div class="flex items-center pb-1 px-0">
            <img
              v-if="userAvatar"
              class="w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left object-cover"
              :src="userAvatar"
              alt=""
            />
            <img
              v-else
              class="w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left"
              src="@imgs/user/avatar.webp"
              alt=""
            />
            <div class="w-[calc(100%-60px)] h-full">
              <span class="block text-sm font-medium text-g-800 truncate">
                {{ displayName }}
              </span>
              <span class="block mt-0.5 text-xs text-g-500 truncate">{{ displayEmail }}</span>
            </div>
          </div>
          <ul class="py-4 mt-3 border-t border-g-300/80">
            <li>
              <button type="button" class="user-menu-action" @click="openProfile()">
                <FaSvgIcon icon="ri:user-3-line" class="mr-2 text-base" />
                <span class="text-sm">{{ $t("topBar.user.userCenter") }}</span>
              </button>
            </li>
            <li>
              <button type="button" class="user-menu-action" @click="openPasswordChange()">
                <FaSvgIcon icon="ri:key-2-line" class="mr-2 text-base" />
                <span class="text-sm">{{ $t("topBar.user.changePassword") }}</span>
              </button>
            </li>
            <li class="w-full h-px my-2 bg-g-300/80" aria-hidden="true"></li>
            <li>
              <button type="button" class="user-menu-action user-menu-action--logout" @click="handleLogout">
                {{ $t("topBar.user.logout") }}
              </button>
            </li>
          </ul>
        </div>
      </template>
    </ElPopover>

  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@stores";

defineOptions({ name: "FaUserMenu" });

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();

const { info: userInfo } = storeToRefs(userStore);
const userMenuPopover = ref();

const userAvatar = computed(() => {
  const a = (userInfo.value as { avatar?: string })?.avatar?.trim();
  return a || "";
});

const displayName = computed(
  () =>
    (userInfo.value as { name?: string; username?: string })?.name ||
    (userInfo.value as { username?: string })?.username ||
    "-"
);

const displayEmail = computed(() => (userInfo.value as { email?: string })?.email || "");

function openProfile(): void {
  closeUserMenu();
  void router.push({ name: "Profile" });
}

function openPasswordChange(): void {
  closeUserMenu();
  void router.push({ name: "Profile", query: { tab: "password" } });
}

function handleLogout(): void {
  closeUserMenu();
  setTimeout(async () => {
    try {
      await ElMessageBox.confirm(t("common.logoutTips"), t("common.tips"), {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        customClass: "login-out-dialog",
      });
      await userStore.logout();
    } catch {
      // 用户取消登出。
    }
  }, 200);
}

function closeUserMenu(): void {
  setTimeout(() => {
    userMenuPopover.value?.hide?.();
  }, 100);
}
</script>

<style scoped>
/* ElPopover 会用 tooltip trigger 包裹 reference，这里保持 inline-flex 以稳定对齐。 */
.fa-user-menu .el-tooltip__trigger {
  display: inline-flex !important;
  align-items: center;
  line-height: 1;
}

/* 头像引用元素负责在线状态点定位，并保持固定按钮尺寸。 */
.fa-user-menu__avatar-ref {
  position: relative;
  box-sizing: border-box;
}

.fa-user-menu__online-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 8px;
  height: 8px;
  pointer-events: none;
  background-color: var(--el-color-success);
  border-radius: 50%;
  box-shadow: 0 0 2px rgb(0 0 0 / 20%);
}

.user-menu-action {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 5px;
}

.user-menu-action:hover,
.user-menu-action:focus-visible {
  background: var(--el-fill-color-light);
}

.user-menu-action:focus-visible {
  outline: 2px solid var(--fa-color-accent, var(--el-color-primary));
  outline-offset: 2px;
}

.user-menu-action--logout {
  justify-content: center;
  padding: 6px;
  margin-top: 12px;
  font-size: 12px;
  border: 1px solid var(--fa-color-border, var(--el-border-color));
}

.user-menu-action--logout:hover {
  color: var(--el-color-danger);
  border-color: var(--el-color-danger);
}
</style>
