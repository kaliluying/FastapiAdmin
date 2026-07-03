<template>
  <section class="chat" aria-label="智能咨询对话">
    <div v-if="errorMessage" class="warning">{{ errorMessage }}</div>

    <div v-if="messages.length === 0" class="empty-chat">
      <strong>开始整理案件事实</strong>
      <span>先说明劳动关系、争议事实和已有材料，后端会通过 WebSocket 流式返回辅助建议。</span>
    </div>

    <div v-for="message in messages" :key="message.id" class="message">
      <div class="agent" :class="{ user: message.role === 'user' }">
        {{ message.role === "user" ? "人" : "AI" }}
      </div>

      <div v-if="message.role === 'user'" class="bubble-user">
        <span>{{ message.content }}</span>
        <span class="small-note">{{ message.time }}</span>
      </div>

      <div v-else class="bubble-ai" :class="{ error: message.error }">
        <div
          class="markdown-body"
          v-html="renderMarkdown(message.content || '正在生成回答...')"
        ></div>
        <div v-if="message.loading" class="streaming-note">
          <span class="typing-dot"></span>
          AI 正在流式返回
        </div>
        <div class="message-actions">
          <span>{{ message.loading ? "正在接收后端 WebSocket 数据" : "回答来自后端 AI 聊天接口，需结合证据人工复核" }}</span>
          <span>
            <button class="icon-btn" type="button">复制</button>
            <button class="icon-btn" type="button">不满意</button>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ChatMessage } from "../../data/mock";
import { renderMarkdown } from "../../utils/markdown";

defineProps<{
  messages: ChatMessage[];
  errorMessage: string;
}>();
</script>
