/** Observe actual HTTP response bodies; never depend on application event handlers. */
function observeSse(page, events, requests = []) {
  const pending = new Set();
  page.on("request", (request) => {
    if (request.url().endsWith("/ai/chat/stream") && request.method() === "POST")
      requests.push(request.postDataJSON());
  });
  page.on("response", (response) => {
    if (!response.url().endsWith("/ai/chat/stream")) return;
    const capture = (async () => {
      if (!response.headers()["content-type"]?.includes("text/event-stream")) return;
      try {
        for (const frame of (await response.body()).toString("utf8").split(/\r?\n\r?\n/)) {
          const data = frame
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          if (data) events.push(JSON.parse(data));
        }
      } catch {
        // Browser aborts intentionally cancelled streams before a complete body exists.
      }
    })();
    pending.add(capture);
    capture.finally(() => pending.delete(capture));
  });
  return () => Promise.all([...pending]);
}

module.exports = { observeSse };
