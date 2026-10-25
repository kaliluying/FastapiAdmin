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
        <h2>开始一次提问</h2>
        <p>可以直接提问，也可以添加附件或选择知识库。使用资料回答时，可查看引用来源。</p>
      </div>

      <div class="example-prompts">
        <button
          v-for="card in promptCards"
          :key="card.prompt"
          class="prompt-card"
          type="button"
          @click="handlePromptClick(card.prompt)"
        >
          <div class="prompt-card__icon">
            <FaSvgIcon :icon="card.icon" />
          </div>
          <div>
            <h4>{{ card.title }}</h4>
            <p>{{ card.body }}</p>
          </div>
        </button>
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
    prompt: "请介绍一下FastCore系统",
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
  padding: 28px 24px;
  text-align: left;
  background: transparent;
}

.welcome-content {
  width: min(760px, 100%);
}

.ai-mark {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 14px;
}

.ai-mark__core {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--theme-color);
  background: var(--fa-glass-bg-inset);
  border: 1px solid var(--fa-glass-border);
  border-radius: 14px;
  box-shadow: 0 4px 16px -2px color-mix(in srgb, var(--theme-color) 25%, transparent);
}

.welcome-heading span {
  display: inline-block;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 750;
  color: var(--theme-color);
}

.welcome-heading h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 680;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}

.welcome-heading p {
  max-width: 620px;
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--el-text-color-secondary);
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
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
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--fa-glass-bg-elevated);
  border: 1px solid var(--fa-glass-border);
  border-radius: var(--fa-radius-bento);
  box-shadow: var(--fa-shadow-bento);
  -webkit-backdrop-filter: var(--fa-glass-blur);
  backdrop-filter: var(--fa-glass-blur);
  transition:
    transform var(--fa-motion-control) ease,
    border-color var(--fa-motion-control) ease,
    box-shadow var(--fa-motion-control) ease,
    background-color var(--fa-motion-control) ease;
}

.prompt-card:hover {
  background: var(--fa-glass-bg);
  border-color: color-mix(in srgb, var(--theme-color) 35%, var(--fa-glass-border));
  box-shadow: var(--fa-shadow-bento-hover);
  transform: translateY(-2px);
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
  background: color-mix(in srgb, var(--theme-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-color) 20%, transparent);
  border-radius: 10px;
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

@media (prefers-reduced-motion: reduce) {
  .prompt-card {
    transition: none !important;

    &:hover {
      transform: none !important;
    }
  }
}

@media (width <= 720px) {
  .welcome-screen {
    padding: 18px 14px;
  }

  .ai-mark,
  .welcome-heading > span {
    display: none;
  }

  .welcome-heading h2 {
    font-size: 21px;
  }

  .prompt-card {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    min-height: 64px;
    padding: 12px;
  }

  .prompt-card__icon {
    display: none;
  }
}
</style>
