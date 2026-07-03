import { request } from "@utils";

const API_PATH = "/ai/memory";

/** 记忆类型 */
export type MemoryType = "user_preference" | "fact" | "work_rule";

export interface AiMemoryItem {
  id: number;
  user_id: string;
  team_id: string | null;
  memory_type: MemoryType;
  category: string | null;
  key: string;
  value: string;
  priority: number;
  is_active: boolean;
  created_time: string;
  updated_time: string;
}

export interface MemoryCreatePayload {
  memory_type: MemoryType;
  category?: string | null;
  key: string;
  value: string;
  priority?: number;
  is_active?: boolean;
}

export interface MemoryUpdatePayload {
  memory_type?: MemoryType;
  category?: string | null;
  key?: string;
  value?: string;
  priority?: number;
  is_active?: boolean;
}

export interface MemoryListQuery extends PageQuery {
  memory_type?: MemoryType;
  category?: string;
  key?: string;
  is_active?: string;
}

export const AiMemoryAPI = {
  list(query: MemoryListQuery) {
    return request<ApiResponse<PageResult<AiMemoryItem>>>({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },

  create(body: MemoryCreatePayload) {
    return request<ApiResponse<AiMemoryItem>>({
      url: `${API_PATH}/create`,
      method: "post",
      data: body,
    });
  },

  update(id: number, body: MemoryUpdatePayload) {
    return request<ApiResponse>({
      url: `${API_PATH}/update/${id}`,
      method: "put",
      data: body,
    });
  },

  delete(ids: number[]) {
    return request<ApiResponse>({
      url: `${API_PATH}/delete`,
      method: "delete",
      params: { memory_ids: ids },
      paramsSerializer: (params: Record<string, any>) => {
        const search = new URLSearchParams();
        for (const key of Object.keys(params)) {
          const val = params[key];
          if (Array.isArray(val)) {
            for (const v of val) {
              search.append(key, String(v));
            }
          } else {
            search.append(key, String(val));
          }
        }
        return search.toString();
      },
    });
  },
};
