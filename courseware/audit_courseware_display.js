const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = __dirname;
const REPORT_PATH = path.join(ROOT, "assets", "mockups", "courseware-display-audit.json");
const VIEWPORT = { width: 1920, height: 940 };
const PORT = 9333;
const APP_URL = "http://127.0.0.1:8765/index.html";

function findBrowser() {
  const candidates = [
    path.join(process.env.ProgramFiles || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env.ProgramFiles || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

async function removeDirWithRetry(dir) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}

async function waitForDebugger() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      return await getJson(`http://127.0.0.1:${PORT}/json/version`);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error("Browser remote debugging port did not become ready.");
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.ws.close();
  }
}

async function evaluate(client, sessionId, expression) {
  const result = await client.send(
    "Runtime.evaluate",
    {
      expression,
      awaitPromise: true,
      returnByValue: true,
    },
    sessionId,
  );
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed.");
  }
  return result.result.value;
}

const browserAuditSource = `
(async () => {
  const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));
  const textOf = (node) => (node?.textContent || "").replace(/\\s+/g, " ").trim();
  const click = async (selector) => {
    const element = document.querySelector(selector);
    if (!element) throw new Error("Missing selector: " + selector);
    element.click();
    await wait();
  };
  const issue = (type, label, detail) => ({ type, label, detail });
  const elementInfo = (element) => ({
    tag: element.tagName.toLowerCase(),
    className: String(element.className || ""),
    text: textOf(element).slice(0, 80),
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  });
  const inspect = (label) => {
    const issues = [];
    const root = document.documentElement;
    const stage = document.querySelector(".deck-stage");
    const dock = document.querySelector(".slide-dock");
    const canvas = document.querySelector(".slide-canvas");
    const concept = document.querySelector(".concept-panel");
    const deckActions = document.querySelector(".deck-actions");

    if (root.scrollWidth > root.clientWidth + 2) {
      issues.push(issue("page-horizontal-overflow", label, { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth }));
    }

    for (const [name, element] of [["stage", stage], ["dock", dock], ["canvas", canvas], ["concept", concept], ["actions", deckActions]]) {
      if (!element) {
        issues.push(issue("missing-element", label, { name }));
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        issues.push(issue("zero-size-element", label, { name, rect: { width: rect.width, height: rect.height } }));
      }
      if (name === "stage" && rect.bottom > window.innerHeight - 38) {
        issues.push(issue("stage-too-tall", label, { bottom: Math.round(rect.bottom), viewport: window.innerHeight }));
      }
      if (name === "dock" && rect.bottom > window.innerHeight + 2) {
        issues.push(issue("dock-out-of-viewport", label, { bottom: Math.round(rect.bottom), viewport: window.innerHeight }));
      }
    }

    const criticalSelectors = [
      ".deck-title-block h1",
      ".deck-points li span",
      ".visual-node strong",
      ".concept-panel section",
      ".lecture-strip",
      ".slide-canvas",
    ];
    for (const selector of criticalSelectors) {
      for (const element of document.querySelectorAll(selector)) {
        const style = getComputedStyle(element);
        const allowsScroll = ["auto", "scroll"].includes(style.overflowX) || ["auto", "scroll"].includes(style.overflowY);
        if (!allowsScroll && element.scrollWidth > element.clientWidth + 12) {
          issues.push(issue("text-horizontal-overflow", label, { selector, ...elementInfo(element) }));
        }
      }
    }

    return {
      label,
      title: textOf(document.querySelector(".deck-title-block h1")),
      activeRoute: textOf(document.querySelector(".route-button.active")),
      activeDay: textOf(document.querySelector(".rail-chapter.active .rail-chapter-head strong")),
      slide: textOf(document.querySelector(".slide-counter")),
      issues,
    };
  };

  const results = [];
  const auditSlides = async (labelPrefix) => {
    const total = document.querySelectorAll(".dock-card").length;
    for (let index = 0; index < total; index += 1) {
      await click('.dock-card[data-slide="' + index + '"]');
      results.push(inspect(labelPrefix + " / slide " + (index + 1) + "/" + total));
    }
  };

  await click('[data-route="overview"]');
  await auditSlides("overview");

  await click('[data-route="build-lab"]');
  await auditSlides("build-lab");

  await click('[data-route="program"]');
  for (const day of ["day1", "day2", "day3", "day4"]) {
    await click('[data-day="' + day + '"]');
    await auditSlides("program / " + day);
  }

  await click('[data-route="tech-map"]');
  await auditSlides("tech-map");

  await click('[data-route="defense"]');
  await auditSlides("defense");

  return JSON.stringify({ viewport: { width: window.innerWidth, height: window.innerHeight }, checked: results.length, results });
})()
`;

async function main() {
  const browser = findBrowser();
  if (!browser) throw new Error("Microsoft Edge or Google Chrome was not found.");

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "courseware-audit-"));
  const child = spawn(browser, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    "about:blank",
  ]);

  try {
    const version = await waitForDebugger();
    const client = new CdpClient(version.webSocketDebuggerUrl);
    await client.open();
    const target = await client.send("Target.createTarget", { url: "about:blank" });
    const attached = await client.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
    const sessionId = attached.sessionId;
    await client.send("Page.enable", {}, sessionId);
    await client.send("Runtime.enable", {}, sessionId);
    await client.send(
      "Emulation.setDeviceMetricsOverride",
      {
        width: VIEWPORT.width,
        height: VIEWPORT.height,
        deviceScaleFactor: 1,
        mobile: false,
      },
      sessionId,
    );
    await client.send("Page.navigate", { url: APP_URL }, sessionId);
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const ready = await evaluate(client, sessionId, "document.readyState");
      if (ready === "complete" || ready === "interactive") break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    const report = JSON.parse(await evaluate(client, sessionId, browserAuditSource));
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
    const issues = report.results.flatMap((result) => result.issues);
    console.log(JSON.stringify({ report: REPORT_PATH, checked: report.checked, issueCount: issues.length, issues: issues.slice(0, 20) }, null, 2));
    client.close();
  } finally {
    child.kill();
    await removeDirWithRetry(userDataDir);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
