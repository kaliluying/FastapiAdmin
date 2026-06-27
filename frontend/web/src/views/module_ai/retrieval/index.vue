<template>
  <div class="retrieval-page">
    <ElCard shadow="never">
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
            <ElOption v-for="item in bases" :key="item.id" :label="item.name" :value="item.id || 0" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Top K">
          <ElInputNumber v-model="form.top_k" :min="1" :max="20" />
        </ElFormItem>
        <ElFormItem label="问题">
          <ElInput v-model="form.query" type="textarea" :rows="4" maxlength="1000" show-word-limit />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :icon="Search" :loading="loading" @click="testRetrieval">检索</ElButton>
        </ElFormItem>
      </ElForm>

      <ElDivider />

      <ElEmpty v-if="!results.length" description="暂无检索结果" />
      <div v-else class="result-list">
        <ElCard v-for="(item, index) in results" :key="index" shadow="never" class="result-card">
          <div class="result-meta">
            <ElTag type="primary">#{{ index + 1 }}</ElTag>
            <span>知识库 {{ item.metadata.knowledge_base_id ?? "-" }}</span>
            <span>文档 {{ item.metadata.document_id ?? "-" }}</span>
            <span>分块 {{ item.metadata.chunk_index ?? "-" }}</span>
            <span v-if="item.distance != null">距离 {{ Number(item.distance).toFixed(4) }}</span>
          </div>
          <p class="result-content">{{ item.content }}</p>
        </ElCard>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import KnowledgeAPI, { type KnowledgeBase, type RetrievalHit } from "@/api/module_ai/knowledge";

defineOptions({ name: "AiRetrievalTest" });

const loading = ref(false);
const bases = ref<KnowledgeBase[]>([]);
const results = ref<RetrievalHit[]>([]);

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
  loading.value = true;
  try {
    const res = await KnowledgeAPI.testRetrieval({ ...form });
    results.value = res.data?.data?.results || [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadBases);
</script>

<style scoped>
.retrieval-form {
  max-width: 920px;
}

.base-select {
  width: 360px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
