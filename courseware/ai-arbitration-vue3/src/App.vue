<template>
  <div v-if="authLoading" class="auth-loading">
    <p>加载中...</p>
  </div>
  <RouterView v-else />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { initAuth } from "./composables/useAuth";

const authLoading = ref(true);

onMounted(async () => {
  await initAuth();
  authLoading.value = false;
});
</script>
