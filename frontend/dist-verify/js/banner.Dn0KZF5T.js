import { _ as s } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import { b as a, z as e, aR as t } from "./element-plus.BPg5EhXK.js";
import { a6 as o, r } from "./index.CJ_YH8gZ.js";
import "./file-saver.CjVB4eGa.js";
import {
  z as i,
  ag as l,
  p as n,
  m as p,
  v as m,
  ax as c,
  n as u,
  w as d,
  bt as j,
  aI as v,
  F as h,
  ao as b,
  j as g,
  a2 as _,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as f } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
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
import "./@intlify.CbtlSmdZ.js";
const y = { class: "home-command-hero" },
  z = { class: "hero-copy" },
  k = { class: "operator-card" },
  x = { key: 1, class: "operator-avatar operator-avatar--fallback" },
  w = { class: "operator-meta" },
  I = { class: "operator-login" },
  $ = { class: "hero-status-panel", "aria-label": "系统运行状态" },
  A = { class: "hero-status-grid" },
  q = f(
    i({
      name: "HomeBanner",
      __name: "banner",
      setup(i) {
        const f = "",
          q = "超级管理员",
          C = "super",
          F = "集团总公司",
          H = "系统超级管理员",
          B = "-",
          D = o(),
          E = r(),
          G = g(() => {
            const s = D.basicInfo;
            return {
              avatar: s.avatar || f,
              name: s.name || q,
              username: s.username || C,
              dept_name: s.dept_name || F,
              description: s.description || H,
              last_login: s.last_login || B,
            };
          }),
          K = g(() => `${G.value.name}（${G.value.username}）${E}`),
          O = [
            { label: "知识库连接", value: "正常", icon: "ri:database-2-line", tone: "cyan" },
            { label: "检索服务", value: "在线", icon: "ri:radar-line", tone: "blue" },
            { label: "待处理动态", value: "4 条", icon: "ri:flashlight-line", tone: "amber" },
          ];
        return (o, r) => {
          const i = a,
            g = e,
            f = s;
          return (
            l(),
            n("section", y, [
              p("div", z, [
                r[0] ||
                  (r[0] = p(
                    "div",
                    { class: "hero-kicker" },
                    [p("span", { class: "signal-dot" }), m(" Knowledge Ops Console ")],
                    -1
                  )),
                p("h1", null, c(K.value), 1),
                p(
                  "p",
                  null,
                  c("单组织后台已接入 AI 对话、知识库检索与系统管理，先看状态，再处理任务。")
                ),
                p("div", k, [
                  G.value.avatar
                    ? (l(),
                      u(
                        i,
                        { key: 0, size: 54, src: G.value.avatar, class: "operator-avatar" },
                        null,
                        8,
                        ["src"]
                      ))
                    : (l(),
                      n("div", x, [d(g, { size: 28 }, { default: j(() => [d(v(t))]), _: 1 })])),
                  p("div", w, [
                    p("strong", null, c(G.value.name), 1),
                    p("span", null, c(G.value.dept_name) + " / " + c(G.value.description), 1),
                  ]),
                  p("div", I, "上次登录：" + c(G.value.last_login), 1),
                ]),
              ]),
              p("div", $, [
                r[1] ||
                  (r[1] = p(
                    "div",
                    { class: "status-panel-head" },
                    [p("span", { class: "panel-dot" }), m(" 运行状态 ")],
                    -1
                  )),
                p("div", A, [
                  (l(),
                  n(
                    h,
                    null,
                    b(O, (s) =>
                      p("article", { key: s.label, class: "status-chip" }, [
                        p(
                          "span",
                          { class: _(["status-icon", `status-icon--${s.tone}`]) },
                          [d(f, { icon: s.icon }, null, 8, ["icon"])],
                          2
                        ),
                        p("div", null, [
                          p("strong", null, c(s.value), 1),
                          p("span", null, c(s.label), 1),
                        ]),
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
    [["__scopeId", "data-v-79a52f1d"]]
  );
export { q as default };
