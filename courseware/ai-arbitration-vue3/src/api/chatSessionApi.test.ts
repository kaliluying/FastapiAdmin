import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createChatSessionApi, deleteChatSessionApi, listChatSessionsApi } from "./chatSessionApi";

const mockFetch = (payload: unknown) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => payload,
    }),
  );
};

describe("chatSessionApi", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => ""),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads user-bound chat sessions from the backend", async () => {
    mockFetch({
      code: 0,
      msg: "ok",
      data: {
        items: [
          {
            id: "session-1",
            title: "工资争议咨询",
            message_count: 2,
            updated_time: "2026-06-30 10:20:00",
            messages: [
              { id: "m1", role: "user", content: "公司拖欠工资", created_at: 1782800000 },
            ],
          },
        ],
      },
    });

    const sessions = await listChatSessionsApi();

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8004/api/v1/ai/chat/list?page_no=1&page_size=50",
      expect.any(Object),
    );
    expect(sessions[0]).toMatchObject({
      id: "session-1",
      title: "工资争议咨询",
      caseName: "工资争议咨询",
      applicant: "当前用户",
      messages: [{ id: "m1", role: "user", content: "公司拖欠工资" }],
    });
  });

  it("creates a user-bound chat session on the backend", async () => {
    mockFetch({
      code: 0,
      msg: "ok",
      data: {
        id: "session-created",
        title: "新的仲裁咨询",
        message_count: 0,
        messages: [],
      },
    });

    const session = await createChatSessionApi("新的仲裁咨询");

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8004/api/v1/ai/chat/create",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "新的仲裁咨询" }),
      }),
    );
    expect(session.id).toBe("session-created");
  });

  it("deletes a user-bound chat session on the backend", async () => {
    mockFetch({
      code: 0,
      msg: "ok",
      data: null,
    });

    await deleteChatSessionApi("session-delete");

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8004/api/v1/ai/chat/delete",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify(["session-delete"]),
      }),
    );
  });
});
