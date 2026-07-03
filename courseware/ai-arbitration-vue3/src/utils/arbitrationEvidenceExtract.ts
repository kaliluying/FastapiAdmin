import type { EvidenceAnalysisResult } from "../api/evidenceApi";

export interface EvidenceStructuredFields {
  respondent_name?: string;
  respondent_credit_code?: string;
  respondent_address?: string;
  respondent_legal_rep?: string;
  position_name?: string;
  hire_date?: string;
  leave_date?: string;
  monthly_salary?: number;
  contract_type?: string;
}

export function extractFieldsFromEvidence(items: EvidenceAnalysisResult[]): EvidenceStructuredFields {
  const text = allEvidenceText(items);
  const salaryText = firstMatch(text, [
    /(?:月工资|月薪|工资标准|每月工资|薪资|应发工资|实发工资)[^\d]*(\d+(?:\.\d+)?)/,
  ]);

  return {
    respondent_name: companyCandidate(text),
    respondent_credit_code: firstMatch(text, [
      /(?:统一社会信用代码|社会信用代码|信用代码)[：:为是\s]*([0-9A-Z]{15,18})/,
    ]),
    respondent_address: labeledValue(text, ["注册地址", "住所地", "公司住所地", "经营场所", "地址"], 120),
    respondent_legal_rep: labeledValue(text, ["法定代表人", "负责人", "经营者"], 30),
    position_name: positionCandidate(text),
    hire_date: normalizeDate(
      firstMatch(text, [/(?:入职|入职时间|工作起始|劳动关系自|合同期限自)[^\d]*(\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2})/]),
    ),
    leave_date: normalizeDate(
      firstMatch(text, [/(?:离职|解除|辞退|终止|合同期限至)[^\d]*(\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2})/]),
    ),
    monthly_salary: salaryText ? Number(salaryText) : undefined,
    contract_type: inferContractType(text),
  };
}

function allEvidenceText(items: EvidenceAnalysisResult[]): string {
  return items
    .flatMap((item) => [
      item.file_name,
      item.evidence_type || "",
      item.summary || "",
      ...(item.key_facts || []),
      ...(item.proof_purpose || []),
      ...(item.related_claims || []),
    ])
    .join("；");
}

function firstMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const value = cleanExtractedValue(text.match(pattern)?.[1] || "");
    if (value) return value;
  }
  return "";
}

function labeledValue(text: string, labels: string[], maxLength = 80): string {
  for (const label of labels) {
    const pattern = new RegExp(`${label}[：:为是\\s]*([^，。；;、\\n]{2,${maxLength}})`);
    const value = cleanExtractedValue(text.match(pattern)?.[1] || "");
    if (value) return value;
  }
  return "";
}

function positionCandidate(text: string): string {
  const labeled = labeledValue(text, ["工作岗位", "岗位名称", "岗位", "职位", "职务"], 30);
  if (isLikelyPosition(labeled)) return labeled;

  const suffixMatches = Array.from(
    text.matchAll(/([\u4e00-\u9fa5A-Za-z0-9]{2,24})(?:岗位|职位)/g),
  )
    .map((match) => cleanExtractedValue(match[1]))
    .filter(isLikelyPosition);

  return suffixMatches.sort((a, b) => b.length - a.length)[0] || "";
}

function isLikelyPosition(value: string): boolean {
  if (!value) return false;
  if (/^(工资标准|社保|社会保险|工作时间|合同|证明|约定|材料中未体现)/.test(value)) return false;
  if (/(工资标准|社保缴纳|社会保险|证明目的|关联诉求|材料中未体现)/.test(value)) return false;
  return value.length <= 24;
}

function companyCandidate(text: string): string {
  const labeled = labeledValue(text, [
    "用人单位全称",
    "用人单位",
    "公司全称",
    "公司名称",
    "发放主体",
    "解除主体",
    "被申请人",
    "甲方",
    "单位",
  ]);
  if (labeled && /(公司|中心|店|厂|事务所|个体工商户|合作社)/.test(labeled)) {
    return labeled;
  }

  const suffixMatches = Array.from(
    text.matchAll(/([\u4e00-\u9fa5A-Za-z0-9（）()·]{2,60}(?:有限责任公司|股份有限公司|有限公司|公司|中心|店|厂|事务所|个体工商户|合作社))/g),
  )
    .map((match) => cleanExtractedValue(match[1]))
    .filter((item) => item && !/材料中未体现|申请人|劳动者/.test(item));

  return suffixMatches.sort((a, b) => b.length - a.length)[0] || labeled;
}

function cleanExtractedValue(value: string): string {
  const cleaned = value
    .replace(/^(为|是|：|:|\s)+/g, "")
    .replace(/(材料中未体现|未体现|不详|未知).*$/g, "")
    .replace(/^[，。；;、\s]+/g, "")
    .replace(/[，。；;、\s]+$/g, "")
    .trim();
  const parts = cleaned.split(/[与和及]/).map((item) => item.trim()).filter(Boolean);
  for (const part of parts.reverse()) {
    const companyEntity = part.match(/([\u4e00-\u9fa5A-Za-z0-9（）()·]{2,60}(?:有限责任公司|股份有限公司|有限公司|公司|中心|店|厂|事务所|个体工商户|合作社))$/);
    if (companyEntity?.[1]) return companyEntity[1];
  }
  return cleaned;
}

function normalizeDate(value: string): string {
  if (!value) return "";
  const match = value.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function inferContractType(text: string): string {
  if (/劳动合同/.test(text)) return "劳动合同";
  if (/未签|没有签|无合同/.test(text)) return "无合同";
  return "";
}
