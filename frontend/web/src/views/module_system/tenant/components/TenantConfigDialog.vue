<template>
  <FaDialog
    v-model="visible"
    title="租户个性化配置"
    width="700px"
    form-mode="update"
    :confirm-loading="loading"
    @confirm="handleSubmit"
    @cancel="visible = false"
  >
    <ElTabs v-model="activeTab" type="border-card">
      <!-- 网站配置 -->
      <ElTabPane label="网站信息" name="website">
        <FaForm
          v-model="formData.website"
          :items="websiteItems"
          :label-width="120"
          label-position="right"
          :span="24"
          :show-reset="false"
          :show-submit="false"
        />
      </ElTabPane>

      <!-- 品牌标识 -->
      <ElTabPane label="品牌标识" name="brand">
        <ElForm :model="formData.brand" label-position="top" class="brand-form">
          <ElRow :gutter="24">
            <ElCol :span="8">
              <ElFormItem label="网站 Logo">
                <FaUpload
                  v-model="formData.brand.tenant_logo"
                  :data="{ type: 'tenant_logo' }"
                  name="file"
                  :max-file-size="5"
                  :show-tip="true"
                  :enable-preview="true"
                  :enable-crop="true"
                  v-bind="brandCropBind('tenant_logo')"
                  @success="(fileInfo: UploadFilePath) => handleUploadSuccess(fileInfo, 'tenant_logo')"
                  @error="handleUploadError"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="Favicon">
                <FaUpload
                  v-model="formData.brand.tenant_favicon"
                  :data="{ type: 'tenant_favicon' }"
                  name="file"
                  :max-file-size="5"
                  :show-tip="true"
                  :enable-preview="true"
                  :enable-crop="true"
                  v-bind="brandCropBind('tenant_favicon')"
                  @success="(fileInfo: UploadFilePath) => handleUploadSuccess(fileInfo, 'tenant_favicon')"
                  @error="handleUploadError"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="登录背景图">
                <FaUpload
                  v-model="formData.brand.tenant_login_bg"
                  :data="{ type: 'tenant_login_bg' }"
                  name="file"
                  :max-file-size="10"
                  :show-tip="true"
                  :enable-preview="true"
                  :enable-crop="true"
                  v-bind="brandCropBind('tenant_login_bg')"
                  @success="(fileInfo: UploadFilePath) => handleUploadSuccess(fileInfo, 'tenant_login_bg')"
                  @error="handleUploadError"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="24">
            <ElCol :span="8">
              <ElFormItem label="主题色">
                <ElColorPicker v-model="formData.brand.theme_color" show-alpha :predefine="predefineColors" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="默认语言">
                <ElInput v-model="formData.brand.default_language" placeholder="zh-CN" />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElTabPane>

      <!-- 安全隐私 -->
      <ElTabPane label="安全隐私" name="security">
        <FaForm
          v-model="formData.security"
          :items="securityItems"
          :label-width="120"
          label-position="right"
          :span="24"
          :show-reset="false"
          :show-submit="false"
        />
      </ElTabPane>

      <!-- 用户协议 -->
      <ElTabPane label="用户协议" name="agreement">
        <FaForm
          v-model="formData.agreement"
          :items="agreementItems"
          :label-width="120"
          label-position="right"
          :span="24"
          :show-reset="false"
          :show-submit="false"
        />
      </ElTabPane>
    </ElTabs>
  </FaDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage, ElColorPicker, ElCol, ElForm, ElFormItem, ElInput, ElRow } from "element-plus";
import TenantAPI, { type TenantConfigItem } from "@/api/module_system/tenant";
import FaForm from "@/components/forms/fa-form/index.vue";
import FaUpload from "@/components/others/fa-upload/index.vue";
import type { FormItem } from "@/components/forms/fa-form/index.vue";

defineOptions({ name: "TenantConfigDialog" });

const props = defineProps<{ tenantId: number | null }>();
const emit = defineEmits<{ (e: "saved"): void }>();

const visible = defineModel<boolean>({ required: true });
const loading = ref(false);
const activeTab = ref("website");

const formData = reactive({
  website: { tenant_name: "", tenant_version: "", tenant_description: "" },
  brand: {
    tenant_logo: "",
    tenant_favicon: "",
    tenant_login_bg: "",
    theme_color: "#409EFF",
    default_language: "zh-CN",
  },
  security: {
    tenant_help_doc: "",
    tenant_git_code: "",
    tenant_keep_record: "",
    tenant_copyright: "",
    tenant_privacy: "",
  },
  agreement: { tenant_clause: "" },
});

const websiteItems: FormItem[] = [
  { key: "tenant_name", label: "网站名称", type: "input", placeholder: "企业/租户显示名称" },
  { key: "tenant_version", label: "版本号", type: "input", placeholder: "如 v3.0.0" },
  {
    key: "tenant_description",
    label: "网站描述",
    type: "textarea",
    placeholder: "SEO 描述或企业简介",
  },
];

