<template>
  <FaDialog
    v-model="visible"
    title="租户菜单权限"
    width="560px"
    form-mode="update"
    :confirm-loading="loading"
    @confirm="handleSubmit"
    @cancel="visible = false"
  >
    <ElTree
      ref="treeRef"
      :data="menuTree"
      show-checkbox
      node-key="id"
      :default-checked-keys="checkedMenuIds"
      :props="{ children: 'children', label: 'name' }"
      default-expand-all
      style="max-height: 50vh; overflow-y: auto"
    />
  </FaDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElTree } from "element-plus";
import TenantAPI from "@/api/module_system/tenant";
import MenuAPI from "@/api/module_system/menu";

defineOptions({ name: "TenantMenuDialog" });

const props = defineProps<{ tenantId: number | null }>();
const emit = defineEmits<{ (e: "saved"): void }>();

const visible = defineModel<boolean>({ required: true });
const loading = ref(false);
const treeRef = ref<InstanceType<typeof ElTree>>();

const menuTree = ref<any[]>([]);
const checkedMenuIds = ref<number[]>([]);

watch(
  () => [props.tenantId, visible.value],
  async ([id, show]) => {
    if (id && show) {
      try {
        const [menuRes, checkedRes] = await Promise.all([
          MenuAPI.listMenu(),
          TenantAPI.getTenantMenus(id as number),
        ]);
        const menuData = (menuRes.data?.data ?? menuRes.data) as any;
        if (Array.isArray(menuData)) {
          menuTree.value = menuData;
        } else if (Array.isArray(menuData?.records)) {
          menuTree.value = menuData.records;
        }
        const checkedData = (checkedRes.data?.data ?? checkedRes.data) as any;
        if (Array.isArray(checkedData)) {
          checkedMenuIds.value = checkedData;
        }
      } catch {
        ElMessage.error("获取菜单数据失败");
      }
    }
  }
);

async function handleSubmit() {
  if (!props.tenantId || !treeRef.value) return;
  loading.value = true;
  try {
    const keys = treeRef.value.getCheckedKeys() as number[];
    const halfKeys = treeRef.value.getHalfCheckedKeys() as number[];
    await TenantAPI.setTenantMenus(props.tenantId, [...keys, ...halfKeys]);
    ElMessage.success("菜单权限设置成功");
    emit("saved");
    visible.value = false;
  } catch {
    ElMessage.error("菜单权限设置失败");
  } finally {
    loading.value = false;
  }
}
</script>
