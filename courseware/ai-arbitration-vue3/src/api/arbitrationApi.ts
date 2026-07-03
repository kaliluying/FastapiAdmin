import { getJSON, getToken, postJSON } from "./request";

const API_PREFIX = "/api/v1/ai/arbitration";
const API_BASE = import.meta.env.VITE_APP_API_BASE || "http://127.0.0.1:8004";

export interface ArbitrationDraftRequest {
  case_id?: number | null;
  case_title?: string | null;
  session_id?: string | null;
  arbitration_committee?: string | null;
  applicant_name?: string | null;
  applicant_gender?: string | null;
  applicant_id_no?: string | null;
  applicant_phone?: string | null;
  applicant_address?: string | null;
  respondent_name?: string | null;
  respondent_credit_code?: string | null;
  respondent_address?: string | null;
  respondent_legal_rep?: string | null;
  respondent_phone?: string | null;
  hire_date?: string | null;
  leave_date?: string | null;
  position_name?: string | null;
  work_location?: string | null;
  monthly_salary?: number | null;
  contract_type?: string | null;
  social_insurance?: boolean | null;
  dispute_summary: string;
  claims: string[];
  evidence_items: string[];
  use_ai: boolean;
}

export interface ArbitrationDraftResult {
  case_id?: number | null;
  draft_id?: number | null;
  title: string;
  content: string;
  risk_tips: string[];
  source_summary: {
    session_id?: string | null;
    claims_count: number;
    evidence_count: number;
    evidence_analysis_count: number;
    used_ai: boolean;
  };
}

export interface ArbitrationDraftItem {
  id: number;
  case_id: number;
  session_id?: string | null;
  title: string;
  review_status: string;
  used_ai: boolean;
  created_time?: string | null;
  updated_time?: string | null;
}

interface PageResult<T> {
  items: T[];
  total: number;
}

export async function generateArbitrationDraft(
  payload: ArbitrationDraftRequest,
): Promise<ArbitrationDraftResult> {
  const response = await postJSON<ArbitrationDraftResult>(`${API_PREFIX}/draft`, { ...payload });
  return response.data;
}

export async function listArbitrationDrafts(caseId?: number | null): Promise<ArbitrationDraftItem[]> {
  const query = caseId ? `?case_id=${encodeURIComponent(String(caseId))}` : "";
  const response = await getJSON<PageResult<ArbitrationDraftItem>>(`${API_PREFIX}/draft/list${query}`);
  return response.data.items || [];
}

export async function getArbitrationDraft(draftId: number): Promise<ArbitrationDraftResult> {
  const response = await getJSON<ArbitrationDraftResult>(`${API_PREFIX}/draft/${draftId}`);
  return response.data;
}

export async function exportArbitrationDraft(draftId: number, fileType: "docx" | "pdf"): Promise<Blob> {
  const token = getToken();
  const response = await fetch(
    `${API_BASE}${API_PREFIX}/draft/${draftId}/export?file_type=${encodeURIComponent(fileType)}`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.msg || body?.detail || `导出失败 (${response.status})`);
  }

  return response.blob();
}
