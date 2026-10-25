import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createI18n } from "vue-i18n";
import { afterEach, describe, expect, it, vi } from "vitest";
import FaMessageItem from "./FaMessageItem.vue";
import type { ChatMessage } from "../types";

vi.mock("@stores", () => ({ useUserStoreHook: () => ({ basicInfo: { name: "测试用户" } }) }));
const wrappers: VueWrapper[] = [];
function create(message: Partial<ChatMessage> = {}) {
  const wrapper = mount(FaMessageItem, {
    props: {
      message: { id: "answer-1", type: "assistant", content: "", timestamp: 1, ...message },
    },
    global: {
      plugins: [ElementPlus, createI18n({ legacy: false, locale: "zh", messages: { zh: {} } })],
      stubs: { FaMarkdownRenderer: true, FaAnswerFeedback: true },
    },
  });
  wrappers.push(wrapper);
  return wrapper;
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  vi.unstubAllGlobals();
});

describe("copy chat answers", () => {
  it("offers a labelled button that copies only the answer, preserving Markdown", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const answer = "## 建议\n\n```sql\nSELECT 1;\n```\n检查日志。";
    const wrapper = create({ content: `<think>内部过程</think>\n${answer}` });
    const button = wrapper.get('[aria-label="复制回答"]');
    expect(button.text()).toBe("复制回答");
    await button.trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(answer);
  });

  it("copies the currently displayed partial answer while streaming", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const wrapper = create({ content: "第一行", loading: true });
    await wrapper.setProps({
      message: { ...wrapper.props("message"), content: "第一行\n第二行" },
    });
    await wrapper.get('[aria-label="复制回答"]').trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("第一行\n第二行");
  });

  it.each([
    "    first();\n    second();\n",
    "示例代码：\n\n```xml\n<think>literal</think>\n```\n结尾\n",
    "`<think>literal</think>`\n正文",
    "    <think>indented code</think>\n",
  ])("preserves literal Markdown without trimming or removing tags (%s)", async (content) => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await create({ content }).get('[aria-label="复制回答"]').trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(content);
  });

  it("removes only leading thought sections and preserves the answer's indentation", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const answer = "    first();\n    second();\n";
    const wrapper = create({
      content: `<think>第一段</think>\n<thinking>第二段</thinking>\n\n${answer}`,
    });
    await wrapper.get('[aria-label="复制回答"]').trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(answer);
  });

  it.each(["", " \n ", "<think>仅有思考内容", "<thinking>过程</thinking>"])(
    "does not offer an empty answer to copy (%s)",
    (content) => {
      expect(create({ content }).find('[aria-label="复制回答"]').exists()).toBe(false);
    }
  );

  it("continues to copy user messages verbatim", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const content = "示例标签：<think>文本</think>\n下一行";
    await create({ type: "user", content }).get('[aria-label="复制消息"]').trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(content);
  });
});
