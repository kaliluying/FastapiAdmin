import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FaAiProcessStatus from "./FaAiProcessStatus.vue";
import FaCitationList from "./FaCitationList.vue";
import FaAiPageHeader from "./FaAiPageHeader.vue";
import FaWelcomeScreen from "../chat/components/FaWelcomeScreen.vue";
import FaChatNavbar from "../chat/components/FaChatNavbar.vue";

describe("AI workspace primitives", () => {
  it("does not reserve an empty header actions area", () => {
    const wrapper = mount(FaAiPageHeader, { props: { title: "知识库" } });
    expect(wrapper.get("h1").text()).toBe("知识库");
    expect(wrapper.find(".fa-page-header__actions").exists()).toBe(false);
  });

  it("keeps context and primary actions together", () => {
    const wrapper = mount(FaAiPageHeader, {
      props: { title: "文档" },
      slots: { context: "处理状态", actions: "<button>上传文档</button>" },
    });
    expect(wrapper.get(".fa-page-header__actions").text()).toContain("处理状态");
    expect(wrapper.get("button").text()).toBe("上传文档");
  });

  it("uses native prompt buttons without changing prompt payloads", async () => {
    const wrapper = mount(FaWelcomeScreen, {
      global: { stubs: { ElIcon: true, FaSvgIcon: true } },
    });
    expect(wrapper.findAll("button.prompt-card")).toHaveLength(4);
    await wrapper.get("button.prompt-card").trigger("click");
    expect(wrapper.emitted("prompt-click")?.[0]).toEqual(["请介绍一下FastApiAdmin系统"]);
  });

  it("labels the workspace and knowledge selection while preserving actions", async () => {
    const wrapper = mount(FaChatNavbar, {
      props: { connectionStatus: "connected", isConnected: true, messageCount: 0 },
      global: {
        stubs: {
          ElButton: {
            emits: ["click"],
            template: "<button @click=\"$emit('click')\"><slot /></button>",
          },
          ElSelect: true,
          ElTag: true,
          ElIcon: true,
          FaSvgIcon: true,
        },
      },
    });
    expect(wrapper.get("h1").text()).toBe("知识问答");
    expect(wrapper.get("el-select-stub").attributes("aria-label")).toBe("用于回答的知识库");
    await wrapper.get(".collapse-btn").trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "回答依据")!
      .trigger("click");
    expect(wrapper.emitted("show-evidence")).toHaveLength(1);
  });

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
    expect(wrapper.get("button[aria-expanded]").attributes("aria-expanded")).toBe("false");
    wrapper.get(".fa-citation-item__title").trigger("click");
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ title: "权限管理指南" });
  });
  it("shows real provenance including chunk zero, without inventing missing metadata", async () => {
    const citation = {
      id: "doc-7-0",
      title: "操作手册",
      document_id: 7,
      chunk_index: 0,
      snippet: "真实片段",
    };
    const wrapper = mount(FaCitationList, { props: { citations: [citation] } });
    expect(wrapper.get(".fa-citation-item__meta").text()).toContain("文档 7");
    expect(wrapper.get(".fa-citation-item__meta").text()).toContain("分块 0");
    await wrapper.get("button[aria-expanded]").trigger("click");
    expect(wrapper.get(".fa-citation-item__snippet").text()).toBe("真实片段");
    await wrapper.get(".fa-citation-item__title").trigger("click");
    expect(wrapper.emitted("select")?.[0]).toEqual([citation]);
    await wrapper.setProps({ citations: [{ id: "attachment", title: "附件" }] });
    expect(wrapper.find(".fa-citation-item__meta").exists()).toBe(false);
    expect(wrapper.text()).not.toMatch(/得分|页码/);
  });
});
