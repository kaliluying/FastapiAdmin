<!-- 复制组件 -->
<template>
  <ElButton link :style="style" aria-label="复制" v-bind="$attrs" @click="handleClipboard">
    <slot>
      <ElIcon><DocumentCopy color="var(--el-color-primary)" /></ElIcon>
    </slot>
  </ElButton>
</template>

<script setup lang="ts">
import { DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "FaCopyButton",
  inheritAttrs: false,
});

const { t } = useI18n();

interface Props {
  text?: string;
  style?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  text: "",
  style: () => ({}),
});

async function handleClipboard() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // 使用 Clipboard API
    try {
      await navigator.clipboard.writeText(props.text);
      ElMessage.success(t("common.copySuccess"));
    } catch (error) {
      ElMessage.warning(t("common.copyFailed"));
      console.warn("[FaCopyButton] Copy failed:", error);
    }
  } else {
    // 兼容性处理（useClipboard 有兼容性问题）
    const previousFocus = document.activeElement;
    const input = document.createElement("textarea");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.value = props.text;
    input.readOnly = true;
    document.body.appendChild(input);
    input.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        ElMessage.success(t("common.copySuccess"));
      } else {
        ElMessage.warning(t("common.copyFailed"));
      }
    } catch (err) {
      ElMessage.warning(t("common.copyFailed"));
      console.warn("[FaCopyButton] Copy failed:", err);
    } finally {
      document.body.removeChild(input);
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
  }
}
</script>
