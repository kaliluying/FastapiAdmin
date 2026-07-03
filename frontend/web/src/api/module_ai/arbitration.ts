import { request } from "@utils";

const API_PATH = "/ai/arbitration";

const ArbitrationAPI = {
  generateDraft(body: ArbitrationDraftRequest) {
    return request<ApiResponse<ArbitrationDraftResult>>({
      url: `${API_PATH}/draft`,
      method: "post",
      data: body,
    });
  },

  listCases() {
    return request<ApiResponse<{ items: ArbitrationCaseItem[]; total: number }>>({
      url: `${API_PATH}/case/list`,
      method: "get",
    });
  },

  listDrafts(caseId?: number | null) {
    return request<ApiResponse<{ items: ArbitrationDraftItem[]; total: number }>>({
      url: `${API_PATH}/draft/list`,
      method: "get",
      params: caseId ? { case_id: caseId } : undefined,
    });
  },

  getDraft(draftId: number) {
    return request<ApiResponse<ArbitrationDraftResult>>({
      url: `${API_PATH}/draft/${draftId}`,
      method: "get",
    });
  },

  exportDraft(draftId: number, fileType: "docx" | "pdf") {
    return request<Blob>({
      url: `${API_PATH}/draft/${draftId}/export`,
      method: "get",
      params: { file_type: fileType },
      responseType: "blob",
    });
  },
};

export default ArbitrationAPI;

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

export interface ArbitrationCaseItem {
  id: number;
  case_title: string;
  respondent_name?: string | null;
  applicant_name?: string | null;
  dispute_summary: string;
  session_id?: string | null;
  created_time?: string | null;
  updated_time?: string | null;
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
