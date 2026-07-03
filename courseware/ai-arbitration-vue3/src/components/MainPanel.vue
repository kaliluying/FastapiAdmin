<template>
  <section class="panel main-panel">
    <div class="case-header dossier-header">
      <div>
        <span class="eyebrow">当前案件档案</span>
        <h2>{{ activeSession.caseName }}</h2>
        <p>申请人：{{ activeSession.applicant }} · 会话 {{ activeSessionId || "未创建" }}</p>
      </div>
      <div class="case-meta">
        <span>{{ moduleStatus }}</span>
        <span>{{ messages.length }} 条对话记录</span>
      </div>
      <button class="link" type="button" @click="$emit('clearChat')">清空对话</button>
    </div>

    <div ref="mainViewRef" class="main-view">
      <ConsultModule
        v-if="activeModule === 'consult'"
        :messages="messages"
        :error-message="errorMessage"
      />
      <UploadModule
        v-else-if="activeModule === 'upload'"
        :active-session-id="activeSessionId"
      />
      <DocumentModule
        v-else
        :active-session="activeSession"
        :active-session-id="activeSessionId"
      />
    </div>

    <Composer
      v-if="activeModule === 'consult'"
      :connection-status="connectionStatus"
      :sending="sending"
      @send-message="$emit('sendMessage', $event)"
      @switch-module="$emit('switchModule', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { ChatMessage, ChatSession, ModuleKey } from "../data/mock";
import Composer from "./modules/Composer.vue";
import ConsultModule from "./modules/ConsultModule.vue";
import DocumentModule from "./modules/DocumentModule.vue";
import UploadModule from "./modules/UploadModule.vue";

const props = defineProps<{
  activeModule: ModuleKey;
  activeSession: ChatSession;
  activeSessionId: string;
  messages: ChatMessage[];
  connectionStatus: "connecting" | "connected" | "disconnected";
  sending: boolean;
  errorMessage: string;
}>();

defineEmits<{
  clearChat: [];
  sendMessage: [value: string];
  switchModule: [value: ModuleKey];
}>();

const mainViewRef = ref<HTMLElement | null>(null);

const moduleStatus = computed(() => {
  if (props.activeModule === "consult") return "事实咨询中";
  if (props.activeModule === "upload") return "证据整理中";
  return "申请书生成中";
});

watch(
  () => props.activeModule,
  async () => {
    await nextTick();
    mainViewRef.value?.scrollTo({ top: 0, left: 0 });
  },
);
</script>
