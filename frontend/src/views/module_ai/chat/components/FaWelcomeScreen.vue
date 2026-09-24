<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <div class="ai-mark">
        <span class="ai-mark__core">
          <ElIcon size="34"><ChatDotRound /></ElIcon>
        </span>
      </div>

      <div class="welcome-heading">
        <span>知识助手</span>
        <h1>从知识库开始提问</h1>
        <p>输入问题并选择知识库；回答中的引用会标明所依据的内容。</p>
      </div>

      <div class="example-prompts">
        <div
          v-for="card in promptCards"
          :key="card.prompt"
          class="prompt-card"
          role="button"
          tabindex="0"
          @click="handlePromptClick(card.prompt)"
          @keydown.enter.prevent="handlePromptClick(card.prompt)"
          @keydown.space.prevent="handlePromptClick(card.prompt)"
        >
          <div class="prompt-card__icon">
            <FaSvgIcon :icon="card.icon" />
          </div>
          <div>
            <h4>{{ card.title }}</h4>
            <p>{{ card.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound } from "@element-plus/icons-vue";

interface Emits {
  (e: "prompt-click", prompt: string): void;
}

const emit = defineEmits<Emits>();

const promptCards = [
  {
    title: "系统介绍",
    body: "了解这个工作台的主要功能",
    prompt: "请介绍一下FastApiAdmin系统",
    icon: "ri:dashboard-3-line",
  },
  {
    title: "知识库使用",
    body: "了解如何整理和检索内部资料",
    prompt: "如何使用知识库查找文档？",
    icon: "ri:book-open-line",
  },
  {
    title: "权限管理",
    body: "解释角色、菜单和接口权限的协作关系",
    prompt: "系统的权限管理是如何工作的？",
    icon: "ri:shield-keyhole-line",
  },
  {
    title: "查看依据",
    body: "了解回答中的引用与来源",
    prompt: "如何查看 AI 回答所依据的文档？",
    icon: "ri:file-search-line",
  },
];

const handlePromptClick = (prompt: string) => {
  emit("prompt-click", prompt);
};
</script>

<style lang="scss" scoped>
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 36px 24px 24px;
  text-align: center;
  background: var(--fa-color-surface);
}

.welcome-content {
  width: min(760px, 100%);
}

.ai-mark {
  display: inline-grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 18px;
}

.ai-mark__core {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  color: var(--theme-color);
  background: var(--fa-color-canvas);
  border: 1px solid var(--fa-color-border);
  border-radius: 14px;
}

.welcome-heading span {
  display: inline-block;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 750;
  color: var(--theme-color);
}

.welcome-heading h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 680;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}

.welcome-heading p {
  max-width: 620px;
  margin: 6px auto 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--el-text-color-secondary);
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 28px;
}

.prompt-card {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
  min-height: 76px;
  padding: 14px 16px;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  background: var(--default-box-color);
  border: 1px solid var(--fa-card-border);
  border-radius: 10px;
  box-shadow: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.prompt-card:hover {
  background: var(--fa-color-canvas);
  border-color: color-mix(in srgb, var(--theme-color) 42%, var(--fa-color-border));
}

.prompt-card:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 2px;
}

.prompt-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 18px;
  color: var(--theme-color);
  background: color-mix(in srgb, var(--theme-color) 10%, var(--fa-color-surface));
  border-radius: 8px;
}

.prompt-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 720;
  color: var(--el-text-color-primary);
}

.prompt-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

@media (width <= 720px) {
  .welcome-screen {
    padding: 24px 16px;
  }

  .welcome-heading h1 {
    font-size: 28px;
  }

  .example-prompts {
    grid-template-columns: 1fr;
  }
}
</style>
