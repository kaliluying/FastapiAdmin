<template>
  <div class="retrieval-page">
    <FaAiPageHeader title="检索测试" description="选择知识库并输入问题，检查哪些内容会被找到。" />
    <ElCard shadow="never" class="retrieval-card">
      <FaAsyncState
        v-if="basesError"
        state="error"
        title="知识库选项加载失败"
        description="请重试加载，已输入的问题不会清除。"
      >
        <template #action><ElButton @click="loadBases">重试加载</ElButton></template>
      </FaAsyncState>
      <!-- 主查询区 -->
      <ElForm
        :model="form"
        label-width="80px"
        class="retrieval-form"
        :label-position="isNarrowViewport ? 'top' : 'right'"
      >
        <ElFormItem label="知识库">
          <ElSelect
            v-model="form.knowledge_base_ids"
            multiple
            filterable
            clearable
            class="base-select"
            placeholder="选择知识库"
          >
            <ElOption
              v-for="item in bases"
              :key="item.id"
              :label="item.name"
              :value="item.id || 0"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="问题">
          <ElInput
            v-model="form.query"
            type="textarea"
            placeholder="输入一个需要从资料中查证的问题"
            :rows="4"
            maxlength="1000"
            show-word-limit
          />
        </ElFormItem>

        <!-- 高级设置 -->
        <ElFormItem>
          <ElButton
            link
            type="primary"
            class="advanced-toggle"
            :aria-expanded="showAdvanced"
            @click="showAdvanced = !showAdvanced"
          >
            高级设置
            <span class="toggle-icon">{{ showAdvanced ? "▲" : "▼" }}</span>
          </ElButton>
        </ElFormItem>
        <div v-show="showAdvanced" class="advanced-panel">
          <ElFormItem label="片段数量">
            <ElInputNumber v-model="form.top_k" :min="1" :max="20" />
          </ElFormItem>
        </div>

        <ElFormItem>
          <ElButton
            type="primary"
            :icon="Search"
            :loading="asyncState === 'loading'"
            @click="testRetrieval"
            >检索</ElButton
          >
        </ElFormItem>
      </ElForm>

      <ElDivider />

      <!-- 检索结果 -->
      <div class="results-section">
        <p class="results-title">检索结果</p>

        <FaAsyncState
          v-if="asyncState === 'idle'"
          state="empty"
          title="等待检索"
          description="选择知识库并提交问题，在这里检查匹配的资料片段。"
        />

        <FaAsyncState
          v-else-if="asyncStateForDisplay"
          :state="asyncStateForDisplay"
          :title="
            asyncState === 'error'
              ? '检索失败'
              : asyncState === 'empty'
                ? '未找到匹配片段'
                : undefined
          "
          :description="
            asyncState === 'error'
              ? '问题和选项已保留，请稍后重试。'
              : asyncState === 'empty'
                ? '尝试更具体的问题，并确认所选知识库的文档已完成索引。'
                : undefined
          "
        >
          <template v-if="asyncState === 'error'" #action
            ><ElButton @click="testRetrieval">重试检索</ElButton></template
          >
        </FaAsyncState>

        <div v-else-if="asyncState === 'done'" class="result-list">
          <div v-for="(item, index) in results" :key="index" class="result-rank">
            <ElCard shadow="never" class="result-card">
              <div class="result-meta">
                <ElTag type="primary">#{{ index + 1 }}</ElTag>
                <span>知识库 {{ item.metadata.knowledge_base_id ?? "-" }}</span>
                <span>文档 {{ item.metadata.document_id ?? "-" }}</span>
                <span>分块 {{ item.metadata.chunk_index ?? "-" }}</span>
                <span v-if="item.distance != null"
                  >距离 {{ Number(item.distance).toFixed(4) }}</span
                >
                <span v-if="item.score != null">BM25 得分 {{ Number(item.score).toFixed(4) }}</span>
              </div>
              <p class="result-content">{{ item.content }}</p>
            </ElCard>
          </div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import KnowledgeAPI, { type KnowledgeBase, type RetrievalHit } from "@/api/module_ai/knowledge";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";
import FaAiPageHeader from "@/views/module_ai/components/FaAiPageHeader.vue";

defineOptions({ name: "AiRetrievalTest" });

const route = useRoute();
const bases = ref<KnowledgeBase[]>([]);
const basesError = ref(false);
const isNarrowViewport = useMediaQuery("(max-width: 640px)");
const results = ref<RetrievalHit[]>([]);
const showAdvanced = ref(false);
const asyncState = ref<"idle" | "loading" | "empty" | "error" | "done">("idle");

const asyncStateForDisplay = computed(() => {
  const state = asyncState.value;
  if (state === "loading" || state === "empty" || state === "error") {
    return state;
  }
  return null;
});

const form = reactive({
  query: "",
  knowledge_base_ids: [] as number[],
  top_k: 5,
});

const loadBases = async () => {
  basesError.value = false;
  try {
    const res = await KnowledgeAPI.optionselect();
    bases.value = (res.data?.data || []).filter((item) => item.id != null);
  } catch {
    basesError.value = true;
  }
};

const testRetrieval = async () => {
  if (!form.query.trim()) {
    ElMessage.warning("请输入问题");
    return;
  }
  if (!form.knowledge_base_ids.length) {
    ElMessage.warning("请选择知识库");
    return;
  }
  asyncState.value = "loading";
  try {
    const res = await KnowledgeAPI.testRetrieval({ ...form });
    results.value = res.data?.data?.results || [];
    asyncState.value = results.value.length ? "done" : "empty";
  } catch {
    asyncState.value = "error";
  }
};

const applyRouteQuery = () => {
  const knowledgeBaseId = Number(route.query.knowledge_base_id);
  if (Number.isFinite(knowledgeBaseId) && knowledgeBaseId > 0) {
    form.knowledge_base_ids = [knowledgeBaseId];
  }
};

onMounted(async () => {
  await loadBases();
  applyRouteQuery();
});
</script>

<style scoped>
.retrieval-card {
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-panel);
}

.retrieval-card :deep(.el-card__body) {
  padding: 24px;
}

.retrieval-form {
  max-width: 920px;
}

.base-select {
  width: min(360px, 100%);
}

.advanced-toggle {
  padding: 0;
  font-size: 13px;
}

.toggle-icon {
  margin-left: 4px;
  font-size: 10px;
}

.advanced-panel {
  padding-left: 8px;
  margin-bottom: 8px;
  border-left: 2px solid var(--el-border-color-light);
}

.results-title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 650;
  color: var(--el-text-color-primary);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-rank {
  width: 100%;
}

.result-card {
  background: var(--fa-color-canvas);
  border-radius: 9px;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
}

.result-content {
  margin: 0;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

@media (width <= 800px) {
  .retrieval-card :deep(.el-card__body) {
    padding: 16px;
  }

  .base-select {
    width: 100%;
  }
}
</style>
