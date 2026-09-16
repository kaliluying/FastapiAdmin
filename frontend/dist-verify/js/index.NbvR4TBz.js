import { W as a } from "./element-plus.BPg5EhXK.js";
import {
  z as t,
  ag as s,
  p as e,
  a2 as r,
  n as o,
  u as i,
  m as d,
  ax as c,
  o as l,
  ap as n,
  F as p,
  j as v,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as f } from "./_plugin-vue_export-helper.BCo6x5W8.js";
const y = ["role"],
  _ = { key: 1, class: "fa-empty" },
  h = { class: "fa-empty__title" },
  k = { key: 0, class: "fa-empty__desc" },
  m = { key: 1, class: "fa-async-state__action" },
  u = { class: "fa-async-state__alert-body" },
  g = { class: "fa-async-state__alert-title" },
  w = { key: 0, class: "fa-async-state__alert-desc" },
  x = { key: 0, class: "fa-async-state__action" },
  $ = f(
    t({
      name: "FaAsyncState",
      __name: "index",
      props: { state: {}, title: {}, description: {} },
      setup(t) {
        const f = t,
          $ = v(() => "error" === f.state || "forbidden" === f.state || "partial" === f.state),
          j = v(() => {
            const a = [`fa-async-state--${f.state}`];
            return ($.value && a.push("fa-async-state--alert"), a);
          }),
          b = { error: "加载失败", forbidden: "无权限访问", partial: "部分数据加载失败" };
        return (v, f) => {
          const F = a;
          return (
            s(),
            e(
              "div",
              { class: r(["fa-async-state", j.value]), role: $.value ? "alert" : void 0 },
              [
                "loading" === t.state
                  ? (s(), o(F, { key: 0, rows: 3, animated: "" }))
                  : "empty" === t.state
                    ? (s(),
                      e("div", _, [
                        f[0] ||
                          (f[0] = i(
                            '<svg class="fa-empty__art" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-v-73df8002><rect x="18" y="30" width="84" height="54" rx="8" stroke="var(--fa-gray-400)" stroke-width="2" data-v-73df8002></rect><path d="M18 44h84" stroke="var(--fa-gray-400)" stroke-width="2" data-v-73df8002></path><circle cx="60" cy="62" r="10" stroke="var(--fa-gray-400)" stroke-width="2" data-v-73df8002></circle><path d="M60 57v10M55 62h10" stroke="var(--fa-gray-400)" stroke-width="2" stroke-linecap="round" data-v-73df8002></path></svg>',
                            1
                          )),
                        d("div", h, c(t.title || "暂无数据"), 1),
                        t.description ? (s(), e("p", k, c(t.description), 1)) : l("", !0),
                        v.$slots.action
                          ? (s(), e("div", m, [n(v.$slots, "action", {}, void 0, !0)]))
                          : l("", !0),
                      ]))
                    : $.value
                      ? (s(),
                        e(
                          p,
                          { key: 2 },
                          [
                            d("div", u, [
                              d("span", g, c(t.title || b[t.state]), 1),
                              t.description ? (s(), e("p", w, c(t.description), 1)) : l("", !0),
                            ]),
                            v.$slots.action
                              ? (s(), e("div", x, [n(v.$slots, "action", {}, void 0, !0)]))
                              : l("", !0),
                          ],
                          64
                        ))
                      : n(v.$slots, "default", { key: 3 }, void 0, !0),
              ],
              10,
              y
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-73df8002"]]
  );
export { $ as F };
