import request from "@/utils/request";

const API_PATH = "/system/notice";

const NoticeAPI = {
  listNotices(query: NoticePageQuery) {
    return request<ApiResponse<PageResult<NoticeTable[]>>>({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },

  detailNotice(id: number) {
    return request<ApiResponse<NoticeTable>>({
      url: `${API_PATH}/detail/${id}`,
      method: "get",
    });
  },

  createNotice(body: NoticeForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/create`,
      method: "post",
      data: body,
    });
  },

  updateNotice(id: number, body: NoticeForm) {
    return request<ApiResponse>({
      url: `${API_PATH}/update/${id}`,
      method: "put",
      data: body,
    });
  },

  deleteNotice(body: number[]) {
    return request<ApiResponse>({
      url: `${API_PATH}/delete`,
      method: "delete",
      data: body,
    });
  },

  getUnreadCount() {
    return request<ApiResponse<number>>({
      url: `${API_PATH}/unread/count`,
      method: "get",
    });
  },

  markAsRead(id: number) {
    return request<ApiResponse>({
      url: `${API_PATH}/read/${id}`,
      method: "put",
    });
  },
};

export default NoticeAPI;

export interface NoticePageQuery extends PageQuery {
  notice_title?: string;
  notice_type?: number;
  status?: number;
}

export interface NoticeTable extends BaseType {
  notice_title?: string;
  notice_type?: number;
  notice_content?: string;
  status?: number;
  is_read?: boolean;
}

export interface NoticeForm extends BaseFormType {
  notice_title?: string;
  notice_type?: number;
  notice_content?: string;
  status?: number;
}
