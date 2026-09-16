import { al as a } from "./vue-vendor.Dwx3gfQr.js";
function e(e) {
  const {
      formData: t,
      initialFormData: i,
      dialogVisible: l,
      dataFormRef: n,
      formRenderKey: s,
      detailApi: u,
      createApi: c,
      updateApi: o,
      titles: d,
      detailFormData: r,
      onCreateSuccess: v,
      onUpdateSuccess: f,
      onSubmitSuccess: b,
    } = e,
    m = a(!1);
  async function p() {
    (n.value?.resetFields(), n.value?.clearValidate(), Object.assign(t.value, i));
  }
  return {
    submitLoading: m,
    resetForm: p,
    handleCloseDialog: async function () {
      ((l.visible = !1), await p());
    },
    handleOpenDialog: async function (a, e, n) {
      l.type = a;
      const c = d ?? {},
        o = "新增",
        v = "修改",
        f = "详情";
      if (e && u) {
        const i = (await u(e)).data.data;
        "detail" === a
          ? ((l.title = c.detail ?? f), r && Object.assign(r.value, i ?? {}))
          : "update" === a && ((l.title = c.update ?? v), Object.assign(t.value, i));
      } else
        ((l.title = c.create ?? o),
          Object.assign(t.value, i),
          (t.value.id = void 0),
          n && Object.assign(t.value, n));
      ((s.value += 1), (l.visible = !0));
    },
    handleSubmit: async function () {
      const a = n.value;
      if (!a) return;
      if (!(await a.validate().catch(() => !1))) return;
      m.value = !0;
      const e = t.value.id;
      try {
        (e && o
          ? (await o(e, { id: e, ...t.value }), await f?.())
          : c && (await c(t.value), await v?.()),
          (l.visible = !1),
          await p(),
          await b?.(t.value));
      } catch (i) {
      } finally {
        m.value = !1;
      }
    },
  };
}
export { e as u };
