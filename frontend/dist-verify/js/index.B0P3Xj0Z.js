import {
  w as e,
  x as a,
  A as t,
  V as l,
  M as i,
  d as o,
  aK as n,
  aJ as s,
  aG as d,
  a0 as r,
  a1 as p,
  a3 as u,
  aN as m,
  av as c,
  ay as _,
  at as f,
  N as b,
  e as g,
  _ as v,
  o as w,
  J as y,
  K as j,
} from "./element-plus.BPg5EhXK.js";
import {
  z as h,
  b5 as k,
  ac as x,
  ag as C,
  p as V,
  w as z,
  bt as K,
  m as U,
  bv as q,
  aI as B,
  v as A,
  n as F,
  F as I,
  ax as G,
  al as H,
  ai as J,
} from "./vue-vendor.Dwx3gfQr.js";
import { K as M } from "./knowledge.CzXz0ZwO.js";
import { _ as N } from "./FaAiPageHeader.vue_vue_type_script_setup_true_lang.DfUsWKjs.js";
import { F as O } from "./index.NbvR4TBz.js";
import { _ as P } from "./_plugin-vue_export-helper.BCo6x5W8.js";
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
import "./index.C8JPqYJk.js";
const S = { class: "knowledge-page" },
  T = { class: "toolbar" },
  D = { class: "index-status" },
  E = { class: "action-buttons" },
  L = P(
    h({
      name: "AiKnowledge",
      __name: "index",
      setup(h) {
        const P = k(),
          L = H(!1),
          R = H(!1),
          $ = H(!1),
          Q = H([]),
          W = H(0),
          X = H(!1),
          Y = H(null),
          Z = H(),
          ee = J({ page_no: 1, page_size: 10, name: "", is_enabled: void 0 }),
          ae = J({ name: "", description: "", is_enabled: !0, owner_dept_id: null }),
          te = { name: [{ required: !0, message: "请输入知识库名称", trigger: "blur" }] },
          le = async () => {
            ((L.value = !0), (R.value = !1));
            try {
              const e = await M.listKnowledgeBase({ ...ee }),
                a = e.data?.data;
              ((Q.value = a?.items || []), (W.value = a?.total || 0));
            } catch {
              R.value = !0;
            } finally {
              L.value = !1;
            }
          },
          ie = () => {
            ((ee.page_no = 1), (ee.name = ""), (ee.is_enabled = void 0), le());
          },
          oe = () => {
            ((Y.value = null),
              Object.assign(ae, { name: "", description: "", is_enabled: !0, owner_dept_id: null }),
              (X.value = !0));
          },
          ne = async () => {
            (await Z.value?.validate(), ($.value = !0));
            try {
              let e;
              if (Y.value) (await M.updateKnowledgeBase(Y.value, ae), y.success("保存成功"));
              else {
                const a = await M.createKnowledgeBase(ae);
                e = a.data?.data;
              }
              if (((X.value = !1), await le(), e?.id))
                try {
                  (await j.confirm("知识库已创建，是否现在去上传文档？", "去上传文档", {
                    confirmButtonText: "去上传文档",
                    cancelButtonText: "稍后再说",
                    type: "success",
                  }),
                    se(e));
                } catch {
                  y.success("知识库已创建");
                }
            } finally {
              $.value = !1;
            }
          },
          se = (e) => {
            e.id &&
              P.push({
                path: "/module_ai/document",
                query: { knowledge_base_id: e.id, upload: "1" },
              });
          };
        return (
          x(le),
          (h, k) => {
            const x = t,
              H = a,
              J = i,
              de = l,
              re = o,
              pe = e,
              ue = p,
              me = u,
              ce = r,
              _e = b,
              fe = g,
              be = v,
              ge = w;
            return (
              C(),
              V("div", S, [
                z(N, { title: "知识库管理" }),
                z(
                  fe,
                  { shadow: "never" },
                  {
                    default: K(() => [
                      U("div", T, [
                        z(
                          pe,
                          { inline: !0, model: ee, class: "query-form" },
                          {
                            default: K(() => [
                              z(
                                H,
                                { label: "名称" },
                                {
                                  default: K(() => [
                                    z(
                                      x,
                                      {
                                        modelValue: ee.name,
                                        "onUpdate:modelValue":
                                          k[0] || (k[0] = (e) => (ee.name = e)),
                                        clearable: "",
                                        placeholder: "知识库名称",
                                        onKeyup: q(le, ["enter"]),
                                      },
                                      null,
                                      8,
                                      ["modelValue"]
                                    ),
                                  ]),
                                  _: 1,
                                }
                              ),
                              z(
                                H,
                                { label: "状态" },
                                {
                                  default: K(() => [
                                    z(
                                      de,
                                      {
                                        modelValue: ee.is_enabled,
                                        "onUpdate:modelValue":
                                          k[1] || (k[1] = (e) => (ee.is_enabled = e)),
                                        clearable: "",
                                        placeholder: "全部",
                                        class: "status-select",
                                      },
                                      {
                                        default: K(() => [
                                          z(J, { label: "启用", value: !0 }),
                                          z(J, { label: "停用", value: !1 }),
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
                              z(H, null, {
                                default: K(() => [
                                  z(
                                    re,
                                    { type: "primary", icon: B(n), onClick: le },
                                    {
                                      default: K(() => [...(k[9] || (k[9] = [A("查询", -1)]))]),
                                      _: 1,
                                    },
                                    8,
                                    ["icon"]
                                  ),
                                  z(
                                    re,
                                    { icon: B(s), onClick: ie },
                                    {
                                      default: K(() => [...(k[10] || (k[10] = [A("重置", -1)]))]),
                                      _: 1,
                                    },
                                    8,
                                    ["icon"]
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
                        z(
                          re,
                          { type: "primary", icon: B(d), onClick: oe },
                          { default: K(() => [...(k[11] || (k[11] = [A("新建", -1)]))]), _: 1 },
                          8,
                          ["icon"]
                        ),
                      ]),
                      L.value || R.value || (!L.value && 0 === Q.value.length)
                        ? (C(),
                          F(
                            O,
                            { key: 0, state: L.value ? "loading" : R.value ? "error" : "empty" },
                            null,
                            8,
                            ["state"]
                          ))
                        : (C(),
                          V(
                            I,
                            { key: 1 },
                            [
                              z(
                                ce,
                                { data: Q.value, "row-key": "id", border: "" },
                                {
                                  default: K(() => [
                                    z(ue, {
                                      prop: "name",
                                      label: "名称",
                                      "min-width": "180",
                                      "show-overflow-tooltip": "",
                                    }),
                                    z(ue, {
                                      prop: "description",
                                      label: "描述",
                                      "min-width": "220",
                                      "show-overflow-tooltip": "",
                                    }),
                                    z(ue, { prop: "document_count", label: "文档数", width: "90" }),
                                    z(
                                      ue,
                                      { label: "索引状态", "min-width": "210" },
                                      {
                                        default: K(({ row: e }) => [
                                          U("div", D, [
                                            z(
                                              me,
                                              { type: "success", effect: "plain" },
                                              {
                                                default: K(() => [
                                                  A("成功 " + G(e.indexed_document_count), 1),
                                                ]),
                                                _: 2,
                                              },
                                              1024
                                            ),
                                            z(
                                              me,
                                              { type: "warning", effect: "plain" },
                                              {
                                                default: K(() => [
                                                  A("处理中 " + G(e.indexing_document_count), 1),
                                                ]),
                                                _: 2,
                                              },
                                              1024
                                            ),
                                            z(
                                              me,
                                              { type: "danger", effect: "plain" },
                                              {
                                                default: K(() => [
                                                  A("失败 " + G(e.failed_document_count), 1),
                                                ]),
                                                _: 2,
                                              },
                                              1024
                                            ),
                                          ]),
                                        ]),
                                        _: 1,
                                      }
                                    ),
                                    z(
                                      ue,
                                      { prop: "is_enabled", label: "状态", width: "90" },
                                      {
                                        default: K(({ row: e }) => [
                                          z(
                                            me,
                                            { type: e.is_enabled ? "success" : "info" },
                                            {
                                              default: K(() => [
                                                A(G(e.is_enabled ? "启用" : "停用"), 1),
                                              ]),
                                              _: 2,
                                            },
                                            1032,
                                            ["type"]
                                          ),
                                        ]),
                                        _: 1,
                                      }
                                    ),
                                    z(ue, {
                                      prop: "created_time",
                                      label: "创建时间",
                                      width: "180",
                                      "show-overflow-tooltip": "",
                                    }),
                                    z(
                                      ue,
                                      { label: "操作", width: "360", fixed: "right" },
                                      {
                                        default: K(({ row: e }) => [
                                          U("div", E, [
                                            z(
                                              re,
                                              {
                                                class: "action-button action-button-primary",
                                                type: "primary",
                                                plain: "",
                                                icon: B(m),
                                                onClick: (a) => se(e),
                                              },
                                              {
                                                default: K(() => [
                                                  ...(k[12] || (k[12] = [A(" 上传文档 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["icon", "onClick"]
                                            ),
                                            z(
                                              re,
                                              {
                                                class: "action-button action-button-primary",
                                                type: "primary",
                                                plain: "",
                                                icon: B(c),
                                                onClick: (a) =>
                                                  ((e) => {
                                                    e.id &&
                                                      P.push({
                                                        path: "/module_ai/document",
                                                        query: { knowledge_base_id: e.id },
                                                      });
                                                  })(e),
                                              },
                                              {
                                                default: K(() => [
                                                  ...(k[13] || (k[13] = [A(" 查看文档 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["icon", "onClick"]
                                            ),
                                            z(
                                              re,
                                              {
                                                class: "action-button action-button-primary",
                                                type: "primary",
                                                plain: "",
                                                icon: B(n),
                                                onClick: (a) =>
                                                  ((e) => {
                                                    e.id &&
                                                      P.push({
                                                        path: "/module_ai/retrieval",
                                                        query: { knowledge_base_id: e.id },
                                                      });
                                                  })(e),
                                              },
                                              {
                                                default: K(() => [
                                                  ...(k[14] || (k[14] = [A(" 检索测试 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["icon", "onClick"]
                                            ),
                                            z(
                                              re,
                                              {
                                                class: "action-button",
                                                type: "primary",
                                                plain: "",
                                                icon: B(_),
                                                onClick: (a) =>
                                                  ((e) => {
                                                    ((Y.value = e.id || null),
                                                      Object.assign(ae, {
                                                        name: e.name,
                                                        description: e.description || "",
                                                        is_enabled: e.is_enabled,
                                                        owner_dept_id: e.owner_dept_id || null,
                                                      }),
                                                      (X.value = !0));
                                                  })(e),
                                              },
                                              {
                                                default: K(() => [
                                                  ...(k[15] || (k[15] = [A("编辑", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["icon", "onClick"]
                                            ),
                                            z(
                                              re,
                                              {
                                                class: "action-button action-button-danger",
                                                type: "danger",
                                                plain: "",
                                                icon: B(f),
                                                onClick: (a) =>
                                                  (async (e) => {
                                                    e.id &&
                                                      (await j.confirm(
                                                        `确认删除知识库「${e.name}」？`,
                                                        "删除确认",
                                                        { type: "warning" }
                                                      ),
                                                      await M.deleteKnowledgeBase([e.id]),
                                                      y.success("删除成功"),
                                                      await le());
                                                  })(e),
                                              },
                                              {
                                                default: K(() => [
                                                  ...(k[16] || (k[16] = [A(" 删除 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["icon", "onClick"]
                                            ),
                                          ]),
                                        ]),
                                        _: 1,
                                      }
                                    ),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["data"]
                              ),
                              z(
                                _e,
                                {
                                  "current-page": ee.page_no,
                                  "onUpdate:currentPage": k[2] || (k[2] = (e) => (ee.page_no = e)),
                                  "page-size": ee.page_size,
                                  "onUpdate:pageSize": k[3] || (k[3] = (e) => (ee.page_size = e)),
                                  class: "pagination",
                                  layout: "total, sizes, prev, pager, next",
                                  total: W.value,
                                  onSizeChange: le,
                                  onCurrentChange: le,
                                },
                                null,
                                8,
                                ["current-page", "page-size", "total"]
                              ),
                            ],
                            64
                          )),
                    ]),
                    _: 1,
                  }
                ),
                z(
                  ge,
                  {
                    modelValue: X.value,
                    "onUpdate:modelValue": k[8] || (k[8] = (e) => (X.value = e)),
                    title: Y.value ? "编辑知识库" : "新建知识库",
                    width: "560px",
                  },
                  {
                    footer: K(() => [
                      z(
                        re,
                        { onClick: k[7] || (k[7] = (e) => (X.value = !1)) },
                        { default: K(() => [...(k[17] || (k[17] = [A("取消", -1)]))]), _: 1 }
                      ),
                      z(
                        re,
                        { type: "primary", loading: $.value, onClick: ne },
                        { default: K(() => [...(k[18] || (k[18] = [A("保存", -1)]))]), _: 1 },
                        8,
                        ["loading"]
                      ),
                    ]),
                    default: K(() => [
                      z(
                        pe,
                        { ref_key: "formRef", ref: Z, model: ae, rules: te, "label-width": "92px" },
                        {
                          default: K(() => [
                            z(
                              H,
                              { label: "名称", prop: "name" },
                              {
                                default: K(() => [
                                  z(
                                    x,
                                    {
                                      modelValue: ae.name,
                                      "onUpdate:modelValue": k[4] || (k[4] = (e) => (ae.name = e)),
                                      maxlength: "100",
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
                            z(
                              H,
                              { label: "描述" },
                              {
                                default: K(() => [
                                  z(
                                    x,
                                    {
                                      modelValue: ae.description,
                                      "onUpdate:modelValue":
                                        k[5] || (k[5] = (e) => (ae.description = e)),
                                      type: "textarea",
                                      rows: 4,
                                      maxlength: "500",
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
                            z(
                              H,
                              { label: "状态" },
                              {
                                default: K(() => [
                                  z(
                                    be,
                                    {
                                      modelValue: ae.is_enabled,
                                      "onUpdate:modelValue":
                                        k[6] || (k[6] = (e) => (ae.is_enabled = e)),
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["model"]
                      ),
                    ]),
                    _: 1,
                  },
                  8,
                  ["modelValue", "title"]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-30d72838"]]
  );
export { L as default };
