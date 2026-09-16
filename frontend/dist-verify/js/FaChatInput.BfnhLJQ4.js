import {
  z as e,
  av as a,
  aq as s,
  w as t,
  A as l,
  ae as n,
  d as i,
  aF as o,
  aH as d,
} from "./element-plus.BPg5EhXK.js";
import { _ as u } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import {
  z as p,
  ag as c,
  p as r,
  a2 as m,
  m as v,
  F as f,
  ao as g,
  w as _,
  bt as h,
  aI as b,
  ax as j,
  o as y,
  v as x,
  bv as w,
  bw as z,
  al as C,
  j as k,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as B } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
const F = { class: "input-wrapper" },
  I = { key: 0, class: "uploaded-files" },
  S = { class: "file-name" },
  A = { class: "input-container" },
  R = { class: "composer-topline" },
  V = { class: "composer-context" },
  q = { class: "input-footer" },
  E = { class: "input-actions" },
  K = B(
    p({
      __name: "FaChatInput",
      props: {
        disabled: { type: Boolean, default: !1 },
        sending: { type: Boolean, default: !1 },
        isConnected: { type: Boolean, default: !0 },
      },
      emits: ["send"],
      setup(p, { expose: B, emit: K }) {
        const M = p,
          D = K,
          H = C(""),
          U = C([]),
          G = k(() => ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.avi,.mov"),
          J = k(() => (M.isConnected ? "向FA助手发送消息..." : "请先连接到服务器")),
          L = (e) => {
            const a = e.raw;
            if (!a) return;
            if (a.size > 10485760) return void alert("文件大小不能超过10MB");
            const s = {
              id: Date.now().toString() + Math.random().toString(36).substr(2),
              name: a.name,
              size: a.size,
              type: a.type,
              file: a,
            };
            U.value.push(s);
          },
          N = () => {
            const e = H.value.trim();
            (!e && 0 === U.value.length) ||
              M.disabled ||
              M.sending ||
              (D("send", e, U.value.length > 0 ? [...U.value] : void 0),
              (H.value = ""),
              (U.value = []));
          },
          O = () => {
            H.value += "\n";
          };
        return (
          B({
            focus: () => {
              const e = document.querySelector(".message-input textarea");
              e?.focus();
            },
          }),
          (C, k) => {
            const B = e,
              K = u,
              M = l,
              D = t,
              P = i,
              Q = n;
            return (
              c(),
              r(
                "div",
                { class: m(["chat-input", { "chat-input--disabled": p.disabled }]) },
                [
                  v("div", F, [
                    U.value.length > 0
                      ? (c(),
                        r("div", I, [
                          (c(!0),
                          r(
                            f,
                            null,
                            g(
                              U.value,
                              (e) => (
                                c(),
                                r("div", { key: e.id, class: "file-item" }, [
                                  _(
                                    B,
                                    { class: "file-icon" },
                                    { default: h(() => [_(b(a))]), _: 1 }
                                  ),
                                  v("span", S, j(e.name), 1),
                                  _(
                                    B,
                                    {
                                      class: "file-remove",
                                      onClick: (a) =>
                                        ((e) => {
                                          const a = U.value.findIndex((a) => a.id === e);
                                          a > -1 && U.value.splice(a, 1);
                                        })(e.id),
                                    },
                                    { default: h(() => [_(b(s))]), _: 1 },
                                    8,
                                    ["onClick"]
                                  ),
                                ])
                              )
                            ),
                            128
                          )),
                        ]))
                      : y("", !0),
                    v("div", A, [
                      v("div", R, [
                        v("span", V, [
                          _(K, { icon: "ri:database-2-line" }),
                          k[1] || (k[1] = x(" 知识库问答 ", -1)),
                        ]),
                        v(
                          "span",
                          {
                            class: m([
                              "composer-status",
                              { "composer-status--offline": !p.isConnected },
                            ]),
                          },
                          j(p.isConnected ? "已连接" : "未连接"),
                          3
                        ),
                      ]),
                      _(D, null, {
                        default: h(() => [
                          _(
                            M,
                            {
                              modelValue: H.value,
                              "onUpdate:modelValue": k[0] || (k[0] = (e) => (H.value = e)),
                              type: "textarea",
                              placeholder: J.value,
                              disabled: p.disabled || p.sending,
                              autosize: { minRows: 3, maxRows: 8 },
                              resize: "none",
                              class: "message-input",
                              onKeydown: [
                                w(z(N, ["exact", "prevent"]), ["enter"]),
                                w(z(O, ["shift", "exact"]), ["enter"]),
                              ],
                            },
                            null,
                            8,
                            ["modelValue", "placeholder", "disabled", "onKeydown"]
                          ),
                        ]),
                        _: 1,
                      }),
                      v("div", q, [
                        k[2] ||
                          (k[2] = v(
                            "span",
                            { class: "input-hint" },
                            "Enter 发送 / Shift + Enter 换行",
                            -1
                          )),
                        v("div", E, [
                          _(
                            Q,
                            {
                              ref: "uploadRef",
                              "auto-upload": !1,
                              "show-file-list": !1,
                              "on-change": L,
                              accept: G.value,
                              multiple: !0,
                            },
                            {
                              default: h(() => [
                                _(P, { icon: b(o), class: "upload-btn", circle: "" }, null, 8, [
                                  "icon",
                                ]),
                              ]),
                              _: 1,
                            },
                            8,
                            ["accept"]
                          ),
                          _(
                            P,
                            {
                              disabled:
                                (!H.value.trim() && 0 === U.value.length) ||
                                p.disabled ||
                                p.sending,
                              loading: p.sending,
                              class: "send-button",
                              type: "primary",
                              circle: "",
                              onClick: N,
                            },
                            {
                              default: h(() => [_(B, null, { default: h(() => [_(b(d))]), _: 1 })]),
                              _: 1,
                            },
                            8,
                            ["disabled", "loading"]
                          ),
                        ]),
                      ]),
                    ]),
                  ]),
                ],
                2
              )
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-46435f5d"]]
  );
export { K as default };
