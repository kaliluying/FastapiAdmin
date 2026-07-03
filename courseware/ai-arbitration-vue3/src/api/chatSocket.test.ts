import { describe, expect, it } from "vitest";
import { buildChatSocketUrl, serializeChatPayload } from "./chatSocket";

describe("chatSocket", () => {
  it("builds websocket url with token query", () => {
    const url = buildChatSocketUrl({
      endpoint: "ws://127.0.0.1:8004",
      path: "/api/v1/ai/chat/ws",
      token: "abc123",
    });

    expect(url).toBe("ws://127.0.0.1:8004/api/v1/ai/chat/ws?token=abc123");
  });

  it("serializes backend chat payload", () => {
    expect(
      serializeChatPayload({
        message: "公司拖欠工资怎么办？",
        sessionId: "session-1",
        knowledgeBaseIds: [1, 2],
      }),
    ).toBe(
      JSON.stringify({
        message: "公司拖欠工资怎么办？",
        session_id: "session-1",
        knowledge_base_ids: [1, 2],
      }),
    );
  });
});
