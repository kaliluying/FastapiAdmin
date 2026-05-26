<template>
  <FaDialog
    v-model="visible"
    title="租户配额设置"
    width="520px"
    form-mode="update"
    :confirm-loading="loading"
    @confirm="handleSubmit"
    @cancel="visible = false"
  >
    <FaForm
      ref="formRef"
      v-model="formData"
      :items="quotaFormItems"
      :rules="rules"
      :label-width="120"
      label-position="right"
      :span="24"
      :show-reset="false"
      :show-submit="false"
    />
  </FaDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import TenantAPI from "@/api/module_system/tenant";
import FaForm from "@/components/forms/fa-form/index.vue";
import type { FormItem } from "@/components/forms/fa-form/index.vue";

defineOptions({ name: "TenantQuotaDialog" });

const props = defineProps<{ tenantId: number | null }>();
const emit = defineEmits<{ (e: "saved"): void }>();

const visible = defineModel<boolean>({ required: true });
const loading = ref(false);
const formRef = ref<{ validate: () => Promise<boolean> }>();

const formData = ref({ max_users: 50, max_roles: 20, max_storage_mb: 500, max_depts: 50 });

const quotaFormItems: FormItem[] = [
  { key: "max_users", label: "最大用户数", type: "input-number", props: { min: 0, max: 9999 } },
  { key: "max_roles", label: "最大角色数", type: "input-number", props: { min: 0, max: 9999 } },
  {
    key: "max_storage_mb",
    label: "最大存储(MB)",
    type: "input-number",
    props: { min: 0, max: 999999 },
  },
  { key: "max_depts", label: "最大部门数", type: "input-number", props: { min: 0, max: 9999 } },
];

const rules = {
  max_users: [{ required: true, message: "请输入最大用户数" }],
  max_roles: [{ required: true, message: "请输入最大角色数" }],
  max_storage_mb: [{ required: true, message: "请输入最大存储" }],
  max_depts: [{ required: true, message: "请输入最大部门数" }],
};

watch(
  () => [props.tenantId, visible.value],
  async ([id, show]) => {
    if (id && show) {
      try {
        const res = await TenantAPI.getTenantQuota(id as number);
        const quota = res.data?.data ?? res.data;
        if (quota) {
          formData.value = {
            max_users: quota.max_users,
            max_roles: quota.max_roles,
            max_storage_mb: quota.max_storage_mb,
            max_depts: quota.max_depts,
          };
        }
      } catch {
        ElMessage.error("获取配额信息失败");
      }
    }
  }
);

async function handleSubmit() {
  if (!props.tenantId) return;
  if (formRef.value && !(await formRef.value.validate())) return;
  loading.value = true;
  try {
    await TenantAPI.updateTenantQuota(props.tenantId, formData.value);
    ElMessage.success("配额更新成功");
    emit("saved");
    visible.value = false;
  } catch {
    ElMessage.error("配额更新失败");
  } finally {
    loading.value = false;
  }
}
</script>
