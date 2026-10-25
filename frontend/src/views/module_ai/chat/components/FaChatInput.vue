<template>
  <div class="chat-input" :class="{ 'chat-input--disabled': disabled }">
    <div class="input-wrapper">
      <div v-if="uploadedFiles.length > 0" class="uploaded-files">
        <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
          <ElIcon class="file-icon"><Document /></ElIcon>
          <span class="file-name">{{ file.name }}</span>
          <span>{{
            file.status === "uploading" ? "解析中" : file.status === "error" ? file.error : "已解析"
          }}</span>
          <ElButton v-if="file.status === 'error'" link @click="parseFile(file)">重试</ElButton>
          <ElButton
            text
            :aria-label="`移除 ${file.name}`"
            :disabled="sending"
            @click="removeFile(file.id)"
            ><ElIcon><Close /></ElIcon
          ></ElButton>
        </div>
      </div>
      <div class="input-container">
        <ElForm>
          <ElInput
            v-model="inputMessage"
            type="textarea"
            aria-label="问题或消息"
            :placeholder="placeholder"
            :disabled="disabled"
            :autosize="{ minRows: isNarrowViewport ? 2 : 3, maxRows: isNarrowViewport ? 4 : 6 }"
            resize="none"
            class="message-input"
            maxlength="8000"
            show-word-limit
            @keydown="handleKeydown"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
          />
        </ElForm>
        <div class="input-footer">
          <div class="input-actions input-actions--leading">
            <ElUpload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              :accept="acceptTypes"
              :multiple="true"
            >
              <ElButton
                class="upload-btn"
                circle
                aria-label="添加文档附件"
                :disabled="disabled || sending"
                ><FaSvgIcon icon="ri:add-line"
              /></ElButton>
            </ElUpload>
            <span class="composer-divider" aria-hidden="true"></span>
            <span class="composer-mode">
              <FaSvgIcon icon="ri:chat-3-line" />
              AI 助手
            </span>
          </div>
          <div class="input-actions input-actions--trailing">
            <span class="input-hint">Enter 发送 · Shift + Enter 换行</span>
            <span class="composer-status" :class="{ 'composer-status--offline': disabled }">
              <i aria-hidden="true"></i>{{ sending ? "生成中" : "就绪" }}
            </span>
            <ElButton
              v-if="!sending"
              :disabled="
                (!inputMessage.trim() && uploadedFiles.length === 0) ||
                disabled ||
                sending ||
                uploadedFiles.some((file) => file.status !== 'ready')
              "
              class="send-button"
              type="primary"
              circle
              aria-label="发送消息"
              @click="handleSend"
            >
              <FaSvgIcon icon="ri:arrow-up-line" />
            </ElButton>
            <ElButton
              v-else
              class="send-button stop-button"
              circle
              aria-label="停止生成"
              @click="emit('stop')"
            >
              <FaSvgIcon icon="ri:stop-fill" />
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { Document, Close } from "@element-plus/icons-vue";
import type { UploadFile, UploadInstance } from "element-plus";
import type { UploadedFile } from "../types";
import { AiChatAPI } from "@/api/module_ai/chat";
import { ElMessage } from "element-plus";

interface Props {
  disabled?: boolean;
  sending?: boolean;
}

interface Emits {
  (e: "send", message: string, files?: UploadedFile[]): void;
  (e: "stop"): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  sending: false,
});

const emit = defineEmits<Emits>();

const inputMessage = ref("");
const isComposing = ref(false);
const isNarrowViewport = useMediaQuery("(max-width: 640px)");
const uploadRef = ref<UploadInstance>();
const uploadedFiles = ref<UploadedFile[]>([]);

const acceptTypes = computed(() => {
  return ".pdf,.docx,.txt,.md";
});

const placeholder = computed(() => {
  if (props.sending) return "正在回答，你可以先写下一个问题";
  return "输入问题，或添加文档后提问";
});

