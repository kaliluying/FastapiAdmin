import { request } from "@utils";

const API_PATH = "/common/monitoring";

const DashboardAPI = {
  getLoginTrend() {
    return request<ApiResponse<LoginTrendResponse>>({
      url: `${API_PATH}/login-trend`,
      method: "get",
      showErrorMessage: false,
    });
  },
};

export default DashboardAPI;

export interface LoginTrendItem {
  day: string;
  logins: number;
  unique_users: number;
  new_users: number;
}

export interface LoginTrendResponse {
  items: LoginTrendItem[];
}
