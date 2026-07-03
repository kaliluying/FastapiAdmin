/**
 * HTTP API utilities for the AI Arbitration frontend.
 * Uses native fetch to avoid adding axios dependency.
 */

const API_BASE = (() => {
  const ws = import.meta.env.VITE_APP_WS_ENDPOINT || "ws://127.0.0.1:8004";
  // Convert ws:// to http:// for REST calls
  return ws.replace(/^ws/, "http") + "/api/v1";
})();

function getToken(): string {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("ACCESS_TOKEN") ||
    ""
  );
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const msg =
      body?.msg || body?.detail || `请求失败 (${response.status})`;
    throw new Error(msg);
  }

  const json = await response.json();
  return json.data as T;
}

export interface EvidenceAnalysisResult {
  evidence_id: number;
  user_id?: number | null;
  file_name: string;
  file_type: string;
  file_size: number;
  parse_status: string;
  analysis_status: string;
  evidence_type: string | null;
  key_facts: string[] | null;
  proof_purpose: string[] | null;
  related_claims: string[] | null;
  evidence_strength: string | null;
  risks: string[] | null;
  missing_materials: string[] | null;
  summary: string | null;
  created_at: string | null;
}

export interface EvidenceListItem {
  evidence_id: number;
  user_id?: number | null;
  file_name: string;
  file_type: string;
  file_size: number;
  parse_status: string;
  analysis_status: string;
  evidence_type: string | null;
  summary: string | null;
  created_at: string | null;
}

/**
 * Upload and analyze an evidence file.
 */
export async function uploadAnalyzeEvidence(
  file: File,
  sessionId: string,
  evidenceType?: string,
): Promise<EvidenceAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);
  if (evidenceType) {
    formData.append("evidence_type", evidenceType);
  }
  return request<EvidenceAnalysisResult>("/ai/evidence/upload-analyze", {
    method: "POST",
    body: formData,
  });
}

/**
 * List evidence files for a session.
 */
export async function listEvidence(
  sessionId: string,
): Promise<EvidenceListItem[]> {
  return request<EvidenceListItem[]>(
    `/ai/evidence/list?session_id=${encodeURIComponent(sessionId)}`,
  );
}

/**
 * Get evidence analysis detail.
 */
export async function getEvidenceDetail(
  evidenceId: number,
): Promise<EvidenceAnalysisResult> {
  return request<EvidenceAnalysisResult>(`/ai/evidence/${evidenceId}`);
}
