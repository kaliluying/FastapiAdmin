import { _ as e, u as a, s as t, c as o } from "./query.CFyD4gup.js";
import { _ as l } from "./index.SppbxYir.js";
import { _ as s } from "./index.vue_vue_type_script_setup_true_lang.B21S8Wni.js";
import { e as r, a3 as i, R as n, Q as p, J as d } from "./element-plus.BPg5EhXK.js";
import { b as m, _ as u, r as c } from "./useTableColumns.BKMFwI8S.js";
import { _ as h, r as g } from "./statusFormatter.Df4Q0iE9.js";
import { _ as y, a as f, c as b, b as v } from "./index.E8bA6rDJ.js";
import {
  z as _,
  ag as j,
  p as w,
  w as x,
  m as k,
  bu as R,
  bo as C,
  aI as V,
  X as S,
  bt as T,
  a4 as D,
  n as P,
  F as U,
  ao as z,
  v as A,
  ax as F,
  o as q,
  al as B,
  j as I,
  ai as O,
  G as W,
} from "./vue-vendor.Dwx3gfQr.js";
import { F as E } from "./index.C8JPqYJk.js";
import { u as L } from "./useTable.DG3aa8Ve.js";
import { d as Q, u as Z, c as G, b as X, a as H } from "./useConfirm.CXh1xjds.js";
import { u as J } from "./useCrudForm.C163p_GE.js";
import { a6 as K } from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { R as M } from "./role.Br_Al1vx.js";
import { _ as N } from "./FaPermissonDrawer.vue_vue_type_script_setup_true_lang.DusVY7lw.js";
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
import "./index.vue_vue_type_script_setup_true_lang.BjaQnZim.js";
import "./index.BRxvSTh5.js";
import "./dept.qQ6KULTg.js";
import "./menu.BhC7sKR_.js";
const Y = { class: "fa-full-height" },
  $ = { class: "fa-management-page" },
  ee = { key: 1, style: "color: var(--el-text-color-placeholder)" },
  ae = _({
    name: "Role",
    inheritAttrs: !1,
    __name: "index",
    setup(_) {
      const { hasAuth: ae } = m();
      function te(e) {
        return o({ ...e });
      }
      function oe(e, a) {
        return c(
          (function (e, a) {
            const t = 1 === e.id,
              o = () => d.warning("系统默认角色，不可操作");
            return [
              {
                key: "perm",
                label: "分配权限",
                artType: "view",
                icon: "ri:shield-keyhole-line",
                iconColor: "var(--el-color-primary)",
                perm: "module_system:role:permission",
                disabled: t,
                run: () => {
                  t ? o() : a.onPerm(e.id, e.name);
                },
              },
              {
                key: "detail",
                label: "详情",
                artType: "view",
                perm: "module_system:role:detail",
                run: () => a.onDetail(e.id),
              },
              {
                key: "edit",
                label: "编辑",
                artType: "edit",
                icon: "ri:edit-2-line",
                perm: "module_system:role:update",
                disabled: t,
                run: () => {
                  t ? o() : a.onEdit(e.id);
                },
              },
              {
                key: "delete",
                label: "删除",
                artType: "delete",
                icon: "ri:delete-bin-4-line",
                perm: "module_system:role:delete",
                disabled: t,
                run: () => {
                  t ? o() : a.onDelete(e.id);
                },
              },
            ].filter((e) => null != e.perm && ae(e.perm));
          })(e, a),
          {
            wrapperClass: "inline-flex flex-wrap items-center justify-end gap-1 role-table-actions",
          }
        );
      }
      const le = B({ name: void 0, status: void 0, created_time: void 0 }),
        se = B(!0),
        re = B(null),
        ie = {},
        ne = B([
          { label: "启用", value: "true" },
          { label: "停用", value: "false" },
        ]),
        pe = I(() => [
          {
            label: "角色名称",
            key: "name",
            type: "input",
            placeholder: "请输入角色名称",
            clearable: !0,
            span: 6,
          },
          {
            label: "状态",
            key: "status",
            type: "select",
            props: { placeholder: "请选择状态", options: ne.value, clearable: !0 },
            span: 6,
          },
        ]),
        de = B(null),
        { selectedRows: me, selectedIds: ue, batchDeleting: ce, onTableSelectionChange: he } = Q(),
        ge = B(!1),
        ye = B(!1),
        fe = B(!1),
        be = B({ id: 0, name: "" });
      const { dialogVisible: ve } = Z(),
        _e = B({}),
        je = [
          { label: "角色名称", prop: "name" },
          { label: "排序", prop: "order" },
          { label: "角色编码", prop: "code" },
          { label: "数据权限", prop: "data_scope", slot: "data_scope" },
          { label: "所属部门", prop: "depts", slot: "depts" },
          {
            label: "状态",
            prop: "status",
            tag: {
              map: { 0: { type: "success", text: "启用" }, 1: { type: "danger", text: "停用" } },
            },
          },
          { label: "创建时间", prop: "created_time" },
          { label: "更新时间", prop: "updated_time" },
          { label: "描述", prop: "description", span: 4 },
        ],
        we = B({ id: void 0, name: void 0, order: 1, code: "", status: 0, description: void 0 }),
        xe = O({
          name: [{ required: !0, message: "请输入角色名称", trigger: "blur" }],
          code: [
            { required: !0, message: "请输入角色编码", trigger: "blur" },
            {
              pattern: /^[A-Za-z][A-Za-z0-9_]{1,15}$/,
              message: "字母开头，2-16位字母/数字/下划线",
              trigger: "blur",
            },
          ],
          order: [{ required: !0, message: "请输入角色排序", trigger: "blur" }],
          status: [{ required: !0, message: "请选择状态", trigger: "blur" }],
        }),
        ke = B(null),
        Re = B(0),
        {
          submitLoading: Ce,
          handleCloseDialog: Ve,
          handleOpenDialog: Se,
          handleSubmit: Te,
        } = J({
          formData: we,
          initialFormData: {
            id: void 0,
            name: void 0,
            order: 1,
            code: "",
            status: 0,
            description: void 0,
          },
          dialogVisible: ve,
          dataFormRef: ke,
          formRenderKey: Re,
          detailApi: M.detailRole,
          createApi: M.createRole,
          updateApi: M.updateRole,
          titles: { create: "新增角色", update: "修改角色", detail: "角色详情" },
          detailFormData: _e,
          onCreateSuccess: async () => {
            await Ge();
          },
          onUpdateSuccess: async () => {
            await Xe();
          },
          onSubmitSuccess: async () => {
            const e = K();
            await e.getUserInfo();
          },
        });
      async function De() {
        ge.value = !0;
        try {
          await Se("create");
        } finally {
          ge.value = !1;
        }
      }
      const Pe = {
          onPerm: function (e, a) {
            ((be.value = { id: e, name: a }), (fe.value = !0));
          },
          onDetail: (e) => {
            Se("detail", e);
          },
          onEdit: (e) => {
            Se("update", e);
          },
          onDelete: async function (e) {
            try {
              (await H(), await M.deleteRole([e]));
              const a = K();
              (await a.getUserInfo(), de.value?.elTableRef?.clearSelection(), await He());
            } catch {}
          },
        },
        Ue = I(() => [
          {
            label: "角色名称",
            key: "name",
            type: "input",
            span: 24,
            props: { placeholder: "请输入角色名称" },
          },
          {
            label: "排序",
            key: "order",
            type: "number",
            span: 24,
            props: { controlsPosition: "right", min: 0, style: { width: "100px" } },
          },
          {
            label: "角色编码",
            key: "code",
            type: "input",
            span: 24,
            props: {
              placeholder: "字母开头，2-16位字母/数字/下划线",
              maxlength: 16,
              showWordLimit: !0,
            },
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
          columns: ze,
          columnChecks: Ae,
          data: Fe,
          loading: qe,
          pagination: Be,
          searchParams: Ie,
          getData: Oe,
          replaceSearchParams: We,
          resetSearchParams: Ee,
          handleSizeChange: Le,
          handleCurrentChange: Qe,
          refreshData: Ze,
          refreshCreate: Ge,
          refreshUpdate: Xe,
          refreshRemove: He,
        } = L({
          core: {
            apiFn: M.listRole,
            apiParams: { page_no: 1, page_size: 10 },
            columnsFactory: g(() => [
              { type: "selection", width: 48, fixed: "left" },
              { type: "globalIndex", width: 56, label: "序号" },
              { prop: "name", label: "角色名称", minWidth: 100, showOverflowTooltip: !0 },
              { prop: "code", label: "角色编码", minWidth: 100, showOverflowTooltip: !0 },
              {
                prop: "data_scope",
                label: "数据权限",
                minWidth: 200,
                status: {
                  1: { type: "primary", text: "仅本人数据权限" },
                  2: { type: "info", text: "本部门数据权限" },
                  3: { type: "warning", text: "本部门及以下数据权限" },
                  4: { type: "success", text: "全部数据权限" },
                  5: { type: "danger", text: "自定义数据权限" },
                },
              },
              {
                prop: "depts",
                label: "所属部门",
                minWidth: 200,
                formatter: (e) =>
                  (function (e) {
                    const a = e.depts;
                    if (!a?.length)
                      return W(
                        "span",
                        { style: { color: "var(--el-text-color-placeholder)" } },
                        "-"
                      );
                    const t = a
                      .slice(0, 3)
                      .map((e) =>
                        W(h, {
                          key: e.id,
                          type: "info",
                          label: e.name ?? "",
                          style: { marginRight: "4px", marginBottom: "4px" },
                        })
                      );
                    return (
                      a.length > 3 &&
                        t.push(
                          W(h, {
                            type: "info",
                            label: "+" + (a.length - 3),
                            style: { marginBottom: "4px" },
                          })
                        ),
                      W("span", { class: "inline-flex flex-wrap items-center" }, t)
                    );
                  })(e),
              },
              { prop: "order", label: "排序", width: 80, showOverflowTooltip: !0 },
              {
                prop: "status",
                label: "状态",
                width: 88,
                status: {
                  0: { type: "success", text: "启用" },
                  1: { type: "danger", text: "停用" },
                },
              },
              { prop: "description", label: "描述", minWidth: 100, showOverflowTooltip: !0 },
              { prop: "created_time", label: "创建时间", width: 168, showOverflowTooltip: !0 },
              { prop: "updated_time", label: "更新时间", width: 168, showOverflowTooltip: !0 },
              {
                prop: "operation",
                label: "操作",
                width: 220,
                fixed: "right",
                align: "right",
                formatter: (e) => oe(e, Pe),
              },
            ]),
          },
        }),
        Je = I(() =>
          ze.value.map((e) => {
            const a = e.type;
            return {
              prop: e.prop,
              label: e.label,
              type: "selection" === a ? "selection" : "default",
              show: !0,
            };
          })
        ),
        Ke = I(() => te(t(Ie))),
        Me = I(() => ({
          permPrefix: "module_system:role",
          cols: Je.value,
          exportsBlobAction: async (e) => {
            const a = te({ ...{ ...Ke.value }, ...e });
            return (await M.exportRole(a)).data;
          },
        })),
        { exportVisible: Ne, openExport: Ye } = a();
      async function $e(e) {
        var a;
        (await re.value?.validate?.(),
          We({
            name: (a = e).name,
            status: a.status,
            created_time:
              Array.isArray(a.created_time) && 2 === a.created_time.length
                ? a.created_time
                : void 0,
          }),
          Oe());
      }
      function ea() {
        ((le.value = { name: void 0, status: void 0, created_time: void 0 }), Ee());
      }
      async function aa() {
        const e = ue.value;
        if (0 !== e.length)
          try {
            (await G(e.length), (ce.value = !0), await M.deleteRole(e));
            const a = K();
            (await a.getUserInfo(), de.value?.elTableRef?.clearSelection(), await He());
          } catch {
          } finally {
            ce.value = !1;
          }
      }
      async function ta(e) {
        const a = ue.value;
        if (a.length)
          try {
            (await X(e), (ye.value = !0), await M.batchRole({ ids: a, status: e }), await Ze());
            const t = K();
            await t.getUserInfo();
          } catch {
          } finally {
            ye.value = !1;
          }
        else d.warning("请先选择要操作的数据");
      }
      return (a, t) => {
        const o = y,
          d = b,
          m = f,
          c = v,
          g = r,
          _ = h,
          B = i,
          I = u,
          O = p,
          W = n,
          L = s,
          Q = l,
          Z = e;
        return (
          j(),
          w("div", Y, [
            x(E, { title: "角色管理" }),
            k("div", $, [
              R(
                x(
                  o,
                  {
                    ref_key: "searchBarRef",
                    ref: re,
                    modelValue: V(le),
                    "onUpdate:modelValue": t[0] || (t[0] = (e) => (S(le) ? (le.value = e) : null)),
                    items: V(pe),
                    rules: ie,
                    "is-expand": !1,
                    "show-expand": !0,
                    "show-reset": !0,
                    "show-search": !0,
                    "disabled-search": !1,
                    "default-expanded": !1,
                    "include-audit": "",
                    onSearch: $e,
                    onReset: ea,
                  },
                  null,
                  8,
                  ["modelValue", "items"]
                ),
                [[C, V(se)]]
              ),
              x(
                g,
                {
                  shadow: "hover",
                  class: "fa-table-card",
                  style: D({ "margin-top": V(se) ? "12px" : "0" }),
                },
                {
                  default: T(() => [
                    x(
                      m,
                      {
                        columns: V(Ae),
                        "onUpdate:columns": t[1] || (t[1] = (e) => (S(Ae) ? (Ae.value = e) : null)),
                        showSearchBar: V(se),
                        "onUpdate:showSearchBar":
                          t[2] || (t[2] = (e) => (S(se) ? (se.value = e) : null)),
                        loading: V(qe),
                        onRefresh: V(Ze),
                      },
                      {
                        left: T(() => [
                          x(
                            d,
                            {
                              "remove-ids": V(ue),
                              "perm-create": ["module_system:role:create"],
                              "perm-export": ["module_system:role:export"],
                              "perm-delete": ["module_system:role:delete"],
                              "perm-patch": ["module_system:role:patch"],
                              "delete-loading": V(ce),
                              "create-loading": V(ge),
                              "more-loading": V(ye),
                              onAdd: De,
                              onExport: V(Ye),
                              onDelete: aa,
                              onMore: ta,
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
                    x(
                      c,
                      {
                        ref_key: "faTableRef",
                        ref: de,
                        loading: V(qe),
                        data: V(Fe),
                        columns: V(ze),
                        pagination: V(Be),
                        onSelectionChange: V(he),
                        "onPagination:sizeChange": V(Le),
                        "onPagination:currentChange": V(Qe),
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
              x(
                Q,
                {
                  modelValue: V(ve).visible,
                  "onUpdate:modelValue": t[5] || (t[5] = (e) => (V(ve).visible = e)),
                  title: V(ve).title,
                  width: "640px",
                  "dialog-class": "crud-embed-dialog",
                  "modal-class": "crud-embed-dialog",
                  "form-mode": V(ve).type,
                  "confirm-loading": V(Ce),
                  onCancel: V(Ve),
                  onConfirm: t[6] || (t[6] = (e) => ("detail" === V(ve).type ? V(Ve)() : V(Te)())),
                },
                {
                  default: T(() => [
                    "detail" === V(ve).type
                      ? (j(),
                        P(
                          I,
                          { key: 0, column: 4, data: V(_e), items: je, "max-height": "75vh" },
                          {
                            data_scope: T(({ row: e }) => [
                              1 === e?.data_scope
                                ? (j(), P(_, { key: 0, type: "primary", label: "仅本人数据权限" }))
                                : 2 === e?.data_scope
                                  ? (j(), P(_, { key: 1, type: "info", label: "本部门数据权限" }))
                                  : 3 === e?.data_scope
                                    ? (j(),
                                      P(_, {
                                        key: 2,
                                        type: "warning",
                                        label: "本部门及以下数据权限",
                                      }))
                                    : 4 === e?.data_scope
                                      ? (j(),
                                        P(_, { key: 3, type: "success", label: "全部数据权限" }))
                                      : (j(),
                                        P(_, { key: 4, type: "danger", label: "自定义数据权限" })),
                            ]),
                            depts: T(({ row: e }) => [
                              e?.depts && e.depts.length > 0
                                ? (j(!0),
                                  w(
                                    U,
                                    { key: 0 },
                                    z(
                                      e.depts,
                                      (e) => (
                                        j(),
                                        P(
                                          B,
                                          {
                                            key: e.id,
                                            type: "info",
                                            style: "margin-right: 4px; margin-bottom: 4px",
                                          },
                                          { default: T(() => [A(F(e.name), 1)]), _: 2 },
                                          1024
                                        )
                                      )
                                    ),
                                    128
                                  ))
                                : (j(), w("span", ee, "-")),
                            ]),
                            _: 1,
                          },
                          8,
                          ["data"]
                        ))
                      : (j(),
                        P(
                          L,
                          {
                            key: V(Re),
                            scrollbar: "",
                            "max-height": "75vh",
                            ref_key: "dataFormRef",
                            ref: ke,
                            modelValue: V(we),
                            "onUpdate:modelValue":
                              t[4] || (t[4] = (e) => (S(we) ? (we.value = e) : null)),
                            items: V(Ue),
                            rules: V(xe),
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
                            status: T(() => [
                              x(
                                W,
                                {
                                  modelValue: V(we).status,
                                  "onUpdate:modelValue": t[3] || (t[3] = (e) => (V(we).status = e)),
                                },
                                {
                                  default: T(() => [
                                    x(
                                      O,
                                      { value: 0 },
                                      {
                                        default: T(() => [...(t[9] || (t[9] = [A("启用", -1)]))]),
                                        _: 1,
                                      }
                                    ),
                                    x(
                                      O,
                                      { value: 1 },
                                      {
                                        default: T(() => [...(t[10] || (t[10] = [A("停用", -1)]))]),
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
              V(fe)
                ? (j(),
                  P(
                    N,
                    {
                      key: 0,
                      modelValue: V(fe),
                      "onUpdate:modelValue":
                        t[7] || (t[7] = (e) => (S(fe) ? (fe.value = e) : null)),
                      "role-name": V(be).name,
                      "role-id": V(be).id,
                      onSaved: V(Ze),
                    },
                    null,
                    8,
                    ["modelValue", "role-name", "role-id", "onSaved"]
                  ))
                : q("", !0),
              x(
                Z,
                {
                  modelValue: V(Ne),
                  "onUpdate:modelValue": t[8] || (t[8] = (e) => (S(Ne) ? (Ne.value = e) : null)),
                  "content-config": V(Me),
                  "query-params": V(Ke),
                  "page-data": V(Fe),
                  "selection-data": V(me),
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
export { ae as default };
