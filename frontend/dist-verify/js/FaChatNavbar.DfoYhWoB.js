import {
  V as e,
  M as s,
  d as t,
  aL as a,
  a3 as o,
  z as i,
  ar as n,
  aB as l,
  aT as r,
  at as c,
} from "./element-plus.BPg5EhXK.js";
import { _ as p } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { b as m } from "./index.BRxvSTh5.js";
import {
  z as d,
  ag as u,
  p as j,
  m as g,
  n as f,
  aI as b,
  w as h,
  bt as _,
  F as v,
  ao as y,
  v as k,
  ax as w,
  a2 as x,
  o as C,
  j as z,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as B } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
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
const S = { class: "chat-navbar" },
  I = { class: "navbar-left" },
  F = { class: "navbar-right" },
  q = { class: "status-text" },
  A = B(
    d({
      __name: "FaChatNavbar",
      props: {
        connectionStatus: {},
        isConnected: { type: Boolean },
        messageCount: {},
        isSidebarCollapsed: { type: Boolean, default: !1 },
        knowledgeBases: { default: () => [] },
        knowledgeBaseIds: { default: () => [] },
      },
      emits: ["clear-chat", "toggle-connection", "toggle-sidebar", "update:knowledgeBaseIds"],
      setup(d, { emit: B }) {
        const A = d,
          V = B,
          D = z(() => {
            switch (A.connectionStatus) {
              case "connected":
                return "已连接";
              case "connecting":
                return "连接中...";
              case "disconnected":
                return "未连接";
              default:
                return "未知状态";
            }
          }),
          E = z(() => A.messageCount > 0),
          G = () => {
            V("clear-chat");
          },
          H = () => {
            V("toggle-connection");
          },
          L = () => {
            V("toggle-sidebar");
          },
          M = (e) => {
            V("update:knowledgeBaseIds", e);
          };
        return (z, B) => {
          const V = p,
            N = s,
            T = e,
            U = t,
            J = i,
            K = o;
          return (
            u(),
            j("div", S, [
              g("div", I, [
                g("button", { class: "collapse-btn", onClick: L }, [
                  A.isSidebarCollapsed
                    ? (u(),
                      f(
                        V,
                        { key: 1, icon: b(m)("layout_leftbar_open_line"), class: "size-6" },
                        null,
                        8,
                        ["icon"]
                      ))
                    : (u(),
                      f(
                        V,
                        { key: 0, icon: b(m)("layout_leftbar_close_line"), class: "size-6" },
                        null,
                        8,
                        ["icon"]
                      )),
                ]),
              ]),
              g("div", F, [
                h(
                  T,
                  {
                    "model-value": d.knowledgeBaseIds,
                    multiple: "",
                    "collapse-tags": "",
                    "collapse-tags-tooltip": "",
                    clearable: "",
                    filterable: "",
                    class: "knowledge-select",
                    placeholder: "知识库",
                    "onUpdate:modelValue": M,
                  },
                  {
                    default: _(() => [
                      (u(!0),
                      j(
                        v,
                        null,
                        y(
                          d.knowledgeBases,
                          (e) => (
                            u(),
                            f(N, { key: e.id, label: e.name, value: e.id || 0 }, null, 8, [
                              "label",
                              "value",
                            ])
                          )
                        ),
                        128
                      )),
                    ]),
                    _: 1,
                  },
                  8,
                  ["model-value"]
                ),
                h(
                  U,
                  { text: "", icon: b(a), onClick: H },
                  { default: _(() => [k(w(d.isConnected ? "断开连接" : "重新连接"), 1)]), _: 1 },
                  8,
                  ["icon"]
                ),
                h(
                  K,
                  {
                    class: "connection-status",
                    effect: "plain",
                    type: "connected" === d.connectionStatus ? "success" : "danger",
                  },
                  {
                    default: _(() => [
                      h(
                        J,
                        { class: x(["status-icon", d.connectionStatus]) },
                        {
                          default: _(() => [
                            "connected" === d.connectionStatus
                              ? (u(), f(b(n), { key: 0 }))
                              : "connecting" === d.connectionStatus
                                ? (u(), f(b(l), { key: 1 }))
                                : (u(), f(b(r), { key: 2 })),
                          ]),
                          _: 1,
                        },
                        8,
                        ["class"]
                      ),
                      g("span", q, w(D.value), 1),
                    ]),
                    _: 1,
                  },
                  8,
                  ["type"]
                ),
                E.value
                  ? (u(),
                    f(
                      U,
                      { key: 0, text: "", icon: b(c), onClick: G },
                      { default: _(() => [...(B[0] || (B[0] = [k("清空对话", -1)]))]), _: 1 },
                      8,
                      ["icon"]
                    ))
                  : C("", !0),
              ]),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-f7a7d8c3"]]
  );
export { A as default };
