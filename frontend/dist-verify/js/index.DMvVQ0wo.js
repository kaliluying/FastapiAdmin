import {
  a as e,
  k as s,
  y as a,
  G as t,
  v as o,
  q as i,
  J as n,
  K as l,
} from "./element-plus.BPg5EhXK.js";
import { A as r } from "./chat.C9VAl09h.js";
import { K as c } from "./knowledge.CzXz0ZwO.js";
import { b as u } from "./index.CJ_YH8gZ.js";
import d from "./FaSidebar.BzMfgi6H.js";
import m from "./FaChatNavbar.DfoYhWoB.js";
import p from "./FaChatMessages.zU6gRnXc.js";
import v from "./FaChatInput.BfnhLJQ4.js";
import j from "./FaAiProcessStatus.BDXCnZxV.js";
import f from "./FaCitationList.CuX6VX8k.js";
import {
  z as g,
  ac as h,
  ae as y,
  ag as w,
  p as b,
  w as _,
  bt as S,
  a2 as k,
  al as C,
  j as x,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as z } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./file-saver.CjVB4eGa.js";
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
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./index.BRxvSTh5.js";
import "./FaWelcomeScreen.BEv_SKWy.js";
import "./FaMessageItem.hmCuMFZf.js";
import "./markdown.CudvY_Ek.js";
import "./mdurl.Dwcmq5MZ.js";
import "./uc.micro.CRGj88R_.js";
import "./entities.zpoy7YfM.js";
import "./linkify-it.xinbW_ni.js";
import "./punycode.js.BkBFhtvi.js";
import "./dompurify.C2yrXNAa.js";
const E = { class: "fa-full-height" },
  F = z(
    g({
      name: "Chat",
      inheritAttrs: !1,
      __name: "index",
      setup(g) {
        const z = C([]),
          F = C(!1),
          D = C(!1),
          N = C("disconnected"),
          T = C(""),
          A = C(null),
          I = C(!1),
          B = C([]),
          M = C([]),
          P = C(),
          W = C(),
          J = C([]),
          K = x(() => (T.value ? "error" : F.value ? "generating" : "idle")),
          O = C(!1);
        let q = null;
        const L = () => {
            if (q?.readyState !== WebSocket.OPEN) {
              ((N.value = "connecting"), (T.value = ""));
              try {
                const e = new URL("/api/v1/ai/chat/ws", "wss://admin.gmlhub.top"),
                  s = u.getAccessToken();
                (s && e.searchParams.append("token", s),
                  (q = new WebSocket(e.toString())),
                  (q.onopen = () => {
                    ((D.value = !0), (N.value = "connected"), n.success("连接成功"));
                  }),
                  (q.onmessage = (e) => V(e.data)),
                  (q.onclose = () => {
                    ((D.value = !1), (N.value = "disconnected"), H());
                  }),
                  (q.onerror = () => {
                    ((D.value = !1),
                      (N.value = "disconnected"),
                      n.error("连接失败，请检查服务器状态"),
                      H());
                  }));
              } catch {
                ((N.value = "disconnected"), (T.value = "无法创建连接"));
              }
            }
          },
          R = () => {
            (q && (q.close(1e3, "用户主动断开"), (q = null)),
              (D.value = !1),
              (N.value = "disconnected"),
              H());
          },
          U = () => {
            D.value ? (R(), n.info("已断开连接")) : L();
          },
          V = (e) => {
            const s = z.value[z.value.length - 1],
              a = e || "";
            ("assistant" === s?.type && s.loading ? (s.content += a) : G("assistant", a),
              P.value?.scrollToBottom());
          },
          G = (e, s, a) => {
            z.value.push({
              id: $(),
              type: e,
              content: s,
              timestamp: Date.now(),
              thinkingCollapsed: "assistant" === e,
              files: a,
            });
          },
          H = () => {
            z.value.forEach((e) => {
              "assistant" === e.type && e.loading && (e.loading = !1);
            });
          },
          $ = () => Date.now().toString(36) + Math.random().toString(36).slice(2),
          Q = async (e, s) => {
            if ((e || s) && D.value && !F.value) {
              if ((H(), !A.value)) {
                if (!(await X(e))) return;
              }
              (G("user", e, s),
                z.value.push({
                  id: $(),
                  type: "assistant",
                  content: "",
                  timestamp: Date.now(),
                  loading: !0,
                  thinkingCollapsed: !0,
                }),
                (F.value = !0),
                P.value?.scrollToBottom());
              try {
                if (q?.readyState !== WebSocket.OPEN) throw new Error("WebSocket 连接未建立");
                q.send(
                  JSON.stringify({
                    message: e,
                    session_id: A.value,
                    knowledge_base_ids: M.value,
                    files: s?.map((e) => ({ name: e.name, type: e.type, size: e.size })),
                  })
                );
              } catch {
                (z.value.pop(), (T.value = "发送消息失败，请检查连接状态"));
              } finally {
                F.value = !1;
              }
            }
          },
          X = async (e) => {
            try {
              const s = e.slice(0, 20) + (e.length > 20 ? "..." : ""),
                a = await r.createSession({ title: s });
              if (0 === a.data?.code || a.data?.success)
                return ((A.value = a.data.data?.id ?? null), W.value?.loadSessions(), !0);
              throw new Error("创建会话失败");
            } catch {
              return !1;
            }
          },
          Y = async (e) => {
            const s = e.id || e.session_id;
            if (s)
              try {
                const a = (await r.getSessionDetail(s)).data;
                if (!((e) => !0 === e?.success || 0 === e?.code || 200 === e?.code)(a))
                  return void n.error(a?.msg || "获取会话详情失败");
                ((A.value = s), (z.value = []));
                const t = a.data || {};
                ((t.runs || []).forEach((e) => {
                  (e.messages || []).forEach((e) => {
                    ("user" !== e.role && "assistant" !== e.role) || G(e.role, e.content);
                  });
                }),
                  n.success(`已切换到会话：${e.title}`));
              } catch {
                n.error("获取会话详情失败");
              }
            else n.error("会话 ID 缺失，无法切换");
          },
          Z = () => {
            ((A.value = null), (z.value = []), n.success("已开启新对话"));
          },
          ee = (e) => {
            A.value === e && ((A.value = null), (z.value = []), H());
          },
          se = async () => {
            try {
              (await l.confirm("确定要清空当前对话吗？此操作不可恢复。", "确认清空", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              }),
                (z.value = []),
                n.success("对话已清空"));
            } catch {
              n.info("已取消清空对话");
            }
          },
          ae = () => {
            I.value = !I.value;
          };
        return (
          h(() => {
            ((async () => {
              try {
                const e = await c.optionselect();
                B.value = (e.data?.data || []).filter((e) => null != e.id);
              } catch {
                B.value = [];
              }
            })(),
              L());
          }),
          y(R),
          (n, l) => {
            const r = e,
              c = a,
              u = t,
              g = o,
              h = s,
              y = i;
            return (
              w(),
              b("div", E, [
                _(
                  h,
                  { class: "main-chat" },
                  {
                    default: S(() => [
                      _(
                        r,
                        {
                          "aria-label": "会话列表",
                          class: k(["sidebar-container", { collapsed: I.value }]),
                        },
                        {
                          default: S(() => [
                            _(
                              d,
                              {
                                ref_key: "sidebarRef",
                                ref: W,
                                "current-session-id": A.value,
                                "is-collapsed": I.value,
                                onSelectSession: Y,
                                onNewSession: Z,
                                onDeleteSession: ee,
                              },
                              null,
                              8,
                              ["current-session-id", "is-collapsed"]
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["class"]
                      ),
                      _(
                        h,
                        { "aria-label": "对话内容", class: "chat-container" },
                        {
                          default: S(() => [
                            _(
                              c,
                              { class: "chat-header" },
                              {
                                default: S(() => [
                                  _(
                                    m,
                                    {
                                      "connection-status": N.value,
                                      "is-connected": D.value,
                                      "message-count": z.value.length,
                                      "is-sidebar-collapsed": I.value,
                                      "knowledge-bases": B.value,
                                      "knowledge-base-ids": M.value,
                                      "onUpdate:knowledgeBaseIds":
                                        l[0] || (l[0] = (e) => (M.value = e)),
                                      onClearChat: se,
                                      onToggleConnection: U,
                                      onToggleSidebar: ae,
                                    },
                                    null,
                                    8,
                                    [
                                      "connection-status",
                                      "is-connected",
                                      "message-count",
                                      "is-sidebar-collapsed",
                                      "knowledge-bases",
                                      "knowledge-base-ids",
                                    ]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                            _(
                              u,
                              { class: "chat-main" },
                              {
                                default: S(() => [
                                  _(
                                    p,
                                    {
                                      ref_key: "chatMessagesRef",
                                      ref: P,
                                      messages: z.value,
                                      error: T.value,
                                      onPromptClick: Q,
                                      onErrorClose: l[1] || (l[1] = (e) => (T.value = "")),
                                    },
                                    null,
                                    8,
                                    ["messages", "error"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                            _(
                              g,
                              { class: "chat-footer" },
                              {
                                default: S(() => [
                                  _(
                                    v,
                                    {
                                      disabled: !D.value,
                                      sending: F.value,
                                      "is-connected": D.value,
                                      onSend: Q,
                                    },
                                    null,
                                    8,
                                    ["disabled", "sending", "is-connected"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        }
                      ),
                      _(
                        r,
                        { "aria-label": "回答依据", class: "evidence-panel" },
                        {
                          default: S(() => [
                            _(j, { stage: K.value }, null, 8, ["stage"]),
                            _(f, { citations: J.value }, null, 8, ["citations"]),
                          ]),
                          _: 1,
                        }
                      ),
                    ]),
                    _: 1,
                  }
                ),
                _(
                  y,
                  {
                    modelValue: O.value,
                    "onUpdate:modelValue": l[2] || (l[2] = (e) => (O.value = e)),
                    title: "会话列表",
                    direction: "ltr",
                    size: "260px",
                  },
                  {
                    default: S(() => [
                      _(
                        d,
                        {
                          "current-session-id": A.value,
                          "is-collapsed": !1,
                          onSelectSession: Y,
                          onNewSession: Z,
                          onDeleteSession: ee,
                        },
                        null,
                        8,
                        ["current-session-id"]
                      ),
                    ]),
                    _: 1,
                  },
                  8,
                  ["modelValue"]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-d1551d62"]]
  );
export { F as default };
