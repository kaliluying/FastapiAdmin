import { a3 as e } from "./element-plus.BPg5EhXK.js";
import {
  z as t,
  ag as a,
  n as s,
  bt as o,
  v as f,
  ax as l,
  aI as r,
  G as n,
} from "./vue-vendor.Dwx3gfQr.js";
const u = t({
  name: "FaStatusTag",
  __name: "index",
  props: {
    label: { default: "" },
    type: { default: void 0 },
    size: { default: "default" },
    effect: { default: "light" },
    round: { type: Boolean, default: !1 },
    closable: { type: Boolean, default: !1 },
  },
  setup: (t) => (n, u) => (
    a(),
    s(
      r(e),
      { type: t.type, size: t.size, effect: t.effect, round: t.round, closable: t.closable },
      { default: o(() => [f(l(t.label), 1)]), _: 1 },
      8,
      ["type", "size", "effect", "round", "closable"]
    )
  ),
});
function p(e) {
  return () =>
    e().map((e) => {
      if (!e.status || e.formatter) return e;
      const t = e.status;
      return {
        ...e,
        formatter: (a) => {
          const s = e.prop ? a[e.prop] : a,
            o = "boolean" == typeof s ? String(s) : s,
            f = t[o] ?? { type: "info", text: "—" };
          return n(u, { type: f.type, label: f.text, size: f.size, effect: f.effect });
        },
        status: void 0,
      };
    });
}
export { u as _, p as r };
