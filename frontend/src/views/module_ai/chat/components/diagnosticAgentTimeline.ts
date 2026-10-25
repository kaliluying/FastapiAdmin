import type { AgentEvent, AgentRun } from "@/api/module_ai/agent";
import type { ChatCitation } from "../types";

export interface AgentToolCard {
  kind: "tool";
  key: string;
  name: string;
  started?: AgentEvent;
  completed?: AgentEvent;
  interruptedAt?: string;
}

export interface AgentAnalysisCard {
  kind: "analysis";
  key: string;
  modelCall: number;
  text: string;
  state: "streaming" | "complete" | "interrupted";
}

type TimelineItem =
  AgentToolCard | AgentAnalysisCard | { kind: "event"; key: string; event: AgentEvent };

export function agentTimestamp(value: string): number | null {
  // 无时区的服务端日期保持本地时间语义，不能补 Z。
  const timestamp = Date.parse(value.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1"));
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function agentDuration(start: string | undefined, end: number | null): string {
  const from = start ? agentTimestamp(start) : null;
  if (from === null || end === null) return "未知";
  const seconds = Math.max(0, Math.floor((end - from) / 1000));
  const minutes = Math.floor(seconds / 60);
  const tail = String(seconds % 60).padStart(2, "0");
  return minutes < 60
    ? `${String(minutes).padStart(2, "0")}:${tail}`
    : `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${tail}`;
}

function toolIdentity(event: AgentEvent): string | undefined {
  const { call_id: id, attempt } = event.data;
  return typeof id === "string" && id && Number.isInteger(attempt) && Number(attempt) > 0
    ? JSON.stringify([id, attempt])
    : undefined;
}

export function agentTimeline(run: AgentRun): TimelineItem[] {
  const items: TimelineItem[] = [];
  let pending: AgentToolCard[] = [];
  let analyses = new Map<number, AgentAnalysisCard>();
  const interrupt = (at: string) => {
    pending.forEach((card) => (card.interruptedAt = at));
    pending = [];
    analyses.forEach((card) => {
      if (card.state === "streaming") card.state = "interrupted";
    });
    analyses = new Map();
  };

  for (const event of run.events) {
    if (["started", "recovering", "model_call"].includes(event.type)) interrupt(event.created_at);
    if (event.type === "analysis") {
      const { model_call: modelCall, text, complete } = event.data;
      if (
        typeof modelCall !== "number" ||
        !Number.isInteger(modelCall) ||
        modelCall < 1 ||
        typeof text !== "string" ||
        typeof complete !== "boolean"
      )
        continue;
      let card = analyses.get(modelCall);
      if (!card) {
        card = {
          kind: "analysis",
          key: `analysis-${event.seq}`,
          modelCall,
          text: "",
          state: "streaming",
        };
        analyses.set(modelCall, card);
        items.push(card);
      }
      card.text = [...text].slice(0, 1200).join("");
      card.state = complete ? "complete" : "streaming";
    } else if (event.type === "tool_started" || event.type === "tool_completed") {
      const name = typeof event.data.name === "string" ? event.data.name : "";
      let card: AgentToolCard | undefined;
      if (event.type === "tool_completed") {
        const identity = toolIdentity(event);
        // 旧事件只在同轮唯一候选时配对；部分 ID 或并行同名调用不能猜测归属。
        const candidates = pending.filter((item) => {
          if (item.name !== name || !item.started) return false;
          if (identity) return toolIdentity(item.started) === identity;
          return (
            event.data.call_id == null &&
            item.started.data.call_id == null &&
            event.data.attempt === item.started.data.attempt
          );
        });
        if (name && candidates.length === 1) card = candidates[0];
      }
      if (!card) {
        card = { kind: "tool", key: `tool-${event.seq}`, name };
        items.push(card);
      }
      if (event.type === "tool_started") {
        card.started = event;
        pending.push(card);
      } else {
        card.completed = event;
        pending = pending.filter((item) => item !== card);
      }
    } else {
      items.push({ kind: "event", key: `event-${event.seq}`, event });
    }
  }
  if (!["pending", "running"].includes(run.status)) {
    pending.forEach((card) => (card.interruptedAt = run.updated_at));
    analyses.forEach((card) => {
      if (card.state === "streaming") card.state = "interrupted";
    });
  }
  return items;
}

export function toolArguments(card: AgentToolCard): string {
  const args = card.started?.data.arguments;
  if (args && typeof args === "object" && !Array.isArray(args))
    return JSON.stringify(args, null, 2);
  const query = card.started?.data.query ?? card.completed?.data.query;
  return typeof query === "string" ? query : "历史记录未提供查询参数。";
}

export function toolCitations(card: AgentToolCard): ChatCitation[] {
  const citations = card.completed?.data.citations;
  if (!Array.isArray(citations)) return [];
  return citations.flatMap((value) => {
    if (!value || typeof value.id !== "string" || typeof value.title !== "string") return [];
    return [
      {
        id: value.id,
        title: value.title,
        snippet: typeof value.snippet === "string" ? value.snippet : undefined,
        document_id: typeof value.document_id === "number" ? value.document_id : undefined,
        chunk_index: typeof value.chunk_index === "number" ? value.chunk_index : undefined,
      },
    ];
  });
}
