<template>
  <div class="retrieval-page">
    <ElCard shadow="never">
      <!-- 主查询区 -->
      <ElForm :model="form" label-width="80px" class="retrieval-form">
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
            @click="showAdvanced = !showAdvanced"
          >
            高级设置
            <span class="toggle-icon">{{ showAdvanced ? "▲" : "▼" }}</span>
          </ElButton>
        </ElFormItem>
        <div v-show="showAdvanced" class="advanced-panel">
          <ElFormItem label="Top K">
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
          v-if="asyncStateForDisplay"
          :state="asyncStateForDisplay"
          :title="asyncState === 'error' ? '检索失败，请重试' : undefined"
        />

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
                <span v-if="item.score != null"
                  >BM25 得分 {{ Number(item.score).toFixed(4) }}</span
                >
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
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import KnowledgeAPI, { type KnowledgeBase, type RetrievalHit } from "@/api/module_ai/knowledge";
import FaAsyncState from "@/components/feedback/fa-async-state/index.vue";

defineOptions({ name: "AiRetrievalTest" });

const route = useRoute();
const bases = ref<KnowledgeBase[]>([]);
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
  const res = await KnowledgeAPI.optionselect();
  bases.value = (res.data?.data || []).filter((item) => item.id != null);
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
.retrieval-form {
  max-width: 920px;
}

.base-select {
  width: 360px;
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
  font-size: 14px;
  font-weight: 500;
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
  border-radius: 6px;
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
  white-space: pre-wrap;
}
</style>
