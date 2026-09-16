import {
  w as e,
  x as a,
  V as l,
  M as t,
  A as s,
  d as i,
  aK as o,
  aJ as d,
  aN as n,
  a0 as r,
  a1 as p,
  a9 as u,
  a3 as m,
  N as c,
  e as _,
  ae as f,
  z as b,
  o as g,
  J as w,
  K as j,
} from "./element-plus.BPg5EhXK.js";
import {
  z as y,
  b4 as v,
  ac as h,
  ag as k,
  p as x,
  w as z,
  bt as V,
  m as C,
  F as q,
  ao as D,
  n as F,
  bv as K,
  aI as U,
  v as $,
  ax as B,
  al as M,
  j as N,
  ai as A,
} from "./vue-vendor.Dwx3gfQr.js";
import { K as S } from "./knowledge.CzXz0ZwO.js";
import { F as I } from "./index.NbvR4TBz.js";
import { _ as J } from "./_plugin-vue_export-helper.BCo6x5W8.js";
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
const E = { class: "document-page" },
  G = { class: "toolbar" },
  H = J(
    y({
      name: "AiKnowledgeDocument",
      __name: "index",
      setup(y) {
        const J = v(),
          H = M(!1),
          L = N(() => (H.value ? "loading" : "empty")),
          P = M([]),
          O = M([]),
          Q = M(0),
          R = M(!1),
          T = A({ page_no: 1, page_size: 10, knowledge_base_id: void 0, file_name: "" }),
          W = A({ knowledge_base_id: void 0 }),
          X = async () => {
            H.value = !0;
            try {
              const e = await S.listDocument({ ...T }),
                a = e.data?.data;
              ((P.value = a?.items || []), (Q.value = a?.total || 0));
            } finally {
              H.value = !1;
            }
          },
          Y = () => {
            ((T.page_no = 1), (T.knowledge_base_id = void 0), (T.file_name = ""), X());
          },
          Z = () => {
            ((W.knowledge_base_id =
              T.knowledge_base_id || (1 === O.value.length ? O.value[0]?.id : void 0)),
              (R.value = !0));
          },
          ee = [".txt", ".md", ".pdf", ".docx"],
          ae = (e) => {
            const a = "." + (e.name.split(".").pop()?.toLowerCase() ?? "");
            return ee.includes(a)
              ? !(e.size > 52428800) || (w.error("文件大小不能超过 50MB"), !1)
              : (w.error(`仅支持 ${ee.join("、")} 格式`), !1);
          },
          le = async (e) => {
            if (!W.knowledge_base_id) return void w.warning("请先选择知识库");
            const a = new FormData();
            (a.append("knowledge_base_id", String(W.knowledge_base_id)),
              a.append("file", e.file),
              await S.uploadDocument(a),
              w.success("上传成功"),
              (R.value = !1),
              T.knowledge_base_id || (T.knowledge_base_id = W.knowledge_base_id),
              await X());
          },
          te = (e) =>
            "failed" === e.parse_status
              ? { label: "解析失败", type: "danger" }
              : "failed" === e.index_status
                ? { label: "索引失败", type: "danger" }
                : "success" === e.index_status
                  ? { label: "可检索", type: "success" }
                  : "indexing" === e.index_status
                    ? { label: "正在索引", type: "warning" }
                    : "success" === e.parse_status
                      ? { label: "等待索引", type: "info" }
                      : { label: "等待处理", type: "info" };
        return (
          h(async () => {
            (await (async () => {
              const e = await S.optionselect();
              O.value = (e.data?.data || []).filter((e) => null != e.id);
            })(),
              (() => {
                const e = Number(J.query.knowledge_base_id);
                Number.isFinite(e) &&
                  e > 0 &&
                  ((T.knowledge_base_id = e), (W.knowledge_base_id = e));
              })(),
              "1" === J.query.upload && Z(),
              await X());
          }),
          (y, v) => {
            const h = t,
              M = l,
              N = a,
              A = s,
              J = i,
              ee = e,
              se = p,
              ie = m,
              oe = u,
              de = r,
              ne = c,
              re = _,
              pe = b,
              ue = f,
              me = g;
            return (
              k(),
              x("div", E, [
                z(
                  re,
                  { shadow: "never" },
                  {
                    default: V(() => [
                      C("div", G, [
                        z(
                          ee,
                          { inline: !0, model: T },
                          {
                            default: V(() => [
                              z(
                                N,
                                { label: "知识库" },
                                {
                                  default: V(() => [
                                    z(
                                      M,
                                      {
                                        modelValue: T.knowledge_base_id,
                                        "onUpdate:modelValue":
                                          v[0] || (v[0] = (e) => (T.knowledge_base_id = e)),
                                        clearable: "",
                                        filterable: "",
                                        class: "base-select",
                                      },
                                      {
                                        default: V(() => [
                                          (k(!0),
                                          x(
                                            q,
                                            null,
                                            D(
                                              O.value,
                                              (e) => (
                                                k(),
                                                F(
                                                  h,
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
                              z(
                                N,
                                { label: "文件名" },
                                {
                                  default: V(() => [
                                    z(
                                      A,
                                      {
                                        modelValue: T.file_name,
                                        "onUpdate:modelValue":
                                          v[1] || (v[1] = (e) => (T.file_name = e)),
                                        clearable: "",
                                        placeholder: "文件名",
                                        onKeyup: K(X, ["enter"]),
                                      },
                                      null,
                                      8,
                                      ["modelValue"]
                                    ),
                                  ]),
                                  _: 1,
                                }
                              ),
                              z(N, null, {
                                default: V(() => [
                                  z(
                                    J,
                                    { type: "primary", icon: U(o), onClick: X },
                                    {
                                      default: V(() => [...(v[6] || (v[6] = [$("查询", -1)]))]),
                                      _: 1,
                                    },
                                    8,
                                    ["icon"]
                                  ),
                                  z(
                                    J,
                                    { icon: U(d), onClick: Y },
                                    {
                                      default: V(() => [...(v[7] || (v[7] = [$("重置", -1)]))]),
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
                          J,
                          { type: "primary", icon: U(n), onClick: Z },
                          { default: V(() => [...(v[8] || (v[8] = [$("上传文档", -1)]))]), _: 1 },
                          8,
                          ["icon"]
                        ),
                      ]),
                      H.value || !P.value.length
                        ? (k(), F(I, { key: 0, state: L.value }, null, 8, ["state"]))
                        : (k(),
                          F(
                            de,
                            { key: 1, data: P.value, "row-key": "id", border: "" },
                            {
                              default: V(() => [
                                z(se, {
                                  prop: "file_name",
                                  label: "文件名",
                                  "min-width": "220",
                                  "show-overflow-tooltip": "",
                                }),
                                z(se, { prop: "file_type", label: "类型", width: "90" }),
                                z(
                                  se,
                                  { prop: "file_size", label: "大小", width: "110" },
                                  {
                                    default: V(({ row: e }) => {
                                      return [
                                        $(
                                          B(
                                            ((a = e.file_size),
                                            a < 1024
                                              ? `${a} B`
                                              : a < 1048576
                                                ? `${(a / 1024).toFixed(1)} KB`
                                                : `${(a / 1024 / 1024).toFixed(1)} MB`)
                                          ),
                                          1
                                        ),
                                      ];
                                      var a;
                                    }),
                                    _: 1,
                                  }
                                ),
                                z(
                                  se,
                                  { label: "状态", width: "120" },
                                  {
                                    default: V(({ row: e }) => [
                                      e.error_message
                                        ? (k(),
                                          F(
                                            oe,
                                            { key: 0, content: e.error_message, placement: "top" },
                                            {
                                              default: V(() => [
                                                z(
                                                  ie,
                                                  { type: te(e).type, size: "small" },
                                                  {
                                                    default: V(() => [$(B(te(e).label), 1)]),
                                                    _: 2,
                                                  },
                                                  1032,
                                                  ["type"]
                                                ),
                                              ]),
                                              _: 2,
                                            },
                                            1032,
                                            ["content"]
                                          ))
                                        : (k(),
                                          F(
                                            ie,
                                            { key: 1, type: te(e).type, size: "small" },
                                            { default: V(() => [$(B(te(e).label), 1)]), _: 2 },
                                            1032,
                                            ["type"]
                                          )),
                                    ]),
                                    _: 1,
                                  }
                                ),
                                z(se, { prop: "chunk_count", label: "分块数", width: "90" }),
                                z(se, {
                                  prop: "created_time",
                                  label: "创建时间",
                                  width: "180",
                                  "show-overflow-tooltip": "",
                                }),
                                z(
                                  se,
                                  { label: "操作", width: "160", fixed: "right" },
                                  {
                                    default: V(({ row: e }) => [
                                      z(
                                        J,
                                        {
                                          link: "",
                                          type: "primary",
                                          onClick: (a) =>
                                            (async (e) => {
                                              e.id &&
                                                (await S.reindexDocument(e.id),
                                                w.success("已提交重建"),
                                                await X());
                                            })(e),
                                        },
                                        {
                                          default: V(() => [
                                            ...(v[9] || (v[9] = [$("重新索引", -1)])),
                                          ]),
                                          _: 1,
                                        },
                                        8,
                                        ["onClick"]
                                      ),
                                      z(
                                        J,
                                        {
                                          link: "",
                                          type: "danger",
                                          onClick: (a) =>
                                            (async (e) => {
                                              e.id &&
                                                (await j.confirm(
                                                  `确认删除文档「${e.file_name}」？`,
                                                  "删除确认",
                                                  { type: "warning" }
                                                ),
                                                await S.deleteDocument([e.id]),
                                                w.success("删除成功"),
                                                await X());
                                            })(e),
                                        },
                                        {
                                          default: V(() => [
                                            ...(v[10] || (v[10] = [$("删除", -1)])),
                                          ]),
                                          _: 1,
                                        },
                                        8,
                                        ["onClick"]
                                      ),
                                    ]),
                                    _: 1,
                                  }
                                ),
                              ]),
                              _: 1,
                            },
                            8,
                            ["data"]
                          )),
                      z(
                        ne,
                        {
                          "current-page": T.page_no,
                          "onUpdate:currentPage": v[2] || (v[2] = (e) => (T.page_no = e)),
                          "page-size": T.page_size,
                          "onUpdate:pageSize": v[3] || (v[3] = (e) => (T.page_size = e)),
                          class: "pagination",
                          layout: "total, sizes, prev, pager, next",
                          total: Q.value,
                          onSizeChange: X,
                          onCurrentChange: X,
                        },
                        null,
                        8,
                        ["current-page", "page-size", "total"]
                      ),
                    ]),
                    _: 1,
                  }
                ),
                z(
                  me,
                  {
                    modelValue: R.value,
                    "onUpdate:modelValue": v[5] || (v[5] = (e) => (R.value = e)),
                    title: "上传文档",
                    width: "520px",
                  },
                  {
                    default: V(() => [
                      z(
                        ee,
                        { "label-width": "90px" },
                        {
                          default: V(() => [
                            z(
                              N,
                              { label: "知识库", required: "" },
                              {
                                default: V(() => [
                                  z(
                                    M,
                                    {
                                      modelValue: W.knowledge_base_id,
                                      "onUpdate:modelValue":
                                        v[4] || (v[4] = (e) => (W.knowledge_base_id = e)),
                                      class: "upload-base-select",
                                      filterable: "",
                                      placeholder: "请选择知识库",
                                    },
                                    {
                                      default: V(() => [
                                        (k(!0),
                                        x(
                                          q,
                                          null,
                                          D(
                                            O.value,
                                            (e) => (
                                              k(),
                                              F(
                                                h,
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
                            z(
                              N,
                              { label: "文档", required: "" },
                              {
                                default: V(() => [
                                  z(
                                    ue,
                                    {
                                      drag: "",
                                      "http-request": le,
                                      "show-file-list": !1,
                                      disabled: !W.knowledge_base_id,
                                      accept: ".txt,.md,.pdf,.docx",
                                      "before-upload": ae,
                                    },
                                    {
                                      tip: V(() => [
                                        ...(v[11] ||
                                          (v[11] = [
                                            C(
                                              "div",
                                              { class: "el-upload__tip" },
                                              "支持 .txt、.md、.pdf、.docx",
                                              -1
                                            ),
                                          ])),
                                      ]),
                                      default: V(() => [
                                        z(
                                          pe,
                                          { class: "el-icon--upload" },
                                          { default: V(() => [z(U(n))]), _: 1 }
                                        ),
                                        v[12] ||
                                          (v[12] = C(
                                            "div",
                                            { class: "el-upload__text" },
                                            "点击或拖拽文件上传",
                                            -1
                                          )),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["disabled"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        }
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
    [["__scopeId", "data-v-c7728bd5"]]
  );
export { H as default };
