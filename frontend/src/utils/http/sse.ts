/** 跨任意 UTF-8 字节和网络分块边界读取 SSE 数据帧。 */
export async function readSse(
  stream: ReadableStream<Uint8Array>,
  onData: (data: string) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let buffer = "";
  let data: string[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let match: RegExpExecArray | null;
      const newline = done ? /\r\n|\n|\r/ : /\r\n|\n|\r(?!$)/;
      while ((match = newline.exec(buffer))) {
        const line = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        if (!line) {
          if (data.length) onData(data.join("\n"));
          data = [];
        } else if (line === "data" || line.startsWith("data:")) {
          data.push(line.slice(5).replace(/^ /, ""));
        }
      }
      if (done) break;
      if (buffer.length > 1_000_000) throw new Error("流式消息过大");
    }
    if (data.length || buffer.trim()) throw new Error("回答连接中断，请重试");
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
