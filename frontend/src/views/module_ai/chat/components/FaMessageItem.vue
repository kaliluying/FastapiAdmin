<template>
  <div :class="['message-group', message.type]" :data-message-id="message.id" tabindex="-1">
    <div class="message-avatar">
      <div v-if="message.type === 'user'" class="user-avatar">
        <ElIcon><User /></ElIcon>
      </div>
      <div v-else class="ai-avatar">
        <ElIcon><ChatDotRound /></ElIcon>
      </div>
    </div>
    <div class="message-content">
      <div class="message-header">
        <strong class="sender-name">
          {{ message.type === "user" ? userName : "FA助手" }}
        </strong>
        <ElButton
          v-if="message.content"
          text
          size="small"
          :icon="CopyDocument"
          class="copy-button"
          aria-label="复制消息"
          @click="handleCopy"
        ></ElButton>
      </div>
      <div class="message-body">
        <div v-if="message.files && message.files.length > 0" class="message-files">
          <div v-for="file in message.files" :key="file.id" class="attached-file">
            <ElIcon class="file-icon"><Document /></ElIcon>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
        <div v-if="parsedContent.thinking" class="thinking-panel">
          <ElButton
            text
            size="small"
            :icon="message.thinkingCollapsed ? ArrowDown : ArrowUp"
            class="thinking-toggle"
            @click="handleToggleThinking"
          >
            {{ message.thinkingCollapsed ? "展开思考过程" : "收起思考过程" }}
          </ElButton>
          <div v-show="!message.thinkingCollapsed" class="thinking-content">
            <FaMarkdownRenderer :content="parsedContent.thinking" />
          </div>
        </div>
        <div v-if="parsedContent.answer" class="message-text">
          <FaMarkdownRenderer :content="parsedContent.answer" />
        </div>
        <div
          v-if="message.type === 'assistant' && message.loading && !message.content"
          class="typing-indicator"
        >
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      <p v-if="message.warning" class="message-note message-note--warning" role="status">
        <ElIcon class="note-icon"><Warning /></ElIcon>
        <span>{{ message.warning }}</span>
      </p>
      <p v-if="message.retriedMessageId" class="message-note message-note--success" role="status">
        <ElIcon class="note-icon"><CircleCheck /></ElIcon>
        <span>已重试成功。原失败原因：{{ message.error }}</span>
      </p>
      <p v-else-if="message.error" class="message-note message-note--error" role="alert">
        <ElIcon class="note-icon"><CircleClose /></ElIcon>
        <span>{{ message.error }}</span>
      </p>
      <p v-if="message.stopped" class="message-note message-note--info">
        <ElIcon class="note-icon"><InfoFilled /></ElIcon>
        <span>已停止生成；当前回答可能未保存</span>
      </p>
      <div v-if="message.type === 'assistant'" class="message-actions">
        <FaAnswerFeedback
          v-if="
            message.sessionId &&
            message.runId &&
            !message.loading &&
            !message.error &&
            !message.stopped
          "
          :session-id="message.sessionId"
          :run-id="message.runId"
          :initial-rating="message.feedbackRating"
          :initial-comment="message.feedbackComment"
        />
        <ElButton
          v-if="message.retriedMessageId"
          link
          type="primary"
          @click="emit('show-retry', message.retriedMessageId)"
          >已重试，查看新回答</ElButton
        >
        <ElButton
          v-else-if="
            message.error && message.request && message.errorCode !== 'log_context_expired'
          "
          link
          type="primary"
          :disabled="retrySeconds > 0"
          @click="emit('retry')"
          >{{ retrySeconds > 0 ? `${retrySeconds} 秒后重试` : "重试这条问题" }}</ElButton
        >
        <ElButton
          v-if="message.citations?.length"
          class="action-btn--citations"
          @click="emit('show-citations')"
        >
          <ElIcon class="citations-icon"><Document /></ElIcon>
          <span>查看 {{ message.citations.length }} 条依据</span>
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useIntervalFn, useNow } from "@vueuse/core";
import { ElMessage } from "element-plus";
import {
  User,
  ChatDotRound,
  CopyDocument,
  ArrowDown,
  ArrowUp,
  Document,
  Warning,
  CircleCheck,
  CircleClose,
  InfoFilled,
} from "@element-plus/icons-vue";
import { useUserStoreHook } from "@stores";
import type { ChatMessage } from "../types";
import FaAnswerFeedback from "./FaAnswerFeedback.vue";

