/**
 * 系统配置状态管理模块
 *
 * 提供系统配置参数的状态管理
 *
 * ## 主要功能
 *
 * - 网站基础信息管理（标题、版本、描述）
 * - 网站图标配置（登录背景、favicon、Logo）
 * - 安全隐私配置（服务条款、版权、隐私政策）
 * - 接口安全配置（白名单、黑名单）
 * - 演示环境配置
 *
 * ## 使用场景
 *
 * - 系统初始化配置加载
 * - 登录页背景和Logo显示
 * - 底部版权信息展示
 * - 接口安全控制
 *
 * ## 持久化
 *
 * - 使用 localStorage 存储
 * - 自动缓存已加载的配置
 * - 支持强制刷新配置
 *
 * @module store/modules/config.store
 * @author FastapiAdmin Team
 */
import { store } from "@stores";
import ParamsAPI, { ConfigTable } from "@/api/module_system/params";
import TenantAPI from "@/api/module_platform/tenant";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore(
  "configStore",
  () => {
    // 配置数据
    const configData = ref<Record<string, ConfigTable>>({});
    // 是否已加载配置
    const isConfigLoaded = ref(false);
    // 是否正在加载配置
    const configLoading = ref(false);
    // 最近一次 fetch 时间戳，用于 force=true 时防止短期重复请求
    let _lastFetchedAt = 0;
    const MIN_FETCH_INTERVAL_MS = 5000;

    /**
     * 获取系统配置 + 租户配置
     * @param force 是否强制刷新配置
     * @param tenantId 租户ID（默认 1），登录页等公开场景使用
     */
    async function getConfig(force = false, tenantId = 1) {
      if (configLoading.value) {
        return;
      }
      // force=true 时也需防短期内重复请求
      if (!force && isConfigLoaded.value) {
        return;
      }
      if (force && Date.now() - _lastFetchedAt < MIN_FETCH_INTERVAL_MS) {
        return;
      }
      configLoading.value = true;
      try {
        // 1. 获取系统级配置（演示模式、IP黑白名单等）
        const response = await ParamsAPI.getInitConfig();
        const list = response?.data?.data;
        if (!Array.isArray(list)) {
          console.warn("[configStore] getInitConfig: 响应 data 非数组", response?.data);
          return;
        }
        list.forEach((item: ConfigTable) => {
          if (item.config_value !== undefined && item.config_key) {
            configData.value[item.config_key] = item;
          }
        });

        // 2. 获取租户个性化配置（品牌标识、版权信息等）
        try {
          const tenantResp = await TenantAPI.getTenantConfigInfo(tenantId);
          const tenantList = tenantResp?.data?.data;
          if (Array.isArray(tenantList)) {
            tenantList.forEach((item: any) => {
              if (item.config_value !== undefined && item.config_key) {
                configData.value[item.config_key] = item;
              }
            });
          }
        } catch (e) {
          console.warn("[configStore] 获取租户配置失败（非关键错误）", e);
        }

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
