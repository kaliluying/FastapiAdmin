import { _ as e, u as a, s as t, c as o } from "./query.CFyD4gup.js";
import { _ as i } from "./index.SppbxYir.js";
import { _ as l } from "./index.vue_vue_type_script_setup_true_lang.B21S8Wni.js";
import { e as s, R as r, Q as n } from "./element-plus.BPg5EhXK.js";
import { b as p, _ as d, r as m } from "./useTableColumns.BKMFwI8S.js";
import { _ as c, a as u, c as g, b as f } from "./index.E8bA6rDJ.js";
import {
  z as h,
  ag as y,
  p as _,
  w as b,
  m as v,
  bu as j,
  bo as w,
  aI as x,
  X as k,
  bt as C,
  a4 as P,
  n as V,
  v as S,
  al as T,
  j as R,
  ai as z,
} from "./vue-vendor.Dwx3gfQr.js";
import { F as A } from "./index.C8JPqYJk.js";
import { u as D } from "./useTable.DG3aa8Ve.js";
import { d as q, u as F, c as U, a as O } from "./useConfirm.CXh1xjds.js";
import { u as B } from "./useCrudForm.C163p_GE.js";
import { a1 as W, P as L } from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./exceljs.CGWu2obp.js";
import "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./ohash.BS5RKZcF.js";
import "./vue-draggable-plus.B5VWpxKS.js";
import "./@intlify.CbtlSmdZ.js";
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
const E = { class: "fa-full-height" },
  I = { class: "fa-management-page" },
  Q = h({
    name: "Params",
    inheritAttrs: !1,
    __name: "index",
    setup(h) {
      const Q = W(),
        { hasAuth: X } = p();
      function G(e) {
        const a = o({ ...e });
        return (
          "true" === a.config_type || !0 === a.config_type
            ? (a.config_type = !0)
            : ("false" !== a.config_type && !1 !== a.config_type) || (a.config_type = !1),
          a
        );
      }
      const H = T({
          config_name: void 0,
          config_key: void 0,
          config_type: void 0,
          status: void 0,
          created_time: void 0,
        }),
        K = T(!0),
        N = T(null),
        J = {},
        M = T([
          { label: "是", value: "true" },
          { label: "否", value: "false" },
        ]),
        Y = R(() => [
          {
            label: "配置名称",
            key: "config_name",
            type: "input",
            placeholder: "请输入配置名称",
            clearable: !0,
            span: 6,
          },
          {
            label: "配置键名",
            key: "config_key",
            type: "input",
            placeholder: "请输入配置键名",
            clearable: !0,
            span: 6,
          },
          {
            label: "系统内置",
            key: "config_type",
            type: "select",
            props: { placeholder: "请选择系统内置", options: M.value, clearable: !0 },
            span: 6,
          },
          {
            label: "状态",
            key: "status",
            type: "select",
            props: {
              placeholder: "请选择状态",
              options: [
                { label: "启用", value: 0 },
                { label: "停用", value: 1 },
              ],
              clearable: !0,
            },
            span: 6,
          },
        ]),
        Z = T(null),
        { selectedRows: $, selectedIds: ee, batchDeleting: ae, onTableSelectionChange: te } = q(),
        oe = T(!1),
        { dialogVisible: ie } = F(),
        le = T({}),
        se = [
          { label: "配置名称", prop: "config_name" },
          {
            label: "系统内置",
            prop: "config_type",
            tag: {
              map: { true: { type: "success", text: "是" }, false: { type: "danger", text: "否" } },
            },
          },
          { label: "配置键", prop: "config_key" },
          { label: "配置值", prop: "config_value" },
          { label: "描述", prop: "description" },
          { label: "创建时间", prop: "created_time" },
          { label: "更新时间", prop: "updated_time" },
        ],
        re = T({
          id: void 0,
          config_name: "",
          config_key: "",
          config_value: "",
          config_type: !1,
          description: "",
        }),
        ne = z({
          config_name: [{ required: !0, message: "请输入系统配置名称", trigger: "blur" }],
          config_key: [{ required: !0, message: "请输入系统配置键", trigger: "blur" }],
          config_value: [{ required: !0, message: "请输入系统配置值", trigger: "blur" }],
          config_type: [{ required: !0, message: "请选择系统配置类型", trigger: "blur" }],
        }),
        pe = T(null),
        de = T(0),
        {
          submitLoading: me,
          handleCloseDialog: ce,
          handleOpenDialog: ue,
          handleSubmit: ge,
        } = B({
          formData: re,
          initialFormData: {
            id: void 0,
            config_name: "",
            config_key: "",
            config_value: "",
            config_type: !1,
            description: "",
          },
          dialogVisible: ie,
          dataFormRef: pe,
          formRenderKey: de,
          detailApi: L.detailParams,
          createApi: L.createParams,
          updateApi: L.updateParams,
          titles: { create: "新增系统配置", update: "修改系统配置", detail: "系统配置详情" },
          detailFormData: le,
          onCreateSuccess: async () => {
            await Te();
          },
          onUpdateSuccess: async () => {
            await Re();
          },
          onSubmitSuccess: async () => {
            ((Q.isConfigLoaded = !1), await Q.getConfig());
          },
        });
      async function fe() {
        oe.value = !0;
        try {
          await ue("create");
        } finally {
          oe.value = !1;
        }
      }
      const he = R(() => [
          {
            label: "配置名称",
            key: "config_name",
            type: "input",
            span: 24,
            props: { placeholder: "请输入配置名称", maxlength: 50 },
          },
          {
            label: "配置键",
            key: "config_key",
            type: "input",
            span: 24,
            props: { placeholder: "请输入配置键", maxlength: 50 },
          },
          {
            label: "配置值",
            key: "config_value",
            type: "input",
            span: 24,
            props: { placeholder: "请输入配置值", maxlength: 100 },
          },
          { label: "系统内置", key: "config_type", type: "input", span: 24, placeholder: "" },
          {
            label: "描述",
            key: "description",
            type: "input",
            span: 24,
            props: {
              type: "textarea",
              rows: 4,
              maxlength: 100,
              showWordLimit: !0,
              placeholder: "请输入描述",
            },
          },
        ]),
        {
          columns: ye,
          columnChecks: _e,
          data: be,
          loading: ve,
          pagination: je,
          searchParams: we,
          getData: xe,
          replaceSearchParams: ke,
          resetSearchParams: Ce,
          handleSizeChange: Pe,
          handleCurrentChange: Ve,
          refreshData: Se,
          refreshCreate: Te,
          refreshUpdate: Re,
          refreshRemove: ze,
        } = D({
          core: {
            apiFn: L.listParams,
            apiParams: { page_no: 1, page_size: 10 },
            columnsFactory: () => [
              { type: "selection", width: 48, fixed: "left" },
              { type: "globalIndex", width: 56, label: "序号" },
              { prop: "config_name", label: "配置名称", minWidth: 120, showOverflowTooltip: !0 },
              { prop: "config_key", label: "配置键", minWidth: 200, showOverflowTooltip: !0 },
              { prop: "config_value", label: "配置值", minWidth: 200, showOverflowTooltip: !0 },
              {
                prop: "config_type",
                label: "系统内置",
                minWidth: 100,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              { prop: "description", label: "描述", minWidth: 120, showOverflowTooltip: !0 },
              { prop: "created_time", label: "创建时间", width: 168, showOverflowTooltip: !0 },
              { prop: "updated_time", label: "更新时间", width: 168, showOverflowTooltip: !0 },
              {
                prop: "operation",
                label: "操作",
                width: 220,
                fixed: "right",
                align: "right",
                formatter: (e) =>
                  (function (e) {
                    return m(
                      (function (e) {
                        const a = [
                          {
                            key: "detail",
                            label: "详情",
                            artType: "view",
                            perm: "module_system:param:detail",
                            run: () => {
                              null != e.id && ue("detail", e.id);
                            },
                          },
                          {
                            key: "edit",
                            label: "编辑",
                            artType: "edit",
                            icon: "ri:edit-2-line",
                            perm: "module_system:param:update",
                            run: () => {
                              null != e.id && ue("update", e.id);
                            },
                          },
                          {
                            key: "delete",
                            label: "删除",
                            artType: "delete",
                            icon: "ri:delete-bin-4-line",
                            perm: "module_system:param:delete",
                            run: () => {
                              null != e.id &&
                                (async function (e) {
                                  try {
                                    (await O(),
                                      await L.deleteParams([e]),
                                      (Q.isConfigLoaded = !1),
                                      await Q.getConfig(),
                                      Z.value?.elTableRef?.clearSelection(),
                                      await ze());
                                  } catch {}
                                })(e.id);
                            },
                          },
                        ];
                        return a.filter((e) => null != e.perm && X(e.perm));
                      })(e),
                      {
                        wrapperClass:
                          "inline-flex flex-wrap items-center justify-end gap-1 param-table-actions",
                      }
                    );
                  })(e),
              },
            ],
          },
        }),
        Ae = R(() =>
          ye.value.map((e) => {
            const a = e.type;
            return {
              prop: e.prop,
              label: e.label,
              type: "selection" === a ? "selection" : "default",
              show: !0,
            };
          })
        ),
        De = R(() => G(t(we))),
        qe = R(() => ({
          permPrefix: "module_system:param",
          cols: Ae.value,
          exportsBlobAction: async (e) => {
            const a = G({ ...De.value, ...e });
            return (await L.exportParams(a)).data;
          },
        })),
        { exportVisible: Fe, openExport: Ue } = a();
      async function Oe(e) {
        var a;
        (await N.value?.validate?.(),
          ke({
            config_name: (a = e).config_name,
            config_key: a.config_key,
            config_type: a.config_type,
            status: a.status,
            created_time:
              Array.isArray(a.created_time) && 2 === a.created_time.length
                ? a.created_time
                : void 0,
          }),
          xe());
      }
      function Be() {
        ((H.value = {
          config_name: void 0,
          config_key: void 0,
          config_type: void 0,
          status: void 0,
          created_time: void 0,
        }),
          Ce());
      }
      async function We() {
        const e = ee.value;
        if (0 !== e.length)
          try {
            (await U(e.length),
              (ae.value = !0),
              await L.deleteParams(e),
              (Q.isConfigLoaded = !1),
              await Q.getConfig(),
              Z.value?.elTableRef?.clearSelection(),
              await ze());
          } catch {
          } finally {
            ae.value = !1;
          }
      }
      return (a, t) => {
        const o = c,
          p = g,
          m = u,
          h = f,
          T = s,
          R = d,
          z = n,
          D = r,
          q = l,
          F = i,
          U = e;
        return (
          y(),
          _("div", E, [
            b(A, { title: "参数配置" }),
            v("div", I, [
              j(
                b(
                  o,
                  {
                    ref_key: "searchBarRef",
                    ref: N,
                    modelValue: x(H),
                    "onUpdate:modelValue": t[0] || (t[0] = (e) => (k(H) ? (H.value = e) : null)),
                    items: x(Y),
                    rules: J,
                    "is-expand": !1,
                    "show-expand": !0,
                    "show-reset": !0,
                    "show-search": !0,
                    "disabled-search": !1,
                    "default-expanded": !1,
                    "include-audit": "",
                    onSearch: Oe,
                    onReset: Be,
                  },
                  null,
                  8,
                  ["modelValue", "items"]
                ),
                [[w, x(K)]]
              ),
              b(
                T,
                {
                  shadow: "hover",
                  class: "fa-table-card",
                  style: P({ "margin-top": x(K) ? "12px" : "0" }),
                },
                {
                  default: C(() => [
                    b(
                      m,
                      {
                        columns: x(_e),
                        "onUpdate:columns": t[1] || (t[1] = (e) => (k(_e) ? (_e.value = e) : null)),
                        showSearchBar: x(K),
                        "onUpdate:showSearchBar":
                          t[2] || (t[2] = (e) => (k(K) ? (K.value = e) : null)),
                        loading: x(ve),
                        onRefresh: x(Se),
                      },
                      {
                        left: C(() => [
                          b(
                            p,
                            {
                              "remove-ids": x(ee),
                              "perm-create": ["module_system:param:create"],
                              "perm-export": ["module_system:param:export"],
                              "perm-delete": ["module_system:param:delete"],
                              "delete-loading": x(ae),
                              "create-loading": x(oe),
                              onAdd: fe,
                              onExport: x(Ue),
                              onDelete: We,
                            },
                            null,
                            8,
                            ["remove-ids", "delete-loading", "create-loading", "onExport"]
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["columns", "showSearchBar", "loading", "onRefresh"]
                    ),
                    b(
                      h,
                      {
                        ref_key: "faTableRef",
                        ref: Z,
                        loading: x(ve),
                        data: x(be),
                        columns: x(ye),
                        pagination: x(je),
                        onSelectionChange: x(te),
                        "onPagination:sizeChange": x(Pe),
                        "onPagination:currentChange": x(Ve),
                      },
                      null,
                      8,
                      [
                        "loading",
                        "data",
                        "columns",
                        "pagination",
                        "onSelectionChange",
                        "onPagination:sizeChange",
                        "onPagination:currentChange",
                      ]
                    ),
                  ]),
                  _: 1,
                },
                8,
                ["style"]
              ),
              b(
                F,
                {
                  modelValue: x(ie).visible,
                  "onUpdate:modelValue": t[5] || (t[5] = (e) => (x(ie).visible = e)),
                  title: x(ie).title,
                  width: "640px",
                  "dialog-class": "crud-embed-dialog",
                  "modal-class": "crud-embed-dialog",
                  "form-mode": x(ie).type,
                  "confirm-loading": x(me),
                  onCancel: x(ce),
                  onConfirm: t[6] || (t[6] = (e) => ("detail" === x(ie).type ? x(ce)() : x(ge)())),
                },
                {
                  default: C(() => [
                    "detail" === x(ie).type
                      ? (y(),
                        V(
                          R,
                          { key: 0, column: 4, data: x(le), items: se, "max-height": "75vh" },
                          null,
                          8,
                          ["data"]
                        ))
                      : (y(),
                        V(
                          q,
                          {
                            key: x(de),
                            scrollbar: "",
                            "max-height": "75vh",
                            ref_key: "dataFormRef",
                            ref: pe,
                            modelValue: x(re),
                            "onUpdate:modelValue":
                              t[4] || (t[4] = (e) => (k(re) ? (re.value = e) : null)),
                            items: x(he),
                            rules: x(ne),
                            "label-suffix": ":",
                            "label-width": 100,
                            "label-position": "right",
                            span: 24,
                            gutter: 16,
                            "show-reset": !1,
                            "show-submit": !1,
                            class: "crud-dialog-art-form",
                          },
                          {
                            config_type: C(() => [
                              b(
                                D,
                                {
                                  modelValue: x(re).config_type,
                                  "onUpdate:modelValue":
                                    t[3] || (t[3] = (e) => (x(re).config_type = e)),
                                },
                                {
                                  default: C(() => [
                                    b(
                                      z,
                                      { value: !0 },
                                      {
                                        default: C(() => [...(t[8] || (t[8] = [S("是", -1)]))]),
                                        _: 1,
                                      }
                                    ),
                                    b(
                                      z,
                                      { value: !1 },
                                      {
                                        default: C(() => [...(t[9] || (t[9] = [S("否", -1)]))]),
                                        _: 1,
                                      }
                                    ),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["modelValue"]
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["modelValue", "items", "rules"]
                        )),
                  ]),
                  _: 1,
                },
                8,
                ["modelValue", "title", "form-mode", "confirm-loading", "onCancel"]
              ),
              b(
                U,
                {
                  modelValue: x(Fe),
                  "onUpdate:modelValue": t[7] || (t[7] = (e) => (k(Fe) ? (Fe.value = e) : null)),
                  "content-config": x(qe),
                  "query-params": x(De),
                  "page-data": x(be),
                  "selection-data": x($),
                },
                null,
                8,
                ["modelValue", "content-config", "query-params", "page-data", "selection-data"]
              ),
            ]),
          ])
        );
      };
    },
  });
export { Q as default };
