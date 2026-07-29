<template>
  <FaDrawer
    v-model="drawerVisible"
    title="访问控制"
    :size="drawerSize"
    destroy-on-close
    @close="onDrawerClosed"
  >
    <ElForm v-if="blacklistConfig" label-suffix=":" label-width="110px" label-position="right">
      <ElFormItem :label="blacklistConfig.config_name">
        <div class="ip-list">
          <div v-for="item in ipBlacklistItems" :key="item.id" class="ip-list__item">
            <ElInput
              v-model="item.value"
              placeholder="192.168.1.1"
              clearable
              @input="hasChanges = true"
              @blur="validateIp(item.value)"
            />
            <ElTooltip content="移除 IP 地址" placement="top">
              <ElButton
                type="danger"
                icon="minus"
                circle
                size="small"
                aria-label="移除 IP 地址"
                @click="removeIp(item.id)"
              />
            </ElTooltip>
          </div>
          <ElButton type="primary" icon="plus" size="small" @click="addIp">添加 IP 地址</ElButton>
          <p class="ip-list__hint">黑名单中的 IP 无法访问系统。</p>
        </div>
      </ElFormItem>
    </ElForm>
    <ElEmpty v-else description="IP 黑名单配置未加载" />

    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton
        v-hasPerm="['module_system:config:update']"
        type="primary"
        :disabled="!hasChanges || !blacklistConfig"
        @click="saveBlacklist"
      >
        保存
      </ElButton>
    </template>
  </FaDrawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import ParamsAPI, { type ConfigTable } from "@/api/module_system/params";
import { DeviceEnum } from "@/enums/settings/device.enum";
import { useAppStore, useConfigStore } from "@stores";

defineOptions({ name: "FaConfigInfoDrawer" });

type ListItem = {
  id: string;
  value: string;
};

interface Props {
  modelValue: boolean;
}

interface Emits {
  (event: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const appStore = useAppStore();
const configStore = useConfigStore();
const ipBlacklistItems = ref<ListItem[]>([]);
const hasChanges = ref(false);
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "60%" : "100%"));
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});
const blacklistConfig = computed(
  () => configStore.configData.ip_black_list as ConfigTable | undefined
);

/**
 * Converts the persisted blacklist into editable entries.
 *
 * @param value Serialized JSON list from the parameter service.
 * @returns Editable non-empty IP entries.
 */
function parseIpList(value: string): ListItem[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        .map((item) => ({ id: crypto.randomUUID(), value: item.trim() }));
    }
  } catch {
    // Treat legacy or malformed values as empty rather than persisting invalid JSON.
  }
  return [];
}

/** Loads the current blacklist into the editable form. */
function loadBlacklist(): void {
  ipBlacklistItems.value = parseIpList(blacklistConfig.value?.config_value ?? "[]");
  hasChanges.value = false;
}

/** Validates an entered IP address and shows an actionable message when invalid. */
function validateIp(ip: string): void {
  const value = ip.trim();
  if (!value) return;
  const ipv4 = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
  if (!ipv4.test(value)) ElMessage.warning("请输入有效的 IPv4 地址");
}

/** Appends an empty IP field to the blacklist editor. */
function addIp(): void {
  ipBlacklistItems.value.push({ id: crypto.randomUUID(), value: "" });
  hasChanges.value = true;
}

/** Removes one IP field from the blacklist editor. */
function removeIp(id: string): void {
  ipBlacklistItems.value = ipBlacklistItems.value.filter((item) => item.id !== id);
  hasChanges.value = true;
}

/** Persists the edited blacklist and refreshes the configuration store. */
async function saveBlacklist(): Promise<void> {
  const config = blacklistConfig.value;
  if (!config?.id) return;

  const values = ipBlacklistItems.value.map((item) => item.value.trim()).filter(Boolean);
  await ParamsAPI.updateParams(config.id, { ...config, config_value: JSON.stringify(values) });
  configStore.isConfigLoaded = false;
  await configStore.getConfig(true);
  loadBlacklist();
  ElMessage.success("IP 黑名单已保存");
}

/** Restores the last persisted blacklist after the drawer closes. */
async function onDrawerClosed(): Promise<void> {
  await configStore.getConfig(true);
  loadBlacklist();
}

onMounted(async () => {
  await configStore.getConfig(true);
  loadBlacklist();
});
</script>

<style scoped lang="scss">
.ip-list {
  display: grid;
  width: min(100%, 520px);
  gap: 10px;
}

.ip-list__item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ip-list__hint {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
