<template>
  <FaPageHeader class="ai-page-header" :title="title" :description="description">
    <template v-if="$slots.context || $slots.actions" #actions>
      <slot name="context" />
      <slot name="actions" />
    </template>
  </FaPageHeader>
</template>

<script setup lang="ts">
import FaPageHeader from "@/components/layouts/fa-page-header/index.vue";
defineOptions({ name: "FaAiPageHeader" });
interface Props {
  title: string;
  description?: string;
}
defineProps<Props>();
</script>

<style scoped>
.ai-page-header {
  flex-shrink: 0;
}

.ai-page-header :deep(.fa-page-header__description) {
  max-width: 640px;
}

.ai-page-header :deep(.fa-page-header__actions .el-button + .el-button) {
  margin-left: 0;
}
</style>
