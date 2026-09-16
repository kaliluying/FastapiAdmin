import {
  z as s,
  U as e,
  d as a,
  aG as t,
  A as i,
  aK as o,
  ai as n,
  ao as l,
  r,
  aE as d,
  t as c,
  s as p,
  u as m,
  b as u,
  aQ as _,
  K as f,
  J as v,
} from "./element-plus.BPg5EhXK.js";
import {
  z as j,
  ac as h,
  aq as g,
  ag as y,
  p as w,
  a2 as b,
  m as k,
  w as C,
  bt as x,
  o as z,
  aI as I,
  F as S,
  ao as A,
  ax as B,
  bu as D,
  bo as T,
  bw as E,
  v as F,
  al as q,
  j as L,
} from "./vue-vendor.Dwx3gfQr.js";
import { a7 as V } from "./index.CJ_YH8gZ.js";
import { A as G } from "./chat.C9VAl09h.js";
import { _ as H } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
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
const J = { class: "sidebar-header" },
  K = { class: "logo-section" },
  M = { key: 0, class: "project-name" },
  O = { class: "new-session-section" },
  U = { class: "history-section" },
  P = { class: "search-section" },
  Q = { class: "history-groups" },
  R = ["onClick"],
  N = { class: "session-list" },
  W = ["onClick"],
  X = { class: "session-title" },
  Y = { key: 0, class: "empty-state" },
  Z = { class: "sidebar-footer" },
  $ = { key: 0, class: "user-info" },
  ss = { class: "user-details" },
  es = { class: "user-name" },
  as = { key: 1, class: "collapsed-user" },
  ts = H(
    j({
      __name: "FaSidebar",
      props: { currentSessionId: {}, isCollapsed: { type: Boolean, default: !1 } },
      emits: ["select-session", "new-session", "delete-session"],
      setup(j, { expose: H, emit: ts }) {
        const is = j,
          os = ts,
          ns = V(),
          ls = q([]),
          rs = q(""),
          ds = q(new Set()),
          cs = L(() => ({
            id: ns.basicInfo.id || 0,
            name: ns.basicInfo.name || "用户",
            username: ns.basicInfo.username || "",
            avatar: ns.basicInfo.avatar || "",
            email: ns.basicInfo.email || "",
          })),
          ps = L(() => {
            if (!rs.value.trim()) return ls.value;
            const s = rs.value.toLowerCase();
            return ls.value.filter((e) => (e.title || "").toLowerCase().includes(s));
          }),
          ms = L(() => {
            const s = new Date();
            s.setHours(0, 0, 0, 0);
            const e = s.getTime(),
              a = e - 864e5,
              t = e - 6048e5,
              i = [],
              o = [],
              n = [],
              l = [];
            ps.value.forEach((s) => {
              if (!s.updated_at) return;
              const r = 1e3 * s.updated_at;
              r >= e ? i.push(s) : r >= a ? o.push(s) : r >= t ? n.push(s) : l.push(s);
            });
            const r = [];
            return (
              i.length > 0 && r.push({ id: "today", title: "今天", sessions: i }),
              o.length > 0 && r.push({ id: "yesterday", title: "昨天", sessions: o }),
              n.length > 0 && r.push({ id: "week", title: "本周", sessions: n }),
              l.length > 0 && r.push({ id: "earlier", title: "更早", sessions: l }),
              r
            );
          }),
          us = () => {},
          _s = () => {
            os("new-session");
          },
          fs = async () => {
            try {
              const s = (await G.getSessionList({ page_no: 1, page_size: 100 })).data,
                e = s?.data;
              e?.items &&
                Array.isArray(e.items) &&
                (ls.value = e.items
                  .filter((s) => void 0 !== s.session_id)
                  .map((s) => ({
                    id: s.session_id,
                    title: s.session_data?.session_name || s.session_id?.slice(0, 8) || "新会话",
                    created_at: s.created_at,
                    updated_at: s.updated_at,
                    message_count: s.runs?.length || 0,
                    session_id: s.session_id,
                    session_type: s.session_type,
                    agent_id: s.agent_id,
                    user_id: s.user_id,
                    team_id: s.team_id,
                    team_name: s.team_name,
                    workflow_id: s.workflow_id,
                    summary: s.summary,
                    metadata: s.metadata,
                    runs: s.runs,
                    session_data: s.session_data,
                    agent_data: s.agent_data,
                    team_data: s.team_data,
                    workflow_data: s.workflow_data,
                    created_time: s.created_at ? new Date(1e3 * s.created_at).toISOString() : null,
                    updated_time: s.updated_at ? new Date(1e3 * s.updated_at).toISOString() : null,
                    messages: s.runs?.flatMap((s) => s.messages || []) || [],
                  })));
            } catch (s) {}
          };
        return (
          h(() => {
            fs();
          }),
          H({ loadSessions: fs }),
          (j, h) => {
            const q = g("ChatDotRound"),
              L = s,
              V = a,
              H = i,
              ts = p,
              ns = c,
              fs = r,
              vs = m,
              js = u;
            return (
              y(),
              w(
                "div",
                { class: b(["sidebar", { collapsed: is.isCollapsed }]) },
                [
                  k("div", J, [
                    k("div", K, [
                      C(L, { class: "logo-icon", size: 28 }, { default: x(() => [C(q)]), _: 1 }),
                      is.isCollapsed ? z("", !0) : (y(), w("span", M, "FA智能助手")),
                    ]),
                  ]),
                  C(
                    I(e),
                    { class: "sidebar-content", "view-class": "p-4" },
                    {
                      default: x(() => [
                        is.isCollapsed
                          ? z("", !0)
                          : (y(),
                            w(
                              S,
                              { key: 0 },
                              [
                                k("div", O, [
                                  C(
                                    V,
                                    { type: "primary", class: "new-session-btn", onClick: _s },
                                    {
                                      default: x(() => [
                                        C(
                                          L,
                                          { class: "btn-icon" },
                                          { default: x(() => [C(I(t))]), _: 1 }
                                        ),
                                        h[2] || (h[2] = k("span", null, "开启新对话", -1)),
                                      ]),
                                      _: 1,
                                    }
                                  ),
                                ]),
                                k("div", U, [
                                  k("div", P, [
                                    C(
                                      H,
                                      {
                                        modelValue: rs.value,
                                        "onUpdate:modelValue":
                                          h[0] || (h[0] = (s) => (rs.value = s)),
                                        placeholder: "搜索会话历史",
                                        "prefix-icon": I(o),
                                        clearable: "",
                                        onInput: us,
                                      },
                                      null,
                                      8,
                                      ["modelValue", "prefix-icon"]
                                    ),
                                  ]),
                                  k("div", Q, [
                                    (y(!0),
                                    w(
                                      S,
                                      null,
                                      A(
                                        ms.value,
                                        (s) => (
                                          y(),
                                          w("div", { key: s.title, class: "history-group" }, [
                                            k(
                                              "div",
                                              {
                                                class: "group-title",
                                                onClick: (e) =>
                                                  ((s) => {
                                                    const e = new Set(ds.value);
                                                    (e.has(s) ? e.delete(s) : e.add(s),
                                                      (ds.value = e));
                                                  })(s.title),
                                              },
                                              [
                                                k("span", null, B(s.title), 1),
                                                C(
                                                  L,
                                                  {
                                                    class: b([
                                                      "collapse-icon",
                                                      { collapsed: ds.value.has(s.title) },
                                                    ]),
                                                  },
                                                  { default: x(() => [C(I(n))]), _: 1 },
                                                  8,
                                                  ["class"]
                                                ),
                                              ],
                                              8,
                                              R
                                            ),
                                            D(
                                              k(
                                                "div",
                                                N,
                                                [
                                                  (y(!0),
                                                  w(
                                                    S,
                                                    null,
                                                    A(
                                                      s.sessions,
                                                      (s) => (
                                                        y(),
                                                        w(
                                                          "div",
                                                          {
                                                            key: s.id,
                                                            class: b([
                                                              "session-item",
                                                              {
                                                                active:
                                                                  is.currentSessionId === s.id,
                                                              },
                                                            ]),
                                                            onClick: (e) =>
                                                              ((s) => {
                                                                os("select-session", s);
                                                              })(s),
                                                          },
                                                          [
                                                            C(
                                                              L,
                                                              { class: "session-icon" },
                                                              { default: x(() => [C(I(l))]), _: 1 }
                                                            ),
                                                            k(
                                                              "span",
                                                              X,
                                                              B(
                                                                s.title ||
                                                                  s.session_data?.session_name ||
                                                                  "未命名会话"
                                                              ),
                                                              1
                                                            ),
                                                            C(
                                                              fs,
                                                              {
                                                                trigger: "click",
                                                                onCommand: (e) =>
                                                                  (async (s, e) => {
                                                                    if ("rename" === s)
                                                                      try {
                                                                        const { value: s } =
                                                                          await f.prompt(
                                                                            "请输入新的会话名称",
                                                                            "重命名",
                                                                            {
                                                                              confirmButtonText:
                                                                                "确定",
                                                                              cancelButtonText:
                                                                                "取消",
                                                                              inputPattern: /.+/,
                                                                              inputErrorMessage:
                                                                                "会话名称不能为空",
                                                                            }
                                                                          );
                                                                        (await G.updateSession(
                                                                          e.id,
                                                                          { title: s }
                                                                        ),
                                                                          (e.title = s));
                                                                      } catch (a) {
                                                                        "cancel" !== a
                                                                          ? v.error("重命名失败")
                                                                          : v.info("已取消重命名");
                                                                      }
                                                                    else if ("delete" === s)
                                                                      try {
                                                                        (await f.confirm(
                                                                          "确定要删除此会话吗？",
                                                                          "确认删除",
                                                                          {
                                                                            confirmButtonText:
                                                                              "确定",
                                                                            cancelButtonText:
                                                                              "取消",
                                                                            type: "warning",
                                                                          }
                                                                        ),
                                                                          await G.deleteSession([
                                                                            e.id,
                                                                          ]));
                                                                        const s =
                                                                          ls.value.findIndex(
                                                                            (s) => s.id === e.id
                                                                          );
                                                                        (s > -1 &&
                                                                          ls.value.splice(s, 1),
                                                                          os(
                                                                            "delete-session",
                                                                            e.id
                                                                          ),
                                                                          v.success(
                                                                            "咨询对话已删除"
                                                                          ));
                                                                      } catch (a) {
                                                                        "cancel" !== a
                                                                          ? v.error("删除失败")
                                                                          : v.info("已取消删除");
                                                                      }
                                                                  })(e, s),
                                                              },
                                                              {
                                                                dropdown: x(() => [
                                                                  C(ns, null, {
                                                                    default: x(() => [
                                                                      C(
                                                                        ts,
                                                                        { command: "rename" },
                                                                        {
                                                                          default: x(() => [
                                                                            ...(h[3] ||
                                                                              (h[3] = [
                                                                                F("重命名", -1),
                                                                              ])),
                                                                          ]),
                                                                          _: 1,
                                                                        }
                                                                      ),
                                                                      C(
                                                                        ts,
                                                                        {
                                                                          command: "delete",
                                                                          divided: "",
                                                                        },
                                                                        {
                                                                          default: x(() => [
                                                                            ...(h[4] ||
                                                                              (h[4] = [
                                                                                F("删除", -1),
                                                                              ])),
                                                                          ]),
                                                                          _: 1,
                                                                        }
                                                                      ),
                                                                    ]),
                                                                    _: 1,
                                                                  }),
                                                                ]),
                                                                default: x(() => [
                                                                  C(
                                                                    L,
                                                                    {
                                                                      class: "more-icon",
                                                                      onClick:
                                                                        h[1] ||
                                                                        (h[1] = E(() => {}, [
                                                                          "stop",
                                                                        ])),
                                                                    },
                                                                    {
                                                                      default: x(() => [C(I(d))]),
                                                                      _: 1,
                                                                    }
                                                                  ),
                                                                ]),
                                                                _: 1,
                                                              },
                                                              8,
                                                              ["onCommand"]
                                                            ),
                                                          ],
                                                          10,
                                                          W
                                                        )
                                                      )
                                                    ),
                                                    128
                                                  )),
                                                ],
                                                512
                                              ),
                                              [[T, !ds.value.has(s.title)]]
                                            ),
                                          ])
                                        )
                                      ),
                                      128
                                    )),
                                    0 === ps.value.length
                                      ? (y(),
                                        w("div", Y, [
                                          C(vs, { description: "暂无会话历史", "image-size": 60 }),
                                        ]))
                                      : z("", !0),
                                  ]),
                                ]),
                              ],
                              64
                            )),
                      ]),
                      _: 1,
                    }
                  ),
                  k("div", Z, [
                    is.isCollapsed
                      ? (y(),
                        w("div", as, [
                          C(
                            js,
                            { size: 32, src: cs.value.avatar },
                            {
                              default: x(() => [C(L, null, { default: x(() => [C(I(_))]), _: 1 })]),
                              _: 1,
                            },
                            8,
                            ["src"]
                          ),
                        ]))
                      : (y(),
                        w("div", $, [
                          C(
                            js,
                            { size: 32, src: cs.value.avatar },
                            {
                              default: x(() => [C(L, null, { default: x(() => [C(I(_))]), _: 1 })]),
                              _: 1,
                            },
                            8,
                            ["src"]
                          ),
                          k("div", ss, [
                            k("div", es, B(cs.value.name), 1),
                            h[5] || (h[5] = k("div", { class: "user-status" }, "在线", -1)),
                          ]),
                        ])),
                  ]),
                ],
                2
              )
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-3e43c383"]]
  );
export { ts as default };
