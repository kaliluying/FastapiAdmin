import { describe, expect, it } from "vitest";
import type { EvidenceAnalysisResult } from "../api/evidenceApi";
import { extractFieldsFromEvidence } from "./arbitrationEvidenceExtract";

function evidence(overrides: Partial<EvidenceAnalysisResult>): EvidenceAnalysisResult {
  return {
    evidence_id: 1,
    file_name: "劳动合同.pdf",
    file_type: "pdf",
    file_size: 1024,
    parse_status: "parsed",
    analysis_status: "analyzed",
    evidence_type: "劳动合同",
    key_facts: [],
    proof_purpose: [],
    related_claims: [],
    evidence_strength: "强",
    risks: [],
    missing_materials: [],
    summary: "",
    created_at: null,
    ...overrides,
  };
}

describe("extractFieldsFromEvidence", () => {
  it("从劳动合同关键事实中提取公司、岗位、日期和工资", () => {
    const result = extractFieldsFromEvidence([
      evidence({
        key_facts: [
          "劳动关系双方为张三与深圳市星河科技有限公司。",
          "入职时间：2024年03月01日，岗位：运营专员。",
          "工资标准为月工资 8000 元。",
        ],
      }),
    ]);

    expect(result.respondent_name).toBe("深圳市星河科技有限公司");
    expect(result.position_name).toBe("运营专员");
    expect(result.hire_date).toBe("2024-03-01");
    expect(result.monthly_salary).toBe(8000);
    expect(result.contract_type).toBe("劳动合同");
  });

  it("从公司主体信息中提取信用代码、住所地和法定代表人", () => {
    const result = extractFieldsFromEvidence([
      evidence({
        file_name: "营业执照.png",
        evidence_type: "公司主体信息",
        key_facts: [
          "公司全称：广州南山餐饮管理有限公司。",
          "统一社会信用代码：91440101MA5ABCDE1X。",
          "注册地址：广州市天河区体育西路 88 号。",
          "法定代表人：李四。",
        ],
      }),
    ]);

    expect(result.respondent_name).toBe("广州南山餐饮管理有限公司");
    expect(result.respondent_credit_code).toBe("91440101MA5ABCDE1X");
    expect(result.respondent_address).toBe("广州市天河区体育西路 88 号");
    expect(result.respondent_legal_rep).toBe("李四");
  });

  it("不会把证明目的里的岗位相关说明误当成岗位名称", () => {
    const result = extractFieldsFromEvidence([
      evidence({
        summary: "张三与星河科技有限公司签订自2024年3月1日至2027年2月28日的劳动合同，约定月薪12000元、标准工时制、产品运营岗位。",
        proof_purpose: ["证明劳动关系、岗位、工资标准及社保缴纳约定"],
      }),
    ]);

    expect(result.position_name).toBe("产品运营");
    expect(result.monthly_salary).toBe(12000);
  });
});
