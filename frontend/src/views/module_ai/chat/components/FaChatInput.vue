<template>
  <div class="chat-input" :class="{ 'chat-input--disabled': disabled }">
    <div class="input-wrapper">
      <div v-if="uploadedFiles.length > 0" class="uploaded-files">
        <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
          <ElIcon class="file-icon"><Document /></ElIcon>
          <span class="file-name">{{ file.name }}</span>
          <ElIcon class="file-remove" @click="removeFile(file.id)"><Close /></ElIcon>
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
            :placeholder="placeholder"
            :disabled="disabled || sending"
            :autosize="{ minRows: 3, maxRows: 8 }"
            resize="none"
            class="message-input"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.shift.enter.exact="handleShiftEnter"
          />
        </ElForm>
        <div class="input-footer">
          <span class="input-hint">Enter 发送 / Shift + Enter 换行</span>
          <div class="input-actions">
            <ElUpload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              :accept="acceptTypes"
              :multiple="true"
            >
              <ElButton :icon="Paperclip" class="upload-btn" circle />
            </ElUpload>
            <ElButton
              :disabled="
                (!inputMessage.trim() && uploadedFiles.length === 0) || disabled || sending
              "
              :loading="sending"
              class="send-button"
              type="primary"
              circle
              @click="handleSend"
            >
              <ElIcon><Promotion /></ElIcon>
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Promotion, Paperclip, Document, Close } from "@element-plus/icons-vue";
import type { UploadFile } from "element-plus";
import type { UploadedFile } from "../types";

interface Props {
  disabled?: boolean;
  sending?: boolean;
  isConnected?: boolean;
}

interface Emits {
  (e: "send", message: string, files?: UploadedFile[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  sending: false,
  isConnected: true,
});

const emit = defineEmits<Emits>();

const inputMessage = ref("");
const uploadedFiles = ref<UploadedFile[]>([]);

const acceptTypes = computed(() => {
  return ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.avi,.mov";
});

const placeholder = computed(() => {
  return props.isConnected ? "向FA助手发送消息..." : "请先连接到服务器";
});

const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("文件大小不能超过10MB");
    return;
  }

  const uploadedFile: UploadedFile = {
    id: Date.now().toString() + Math.random().toString(36).substr(2),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  };

  uploadedFiles.value.push(uploadedFile);
};

const removeFile = (id: string) => {
  const index = uploadedFiles.value.findIndex((f) => f.id === id);
  if (index > -1) {
    uploadedFiles.value.splice(index, 1);
  }
};

const handleSend = () => {
  const message = inputMessage.value.trim();
  if ((!message && uploadedFiles.value.length === 0) || props.disabled || props.sending) {
    return;
  }
  emit("send", message, uploadedFiles.value.length > 0 ? [...uploadedFiles.value] : undefined);
  inputMessage.value = "";
  uploadedFiles.value = [];
};

const handleShiftEnter = () => {
  inputMessage.value += "\n";
};

defineExpose({
  focus: () => {
    const input = document.querySelector(".message-input textarea") as HTMLTextAreaElement;
    input?.focus();
  },
});
</script>

<style lang="scss" scoped>
.chat-input {
  .input-wrapper {
    max-width: 860px;
    padding: 16px 24px 18px;
    margin: 0 auto;

    .uploaded-files {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;

      .file-item {
        display: flex;
        gap: 6px;
        align-items: center;
        padding: 8px 14px;
        font-size: 13px;
        background: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary-light-7);
        }

        .file-icon {
          font-size: 16px;
          color: var(--el-color-primary);
        }

        .file-name {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13px;
          white-space: nowrap;
        }

        .file-remove {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: var(--el-color-danger);
          }
        }
      }
    }

    .input-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 112px;
      padding: 12px 16px 10px;
      background:
        linear-gradient(180deg, rgb(255 255 255 / 98%), rgb(249 251 255 / 96%)),
        var(--el-bg-color-overlay);
      border: 1px solid rgb(93 135 255 / 18%);
      border-radius: 8px;
      box-shadow: 0 16px 38px rgb(23 32 51 / 10%);
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

      &:hover {
        border-color: rgb(93 135 255 / 34%);
        box-shadow: 0 18px 44px rgb(23 32 51 / 12%);
      }

      &:focus-within {
        border-color: var(--el-color-primary);
        box-shadow:
          0 0 0 3px rgb(93 135 255 / 14%),
          0 18px 44px rgb(23 32 51 / 12%);
      }

      .composer-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 24px;
      }

      .composer-context,
      .composer-status {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        font-size: 12px;
        font-weight: 700;
      }

      .composer-context {
        color: #4070d8;
      }

      .composer-status {
        color: #0f9f8f;
      }

      .composer-status::before {
        width: 7px;
        height: 7px;
        content: "";
        background: #2dd4bf;
        border-radius: 999px;
        box-shadow: 0 0 0 4px rgb(45 212 191 / 12%);
      }

      .composer-status--offline {
        color: var(--el-text-color-secondary);
      }

      .composer-status--offline::before {
        background: var(--el-color-warning);
        box-shadow: 0 0 0 4px rgb(245 158 11 / 12%);
      }

      .message-input {
        flex: 1;
        min-width: 0;

        :deep(.el-textarea__inner) {
          min-height: 72px !important;
          max-height: 120px;
          padding: 2px 4px;
          line-height: 1.6;
          color: var(--el-text-color-primary);
          resize: none;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        :deep(.el-textarea) {
          padding: 0;
        }
      }

      .input-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 8px;
        border-top: 1px solid rgb(23 32 51 / 7%);

        .input-actions {
          display: flex;
          gap: 10px;
          align-items: center;

          .upload-btn {
            font-size: 18px;
            color: var(--el-text-color-secondary);
            border-radius: 8px;
            transition: all 0.2s ease;

            &:hover {
              color: var(--el-color-primary);
              transform: scale(1.05);
            }
          }

          .send-button {
            flex-shrink: 0;
            border-radius: 8px;
            box-shadow: 0 8px 18px rgb(93 135 255 / 24%);
            transition: all 0.2s ease;

            &:hover {
              box-shadow: 0 12px 24px rgb(93 135 255 / 28%);
              transform: translateY(-1px);
            }

            &:active {
              transform: translateY(0);
            }
          }
        }
      }
    }

    .input-hint {
      font-size: 12px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
      letter-spacing: 0;
    }
  }

  &.chat-input--disabled .input-wrapper .input-container {
    opacity: 0.72;
    filter: grayscale(0.06);

    &:hover {
      border-color: var(--el-border-color-light);
      box-shadow: var(--el-box-shadow-light);
    }

    &:focus-within {
      border-color: var(--el-border-color-light);
      box-shadow: var(--el-box-shadow-light);
    }
  }
}
</style>
