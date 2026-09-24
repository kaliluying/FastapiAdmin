<template>
  <section class="fa-enterprise-intro" aria-labelledby="enterprise-intro-title">
    <div class="fa-enterprise-intro__content">
      <div class="fa-enterprise-intro__eyebrow">
        <span aria-hidden="true"></span>
        FASTAPIADMIN / 工作空间
      </div>

      <div class="fa-enterprise-intro__header">
        <h1 id="enterprise-intro-title">让知识进入<br />日常工作。</h1>
        <p>在一个地方整理内部资料、获取有依据的回答，并管理团队的工作权限。</p>
      </div>

      <div class="fa-enterprise-intro__highlights" aria-label="主要能力">
        <article
          v-for="highlight in highlights"
          :key="highlight.title"
          class="fa-enterprise-intro__highlight"
        >
          <FaSvgIcon :icon="highlight.icon" aria-hidden="true" />
          <div>
            <h2>{{ highlight.title }}</h2>
            <p>{{ highlight.description }}</p>
          </div>
        </article>
      </div>

      <div class="fa-enterprise-intro__footer">知识库 / AI 对话 / 系统管理</div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: "FaEnterpriseIntro" });

const highlights = [
  {
    icon: "ri:book-open-line",
    title: "整理知识",
    description: "集中管理文档与检索内容",
  },
  {
    icon: "ri:chat-3-line",
    title: "获得回答",
    description: "在对话中查看回答依据",
  },
  {
    icon: "ri:shield-user-line",
    title: "控制访问",
    description: "按角色管理页面和操作权限",
  },
];
</script>

<style scoped lang="scss">
.fa-enterprise-intro {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: clamp(5rem, 8vw, 7.5rem) clamp(2rem, 6vw, 7rem) 3rem;
  overflow: hidden;
  color: #f3f8f7;
  background: #183a3c;
}

.fa-enterprise-intro::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background: repeating-linear-gradient(
    135deg,
    transparent 0 82px,
    rgb(255 255 255 / 3%) 83px 84px
  );
}

.fa-enterprise-intro__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(680px, 100%);
  min-height: min(650px, 100%);
}

.fa-enterprise-intro__eyebrow {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #a9d5cc;
  letter-spacing: 0.12em;
}

.fa-enterprise-intro__eyebrow span {
  width: 24px;
  height: 1px;
  background: currentcolor;
}

.fa-enterprise-intro__header {
  margin-top: clamp(2.5rem, 5vw, 5rem);
}

.fa-enterprise-intro__header h1 {
  margin: 0;
  font-size: clamp(3rem, 4.4vw, 5.3rem);
  font-weight: 670;
  line-height: 1.12;
  color: #fff;
  letter-spacing: -0.055em;
}

.fa-enterprise-intro__header p {
  max-width: 30rem;
  margin: 1.5rem 0 0;
  font-size: clamp(1rem, 1.2vw, 1.125rem);
  line-height: 1.8;
  color: #c4d8d4;
}

.fa-enterprise-intro__highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: clamp(3rem, 6vw, 5rem);
  border-top: 1px solid rgb(255 255 255 / 20%);
}

.fa-enterprise-intro__highlight {
  min-width: 0;
  padding: 1.5rem 1.25rem 0 0;
}

.fa-enterprise-intro__highlight + .fa-enterprise-intro__highlight {
  padding-left: 1.25rem;
  border-left: 1px solid rgb(255 255 255 / 14%);
}

.fa-enterprise-intro__highlight > .fa-svg-icon {
  font-size: 20px;
  color: #a9d5cc;
}

.fa-enterprise-intro__highlight h2 {
  margin: 1rem 0 0.35rem;
  font-size: 14px;
  font-weight: 650;
  color: #fff;
}

.fa-enterprise-intro__highlight p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: #b4ceca;
}

.fa-enterprise-intro__footer {
  padding-top: 2rem;
  margin-top: auto;
  font-size: 11px;
  color: #8fb3ae;
  letter-spacing: 0.1em;
}

@media (width <= 1180px) {
  .fa-enterprise-intro {
    min-height: 18rem;
    padding: 5rem 2rem 2rem;
  }

  .fa-enterprise-intro__content {
    min-height: 0;
  }
}

@media (width <= 760px) {
  .fa-enterprise-intro {
    padding: 4.75rem 1.25rem 1.5rem;
  }

  .fa-enterprise-intro__highlights {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 2rem;
  }

  .fa-enterprise-intro__highlight,
  .fa-enterprise-intro__highlight + .fa-enterprise-intro__highlight {
    padding: 0;
    border-left: 0;
  }

  .fa-enterprise-intro__footer {
    display: none;
  }
}
</style>
