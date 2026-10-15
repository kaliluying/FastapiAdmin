import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { describe, expect, it, vi } from "vitest";
import FaChatMessages from "./FaChatMessages.vue";

vi.mock("@stores", () => ({ useUserStoreHook: () => ({ basicInfo: { name: "测试用户" } }) }));
vi.mock("./FaAnswerFeedback.vue", () => ({ default: { template: "<div />" } }));

describe("recovered chat failures", () => {
  it("replaces retry with a link that scrolls and focuses the confirmed answer", async () => {
    const scroll = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    const wrapper = mount(FaChatMessages, {
      props: {
        error: "",
        messages: [
          {
            id: "failed",
            type: "assistant",
            content: "",
            timestamp: 1,
            error: "暂不可用",
            retriedMessageId: "saved",
          },
          { id: "saved", type: "assistant", content: "成功回答", timestamp: 2 },
        ],
      },
      attachTo: document.body,
      global: { plugins: [ElementPlus], stubs: { FaMarkdownRenderer: true, FaSvgIcon: true } },
    });
    try {
      const saved = wrapper.get('[data-message-id="saved"]').element as HTMLElement;
      saved.scrollIntoView = scroll;
      expect(wrapper.get('[role="status"]').text()).toContain("已重试成功");
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.text()).not.toContain("重试这条问题");
      await wrapper.get(".message-actions button").trigger("click");
      expect(scroll).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(saved);
      expect(wrapper.emitted("retry")).toBeUndefined();
    } finally {
      wrapper.unmount();
      vi.unstubAllGlobals();
    }
  });
});
