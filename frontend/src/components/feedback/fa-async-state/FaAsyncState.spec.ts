import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaAsyncState from "./index.vue";

describe("FaAsyncState", () => {
  it("announces an error and exposes retry action", () => {
    const wrapper = mount(FaAsyncState, {
      props: { state: "error", title: "加载失败" },
      slots: { action: "<button>重试</button>" },
    });
    expect(wrapper.attributes("role")).toBe("alert");
    expect(wrapper.text()).toContain("加载失败");
    expect(wrapper.get("button").text()).toBe("重试");
  });
});
