import { effectScope, nextTick, reactive, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { ElMessageBox, type MessageBoxData } from "element-plus";
import { useCrudForm, useFormCloseGuard } from "./useCrudForm";
import type FaForm from "@/components/forms/fa-form/index.vue";

describe("form close protection", () => {
  it("confirms only dirty forms, retains edits on cancel, and blocks pending submissions", async () => {
    const state = reactive({ visible: false, submitting: false, form: { name: "原值" } });
    const scope = effectScope();
    const canClose = scope.run(() =>
      useFormCloseGuard({
        visible: () => state.visible,
        formData: () => state.form,
        submitting: () => state.submitting,
      })
    )!;
    const confirm = vi.spyOn(ElMessageBox, "confirm").mockRejectedValue("cancel");
    state.visible = true;
    expect(await canClose()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    state.form.name = "新值";
    expect(await canClose()).toBe(false);
    expect(state.form.name).toBe("新值");
    confirm.mockResolvedValue("confirm" as MessageBoxData);
    expect(await canClose()).toBe(true);
    state.submitting = true;
    expect(await canClose()).toBe(false);
    expect(confirm).toHaveBeenCalledTimes(2);
    scope.stop();
    confirm.mockRestore();
  });

  it("takes a fresh snapshot on reopen and ignores forms without editable data", async () => {
    const state = reactive({ visible: true, form: { name: "原值" } as object | undefined });
    const scope = effectScope();
    const canClose = scope.run(() =>
      useFormCloseGuard({
        visible: () => state.visible,
        formData: () => state.form,
        submitting: () => false,
      })
    )!;
    state.visible = false;
    state.form = { name: "另一条数据" };
    state.visible = true;
    expect(await canClose()).toBe(true);
    state.form = undefined;
    expect(await canClose()).toBe(true);
    scope.stop();
  });

  it.each(["before", "after"])(
    "snapshots data populated %s visibility in the opening tick",
    async (timing) => {
      const state = reactive({ visible: false, form: { name: "" } });
      const scope = effectScope();
      const canClose = scope.run(() =>
        useFormCloseGuard({
          visible: () => state.visible,
          formData: () => state.form,
          submitting: () => false,
        })
      )!;
      const confirm = vi.spyOn(ElMessageBox, "confirm").mockRejectedValue("cancel");
      if (timing === "before") state.form = { name: "详情数据" };
      state.visible = true;
      if (timing === "after") state.form = { name: "详情数据" };
      expect(await canClose()).toBe(true);
      expect(confirm).not.toHaveBeenCalled();
      state.form.name = "用户修改";
      expect(await canClose()).toBe(false);
      scope.stop();
      confirm.mockRestore();
    }
  );

  it("deduplicates pending discard confirmations and rechecks submission state", async () => {
    const state = reactive({ submitting: false, form: { name: "原值" } });
    const scope = effectScope();
    const canClose = scope.run(() =>
      useFormCloseGuard({
        visible: () => true,
        formData: () => state.form,
        submitting: () => state.submitting,
      })
    )!;
    await nextTick();
    state.form.name = "新值";
    const pending = Promise.withResolvers<MessageBoxData>();
    const confirm = vi.spyOn(ElMessageBox, "confirm").mockReturnValue(pending.promise);
    const first = canClose();
    expect(await canClose()).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
    state.submitting = true;
    pending.resolve("confirm" as MessageBoxData);
    expect(await first).toBe(false);
    scope.stop();
    confirm.mockRestore();
  });
});

describe("useCrudForm submission", () => {
  function createForm(validate = vi.fn().mockResolvedValue(true)) {
    const formData = ref({ name: "编辑内容" });
    const dialogVisible = reactive({ visible: true, title: "新增", type: "create" as const });
    const createApi = vi.fn().mockResolvedValue(undefined);
    const onSubmitSuccess = vi.fn().mockResolvedValue(undefined);
    const form = useCrudForm({
      formData,
      initialFormData: { name: "" },
      dialogVisible,
      dataFormRef: ref({
        validate,
        resetFields: vi.fn(),
        clearValidate: vi.fn(),
      } as unknown as InstanceType<typeof FaForm>),
      formRenderKey: ref(0),
      createApi,
      onSubmitSuccess,
    });
    return { ...form, formData, dialogVisible, createApi, onSubmitSuccess, validate };
  }

  it("locks before validation, blocks closing, and releases after invalid validation", async () => {
    const pending = Promise.withResolvers<boolean>();
    const form = createForm(vi.fn().mockReturnValue(pending.promise));
    const submission = form.handleSubmit();
    await form.handleSubmit();
    await form.handleCloseDialog();
    expect(form.submitLoading.value).toBe(true);
    expect(form.validate).toHaveBeenCalledOnce();
    expect(form.dialogVisible.visible).toBe(true);
    pending.resolve(false);
    await submission;
    expect(form.submitLoading.value).toBe(false);
    expect(form.createApi).not.toHaveBeenCalled();
  });

  it("retains input on save failure and resets only after a successful retry", async () => {
    const form = createForm();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    form.createApi.mockRejectedValueOnce(new Error("保存失败"));
    await form.handleSubmit();
    expect(form.formData.value.name).toBe("编辑内容");
    expect(form.dialogVisible.visible).toBe(true);
    expect(form.submitLoading.value).toBe(false);
    form.onSubmitSuccess.mockImplementation(async (submitted: { name: string }) => {
      expect(submitted.name).toBe("编辑内容");
    });
    await form.handleSubmit();
    expect(form.onSubmitSuccess).toHaveBeenCalledOnce();
    expect(form.formData.value.name).toBe("");
    expect(form.dialogVisible.visible).toBe(false);
    log.mockRestore();
  });
});
