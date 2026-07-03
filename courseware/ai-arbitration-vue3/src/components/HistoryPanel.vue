<template>
  <aside class="panel side">
    <div class="history">
      <div class="section-title">
        <div>
          <span class="eyebrow">CASE FILES</span>
          <h3>案件档案</h3>
        </div>
        <button class="link" type="button" @click="$emit('newSession')">新建</button>
      </div>

      <button
        v-for="session in sessions"
        :key="session.id"
        class="history-row session-row"
        :class="{ active: session.id === activeSessionId }"
        type="button"
        @click="$emit('selectSession', session.id)"
      >
        <span class="ring"></span>
        <span class="session-copy">
          <strong>{{ session.title }}</strong>
          <small>{{ session.caseName }} · {{ session.messages.length }} 条消息</small>
        </span>
        <time>{{ session.time }}</time>
        <span
          class="delete-session"
          role="button"
          tabindex="0"
          :aria-label="`删除会话：${session.title}`"
          @click.stop="$emit('deleteSession', session.id)"
          @keydown.enter.stop.prevent="$emit('deleteSession', session.id)"
          @keydown.space.stop.prevent="$emit('deleteSession', session.id)"
        >
          删除
        </span>
      </button>

      <p v-if="sessions.length === 0" class="small-note empty-history">
        暂无案件档案
      </p>

      <button class="btn full-width" type="button" @click="$emit('newSession')">新建案件咨询</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ChatSession } from "../data/mock";

defineProps<{
  sessions: ChatSession[];
  activeSessionId: string;
}>();

defineEmits<{
  newSession: [];
  selectSession: [value: string];
  deleteSession: [value: string];
}>();
</script>

<style scoped>
.empty-history {
  padding: 14px 10px;
  text-align: center;
}

.delete-session {
  flex-shrink: 0;
  padding: 3px 7px;
  font-size: 12px;
  color: #b42318;
  background: rgb(180 35 24 / 8%);
  border-radius: 999px;
  opacity: 0;
  transition:
    opacity 0.18s ease,
    background 0.18s ease;
}

.session-row:hover .delete-session,
.delete-session:focus-visible {
  opacity: 1;
}

.delete-session:hover,
.delete-session:focus-visible {
  background: rgb(180 35 24 / 14%);
  outline: none;
}
</style>
