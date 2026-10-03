<template>
  <ElScrollbar ref="messagesContainer" class="chat-messages">
    <WelcomeScreen v-if="messages.length === 0" @prompt-click="handlePromptClick" />
    <div v-else class="messages-list">
      <FaMessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @toggle-thinking="handleToggleThinking(message)"
        @retry="emit('retry', message.id)"
        @show-citations="emit('show-citations', message.id)"
      />
    </div>
    <div v-if="error" class="error-banner">
      <ElAlert :title="error" type="error" :closable="true" show-icon @close="handleErrorClose" />
    </div>
  </ElScrollbar>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import { ElScrollbar } from "element-plus";
import WelcomeScreen from "./FaWelcomeScreen.vue";
import FaMessageItem from "./FaMessageItem.vue";
import type { ChatMessage } from "../types";

interface Props {
  messages: ChatMessage[];
  error: string;
}

interface Emits {
  (e: "prompt-click", prompt: string): void;
  (e: "error-close"): void;
  (e: "retry", messageId: string): void;
  (e: "show-citations", messageId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const messagesContainer = ref<InstanceType<typeof ElScrollbar>>();

const scrollToBottom = () => {
  nextTick(() => {
    const wrap = messagesContainer.value?.wrapRef;
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
  });
};

watch(
  () => props.messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

const handlePromptClick = (prompt: string) => {
  emit("prompt-click", prompt);
};

const handleToggleThinking = (message: ChatMessage) => {
  message.thinkingCollapsed = !message.thinkingCollapsed;
};

const handleErrorClose = () => {
  emit("error-close");
};

defineExpose({
  scrollToBottom,
});
</script>

<style lang="scss" scoped>
.chat-messages {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;

  .messages-list {
    max-width: 800px;
    padding: 24px;
    margin: 0 auto;
  }

  .error-banner {
    max-width: 800px;
    padding: 12px 24px;
    margin: 0 auto;
  }
}

@media (width <= 640px) {
  .chat-messages .messages-list,
  .chat-messages .error-banner {
    padding: 12px 14px;
  }
}
</style>
