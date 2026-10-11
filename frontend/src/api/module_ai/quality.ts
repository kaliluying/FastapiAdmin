import { request } from "@utils";

export interface AnswerFeedback {
  id: number;
  session_id: string;
  run_id: string;
  user_id: number;
  rating: "helpful" | "incorrect";
  comment: string;
  question: string;
  answer: string;
  status: "pending" | "resolved";
  resolution: string;
  created_time: string;
  updated_time: string;
  revision: number;
}

export interface EvaluationCase {
  query: string;
  expected_document_ids: number[];
}

export interface Evaluation {
  id: number;
  name: string;
  dataset_hash: string;
  knowledge_base_ids: number[];
  top_k: number;
  retrieval_mode: string;
  created_time: string;
  dataset: EvaluationCase[];
  report: {
    case_count: number;
    hit_rate: number;
    recall: number;
    mrr: number;
    cases: (EvaluationCase & { retrieved_document_ids: number[]; recall: number; mrr: number })[];
  };
}

const QualityAPI = {
  feedback(body: {
    session_id: string;
    run_id: string;
    rating: AnswerFeedback["rating"];
    comment: string;
  }) {
    return request<ApiResponse<AnswerFeedback>>({
      url: "/ai/quality/feedback",
      method: "post",
      data: body,
    });
  },
  feedbackList(params: {
    all_users?: boolean;
    session_id?: string;
    status?: string;
    page_no?: number;
    page_size?: number;
  }) {
    return request<ApiResponse<{ items: AnswerFeedback[]; total: number }>>({
      url: "/ai/quality/feedback",
      method: "get",
      params,
    });
  },
  review(
    id: number,
    body: { status: "pending" | "resolved"; resolution: string; expected_revision: number }
  ) {
    return request<ApiResponse<AnswerFeedback>>({
      url: `/ai/quality/feedback/${id}`,
      method: "put",
      data: body,
    });
  },
  evaluate(body: {
    name: string;
    knowledge_base_ids: number[];
    top_k: number;
    cases: EvaluationCase[];
  }) {
    return request<ApiResponse<Evaluation>>({
      url: "/ai/quality/evaluation",
      method: "post",
      data: body,
      timeout: 120000,
    });
  },
  evaluations(params: { page_no?: number; page_size?: number } = {}) {
    return request<ApiResponse<{ items: Evaluation[]; total: number }>>({
      url: "/ai/quality/evaluation",
      method: "get",
      params,
    });
  },
};

export default QualityAPI;
