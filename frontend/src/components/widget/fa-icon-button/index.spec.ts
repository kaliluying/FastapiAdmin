import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaIconButton from "./index.vue";

describe("FaIconButton", () => {
  it("provides a named native button without submitting parent forms", async () => {
    const wrapper = mount(FaIconButton, {
      props: { icon: "ri:menu-line", label: "展开导航" },
      attrs: { "aria-expanded": false },
      global: { stubs: { FaSvgIcon: true } },
    });
    const button = wrapper.get("button");
    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("aria-label")).toBe("展开导航");
    expect(button.attributes("aria-expanded")).toBe("false");
    await button.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});
