<template>
  <div class="internal-app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ appTitle }}</span>
          <el-button type="primary" link @click="$router.back()">返回</el-button>
        </div>
      </template>
      <div class="app-content">
        <iframe
          v-if="appUrl"
          :src="appUrl"
          class="app-iframe"
          frameborder="0"
        ></iframe>
        <el-empty v-else description="应用加载失败" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const appTitle = ref('内部应用');
const appUrl = ref('');

onMounted(() => {
  const appId = route.params.appId as string;
  // 这里可以根据appId加载对应的应用URL
  // 示例：从后端获取应用配置
  loadApp(appId);
});

const loadApp = async (appId: string) => {
  try {
    loading.value = true;
    // TODO: 调用API获取应用信息
    // const res = await AppAPI.getAppDetail(appId);
    // appTitle.value = res.data.title;
    // appUrl.value = res.data.url;

    // 临时示例
    appTitle.value = `应用 ${appId}`;
    appUrl.value = `about:blank`;
  } catch (error) {
    console.error('加载应用失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.internal-app-container {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .app-content {
    height: calc(100vh - 200px);

    .app-iframe {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
