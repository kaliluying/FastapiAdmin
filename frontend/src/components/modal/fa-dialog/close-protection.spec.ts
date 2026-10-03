import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, reactive, type Component } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import ElementPlus, { ElDialog, ElDrawer, ElMessageBox, type MessageBoxData } from "element-plus";
import FaDialog from "./index.vue";
import FaDrawer from "../fa-drawer/index.vue";

afterEach(() => vi.restoreAllMocks());

describe.each([
  { name: "dialog", component: FaDialog as Component, native: ElDialog },
  { name: "drawer", component: FaDrawer as Component, native: ElDrawer },
])("$name close protection", ({ component, native }) => {
  function openForm(extraProps: Record<string, unknown> = {}) {
    const state = reactive({ visible: true, submitting: false, form: { name: "原值" } });
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              component,
              {
                modelValue: state.visible,
                formMode: "update",
                formData: state.form,
                confirmLoading: state.submitting,
                "onUpdate:modelValue": (visible: boolean) => {
                  state.visible = visible;
                },
                onCancel: () => {
                  state.visible = false;
                },
                ...extraProps,
              },
              () => h("input", { value: state.form.name })
            );
        },
      }),
      {
        attachTo: document.body,
        global: {
          plugins: [ElementPlus],
          stubs: {
            transition: false,
            FaIconButton: {
              props: ["icon"],
              template: '<button :data-icon="icon"><slot /></button>',
            },
          },
        },
      }
    );
    return { state, wrapper };
  }

  async function clickMask(wrapper: ReturnType<typeof openForm>["wrapper"]) {
    const mask = wrapper.get(native === ElDialog ? ".el-overlay-dialog" : ".el-overlay");
    await mask.trigger("mousedown");
    await mask.trigger("mouseup");
    await mask.trigger("click");
  }

  it.each(["header", "cancel", "mask", "escape"])(
    "guards the %s close entry and retains edits on cancel",
    async (entry) => {
      const { state, wrapper } = openForm();
      await flushPromises();
      state.form.name = "修改内容";
      const confirm = vi.spyOn(ElMessageBox, "confirm").mockRejectedValue("cancel");
      await flushPromises();
      if (entry === "header") await wrapper.get('[data-icon="ri:close-line"]').trigger("click");
      else if (entry === "cancel")
        await wrapper
          .findAll("button")
          .find((button) => button.text() === "取消")!
          .trigger("click");
      else if (entry === "mask") await clickMask(wrapper);
      else
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true })
        );
      await flushPromises();
      expect(confirm).toHaveBeenCalledOnce();
      expect(state.visible).toBe(true);
      expect(state.form.name).toBe("修改内容");
      wrapper.unmount();
    }
  );

  it("blocks all shared close paths while submitting and allows confirmed discard afterward", async () => {
    const { state, wrapper } = openForm();
    await flushPromises();
    state.form.name = "修改内容";
    state.submitting = true;
    const confirm = vi
      .spyOn(ElMessageBox, "confirm")
      .mockResolvedValue("confirm" as MessageBoxData);
    await flushPromises();
    await wrapper.get('[data-icon="ri:close-line"]').trigger("click");
    await clickMask(wrapper);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true })
    );
    const cancel = wrapper.findAll("button").find((button) => button.text() === "取消")!;
    expect(cancel.attributes("disabled")).toBeDefined();
    await cancel.trigger("click");
    await flushPromises();
    expect(state.visible).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    state.submitting = false;
    await flushPromises();
    await cancel.trigger("click");
    await flushPromises();
    expect(state.visible).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("preserves an existing before-close veto for the cancel button", async () => {
    const beforeClose = vi.fn((done: (cancel?: boolean) => void) => done(true));
    const { state, wrapper } = openForm({ beforeClose });
    await flushPromises();
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "取消")!
      .trigger("click");
    await flushPromises();
    expect(beforeClose).toHaveBeenCalledOnce();
    expect(state.visible).toBe(true);
    wrapper.unmount();
  });

  it("lets the caller close detail mode through confirm without a discard prompt", async () => {
    const onConfirm = vi.fn(() => {
      state.visible = false;
    });
    const { state, wrapper } = openForm({ formMode: "detail", onConfirm });
    await flushPromises();
    state.form.name = "详情数据";
    const confirm = vi.spyOn(ElMessageBox, "confirm").mockRejectedValue("cancel");
    await flushPromises();
    expect(wrapper.findAll("button").some((button) => button.text() === "取消")).toBe(false);
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "确定")!
      .trigger("click");
    await flushPromises();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(state.visible).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
