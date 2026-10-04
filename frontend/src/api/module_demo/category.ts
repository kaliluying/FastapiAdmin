import { request } from "@utils";

const API_PATH = "/demo/category";

export interface CategoryForm {
  name: string;
  order: number;
  status: 0 | 1;
  description: string | null;
}

export interface Category extends BaseType, CategoryForm {
  id: number;
  created_id: number | null;
  updated_id: number | null;
}

export interface CategoryQuery extends PageQuery {
  order_by?: string;
  name?: string;
  status?: 0 | 1;
}

const CategoryAPI = {
  list(query: CategoryQuery) {
    return request<ApiResponse<PageResult<Category>>>({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },
  detail(id: number) {
    return request<ApiResponse<Category>>({ url: `${API_PATH}/detail/${id}`, method: "get" });
  },
  create(data: CategoryForm) {
    return request<ApiResponse<Category>>({ url: `${API_PATH}/create`, method: "post", data });
  },
  update(id: number, data: CategoryForm) {
    return request<ApiResponse<Category>>({ url: `${API_PATH}/update/${id}`, method: "put", data });
  },
  delete(ids: number[]) {
    return request<ApiResponse>({ url: `${API_PATH}/delete`, method: "delete", data: ids });
  },
};

export default CategoryAPI;
