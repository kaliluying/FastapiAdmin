import { af as t } from "./element-plus.BPg5EhXK.js";
import {
  z as e,
  aw as o,
  aI as s,
  ag as r,
  p as i,
  w as a,
  bt as n,
  m,
  a4 as p,
  o as l,
  j as f,
} from "./vue-vendor.Dwx3gfQr.js";
import { a as j, a5 as d, l as c, T as u, v as h } from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
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
const g = e({
  name: "FaWatermark",
  __name: "index",
  props: {
    content: { default: j.systemInfo.name },
    visible: { type: Boolean, default: !1 },
    fontSize: { default: 16 },
    fontColor: { default: void 0 },
    rotate: { default: -22 },
    gapX: { default: 100 },
    gapY: { default: 100 },
    offsetX: { default: 50 },
    offsetY: { default: 50 },
    zIndex: { default: 3100 },
  },
  setup(e) {
    const j = e,
      g = d(),
      { watermarkVisible: v, themeColor: y, theme: b } = o(g),
      z = f(() => {
        let t;
        if (j.fontColor) t = j.fontColor;
        else {
          const e = y.value || c.themeColor,
            o = b.value === u.DARK ? 0.22 : 0.16;
          try {
            t = h(e, o).rgba;
          } catch {
            t = h(c.themeColor, o).rgba;
          }
        }
        return { fontSize: j.fontSize, color: t };
      });
    return (o, f) => {
      const j = t;
      return s(v)
        ? (r(),
          i(
            "div",
            {
              key: 0,
              class: "fixed left-0 top-0 h-screen w-screen pointer-events-none",
              style: p({ zIndex: e.zIndex }),
            },
            [
              a(
                j,
                {
                  content: e.content,
                  font: z.value,
                  rotate: e.rotate,
                  gap: [e.gapX, e.gapY],
                  offset: [e.offsetX, e.offsetY],
                },
                {
                  default: n(() => [
                    ...(f[0] || (f[0] = [m("div", { style: "height: 100vh" }, null, -1)])),
                  ]),
                  _: 1,
                },
                8,
                ["content", "font", "rotate", "gap", "offset"]
              ),
            ],
            4
          ))
        : l("", !0);
    };
  },
});
export { g as default };
