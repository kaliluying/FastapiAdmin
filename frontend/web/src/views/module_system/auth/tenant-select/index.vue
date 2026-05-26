<!-- 租户选择页：登录后选择当前操作的租户 -->
<template>
  <div
    class="tenant-select-root flex min-h-screen flex-col items-center justify-center bg-(--el-bg-color-page) px-4"
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-(--el-text-color-primary)">选择租户</h1>
        <p class="mt-2 text-sm text-(--el-text-color-secondary)">请选择您要进入的租户空间</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <ElIcon class="is-loading text-3xl text-(--el-color-primary)"><Loading /></ElIcon>
      </div>

      <!-- Empty -->
      <ElAlert
        v-else-if="tenants.length === 0"
        type="warning"
        title="无可选租户"
        description="您未被关联到任何租户，请联系管理员。"
        show-icon
        :closable="false"
      />

      <!-- Tenant Cards -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="tenant in tenants"
          :key="tenant.id"
          class="tenant-card flex cursor-pointer items-center gap-4 rounded-lg border border-(--el-border-color) bg-(--el-bg-color) p-4 transition-all hover:border-(--el-color-primary) hover:shadow-md"
          @click="handleSelect(tenant)"
        >
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--el-color-primary-light-9) text-lg font-bold text-(--el-color-primary)"
          >
            {{ tenant.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium text-(--el-text-color-primary)">
              {{ tenant.name }}
            </div>
            <div class="truncate text-xs text-(--el-text-color-secondary)">
              {{ tenant.code }}
            </div>
          </div>
          <ElIcon class="text-(--el-text-color-placeholder)"><ArrowRight /></ElIcon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@stores";
import { ElMessage } from "element-plus";
import type { TenantOption } from "@/api/module_system/auth";

defineOptions({ name: "TenantSelect" });

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const { tenantList: tenants } = storeToRefs(userStore);
const loading = ref(false);

onMounted(async () => {
  if (tenants.value.length === 0) {
    loading.value = true;
    try {
      await userStore.fetchTenants();
    } catch {
      // handled
    } finally {
      loading.value = false;
    }
  }

  // 单租户自动选择
  if (tenants.value.length === 1) {
    await handleSelect(tenants.value[0]);
  }
});

async function handleSelect(tenant: TenantOption) {
  loading.value = true;
  try {
    await userStore.selectTenant(tenant.id);
    ElMessage.success(`已进入「${tenant.name}」`);
    const redirect = (route.query.redirect as string) || "/home";
    await router.replace(redirect);
  } catch {
    ElMessage.error("租户切换失败，请重试");
  } finally {
    loading.value = false;
  }
}
</script>
