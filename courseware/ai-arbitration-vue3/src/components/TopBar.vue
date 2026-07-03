<template>
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">仲</div>
      <div>
        <h1>案件材料整理室</h1>
        <p>劳动仲裁辅助 · 事实到文书</p>
      </div>
    </div>

    <nav class="nav" aria-label="主流程导航">
      <button
        v-for="item in modules"
        :key="item.key"
        type="button"
        :class="{ active: item.key === modelValue }"
        @click="$emit('update:modelValue', item.key)"
      >
        {{ item.label }}
      </button>
    </nav>

    <div class="top-actions">
      <div>
        <span class="demo-dot" :class="connectionStatus"></span>
        {{ statusText }}
      </div>
      <router-link to="/profile" class="user">
        <div class="avatar">{{ userFirstChar }}</div>
        <span>{{ displayName }}</span>
      </router-link>
      <button class="logout-link" type="button" :disabled="loggingOut" @click="handleLogout">
        {{ loggingOut ? "退出中" : "退出" }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { modules, type ModuleKey } from "../data/mock";
import { useAuth } from "../composables/useAuth";
import { logoutApi } from "../api/authApi";

const props = defineProps<{
  modelValue: ModuleKey;
  connectionStatus: "connecting" | "connected" | "disconnected";
}>();

defineEmits<{
  "update:modelValue": [value: ModuleKey];
}>();

const router = useRouter();
const { currentUser, clearAuth } = useAuth();
const loggingOut = ref(false);

const displayName = computed(() => {
  return currentUser.value?.name || currentUser.value?.username || "未登录";
});

const userFirstChar = computed(() => {
  const name = displayName.value;
  return name.charAt(0);
});

const statusText = computed(() => {
  if (props.connectionStatus === "connected") return "AI 已连接";
  if (props.connectionStatus === "connecting") return "AI 连接中";
  return "AI 未连接";
});

async function handleLogout() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await logoutApi();
  } finally {
    clearAuth();
    loggingOut.value = false;
    router.replace("/login");
  }
}
</script>

<style scoped>
.logout-link {
  border: 1px solid var(--line);
  border-radius: 7px;
  background: #fff;
  color: var(--muted);
  min-height: 32px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 800;
}

.logout-link:hover:not(:disabled) {
  border-color: #f1c979;
  background: var(--orange-soft);
  color: #9b5c00;
}

.logout-link:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
