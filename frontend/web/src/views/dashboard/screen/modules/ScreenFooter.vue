<template>
  <footer class="screen-footer">
    <span>CPU {{ cpu }}%</span><span class="sep">│</span> <span>内存 {{ mem }}%</span
    ><span class="sep">│</span> <span>磁盘 {{ disk }}%</span><span class="sep">│</span>
    <span>网络延迟 {{ networkLatency }}ms</span><span class="sep">│</span>
    <span>{{ uptime }}</span>
  </footer>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({ name: "ScreenFooter" });

const cpu = ref(42);
const mem = ref(61);
const disk = ref(35);
const uptime = ref("7d 14h 32m");
const networkLatency = ref(12);
</script>

<style scoped>
.screen-footer {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 12px;
  opacity: 0.4;
  border-top: 1px solid rgba(26, 40, 80, 0.6);
}
.sep {
  opacity: 0.3;
}
</style>