const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;

  const maxSize = 10 * 1024 * 1024;
  if (props.sending || uploadedFiles.value.length >= 5) {
    ElMessage.warning("最多添加 5 个附件，请等待当前回答结束");
    return;
  }
  if (!/\.(txt|md|pdf|docx)$/i.test(file.name)) {
    ElMessage.error("仅支持 TXT、MD、PDF、DOCX 附件");
    return;
  }
  if (file.size > maxSize) {
    ElMessage.error("文件大小不能超过10MB");
    return;
  }

  const uploadedFile: UploadedFile = {
    id: Date.now().toString() + Math.random().toString(36).substr(2),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
    status: "uploading",
  };

  uploadedFiles.value.push(uploadedFile);
  void parseFile(uploadedFiles.value[uploadedFiles.value.length - 1]!);
};

const parseFile = async (file: UploadedFile) => {
  if (!file.file) return;
  file.status = "uploading";
  file.error = undefined;
  const body = new FormData();
  body.append("file", file.file);
  try {
    const response = await AiChatAPI.parseAttachment(body);
    Object.assign(file, response.data.data, { status: "ready" });
    if (file.truncated)
      ElMessage.warning(`${file.name} 较长，已截取解析正文；实际用于回答的范围以回答依据为准`);
  } catch {
    file.status = "error";
    file.error = "解析失败";
  }
};

const removeFile = (id: string) => {
  const index = uploadedFiles.value.findIndex((f) => f.id === id);
  if (index > -1) {
    uploadedFiles.value.splice(index, 1);
  }
};

const handleKeydown = (event: Event | KeyboardEvent) => {
  if (!(event instanceof KeyboardEvent)) return;
  if (
    event.key !== "Enter" ||
    event.shiftKey ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.isComposing ||
    event.keyCode === 229 ||
    isComposing.value
  )
    return;
  event.preventDefault();
  handleSend();
};

const handleSend = () => {
  const message = inputMessage.value.trim();
  if (
    (!message && uploadedFiles.value.length === 0) ||
    props.disabled ||
    props.sending ||
    isComposing.value ||
    uploadedFiles.value.some((file) => file.status !== "ready")
  ) {
    return;
  }
  emit("send", message, uploadedFiles.value.length > 0 ? [...uploadedFiles.value] : undefined);
};

defineExpose({
  clearDraft: (sentMessage: string) => {
    if (inputMessage.value.trim() !== sentMessage.trim()) return;
    inputMessage.value = "";
    uploadedFiles.value = [];
    uploadRef.value?.clearFiles();
  },
  focus: () => {
    const input = document.querySelector(".message-input textarea") as HTMLTextAreaElement;
    input?.focus();
  },
});
</script>

<style lang="scss" scoped>
.chat-input {
  color: var(--fa-color-text);
  background: transparent;
}

.input-wrapper {
  max-width: 900px;
  padding: 16px 20px 18px;
  margin: 0 auto;
}

.uploaded-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 88px;
  margin-bottom: 10px;
  overflow-y: auto;
}

.file-item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  max-width: 100%;
  padding: 4px 10px;
  font-size: 12px;
  background: var(--fa-glass-bg-inset);
  border: 1px solid var(--fa-glass-border);
  border-radius: 14px;
  box-shadow: var(--fa-shadow-bento);
  -webkit-backdrop-filter: var(--fa-glass-blur);
  backdrop-filter: var(--fa-glass-blur);
}

.file-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-container {
  position: relative;
  padding: 14px 18px 12px;
  overflow: hidden;
  color: var(--fa-color-text);
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-glass-border);
  border-radius: var(--fa-radius-bento);
  box-shadow: var(--fa-shadow-bento);
  -webkit-backdrop-filter: var(--fa-glass-blur);
  backdrop-filter: var(--fa-glass-blur);
  transition:
    border-color var(--fa-motion-control),
    box-shadow var(--fa-motion-control);

  &:focus-within {
    border-color: color-mix(in srgb, var(--theme-color) 65%, var(--fa-glass-border));
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--theme-color) 16%, transparent),
      var(--fa-shadow-bento-hover);
  }
}

.input-footer,
.input-actions,
.composer-mode {
  display: flex;
  gap: 8px;
  align-items: center;
}

