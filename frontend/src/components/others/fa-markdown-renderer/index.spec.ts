import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import FaMarkdownRenderer from "./index.vue";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("FaMarkdownRenderer code block extensions", () => {
  it("renders data-lang attribute and independent code copy button", async () => {
    const content = "```python\nprint('hello fastcore')\n```";
    const wrapper = mount(FaMarkdownRenderer, {
      props: { content },
    });
    const pre = wrapper.find("pre");
    expect(pre.exists()).toBe(true);
    expect(pre.attributes("data-lang")).toBe("python");

    const copyBtn = pre.find(".code-copy-btn");
    expect(copyBtn.exists()).toBe(true);
    expect(copyBtn.attributes("aria-label")).toBe("复制代码");

    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await copyBtn.trigger("click");
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith("print('hello fastcore')\n");
    expect(copyBtn.classes()).toContain("is-copied");
  });

  it("renders code block without data-lang when language is omitted", () => {
    const content = "```\nplain text block\n```";
    const wrapper = mount(FaMarkdownRenderer, {
      props: { content },
    });
    const pre = wrapper.find("pre");
    expect(pre.exists()).toBe(true);
    expect(pre.attributes("data-lang")).toBeUndefined();
    expect(pre.find(".code-copy-btn").exists()).toBe(true);
  });
});
