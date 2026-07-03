<!-- 分页组件 -->
<template>
  <ElScrollbar>
    <div :class="{ hidden: hidden }" class="pagination">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :background="background"
        :disabled="disabled"
        :layout="layout"
        :page-sizes="pageSizes"
        :pager-count="pagerCount"
        :size="size"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </ElScrollbar>
</template>

<script setup lang="ts">
import { watch } from "vue";

defineOptions({ name: "FaPagination" });

interface Props {
  total?: number;
  pageSizes?: number[];
  layout?: string;
  background?: boolean;
  disabled?: boolean;
  /** 页码按钮数量（透传 ElPagination） */
  pagerCount?: number;
  /** 分页器尺寸（透传 ElPagination） */
  size?: "" | "default" | "small" | "large";
  autoScroll?: boolean;
  hidden?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  pageSizes: () => [10, 20, 30, 50, 100],
  layout: "total, sizes, prev, pager, next, jumper",
  background: true,
  disabled: false,
  pagerCount: undefined,
  size: undefined,
  autoScroll: true,
  hidden: false,
});

interface Emits {
  pagination: [params: { page: number; limit: number }];
}

const emit = defineEmits<Emits>();

const currentPage = defineModel("page", {
  type: Number,
  required: true,
  default: 1,
});

const pageSize = defineModel("limit", {
  type: Number,
  required: true,
  default: 10,
});

watch(
  () => props.total,
  (newVal: number) => {
    const lastPage = Math.ceil(newVal / pageSize.value);
    if (newVal > 0 && currentPage.value > lastPage) {
      currentPage.value = lastPage;
      emit("pagination", { page: currentPage.value, limit: pageSize.value });
    }
  }
);

function handleSizeChange(val: number) {
  currentPage.value = 1;
  emit("pagination", { page: currentPage.value, limit: val });
}

function handleCurrentChange(val: number) {
  emit("pagination", { page: val, limit: pageSize.value });
}
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: center;
  // padding: 12px 0;
}
</style>
