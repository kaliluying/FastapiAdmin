import {
  z as s,
  aL as a,
  ag as n,
  n as o,
  a0 as e,
  aI as c,
  I as i,
  o as t,
  j as l,
} from "./vue-vendor.Dwx3gfQr.js";
const r = s({
  name: "FaSvgIcon",
  inheritAttrs: !1,
  __name: "index",
  props: { icon: { default: "" } },
  setup(s) {
    const r = a(),
      p = l(() => ({ class: r.class || "", style: r.style || "" }));
    return (a, l) =>
      s.icon
        ? (n(),
          o(c(i), e({ key: 0, icon: s.icon }, c(p), { class: "fa-svg-icon inline" }), null, 16, [
            "icon",
          ]))
        : t("", !0);
  },
});
export { r as _ };
