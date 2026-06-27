<template>
  <div class="model-config-page">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>模型配置</span>
          <ElButton :icon="Refresh" :loading="loading" @click="loadConfig">刷新</ElButton>
        </div>
      </template>

      <ElDescriptions v-loading="loading" :column="2" border>
        <ElDescriptionsItem label="API 地址">
          {{ config?.openai_base_url || "-" }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="API Key">
          <ElTag :type="config?.openai_api_key_configured ? 'success' : 'danger'">
            {{ config?.openai_api_key_configured ? "已配置" : "未配置" }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="对话模型">
          {{ config?.openai_model || "-" }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="向量模型">
          {{ config?.openai_embedding_model || "-" }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Chroma 地址">
          {{ chromaEndpoint }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Chroma 集合">
          {{ config?.chroma_collection_name || "-" }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import AiChatAPI, { type AiModelConfig } from "@/api/module_ai/chat";

defineOptions({ name: "AiModelConfig" });

const loading = ref(false);
const config = ref<AiModelConfig>();

const chromaEndpoint = computed(() => {
  if (!config.value) return "-";
  const protocol = config.value.chroma_ssl ? "https" : "http";
  return `${protocol}://${config.value.chroma_host}:${config.value.chroma_port}`;
});

const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await AiChatAPI.getModelConfig();
    config.value = res.data?.data;
  } finally {
    loading.value = false;
  }
};

onMounted(loadConfig);
</script>

<style scoped>
.model-config-page {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
