import { d as e, a9 as a, o as l } from "./element-plus.BPg5EhXK.js";
import { _ as o } from "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import {
  z as s,
  aL as t,
  br as n,
  ag as r,
  n as i,
  t as d,
  bt as c,
  ap as u,
  m,
  v as f,
  ax as p,
  o as g,
  w as v,
  a2 as _,
  a0 as y,
  al as h,
  j as C,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as x } from "./_plugin-vue_export-helper.BCo6x5W8.js";
const b = { class: "core-overlay-dialog__header" },
  k = ["id"],
  V = { class: "core-overlay-dialog__actions" },
  w = { class: "fa-dialog-footer", style: "padding-right: var(--el-dialog-padding-primary)" },
  j = x(
    s({
      name: "FaDialog",
      inheritAttrs: !1,
      __name: "index",
      props: {
        modelValue: { type: Boolean },
        title: {},
        width: {},
        draggable: { type: Boolean, default: !0 },
        dialogClass: {},
        modalClass: {},
        formMode: {},
        confirmLoading: { type: Boolean },
        confirmText: { default: "确定" },
        cancelText: { default: "取消" },
      },
      emits: ["update:modelValue", "close", "opened", "fullscreen-change", "cancel", "confirm"],
      setup(s, { emit: x }) {
        const j = s,
          B = x,
          T = t(),
          L = h(!1);
        n(L, (e) => {
          B("fullscreen-change", e);
        });
        const M = C(() => {
            const e = T.class;
            return [j.dialogClass, e].filter(Boolean);
          }),
          $ = C({ get: () => j.modelValue, set: (e) => B("update:modelValue", e) }),
          z = C(() => {
            const e = { ...T };
            return (delete e.class, e);
          });
        return (t, n) => {
          const h = a,
            C = e,
            x = l;
          return (
            r(),
            i(
              x,
              y(
                {
                  modelValue: $.value,
                  "onUpdate:modelValue": n[3] || (n[3] = (e) => ($.value = e)),
                  width: s.width,
                  draggable: s.draggable,
                  fullscreen: L.value,
                  "show-close": !1,
                  class: M.value,
                  "modal-class": s.modalClass,
                  "align-center": "",
                  "destroy-on-close": "",
                },
                z.value,
                {
                  onClose: n[4] || (n[4] = (e) => B("close")),
                  onOpened: n[5] || (n[5] = (e) => B("opened")),
                }
              ),
              d(
                {
                  header: c(({ titleId: e, titleClass: a, close: l }) => [
                    m("div", b, [
                      m("span", { id: e, class: _(a) }, p(s.title), 11, k),
                      m("div", V, [
                        v(
                          h,
                          { content: L.value ? "还原" : "全屏", placement: "top" },
                          {
                            default: c(() => [
                              v(
                                o,
                                {
                                  class: "core-overlay-icon-btn",
                                  icon: L.value ? "ri:fullscreen-exit-line" : "ri:fullscreen-fill",
                                  onClick: n[0] || (n[0] = (e) => (L.value = !L.value)),
                                },
                                null,
                                8,
                                ["icon"]
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["content"]
                        ),
                        v(
                          h,
                          { content: "关闭", placement: "top" },
                          {
                            default: c(() => [
                              v(
                                o,
                                {
                                  class: "core-overlay-icon-btn",
                                  icon: "ri:close-line",
                                  onClick: l,
                                },
                                null,
                                8,
                                ["onClick"]
                              ),
                            ]),
                            _: 2,
                          },
                          1024
                        ),
                      ]),
                    ]),
                  ]),
                  default: c(() => [u(t.$slots, "default", {}, void 0, !0)]),
                  _: 2,
                },
                [
                  t.$slots.footer
                    ? {
                        name: "footer",
                        fn: c(() => [u(t.$slots, "footer", {}, void 0, !0)]),
                        key: "0",
                      }
                    : s.formMode
                      ? {
                          name: "footer",
                          fn: c(() => [
                            m("div", w, [
                              "detail" !== s.formMode
                                ? (r(),
                                  i(
                                    C,
                                    {
                                      key: 0,
                                      type: "primary",
                                      plain: "",
                                      onClick: n[1] || (n[1] = (e) => B("cancel")),
                                    },
                                    { default: c(() => [f(p(s.cancelText), 1)]), _: 1 }
                                  ))
                                : g("", !0),
                              v(
                                C,
                                {
                                  type: "primary",
                                  loading: s.confirmLoading,
                                  onClick: n[2] || (n[2] = (e) => B("confirm")),
                                },
                                { default: c(() => [f(p(s.confirmText), 1)]), _: 1 },
                                8,
                                ["loading"]
                              ),
                            ]),
                          ]),
                          key: "1",
                        }
                      : void 0,
                ]
              ),
              1040,
              ["modelValue", "width", "draggable", "fullscreen", "class", "modal-class"]
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-4f70a71b"]]
  );
export { j as _ };
