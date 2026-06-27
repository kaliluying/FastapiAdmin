<!-- 閻劍鍩涢懣婊冨礋閿涙艾鎮庨獮鑸垫＋閻楀牓銆婇弽蹇ョ礄闁板秶鐤嗘稉顓炵妇閵嗕笩itee閵嗕礁绱╃€电》绱? 閺傛壆澧?Popover 娑撳酣鎽奸幒銉х波閺?-->
<template>
  <!-- inline-flex + items-center閿涙矮绗屾い鑸电埉 FaIconButton 閸氬奔绔存稉顓犲殠鐎靛綊缍堥敍宀勪缉閸?Popover 鐟欙箑褰傜仦鍌氱唨缁惧灝浜哥粔?-->
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
          <!-- 娑撳孩妫悧?NavbarActions.user-profile__online-indicator 娑撯偓閼?-->
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
            <li
              class="flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--fa-gray-200)"
              @click="openParamConfig"
            >
              <FaSvgIcon icon="ri:settings-3-line" class="mr-2 text-base" />
              <span class="text-sm">{{ $t("topBar.user.paramConfig") }}</span>
            </li>
            <li
              class="flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--fa-gray-200)"
              @click="toGithub()"
            >
              <FaSvgIcon icon="ri:github-line" class="mr-2 text-base" />
              <span class="text-sm">{{ $t("topBar.user.github") }}</span>
            </li>
            <li
              class="flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--fa-gray-200)"
              @click="toGitee"
            >
              <FaSvgIcon icon="ri:git-branch-line" class="mr-2 text-base" />
              <span class="text-sm">{{ $t("topBar.user.gitee") }}</span>
            </li>
            <li
              class="flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--fa-gray-200)"
              @click="lockScreen()"
            >
              <FaSvgIcon icon="ri:lock-line" class="mr-2 text-base" />
              <span class="text-sm">{{ $t("topBar.user.lockScreen") }}</span>
            </li>
            <div class="w-full h-px my-2 bg-g-300/80"></div>
            <li
              class="flex p-2 select-none rounded-md cursor-pointer last:mb-0 hover:bg-(--fa-gray-200) justify-center mt-5 mb-0 py-1.5 text-xs border border-g-400 hover:text-(--el-color-danger) hover:border-(--el-color-danger-light-3)"
              @click="handleLogout"
            >
              {{ $t("topBar.user.logout") }}
            </li>
          </ul>
        </div>
      </template>
    </ElPopover>

    <FaConfigInfoDrawer v-model="paramDrawerVisible" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { useUserStore } from "@stores";
import { WEB_LINKS, mittBus } from "@utils";

defineOptions({ name: "FaUserMenu" });

const { t } = useI18n();
const userStore = useUserStore();

const { info: userInfo } = storeToRefs(userStore);
const userMenuPopover = ref();
const paramDrawerVisible = ref(false);

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

function openParamConfig(): void {
  closeUserMenu();
  paramDrawerVisible.value = true;
}

function toGithub(): void {
  window.open(WEB_LINKS.GITHUB);
}

function toGitee(): void {
  window.open(WEB_LINKS.GITEE);
}

function lockScreen(): void {
  mittBus.emit("openLockScreen");
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
      // 閻劍鍩涢崣鏍ㄧХ
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
/* ElPopover 閸╄桨绨?Tooltip閿涙俺袝閸欐垵鐪版妯款吇 inline-block閿涘奔绗屾い鑸电埉 flex 閸ョ偓鐖ｆ稉顓犲殠鐎靛綊缍?*/
.fa-user-menu .el-tooltip__trigger {
  display: inline-flex !important;
  align-items: center;
  line-height: 1;
}

/* 妞よ埖鐖径鏉戝剼閸欏厖绗呯憴鎺戞躬缁捐法濮搁幀渚婄礄鐎靛綊缍堥弮褏澧楁い鑸电埉閿涘绱遍崡鐘辩秴娑?FaIconButton size-8.5 娑撯偓閼?*/
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
</style>
