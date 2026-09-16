import { M as e } from "./markdown.CudvY_Ek.js";
import { m as s, H as t } from "./highlight.Cxq3ZXHl.js";
import { p as a } from "./dompurify.C2yrXNAa.js";
import {
  z as n,
  ag as i,
  p as o,
  j as r,
  a2 as l,
  m,
  w as p,
  bt as c,
  aI as d,
  ax as g,
  n as u,
  o as h,
  F as j,
  ao as f,
  v,
  bu as y,
  bo as k,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as b } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import {
  z as x,
  aQ as _,
  an as w,
  d as z,
  as as M,
  av as C,
  ai as L,
  am as I,
  J as B,
} from "./element-plus.BPg5EhXK.js";
import { a7 as H } from "./index.CJ_YH8gZ.js";
import "./mdurl.Dwcmq5MZ.js";
import "./uc.micro.CRGj88R_.js";
import "./entities.zpoy7YfM.js";
import "./linkify-it.xinbW_ni.js";
import "./punycode.js.BkBFhtvi.js";
import "./dayjs.BHSg66Ch.js";
import "./@intlify.CbtlSmdZ.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
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
import "./codemirror.CwY4WcCn.js";
import "./diff-match-patch.B0ZLOaK6.js";
import "./iconify-icons.PLu8Rxye.js";
import "./vue-web-terminal.B__atI2c.js";
const F = ["innerHTML"],
  T = b(
    n({
      name: "FaMarkdownRenderer",
      __name: "index",
      props: {
        content: {},
        maxLength: { default: void 0 },
        sanitize: { type: Boolean, default: !0 },
      },
      setup(n) {
        const l = n,
          m = new e({
            html: !0,
            linkify: !0,
            typographer: !0,
            breaks: !0,
            highlight(e, s) {
              if (s && t.getLanguage(s))
                try {
                  return `<pre class="hljs"><code>${t.highlight(e, { language: s, ignoreIllegals: !0 }).value}</code></pre>`;
                } catch {
                  return `<pre class="hljs"><code>${m.utils.escapeHtml(e)}</code></pre>`;
                }
              return `<pre class="hljs"><code>${m.utils.escapeHtml(e)}</code></pre>`;
            },
          }).use(s),
          p =
            m.renderer.rules.link_open ||
            function (e, s, t, a, n) {
              return n.renderToken(e, s, t, a, n);
            };
        m.renderer.rules.link_open = function (e, s, t, a, n) {
          return (
            e[s].attrPush(["target", "_blank"]),
            e[s].attrPush(["rel", "noopener noreferrer"]),
            p(e, s, t, a, n)
          );
        };
        const c = r(() => {
          if (!l.content) return "";
          const e =
              l.maxLength && l.content.length > l.maxLength
                ? l.content.substring(0, l.maxLength) + "..."
                : l.content,
            s = m.render(e);
          return l.sanitize ? a.sanitize(s) : s;
        });
        return (e, s) => (
          i(),
          o("div", { class: "markdown-content", innerHTML: c.value }, null, 8, F)
        );
      },
    }),
    [["__scopeId", "data-v-f0035368"]]
  ),
  $ = { class: "message-avatar" },
  q = { key: 0, class: "user-avatar" },
  A = { key: 1, class: "ai-avatar" },
  E = { class: "message-content" },
  G = { class: "message-header" },
  J = { class: "sender-name" },
  K = { class: "message-body" },
  P = { key: 0, class: "message-files" },
  D = { class: "file-name" },
  N = { class: "file-size" },
  O = { key: 1, class: "thinking-panel" },
  Q = { class: "thinking-content" },
  R = { key: 2, class: "message-text" },
  S = { key: 3, class: "typing-indicator" },
  U = b(
    n({
      __name: "FaMessageItem",
      props: { message: {} },
      emits: ["toggle-thinking"],
      setup(e, { emit: s }) {
        const t = e,
          a = s,
          n = H(),
          b = r(() => n.basicInfo.name || "用户"),
          F = r(() =>
            "assistant" !== t.message.type
              ? { thinking: "", answer: t.message.content }
              : U(t.message.content)
          ),
          U = (e) => {
            const s = [],
              t = e
                .replace(
                  /<think(?:ing)?>([\s\S]*?)(?:<\/think(?:ing)?>|$)/gi,
                  (e, t) => (t.trim() && s.push(t.trim()), "")
                )
                .trim();
            return { thinking: s.join("\n\n"), answer: t };
          },
          V = () => {
            a("toggle-thinking");
          },
          W = async () => {
            try {
              (await navigator.clipboard.writeText(t.message.content), B.success("已复制到剪贴板"));
            } catch {
              const e = document.createElement("textarea");
              ((e.value = t.message.content),
                document.body.appendChild(e),
                e.select(),
                document.execCommand("copy"),
                document.body.removeChild(e),
                B.success("已复制到剪贴板"));
            }
          },
          X = (e) => {
            if (0 === e) return "0 B";
            const s = Math.floor(Math.log(e) / Math.log(1024));
            return (
              Math.round((e / Math.pow(1024, s)) * 100) / 100 + " " + ["B", "KB", "MB", "GB"][s]
            );
          };
        return (s, t) => {
          const a = x,
            n = z,
            r = T;
          return (
            i(),
            o(
              "div",
              { class: l(["message-group", e.message.type]) },
              [
                m("div", $, [
                  "user" === e.message.type
                    ? (i(), o("div", q, [p(a, null, { default: c(() => [p(d(_))]), _: 1 })]))
                    : (i(), o("div", A, [p(a, null, { default: c(() => [p(d(w))]), _: 1 })])),
                ]),
                m("div", E, [
                  m("div", G, [
                    m("strong", J, g("user" === e.message.type ? b.value : "FA助手"), 1),
                    e.message.content
                      ? (i(),
                        u(
                          n,
                          {
                            key: 0,
                            text: "",
                            size: "small",
                            icon: d(M),
                            class: "copy-button",
                            onClick: W,
                          },
                          null,
                          8,
                          ["icon"]
                        ))
                      : h("", !0),
                  ]),
                  m("div", K, [
                    e.message.files && e.message.files.length > 0
                      ? (i(),
                        o("div", P, [
                          (i(!0),
                          o(
                            j,
                            null,
                            f(
                              e.message.files,
                              (e) => (
                                i(),
                                o("div", { key: e.id, class: "attached-file" }, [
                                  p(
                                    a,
                                    { class: "file-icon" },
                                    { default: c(() => [p(d(C))]), _: 1 }
                                  ),
                                  m("span", D, g(e.name), 1),
                                  m("span", N, g(X(e.size)), 1),
                                ])
                              )
                            ),
                            128
                          )),
                        ]))
                      : h("", !0),
                    F.value.thinking
                      ? (i(),
                        o("div", O, [
                          p(
                            n,
                            {
                              text: "",
                              size: "small",
                              icon: e.message.thinkingCollapsed ? d(L) : d(I),
                              class: "thinking-toggle",
                              onClick: V,
                            },
                            {
                              default: c(() => [
                                v(
                                  g(e.message.thinkingCollapsed ? "展开思考过程" : "收起思考过程"),
                                  1
                                ),
                              ]),
                              _: 1,
                            },
                            8,
                            ["icon"]
                          ),
                          y(
                            m(
                              "div",
                              Q,
                              [p(r, { content: F.value.thinking }, null, 8, ["content"])],
                              512
                            ),
                            [[k, !e.message.thinkingCollapsed]]
                          ),
                        ]))
                      : h("", !0),
                    F.value.answer
                      ? (i(),
                        o("div", R, [p(r, { content: F.value.answer }, null, 8, ["content"])]))
                      : h("", !0),
                    "assistant" === e.message.type && e.message.loading && !e.message.content
                      ? (i(),
                        o("div", S, [
                          ...(t[0] ||
                            (t[0] = [
                              m(
                                "div",
                                { class: "typing-dots" },
                                [m("span"), m("span"), m("span")],
                                -1
                              ),
                            ])),
                        ]))
                      : h("", !0),
                  ]),
                ]),
              ],
              2
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-dea9d62f"]]
  );
export { U as default };
