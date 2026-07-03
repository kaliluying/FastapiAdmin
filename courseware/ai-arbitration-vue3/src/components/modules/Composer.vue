<template>
  <div class="composer">
    <div class="suggestions">
      <span>案件事实采集：</span>
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="chip"
        type="button"
        @click="question = suggestion"
      >
        {{ suggestion }}
      </button>
    </div>

    <div class="input-wrap">
      <textarea
        v-model="question"
        :disabled="sending"
        maxlength="1000"
        placeholder="描述劳动关系、欠薪金额、解除经过或已有证据，AI 将给出辅助建议..."
        @keydown.enter.exact.prevent="handleSend"
      ></textarea>
      <div class="send-box">
        <div class="counter">{{ question.length }}/1000</div>
        <button
          class="btn primary"
          type="button"
          :disabled="!canSend"
          @click="handleSend"
        >
          {{ sending ? "发送中" : "发送" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { suggestions, type ModuleKey } from "../../data/mock";

const props = defineProps<{
  connectionStatus: "connecting" | "connected" | "disconnected";
  sending: boolean;
}>();

const emit = defineEmits<{
  sendMessage: [value: string];
  switchModule: [value: ModuleKey];
}>();

const question = ref("");
const canSend = computed(() => {
  return props.connectionStatus !== "connecting" && !props.sending && question.value.trim().length > 0;
});

const handleSend = () => {
  if (!canSend.value) return;

  if (question.value.includes("申请书") || question.value.includes("文书")) {
    emit("switchModule", "document");
  }

  emit("sendMessage", question.value);
  question.value = "";
};
</script>