interface Props {
  message: ChatMessage;
}

interface Emits {
  (e: "toggle-thinking"): void;
  (e: "retry"): void;
  (e: "show-retry", messageId: string): void;
  (e: "show-citations"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { now, pause, resume } = useNow({
  controls: true,
  scheduler: (callback) => useIntervalFn(callback, 1000, { immediate: false }),
});
const retrySeconds = computed(() =>
  Math.max(0, Math.ceil(((props.message.retryUntil || 0) - now.value.getTime()) / 1000))
);
watch(
  () => props.message.retryUntil,
  (until) => {
    now.value = new Date();
    if (until && until > Date.now()) resume();
    else pause();
  },
  { immediate: true }
);
watch(retrySeconds, (seconds) => {
  if (!seconds) pause();
});

const userStore = useUserStoreHook();

const userName = computed(() => userStore.basicInfo.name || "用户");

const parsedContent = computed(() => {
  if (props.message.type !== "assistant") {
    return { thinking: "", answer: props.message.content };
  }
  return parseThinkingContent(props.message.content);
});

const parseThinkingContent = (content: string) => {
  const thinkingParts: string[] = [];
  const answer = content
    .replace(/<think(?:ing)?>([\s\S]*?)(?:<\/think(?:ing)?>|$)/gi, (_, thinking: string) => {
      if (thinking.trim()) {
        thinkingParts.push(thinking.trim());
      }
      return "";
    })
    .trim();

  return {
    thinking: thinkingParts.join("\n\n"),
    answer,
  };
};

const handleToggleThinking = () => {
  emit("toggle-thinking");
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content);
    ElMessage.success("已复制到剪贴板");
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = props.message.content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    ElMessage.success("已复制到剪贴板");
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
</script>

<style lang="scss" scoped>
.message-group {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
  outline: none;

  .message-avatar {
    flex-shrink: 0;

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      font-size: 15px;
      color: #fff;
      background: var(--theme-color);
      border-radius: 10px;
      box-shadow: 0 2px 6px color-mix(in srgb, var(--theme-color) 25%, transparent);
    }

    .ai-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      font-size: 16px;
      color: #fff;
      background: linear-gradient(
        135deg,
        var(--el-color-success),
        color-mix(in srgb, var(--el-color-success) 70%, #06b6d4)
      );
      border-radius: 10px;
      box-shadow: 0 2px 6px color-mix(in srgb, var(--el-color-success) 25%, transparent);
    }
  }

  .message-content {
    flex: 1;
    min-width: 0;

    .message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;

      .sender-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--fa-color-text-muted);
      }

