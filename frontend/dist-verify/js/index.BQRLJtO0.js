import { A as e, aK as t, U as l, o as s } from "./element-plus.BPg5EhXK.js";
import { _ as r } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import {
  z as a,
  aw as o,
  ac as i,
  ae as n,
  a1 as u,
  ag as c,
  p as d,
  w as p,
  bt as m,
  aI as v,
  X as h,
  m as f,
  bu as x,
  F as g,
  ao as b,
  a2 as j,
  v as w,
  ax as y,
  bo as _,
  bw as k,
  al as C,
} from "./vue-vendor.Dwx3gfQr.js";
import { a6 as S, a3 as T, G as A, s as D, o as z } from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { _ as E } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
/* empty css                    */ import "./axios.Da-QW0H8.js";
import "./qs.USnEJzjK.js";
import "./side-channel.DybIsWO5.js";
import "./es-errors.DK26Ybqf.js";
import "./object-inspect.Ju1NJVd1.js";
import "./side-channel-list.BNQ44_ba.js";
import "./side-channel-map.ulHsYLML.js";
import "./get-intrinsic.BMeuD2ey.js";
import "./es-object-atoms.CyiuHMUS.js";
import "./math-intrinsics.BOBeVm3z.js";
import "./gopd.BudZp56J.js";
import "./es-define-property.F0aoeP8o.js";
import "./has-symbols.BcO-SUVM.js";
import "./get-proto.CBibeOPY.js";
import "./dunder-proto.CgDtQ3qe.js";
import "./call-bind-apply-helpers.ubnPuw6U.js";
import "./function-bind.DrnB-baK.js";
import "./hasown.BXcyoiLU.js";
import "./call-bound.Dizy2Qs1.js";
import "./side-channel-weakmap.CxmbhinV.js";
import "./mitt.BHPWSuhB.js";
import "./nprogress.E6tsCBSO.js";
import "./echarts.r3cQDZl7.js";
import "./highlight.Cxq3ZXHl.js";
import "./codemirror.CwY4WcCn.js";
import "./diff-match-patch.B0ZLOaK6.js";
import "./iconify-icons.PLu8Rxye.js";
import "./vue-web-terminal.B__atI2c.js";
const H = { class: "layout-search" },
  L = {
    class:
      "h-4.5 flex items-center justify-center rounded border border-g-300 dark:bg-g-200/50! bg-box! px-1.5 text-g-500",
  },
  I = { class: "result w-full" },
  K = ["onClick", "onMouseenter"],
  M = { class: "text-xs text-g-500" },
  V = { class: "mt-1.5 w-full" },
  U = ["onClick", "onMouseenter"],
  $ = ["onClick"],
  q = {
    class:
      "dialog-footer box-border flex items-center border-t border-(--default-border) pt-4.5 pb-1",
  },
  F = { class: "flex items-center justify-center" },
  G = { class: "mr-3.5 text-xs text-g-700" },
  R = { class: "flex items-center" },
  B = { class: "mr-3.5 text-xs text-g-700" },
  O = { class: "flex items-center" },
  X = { class: "mr-3.5 text-xs text-g-700" },
  J = E(
    a({
      name: "FaGlobalSearch",
      __name: "index",
      setup(a) {
        const E = S(),
          { menuList: J } = o(T()),
          N = C(!1),
          P = C(""),
          Q = C([]),
          { searchHistory: W } = o(E),
          Y = C(null),
          Z = C(0),
          ee = C(0),
          te = C(),
          le = C(!1);
        (i(() => {
          (A.on("openSearchDialog", xe), document.addEventListener("keydown", se));
        }),
          n(() => {
            (A.off("openSearchDialog", xe), document.removeEventListener("keydown", se));
          }));
        const se = (e) => {
            ((navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? e.metaKey : e.ctrlKey) &&
              "k" === e.key.toLowerCase() &&
              (e.preventDefault(), (N.value = !0), re()),
              N.value &&
                ("ArrowUp" === e.key
                  ? (e.preventDefault(), ie())
                  : "ArrowDown" === e.key
                    ? (e.preventDefault(), ne())
                    : "Enter" === e.key
                      ? (e.preventDefault(), de())
                      : "Escape" === e.key && (e.preventDefault(), (N.value = !1))));
          },
          re = () => {
            setTimeout(() => {
              Y.value?.focus();
            }, 100);
          },
          ae = (e) => {
            Q.value = e ? oe(J.value, e) : [];
          },
          oe = (e, t) => {
            const l = t.toLowerCase(),
              s = [],
              r = (e) => {
                if (e.meta?.isHide) return;
                const t = z(e.meta.title).toLowerCase();
                e.children && e.children.length > 0
                  ? e.children.forEach(r)
                  : t.includes(l) &&
                    ((e.path && e.path.trim()) || e.meta.link || e.meta.isIframe) &&
                    s.push({ ...e, children: void 0 });
              };
            return (e.forEach(r), s);
          },
          ie = () => {
            ((le.value = !0),
              P.value
                ? ((Z.value = (Z.value - 1 + Q.value.length) % Q.value.length), ue())
                : ((ee.value = (ee.value - 1 + W.value.length) % W.value.length), ce()),
              setTimeout(() => {
                le.value = !1;
              }, 100));
          },
          ne = () => {
            ((le.value = !0),
              P.value
                ? ((Z.value = (Z.value + 1) % Q.value.length), ue())
                : ((ee.value = (ee.value + 1) % W.value.length), ce()),
              setTimeout(() => {
                le.value = !1;
              }, 100));
          },
          ue = () => {
            u(() => {
              if (!te.value || !Q.value.length) return;
              const e = te.value.wrapRef;
              if (!e) return;
              const t = e.querySelectorAll(".result .box");
              if (!t[Z.value]) return;
              const l = t[Z.value],
                s = l.offsetHeight,
                r = e.scrollTop,
                a = e.clientHeight,
                o = l.offsetTop,
                i = o + s;
              o < r ? te.value.setScrollTop(o) : i > r + a && te.value.setScrollTop(i - a);
            });
          },
          ce = () => {
            u(() => {
              if (!te.value || !W.value.length) return;
              const e = te.value.wrapRef;
              if (!e) return;
              const t = e.querySelectorAll(".history-result .box");
              if (!t[ee.value]) return;
              const l = t[ee.value],
                s = l.offsetHeight,
                r = e.scrollTop,
                a = e.clientHeight,
                o = l.offsetTop,
                i = o + s;
              o < r ? te.value.setScrollTop(o) : i > r + a && te.value.setScrollTop(i - a);
            });
          },
          de = () => {
            if (P.value && Q.value.length) {
              const e = Q.value[Z.value];
              e && ve(e);
            } else if (!P.value && W.value.length) {
              const e = W.value[ee.value];
              e && ve(e);
            }
          },
          pe = (e) => Z.value === e,
          me = () => {
            Z.value = 0;
          },
          ve = (e) => {
            ((N.value = !1), fe(e), D(e), (P.value = ""), (Q.value = []));
          },
          he = () => {
            Array.isArray(W.value) && E.setSearchHistory(W.value);
          },
          fe = (e) => {
            const t = e.path || String(e.meta.link || ""),
              l = W.value.findIndex((e) => (e.path || String(e.meta.link || "")) === t);
            -1 !== l ? W.value.splice(l, 1) : W.value.length >= 10 && W.value.pop();
            const s = { ...e };
            (delete s.children, delete s.meta.authList, W.value.unshift(s), he());
          },
          xe = () => {
            ((N.value = !0), re());
          },
          ge = () => {
            ((P.value = ""), (Q.value = []), (Z.value = 0), (ee.value = 0));
          };
        return (a, o) => {
          const i = r,
            n = e,
            u = l,
            C = s;
          return (
            c(),
            d("div", H, [
              p(
                C,
                {
                  modelValue: v(N),
                  "onUpdate:modelValue": o[1] || (o[1] = (e) => (h(N) ? (N.value = e) : null)),
                  width: "600",
                  "show-close": !1,
                  "lock-scroll": !1,
                  "modal-class": "search-modal",
                  onClose: ge,
                },
                {
                  footer: m(() => [
                    f("div", q, [
                      f("div", F, [
                        p(i, {
                          icon: "fluent:arrow-enter-left-20-filled",
                          class:
                            "mr-2 box-border h-5 w-5.5 rounded border border-g-400 px-1 text-g-500 shadow-[0_2px_0_var(--default-border-dashed)]",
                        }),
                        f("span", G, y(a.$t("search.selectKeydown")), 1),
                      ]),
                      f("div", R, [
                        p(i, {
                          icon: "ri:arrow-up-wide-fill",
                          class:
                            "mr-2 box-border h-5 w-5.5 rounded border border-g-400 px-1 text-g-500 shadow-[0_2px_0_var(--default-border-dashed)]",
                        }),
                        p(i, {
                          icon: "ri:arrow-down-wide-fill",
                          class:
                            "mr-2 box-border h-5 w-5.5 rounded border border-g-400 px-1 text-g-500 shadow-[0_2px_0_var(--default-border-dashed)]",
                        }),
                        f("span", B, y(a.$t("search.switchKeydown")), 1),
                      ]),
                      f("div", O, [
                        o[2] ||
                          (o[2] = f(
                            "i",
                            {
                              class:
                                "mr-2 box-border h-5 rounded border border-g-400 px-1 text-g-500 shadow-[0_2px_0_var(--default-border-dashed)] w-8! flex items-center justify-center",
                            },
                            [f("p", { class: "text-[10px] font-medium" }, "ESC")],
                            -1
                          )),
                        f("span", X, y(a.$t("search.exitKeydown")), 1),
                      ]),
                    ]),
                  ]),
                  default: m(() => [
                    p(
                      n,
                      {
                        modelValue: v(P),
                        "onUpdate:modelValue":
                          o[0] || (o[0] = (e) => (h(P) ? (P.value = e) : null)),
                        modelModifiers: { trim: !0 },
                        placeholder: a.$t("search.placeholder"),
                        onInput: ae,
                        onBlur: me,
                        ref_key: "searchInput",
                        ref: Y,
                        "prefix-icon": v(t),
                        class: "h-12",
                      },
                      {
                        suffix: m(() => [
                          f("div", L, [p(i, { icon: "fluent:arrow-enter-left-20-filled" })]),
                        ]),
                        _: 1,
                      },
                      8,
                      ["modelValue", "placeholder", "prefix-icon"]
                    ),
                    p(
                      u,
                      {
                        class: "mt-5",
                        "max-height": "370px",
                        ref_key: "searchResultScrollbar",
                        ref: te,
                        always: "",
                      },
                      {
                        default: m(() => [
                          x(
                            f(
                              "div",
                              I,
                              [
                                (c(!0),
                                d(
                                  g,
                                  null,
                                  b(
                                    v(Q),
                                    (e, t) => (
                                      c(),
                                      d(
                                        "div",
                                        {
                                          class: "box mt-0! cursor-pointer text-base leading-none",
                                          key: t,
                                        },
                                        [
                                          f(
                                            "div",
                                            {
                                              class: j([
                                                "mt-2 h-12 flex items-center justify-between rounded-custom-sm bg-g-200/80 px-4 text-sm text-g-700",
                                                pe(t) ? "highlighted bg-theme/70! text-white!" : "",
                                              ]),
                                              onClick: (t) => ve(e),
                                              onMouseenter: (e) =>
                                                ((e) => {
                                                  !le.value && P.value && (Z.value = e);
                                                })(t),
                                            },
                                            [
                                              w(y(v(z)(e.meta.title)) + " ", 1),
                                              x(
                                                p(
                                                  i,
                                                  { icon: "fluent:arrow-enter-left-20-filled" },
                                                  null,
                                                  512
                                                ),
                                                [[_, pe(t)]]
                                              ),
                                            ],
                                            42,
                                            K
                                          ),
                                        ]
                                      )
                                    )
                                  ),
                                  128
                                )),
                              ],
                              512
                            ),
                            [[_, v(Q).length]]
                          ),
                          x(
                            f(
                              "div",
                              null,
                              [
                                f("p", M, y(a.$t("search.historyTitle")), 1),
                                f("div", V, [
                                  (c(!0),
                                  d(
                                    g,
                                    null,
                                    b(
                                      v(W),
                                      (e, t) => (
                                        c(),
                                        d(
                                          "div",
                                          {
                                            class: j([
                                              "box mt-2 h-12 cursor-pointer flex items-center justify-between rounded-custom-sm bg-g-200/80 px-4 text-sm text-g-800",
                                              v(ee) === t
                                                ? "highlighted bg-theme/70! text-white! [&_.selected-icon]:text-white!"
                                                : "",
                                            ]),
                                            key: t,
                                            onClick: (t) => ve(e),
                                            onMouseenter: (e) =>
                                              ((e) => {
                                                le.value || P.value || (ee.value = e);
                                              })(t),
                                          },
                                          [
                                            w(y(v(z)(e.meta.title)) + " ", 1),
                                            f(
                                              "div",
                                              {
                                                class:
                                                  "size-5 selected-icon select-none rounded-full text-g-500 flex items-center justify-center cursor-pointer",
                                                onClick: k(
                                                  (e) =>
                                                    ((e) => {
                                                      (W.value.splice(e, 1), he());
                                                    })(t),
                                                  ["stop"]
                                                ),
                                              },
                                              [
                                                p(i, {
                                                  icon: "ri:close-large-fill",
                                                  class: "text-xs",
                                                }),
                                              ],
                                              8,
                                              $
                                            ),
                                          ],
                                          42,
                                          U
                                        )
                                      )
                                    ),
                                    128
                                  )),
                                ]),
                              ],
                              512
                            ),
                            [[_, !v(P) && 0 === v(Q).length && v(W).length > 0]]
                          ),
                        ]),
                        _: 1,
                      },
                      512
                    ),
                  ]),
                  _: 1,
                },
                8,
                ["modelValue"]
              ),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-4271ac8d"]]
  );
export { J as default };
