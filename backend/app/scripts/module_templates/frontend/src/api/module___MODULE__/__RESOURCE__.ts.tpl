import { request } from "@/utils/http";

const API_PATH = "/__MODULE__/__RESOURCE__";

export interface __RESOURCE_CLASS__Form {
  name: string;
  order: number;
  status: 0 | 1;
  description: string | null;
}

export interface __RESOURCE_CLASS__ extends BaseType, __RESOURCE_CLASS__Form {
  id: number;
  created_id: number | null;
  updated_id: number | null;
}

export interface __RESOURCE_CLASS__Query extends PageQuery {
  order_by?: string;
  name?: string;
  status?: 0 | 1;
}

const __RESOURCE_CLASS__API = {
  list(query: __RESOURCE_CLASS__Query) {
    return request<ApiResponse<PageResult<__RESOURCE_CLASS__>>>({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },
  detail(id: number) {
    return request<ApiResponse<__RESOURCE_CLASS__>>({ url: `${API_PATH}/detail/${id}`, method: "get" });
  },
  create(data: __RESOURCE_CLASS__Form) {
    return request<ApiResponse<__RESOURCE_CLASS__>>({ url: `${API_PATH}/create`, method: "post", data });
  },
  update(id: number, data: __RESOURCE_CLASS__Form) {
    return request<ApiResponse<__RESOURCE_CLASS__>>({ url: `${API_PATH}/update/${id}`, method: "put", data });
  },
  delete(ids: number[]) {
    return request<ApiResponse>({ url: `${API_PATH}/delete`, method: "delete", data: ids });
  },
};

export default __RESOURCE_CLASS__API;
