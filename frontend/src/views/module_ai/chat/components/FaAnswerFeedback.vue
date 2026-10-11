<template>
  <span class="answer-feedback">
    <ElButton
      link
      :type="rating === 'helpful' ? 'success' : undefined"
      :loading="saving && target === 'helpful'"
      :disabled="saving"
      :aria-pressed="rating === 'helpful'"
      @click="submit('helpful')"
      >有帮助</ElButton
    >
    <ElButton
      link
      :type="rating === 'incorrect' ? 'warning' : undefined"
      :disabled="saving"
      :aria-pressed="rating === 'incorrect'"
      @click="dialogOpen = true"
      >反馈问题</ElButton
    >
    <span v-if="rating" role="status">已反馈</span>
    <ElDialog
      v-model="dialogOpen"
      title="反馈这条回答"
      width="min(92vw, 480px)"
      append-to-body
      :close-on-click-modal="false"
    >
      <label :for="commentId">哪些内容有问题？</label>
      <ElInput
        :id="commentId"
        v-model="comment"
        type="textarea"
        :rows="4"
        maxlength="2000"
        show-word-limit
        placeholder="描述错误或缺少的依据，请勿填写密码或密钥。"
      />
      <p v-if="error" role="alert">{{ error }}</p>
      <template #footer>
        <ElButton :disabled="saving" @click="dialogOpen = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="submit('incorrect')">保存反馈</ElButton>
      </template>
    </ElDialog>
  </span>
</template>

<script setup lang="ts">
import { ref, useId, watch } from "vue";
import QualityAPI, { type AnswerFeedback } from "@/api/module_ai/quality";

const props = defineProps<{
  sessionId: string;
  runId: string;
  initialRating?: AnswerFeedback["rating"];
  initialComment?: string;
}>();
const commentId = useId();
const rating = ref(props.initialRating);
const target = ref<AnswerFeedback["rating"]>();
const saving = ref(false);
const dialogOpen = ref(false);
const comment = ref(props.initialComment || "");
const error = ref("");
watch(
  () => props.initialRating,
  (value) => {
    rating.value = value;
  }
);

async function submit(value: AnswerFeedback["rating"]) {
  if (saving.value) return;
  saving.value = true;
  target.value = value;
  error.value = "";
  try {
    await QualityAPI.feedback({
      session_id: props.sessionId,
      run_id: props.runId,
      rating: value,
      comment: value === "incorrect" ? comment.value : "",
    });
    rating.value = value;
    dialogOpen.value = false;
  } catch {
    error.value = "保存失败，内容已保留，请重试。";
    dialogOpen.value = true;
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.answer-feedback {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.answer-feedback > span {
  font-size: var(--fa-text-caption);
  color: var(--fa-color-text-secondary);
}

label {
  display: block;
  margin-bottom: 8px;
}
</style>
