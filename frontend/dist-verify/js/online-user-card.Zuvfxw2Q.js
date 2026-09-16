import { P as s, e } from "./element-plus.BPg5EhXK.js";
import { _ as a } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import {
  z as t,
  ag as l,
  n as i,
  bt as r,
  m as o,
  v as n,
  ax as m,
  w as p,
  p as c,
  F as d,
  ao as u,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as v } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
const x = { class: "flex items-start justify-between gap-4" },
  g = { class: "icon-box bg-primary/10 text-primary" },
  j = { class: "mt-4 grid grid-cols-3 gap-3 text-center" },
  _ = { class: "text-lg font-semibold text-g-900" },
  b = { class: "mt-1 text-xs text-g-500" },
  f = v(
    t({
      name: "OnlineUserCard",
      __name: "online-user-card",
      setup(t) {
        const v = [
          { label: "PC端", value: 13 },
          { label: "移动端", value: 4 },
          { label: "多端", value: 1 },
        ];
        return (t, f) => {
          const h = a,
            y = s,
            w = e;
          return (
            l(),
            i(
              w,
              { shadow: "never", class: "home-card online-card h-full" },
              {
                default: r(() => [
                  o("div", x, [
                    o("div", null, [
                      f[1] ||
                        (f[1] = o(
                          "p",
                          { class: "metric-label" },
                          [
                            n(" 在线用户 "),
                            o("span", { class: "online-signal" }, [o("i"), n("Live")]),
                          ],
                          -1
                        )),
                      o("div", { class: "mt-3 flex items-baseline gap-2" }, [
                        o("span", { class: "metric-value" }, m(18)),
                        f[0] || (f[0] = o("span", { class: "text-sm text-g-500" }, "人在线", -1)),
                      ]),
                    ]),
                    o("div", g, [p(h, { icon: "ri:user-shared-line" })]),
                  ]),
                  p(y, { class: "mt-5", percentage: 64, "show-text": !1, "stroke-width": 8 }),
                  o("div", j, [
                    (l(),
                    c(
                      d,
                      null,
                      u(v, (s) =>
                        o("div", { key: s.label, class: "stat-box" }, [
                          o("div", _, m(s.value), 1),
                          o("div", b, m(s.label), 1),
                        ])
                      ),
                      64
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
    [["__scopeId", "data-v-2adc79dc"]]
  );
export { f as default };
