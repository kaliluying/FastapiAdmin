import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("operations dashboard", () => {
  const home = readFileSync(resolve(__dirname, "index.vue"), "utf-8");
  const banner = readFileSync(resolve(__dirname, "modules/banner.vue"), "utf-8");

  it("renders session-backed operational information instead of demo metrics", () => {
    expect(home).toContain("系统总览");
    expect(home).toContain("可见菜单");
    expect(home).toContain("权限点");
    expect(home).toContain("会话检查");
    expect(home).not.toContain("示例数据");
    expect(home).not.toContain("平均响应");
    expect(home).not.toContain("检索请求");
  });

  it("keeps the welcome banner backed by the current session", () => {
    expect(banner).toContain("认证会话");
    expect(banner).toContain("可用模块");
    expect(banner).toContain("权限点");
    expect(banner).not.toContain("Knowledge Ops Console");
    expect(banner).not.toContain("知识库");
    expect(banner).not.toContain("待处理动态");
  });
});
