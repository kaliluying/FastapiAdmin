import { _ as e, u as t, s as a, c as i } from "./query.CFyD4gup.js";
import { _ as l } from "./index.SppbxYir.js";
import { _ as s } from "./index.vue_vue_type_script_setup_true_lang.B21S8Wni.js";
import { e as o, R as r, Q as n, J as p } from "./element-plus.BPg5EhXK.js";
import { b as d, _ as c, r as m } from "./useTableColumns.BKMFwI8S.js";
import { _ as u, a as y, c as h, b as g } from "./index.E8bA6rDJ.js";
import {
  z as _,
  ag as f,
  p as b,
  w as v,
  m as j,
  bu as w,
  bo as x,
  aI as D,
  X as k,
  bt as C,
  a4 as T,
  n as V,
  v as S,
  o as R,
  al as z,
  j as A,
  ai as F,
  G as P,
} from "./vue-vendor.Dwx3gfQr.js";
import { F as U } from "./index.C8JPqYJk.js";
import { u as q } from "./useTable.DG3aa8Ve.js";
import { d as O, u as B, c as E, b as I, a as W } from "./useConfirm.CXh1xjds.js";
import { u as Q } from "./useCrudForm.C163p_GE.js";
import { a2 as G, c as L } from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { _ as X, r as H } from "./statusFormatter.Df4Q0iE9.js";
import J from "./DataDrawer.CGfy4i5e.js";
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
import "./index.BpYlApL9.js";
const K = { class: "fa-full-height" },
  M = { class: "fa-management-page" },
  N = _({
    name: "Dict",
    inheritAttrs: !1,
    __name: "index",
    setup(_) {
      const N = G(),
        { hasAuth: Y } = d(),
        Z = z({
          dict_name: void 0,
          dict_type: void 0,
          status: void 0,
          created_time: void 0,
          updated_time: void 0,
        }),
        $ = z(!0),
        ee = z(null),
        te = {},
        ae = z([
          { label: "启用", value: 0 },
          { label: "停用", value: 1 },
        ]),
        ie = A(() => [
          {
            label: "字典名称",
            key: "dict_name",
            type: "input",
            placeholder: "请输入字典名称",
            clearable: !0,
            span: 6,
          },
          {
            label: "字典类型",
            key: "dict_type",
            type: "input",
            placeholder: "请输入字典类型",
            clearable: !0,
            span: 6,
          },
          {
            label: "状态",
            key: "status",
            type: "select",
            props: { placeholder: "请选择状态", options: ae.value, clearable: !0 },
            span: 6,
          },
        ]),
        le = z(null),
        { selectedRows: se, selectedIds: oe, batchDeleting: re, onTableSelectionChange: ne } = O(),
        pe = z(!1),
        de = z(!1),
        { dialogVisible: ce } = B(),
        me = z({}),
        ue = [
          { label: "字典名称", prop: "dict_name" },
          { label: "字典类型", prop: "dict_type", slot: "dict_type" },
          {
            label: "状态",
            prop: "status",
            tag: {
              map: { 0: { type: "success", text: "启用" }, 1: { type: "danger", text: "停用" } },
            },
          },
          { label: "描述", prop: "description" },
          { label: "创建时间", prop: "created_time" },
          { label: "更新时间", prop: "updated_time" },
        ],
        ye = z({ id: void 0, dict_name: "", dict_type: "", status: 0, description: void 0 }),
        he = F({
          dict_name: [{ required: !0, message: "请输入字典名称", trigger: "blur" }],
          dict_type: [{ required: !0, message: "请选择字典类型", trigger: "blur" }],
          status: [{ required: !0, message: "请选择字典状态", trigger: "blur" }],
        }),
        ge = z(null),
        _e = z(0),
        {
          submitLoading: fe,
          handleCloseDialog: be,
          handleOpenDialog: ve,
          handleSubmit: je,
        } = Q({
          formData: ye,
          initialFormData: {
            id: void 0,
            dict_name: "",
            dict_type: "",
            status: 0,
            description: void 0,
          },
          dialogVisible: ce,
          dataFormRef: ge,
          formRenderKey: _e,
          detailApi: L.detailDictType,
          createApi: L.createDictType,
          updateApi: L.updateDictType,
          titles: { create: "新增字典", update: "修改字典", detail: "字典详情" },
          detailFormData: me,
          onCreateSuccess: async () => {
            await qe();
          },
          onUpdateSuccess: async () => {
            await Oe();
          },
          onSubmitSuccess: async () => {
            (N.clearDictData(), ye.value.dict_type && (await N.getDict([ye.value.dict_type])));
          },
        });
      async function we() {
        pe.value = !0;
        try {
          await ve("create");
        } finally {
          pe.value = !1;
        }
      }
      const xe = A(() => [
          {
            label: "字典名称",
            key: "dict_name",
            type: "input",
            span: 24,
            props: { placeholder: "请输入字典名称", maxlength: 50 },
          },
          {
            label: "字典类型",
            key: "dict_type",
            type: "input",
            span: 24,
            props: { placeholder: "请输入字典类型", maxlength: 50 },
          },
          { label: "状态", key: "status", type: "input", span: 24, placeholder: "" },
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
          columns: De,
          columnChecks: ke,
          data: Ce,
          loading: Te,
          pagination: Ve,
          searchParams: Se,
          getData: Re,
          replaceSearchParams: ze,
          resetSearchParams: Ae,
          handleSizeChange: Fe,
          handleCurrentChange: Pe,
          refreshData: Ue,
          refreshCreate: qe,
          refreshUpdate: Oe,
          refreshRemove: Be,
        } = q({
          core: {
            apiFn: L.listDictType,
            apiParams: { page_no: 1, page_size: 10 },
            columnsFactory: H(() => [
              { type: "selection", width: 48, fixed: "left" },
              { type: "globalIndex", width: 56, label: "序号" },
              { prop: "dict_name", label: "字典名称", minWidth: 140, showOverflowTooltip: !0 },
              {
                prop: "dict_type",
                label: "字典类型",
                minWidth: 180,
                formatter: (e) => P(X, { type: "primary", label: e.dict_type ?? "" }),
              },
              {
                prop: "status",
                label: "状态",
                width: 88,
                status: {
                  0: { type: "success", text: "启用" },
                  1: { type: "danger", text: "停用" },
                },
              },
              { prop: "description", label: "描述", minWidth: 140, showOverflowTooltip: !0 },
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
                        const t = [
                          {
                            key: "dictData",
                            label: "字典",
                            artType: "view",
                            icon: "ri:book-2-line",
                            iconColor: "var(--el-color-warning)",
                            perm: "module_system:dict_data:query",
                            run: () => {
                              return (
                                (t = e),
                                (Xe.value = t.dict_type || ""),
                                (He.value = t.dict_name || ""),
                                (Je.value = t.id ?? 0),
                                void (Le.value = !0)
                              );
                              var t;
                            },
                          },
                          {
                            key: "detail",
                            label: "详情",
                            artType: "view",
                            perm: "module_system:dict_type:detail",
                            run: () => {
                              ve("detail", e.id);
                            },
                          },
                          {
                            key: "edit",
                            label: "编辑",
                            artType: "edit",
                            icon: "ri:edit-2-line",
                            perm: "module_system:dict_type:update",
                            run: () => {
                              ve("update", e.id);
                            },
                          },
                          {
                            key: "delete",
                            label: "删除",
                            artType: "delete",
                            icon: "ri:delete-bin-4-line",
                            perm: "module_system:dict_type:delete",
                            run: () => {
                              null != e.id &&
                                (async function (e) {
                                  try {
                                    (await W(), await L.deleteDictType([e]), N.clearDictData());
                                    const t = Object.keys(N.dictData);
                                    (t.length > 0 && (await N.getDict(t)),
                                      le.value?.elTableRef?.clearSelection(),
                                      await Be());
                                  } catch {}
                                })(e.id);
                            },
                          },
                        ];
                        return t.filter((e) => null != e.perm && Y(e.perm));
                      })(e),
                      {
                        wrapperClass:
                          "inline-flex flex-wrap items-center justify-end gap-1 dict-table-actions",
                      }
                    );
                  })(e),
              },
            ]),
          },
        }),
        Ee = A(() =>
          De.value.map((e) => {
            const t = e.type;
            return {
              prop: e.prop,
              label: e.label,
              type: "selection" === t ? "selection" : "default",
              show: !0,
            };
          })
        ),
        Ie = A(() => {
          const e = a(Se);
          return i(e);
        }),
        We = A(() => ({
          permPrefix: "module_system:dict_type",
          cols: Ee.value,
          exportsBlobAction: async (e) => {
            const t = i({ ...Ie.value, ...e });
            return (await L.exportDictType(t)).data;
          },
        })),
        { exportVisible: Qe, openExport: Ge } = t(),
        Le = z(!1),
        Xe = z(""),
        He = z(""),
        Je = z(0);
      async function Ke(e) {
        (await ee.value?.validate?.(),
          ze({
            dict_name: e.dict_name,
            dict_type: e.dict_type,
            status: e.status,
            created_time:
              Array.isArray(e.created_time) && 2 === e.created_time.length
                ? e.created_time
                : void 0,
          }),
          Re());
      }
      function Me() {
        ((Z.value = { dict_name: void 0, dict_type: void 0, status: void 0, created_time: void 0 }),
          Ae());
      }
      async function Ne() {
        const e = oe.value;
        if (0 !== e.length)
          try {
            (await E(e.length), (re.value = !0), await L.deleteDictType(e), N.clearDictData());
            const t = Object.keys(N.dictData);
            (t.length > 0 && (await N.getDict(t)),
              le.value?.elTableRef?.clearSelection(),
              await Be());
          } catch {
          } finally {
            re.value = !1;
          }
      }
      async function Ye(e) {
        const t = oe.value;
        if (t.length)
          try {
            (await I(e),
              (de.value = !0),
              await L.batchDictType({ ids: t, status: e }),
              await Ue(),
              N.clearDictData());
            const a = Object.keys(N.dictData);
            a.length > 0 && (await N.getDict(a));
          } catch {
          } finally {
            de.value = !1;
          }
        else p.warning("请先选择要操作的数据");
      }
      return (t, a) => {
        const i = u,
          p = h,
          d = y,
          m = g,
          _ = o,
          z = c,
          A = n,
          F = r,
          P = s,
          q = l,
          O = e;
        return (
          f(),
          b("div", K, [
            v(U, { title: "字典管理" }),
            j("div", M, [
              w(
                v(
                  i,
                  {
                    ref_key: "searchBarRef",
                    ref: ee,
                    modelValue: D(Z),
                    "onUpdate:modelValue": a[0] || (a[0] = (e) => (k(Z) ? (Z.value = e) : null)),
                    items: D(ie),
                    rules: te,
                    "is-expand": !1,
                    "show-expand": !0,
                    "show-reset": !0,
                    "show-search": !0,
                    "disabled-search": !1,
                    "default-expanded": !1,
                    "include-audit": "",
                    onSearch: Ke,
                    onReset: Me,
                  },
                  null,
                  8,
                  ["modelValue", "items"]
                ),
                [[x, D($)]]
              ),
              v(
                _,
                {
                  shadow: "hover",
                  class: "fa-table-card",
                  style: T({ "margin-top": D($) ? "12px" : "0" }),
                },
                {
                  default: C(() => [
                    v(
                      d,
                      {
                        columns: D(ke),
                        "onUpdate:columns": a[1] || (a[1] = (e) => (k(ke) ? (ke.value = e) : null)),
                        showSearchBar: D($),
                        "onUpdate:showSearchBar":
                          a[2] || (a[2] = (e) => (k($) ? ($.value = e) : null)),
                        loading: D(Te),
                        onRefresh: D(Ue),
                      },
                      {
                        left: C(() => [
                          v(
                            p,
                            {
                              "remove-ids": D(oe),
                              "perm-create": ["module_system:dict_type:create"],
                              "perm-export": ["module_system:dict_type:export"],
                              "perm-delete": ["module_system:dict_type:delete"],
                              "perm-patch": ["module_system:dict_type:patch"],
                              "delete-loading": D(re),
                              "create-loading": D(pe),
                              "more-loading": D(de),
                              onAdd: we,
                              onExport: D(Ge),
                              onDelete: Ne,
                              onMore: Ye,
                            },
                            null,
                            8,
                            [
                              "remove-ids",
                              "delete-loading",
                              "create-loading",
                              "more-loading",
                              "onExport",
                            ]
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["columns", "showSearchBar", "loading", "onRefresh"]
                    ),
                    v(
                      m,
                      {
                        ref_key: "faTableRef",
                        ref: le,
                        loading: D(Te),
                        data: D(Ce),
                        columns: D(De),
                        pagination: D(Ve),
                        onSelectionChange: D(ne),
                        "onPagination:sizeChange": D(Fe),
                        "onPagination:currentChange": D(Pe),
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
              v(
                q,
                {
                  modelValue: D(ce).visible,
                  "onUpdate:modelValue": a[5] || (a[5] = (e) => (D(ce).visible = e)),
                  title: D(ce).title,
                  width: "640px",
                  "dialog-class": "crud-embed-dialog",
                  "modal-class": "crud-embed-dialog",
                  "form-mode": D(ce).type,
                  "confirm-loading": D(fe),
                  onCancel: D(be),
                  onConfirm: a[6] || (a[6] = (e) => ("detail" === D(ce).type ? D(be)() : D(je)())),
                },
                {
                  default: C(() => [
                    "detail" === D(ce).type
                      ? (f(),
                        V(
                          z,
                          { key: 0, column: 2, data: D(me), items: ue, "max-height": "70vh" },
                          {
                            dict_type: C(({ row: e }) => [
                              v(X, { type: "primary", label: e?.dict_type }, null, 8, ["label"]),
                            ]),
                            _: 1,
                          },
                          8,
                          ["data"]
                        ))
                      : (f(),
                        V(
                          P,
                          {
                            key: D(_e),
                            scrollbar: "",
                            "max-height": "70vh",
                            ref_key: "dataFormRef",
                            ref: ge,
                            modelValue: D(ye),
                            "onUpdate:modelValue":
                              a[4] || (a[4] = (e) => (k(ye) ? (ye.value = e) : null)),
                            items: D(xe),
                            rules: D(he),
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
                            status: C(() => [
                              v(
                                F,
                                {
                                  modelValue: D(ye).status,
                                  "onUpdate:modelValue": a[3] || (a[3] = (e) => (D(ye).status = e)),
                                },
                                {
                                  default: C(() => [
                                    v(
                                      A,
                                      { value: 0 },
                                      {
                                        default: C(() => [...(a[9] || (a[9] = [S("启用", -1)]))]),
                                        _: 1,
                                      }
                                    ),
                                    v(
                                      A,
                                      { value: 1 },
                                      {
                                        default: C(() => [...(a[10] || (a[10] = [S("停用", -1)]))]),
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
              v(
                O,
                {
                  modelValue: D(Qe),
                  "onUpdate:modelValue": a[7] || (a[7] = (e) => (k(Qe) ? (Qe.value = e) : null)),
                  "content-config": D(We),
                  "query-params": D(Ie),
                  "page-data": D(Ce),
                  "selection-data": D(se),
                },
                null,
                8,
                ["modelValue", "content-config", "query-params", "page-data", "selection-data"]
              ),
              D(Le)
                ? (f(),
                  V(
                    J,
                    {
                      key: 0,
                      modelValue: D(Le),
                      "onUpdate:modelValue":
                        a[8] || (a[8] = (e) => (k(Le) ? (Le.value = e) : null)),
                      "dict-type": D(Xe),
                      "dict-label": D(He),
                      "dict-type-id": D(Je),
                    },
                    null,
                    8,
                    ["modelValue", "dict-type", "dict-label", "dict-type-id"]
                  ))
                : R("", !0),
            ]),
          ])
        );
      };
    },
  });
export { N as default };
