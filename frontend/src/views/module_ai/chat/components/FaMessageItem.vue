<template>
  <div :class="['message-group', message.type]">
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
          <FaMarkdownRenderer
            :content="parsedContent.answer"
          />
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElMessage } from "element-plus";
import {
  User,
  ChatDotRound,
  CopyDocument,
  ArrowDown,
  ArrowUp,
  Document,
} from "@element-plus/icons-vue";
import { useUserStoreHook } from "@stores";
import type { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
}

interface Emits {
  (e: "toggle-thinking"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

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
  gap: 16px;
  margin-bottom: 16px;

  .message-avatar {
    flex-shrink: 0;

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      font-size: 14px;
      color: white;
      background: var(--el-color-primary);
      border-radius: 6px;
    }

    .ai-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      font-size: 14px;
      color: white;
      background: var(--el-color-success);
      border-radius: 6px;
    }
  }

  .message-content {
    flex: 1;
    min-width: 0;

    .message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .sender-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .copy-button {
        padding: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .message-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .message-body {
      .message-files {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;

        .attached-file {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 8px 12px;
          font-size: 12px;
          background: var(--el-fill-color-light);
          border-radius: 6px;

          .file-icon {
            font-size: 16px;
            color: var(--el-color-primary);
          }

          .file-name {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-size {
            color: var(--el-text-color-secondary);
          }
        }
      }

      .thinking-panel {
        width: 100%;
        max-width: 720px;
        margin-bottom: 10px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        background: rgb(23 32 51 / 3%);
      }

      .thinking-toggle {
        padding: 0;
        margin: 8px 10px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .thinking-content {
        padding: 0 12px 10px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--el-text-color-secondary);
        border-top: 1px dashed var(--el-border-color-lighter);
      }

      .message-text {
        font-size: 15px;
        line-height: 1.6;
        color: var(--el-text-color-primary);
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        padding: 8px 0;

        .typing-dots {
          display: flex;
          gap: 4px;

          span {
            width: 8px;
            height: 8px;
            background: var(--el-text-color-secondary);
            border-radius: 50%;
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

      .message-body .message-text {
        padding: 10px 14px;
        background: var(--el-color-primary-light-9);
        border: 1px solid var(--el-border-color-light);
        border-radius: 12px;
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
