import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders common AI markdown syntax", () => {
    const html = renderMarkdown("## 仲裁建议\n\n- 保留劳动合同\n- 整理工资流水\n\n**注意期限**");

    expect(html).toContain("<h2>仲裁建议</h2>");
    expect(html).toContain("<li>保留劳动合同</li>");
    expect(html).toContain("<strong>注意期限</strong>");
  });

  it("removes unsafe html from model output", () => {
    const html = renderMarkdown('<script>alert("x")</script><img src="x" onerror="alert(1)">');

    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
  });
});
