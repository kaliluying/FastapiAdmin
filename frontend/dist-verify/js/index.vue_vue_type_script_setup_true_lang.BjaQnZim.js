import { _ as e } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import { z as s } from "./element-plus.BPg5EhXK.js";
import "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { r as l, i as a, e as o, b as t } from "./index.BRxvSTh5.js";
import {
  z as r,
  ag as u,
  p as c,
  F as n,
  n as i,
  bt as v,
  as as y,
  a4 as p,
  a2 as m,
  j,
} from "./vue-vendor.Dwx3gfQr.js";
const _ = r({
  name: "FaMenuRouteIcon",
  inheritAttrs: !1,
  __name: "index",
  props: {
    icon: {},
    color: {},
    class: { type: [String, Array, Object, null, Boolean] },
    style: {},
  },
  setup(r) {
    const _ = r,
      d = j(() => _.icon?.trim() ?? ""),
      f = j(() => l(d.value)),
      x = j(() => !!d.value && a(d.value) && !f.value),
      b = j(() => o(d.value)),
      k = j(() => t(d.value)),
      g = j(() => (!1 === _.class || null == _.class ? void 0 : _.class)),
      A = j(() => {
        const e = "object" == typeof _.style && null !== _.style ? { ..._.style } : {};
        return (_.color && (e.color = _.color), e);
      });
    return (l, a) => {
      const o = s,
        t = e;
      return d.value
        ? f.value
          ? (u(),
            i(
              o,
              { key: 1, class: m([g.value, "menu-route-icon"]), style: p(A.value) },
              { default: v(() => [(u(), i(y(f.value)))]), _: 1 },
              8,
              ["class", "style"]
            ))
          : x.value
            ? (u(),
              i(
                t,
                { key: 2, icon: b.value, color: r.color, class: m(g.value), style: p(A.value) },
                null,
                8,
                ["icon", "color", "class", "style"]
              ))
            : (u(),
              i(
                t,
                { key: 3, icon: k.value, color: r.color, class: m(g.value), style: p(A.value) },
                null,
                8,
                ["icon", "color", "class", "style"]
              ))
        : (u(), c(n, { key: 0 }, [], 64));
    };
  },
});
export { _ };