      .copy-button {
        padding: 4px;
        font-size: 12px;
        color: var(--fa-color-text-muted);
        opacity: 0;
        transition:
          opacity var(--fa-motion-control),
          color var(--fa-motion-control);

        &:hover {
          color: var(--theme-color);
        }
      }
    }

    &:hover .copy-button {
      opacity: 1;
    }

    .message-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-top: 10px;

      :deep(.action-btn--citations) {
        display: inline-flex;
        gap: 5px;
        align-items: center;
        height: 28px;
        padding: 0 12px;
        font-size: 12px;
        font-weight: 500;
        color: var(--theme-color);
        background: color-mix(in srgb, var(--theme-color) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--theme-color) 22%, transparent);
        border-radius: 14px;
        transition: all var(--fa-motion-control);

        .citations-icon {
          font-size: 13px;
        }

        &:hover {
          color: var(--theme-color);
          background: color-mix(in srgb, var(--theme-color) 18%, transparent);
          border-color: color-mix(in srgb, var(--theme-color) 35%, transparent);
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    .message-body {
      .message-files {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;

        .attached-file {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 6px 12px;
          font-size: 12px;
          background: var(--fa-color-surface-raised);
          border: 1px solid var(--fa-color-border);
          border-radius: 8px;
          box-shadow: var(--fa-soft-shadow);

          .file-icon {
            font-size: 15px;
            color: var(--theme-color);
          }

          .file-name {
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
            white-space: nowrap;
          }

          .file-size {
            color: var(--fa-color-text-muted);
          }
        }
      }

      .thinking-panel {
        width: 100%;
        max-width: 760px;
        margin-bottom: 12px;
        overflow: hidden;
        background: var(--fa-color-surface-raised);
        border: 1px solid var(--fa-color-border);
        border-left: 3px solid var(--theme-color);
        border-radius: var(--fa-radius-control);
      }

      .thinking-toggle {
        padding: 0;
        margin: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        color: var(--fa-color-text-muted);

        &:hover {
          color: var(--theme-color);
        }
      }

      .thinking-content {
        padding: 4px 14px 12px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--fa-color-text-muted);
        border-top: 1px dashed var(--fa-color-border);
      }

      .message-text {
        font-size: 15px;
        line-height: 1.72;
        color: var(--fa-color-text);
        overflow-wrap: anywhere;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        padding: 8px 0;

        .typing-dots {
          display: flex;
          gap: 5px;

          span {
            width: 7px;
            height: 7px;
            background: var(--theme-color);
            border-radius: 50%;
            opacity: 0.7;
            animation: typing 1.4s infinite ease-in-out;

            &:nth-child(1) {
              animation-delay: 0s;
            }

            &:nth-child(2) {
              animation-delay: 0.2s;
            }

            &:nth-child(3) {
              animation-delay: 0.4s;
            }
          }
        }
      }
    }

    .message-note {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      max-width: 100%;
      padding: 6px 12px;
      margin: 10px 0 0;
      font-size: 12px;
      line-height: 1.5;
      border-radius: var(--fa-radius-control);

      .note-icon {
        flex-shrink: 0;
        font-size: 14px;
      }

      &--warning {
        color: var(--el-color-warning-dark-2);
        background: color-mix(in srgb, var(--el-color-warning) 10%, var(--fa-color-surface));
        border: 1px solid color-mix(in srgb, var(--el-color-warning) 25%, transparent);
      }

      &--success {
        color: var(--el-color-success-dark-2);
        background: color-mix(in srgb, var(--el-color-success) 10%, var(--fa-color-surface));
        border: 1px solid color-mix(in srgb, var(--el-color-success) 25%, transparent);
      }

      &--error {
        color: var(--el-color-danger-dark-2);
        background: color-mix(in srgb, var(--el-color-danger) 10%, var(--fa-color-surface));
        border: 1px solid color-mix(in srgb, var(--el-color-danger) 25%, transparent);
      }

      &--info {
        color: var(--fa-color-text-muted);
        background: var(--fa-color-surface-raised);
        border: 1px solid var(--fa-color-border);
      }
    }
  }

  &.user {
    flex-direction: row-reverse;

    .message-content {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .message-header {
        .sender-name {
          text-align: right;
        }
      }

      .message-actions {
        justify-content: flex-end;
      }

      .message-body {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .message-text {
          max-width: 82%;
          padding: 12px 18px;
          color: var(--fa-color-text);
          letter-spacing: -0.01em;
          background: color-mix(in srgb, var(--theme-color) 9%, var(--fa-color-surface));
          border: 1px solid color-mix(in srgb, var(--theme-color) 20%, var(--fa-color-border));
          border-radius: 18px 6px 18px 18px;
          box-shadow: var(--fa-soft-shadow);
        }
      }
    }
  }

  &.assistant {
    .message-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .typing-dots span {
      animation: none;
    }

    .copy-button,
    :deep(.action-btn--citations) {
      transition: none;
    }
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-4px);
  }
}

@media (width <= 640px) {
  .message-group {
    gap: 10px;
    margin-bottom: 18px;

    &.user .message-content .message-body .message-text {
      max-width: 92%;
      padding: 10px 14px;
      border-radius: 16px 4px 16px 16px;
    }
  }
}
</style>

<!-- 暗色下覆盖 highlight.js 亮色主题，避免代码块发白底 -->
<style lang="scss">
html.dark .chat-messages .message-text .markdown-content {
  pre.hljs,
  code.hljs {
    color: var(--el-text-color-regular) !important;
    background: var(--el-fill-color) !important;
  }

  .hljs-comment,
  .hljs-quote {
    color: var(--el-text-color-secondary) !important;
  }

  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-built_in {
    color: var(--el-color-primary) !important;
  }

  .hljs-string,
  .hljs-title,
  .hljs-attr {
    color: var(--el-color-success) !important;
  }

  .hljs-number,
  .hljs-literal {
    color: var(--el-color-warning) !important;
  }
}
</style>
