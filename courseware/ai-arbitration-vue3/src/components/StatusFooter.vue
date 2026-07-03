<template>
  <footer class="footer">
    <strong>系统状态</strong>
    <span v-for="[name, status] in systemStatuses" :key="name" class="status-pill">
      {{ name }} <b>{{ status }}</b>
    </span>
  </footer>
</template>

<script setup lang="ts">
import { systemStatuses } from "../data/mock";
</script>
