import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import ElementPlus, { ElMessage } from "element-plus";
import { createI18n } from "vue-i18n";
import { afterEach, describe, expect, it, vi } from "vitest";
import FaCopyButton from "./index.vue";

const text = "# 回答\n\n```python\nprint('你好')\n```\n末行";
const wrappers: VueWrapper[] = [];
function create() {
  const wrapper = mount(FaCopyButton, {
    props: { text },
    attrs: { "aria-label": "复制回答", class: "answer-copy" },
    attachTo: document.body,
    global: {
      plugins: [
        ElementPlus,
        createI18n({
          legacy: false,
          locale: "zh",
          messages: { zh: { common: { copySuccess: "复制成功", copyFailed: "复制失败" } } },
        }),
      ],
    },
  });
  wrappers.push(wrapper);
  return wrapper;
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("copy button", () => {
  it("copies multiline Markdown intact and forwards accessible button attributes", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const success = vi.spyOn(ElMessage, "success").mockImplementation(() => ({ close() {} }));
    const wrapper = create();
    expect(wrapper.get("button").classes()).toContain("answer-copy");
    await wrapper.get('[aria-label="复制回答"]').trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(text);
    expect(success).toHaveBeenCalledWith("复制成功");
  });

  it("reports clipboard permission failure without claiming success", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const warning = vi.spyOn(ElMessage, "warning").mockImplementation(() => ({ close() {} }));
    const success = vi.spyOn(ElMessage, "success");
    await create().get("button").trigger("click");
    await flushPromises();
    expect(warning).toHaveBeenCalledWith("复制失败");
    expect(success).not.toHaveBeenCalled();
  });

  it.each([true, false, "throw"])(
    "preserves lines, cleans up and restores focus in legacy mode (%s)",
    async (outcome) => {
      vi.stubGlobal("navigator", {});
      const success = vi.spyOn(ElMessage, "success").mockImplementation(() => ({ close() {} }));
      const warning = vi.spyOn(ElMessage, "warning").mockImplementation(() => ({ close() {} }));
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const original = Object.getOwnPropertyDescriptor(document, "execCommand");
      const execCommand = vi.fn(() => {
        const input = document.body.querySelector("textarea")!;
        expect(input.value).toBe(text);
        expect(input.selectionEnd).toBe(text.length);
        if (outcome === "throw") throw new Error("unsupported");
        return outcome;
      });
      Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
      try {
        const wrapper = create();
        wrapper.get("button").element.focus();
        await wrapper.get("button").trigger("click");
        expect(execCommand).toHaveBeenCalledExactlyOnceWith("copy");
        expect(document.body.querySelector("textarea")).toBeNull();
        expect(document.activeElement).toBe(wrapper.get("button").element);
        expect(success).toHaveBeenCalledTimes(outcome === true ? 1 : 0);
        expect(warning).toHaveBeenCalledTimes(outcome === true ? 0 : 1);
      } finally {
        if (original) Object.defineProperty(document, "execCommand", original);
        else Reflect.deleteProperty(document, "execCommand");
      }
    }
  );
});
