/**
 * Runtime system parameter store.
 *
 * Loads public system parameters once and keeps them in Pinia persistence for
 * branding and layout configuration.
 */
import { store } from "@stores";
import ParamsAPI, { ConfigTable } from "@/api/module_system/params";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore(
  "configStore",
  () => {
    const configData = ref<Record<string, ConfigTable>>({});
    const isConfigLoaded = ref(false);
    const configLoading = ref(false);
    let _lastFetchedAt = 0;
    const MIN_FETCH_INTERVAL_MS = 5000;

    async function getConfig(force = false) {
      if (configLoading.value) {
        return;
      }
      if (!force && isConfigLoaded.value) {
        return;
      }
      if (force && Date.now() - _lastFetchedAt < MIN_FETCH_INTERVAL_MS) {
        return;
      }
      configLoading.value = true;
      try {
        const response = await ParamsAPI.getInitConfig();
        const list = response?.data?.data;
        if (!Array.isArray(list)) {
          console.warn("[configStore] getInitConfig: response data is not an array", response?.data);
          return;
        }
        list.forEach((item: ConfigTable) => {
          if (item.config_value !== undefined && item.config_key) {
            configData.value[item.config_key] = item;
          }
        });

        isConfigLoaded.value = true;
        _lastFetchedAt = Date.now();
      } finally {
        configLoading.value = false;
      }
    }

    return {
      configData,
      isConfigLoaded,
      configLoading,
      getConfig,
    };
  },
  {
    persist: true,
  }
);

export function useConfigStoreHook() {
  return useConfigStore(store);
}
