import { _ as e } from "./index.SppbxYir.js";
import { _ as a } from "./index.vue_vue_type_script_setup_true_lang.B21S8Wni.js";
import { d as t, e as l, R as s, Q as i, J as o } from "./element-plus.BPg5EhXK.js";
import { b as r, f as n, _ as d, r as p } from "./useTableColumns.BKMFwI8S.js";
import { _ as m, a as u, c, b as h } from "./index.E8bA6rDJ.js";
import {
  z as f,
  ac as g,
  ar as v,
  ag as y,
  p as b,
  w,
  m as j,
  bu as _,
  bo as x,
  aI as k,
  X as D,
  bt as C,
  n as A,
  v as V,
  ax as S,
  a4 as T,
  al as R,
  j as U,
  ai as z,
  a1 as F,
} from "./vue-vendor.Dwx3gfQr.js";
import { F as I } from "./index.C8JPqYJk.js";
import { d as O, u as q, c as B, b as E, a as W } from "./useConfirm.CXh1xjds.js";
import { u as L } from "./useCrudForm.C163p_GE.js";
import { D as P } from "./dept.qQ6KULTg.js";
import { a6 as Q, q as Z } from "./index.CJ_YH8gZ.js";
import "./file-saver.CjVB4eGa.js";
import { r as G } from "./statusFormatter.Df4Q0iE9.js";
import "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./dayjs.BHSg66Ch.js";
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
const H = { class: "fa-full-height" },
  J = { class: "fa-management-page" },
  K = { class: "inline-flex flex-wrap items-center gap-2" },
  M = f({
    name: "Dept",
    inheritAttrs: !1,
    __name: "index",
    setup(f) {
      const { hasAuth: M } = r(),
        N = Q();
      function X(e, a) {
        const t = (function (e, a) {
          return [
            {
              key: "add",
              label: "新增",
              artType: "add",
              perm: "module_system:dept:create",
              run: () => a.onAddChild(e.id),
            },
            {
              key: "detail",
              label: "详情",
              artType: "view",
              perm: "module_system:dept:detail",
              run: () => a.onDetail(e.id),
            },
            {
              key: "edit",
              label: "编辑",
              artType: "edit",
              perm: "module_system:dept:update",
              run: () => a.onEdit(e.id),
            },
            {
              key: "delete",
              label: "删除",
              artType: "delete",
              perm: "module_system:dept:delete",
              run: () => a.onDelete(e.id),
            },
          ].filter((e) => null != e.perm && M(e.perm));
        })(e, a);
        return p(t, {
          wrapperClass: "inline-flex flex-wrap items-center justify-end gap-1 dept-table-actions",
        });
      }
      const $ = R({ name: void 0, status: void 0, created_time: void 0 }),
        Y = R(!0),
        ee = R(null),
        ae = {},
        te = R([
          { label: "启用", value: 0 },
          { label: "停用", value: 1 },
        ]),
        le = U(() => [
          {
            label: "部门名称",
            key: "name",
            type: "input",
            placeholder: "请输入部门名称",
            clearable: !0,
            span: 6,
          },
          {
            label: "状态",
            key: "status",
            type: "select",
            props: { placeholder: "请选择状态", options: te.value, clearable: !0 },
            span: 6,
          },
        ]),
        se = R(null),
        ie = R([]),
        oe = R(!1),
        re = R(!1),
        ne = R([]),
        { selectedRows: de, selectedIds: pe, batchDeleting: me, onTableSelectionChange: ue } = O(),
        ce = R(!1),
        he = R(!1);
      async function fe() {
        oe.value = !0;
        try {
          const a =
            (
              await P.listDept(
                ((e = $.value),
                {
                  name: e.name,
                  status: e.status,
                  created_time:
                    Array.isArray(e.created_time) && 2 === e.created_time.length
                      ? e.created_time
                      : void 0,
                })
              )
            ).data.data || [];
          ((ie.value = a), (ne.value = Z(a)));
        } catch (a) {
        } finally {
          oe.value = !1;
        }
        var e;
      }
      const { dialogVisible: ge } = q(),
        ve = R({ code: "" }),
        ye = [
          { label: "部门名称", prop: "name" },
          { label: "部门编码", prop: "code" },
          { label: "上级部门", prop: "parent_name" },
          {
            label: "状态",
            prop: "status",
            tag: {
              map: { 0: { type: "success", text: "启用" }, 1: { type: "danger", text: "停用" } },
            },
          },
          { label: "排序", prop: "order" },
          { label: "创建时间", prop: "created_time" },
          { label: "更新时间", prop: "updated_time" },
          { label: "描述", prop: "description", span: 4 },
        ],
        be = R({
          id: void 0,
          name: void 0,
          code: "",
          order: 1,
          parent_id: void 0,
          status: 0,
          description: void 0,
        }),
        we = z({
          name: [{ required: !0, message: "请输入部门名称", trigger: "blur" }],
          code: [
            { required: !0, message: "请输入部门编码", trigger: "blur" },
            {
              pattern: /^[A-Za-z][A-Za-z0-9_]{1,15}$/,
              message: "字母开头，2-16位字母/数字/下划线",
              trigger: "blur",
            },
          ],
          order: [{ required: !0, message: "请输入排序", trigger: "blur" }],
          status: [{ required: !0, message: "请选择状态", trigger: "blur" }],
        }),
        je = R(null),
        _e = R(0),
        {
          submitLoading: xe,
          handleCloseDialog: ke,
          handleOpenDialog: De,
          handleSubmit: Ce,
        } = L({
          formData: be,
          initialFormData: {
            id: void 0,
            name: void 0,
            code: "",
            order: 1,
            parent_id: void 0,
            status: 0,
            description: void 0,
          },
          dialogVisible: ge,
          dataFormRef: je,
          formRenderKey: _e,
          detailApi: P.detailDept,
          createApi: P.createDept,
          updateApi: P.updateDept,
          titles: { create: "新增部门", update: "修改部门", detail: "部门详情" },
          detailFormData: ve,
          onCreateSuccess: async () => {
            await fe();
          },
          onUpdateSuccess: async () => {
            await fe();
          },
          onSubmitSuccess: async () => {
            await N.getUserInfo();
          },
        });
      async function Ae() {
        ce.value = !0;
        try {
          await De("create");
        } finally {
          ce.value = !1;
        }
      }
      const Ve = {
          onAddChild: (e) => {
            De("create", void 0, { parent_id: e });
          },
          onDetail: (e) => {
            De("detail", e);
          },
          onEdit: (e) => {
            De("update", e);
          },
          onDelete: async function (e) {
            try {
              (await W(),
                await P.deleteDept([e]),
                await N.getUserInfo(),
                (de.value = []),
                await fe());
            } catch {}
          },
        },
        { columnChecks: Se, columns: Te } = n(
          G(() => [
            { type: "selection", width: 48, fixed: "left" },
            { type: "globalIndex", width: 56, label: "序号" },
            { prop: "name", label: "部门名称", minWidth: 120, showOverflowTooltip: !0 },
            { prop: "code", label: "部门编码", minWidth: 120, showOverflowTooltip: !0 },
            {
              prop: "status",
              label: "状态",
              width: 88,
              status: { 0: { type: "success", text: "启用" }, 1: { type: "danger", text: "停用" } },
            },
            { prop: "order", label: "排序", width: 88, showOverflowTooltip: !0 },
            { prop: "description", label: "描述", minWidth: 100, showOverflowTooltip: !0 },
            { prop: "created_time", label: "创建时间", width: 168, showOverflowTooltip: !0 },
            { prop: "updated_time", label: "更新时间", width: 168, showOverflowTooltip: !0 },
            {
              prop: "operation",
              label: "操作",
              width: 220,
              fixed: "right",
              align: "right",
              formatter: (e) => X(e, Ve),
            },
          ])
        ),
        Re = U(() => [
          {
            label: "部门名称",
            key: "name",
            type: "input",
            span: 24,
            props: { placeholder: "请输入部门名称", maxlength: 50 },
          },
          {
            label: "部门编码",
            key: "code",
            type: "input",
            span: 24,
            props: {
              placeholder: "字母开头，2-16位字母/数字/下划线",
              maxlength: 16,
              showWordLimit: !0,
            },
          },
          {
            label: "上级部门",
            key: "parent_id",
            type: "treeselect",
            span: 24,
            props: {
              placeholder: "请选择上级部门",
              data: ne.value,
              filterable: !0,
              checkStrictly: !0,
              renderAfterExpand: !1,
            },
          },
          {
            label: "排序",
            key: "order",
            type: "number",
            span: 24,
            props: { controlsPosition: "right", min: 1, max: 999 },
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
        ]);
      async function Ue(e) {
        (await ee.value?.validate?.(), ($.value = { ...e }), await fe());
      }
      function ze() {
        (($.value = { name: void 0, status: void 0, created_time: void 0 }), fe());
      }
      async function Fe() {
        const e = pe.value;
        if (0 !== e.length)
          try {
            (await B(e.length),
              (me.value = !0),
              await P.deleteDept(e),
              await N.getUserInfo(),
              (de.value = []),
              await fe());
          } catch {
          } finally {
            me.value = !1;
          }
      }
      async function Ie(e) {
        const a = pe.value;
        if (a.length)
          try {
            (await E(e),
              (he.value = !0),
              await P.batchDept({ ids: a, status: e }),
              await fe(),
              await N.getUserInfo());
          } catch {
          } finally {
            he.value = !1;
          }
        else o.warning("请先选择要操作的数据");
      }
      function Oe() {
        ((re.value = !re.value),
          F(() => {
            const e = se.value?.elTableRef;
            if (!e || !ie.value.length) return;
            const a = (t) => {
              t.forEach((t) => {
                t.children?.length && (e.toggleRowExpansion(t, re.value), a(t.children));
              });
            };
            a(ie.value);
          }));
      }
      return (
        g(() => {
          fe();
        }),
        (o, r) => {
          const n = m,
            p = c,
            f = t,
            g = u,
            R = h,
            U = l,
            z = d,
            F = i,
            O = s,
            q = a,
            B = e,
            E = v("ripple");
          return (
            y(),
            b("div", H, [
              w(I, { title: "部门管理" }),
              j("div", J, [
                _(
                  w(
                    n,
                    {
                      ref_key: "searchBarRef",
                      ref: ee,
                      modelValue: k($),
                      "onUpdate:modelValue": r[0] || (r[0] = (e) => (D($) ? ($.value = e) : null)),
                      items: k(le),
                      rules: ae,
                      "is-expand": !1,
                      "show-expand": !0,
                      "show-reset": !0,
                      "show-search": !0,
                      "disabled-search": !1,
                      "default-expanded": !1,
                      "include-audit": "",
                      onSearch: Ue,
                      onReset: ze,
                    },
                    null,
                    8,
                    ["modelValue", "items"]
                  ),
                  [[x, k(Y)]]
                ),
                w(
                  U,
                  {
                    shadow: "hover",
                    class: "fa-table-card",
                    style: T({ "margin-top": k(Y) ? "12px" : "0" }),
                  },
                  {
                    default: C(() => [
                      w(
                        g,
                        {
                          columns: k(Se),
                          "onUpdate:columns":
                            r[1] || (r[1] = (e) => (D(Se) ? (Se.value = e) : null)),
                          showSearchBar: k(Y),
                          "onUpdate:showSearchBar":
                            r[2] || (r[2] = (e) => (D(Y) ? (Y.value = e) : null)),
                          loading: k(oe),
                          onRefresh: fe,
                        },
                        {
                          left: C(() => [
                            j("div", K, [
                              w(
                                p,
                                {
                                  "remove-ids": k(pe),
                                  "perm-create": ["module_system:dept:create"],
                                  "perm-delete": ["module_system:dept:delete"],
                                  "perm-patch": ["module_system:dept:patch"],
                                  "delete-loading": k(me),
                                  "create-loading": k(ce),
                                  "more-loading": k(he),
                                  onAdd: Ae,
                                  onDelete: Fe,
                                  onMore: Ie,
                                },
                                null,
                                8,
                                ["remove-ids", "delete-loading", "create-loading", "more-loading"]
                              ),
                              _(
                                (y(),
                                A(
                                  f,
                                  { onClick: Oe },
                                  { default: C(() => [V(S(k(re) ? "收起" : "展开"), 1)]), _: 1 }
                                )),
                                [[E]]
                              ),
                            ]),
                          ]),
                          _: 1,
                        },
                        8,
                        ["columns", "showSearchBar", "loading"]
                      ),
                      w(
                        R,
                        {
                          ref_key: "tableRef",
                          ref: se,
                          "row-key": "id",
                          loading: k(oe),
                          columns: k(Te),
                          data: k(ie),
                          "tree-props": { children: "children", hasChildren: "hasChildren" },
                          "default-expand-all": !1,
                          onSelectionChange: k(ue),
                        },
                        null,
                        8,
                        ["loading", "columns", "data", "onSelectionChange"]
                      ),
                    ]),
                    _: 1,
                  },
                  8,
                  ["style"]
                ),
                w(
                  B,
                  {
                    modelValue: k(ge).visible,
                    "onUpdate:modelValue": r[5] || (r[5] = (e) => (k(ge).visible = e)),
                    title: k(ge).title,
                    width: "640px",
                    "dialog-class": "crud-embed-dialog",
                    "modal-class": "crud-embed-dialog",
                    "form-mode": k(ge).type,
                    "confirm-loading": k(xe),
                    onCancel: k(ke),
                    onConfirm:
                      r[6] || (r[6] = (e) => ("detail" === k(ge).type ? k(ke)() : k(Ce)())),
                  },
                  {
                    default: C(() => [
                      "detail" === k(ge).type
                        ? (y(),
                          A(
                            z,
                            { key: 0, column: 4, data: k(ve), items: ye, "max-height": "75vh" },
                            null,
                            8,
                            ["data"]
                          ))
                        : (y(),
                          A(
                            q,
                            {
                              key: k(_e),
                              scrollbar: "",
                              "max-height": "75vh",
                              ref_key: "dataFormRef",
                              ref: je,
                              modelValue: k(be),
                              "onUpdate:modelValue":
                                r[4] || (r[4] = (e) => (D(be) ? (be.value = e) : null)),
                              items: k(Re),
                              rules: k(we),
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
                                w(
                                  O,
                                  {
                                    modelValue: k(be).status,
                                    "onUpdate:modelValue":
                                      r[3] || (r[3] = (e) => (k(be).status = e)),
                                  },
                                  {
                                    default: C(() => [
                                      w(
                                        F,
                                        { value: 0 },
                                        {
                                          default: C(() => [...(r[7] || (r[7] = [V("启用", -1)]))]),
                                          _: 1,
                                        }
                                      ),
                                      w(
                                        F,
                                        { value: 1 },
                                        {
                                          default: C(() => [...(r[8] || (r[8] = [V("停用", -1)]))]),
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
              ]),
            ])
          );
        }
      );
    },
  });
export { M as default };
