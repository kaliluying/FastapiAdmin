<template>
  <section class="fa-enterprise-intro" aria-labelledby="enterprise-intro-title">
    <div class="fa-enterprise-intro__content">
      <p class="fa-enterprise-intro__badge">Enterprise Ready</p>

      <div class="fa-enterprise-intro__header">
        <h1 id="enterprise-intro-title">企业级管理系统</h1>
        <p>提供安全、高效、可扩展的管理解决方案，助力企业数字化转型与业务增长。</p>
      </div>

      <div class="fa-enterprise-intro__highlights" aria-label="Enterprise highlights">
        <article
          v-for="highlight in highlights"
          :key="highlight.code"
          class="fa-enterprise-intro__highlight"
        >
          <span class="fa-enterprise-intro__highlight-code">{{ highlight.code }}</span>
          <div>
            <h2>{{ highlight.title }}</h2>
            <p>{{ highlight.description }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: "FaEnterpriseIntro" });

const highlights = [
  {
    code: "RBAC",
    title: "权限",
    description: "细粒度角色与资源授权，覆盖复杂组织协作场景。",
  },
  {
    code: "Audit",
    title: "审计",
    description: "关键操作留痕可追溯，帮助团队满足安全合规要求。",
  },
  {
    code: "API",
    title: "接口优先",
    description: "以开放接口连接业务系统，支撑快速集成与扩展。",
  },
];
</script>

<style scoped lang="scss">
.fa-enterprise-intro {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: clamp(5rem, 8vw, 7.5rem) clamp(2rem, 5vw, 6rem) clamp(2rem, 5vw, 4rem);
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(135deg, rgb(13 39 74 / 92%), rgb(33 88 94 / 88%)),
    radial-gradient(circle at 25% 20%, rgb(74 222 128 / 26%), transparent 34%),
    radial-gradient(circle at 78% 72%, rgb(56 189 248 / 22%), transparent 35%),
    #0f2f46;

  &::before,
  &::after {
    position: absolute;
    pointer-events: none;
    content: "";
  }

  &::before {
    inset: 0;
    background-image:
      linear-gradient(rgb(255 255 255 / 7%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / 7%) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(120deg, rgb(0 0 0 / 82%), transparent 72%);
  }

  &::after {
    right: clamp(1.5rem, 7vw, 7rem);
    bottom: clamp(2rem, 8vw, 7rem);
    width: clamp(12rem, 22vw, 22rem);
    aspect-ratio: 1;
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 50%;
    box-shadow:
      inset 0 0 0 32px rgb(255 255 255 / 4%),
      inset 0 0 0 72px rgb(255 255 255 / 3%);
  }
}

.fa-enterprise-intro__content {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
}

.fa-enterprise-intro__badge {
  display: inline-flex;
  align-items: center;
  height: 2rem;
  padding: 0 0.875rem;
  margin: 0 0 1.25rem;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1;
  color: rgb(209 250 229);
  letter-spacing: 0;
  text-transform: uppercase;
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
}

.fa-enterprise-intro__header {
  h1 {
    margin: 0;
    font-size: clamp(2.5rem, 4.6vw, 5rem);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: 0;
  }

  p {
    max-width: 36rem;
    margin: 1.25rem 0 0;
    font-size: clamp(1rem, 1.35vw, 1.25rem);
    line-height: 1.8;
    color: rgb(236 253 245 / 82%);
  }
}

.fa-enterprise-intro__highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: clamp(2.25rem, 4vw, 4rem);
}

.fa-enterprise-intro__highlight {
  min-width: 0;
  padding: 1.125rem;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 8px;
  box-shadow: 0 18px 48px rgb(0 0 0 / 16%);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);

  h2 {
    margin: 0.875rem 0 0.35rem;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.65;
    color: rgb(236 253 245 / 74%);
  }
}

.fa-enterprise-intro__highlight-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.25rem;
  height: 1.75rem;
  padding: 0 0.6rem;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1;
  color: #0f2f46;
  letter-spacing: 0;
  background: rgb(167 243 208);
  border-radius: 999px;
}

@media (width <= 1180px) {
  .fa-enterprise-intro {
    min-height: 18rem;
    padding: 5rem 2rem 2rem;
  }

  .fa-enterprise-intro__content {
    width: min(860px, 100%);
  }

  .fa-enterprise-intro__header {
    h1 {
      font-size: 2.5rem;
    }

    p {
      max-width: 42rem;
    }
  }
}

@media (width <= 760px) {
  .fa-enterprise-intro {
    align-items: flex-start;
    min-height: 20rem;
    padding: 4.75rem 1.25rem 1.5rem;
  }

  .fa-enterprise-intro__header h1 {
    font-size: 2rem;
  }

  .fa-enterprise-intro__highlights {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .fa-enterprise-intro__highlight {
    display: flex;
    gap: 0.875rem;
    align-items: flex-start;
    padding: 0.875rem;

    h2 {
      margin-top: 0;
    }
  }
}
</style>
