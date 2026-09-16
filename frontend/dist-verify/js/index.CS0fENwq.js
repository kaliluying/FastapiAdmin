import {
  m as e,
  n as a,
  a3 as s,
  aS as i,
  d as o,
  aJ as t,
  e as r,
} from "./element-plus.BPg5EhXK.js";
import { _ as l } from "./FaAiPageHeader.vue_vue_type_script_setup_true_lang.DfUsWKjs.js";
import { A as p } from "./chat.C9VAl09h.js";
import {
  z as m,
  ac as n,
  ag as d,
  p as u,
  w as c,
  bt as j,
  bu as _,
  n as v,
  v as f,
  ax as g,
  m as b,
  aI as h,
  al as y,
  j as w,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as x } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./index.C8JPqYJk.js";
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
const z = { class: "model-config-page" },
  A = { class: "card-header" },
  C = x(
    m({
      name: "AiModelConfig",
      __name: "index",
      setup(m) {
        const x = y(!1),
          C = y(),
          k = w(() =>
            C.value
              ? "local" === C.value.embedding_provider
                ? C.value.local_embedding_model || "-"
                : C.value.openai_embedding_model || "-"
              : "-"
          ),
          I = async () => {
            x.value = !0;
            try {
              const e = await p.getModelConfig();
              C.value = e.data?.data;
            } finally {
              x.value = !1;
            }
          };
        return (
          n(I),
          (p, m) => {
            const n = o,
              y = a,
              w = s,
              P = e,
              q = r,
              F = i;
            return (
              d(),
              u("div", z, [
                c(l, { title: "模型配置" }),
                c(
                  q,
                  { shadow: "never" },
                  {
                    header: j(() => [
                      b("div", A, [
                        m[1] || (m[1] = b("span", null, "模型配置", -1)),
                        c(
                          n,
                          { icon: h(t), loading: x.value, onClick: I },
                          { default: j(() => [...(m[0] || (m[0] = [f("刷新", -1)]))]), _: 1 },
                          8,
                          ["icon", "loading"]
                        ),
                      ]),
                    ]),
                    default: j(() => [
                      _(
                        (d(),
                        v(
                          P,
                          { column: 2, border: "" },
                          {
                            default: j(() => [
                              c(
                                y,
                                { label: "API 地址" },
                                {
                                  default: j(() => [f(g(C.value?.openai_base_url || "-"), 1)]),
                                  _: 1,
                                }
                              ),
                              c(
                                y,
                                { label: "API Key" },
                                {
                                  default: j(() => [
                                    c(
                                      w,
                                      {
                                        type: C.value?.openai_api_key_configured
                                          ? "success"
                                          : "danger",
                                      },
                                      {
                                        default: j(() => [
                                          f(
                                            g(
                                              C.value?.openai_api_key_configured
                                                ? "已配置"
                                                : "未配置"
                                            ),
                                            1
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["type"]
                                    ),
                                  ]),
                                  _: 1,
                                }
                              ),
                              c(
                                y,
                                { label: "对话模型" },
                                { default: j(() => [f(g(C.value?.openai_model || "-"), 1)]), _: 1 }
                              ),
                              c(
                                y,
                                { label: "向量来源" },
                                {
                                  default: j(() => [
                                    c(
                                      w,
                                      {
                                        type:
                                          "local" === C.value?.embedding_provider
                                            ? "success"
                                            : "warning",
                                      },
                                      {
                                        default: j(() => [
                                          f(g(C.value?.embedding_provider || "-"), 1),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["type"]
                                    ),
                                  ]),
                                  _: 1,
                                }
                              ),
                              c(
                                y,
                                { label: "向量模型" },
                                { default: j(() => [f(g(k.value), 1)]), _: 1 }
                              ),
                              c(
                                y,
                                { label: "Chroma 持久化目录" },
                                {
                                  default: j(() => [f(g(C.value?.chroma_persist_dir || "-"), 1)]),
                                  _: 1,
                                }
                              ),
                              c(
                                y,
                                { label: "Chroma 集合" },
                                {
                                  default: j(() => [
                                    f(g(C.value?.chroma_collection_name || "-"), 1),
                                  ]),
                                  _: 1,
                                }
                              ),
                            ]),
                            _: 1,
                          }
                        )),
                        [[F, x.value]]
                      ),
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
    [["__scopeId", "data-v-7ab9fcb1"]]
  );
export { C as default };
