import { i as s, T as i } from "./element-plus.BPg5EhXK.js";
import { F as t } from "./index.C8JPqYJk.js";
import e from "./banner.Dn0KZF5T.js";
import r from "./online-user-card.Zuvfxw2Q.js";
import a from "./recent-activity-card.BEZAD3Jm.js";
import l from "./visit-stat-card.K-ixBbsD.js";
import o from "./visit-trend-card.CA-oEcDi.js";
import {
  z as m,
  ag as n,
  p,
  w as c,
  m as d,
  F as j,
  ao as u,
  bt as g,
  a3 as v,
  E as f,
  ax as b,
  a2 as _,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as h } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./index.CJ_YH8gZ.js";
/* empty css                    */ import "./file-saver.CjVB4eGa.js";
import "./axios.Da-QW0H8.js";
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
import "./@intlify.CbtlSmdZ.js";
const x = { class: "home-workspace" },
  y = { class: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5" },
  w = { class: "demo-metric-value" },
  z = { class: "demo-metric-label" },
  k = { class: "pending-section mb-5" },
  A = { class: "pending-list" },
  D = { class: "pending-item__text" },
  E = h(
    m({
      name: "Home",
      inheritAttrs: !1,
      __name: "index",
      setup(m) {
        const h = [
            { label: "平均响应", value: "180ms" },
            { label: "今日活跃用户", value: "24" },
            { label: "系统可用率", value: "99.8%" },
            { label: "告警数量", value: "0" },
          ],
          E = [
            { id: 1, tag: "知识库", level: "info", title: "3 篇文档待完成 Embedding 写入" },
            { id: 2, tag: "系统", level: "warning", title: "1 项参数配置待确认" },
            { id: 3, tag: "用户", level: "info", title: "新增账号待分配角色" },
          ],
          F = {
            title: "知识库文档",
            value: 128,
            unit: "份",
            trend: 9.4,
            icon: "ri:file-text-line",
            color: "var(--el-color-primary)",
            description: "已纳入检索的内部资料",
            chartData: [42, 58, 66, 72, 86, 104, 128],
          },
          q = {
            title: "检索请求",
            value: 986,
            unit: "次",
            trend: 6.8,
            icon: "ri:search-eye-line",
            color: "var(--el-color-success)",
            description: "近 7 日知识检索调用",
            chartData: [88, 106, 124, 136, 148, 164, 182],
          };
        return (m, H) => {
          const I = s,
            C = i;
          return (
            n(),
            p("div", x, [
              c(t, {
                title: "运营总览",
                description: "单组织后台运营快览，含知识库、对话与系统状态。",
              }),
              c(e, { class: "mb-5" }),
              d("div", y, [
                (n(),
                p(
                  j,
                  null,
                  u(h, (s) =>
                    d("div", { key: s.label, class: "demo-metric-card" }, [
                      H[0] || (H[0] = d("span", { class: "demo-badge" }, "示例数据", -1)),
                      d("div", w, b(s.value), 1),
                      d("div", z, b(s.label), 1),
                    ])
                  ),
                  64
                )),
              ]),
              c(
                C,
                { gutter: 16 },
                {
                  default: g(() => [
                    c(
                      I,
                      { xs: 24, sm: 24, lg: 8, class: "mb-5" },
                      { default: g(() => [c(r)]), _: 1 }
                    ),
                    c(
                      I,
                      { xs: 24, sm: 12, lg: 8, class: "mb-5" },
                      { default: g(() => [c(l, v(f(F)), null, 16)]), _: 1 }
                    ),
                    c(
                      I,
                      { xs: 24, sm: 12, lg: 8, class: "mb-5" },
                      { default: g(() => [c(l, v(f(q)), null, 16)]), _: 1 }
                    ),
                  ]),
                  _: 1,
                }
              ),
              c(
                C,
                { gutter: 16 },
                {
                  default: g(() => [
                    c(I, { xs: 24, lg: 16, class: "mb-5" }, { default: g(() => [c(o)]), _: 1 }),
                    c(I, { xs: 24, lg: 8, class: "mb-5" }, { default: g(() => [c(a)]), _: 1 }),
                  ]),
                  _: 1,
                }
              ),
              d("div", k, [
                H[1] || (H[1] = d("div", { class: "pending-section__title" }, "待处理事项", -1)),
                d("ul", A, [
                  (n(),
                  p(
                    j,
                    null,
                    u(E, (s) =>
                      d("li", { key: s.id, class: "pending-item" }, [
                        d(
                          "span",
                          { class: _(["pending-item__tag", `pending-item__tag--${s.level}`]) },
                          b(s.tag),
                          3
                        ),
                        d("span", D, b(s.title), 1),
                      ])
                    ),
                    64
                  )),
                ]),
              ]),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-0b2379e5"]]
  );
export { E as default };
