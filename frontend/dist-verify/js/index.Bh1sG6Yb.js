import {
  w as e,
  x as a,
  V as s,
  M as l,
  A as t,
  d as i,
  B as o,
  aK as r,
  p as n,
  e as d,
  a3 as m,
  J as p,
} from "./element-plus.BPg5EhXK.js";
import {
  z as u,
  b4 as c,
  ac as j,
  ag as v,
  p as _,
  w as g,
  bt as f,
  F as b,
  ao as y,
  n as h,
  v as w,
  m as k,
  ax as x,
  bu as V,
  bo as q,
  aI as z,
  o as F,
  al as K,
  ai as A,
} from "./vue-vendor.Dwx3gfQr.js";
import { K as C } from "./knowledge.CzXz0ZwO.js";
import { F as N } from "./index.NbvR4TBz.js";
import { _ as U } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
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
const I = { class: "retrieval-page" },
  M = { class: "toggle-icon" },
  R = { class: "advanced-panel" },
  T = { class: "results-section" },
  B = { key: 1, class: "result-list" },
  D = { class: "result-meta" },
  E = { key: 0 },
  G = { class: "result-content" },
  H = U(
    u({
      name: "AiRetrievalTest",
      __name: "index",
      setup(u) {
        const U = c(),
          H = K([]),
          J = K([]),
          L = K(!1),
          O = K("idle"),
          P = A({ query: "", knowledge_base_ids: [], top_k: 5 }),
          Q = async () => {
            if (P.query.trim())
              if (P.knowledge_base_ids.length) {
                O.value = "loading";
                try {
                  const e = await C.testRetrieval({ ...P });
                  ((J.value = e.data?.data?.results || []),
                    (O.value = J.value.length ? "done" : "empty"));
                } catch {
                  O.value = "error";
                }
              } else p.warning("请选择知识库");
            else p.warning("请输入问题");
          };
        return (
          j(async () => {
            (await (async () => {
              const e = await C.optionselect();
              H.value = (e.data?.data || []).filter((e) => null != e.id);
            })(),
              (() => {
                const e = Number(U.query.knowledge_base_id);
                Number.isFinite(e) && e > 0 && (P.knowledge_base_ids = [e]);
              })());
          }),
          (p, u) => {
            const c = l,
              j = s,
              K = a,
              A = t,
              C = i,
              U = o,
              S = e,
              W = n,
              X = m,
              Y = d;
            return (
              v(),
              _("div", I, [
                g(
                  Y,
                  { shadow: "never" },
                  {
                    default: f(() => [
                      g(
                        S,
                        { model: P, "label-width": "80px", class: "retrieval-form" },
                        {
                          default: f(() => [
                            g(
                              K,
                              { label: "知识库" },
                              {
                                default: f(() => [
                                  g(
                                    j,
                                    {
                                      modelValue: P.knowledge_base_ids,
                                      "onUpdate:modelValue":
                                        u[0] || (u[0] = (e) => (P.knowledge_base_ids = e)),
                                      multiple: "",
                                      filterable: "",
                                      clearable: "",
                                      class: "base-select",
                                      placeholder: "选择知识库",
                                    },
                                    {
                                      default: f(() => [
                                        (v(!0),
                                        _(
                                          b,
                                          null,
                                          y(
                                            H.value,
                                            (e) => (
                                              v(),
                                              h(
                                                c,
                                                { key: e.id, label: e.name, value: e.id || 0 },
                                                null,
                                                8,
                                                ["label", "value"]
                                              )
                                            )
                                          ),
                                          128
                                        )),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                            g(
                              K,
                              { label: "问题" },
                              {
                                default: f(() => [
                                  g(
                                    A,
                                    {
                                      modelValue: P.query,
                                      "onUpdate:modelValue": u[1] || (u[1] = (e) => (P.query = e)),
                                      type: "textarea",
                                      rows: 4,
                                      maxlength: "1000",
                                      "show-word-limit": "",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                            g(K, null, {
                              default: f(() => [
                                g(
                                  C,
                                  {
                                    link: "",
                                    type: "primary",
                                    class: "advanced-toggle",
                                    onClick: u[2] || (u[2] = (e) => (L.value = !L.value)),
                                  },
                                  {
                                    default: f(() => [
                                      u[4] || (u[4] = w(" 高级设置 ", -1)),
                                      k("span", M, x(L.value ? "▲" : "▼"), 1),
                                    ]),
                                    _: 1,
                                  }
                                ),
                              ]),
                              _: 1,
                            }),
                            V(
                              k(
                                "div",
                                R,
                                [
                                  g(
                                    K,
                                    { label: "Top K" },
                                    {
                                      default: f(() => [
                                        g(
                                          U,
                                          {
                                            modelValue: P.top_k,
                                            "onUpdate:modelValue":
                                              u[3] || (u[3] = (e) => (P.top_k = e)),
                                            min: 1,
                                            max: 20,
                                          },
                                          null,
                                          8,
                                          ["modelValue"]
                                        ),
                                      ]),
                                      _: 1,
                                    }
                                  ),
                                ],
                                512
                              ),
                              [[q, L.value]]
                            ),
                            g(K, null, {
                              default: f(() => [
                                g(
                                  C,
                                  {
                                    type: "primary",
                                    icon: z(r),
                                    loading: "loading" === O.value,
                                    onClick: Q,
                                  },
                                  {
                                    default: f(() => [...(u[5] || (u[5] = [w("检索", -1)]))]),
                                    _: 1,
                                  },
                                  8,
                                  ["icon", "loading"]
                                ),
                              ]),
                              _: 1,
                            }),
                          ]),
                          _: 1,
                        },
                        8,
                        ["model"]
                      ),
                      g(W),
                      k("div", T, [
                        u[6] || (u[6] = k("p", { class: "results-title" }, "检索结果", -1)),
                        "loading" === O.value || "empty" === O.value || "error" === O.value
                          ? (v(),
                            h(
                              N,
                              {
                                key: 0,
                                state: O.value,
                                title: "error" === O.value ? "检索失败，请重试" : void 0,
                              },
                              null,
                              8,
                              ["state", "title"]
                            ))
                          : "done" === O.value
                            ? (v(),
                              _("div", B, [
                                (v(!0),
                                _(
                                  b,
                                  null,
                                  y(
                                    J.value,
                                    (e, a) => (
                                      v(),
                                      _("div", { key: a, class: "result-rank" }, [
                                        g(
                                          Y,
                                          { shadow: "never", class: "result-card" },
                                          {
                                            default: f(() => [
                                              k("div", D, [
                                                g(
                                                  X,
                                                  { type: "primary" },
                                                  {
                                                    default: f(() => [w("#" + x(a + 1), 1)]),
                                                    _: 2,
                                                  },
                                                  1024
                                                ),
                                                k(
                                                  "span",
                                                  null,
                                                  "知识库 " +
                                                    x(e.metadata.knowledge_base_id ?? "-"),
                                                  1
                                                ),
                                                k(
                                                  "span",
                                                  null,
                                                  "文档 " + x(e.metadata.document_id ?? "-"),
                                                  1
                                                ),
                                                k(
                                                  "span",
                                                  null,
                                                  "分块 " + x(e.metadata.chunk_index ?? "-"),
                                                  1
                                                ),
                                                null != e.distance
                                                  ? (v(),
                                                    _(
                                                      "span",
                                                      E,
                                                      "距离 " + x(Number(e.distance).toFixed(4)),
                                                      1
                                                    ))
                                                  : F("", !0),
                                              ]),
                                              k("p", G, x(e.content), 1),
                                            ]),
                                            _: 2,
                                          },
                                          1024
                                        ),
                                      ])
                                    )
                                  ),
                                  128
                                )),
                              ]))
                            : F("", !0),
                      ]),
                    ]),
                    _: 1,
                  }
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-9a284320"]]
  );
export { H as default };
