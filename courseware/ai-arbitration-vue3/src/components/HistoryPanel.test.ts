import { describe, expect, it } from "vitest";
import historyPanelSource from "./HistoryPanel.vue?raw";

describe("HistoryPanel", () => {
  it("exposes a per-session delete command without selecting the session", () => {
    expect(historyPanelSource).toContain(':aria-label="`删除会话：${session.title}`"');
    expect(historyPanelSource).toContain("@click.stop=");
    expect(historyPanelSource).toContain("$emit('deleteSession', session.id)");
    expect(historyPanelSource).toContain("deleteSession: [value: string]");
  });

  it("frames sessions as case files for the arbitration workflow", () => {
    expect(historyPanelSource).toContain("案件档案");
    expect(historyPanelSource).toContain("新建案件咨询");
  });
});
