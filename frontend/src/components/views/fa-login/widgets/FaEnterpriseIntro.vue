<template>
  <section class="fa-enterprise-intro" aria-labelledby="enterprise-intro-title">
    <div class="fa-enterprise-intro__visual" aria-hidden="true">
      <div class="fa-enterprise-intro__sheet"></div>
      <div class="fa-enterprise-intro__sheet"></div>
      <div class="fa-enterprise-intro__sheet"></div>
    </div>
    <div class="fa-enterprise-intro__content">
      <div class="fa-enterprise-intro__eyebrow">
        <span aria-hidden="true"></span>
        知识 · 对话 · 协作
      </div>

      <div class="fa-enterprise-intro__header">
        <h2 id="enterprise-intro-title">让知识流动，<br />让工作向前。</h2>
        <p>从一份文档，到一个有依据的回答。<br />在这里，连接团队的知识与日常工作。</p>
      </div>

      <div class="fa-enterprise-intro__highlights" aria-label="主要能力">
        <article
          v-for="highlight in highlights"
          :key="highlight.title"
          class="fa-enterprise-intro__highlight"
        >
          <FaSvgIcon :icon="highlight.icon" aria-hidden="true" />
          <div>
            <h3>{{ highlight.title }}</h3>
            <p>{{ highlight.description }}</p>
          </div>
        </article>
      </div>

      <div class="fa-enterprise-intro__footer">
        <span>FastCore</span>
        <span>你的团队知识空间</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: "FaEnterpriseIntro" });

const highlights = [
  {
    icon: "ri:book-open-line",
    title: "整理知识",
    description: "让团队资料有序可寻",
  },
  {
    icon: "ri:chat-3-line",
    title: "获得回答",
    description: "在对话中，追溯回答依据",
  },
  {
    icon: "ri:shield-user-line",
    title: "控制访问",
    description: "为不同角色，划定工作边界",
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
  padding: 8rem clamp(2.5rem, 5vw, 5.5rem) 2.5rem;
  overflow: hidden;
  color: var(--fa-color-brand-panel-text);
  background: var(--fa-color-brand-panel);
  border-radius: 24px;
}

.fa-enterprise-intro::before {
  position: absolute;
  inset: auto 0 0;
  height: 45%;
  pointer-events: none;
  content: "";
  background-image: radial-gradient(var(--fa-color-brand-panel-divider) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(transparent, #000);
}

.fa-enterprise-intro__visual {
  position: absolute;
  right: -110px;
  bottom: 15%;
  width: 330px;
  height: 390px;
  pointer-events: none;
  transform: rotate(-12deg);
}

.fa-enterprise-intro__sheet {
  position: absolute;
  inset: 0;
  background: var(--fa-color-brand-panel-surface);
  border: 1px solid var(--fa-color-brand-panel-divider);
  border-radius: 18px;
}

.fa-enterprise-intro__sheet:nth-child(1) {
  transform: translate(-72px, -42px) rotate(-12deg);
}

.fa-enterprise-intro__sheet:nth-child(2) {
  transform: translate(-36px, -21px) rotate(-6deg);
}

.fa-enterprise-intro__sheet:last-child::before {
  position: absolute;
  inset: 36px 32px auto;
  height: 8px;
  content: "";
  background: var(--fa-color-brand-panel-divider);
  border-radius: 4px;
  box-shadow:
    0 32px 0 var(--fa-color-brand-panel-surface-hover),
    0 64px 0 var(--fa-color-brand-panel-surface-hover),
    0 96px 0 var(--fa-color-brand-panel-surface-hover);
}

.fa-enterprise-intro__sheet:last-child::after {
  position: absolute;
  right: 32px;
  bottom: 32px;
  width: 42px;
  height: 42px;
  content: "";
  border: 1px solid var(--fa-color-brand-panel-divider);
  border-radius: 50%;
}

.fa-enterprise-intro__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 580px;
}

.fa-enterprise-intro__eyebrow {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--fa-color-brand-panel-accent);
  letter-spacing: 0.18em;
}

.fa-enterprise-intro__eyebrow span {
  width: 7px;
  height: 7px;
  background: currentcolor;
  border-radius: 50%;
}

.fa-enterprise-intro__header {
  margin-top: 2rem;
}

.fa-enterprise-intro__header h2 {
  margin: 0;
  font-size: clamp(2.75rem, 4.1vw, 4.5rem);
  font-weight: 600;
  line-height: 1.25;
  color: var(--fa-color-brand-panel-text);
  letter-spacing: -0.045em;
}

.fa-enterprise-intro__header p {
  max-width: 25rem;
  margin: 1.5rem 0 0;
  font-size: 15px;
  line-height: 1.8;
  color: var(--fa-color-brand-panel-muted);
}

.fa-enterprise-intro__highlights {
  display: grid;
  gap: 1.25rem;
  margin-top: 3rem;
}

.fa-enterprise-intro__highlight {
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.fa-enterprise-intro__highlight > .fa-svg-icon {
  flex-shrink: 0;
  padding: 10px;
  font-size: 40px;
  color: var(--fa-color-brand-panel-accent);
  background: var(--fa-color-brand-panel-surface);
  border: 1px solid var(--fa-color-brand-panel-divider);
  border-radius: 12px;
}

.fa-enterprise-intro__highlight h3 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 650;
  color: var(--fa-color-brand-panel-text);
}

.fa-enterprise-intro__highlight p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--fa-color-brand-panel-muted);
}

.fa-enterprise-intro__footer {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-top: 1.25rem;
  margin-top: 3rem;
  font-size: 11px;
  color: var(--fa-color-brand-panel-muted);
  letter-spacing: 0.1em;
  border-top: 1px solid var(--fa-color-brand-panel-divider);
}

@media (height <= 800px) and (width >= 1181px) {
  .fa-enterprise-intro {
    padding-top: 6rem;
    padding-bottom: 2rem;
  }

  .fa-enterprise-intro__header h2 {
    font-size: clamp(2.5rem, 3.5vw, 3.5rem);
  }

  .fa-enterprise-intro__header {
    margin-top: 1.5rem;
  }

  .fa-enterprise-intro__highlights {
    margin-top: 1.75rem;
  }

  .fa-enterprise-intro__footer {
    margin-top: 1.75rem;
  }
}

@media (height <= 680px) and (width >= 1181px) {
  .fa-enterprise-intro__highlights {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .fa-enterprise-intro__highlight {
    gap: 8px;
  }

  .fa-enterprise-intro__highlight h3 {
    margin: 0;
    font-size: 13px;
  }

  .fa-enterprise-intro__highlight p {
    display: none;
  }
}
</style>
