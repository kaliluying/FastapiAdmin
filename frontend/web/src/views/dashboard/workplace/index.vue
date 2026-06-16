<template>
  <div class="workplace-container">
    <!-- 电商模块 -->
    <div class="card-group">
      <ElRow :gutter="24">
        <ElCol :sm="12" :md="12" :lg="6"><TotalOrderVolume /></ElCol>
        <ElCol :sm="12" :md="12" :lg="6"><TotalProducts /></ElCol>
        <ElCol :sm="24" :md="12" :lg="6"><ProductSales /></ElCol>
        <ElCol :sm="24" :md="12" :lg="6"><SalesGrowth /></ElCol>
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :span="24"><CartConversionRate /></ElCol>
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :sm="12" :md="12" :lg="6"><SalesTrend /></ElCol>
        <ElCol :sm="12" :md="12" :lg="6"><SalesClassification /></ElCol>
        <ElCol :sm="24" :md="12" :lg="6"><HotCommodity /></ElCol>
        <ElCol :sm="24" :md="12" :lg="6"><AnnualSales /></ElCol>
      </ElRow>
    </div>

    <!-- 用户分析 -->
    <div class="card-group">
      <ElRow :gutter="24">
        <ElCol :sm="24" :md="12" :lg="12" class="mb-5"><ActiveUser /></ElCol>
        <ElCol :sm="24" :md="12" :lg="12" class="mb-5"><SalesOverview /></ElCol>
      </ElRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActiveUser from "./modules/active-user.vue";
import SalesOverview from "./modules/sales-overview.vue";
import TotalOrderVolume from "./modules/total-order-volume.vue";
import TotalProducts from "./modules/total-products.vue";
import SalesTrend from "./modules/sales-trend.vue";
import SalesClassification from "./modules/sales-classification.vue";
import HotCommodity from "./modules/hot-commodity.vue";
import AnnualSales from "./modules/annual-sales.vue";
import ProductSales from "./modules/product-sales.vue";
import SalesGrowth from "./modules/sales-growth.vue";
import CartConversionRate from "./modules/cart-conversion-rate.vue";

defineOptions({ name: "DashboardWorkplace" });
</script>

<style scoped>
:deep(.el-card) {
  --el-card-border-radius: calc(var(--custom-radius) + 2px);

  border: 1px solid var(--fa-card-border);
}

.workplace-container {
  display: flex;
  flex-direction: column;

  > * {
    margin-bottom: 16px;
  }

  > :last-child {
    margin-bottom: 0;
  }

  &::after {
    display: block;
    flex-shrink: 0;
    height: 16px;
    content: "";
  }
}

.card-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-row {
  row-gap: 16px;
}
</style>
