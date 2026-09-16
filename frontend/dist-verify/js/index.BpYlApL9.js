import { q as e, d as a, a9 as o } from "./element-plus.BPg5EhXK.js";
import { _ as s } from "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import {
  z as t,
  aL as l,
  ag as r,
  n,
  a0 as d,
  t as i,
  bt as c,
  ap as m,
  m as u,
  v as p,
  ax as f,
  o as _,
  w as v,
  j as y,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as g } from "./_plugin-vue_export-helper.BCo6x5W8.js";
const w = { class: "core-overlay-drawer__header" },
  x = { class: "core-overlay-drawer__title" },
  V = { class: "core-overlay-drawer__actions" },
  h = { class: "fa-drawer-footer", style: "padding-right: var(--el-drawer-padding-primary)" },
  k = g(
    t({
      name: "FaDrawer",
      inheritAttrs: !1,
      __name: "index",
      props: {
        modelValue: { type: Boolean },
        title: {},
        size: {},
        direction: { default: "rtl" },
        drawerClass: {},
        formMode: {},
        confirmLoading: { type: Boolean },
        confirmText: { default: "确定" },
        cancelText: { default: "取消" },
      },
      emits: ["update:modelValue", "close", "opened", "cancel", "confirm"],
      setup(t, { emit: g }) {
        const k = t,
          z = g,
          C = l(),
          j = y({ get: () => k.modelValue, set: (e) => z("update:modelValue", e) }),
          B = y(() => {
            const e = C.class;
            return [k.drawerClass, e].filter(Boolean);
          }),
          T = y(() => {
            const e = { ...C };
            return (delete e.class, e);
          });
        return (l, y) => {
          const g = o,
            k = a,
            C = e;
          return (
            r(),
            n(
              C,
              d(
                {
                  modelValue: j.value,
                  "onUpdate:modelValue": y[3] || (y[3] = (e) => (j.value = e)),
                  size: t.size,
                  direction: t.direction,
                  "show-close": !1,
                  class: B.value,
                  "destroy-on-close": "",
                },
                T.value,
                {
                  onClose: y[4] || (y[4] = (e) => z("close")),
                  onOpened: y[5] || (y[5] = (e) => z("opened")),
                }
              ),
              i(
                {
                  header: c(() => [
                    u("div", w, [
                      u("span", x, f(t.title), 1),
                      u("div", V, [
                        v(
                          g,
                          { content: "关闭", placement: "top" },
                          {
                            default: c(() => [
                              v(s, {
                                class: "core-overlay-icon-btn",
                                icon: "ri:close-line",
                                onClick: y[0] || (y[0] = (e) => (j.value = !1)),
                              }),
                            ]),
                            _: 1,
                          }
                        ),
                      ]),
                    ]),
                  ]),
                  default: c(() => [m(l.$slots, "default", {}, void 0, !0)]),
                  _: 2,
                },
                [
                  l.$slots.footer
                    ? {
                        name: "footer",
                        fn: c(() => [m(l.$slots, "footer", {}, void 0, !0)]),
                        key: "0",
                      }
                    : t.formMode
                      ? {
                          name: "footer",
                          fn: c(() => [
                            u("div", h, [
                              "detail" !== t.formMode
                                ? (r(),
                                  n(
                                    k,
                                    { key: 0, onClick: y[1] || (y[1] = (e) => z("cancel")) },
                                    { default: c(() => [p(f(t.cancelText), 1)]), _: 1 }
                                  ))
                                : _("", !0),
                              v(
                                k,
                                {
                                  type: "primary",
                                  loading: t.confirmLoading,
                                  onClick: y[2] || (y[2] = (e) => z("confirm")),
                                },
                                { default: c(() => [p(f(t.confirmText), 1)]), _: 1 },
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
              ["modelValue", "size", "direction", "class"]
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-4869158e"]]
  );
export { k as _ };
