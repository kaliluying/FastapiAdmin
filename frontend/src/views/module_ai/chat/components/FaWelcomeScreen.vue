<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <div class="ai-mark">
        <span class="ai-mark__core">
          <ElIcon size="34"><ChatDotRound /></ElIcon>
        </span>
        <span class="ai-mark__pulse"></span>
      </div>

      <div class="welcome-heading">
        <span>Knowledge Copilot</span>
        <h1>FA智能助手</h1>
        <p>连接内部知识库、系统权限与操作上下文，帮你把问题变成可执行的后台动作。</p>
      </div>

      <div class="example-prompts">
        <div
          v-for="card in promptCards"
          :key="card.prompt"
          class="prompt-card"
          :class="`prompt-card--${card.tone}`"
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
    body: "请介绍一下 FastApiAdmin 的模块和能力",
    prompt: "请介绍一下FastApiAdmin系统",
    icon: "ri:dashboard-3-line",
    tone: "blue",
  },
  {
    title: "开发指导",
    body: "生成新模块的目录、接口与页面清单",
    prompt: "如何在系统中创建新的模块？",
    icon: "ri:code-box-line",
    tone: "cyan",
  },
  {
    title: "权限管理",
    body: "解释角色、菜单和接口权限的协作关系",
    prompt: "系统的权限管理是如何工作的？",
    icon: "ri:shield-keyhole-line",
    tone: "violet",
  },
  {
    title: "性能优化",
    body: "定位接口、检索和前端渲染的优化机会",
    prompt: "如何优化FA系统的性能？",
    icon: "ri:speed-up-line",
    tone: "amber",
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
  padding: 20px 24px 14px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 12%, rgb(93 135 255 / 12%), transparent 30%),
    linear-gradient(180deg, rgb(248 251 255 / 62%), transparent 42%);
}

.welcome-content {
  width: min(760px, 100%);
}

.ai-mark {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

.ai-mark__core,
.ai-mark__pulse {
  position: absolute;
  border-radius: 999px;
}

.ai-mark__core {
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #4070d8;
  background: rgb(255 255 255 / 86%);
  border: 1px solid rgb(93 135 255 / 18%);
  box-shadow: 0 16px 42px rgb(93 135 255 / 20%);
}

.ai-mark__pulse {
  inset: 0;
  background:
    conic-gradient(from 140deg, rgb(93 135 255 / 0%), rgb(93 135 255 / 35%), rgb(45 212 191 / 34%), rgb(93 135 255 / 0%));
  opacity: 0.72;
}

.welcome-heading span {
  display: inline-block;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 750;
  color: #4070d8;
  text-transform: uppercase;
}

.welcome-heading h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 760;
  line-height: 1.2;
  color: #172033;
}

.welcome-heading p {
  max-width: 620px;
  margin: 6px auto 0;
  font-size: 14px;
  line-height: 1.55;
  color: #667085;
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.prompt-card {
  position: relative;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
  box-sizing: border-box;
  min-height: 76px;
  padding: 14px 16px;
  overflow: visible;
  text-align: left;
  cursor: pointer;
  background: rgb(255 255 255 / 88%);
  border: 1px solid rgb(23 32 51 / 8%);
  border-radius: 8px;
  box-shadow: 0 10px 26px rgb(23 32 51 / 6%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.prompt-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  content: "";
  background: var(--prompt-color);
}

.prompt-card:hover {
  border-color: color-mix(in srgb, var(--prompt-color) 36%, transparent);
  box-shadow: 0 18px 38px rgb(23 32 51 / 10%);
  transform: translateY(-2px);
}

.prompt-card:focus-visible {
  outline: 2px solid var(--prompt-color);
  outline-offset: 2px;
}

.prompt-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 18px;
  color: var(--prompt-color);
  background: color-mix(in srgb, var(--prompt-color) 12%, white);
  border-radius: 8px;
}

.prompt-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 720;
  color: #172033;
}

.prompt-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #667085;
}

.prompt-card--blue {
  --prompt-color: #5d87ff;
}

.prompt-card--cyan {
  --prompt-color: #2dd4bf;
}

.prompt-card--violet {
  --prompt-color: #8b5cf6;
}

.prompt-card--amber {
  --prompt-color: #f59e0b;
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
