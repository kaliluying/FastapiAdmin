import { defineComponent } from "vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, expect, it, vi } from "vitest";
import FaAnswerFeedback from "./FaAnswerFeedback.vue";

const api = vi.hoisted(() => ({ feedback: vi.fn() }));
vi.mock("@/api/module_ai/quality", () => ({ default: api }));
const button = defineComponent({
  props: ["disabled"],
  emits: ["click"],
  template: "<button :disabled='disabled' @click=\"$emit('click')\"><slot /></button>",
});
const dialog = defineComponent({
  props: ["modelValue"],
  template: "<div v-if='modelValue'><slot /><slot name='footer' /></div>",
});
const mountFeedback = () =>
  shallowMount(FaAnswerFeedback, {
    props: { sessionId: "session", runId: "answer" },
    global: { stubs: { ElButton: button, ElDialog: dialog, ElInput: true } },
  });

beforeEach(() => vi.resetAllMocks());

it("sends the persistent answer identity once while saving", async () => {
  let done!: () => void;
  api.feedback.mockReturnValue(
    new Promise<void>((resolve) => {
      done = resolve;
    })
  );
  const wrapper = mountFeedback();
  await wrapper.findAll("button")[0]!.trigger("click");
  await wrapper.findAll("button")[0]!.trigger("click");
  expect(api.feedback).toHaveBeenCalledTimes(1);
  expect(api.feedback).toHaveBeenCalledWith({
    session_id: "session",
    run_id: "answer",
    rating: "helpful",
    comment: "",
  });
  done();
  await flushPromises();
  expect(wrapper.text()).toContain("已反馈");
  wrapper.unmount();
});

it("retains the dialog and explanation after failed feedback", async () => {
  api.feedback.mockRejectedValue(new Error("offline"));
  const wrapper = mountFeedback();
  await wrapper.findAll("button")[1]!.trigger("click");
  wrapper.findComponent({ name: "ElInput" }).vm.$emit("update:modelValue", "来源不正确");
  await wrapper
    .findAll("button")
    .find((item) => item.text() === "保存反馈")!
    .trigger("click");
  await flushPromises();
  expect(wrapper.get('[role="alert"]').text()).toContain("内容已保留");
  expect(wrapper.findComponent({ name: "ElInput" }).attributes("modelvalue")).toBe("来源不正确");
  wrapper.unmount();
});
