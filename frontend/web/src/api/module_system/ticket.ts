import { request } from "@utils";

const API_PATH = "/system/ticket";

const TicketAPI = {
  listTicket(query?: TicketPageQuery) {
    return request<ApiResponse<PageResult<TicketTable>>>({
      url: `${API_PATH}/list`,
      method: "get",
      params: query,
    });
  },
  detailTicket(id: number) {
    return request<ApiResponse<TicketTable>>({ url: `${API_PATH}/detail/${id}`, method: "get" });
  },
  createTicket(body: TicketCreateForm) {
    return request<ApiResponse>({ url: `${API_PATH}/create`, method: "post", data: body });
  },
  updateTicket(id: number, body: TicketUpdateForm) {
    return request<ApiResponse>({ url: `${API_PATH}/update/${id}`, method: "put", data: body });
  },
  deleteTicket(body: number[]) {
    return request<ApiResponse>({ url: `${API_PATH}/delete`, method: "delete", data: body });
  },
  exportTicket(query?: TicketPageQuery) {
    return request<ApiResponse<Blob>>({
      url: `${API_PATH}/export`,
      method: "get",
      params: query,
      responseType: "blob",
    });
  },
  batchTicket(body: { ids: number[]; status: string }) {
    return request<ApiResponse>({ url: `${API_PATH}/batch`, method: "put", data: body });
  },
};

export default TicketAPI;

export interface TicketPageQuery extends PageQuery {
  title?: string;
  ticket_type?: string;
  status?: string;
  created_id?: number;
  assigned_id?: number;
}

export interface TicketTable extends BaseType {
  title: string;
  ticket_content?: string;
  content: string;
  ticket_type: string;
  status: string;
  images?: string;
  reply?: string;
  assigned_id?: number;
  assigned_by?: { id: number; name: string; avatar?: string };
  created_by?: { id: number; name: string; avatar?: string };
  updated_by?: { id: number; name: string; avatar?: string };
}

export interface TicketCreateForm {
  title: string;
  ticket_content: string;
  content?: string;
  ticket_type: string;
  images?: string;
  description?: string;
}

export interface TicketUpdateForm {
  title?: string;
  ticket_content?: string;
  content?: string;
  ticket_type?: string;
  status?: string;
  reply?: string;
  assigned_id?: number;
  description?: string;
}

export interface TicketForm extends TicketCreateForm, TicketUpdateForm {
  id?: number;
}
