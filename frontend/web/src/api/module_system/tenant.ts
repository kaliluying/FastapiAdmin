import { request, NO_AUTH_FLAG } from "@utils";

const API_PATH = "/system/tenant";

const TenantAPI = {
  listTenant(query?: TenantPageQuery) {
    return request<ApiResponse<PageResult<TenantTable>>>({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },

  detailTenant(id: number) {
    return request<ApiResponse<TenantTable>>({
      url: `${API_PATH}/detail/${id}`,
      method: "get",
    });
  },

  createTenant(body: TenantCreateForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/create`,
      method: "post",
      data: body,
    });
  },

  updateTenant(id: number, body: TenantUpdateForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/update/${id}`,
      method: "put",
      data: body,
    });
  },

  deleteTenant(body: number[]) {
    return request<ApiResponse>({
      url: `${API_PATH}/delete`,
      method: "delete",
      data: body,
    });
  },

  batchTenant(body: BatchType) {
    return request<ApiResponse>({
      url: `${API_PATH}/available/setting`,
      method: "patch",
      data: body,
    });
  },

  toggleTenantStatus(id: number) {
    return request<ApiResponse>({
      url: `${API_PATH}/status/${id}`,
      method: "put",
    });
  },

  getTenantUsers(tenantId: number) {
    return request<ApiResponse<TenantUser[]>>({
      url: `${API_PATH}/${tenantId}/users`,
      method: "get",
    });
  },

  addTenantUser(tenantId: number, body: TenantUserAddForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/${tenantId}/users`,
      method: "post",
      data: body,
    });
  },

  removeTenantUser(tenantId: number, userId: number) {
    return request<ApiResponse>({
      url: `${API_PATH}/${tenantId}/users/${userId}`,
      method: "delete",
    });
  },

  // P1: 配额管理
  getTenantQuota(tenantId: number) {
    return request<ApiResponse<TenantQuota>>({
      url: `${API_PATH}/${tenantId}/quota`,
      method: "get",
    });
  },
  updateTenantQuota(tenantId: number, body: TenantQuotaUpdate) {
    return request<ApiResponse<TenantQuota>>({
      url: `${API_PATH}/${tenantId}/quota`,
      method: "put",
      data: body,
    });
  },

  /** 公开接口：无需登录即可获取租户配置（用于登录页等场景） */
  getTenantConfigInfo(tenantId: number) {
    return request<ApiResponse<TenantConfigItem[]>>({
      url: `${API_PATH}/${tenantId}/config/info`,
      method: "get",
      headers: {
        Authorization: NO_AUTH_FLAG,
      },
    });
  },

  // P1: 个性化配置
  getTenantConfig(tenantId: number) {
    return request<ApiResponse<TenantConfigItem[]>>({
      url: `${API_PATH}/${tenantId}/config`,
      method: "get",
    });
  },
  updateTenantConfig(tenantId: number, body: TenantConfigItem[]) {
    return request<ApiResponse<TenantConfigItem[]>>({
      url: `${API_PATH}/${tenantId}/config`,
      method: "put",
      data: body,
    });
  },

  // P1: 菜单权限
  getTenantMenus(tenantId: number) {
    return request<ApiResponse<number[]>>({
      url: `${API_PATH}/${tenantId}/menus`,
      method: "get",
    });
  },
  setTenantMenus(tenantId: number, menuIds: number[]) {
    return request<ApiResponse>({
      url: `${API_PATH}/${tenantId}/menus`,
      method: "put",
      data: { menu_ids: menuIds },
    });
  },
};

export default TenantAPI;

export interface TenantPageQuery extends PageQuery {
  name?: string;
  code?: string;
  status?: string;
  created_time?: string[];
}

export interface TenantTable extends BaseType {
  name: string;
  code: string;
  status?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  domain?: string;
  logo_url?: string;
  sort?: number;
}

export interface TenantForm {
  id?: number;
  name?: string;
  code?: string;
  status?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  domain?: string;
  logo_url?: string;
  sort?: number;
}

export interface TenantCreateForm {
  name: string;
  code: string;
  status?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  domain?: string;
  logo_url?: string;
  sort?: number;
}

export interface TenantUpdateForm {
  name?: string;
  status?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  domain?: string;
  logo_url?: string;
  sort?: number;
}

export interface BatchType {
  ids: number[];
  status: string;
}

export interface TenantUser {
  id: number;
  user_id: number;
  tenant_id: number;
  role: string;
  is_default: number;
  create_time?: string;
  username: string;
  name: string;
}

export interface TenantUserAddForm {
  user_id: number;
  role: string;
  is_default: number;
}

// P1 types
export interface TenantQuota {
  id: number;
  tenant_id: number;
  max_users: number;
  max_roles: number;
  max_storage_mb: number;
  max_depts: number;
}

export interface TenantQuotaUpdate {
  max_users?: number;
  max_roles?: number;
  max_storage_mb?: number;
  max_depts?: number;
}

export interface TenantConfigItem {
  id?: number;
  tenant_id?: number;
  config_key: string;
  config_value: string;
  config_type: string;
}
