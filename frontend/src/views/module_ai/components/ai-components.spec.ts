import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaAiProcessStatus from "./FaAiProcessStatus.vue";
import FaCitationList from "./FaCitationList.vue";

describe("AI workspace primitives", () => {
  it("announces the current process stage", () => {
    const wrapper = mount(FaAiProcessStatus, { props: { stage: "retrieving" } });
    expect(wrapper.attributes("aria-live")).toBe("polite");
    expect(wrapper.text()).toContain("正在检索");
  });

  it("renders numbered expandable citations", () => {
    const wrapper = mount(FaCitationList, {
      props: { citations: [{ id: "1", title: "权限管理指南", snippet: "角色可关联查询权限" }] },
    });
    expect(wrapper.text()).toContain("权限管理指南");
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
  });
});
