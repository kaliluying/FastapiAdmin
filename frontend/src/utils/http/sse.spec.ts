import { describe, expect, it } from "vitest";
import { readSse } from "./sse";

function chunks(parts: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      parts.forEach((part) => controller.enqueue(part));
      controller.close();
    },
  });
}

describe("SSE framing", () => {
  it("handles split UTF-8, CRLF, comments, and multiline data", async () => {
    const bytes = new TextEncoder().encode(
      ': ping\r\ndata: {"content":"中文"}\r\n\r\ndata: first\ndata: second\n\n'
    );
    const received: string[] = [];
    await readSse(chunks(Array.from(bytes, (byte) => Uint8Array.of(byte))), (data) =>
      received.push(data)
    );
    expect(received).toEqual(['{"content":"中文"}', "first\nsecond"]);
  });

  it("accepts CR-only frames at EOF and rejects invalid UTF-8", async () => {
    const received: string[] = [];
    await readSse(chunks([new TextEncoder().encode("data: complete\r\r")]), (data) =>
      received.push(data)
    );
    expect(received).toEqual(["complete"]);
    await expect(readSse(chunks([Uint8Array.of(0xff)]), () => {})).rejects.toThrow();
  });

  it("rejects truncated frames and cancels the reader after callback failure", async () => {
    await expect(
      readSse(chunks([new TextEncoder().encode("data: unfinished")]), () => {})
    ).rejects.toThrow("中断");
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: invalid\n\n"));
      },
      cancel() {
        cancelled = true;
      },
    });
    await expect(
      readSse(stream, () => {
        throw new Error("invalid JSON");
      })
    ).rejects.toThrow("invalid JSON");
    expect(cancelled).toBe(true);
  });
});