const securityItems: FormItem[] = [
  { key: "tenant_help_doc", label: "帮助文档", type: "input", placeholder: "帮助文档链接" },
  { key: "tenant_git_code", label: "源码地址", type: "input", placeholder: "Git 仓库地址" },
  { key: "tenant_keep_record", label: "备案号", type: "input", placeholder: "ICP 备案号" },
  { key: "tenant_copyright", label: "版权信息", type: "input", placeholder: "© 2024 Company Name" },
  { key: "tenant_privacy", label: "隐私政策", type: "input", placeholder: "隐私政策链接或内容" },
];

const agreementItems: FormItem[] = [
  { key: "tenant_clause", label: "用户协议", type: "textarea", placeholder: "注册/使用协议内容" },
];

const predefineColors = [
  "#409EFF",
  "#337ecc",
  "#67C23A",
  "#529b2e",
  "#E6A23C",
  "#b88230",
  "#F56C6C",
  "#c45656",
  "#909399",
  "#73767a",
  "#B37FEB",
  "#8f5cc7",
];

function brandCropBind(key: string) {
  switch (key) {
    case "tenant_favicon":
      return {
        cropCutWidth: 64,
        cropCutHeight: 64,
        cropBoxWidth: 380,
        cropBoxHeight: 320,
        cropDialogTitle: "裁剪网站图标",
        cropInnerTitle: "调整图标",
        cropPreviewTitle: "预览",
      };
    case "tenant_logo":
      return {
        cropCutWidth: 320,
        cropCutHeight: 96,
        cropBoxWidth: 520,
        cropBoxHeight: 360,
        cropDialogTitle: "裁剪站点 Logo",
        cropInnerTitle: "调整 Logo",
        cropPreviewTitle: "预览",
      };
    case "tenant_login_bg":
      return {
        cropCutWidth: 960,
        cropCutHeight: 540,
        cropBoxWidth: 560,
        cropBoxHeight: 380,
        cropDialogTitle: "裁剪登录背景",
        cropInnerTitle: "调整背景图",
        cropPreviewTitle: "预览",
        cropFileType: "jpeg" as const,
      };
    default:
      return {};
  }
}

function handleUploadSuccess(fileInfo: UploadFilePath, key: string) {
  const fileUrl = fileInfo.file_url;
  if (key in formData.brand) {
    (formData.brand as Record<string, string>)[key] = fileUrl;
  }
}

function handleUploadError(error: any) {
  console.error("上传失败:", error.message || "未知错误");
  ElMessage.error(`上传失败：${error.message || "请稍后重试"}`);
}

/** 从后端加载租户已有配置 */
watch(
  () => [props.tenantId, visible.value],
  async ([id, show]) => {
    if (id && show) {
      try {
        const res = await TenantAPI.getTenantConfig(id as number);
        const items = res.data?.data ?? res.data ?? [];
        const map: Record<string, string> = {};
        for (const item of items) {
          map[item.config_key] = item.config_value;
        }
        formData.website = {
          tenant_name: map.tenant_name || "",
          tenant_version: map.tenant_version || "",
          tenant_description: map.tenant_description || "",
        };
        formData.brand = {
          tenant_logo: map.tenant_logo || "",
          tenant_favicon: map.tenant_favicon || "",
          tenant_login_bg: map.tenant_login_bg || "",
          theme_color: map.theme_color || "#409EFF",
          default_language: map.default_language || "zh-CN",
        };
        formData.security = {
          tenant_help_doc: map.tenant_help_doc || "",
          tenant_git_code: map.tenant_git_code || "",
          tenant_keep_record: map.tenant_keep_record || "",
          tenant_copyright: map.tenant_copyright || "",
          tenant_privacy: map.tenant_privacy || "",
        };
        formData.agreement = { tenant_clause: map.tenant_clause || "" };
      } catch {
        ElMessage.error("获取配置信息失败");
      }
    }
  }
);

/** 收集所有分组中有值的配置项，提交到后端 */
async function handleSubmit() {
  if (!props.tenantId) return;
  loading.value = true;
  try {
    const items: TenantConfigItem[] = [];
    const groups: Record<string, Record<string, string>> = {
      website: formData.website,
      brand: formData.brand,
      security: formData.security,
      agreement: formData.agreement,
    };
    for (const [, fields] of Object.entries(groups)) {
      for (const [key, val] of Object.entries(fields)) {
        if (val !== "") {
          items.push({ config_key: key, config_value: val as string, config_type: "string" });
        }
      }
    }
    await TenantAPI.updateTenantConfig(props.tenantId, items);
    ElMessage.success("配置更新成功");
    emit("saved");
    visible.value = false;
  } catch {
    ElMessage.error("配置更新失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.brand-form {
  max-width: 100%;
}
</style>
