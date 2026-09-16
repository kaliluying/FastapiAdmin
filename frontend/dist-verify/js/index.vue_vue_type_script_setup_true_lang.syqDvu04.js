import { d as a } from "./element-plus.BPg5EhXK.js";
import { _ as e } from "./index.BFbuWJ1r.js";
import { a6 as s, a0 as t } from "./index.CJ_YH8gZ.js";
import {
  z as r,
  b5 as m,
  ar as n,
  ag as i,
  p as l,
  m as c,
  w as d,
  ax as o,
  bu as x,
  n as p,
  bt as u,
  v as f,
} from "./vue-vendor.Dwx3gfQr.js";
const g = {
    class: "page-content border-0! bg-transparent! min-h-screen flex items-center justify-center",
  },
  b = { class: "flex items-center justify-center max-md:block! max-md:text-center" },
  v = { class: "ml-15 w-75 max-md:mx-auto max-md:mt-10 max-md:w-full max-md:text-center" },
  j = { class: "text-xl leading-7 text-g-600 max-md:text-lg" },
  h = r({
    __name: "index",
    props: { data: {} },
    setup(r) {
      const h = m(),
        y = s(),
        { homePath: _ } = t(),
        w = () => {
          const a = _.value || "/";
          y.isLogin ? h.push(a) : h.push({ name: "Login", query: { redirect: a } });
        };
      return (s, t) => {
        const m = e,
          h = a,
          y = n("ripple");
        return (
          i(),
          l("div", g, [
            c("div", b, [
              d(m, { src: r.data.imgUrl, size: "100%", class: "w-100!" }, null, 8, ["src"]),
              c("div", v, [
                c("p", j, o(r.data.desc), 1),
                x(
                  (i(),
                  p(
                    h,
                    { type: "primary", size: "large", onClick: w, class: "mt-5" },
                    { default: u(() => [f(o(r.data.btnText), 1)]), _: 1 }
                  )),
                  [[y]]
                ),
              ]),
            ]),
          ])
        );
      };
    },
  });
export { h as _ };
