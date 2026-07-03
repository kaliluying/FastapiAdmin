export type ModuleKey = "consult" | "upload" | "document";

export interface WorkflowModule {
  key: ModuleKey;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  loading?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  caseName: string;
  applicant: string;
  time: string;
  messages: ChatMessage[];
}

export const modules: WorkflowModule[] = [
  { key: "consult", label: "事实咨询" },
  { key: "upload", label: "证据整理" },
  { key: "document", label: "申请书" },
];

export const suggestions = [
  "仲裁需要哪些材料？",
  "拖欠工资怎么计算？",
  "没有劳动合同怎么办？",
  "如何生成申请书？",
];

export const chatSessions: ChatSession[] = [];

export const flowSteps = [
  {
    code: "STEP 01",
    title: "选择案件",
    description: "所有证据围绕当前案件归档，避免材料和会话脱节。",
  },
  {
    code: "STEP 02",
    title: "上传材料",
    description: "支持 PDF、Word、图片、Excel 等常见材料类型。",
  },
  {
    code: "STEP 03",
    title: "解析索引",
    description: "上传成功不等于可检索，需要展示解析和索引状态。",
  },
  {
    code: "STEP 04",
    title: "查看分析",
    description: "已解析材料会在当前页面展示证据类型、证明目的和风险提示。",
  },
];

export const uploadProgress = [
  {
    name: "劳动合同.pdf",
    progress: 100,
    color: "var(--teal)",
    status: "已解析 · 已索引 · 18 个文本片段",
  },
  {
    name: "工资流水.xlsx",
    progress: 68,
    color: "var(--orange)",
    status: "解析中 · 待索引",
  },
];

export const laws = [
  {
    title: "劳动报酬支付规则",
    description: "用于说明知识库检索结果在右侧集中展示，真实内容来自后端 retrieval/test。",
  },
  {
    title: "仲裁时效提示",
    description: "用于提醒学生区分 mock 依据和真实接口返回依据。",
  },
  {
    title: "证据材料建议",
    description: "右侧区域承载依据、材料和下一步，不挤占主工作区。",
  },
];

export const evidenceFiles = [
  { type: "PDF", name: "劳动合同.pdf", status: "1.8MB · 已索引" },
  { type: "PDF", name: "工资流水.pdf", status: "924KB · 解析中" },
  { type: "IMG", name: "聊天记录.png", status: "1.2MB · 待分析", image: true },
];

export const progressSteps = [
  {
    title: "智能咨询",
    description: "已完成一轮咨询，已生成初步维权建议。",
  },
  {
    title: "证据管理",
    description: "证据上传、处理状态和 AI 分析结果统一在一个页面查看。",
  },
];

export const systemStatuses = [
  ["FastAPI", "运行中"],
  ["RAG 检索", "运行中"],
  ["ChromaDB", "已连接"],
  ["本地 Embedding", "就绪"],
  ["文书导出", "待接后端"],
];
