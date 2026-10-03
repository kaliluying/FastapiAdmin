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
        <div class="composer-topline">
          <span class="composer-context">
            <FaSvgIcon icon="ri:database-2-line" />
            知识库问答
          </span>
          <span class="composer-status" :class="{ 'composer-status--offline': !isConnected }">
            {{ isConnected ? "已连接" : "未连接" }}
          </span>
        </div>
        <ElForm>
          <ElInput
            v-model="inputMessage"
            type="textarea"
            aria-label="问题或消息"
            :placeholder="placeholder"
            :disabled="disabled || sending"
            :autosize="{ minRows: isNarrowViewport ? 2 : 3, maxRows: isNarrowViewport ? 4 : 6 }"
            resize="none"
            class="message-input"
            maxlength="8000"
            show-word-limit
            @keydown.enter.exact.prevent="handleSend"
          />
        </ElForm>
        <div class="input-footer">
          <span class="input-hint">Enter 发送 · Shift + Enter 换行</span>
          <div class="input-actions">
            <ElUpload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              :accept="acceptTypes"
              :multiple="true"
            >
              <ElButton
                :icon="Paperclip"
                class="upload-btn"
                circle
                aria-label="添加文档附件"
                :disabled="disabled || sending"
              />
            </ElUpload>
            <ElButton
              :disabled="
                (!inputMessage.trim() && uploadedFiles.length === 0) ||
                disabled ||
                sending ||
                uploadedFiles.some((file) => file.status !== 'ready')
              "
              :loading="sending"
              class="send-button"
              type="primary"
              circle
              aria-label="发送消息"
              @click="handleSend"
            >
              <ElIcon><Promotion /></ElIcon>
            </ElButton>
            <ElButton v-if="sending" @click="emit('stop')">停止生成</ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { Promotion, Paperclip, Document, Close } from "@element-plus/icons-vue";
import type { UploadFile, UploadInstance } from "element-plus";
import type { UploadedFile } from "../types";
import { AiChatAPI } from "@/api/module_ai/chat";
import { ElMessage } from "element-plus";

interface Props {
  disabled?: boolean;
  sending?: boolean;
  isConnected?: boolean;
}

interface Emits {
  (e: "send", message: string, files?: UploadedFile[]): void;
  (e: "stop"): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  sending: false,
  isConnected: true,
});

const emit = defineEmits<Emits>();

const inputMessage = ref("");
const isNarrowViewport = useMediaQuery("(max-width: 640px)");
const uploadRef = ref<UploadInstance>();
const uploadedFiles = ref<UploadedFile[]>([]);

const acceptTypes = computed(() => {
  return ".pdf,.docx,.txt,.md";
});

const placeholder = computed(() => {
  return props.isConnected ? "输入问题，或添加文档后提问" : "请先重新连接，再发送问题";
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

const handleSend = () => {
  const message = inputMessage.value.trim();
  if (
    (!message && uploadedFiles.value.length === 0) ||
    props.disabled ||
    props.sending ||
    uploadedFiles.value.some((file) => file.status !== "ready")
  ) {
    return;
  }
  emit("send", message, uploadedFiles.value.length > 0 ? [...uploadedFiles.value] : undefined);
};

defineExpose({
  clearDraft: () => {
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
  background: var(--fa-color-surface);
}

.input-wrapper {
  max-width: 860px;
  padding: 14px 20px;
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
  display: flex;
  gap: 6px;
  align-items: center;
  max-width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  background: var(--fa-color-surface-raised);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-control);
}

.file-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-container {
  padding: 10px 12px;
  background: var(--fa-color-surface);
  border: 1px solid var(--fa-color-border);
  border-radius: var(--fa-radius-control);
}

.input-container:focus-within {
  border-color: var(--theme-color);
  box-shadow: var(--fa-focus-ring);
}

.composer-topline,
.input-footer,
.input-actions,
.composer-context {
  display: flex;
  gap: 8px;
  align-items: center;
}

.composer-topline,
.input-footer {
  justify-content: space-between;
}

.composer-topline {
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--fa-color-text-muted);
}

.composer-status {
  color: var(--fa-color-success);
}

.composer-status--offline {
  color: var(--fa-color-text-muted);
}

.message-input :deep(.el-textarea__inner) {
  max-height: 144px;
  padding: 4px 0;
  line-height: 1.6;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.message-input :deep(.el-input__count) {
  background: var(--fa-color-surface);
}

.input-footer {
  padding-top: 8px;
  margin-top: 6px;
  border-top: 1px solid var(--fa-color-border);
}

.input-hint {
  font-size: 12px;
  color: var(--fa-color-text-muted);
}

.input-actions {
  flex-shrink: 0;
}

.input-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (width <= 640px) {
  .input-wrapper {
    padding: 10px 12px;
  }

  .composer-topline {
    margin-bottom: 2px;
  }

  .input-hint {
    display: none;
  }

  .input-footer {
    justify-content: flex-end;
  }

  .message-input :deep(.el-textarea__inner) {
    max-height: 100px;
  }
}
</style>
