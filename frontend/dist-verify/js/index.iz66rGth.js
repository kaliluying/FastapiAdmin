import { _ as e } from "./index.SppbxYir.js";
import {
  d as a,
  _ as t,
  a3 as l,
  e as r,
  w as o,
  x as i,
  V as s,
  M as p,
  A as m,
  B as n,
  J as u,
  K as d,
} from "./element-plus.BPg5EhXK.js";
import { _ as c, a as y, c as v, b as _ } from "./index.E8bA6rDJ.js";
import {
  z as f,
  ag as g,
  p as h,
  w as b,
  bu as j,
  bo as w,
  X as k,
  aI as x,
  bt as V,
  v as z,
  ax as C,
  a4 as S,
  m as U,
  al as A,
  ai as B,
  j as R,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as $ } from "./FaAiPageHeader.vue_vue_type_script_setup_true_lang.DfUsWKjs.js";
import { L as q } from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { _ as P } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./vue-draggable-plus.B5VWpxKS.js";
import "./@intlify.CbtlSmdZ.js";
import "./index.C8JPqYJk.js";
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
const F = "/ai/memory",
  I = {
    list: (e) => q({ url: `${F}/list`, method: "get", params: e }),
    create: (e) => q({ url: `${F}/create`, method: "post", data: e }),
    update: (e, a) => q({ url: `${F}/update/${e}`, method: "put", data: a }),
    delete: (e) =>
      q({
        url: `${F}/delete`,
        method: "delete",
        params: { memory_ids: e },
        paramsSerializer: (e) => {
          const a = new URLSearchParams();
          for (const t of Object.keys(e)) {
            const l = e[t];
            if (Array.isArray(l)) for (const e of l) a.append(t, String(e));
            else a.append(t, String(l));
          }
          return a.toString();
        },
      }),
  },
  L = { class: "fa-full-height" },
  M = P(
    f({
      name: "AiMemoryManage",
      __name: "index",
      setup(f) {
        const q = A(!0);
        let P = B({});
        const F = A([
            {
              key: "memory_type",
              label: "记忆类型",
              type: "select",
              options: [
                { label: "全部", value: "" },
                { label: "用户偏好", value: "user_preference" },
                { label: "用户事实", value: "fact" },
                { label: "工作规则", value: "work_rule" },
              ],
            },
            { key: "key", label: "标签搜索", type: "input", placeholder: "模糊搜索标签" },
          ]),
          M = {},
          N = (e) =>
            ({ user_preference: "用户偏好", fact: "用户事实", work_rule: "工作规则" })[e] || e,
          O = A(!1),
          D = A([]),
          H = A([]),
          T = A(!1),
          E = A(!1),
          G = A([
            { prop: "memory_type", label: "类型", visible: !0 },
            { prop: "category", label: "分类", visible: !0 },
            { prop: "key", label: "标签", visible: !0 },
            { prop: "value", label: "内容", visible: !0 },
            { prop: "priority", label: "优先级", visible: !0 },
            { prop: "is_active", label: "启用", visible: !0 },
            { prop: "created_time", label: "创建时间", visible: !0 },
            { prop: "updated_time", label: "更新时间", visible: !0 },
          ]),
          J = R(() => [
            { type: "selection", width: 50, fixed: "left" },
            ...G.value
              .filter((e) => e.visible)
              .map((e) => ({
                prop: e.prop,
                label: e.label,
                minWidth: "value" === e.prop ? 250 : "key" === e.prop ? 150 : 100,
                showOverflowTooltip: "value" === e.prop,
                useSlot: "memory_type" === e.prop || "is_active" === e.prop,
                slotName:
                  "memory_type" === e.prop
                    ? "memory-type"
                    : "is_active" === e.prop
                      ? "memory-status"
                      : void 0,
              })),
            { label: "操作", width: 140, fixed: "right", useSlot: !0, slotName: "actions" },
          ]),
          K = B({ current: 1, size: 20, total: 0 });
        async function W() {
          O.value = !0;
          try {
            const e = (
              await I.list({
                page_no: K.current,
                page_size: K.size,
                memory_type: P.memory_type || void 0,
                key: P.key || void 0,
              })
            ).data.data;
            ((D.value = e.items || []), (K.total = e.total || 0));
          } finally {
            O.value = !1;
          }
        }
        function X() {
          W();
        }
        function Q() {
          ((K.current = 1), W());
        }
        function Y() {
          ((P.memory_type = ""), (P.key = ""), Q());
        }
        function Z(e) {
          ((K.size = e), W());
        }
        function ee(e) {
          ((K.current = e), W());
        }
        function ae(e) {
          H.value = e.map((e) => e.id);
        }
        async function te() {
          if (H.value.length)
            try {
              (await d.confirm(`确定要删除 ${H.value.length} 条记忆吗？`, "删除确认", {
                type: "warning",
              }),
                (T.value = !0),
                await I.delete(H.value),
                u.success("批量删除成功"),
                (H.value = []),
                W());
            } catch (e) {
              "cancel" !== e && u.error(e?.message || "删除失败");
            } finally {
              T.value = !1;
            }
          else u.warning("请先选择要删除的记录");
        }
        const le = B({ visible: !1, title: "", type: "create" }),
          re = A(!1),
          oe = A(),
          ie = A(null),
          se = B({
            memory_type: "fact",
            category: null,
            key: "",
            value: "",
            priority: 0,
            is_active: !0,
          }),
          pe = {
            memory_type: [{ required: !0, message: "请选择记忆类型", trigger: "change" }],
            key: [{ required: !0, message: "请输入标签", trigger: "blur" }],
            value: [{ required: !0, message: "请输入内容", trigger: "blur" }],
          };
        function me() {
          ((le.type = "create"),
            (le.title = "新增记忆"),
            (se.memory_type = "fact"),
            (se.category = null),
            (se.key = ""),
            (se.value = ""),
            (se.priority = 0),
            (se.is_active = !0),
            (ie.value = null),
            (le.visible = !0));
        }
        function ne() {
          oe.value?.resetFields();
        }
        async function ue() {
          if (await oe.value?.validate().catch(() => !1)) {
            re.value = !0;
            try {
              ("create" === le.type
                ? (await I.create({
                    memory_type: se.memory_type,
                    category: se.category || null,
                    key: se.key,
                    value: se.value,
                    priority: se.priority,
                    is_active: se.is_active,
                  }),
                  u.success("创建成功"))
                : ie.value &&
                  (await I.update(ie.value, {
                    memory_type: se.memory_type,
                    category: se.category || null,
                    key: se.key,
                    value: se.value,
                    priority: se.priority,
                    is_active: se.is_active,
                  }),
                  u.success("更新成功")),
                (le.visible = !1),
                W());
            } catch (e) {
              u.error(e?.message || "操作失败");
            } finally {
              re.value = !1;
            }
          }
        }
        return (
          W(),
          (f, A) => {
            const B = c,
              R = v,
              de = y,
              ce = l,
              ye = t,
              ve = a,
              _e = _,
              fe = r,
              ge = p,
              he = s,
              be = i,
              je = m,
              we = n,
              ke = o,
              xe = e;
            return (
              g(),
              h("div", L, [
                b($, { title: "记忆管理" }),
                j(
                  b(
                    B,
                    {
                      ref: "searchBarRef",
                      modelValue: x(P),
                      "onUpdate:modelValue":
                        A[0] || (A[0] = (e) => (k(P) ? (P.value = e) : (P = e))),
                      items: F.value,
                      rules: M,
                      "is-expand": !1,
                      "show-expand": !1,
                      "show-reset": !0,
                      "show-search": !0,
                      "disabled-search": !1,
                      "default-expanded": !0,
                      onSearch: Q,
                      onReset: Y,
                    },
                    null,
                    8,
                    ["modelValue", "items"]
                  ),
                  [[w, q.value]]
                ),
                b(
                  fe,
                  {
                    shadow: "hover",
                    class: "fa-table-card",
                    style: S({ "margin-top": q.value ? "12px" : "0" }),
                  },
                  {
                    default: V(() => [
                      b(
                        de,
                        {
                          columns: G.value,
                          "onUpdate:columns": A[1] || (A[1] = (e) => (G.value = e)),
                          showSearchBar: q.value,
                          "onUpdate:showSearchBar": A[2] || (A[2] = (e) => (q.value = e)),
                          loading: O.value,
                          onRefresh: X,
                        },
                        {
                          left: V(() => [
                            b(
                              R,
                              {
                                "remove-ids": H.value,
                                "perm-create": ["module_ai:memory:create"],
                                "perm-delete": ["module_ai:memory:delete"],
                                "delete-loading": T.value,
                                "create-loading": E.value,
                                onAdd: me,
                                onDelete: te,
                              },
                              null,
                              8,
                              ["remove-ids", "delete-loading", "create-loading"]
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["columns", "showSearchBar", "loading"]
                      ),
                      b(
                        _e,
                        {
                          ref: "faTableRef",
                          "row-key": "id",
                          loading: O.value,
                          data: D.value,
                          columns: J.value,
                          pagination: K,
                          onSelectionChange: ae,
                          "onPagination:sizeChange": Z,
                          "onPagination:currentChange": ee,
                        },
                        {
                          "memory-type": V(({ row: e }) => {
                            return [
                              b(
                                ce,
                                {
                                  type:
                                    ((a = e.memory_type),
                                    {
                                      user_preference: "primary",
                                      fact: "success",
                                      work_rule: "warning",
                                    }[a] || "info"),
                                  size: "small",
                                },
                                { default: V(() => [z(C(N(e.memory_type)), 1)]), _: 2 },
                                1032,
                                ["type"]
                              ),
                            ];
                            var a;
                          }),
                          "memory-status": V(({ row: e }) => [
                            b(
                              ye,
                              {
                                "model-value": e.is_active,
                                size: "small",
                                onChange: (a) =>
                                  (async function (e, a) {
                                    try {
                                      (await I.update(e.id, { is_active: a }),
                                        u.success(a ? "已启用" : "已禁用"),
                                        (e.is_active = a));
                                    } catch (t) {
                                      u.error(t?.message || "切换失败");
                                    }
                                  })(e, Boolean(a)),
                              },
                              null,
                              8,
                              ["model-value", "onChange"]
                            ),
                          ]),
                          actions: V(({ row: e }) => [
                            b(
                              ve,
                              {
                                type: "primary",
                                link: "",
                                size: "small",
                                onClick: (a) =>
                                  (function (e) {
                                    ((le.type = "update"),
                                      (le.title = "编辑记忆"),
                                      (se.memory_type = e.memory_type),
                                      (se.category = e.category),
                                      (se.key = e.key),
                                      (se.value = e.value),
                                      (se.priority = e.priority),
                                      (se.is_active = e.is_active),
                                      (ie.value = e.id),
                                      (le.visible = !0));
                                  })(e),
                              },
                              { default: V(() => [...(A[10] || (A[10] = [z("编辑", -1)]))]), _: 1 },
                              8,
                              ["onClick"]
                            ),
                            b(
                              ve,
                              {
                                type: "danger",
                                link: "",
                                size: "small",
                                onClick: (a) =>
                                  (async function (e) {
                                    try {
                                      (await d.confirm("确定要删除这条记忆吗？", "删除确认", {
                                        type: "warning",
                                      }),
                                        await I.delete([e.id]),
                                        u.success("删除成功"),
                                        W());
                                    } catch (a) {
                                      "cancel" !== a && u.error(a?.message || "删除失败");
                                    }
                                  })(e),
                              },
                              { default: V(() => [...(A[11] || (A[11] = [z("删除", -1)]))]), _: 1 },
                              8,
                              ["onClick"]
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["loading", "data", "columns", "pagination"]
                      ),
                    ]),
                    _: 1,
                  },
                  8,
                  ["style"]
                ),
                b(
                  xe,
                  {
                    modelValue: le.visible,
                    "onUpdate:modelValue": A[9] || (A[9] = (e) => (le.visible = e)),
                    title: le.title,
                    width: "600px",
                    "form-mode": le.type,
                    "confirm-loading": re.value,
                    onConfirm: ue,
                    onClosed: ne,
                  },
                  {
                    default: V(() => [
                      b(
                        ke,
                        {
                          ref_key: "formRef",
                          ref: oe,
                          model: se,
                          rules: pe,
                          "label-width": "80px",
                        },
                        {
                          default: V(() => [
                            b(
                              be,
                              { label: "记忆类型", prop: "memory_type" },
                              {
                                default: V(() => [
                                  b(
                                    he,
                                    {
                                      modelValue: se.memory_type,
                                      "onUpdate:modelValue":
                                        A[3] || (A[3] = (e) => (se.memory_type = e)),
                                      disabled: "update" === le.type,
                                      style: { width: "100%" },
                                    },
                                    {
                                      default: V(() => [
                                        b(ge, {
                                          label: "用户偏好 (user_preference)",
                                          value: "user_preference",
                                        }),
                                        b(ge, { label: "用户事实 (fact)", value: "fact" }),
                                        b(ge, {
                                          label: "工作规则 (work_rule)",
                                          value: "work_rule",
                                        }),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue", "disabled"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                            b(
                              be,
                              { label: "标签", prop: "key" },
                              {
                                default: V(() => [
                                  b(
                                    je,
                                    {
                                      modelValue: se.key,
                                      "onUpdate:modelValue": A[4] || (A[4] = (e) => (se.key = e)),
                                      placeholder: "如: 用户角色",
                                      maxlength: "128",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                            b(
                              be,
                              { label: "内容", prop: "value" },
                              {
                                default: V(() => [
                                  b(
                                    je,
                                    {
                                      modelValue: se.value,
                                      "onUpdate:modelValue": A[5] || (A[5] = (e) => (se.value = e)),
                                      type: "textarea",
                                      rows: 4,
                                      placeholder: "如: 偏好先看执行摘要，再看明细",
                                      maxlength: "5000",
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
                            b(
                              be,
                              { label: "分类", prop: "category" },
                              {
                                default: V(() => [
                                  b(
                                    je,
                                    {
                                      modelValue: se.category,
                                      "onUpdate:modelValue":
                                        A[6] || (A[6] = (e) => (se.category = e)),
                                      placeholder: "可选分组，如: 用户信息",
                                      maxlength: "64",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                            b(
                              be,
                              { label: "优先级", prop: "priority" },
                              {
                                default: V(() => [
                                  b(
                                    we,
                                    {
                                      modelValue: se.priority,
                                      "onUpdate:modelValue":
                                        A[7] || (A[7] = (e) => (se.priority = e)),
                                      min: 0,
                                      max: 100,
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                  A[12] ||
                                    (A[12] = U(
                                      "span",
                                      { class: "form-tip" },
                                      "越高越优先注入",
                                      -1
                                    )),
                                ]),
                                _: 1,
                              }
                            ),
                            b(
                              be,
                              { label: "启用", prop: "is_active" },
                              {
                                default: V(() => [
                                  b(
                                    ye,
                                    {
                                      modelValue: se.is_active,
                                      "onUpdate:modelValue":
                                        A[8] || (A[8] = (e) => (se.is_active = e)),
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
                  ["modelValue", "title", "form-mode", "confirm-loading"]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-9f6dded6"]]
  );
export { M as default };
