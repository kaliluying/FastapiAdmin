import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiChatAPI } from "./chat";

const request = vi.hoisted(() => vi.fn());
vi.mock("@/utils/http", () => ({ request }));
beforeEach(() => request.mockReset());

describe("chat SSE transport", () => {
  it("opens only after valid headers and forwards actual SSE data", async () => {
    request.mockResolvedValue({
      headers: { "content-type": "text/event-stream; charset=utf-8" },
      data: new Response('data: {"type":"done"}\n\n').body,
    });
    const onOpen = vi.fn();
    const onData = vi.fn(() => expect(onOpen).toHaveBeenCalledOnce());
    const controller = new AbortController();
    await AiChatAPI.stream({ message: "hello" }, controller.signal, onData, onOpen);
    expect(onData).toHaveBeenCalledWith('{"type":"done"}');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        adapter: "fetch",
        responseType: "stream",
        signal: controller.signal,
        timeout: 0,
      })
    );
  });

  it("cancels an unexpected response and leaves the draft unopened", async () => {
    const cancel = vi.fn();
    request.mockResolvedValue({
      headers: { "content-type": "application/json" },
      data: new ReadableStream({ cancel }),
    });
    const onOpen = vi.fn();
    await expect(
      AiChatAPI.stream({}, new AbortController().signal, vi.fn(), onOpen)
    ).rejects.toThrow("事件流");
    expect(cancel).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("releases a response that arrives after cancellation without clearing the draft", async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    controller.abort();
    request.mockResolvedValue({
      headers: { "content-type": "text/event-stream" },
      data: new ReadableStream({ cancel }),
    });
    const onOpen = vi.fn();
    await expect(AiChatAPI.stream({}, controller.signal, vi.fn(), onOpen)).rejects.toThrow(
      "请求已取消"
    );
    expect(cancel).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
