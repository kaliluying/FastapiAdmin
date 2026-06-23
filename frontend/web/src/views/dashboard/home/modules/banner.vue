<template>
  <FaBasicBanner
    class="justify-center h-54! max-sm:pt-8! max-sm:h-52!"
    :title="bannerTitle"
    :subtitle="bannerSubtitle"
    boxStyle="bg-theme/10!"
    titleColor="var(--fa-gray-900)"
    subtitleColor="var(--fa-gray-500)"
    :decoration="false"
    :meteorConfig="{ enabled: true, count: 10 }"
    :buttonConfig="{ show: false, text: '' }"
    :imageConfig="{
      src: bannerCover,
      width: '18rem',
      bottom: '-7.5rem',
    }"
  >
    <div class="mt-3 flex items-center gap-4">
      <ElAvatar
        v-if="currentUser.avatar"
        :size="72"
        :src="currentUser.avatar"
        style="background-color: transparent"
      />
      <ElIcon v-else :size="52" class="text-g-500"><UserFilled /></ElIcon>
      <div class="min-w-0">
        <div class="truncate text-lg font-semibold text-g-800">{{ currentUser.name }}</div>
        <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-g-600">
          <span>{{ currentUser.dept_name }}</span>
          <span>{{ currentUser.description }}</span>
          <span>上次登录：{{ currentUser.last_login }}</span>
        </div>
      </div>
    </div>
  </FaBasicBanner>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { UserFilled } from "@element-plus/icons-vue";
import bannerCover from "@imgs/login/lf_icon2.webp";
import FaBasicBanner from "@/components/banners/fa-basic-banner/index.vue";
import { useUserStore } from "@stores";
import { greetings } from "@utils";

defineOptions({ name: "HomeBanner" });

type DashboardUser = {
  avatar: string;
  name: string;
  username: string;
  dept_name: string;
  description: string;
  last_login: string;
};

const fallbackUser: DashboardUser = {
  avatar: "",
  name: "超级管理员",
  username: "super",
  dept_name: "软件专业部",
  description: "超级管理员",
  last_login: "2026-06-12 18:47:03",
};

const userStore = useUserStore();
const timefix = greetings();

const currentUser = computed<DashboardUser>(() => {
  const userInfo = userStore.basicInfo;

  return {
    avatar: userInfo.avatar || fallbackUser.avatar,
    name: userInfo.name || fallbackUser.name,
    username: userInfo.username || fallbackUser.username,
    dept_name: userInfo.dept_name || fallbackUser.dept_name,
    description: userInfo.description || fallbackUser.description,
    last_login: userInfo.last_login || fallbackUser.last_login,
  };
});

const bannerTitle = computed(
  () =>
    `欢迎回来 ～ ${currentUser.value.name}（${currentUser.value.username}） ${timefix} 祝你开心每一天！`
);

const bannerSubtitle = "基于 FastAPI + Vue3 + TypeScript 构建的企业级中后台解决方案，支持多端开发。";
</script>
