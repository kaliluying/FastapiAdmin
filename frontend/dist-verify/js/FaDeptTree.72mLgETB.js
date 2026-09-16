import {
  A as e,
  a9 as t,
  z as s,
  aM as o,
  aK as a,
  ac as i,
  u as r,
} from "./element-plus.BPg5EhXK.js";
import {
  z as l,
  br as n,
  a6 as p,
  ag as d,
  p as m,
  m as c,
  w as u,
  X as j,
  aI as f,
  bt as h,
  bv as v,
  bw as b,
  al as y,
  ai as _,
  bf as g,
} from "./vue-vendor.Dwx3gfQr.js";
import { D as x } from "./dept.qQ6KULTg.js";
import { q as z } from "./index.CJ_YH8gZ.js";
import "./file-saver.CjVB4eGa.js";
import { _ as w } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
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
const k = { class: "dept-tree-root" },
  V = { class: "dept-tree-toolbar" },
  D = ["onKeydown"],
  N = w(
    l({
      __name: "FaDeptTree",
      props: { modelValue: { default: void 0 } },
      emits: ["node-click", "update:modelValue"],
      setup(l, { emit: w }) {
        const N = l,
          q = y([]),
          C = y(),
          E = y(),
          K = y(!0),
          A = w,
          F = g(N, "modelValue", A);
        function I() {
          const e = C.value;
          return e?.store?.root;
        }
        function T() {
          K.value
            ? (!(function () {
                const e = I();
                if (!e) return;
                const t = (e) => {
                  e.childNodes?.forEach((e) => {
                    (t(e), e.collapse());
                  });
                };
                t(e);
              })(),
              (K.value = !1))
            : (!(function () {
                const e = I();
                if (!e) return;
                const t = (e) => {
                  e.childNodes?.forEach((e) => {
                    e.childNodes?.length && (e.expand(), t(e));
                  });
                };
                t(e);
              })(),
              (K.value = !0));
        }
        n(E, (e) => {
          C.value?.filter(e);
        });
        const G = (e, t) => !e || t.label.includes(e);
        function H(e) {
          ((F.value = e.value), A("node-click"));
        }
        const M = _({ name: void 0, status: void 0, created_time: void 0 }),
          R = y(!0);
        return (
          p(async () => {
            R.value = !0;
            try {
              const e = await x.listDept(M);
              q.value = z(e.data.data);
            } finally {
              R.value = !1;
            }
          }),
          (l, n) => {
            const p = s,
              y = t,
              _ = e,
              g = r,
              x = i;
            return (
              d(),
              m("div", k, [
                c("div", V, [
                  u(
                    _,
                    {
                      modelValue: f(E),
                      "onUpdate:modelValue": n[0] || (n[0] = (e) => (j(E) ? (E.value = e) : null)),
                      class: "dept-tree-search",
                      placeholder: "部门名称",
                      size: "small",
                      clearable: "",
                    },
                    {
                      prefix: h(() => [
                        u(
                          p,
                          { class: "dept-tree-search__prefix-icon" },
                          { default: h(() => [u(f(a))]), _: 1 }
                        ),
                      ]),
                      suffix: h(() => [
                        u(
                          y,
                          { content: f(K) ? "收起全部" : "展开全部", placement: "top" },
                          {
                            default: h(() => [
                              c(
                                "span",
                                {
                                  class: "dept-tree-expand-trigger",
                                  role: "button",
                                  tabindex: "0",
                                  onClick: b(T, ["stop"]),
                                  onKeydown: v(b(T, ["prevent"]), ["enter"]),
                                },
                                [u(p, { size: 15 }, { default: h(() => [u(f(o))]), _: 1 })],
                                40,
                                D
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["content"]
                        ),
                      ]),
                      _: 1,
                    },
                    8,
                    ["modelValue"]
                  ),
                ]),
                u(
                  x,
                  {
                    ref_key: "deptTreeRef",
                    ref: C,
                    class: "dept-tree-body",
                    "node-key": "value",
                    data: f(q),
                    props: { children: "children", label: "label", disabled: "disabled" },
                    "expand-on-click-node": !1,
                    "filter-node-method": G,
                    "default-expand-all": "",
                    onNodeClick: H,
                  },
                  { empty: h(() => [u(g, { "image-size": 80, description: "暂无数据" })]), _: 1 },
                  8,
                  ["data"]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-4b648d88"]]
  );
export { N as default };
