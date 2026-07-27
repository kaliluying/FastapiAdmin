import { NO_AUTH_FLAG, request } from "@utils";

const API_PATH = "/common/health";

const HealthAPI = {
  getReadiness() {
    return request<ApiResponse<HealthReadiness>>({
      url: `${API_PATH}/ready`,
      method: "get",
      headers: { Authorization: NO_AUTH_FLAG },
      showErrorMessage: false,
    });
  },
};

export default HealthAPI;

export interface HealthDependencyStatus {
  status: 0 | 1;
  latency_ms: number | null;
}

export interface HealthReadiness {
  status: 0 | 1;
  timestamp: string;
  version: string;
  uptime_seconds: number;
  dependencies: Record<"database" | "redis", HealthDependencyStatus>;
  disk_usage: number;
}
