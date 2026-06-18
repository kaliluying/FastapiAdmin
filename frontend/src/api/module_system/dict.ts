import request from "@/utils/request";

const API_PATH = "/system/dict";

const DictAPI = {
  listDictTypes(query: DictTypePageQuery) {
    return request<ApiResponse<PageResult<DictTypeTable[]>>>({
      url: `${API_PATH}/type/list`,
      method: "get",
      params: query,
    });
  },

  detailDictType(id: number) {
    return request<ApiResponse<DictTypeTable>>({
      url: `${API_PATH}/type/detail/${id}`,
      method: "get",
    });
  },

  createDictType(body: DictTypeForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/type/create`,
      method: "post",
      data: body,
    });
  },

  updateDictType(id: number, body: DictTypeForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/type/update/${id}`,
      method: "put",
      data: body,
    });
  },

  deleteDictType(body: number[]) {
    return request<ApiResponse>({
      url: `${API_PATH}/type/delete`,
      method: "delete",
      data: body,
    });
  },

  listDictData(query: DictDataPageQuery) {
    return request<ApiResponse<PageResult<DictDataTable[]>>>({
      url: `${API_PATH}/data/list`,
      method: "get",
      params: query,
    });
  },

  detailDictData(id: number) {
    return request<ApiResponse<DictDataTable>>({
      url: `${API_PATH}/data/detail/${id}`,
      method: "get",
    });
  },

  createDictData(body: DictDataForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/data/create`,
      method: "post",
      data: body,
    });
  },

  updateDictData(id: number, body: DictDataForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/data/update/${id}`,
      method: "put",
      data: body,
    });
  },

  deleteDictData(body: number[]) {
    return request<ApiResponse>({
      url: `${API_PATH}/data/delete`,
      method: "delete",
      data: body,
    });
  },
};

export default DictAPI;

export interface DictTypePageQuery extends PageQuery {
  dict_name?: string;
  dict_type?: string;
  status?: number;
}

export interface DictTypeTable extends BaseType {
  dict_name?: string;
  dict_type?: string;
  status?: number;
}

export interface DictTypeForm extends BaseFormType {
  dict_name?: string;
  dict_type?: string;
  status?: number;
}

export interface DictDataPageQuery extends PageQuery {
  dict_type?: string;
  dict_label?: string;
  status?: number;
}

export interface DictDataTable extends BaseType {
  dict_type?: string;
  dict_label?: string;
  dict_value?: string;
  dict_sort?: number;
  status?: number;
}

export interface DictDataForm extends BaseFormType {
  dict_type?: string;
  dict_label?: string;
  dict_value?: string;
  dict_sort?: number;
  status?: number;
}
