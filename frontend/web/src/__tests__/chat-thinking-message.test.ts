import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("AI chat thinking messages", () => {
  it("renders thinking content with its own fold state instead of folding the whole answer", () => {
    const itemSource = readFileSync(resolve(__dirname, "../views/module_ai/chat/components/FaMessageItem.vue"), "utf-8");
    const chatSource = readFileSync(resolve(__dirname, "../views/module_ai/chat/index.vue"), "utf-8");

    expect(itemSource).toContain("parseThinkingContent");
    expect(itemSource).toContain("thinkingCollapsed");
    expect(itemSource).toContain("思考过程");
    expect(itemSource).not.toContain(':max-length="message.collapsed ? 200 : undefined"');
    expect(chatSource).not.toContain("collapsed: content.length > 200");
    expect(chatSource).not.toContain("msg.collapsed = msg.content.length > 200");
  });
});
