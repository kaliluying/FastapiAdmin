import { defineComponent, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ModelConfigPage from "@/views/module_ai/model-config/index.vue";

const { listProviderModels } = vi.hoisted(() => ({ listProviderModels: vi.fn() }));

vi.mock("@/api/module_ai/chat", () => ({
  default: {
    getModelConfig: vi.fn().mockResolvedValue({
      data: { data: {
        chat_protocol: "openai",
        openai_base_url: "https://api.example.test/v1",
        openai_model: "old-model",
        openai_api_key_configured: true,
        embedding_provider: "local",
      } },
    }),
    listProviderModels,
  },
}));

vi.mock("@/hooks/core/useAuth", () => ({ useAuth: () => ({ hasAuth: () => true }) }));
vi.mock("element-plus", () => ({ ElMessage: { success: vi.fn() } }));

const AutocompleteStub = defineComponent({
  props: { modelValue: String, fetchSuggestions: Function },
  emits: ["update:modelValue", "input"],
  setup(props, { emit, expose }) {
    const options = ref<{ value: string }[]>([]);
    expose({
      focus: () => props.fetchSuggestions?.(props.modelValue, (items: { value: string }[]) => { options.value = items; }),
    });
    return { options, emit };
  },
  template: `
    <div>
      <input data-test="model-input" :value="modelValue" @input="emit('update:modelValue', $event.target.value); emit('input', $event.target.value)" />
      <button v-for="item in options" :key="item.value" class="model-option" @click="emit('update:modelValue', item.value)">{{ item.value }}</button>
    </div>
  `,
});

const stubs = {
  ElAutocomplete: AutocompleteStub,
  ElButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  ElCard: { template: '<section><slot name="header" /><slot /></section>' },
  ElForm: { template: '<form><slot /></form>' },
  ElFormItem: { template: '<div><slot /></div>' },
  ElSelect: { template: '<select><slot /></select>' },
  ElOption: { template: '<option><slot /></option>' },
  ElInput: { template: '<input />' },
  ElTag: { template: '<span><slot /></span>' },
  ElDivider: { template: '<hr /><slot />' },
  ElDescriptions: { template: '<div><slot /></div>' },
  ElDescriptionsItem: { template: '<div><slot /></div>' },
  FaAiPageHeader: true,
};

describe("Model configuration page", () => {
  it("shows fetched models for selection while keeping manual input", async () => {
    listProviderModels.mockResolvedValue({ data: { data: ["model-a", "model-b"] } });
    const wrapper = mount(ModelConfigPage, { global: { stubs, directives: { auth: {} } } });
    await flushPromises();

    await wrapper.findAll("button").find((button) => button.text() === "获取模型")!.trigger("click");
    await flushPromises();

    expect(listProviderModels).toHaveBeenCalledWith({ chat_protocol: "openai", openai_base_url: "https://api.example.test/v1" });
    expect(wrapper.findAll(".model-option").map((option) => option.text())).toEqual(["model-a", "model-b"]);

    await wrapper.findAll(".model-option")[1]!.trigger("click");
    expect((wrapper.get('[data-test="model-input"').element as HTMLInputElement).value).toBe("model-b");

    await wrapper.get('[data-test="model-input"]').setValue("custom-model");
    expect((wrapper.get('[data-test="model-input"').element as HTMLInputElement).value).toBe("custom-model");
  });
});
