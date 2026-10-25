import { describe, expect, it } from "vitest";
import type { AgentEvent, AgentRun } from "@/api/module_ai/agent";
import {
  agentDuration,
  agentTimeline,
  agentTimestamp,
  toolCitations,
} from "./diagnosticAgentTimeline";

const tool = (seq: number, type: string, data: Record<string, unknown> = {}): AgentEvent => ({
  seq,
  type,
  data: { name: "search_knowledge", ...data },
  message: "查询",
  created_at: `2026-10-24T12:00:${String(seq).padStart(2, "0")}`,
});
const timeline = (events: AgentEvent[]) =>
  agentTimeline({
    status: "running",
    events,
  } as AgentRun);

describe("diagnostic event presentation", () => {
  it("pairs call ID and attempt even when same-name tools complete out of order", () => {
    const items = timeline([
      tool(1, "tool_started", { call_id: "a", attempt: 1 }),
      tool(2, "tool_started", { call_id: "b", attempt: 1 }),
      tool(3, "tool_completed", { call_id: "b", attempt: 1 }),
      tool(4, "tool_completed", { call_id: "a", attempt: 1 }),
    ]);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ started: { seq: 1 }, completed: { seq: 4 } });
    expect(items[1]).toMatchObject({ started: { seq: 2 }, completed: { seq: 3 } });
    expect(
      timeline([
        tool(1, "tool_started", { call_id: "a", attempt: 1 }),
        tool(2, "tool_completed", { call_id: "a", attempt: 2 }),
      ])
    ).toHaveLength(2);
  });

  it("only merges unambiguous legacy pairs and does not cross model or recovery boundaries", () => {
    expect(timeline([tool(1, "tool_started"), tool(2, "tool_completed")])).toHaveLength(1);
    expect(
      timeline([tool(1, "tool_started"), tool(2, "tool_started"), tool(3, "tool_completed")])
    ).toHaveLength(3);
    expect(
      timeline([tool(1, "tool_started"), tool(2, "tool_completed", { call_id: "a", attempt: 1 })])
    ).toHaveLength(2);
    for (const boundary of ["model_call", "recovering"]) {
      const items = timeline([
        tool(1, "tool_started"),
        tool(2, boundary),
        tool(3, "tool_completed"),
      ]);
      expect(items).toHaveLength(3);
      expect(items[0]).toMatchObject({ interruptedAt: "2026-10-24T12:00:02" });
      expect(items[2]).not.toHaveProperty("started");
    }
  });

  it("preserves separate calls across recovery even when the model reuses an ID", () => {
    const items = timeline([
      tool(1, "tool_started", { call_id: "a", attempt: 1 }),
      tool(2, "recovering"),
      tool(3, "tool_started", { call_id: "a", attempt: 2 }),
      tool(4, "tool_completed", { call_id: "a", attempt: 2 }),
    ]);
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ interruptedAt: "2026-10-24T12:00:02" });
    expect(items[2]).toMatchObject({ started: { seq: 3 }, completed: { seq: 4 } });
  });

  it("caps public snapshots and ignores unannounced fields and malformed summaries", () => {
    const items = timeline([
      tool(1, "analysis", { model_call: 1, text: "旧文本", complete: false }),
      tool(2, "analysis", {
        model_call: 1,
        text: "文".repeat(1300),
        complete: true,
        reasoning: "私有",
      }),
      tool(3, "analysis", { model_call: "2", text: "无效", complete: false }),
      tool(4, "analysis", { model_call: 2, text: "无效" }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ text: "文".repeat(1200), state: "complete" });
    expect(items[0]).not.toHaveProperty("reasoning");
  });

  it("picks only public citation fields", () => {
    expect(
      toolCitations({
        kind: "tool",
        key: "one",
        name: "search_knowledge",
        completed: tool(1, "tool_completed", {
          citations: [null, {}, { id: "doc", title: "文档", snippet: "公开片段", raw: "私有" }],
        }),
      })
    ).toEqual([
      {
        id: "doc",
        title: "文档",
        snippet: "公开片段",
        document_id: undefined,
        chunk_index: undefined,
      },
    ]);
  });

  it("parses naive timestamps as local time, respects offsets and handles unknown durations", () => {
    expect(agentTimestamp("2026-10-24T12:00:00")).toBe(new Date(2026, 9, 24, 12).getTime());
    expect(agentTimestamp("2026-10-24 12:00:00.123456")).toBe(
      new Date(2026, 9, 24, 12, 0, 0, 123).getTime()
    );
    expect(agentTimestamp("2026-10-24T12:00:00+08:00")).toBe(Date.UTC(2026, 9, 24, 4));
    expect(agentTimestamp("bad timestamp")).toBeNull();
    expect(agentDuration("bad timestamp", Date.now())).toBe("未知");
    expect(agentDuration(undefined, Date.now())).toBe("未知");
    const start = "2026-10-24T12:00:00";
    expect(agentDuration(start, agentTimestamp(start)! - 1000)).toBe("00:00");
    expect(agentDuration(start, agentTimestamp(start)! + 3661000)).toBe("1:01:01");
  });
});
