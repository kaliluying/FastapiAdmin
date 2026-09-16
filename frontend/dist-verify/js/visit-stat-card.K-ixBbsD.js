import { e } from "./element-plus.BPg5EhXK.js";
import { _ as a } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import {
  z as t,
  au as s,
  bd as l,
  br as r,
  ae as u,
  ag as i,
  p as n,
  a2 as o,
  ax as d,
  j as c,
  a1 as v,
  d as p,
  n as m,
  bt as f,
  m as g,
  a4 as x,
  w as b,
  v as h,
  F as j,
  ao as _,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as y } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
const w = "easeOutExpo",
  F = t({
    name: "FaCountTo",
    __name: "index",
    props: {
      target: { default: 0 },
      duration: { default: 2e3 },
      autoStart: { type: Boolean, default: !0 },
      decimals: { default: 0 },
      decimal: { default: "." },
      separator: { default: "" },
      prefix: { default: "" },
      suffix: { default: "" },
      easing: { default: w },
      disabled: { type: Boolean, default: !1 },
    },
    emits: ["started", "finished", "paused", "reset"],
    setup(e, { expose: a, emit: t }) {
      const m = Number.EPSILON,
        f = e,
        g = t,
        x = (e, a, t) => (Number.isFinite(e) ? e : t),
        b = (e, a, t) => Math.max(a, Math.min(e, t)),
        h = c(() => x(f.target, 0, 0)),
        j = c(() => b(x(f.duration, 0, 2e3), 100, 6e4)),
        _ = c(() => b(x(f.decimals, 0, 0), 0, 10)),
        y = c(() => {
          const e = f.easing;
          return e in p ? e : w;
        }),
        F = s(0),
        M = s(h.value),
        S = s(!1),
        $ = s(!1),
        z = s(0),
        N = l(F, {
          duration: j,
          transition: c(() => p[y.value]),
          onStarted: () => {
            ((S.value = !0), ($.value = !1), g("started", M.value));
          },
          onFinished: () => {
            ((S.value = !1), ($.value = !1), g("finished", M.value));
          },
        }),
        C = c(() => {
          const e = $.value ? z.value : N.value;
          if (!Number.isFinite(e)) return `${f.prefix}0${f.suffix}`;
          const a = ((e, a, t, s) => {
            let l = a > 0 ? e.toFixed(a) : Math.floor(e).toString();
            if (("." !== t && l.includes(".") && (l = l.replace(".", t)), s)) {
              const e = l.split(t);
              ((e[0] = e[0].replace(/\B(?=(\d{3})+(?!\d))/g, s)), (l = e.join(t)));
            }
            return l;
          })(e, _.value, f.decimal, f.separator);
          return `${f.prefix}${a}${f.suffix}`;
        }),
        k = () => {
          (($.value = !1), (z.value = 0));
        },
        B = (e) => {
          if (f.disabled) return;
          const a = void 0 !== e ? e : M.value;
          Number.isFinite(a) &&
            ((M.value = a),
            ((e) => {
              const a = $.value ? z.value : N.value;
              return Math.abs(a - e) < m;
            })(a) ||
              ($.value && ((F.value = z.value), k()),
              v(() => {
                F.value = a;
              })));
        },
        D = () => {
          (S.value || $.value) && ((F.value = 0), k(), g("paused", 0));
        };
      return (
        r(
          h,
          (e) => {
            f.autoStart && !f.disabled ? B(e) : (M.value = e);
          },
          { immediate: f.autoStart && !f.disabled }
        ),
        r(
          () => f.disabled,
          (e) => {
            e && S.value && D();
          }
        ),
        u(() => {
          S.value && D();
        }),
        a({
          start: B,
          pause: () => {
            S.value &&
              !$.value &&
              (($.value = !0), (z.value = N.value), (F.value = z.value), g("paused", z.value));
          },
          reset: (e = 0) => {
            const a = x(e, 0, 0);
            ((F.value = a), (M.value = a), k(), g("reset"));
          },
          stop: D,
          setTarget: (e) => {
            Number.isFinite(e) && ((M.value = e), (!S.value && !f.autoStart) || f.disabled || B(e));
          },
          get isRunning() {
            return S.value;
          },
          get isPaused() {
            return $.value;
          },
          get currentValue() {
            return $.value ? z.value : N.value;
          },
          get targetValue() {
            return M.value;
          },
          get progress() {
            const e = $.value ? z.value : N.value,
              a = M.value;
            return 0 === a ? (0 === e ? 1 : 0) : Math.abs(e / a);
          },
        }),
        (e, a) => (
          i(),
          n(
            "span",
            {
              class: o([
                "text-g-900 tabular-nums",
                S.value ? "transition-opacity duration-300 ease-in-out" : "",
              ]),
            },
            d(C.value),
            3
          )
        )
      );
    },
  }),
  M = { class: "flex items-start justify-between gap-4" },
  S = { class: "min-w-0" },
  $ = { class: "metric-label" },
  z = { class: "mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1" },
  N = { class: "text-sm text-g-500" },
  C = { class: "mt-5 flex items-center justify-between gap-3" },
  k = { class: "text-sm text-g-500" },
  B = { class: "mt-4 flex h-10 items-end gap-1" },
  D = y(
    t({
      name: "VisitStatCard",
      __name: "visit-stat-card",
      props: {
        title: {},
        value: {},
        unit: {},
        trend: {},
        icon: {},
        color: {},
        description: {},
        chartData: {},
      },
      setup(t) {
        const s = t,
          l = c(() => {
            const e = Math.max(...s.chartData, 1);
            return s.chartData.map((a) => Math.max(18, Math.round((a / e) * 100)));
          });
        return (s, r) => {
          const u = F,
            c = a,
            v = e;
          return (
            i(),
            m(
              v,
              { shadow: "never", class: "home-card metric-card h-full" },
              {
                default: f(() => [
                  g(
                    "div",
                    { class: "metric-accent", style: x({ backgroundColor: t.color }) },
                    null,
                    4
                  ),
                  g("div", M, [
                    g("div", S, [
                      g("p", $, d(t.title), 1),
                      g("div", z, [
                        b(
                          u,
                          {
                            class: "metric-value",
                            target: t.value,
                            duration: 1600,
                            separator: ",",
                          },
                          null,
                          8,
                          ["target"]
                        ),
                        g("span", N, d(t.unit), 1),
                      ]),
                    ]),
                    g(
                      "div",
                      {
                        class: "icon-box",
                        style: x({ color: t.color, backgroundColor: `${t.color}1a` }),
                      },
                      [b(c, { icon: t.icon }, null, 8, ["icon"])],
                      4
                    ),
                  ]),
                  g("div", C, [
                    g("span", k, d(t.description), 1),
                    g(
                      "span",
                      { class: o(["trend", t.trend >= 0 ? "trend--up" : "trend--down"]) },
                      [
                        b(
                          c,
                          { icon: t.trend >= 0 ? "ri:arrow-up-line" : "ri:arrow-down-line" },
                          null,
                          8,
                          ["icon"]
                        ),
                        h(" " + d(Math.abs(t.trend).toFixed(1)) + "% ", 1),
                      ],
                      2
                    ),
                  ]),
                  g("div", B, [
                    (i(!0),
                    n(
                      j,
                      null,
                      _(
                        l.value,
                        (e, a) => (
                          i(),
                          n(
                            "span",
                            {
                              key: a,
                              class: "bar",
                              style: x({ height: `${e}%`, backgroundColor: t.color }),
                            },
                            null,
                            4
                          )
                        )
                      ),
                      128
                    )),
                  ]),
                ]),
                _: 1,
              }
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-c9cdc700"]]
  );
export { D as default };
