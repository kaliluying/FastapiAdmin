<template>
  <section v-if="results.length" class="runtime-log-report" aria-label="日志查询记录">
    <p class="report-boundary">只读查询 · 不保存到会话</p>
    <article
      v-for="(result, index) in results"
      :key="result.query_index || index"
      class="query-card"
    >
      <header class="query-header">
        <strong>第 {{ result.query_index || index + 1 }} 次查询</strong>
        <span v-if="result.truncated" class="query-warning">日志不完整</span>
        <span v-else>已返回</span>
      </header>
      <p v-if="result.query" class="query-filters">
        最近 {{ result.query.minutes }} 分钟 · {{ result.query.levels.join(" / ") }}
      </p>
      <dl v-if="result.query" class="query-identifiers">
        <template v-if="result.query.keyword">
          <dt>关键词</dt>
          <dd>{{ result.query.keyword }}</dd>
        </template>
        <template v-if="result.query.correlation_id">
          <dt>请求 ID</dt>
          <dd>{{ result.query.correlation_id }}</dd>
        </template>
      </dl>
      <p class="query-counts">
        匹配 {{ result.matched_count }} 条 · 提供 {{ result.returned_count }} 条证据
      </p>
      <p v-if="!result.returned_count" class="query-warning">
        未返回日志证据，不能据此判断系统正常。
      </p>
      <p v-else-if="result.truncated" class="query-warning">
        日志中存在未写完或无法识别的内容，请结合读取说明判断证据完整性。
      </p>
      <details class="query-details">
        <summary>时间与读取边界</summary>
        <p>
          {{ formatTime(result.start_time) }} 至 {{ formatTime(result.end_time) }}（服务器时间）
        </p>
        <p>{{ result.notice }}</p>
        <p v-if="result.scanned_files?.length">日志文件：{{ result.scanned_files.join("、") }}</p>
      </details>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { RuntimeLogResult } from "../types";

defineProps<{ results: RuntimeLogResult[] }>();

const formatTime = (value: string) => value.replace("T", " ").split(".")[0];
</script>

<style scoped lang="scss">
.runtime-log-report {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fa-color-text);
  overflow-wrap: anywhere;
}

.report-boundary {
  margin: 0;
  color: var(--fa-color-text-muted);
}

.query-card {
  padding: 12px;
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-control);

  p {
    margin: 8px 0 0;
  }
}

.query-header {
  display: flex;
  gap: 8px;
  justify-content: space-between;

  span {
    color: var(--fa-color-text-muted);
  }
}

.query-filters,
.query-details {
  color: var(--fa-color-text-muted);
}

.query-identifiers {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 8px;
  margin: 8px 0;

  dt {
    color: var(--fa-color-text-muted);
  }

  dd {
    margin: 0;
  }
}

.query-counts {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.query-warning {
  font-weight: 600;
}

.query-details {
  margin-top: 12px;

  summary {
    cursor: pointer;
  }

  summary:focus-visible {
    outline: 2px solid var(--theme-color);
    outline-offset: 2px;
  }
}
</style>
