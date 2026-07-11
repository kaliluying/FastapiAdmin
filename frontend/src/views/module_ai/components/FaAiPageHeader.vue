<template>
  <FaPageHeader :title="title" :description="description">
    <template #actions>
      <slot name="context" />
      <slot name="actions" />
    </template>
  </FaPageHeader>
</template>

<script setup lang="ts">
import FaPageHeader from "@/components/layouts/fa-page-header/index.vue";
defineOptions({ name: "FaAiPageHeader" });
interface Props { title: string; description?: string; }
defineProps<Props>();
</script>
