import { p as r } from "./dompurify.C2yrXNAa.js";
import {
  z as e,
  bs as a,
  ag as s,
  p as o,
  a4 as t,
  o as l,
  al as i,
  j as c,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as n } from "./_plugin-vue_export-helper.BCo6x5W8.js";
const p = ["innerHTML"],
  f = n(
    e({
      __name: "index",
      props: {
        size: { default: 500 },
        themeColor: { default: "var(--el-color-primary)" },
        src: {},
      },
      setup(e) {
        const n = e,
          f = i(""),
          u = c(() => {
            const r = "number" == typeof n.size ? `${n.size}px` : n.size;
            return { width: r, height: r };
          }),
          v = {
            "#C7DEFF": "var(--el-color-primary-light-6)",
            "#071F4D": "var(--el-color-primary-dark-2)",
            "#00E4E5": "var(--el-color-primary-light-1)",
            "#006EFF": "var(--el-color-primary)",
            "#fff": "var(--default-box-color)",
            "#ffffff": "var(--default-box-color)",
            "#DEEBFC": "var(--el-color-primary-light-7)",
          },
          m = async () => {
            if (n.src)
              try {
                const e = await fetch(n.src);
                if (!e.ok) throw new Error(`HTTP error! status: ${e.status}`);
                const a = await e.text();
                f.value = r.sanitize(
                  ((r) =>
                    Object.entries(v).reduce((r, [e, a]) => {
                      const s = new RegExp(`fill="${e}"`, "gi"),
                        o = new RegExp(`stroke="${e}"`, "gi");
                      return r.replace(s, `fill="${a}"`).replace(o, `stroke="${a}"`);
                    }, r))(a)
                );
              } catch (e) {
                f.value = "";
              }
            else f.value = "";
          };
        return (
          a(() => {
            m();
          }),
          (r, a) => (
            s(),
            o(
              "div",
              { class: "theme-svg", style: t(u.value) },
              [
                e.src
                  ? (s(),
                    o("div", { key: 0, class: "svg-container", innerHTML: f.value }, null, 8, p))
                  : l("", !0),
              ],
              4
            )
          )
        );
      },
    }),
    [["__scopeId", "data-v-d2a9229e"]]
  );
export { f as _ };