.composer-status {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  color: var(--fa-color-text-muted);

  i {
    width: 6px;
    height: 6px;
    background: var(--fa-color-success);
    border-radius: 50%;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fa-color-success) 12%, transparent);
  }

  &--offline i {
    background: var(--fa-color-text-muted);
    box-shadow: none;
  }
}

.message-input :deep(.el-textarea__inner) {
  min-height: 72px !important;
  max-height: 180px;
  padding: 4px 2px 18px;
  line-height: 1.55;
  color: var(--fa-color-text);
  background: transparent !important;
  border: 0 !important;
  border-radius: 0;
  box-shadow: none !important;

  &::placeholder {
    color: var(--fa-color-text-muted);
  }
}

.message-input :deep(.el-input__count) {
  right: 2px;
  bottom: 2px;
  color: var(--fa-color-text-muted);
  background: transparent;
}

.input-footer {
  justify-content: space-between;
  min-height: 34px;
  padding-top: 4px;
  margin-top: 2px;
}

.input-hint {
  font-size: 12px;
  color: var(--fa-color-text-muted);
}

.input-actions {
  flex-shrink: 0;

  &--leading {
    color: var(--fa-color-text);
  }

  &--trailing {
    gap: 12px;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.composer-mode {
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--theme-color);
  background: color-mix(in srgb, var(--theme-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-color) 18%, transparent);
  border-radius: 8px;
}

.composer-divider {
  width: 1px;
  height: 18px;
  background: var(--fa-glass-border);
}

.upload-btn,
.send-button {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  box-shadow: none;
}

.upload-btn {
  color: var(--fa-color-text);
  background: var(--fa-glass-bg-inset);
  border: 1px solid var(--fa-glass-border);
  box-shadow: var(--fa-shadow-bento);
  transition:
    color var(--fa-motion-control),
    background-color var(--fa-motion-control),
    border-color var(--fa-motion-control),
    transform var(--fa-motion-control),
    box-shadow var(--fa-motion-control);

  &:hover,
  &:focus-visible {
    color: var(--theme-color);
    background: var(--fa-hover-color);
    border-color: color-mix(in srgb, var(--theme-color) 35%, var(--fa-glass-border));
    box-shadow: var(--fa-shadow-bento-hover);
    transform: translateY(-1px);
  }
}

.send-button {
  color: var(--el-color-white);
  background: var(--theme-color);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-color) 32%, transparent);
  transition:
    transform var(--fa-motion-control),
    background-color var(--fa-motion-control),
    box-shadow var(--fa-motion-control);

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    background: var(--el-color-primary-dark-2);
    box-shadow: 0 6px 18px color-mix(in srgb, var(--theme-color) 45%, transparent);
    transform: translateY(-1px);
  }

  &:not(:disabled):active {
    transform: scale(0.92);
  }

  &:disabled {
    color: var(--fa-color-text-muted);
    background: var(--fa-glass-bg-inset);
    border: 1px solid var(--fa-glass-border);
    box-shadow: none;
  }

  &.stop-button {
    background: var(--el-color-danger);

    &:hover,
    &:focus-visible {
      background: var(--el-color-danger-dark-2);
      box-shadow: 0 6px 18px color-mix(in srgb, var(--el-color-danger) 45%, transparent);
      transform: translateY(-1px);
    }
  }
}

.upload-btn:focus-visible,
.send-button:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .input-container,
  .upload-btn,
  .send-button {
    transition: none;

    &:active {
      transform: none;
    }
  }
}

@media (width <= 768px) {
  .upload-btn,
  .send-button {
    width: 44px;
    height: 44px;
  }
}

@media (width <= 640px) {
  .input-wrapper {
    padding: 10px 12px 12px;
  }

  .input-container {
    padding: 12px 14px 10px;
    border-radius: 18px;
  }

  .input-hint {
    display: none;
  }

  .message-input :deep(.el-textarea__inner) {
    min-height: 64px !important;
    max-height: 120px;
  }

  .composer-mode {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
