import { E as s, U as o } from "./element-plus.BPg5EhXK.js";
import e from "./FaWelcomeScreen.BEv_SKWy.js";
import r from "./FaMessageItem.hmCuMFZf.js";
import {
  z as t,
  br as i,
  ag as m,
  n as p,
  bt as a,
  p as n,
  F as l,
  ao as j,
  w as c,
  o as d,
  aI as g,
  al as h,
  a1 as u,
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
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./markdown.CudvY_Ek.js";
import "./mdurl.Dwcmq5MZ.js";
import "./uc.micro.CRGj88R_.js";
import "./entities.zpoy7YfM.js";
import "./linkify-it.xinbW_ni.js";
import "./punycode.js.BkBFhtvi.js";
import "./highlight.Cxq3ZXHl.js";
import "./dompurify.C2yrXNAa.js";
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
import "./codemirror.CwY4WcCn.js";
import "./diff-match-patch.B0ZLOaK6.js";
import "./iconify-icons.PLu8Rxye.js";
import "./vue-web-terminal.B__atI2c.js";
import "./@intlify.CbtlSmdZ.js";
const y = { key: 1, class: "messages-list" },
  k = { key: 2, class: "error-banner" },
  _ = f(
    t({
      __name: "FaChatMessages",
      props: { messages: {}, error: {} },
      emits: ["prompt-click", "error-close"],
      setup(t, { expose: f, emit: _ }) {
        const v = t,
          b = _,
          w = h(),
          x = () => {
            u(() => {
              const s = w.value?.wrapRef;
              s && (s.scrollTop = s.scrollHeight);
            });
          };
        i(
          () => v.messages,
          () => {
            x();
          },
          { deep: !0 }
        );
        const z = (s) => {
            b("prompt-click", s);
          },
          C = () => {
            b("error-close");
          };
        return (
          f({ scrollToBottom: x }),
          (i, h) => {
            const u = s;
            return (
              m(),
              p(
                g(o),
                { ref_key: "messagesContainer", ref: w, class: "chat-messages" },
                {
                  default: a(() => [
                    0 === t.messages.length
                      ? (m(), p(e, { key: 0, onPromptClick: z }))
                      : (m(),
                        n("div", y, [
                          (m(!0),
                          n(
                            l,
                            null,
                            j(
                              t.messages,
                              (s) => (
                                m(),
                                p(
                                  r,
                                  {
                                    key: s.id,
                                    message: s,
                                    onToggleThinking: (o) =>
                                      ((s) => {
                                        s.thinkingCollapsed = !s.thinkingCollapsed;
                                      })(s),
                                  },
                                  null,
                                  8,
                                  ["message", "onToggleThinking"]
                                )
                              )
                            ),
                            128
                          )),
                        ])),
                    t.error
                      ? (m(),
                        n("div", k, [
                          c(
                            u,
                            {
                              title: t.error,
                              type: "error",
                              closable: !0,
                              "show-icon": "",
                              onClose: C,
                            },
                            null,
                            8,
                            ["title"]
                          ),
                        ]))
                      : d("", !0),
                  ]),
                  _: 1,
                },
                512
              )
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-3a12a78c"]]
  );
export { _ as default };
