import { _ as e } from "./index.BpYlApL9.js";
import { _ as a } from "./index.vue_vue_type_script_setup_true_lang.B21S8Wni.js";
import {
  O as t,
  A as l,
  a2 as o,
  $ as i,
  U as r,
  a9 as s,
  z as n,
  ag as p,
  d,
  e as u,
  R as m,
  Q as c,
  ap as f,
  au as h,
  ad as y,
  a4 as v,
  K as _,
  J as g,
} from "./element-plus.BPg5EhXK.js";
import { _ as b } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import {
  z as w,
  a$ as x,
  al as k,
  aa as V,
  ac as T,
  aq as U,
  ag as j,
  p as O,
  a4 as A,
  w as C,
  aI as N,
  bt as E,
  m as L,
  X as M,
  F as B,
  ao as G,
  n as I,
  as as q,
  ap as S,
  bw as z,
  o as R,
  $ as W,
  j as K,
  ar as D,
  bu as X,
  bo as F,
  v as $,
  ax as P,
  ai as J,
  a1 as Q,
  G as H,
} from "./vue-vendor.Dwx3gfQr.js";
import { z as Y, Y as Z, a6 as ee, q as ae, D as te } from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { a as le, b as oe, r as ie } from "./index.BRxvSTh5.js";
import { _ as re } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import { b as se, f as ne, _ as pe, r as de } from "./useTableColumns.BKMFwI8S.js";
import { _ as ue, r as me } from "./statusFormatter.Df4Q0iE9.js";
import { _ as ce, a as fe, c as he, b as ye } from "./index.E8bA6rDJ.js";
import { F as ve } from "./index.C8JPqYJk.js";
import { M as _e } from "./menu.BhC7sKR_.js";
import { M as ge } from "./beforeEach.T4xfiZQ3.js";
import { _ as be } from "./index.vue_vue_type_script_setup_true_lang.BjaQnZim.js";
import "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
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
import "./ohash.BS5RKZcF.js";
import "./vue-draggable-plus.B5VWpxKS.js";
const we = { class: "icon-grid" },
  xe = ["onClick"],
  ke = { class: "icon-grid" },
  Ve = ["onClick"],
  Te = re(
    w({
      name: "FaIconSelect",
      __name: "index",
      props: W(
        { modelValue: { default: "" }, width: { default: "500px" } },
        { modelValue: { default: "" }, modelModifiers: {} }
      ),
      emits: W(["update:modelValue"], ["update:modelValue"]),
      setup(e, { emit: a }) {
        const d = e,
          u = a,
          m = k(),
          c = k(),
          f = k(!1),
          h = k("svg"),
          y = k([]),
          v = k(Object.keys(p)),
          _ = x(e, "modelValue"),
          g = k(""),
          w = k([]),
          W = k(v.value),
          D = K(() => ie(_.value));
        function X(e) {
          ((h.value = e.props.name), F());
        }
        function F() {
          "svg" === h.value
            ? (w.value = g.value
                ? y.value.filter((e) => e.toLowerCase().includes(g.value.toLowerCase()))
                : y.value)
            : (W.value = g.value
                ? v.value.filter((e) => e.toLowerCase().includes(g.value.toLowerCase()))
                : v.value);
        }
        function $(e) {
          const a = "element" === h.value ? "el-icon-" + e : e;
          (u("update:modelValue", a), (f.value = !1));
        }
        function P() {
          f.value = !f.value;
        }
        function J() {
          _.value = "";
        }
        return (
          V(m, () => (f.value = !1), { ignore: [c] }),
          T(() => {
            if (((y.value = Y()), (w.value = y.value), _.value)) {
              const e = _.value.trim(),
                a = e.replace(/^el-icon-/i, "");
              v.value.includes(a) ? (h.value = "element") : (le(e), (h.value = "svg"));
            }
          }),
          (e, a) => {
            const p = n,
              u = b,
              y = U("CircleClose"),
              v = U("ArrowDown"),
              x = l,
              k = s,
              V = r,
              T = i,
              K = o,
              Q = t;
            return (
              j(),
              O(
                "div",
                { ref_key: "iconSelectRef", ref: m, style: A({ width: d.width }) },
                [
                  C(
                    Q,
                    { visible: N(f), width: d.width, placement: "bottom-end" },
                    {
                      reference: E(() => [
                        L("div", { onClick: a[1] || (a[1] = (e) => (f.value = !N(f))) }, [
                          S(
                            e.$slots,
                            "default",
                            {},
                            () => [
                              C(
                                x,
                                {
                                  modelValue: _.value,
                                  "onUpdate:modelValue": a[0] || (a[0] = (e) => (_.value = e)),
                                  readonly: "",
                                  placeholder: "点击选择图标",
                                  class: "reference",
                                },
                                {
                                  prepend: E(() => [
                                    N(D)
                                      ? (j(),
                                        I(
                                          p,
                                          { key: 0 },
                                          { default: E(() => [(j(), I(q(N(D))))]), _: 1 }
                                        ))
                                      : _.value
                                        ? (j(),
                                          I(u, { key: 1, icon: N(oe)(_.value) }, null, 8, ["icon"]))
                                        : R("", !0),
                                  ]),
                                  suffix: E(() => [
                                    _.value
                                      ? (j(),
                                        I(
                                          p,
                                          {
                                            key: 0,
                                            style: { marginRight: "8px" },
                                            onClick: z(J, ["stop"]),
                                          },
                                          { default: E(() => [C(y)]), _: 1 }
                                        ))
                                      : R("", !0),
                                    C(
                                      p,
                                      {
                                        style: A({
                                          transform: N(f) ? "rotate(180deg)" : "rotate(0)",
                                          transition: "transform .5s",
                                        }),
                                      },
                                      {
                                        default: E(() => [C(v, { onClick: z(P, ["stop"]) })]),
                                        _: 1,
                                      },
                                      8,
                                      ["style"]
                                    ),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["modelValue"]
                              ),
                            ],
                            !0
                          ),
                        ]),
                      ]),
                      default: E(() => [
                        L(
                          "div",
                          { ref_key: "popoverContentRef", ref: c },
                          [
                            C(
                              x,
                              {
                                modelValue: N(g),
                                "onUpdate:modelValue":
                                  a[2] || (a[2] = (e) => (M(g) ? (g.value = e) : null)),
                                placeholder: "搜索图标",
                                clearable: "",
                                onInput: F,
                              },
                              null,
                              8,
                              ["modelValue"]
                            ),
                            C(
                              K,
                              {
                                modelValue: N(h),
                                "onUpdate:modelValue":
                                  a[3] || (a[3] = (e) => (M(h) ? (h.value = e) : null)),
                                onTabClick: X,
                              },
                              {
                                default: E(() => [
                                  C(
                                    T,
                                    { label: "SVG 图标", name: "svg" },
                                    {
                                      default: E(() => [
                                        C(
                                          V,
                                          { height: "300px" },
                                          {
                                            default: E(() => [
                                              L("ul", we, [
                                                (j(!0),
                                                O(
                                                  B,
                                                  null,
                                                  G(
                                                    N(w),
                                                    (e) => (
                                                      j(),
                                                      O(
                                                        "li",
                                                        {
                                                          key: "svg-" + e,
                                                          class: "icon-grid-item",
                                                          onClick: (a) => $(e),
                                                        },
                                                        [
                                                          C(
                                                            k,
                                                            {
                                                              content: e,
                                                              placement: "bottom",
                                                              effect: "light",
                                                            },
                                                            {
                                                              default: E(() => [
                                                                C(u, { icon: N(oe)(e) }, null, 8, [
                                                                  "icon",
                                                                ]),
                                                              ]),
                                                              _: 2,
                                                            },
                                                            1032,
                                                            ["content"]
                                                          ),
                                                        ],
                                                        8,
                                                        xe
                                                      )
                                                    )
                                                  ),
                                                  128
                                                )),
                                              ]),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                      ]),
                                      _: 1,
                                    }
                                  ),
                                  C(
                                    T,
                                    { label: "Element 图标", name: "element" },
                                    {
                                      default: E(() => [
                                        C(
                                          V,
                                          { height: "300px" },
                                          {
                                            default: E(() => [
                                              L("ul", ke, [
                                                (j(!0),
                                                O(
                                                  B,
                                                  null,
                                                  G(
                                                    N(W),
                                                    (e) => (
                                                      j(),
                                                      O(
                                                        "li",
                                                        {
                                                          key: e,
                                                          class: "icon-grid-item flex-cc",
                                                          onClick: (a) => $(e),
                                                        },
                                                        [
                                                          C(
                                                            p,
                                                            null,
                                                            {
                                                              default: E(() => [(j(), I(q(e)))]),
                                                              _: 2,
                                                            },
                                                            1024
                                                          ),
                                                        ],
                                                        8,
                                                        Ve
                                                      )
                                                    )
                                                  ),
                                                  128
                                                )),
                                              ]),
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
                          ],
                          512
                        ),
                      ]),
                      _: 3,
                    },
                    8,
                    ["visible", "width"]
                  ),
                ],
                4
              )
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-586f2543"]]
  ),
  Ue = { class: "fa-full-height" },
  je = { class: "fa-management-page" },
  Oe = { class: "inline-flex flex-wrap items-center gap-2" },
  Ae = re(
    w({
      name: "SysMenu",
      inheritAttrs: !1,
      __name: "index",
      setup(t) {
        const { hasAuth: o } = se(),
          i = Z(),
          r = ee();
        function s(e, a) {
          const t = (function (e, a) {
            const t = [];
            return (
              !a.onAdd ||
                (e.type !== ge.CATALOG && e.type !== ge.MENU) ||
                t.push({
                  key: "add",
                  label: "新增",
                  artType: "add",
                  perm: "module_platform:menu:create",
                  run: () => a.onAdd(e),
                }),
              t.push(
                {
                  key: "detail",
                  label: "详情",
                  artType: "view",
                  perm: "module_platform:menu:detail",
                  run: () => a.onDetail(e.id),
                },
                {
                  key: "edit",
                  label: "编辑",
                  artType: "edit",
                  perm: "module_platform:menu:update",
                  run: () => a.onEdit(e.id),
                },
                {
                  key: "delete",
                  label: "删除",
                  artType: "delete",
                  perm: "module_platform:menu:delete",
                  run: () => a.onDelete(e.id),
                }
              ),
              t.filter((e) => null != e.perm && o(e.perm))
            );
          })(e, a);
          return de(t, {
            wrapperClass: "inline-flex flex-wrap items-center justify-end gap-1 menu-table-actions",
          });
        }
        const p = k({ name: void 0, status: void 0, created_time: void 0 }),
          b = k(!0),
          w = k(null),
          x = {},
          V = k([
            { label: "启用", value: 0 },
            { label: "停用", value: 1 },
          ]),
          U = K(() => [
            {
              label: "菜单名称",
              key: "name",
              type: "input",
              placeholder: "请输入菜单名称",
              clearable: !0,
              span: 6,
            },
            {
              label: "状态",
              key: "status",
              type: "select",
              props: { placeholder: "请选择状态", options: V.value, clearable: !0 },
              span: 6,
            },
          ]),
          q = k(null),
          S = k([]),
          z = k(!1),
          W = k(!1),
          Y = k([]),
          le = K(() => Y.value.map((e) => e.id).filter((e) => null != e && !Number.isNaN(e))),
          oe = k(!1),
          ie = k(!1),
          re = k(!1),
          we = k(!1),
          xe = k([]),
          ke = k([]),
          Ve = k(!1),
          Ae = k({}),
          Ce = [
            { label: "编号", prop: "id" },
            { label: "菜单名称", prop: "name" },
            { label: "菜单类型", prop: "type", slot: "type" },
            {
              label: "可见范围",
              prop: "scope",
              tag: { map: { single_org: { type: "success", text: "内部可用" } } },
            },
            { label: "图标", prop: "icon", slot: "icon" },
            { label: "权限标识", prop: "permission" },
            { label: "路由名称", prop: "route_name" },
            { label: "路由路径", prop: "route_path" },
            { label: "组件路径", prop: "component_path" },
            { label: "激活菜单路径", prop: "active_path" },
            { label: "重定向", prop: "redirect" },
            { label: "外链地址", prop: "link" },
            { label: "父级编号", prop: "parent_id" },
            { label: "父级菜单", prop: "parent_name" },
            {
              label: "是否缓存",
              prop: "keep_alive",
              tag: {
                map: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
            },
            {
              label: "是否显示",
              prop: "hidden",
              tag: {
                map: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
            },
            {
              label: "是否显示根路由",
              prop: "always_show",
              tag: {
                map: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
            },
            { label: "菜单标题", prop: "title" },
            { label: "路由参数", prop: "params" },
            {
              label: "是否固定路由",
              prop: "affix",
              tag: {
                map: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
            },
            {
              label: "嵌入iframe",
              prop: "is_iframe",
              tag: {
                map: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
            },
            {
              label: "隐藏标签页",
              prop: "is_hide_tab",
              tag: {
                map: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
            },
            {
              label: "显示红点角标",
              prop: "show_badge",
              tag: {
                map: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
            },
            { label: "文字角标内容", prop: "show_text_badge" },
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
          Ne = K(() => {
            const e = Ee.value.type;
            return [
              { key: "type", label: "菜单类型", type: "input" },
              { key: "parent_id", label: "父级菜单", type: "input", hidden: e === ge.CATALOG },
              {
                key: "name",
                label: "菜单名称",
                type: "input",
                props: { placeholder: "请输入菜单名称" },
              },
              {
                key: "title",
                label: "菜单标题",
                type: "input",
                props: { placeholder: "请输入菜单标题" },
              },
              { key: "icon", label: "图标", type: "input", hidden: e === ge.BUTTON },
              { key: "link", label: "外链地址", type: "input", hidden: e !== ge.EXTLINK },
              { key: "route_name", label: "路由名称", type: "input", hidden: e === ge.BUTTON },
              {
                key: "permission",
                label: "权限标识",
                type: "input",
                hidden: e !== ge.BUTTON && e !== ge.MENU,
              },
              {
                key: "route_path",
                label: "路由路径",
                type: "input",
                hidden: e !== ge.CATALOG && e !== ge.MENU,
              },
              { key: "component_path", label: "组件路径", type: "input", hidden: e !== ge.MENU },
              {
                key: "active_path",
                label: "激活菜单路径",
                type: "input",
                hidden: e !== ge.CATALOG && e !== ge.MENU,
              },
              {
                key: "redirect",
                label: "重定向",
                type: "input",
                hidden: e !== ge.CATALOG && e !== ge.MENU,
              },
              {
                key: "order",
                label: "排序",
                type: "number",
                props: { controlsPosition: "right", min: 1 },
              },
              { key: "is_iframe", label: "嵌入iframe", type: "input", hidden: e !== ge.EXTLINK },
              {
                key: "status",
                label: "状态",
                type: "radiogroup",
                props: {
                  options: [
                    { label: "启用", value: 0 },
                    { label: "禁用", value: 1 },
                  ],
                },
              },
              { key: "hidden", label: "是否隐藏", type: "input", hidden: e === ge.BUTTON },
              {
                key: "always_show",
                label: "始终显示",
                type: "input",
                hidden: e !== ge.CATALOG && e !== ge.MENU,
              },
              { key: "keep_alive", label: "缓存页面", type: "input", hidden: e !== ge.MENU },
              {
                key: "scope",
                label: "可见范围",
                type: "radiogroup",
                props: { options: [{ label: "内部可用", value: "single_org" }] },
                hidden: e === ge.BUTTON,
              },
              { key: "affix", label: "常驻标签栏", type: "input", hidden: e === ge.BUTTON },
              { key: "is_hide_tab", label: "隐藏标签页", type: "input", hidden: e === ge.BUTTON },
              { key: "show_badge", label: "显示红点角标", type: "input", hidden: e === ge.BUTTON },
              {
                key: "show_text_badge",
                label: "文字角标内容",
                type: "input",
                hidden: e === ge.BUTTON || !Ee.value.show_badge,
              },
              { key: "params", label: "路由参数", type: "input", span: 24, hidden: e !== ge.MENU },
              {
                key: "description",
                label: "描述",
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
            ];
          }),
          Ee = k({
            id: void 0,
            name: void 0,
            type: ge.CATALOG,
            icon: void 0,
            order: 999,
            permission: "",
            route_name: "",
            route_path: "",
            component_path: void 0,
            redirect: void 0,
            parent_id: void 0,
            keep_alive: !1,
            hidden: !1,
            always_show: !1,
            title: "",
            params: void 0,
            affix: !1,
            link: void 0,
            is_iframe: !1,
            is_hide_tab: !1,
            active_path: void 0,
            show_badge: !1,
            show_text_badge: void 0,
            status: 0,
            scope: "single_org",
            description: void 0,
          }),
          Le = J({ title: "", visible: !1, type: "create" }),
          Me = K(() => (i.device === te.DESKTOP ? "900px" : "90%"));
        function Be(e, a = ke.value) {
          if (null == e) return null;
          for (const t of a) {
            if (t.id === e) return t;
            if (t.children?.length) {
              const a = Be(e, t.children);
              if (a) return a;
            }
          }
          return null;
        }
        function Ge(e) {
          return e
            .filter((e) => e.type === ge.CATALOG || e.type === ge.MENU)
            .map((e) => ({ ...e, children: e.children ? Ge(e.children) : [] }));
        }
        async function Ie() {
          z.value = !0;
          try {
            const a =
              (
                await _e.listMenu({
                  ...((e = p.value),
                  {
                    name: e.name,
                    status: e.status,
                    created_time:
                      Array.isArray(e.created_time) && 2 === e.created_time.length
                        ? e.created_time
                        : void 0,
                  }),
                })
              ).data.data || [];
            ((ke.value = a), (S.value = a), (xe.value = ae(Ge(a))));
          } catch (a) {
          } finally {
            z.value = !1;
          }
          var e;
        }
        async function qe(e) {
          (await w.value?.validate?.(), (p.value = { ...e }), await Ie());
        }
        function Se() {
          ((p.value = { name: void 0, status: void 0, created_time: void 0 }), Ie());
        }
        function ze(e) {
          Y.value = e;
        }
        function Re() {
          ((W.value = !W.value),
            Q(() => {
              const e = q.value?.elTableRef;
              if (!e || !S.value.length) return;
              const a = (t) => {
                t.forEach((t) => {
                  t.children?.length && (e.toggleRowExpansion(t, W.value), a(t.children));
                });
              };
              a(S.value);
            }));
        }
        const We = {
            onAdd: (e) => {
              aa("create", void 0, e);
            },
            onDetail: (e) => {
              aa("detail", e);
            },
            onEdit: (e) => {
              aa("update", e);
            },
            onDelete: async function (e) {
              try {
                (await _.confirm("确认删除该项数据?", "警告", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                }),
                  await _e.deleteMenu([e]),
                  await r.getUserInfo(),
                  (Y.value = []),
                  await Ie());
              } catch {}
            },
          },
          { columnChecks: Ke, columns: De } = ne(
            me(() => [
              { type: "selection", width: 48, fixed: "left" },
              { type: "index", label: "序号", width: 60, fixed: "left" },
              { prop: "name", label: "菜单名称", minWidth: 200, showOverflowTooltip: !0 },
              {
                prop: "icon",
                label: "图标",
                width: 72,
                align: "center",
                formatter: (e) =>
                  e.icon
                    ? H(be, { icon: e.icon, style: { verticalAlign: "-0.15em" } })
                    : H("span", { class: "text-g-400" }, "—"),
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
              {
                prop: "type",
                label: "类型",
                width: 88,
                align: "center",
                status: {
                  1: { type: "warning", text: "目录" },
                  2: { type: "success", text: "菜单" },
                  3: { type: "danger", text: "按钮" },
                  4: { type: "info", text: "外链" },
                },
              },
              {
                prop: "scope",
                label: "可见范围",
                width: 96,
                align: "center",
                status: { single_org: { type: "success", text: "内部可用" } },
              },
              { prop: "order", label: "排序", width: 80 },
              { prop: "route_name", label: "路由名称", minWidth: 100, showOverflowTooltip: !0 },
              { prop: "route_path", label: "路由路径", minWidth: 140, showOverflowTooltip: !0 },
              { prop: "permission", label: "权限标识", minWidth: 160, showOverflowTooltip: !0 },
              { prop: "component_path", label: "组件路径", minWidth: 140, showOverflowTooltip: !0 },
              { prop: "active_path", label: "激活路径", minWidth: 100, showOverflowTooltip: !0 },
              { prop: "redirect", label: "重定向", minWidth: 100, showOverflowTooltip: !0 },
              { prop: "link", label: "外链地址", minWidth: 140, showOverflowTooltip: !0 },
              {
                prop: "keep_alive",
                label: "是否缓存",
                width: 96,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              {
                prop: "hidden",
                label: "是否隐藏",
                width: 96,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              {
                prop: "always_show",
                label: "显示根路由",
                width: 108,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              {
                prop: "affix",
                label: "固定路由",
                width: 96,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              { prop: "title", label: "菜单标题", minWidth: 100, showOverflowTooltip: !0 },
              {
                prop: "is_iframe",
                label: "嵌入iframe",
                width: 100,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              {
                prop: "is_hide_tab",
                label: "隐藏标签页",
                width: 100,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              {
                prop: "show_badge",
                label: "红点角标",
                width: 96,
                status: {
                  true: { type: "success", text: "是" },
                  false: { type: "danger", text: "否" },
                },
              },
              { prop: "show_text_badge", label: "文字角标", width: 100, showOverflowTooltip: !0 },
              {
                prop: "params",
                label: "路由参数",
                minWidth: 100,
                formatter: (e) =>
                  null == e.params
                    ? "—"
                    : "object" == typeof e.params
                      ? JSON.stringify(e.params)
                      : String(e.params),
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
                formatter: (e) => s(e, We),
              },
            ])
          ),
          Xe = J({
            name: [
              { required: !0, message: "请输入菜单名称", trigger: "blur" },
              { min: 2, max: 50, message: "长度 2 到 50 个字符", trigger: "blur" },
            ],
            parent_id: [{ required: !0, message: "请选择父级菜单", trigger: "blur" }],
            type: [{ required: !0, message: "请选择菜单类型", trigger: "blur" }],
            order: [{ required: !0, message: "请输入排序", trigger: "blur" }],
            permission: [{ required: !0, message: "请输入权限标识", trigger: "blur" }],
            route_name: [{ required: !0, message: "请输入路由名称", trigger: "blur" }],
            route_path: [{ required: !0, message: "请输入路由路径", trigger: "blur" }],
            component_path: [{ required: !0, message: "请输入组件路径", trigger: "blur" }],
            title: [
              { required: !0, message: "请输入菜单标题", trigger: "blur" },
              { min: 2, max: 50, message: "长度 2 到 50 个字符", trigger: "blur" },
            ],
            keep_alive: [{ required: !0, message: "请选择是否缓存", trigger: "change" }],
            hidden: [{ required: !0, message: "请选择是否隐藏", trigger: "change" }],
            always_show: [{ required: !0, message: "请选择始终显示", trigger: "change" }],
            status: [{ required: !0, message: "请选择状态", trigger: "change" }],
            redirect: [
              {
                validator: (e, a, t) => {
                  Ee.value.type !== ge.CATALOG || (null != a && "" !== String(a).trim())
                    ? t()
                    : t(new Error("目录类型必须填写重定向地址"));
                },
                trigger: "blur",
              },
            ],
          }),
          Fe = k(),
          $e = {
            id: void 0,
            name: void 0,
            type: ge.MENU,
            icon: void 0,
            order: 1,
            permission: "",
            route_name: "",
            route_path: "",
            component_path: "",
            redirect: "",
            parent_id: void 0,
            keep_alive: !1,
            hidden: !1,
            always_show: !1,
            title: "",
            params: [],
            affix: !1,
            link: void 0,
            is_iframe: !1,
            is_hide_tab: !1,
            active_path: void 0,
            show_badge: !1,
            show_text_badge: void 0,
            status: 0,
            description: void 0,
            scope: "single_org",
          },
          Pe = k(null),
          Je = k(0);
        async function Qe() {
          (Pe.value && (Pe.value.resetFields(), Pe.value.clearValidate()),
            Object.assign(Ee.value, $e));
        }
        async function He(e) {
          Fe.value = e.id;
        }
        const Ye = K(() => {
          const e = Be(Ee.value.parent_id);
          return e?.type
            ? (function (e) {
                switch (e) {
                  case ge.CATALOG:
                    return [ge.CATALOG, ge.MENU, ge.EXTLINK];
                  case ge.MENU:
                    return [ge.BUTTON];
                  case ge.BUTTON:
                  case ge.EXTLINK:
                    return [];
                  default:
                    return [ge.CATALOG, ge.MENU, ge.EXTLINK];
                }
              })(e.type)
            : [ge.CATALOG, ge.MENU, ge.EXTLINK];
        });
        async function Ze() {
          ((Le.visible = !1), (Ve.value = !1), await Qe());
        }
        async function ea() {
          re.value = !0;
          try {
            await aa("create");
          } finally {
            re.value = !1;
          }
        }
        async function aa(e, a, t) {
          if (((Le.type = e), (Ve.value = !1), a)) {
            const t = await _e.detailMenu(a);
            "detail" === e
              ? ((Le.title = "菜单详情"), Object.assign(Ae.value, t.data.data ?? {}))
              : "update" === e &&
                ((Le.title = "修改菜单"), Object.assign(Ee.value, t.data.data ?? {}));
          } else
            ((Le.title = "新增菜单"),
              (Ee.value = { ...$e }),
              (Je.value += 1),
              null != t?.id &&
                ((Ee.value.parent_id = t.id),
                t.type === ge.MENU
                  ? ((Ve.value = !0), (Ee.value.type = ge.BUTTON))
                  : t.type === ge.CATALOG && (Ee.value.type = ge.MENU)));
          Le.visible = !0;
        }
        function ta() {
          (Ee.value.type === ge.MENU && (Ee.value.component_path = ""),
            Q(() => {
              (Pe.value?.clearValidate("redirect"),
                Ee.value.type === ge.CATALOG &&
                  Pe.value?.validateField("redirect")?.catch(() => {}));
            }));
        }
        async function la() {
          const e = le.value;
          if (0 !== e.length)
            try {
              (await _.confirm(`确定删除选中的 ${e.length} 条数据吗？`, "批量删除", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              }),
                (oe.value = !0),
                await _e.deleteMenu(e),
                await r.getUserInfo(),
                (Y.value = []),
                await Ie());
            } catch {
            } finally {
              oe.value = !1;
            }
        }
        async function oa(e) {
          const a = le.value;
          if (a.length) {
            _.confirm(`确认${0 === e ? "启用" : "停用"}该项数据?`, "警告", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            });
            try {
              (await _.confirm("确认启用或停用该项数据?", "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              }),
                (we.value = !0),
                await _e.batchMenu({ ids: a, status: e }),
                await Ie());
            } catch {
            } finally {
              we.value = !1;
            }
          } else g.warning("请先选择要操作的数据");
        }
        return (
          T(() => {
            Ie();
          }),
          (t, o) => {
            const i = ce,
              s = he,
              _ = d,
              g = fe,
              k = ye,
              V = u,
              T = ue,
              K = pe,
              J = y,
              Q = v,
              H = c,
              Y = m,
              Z = l,
              ee = n,
              ae = Te,
              te = a,
              se = e,
              ne = D("ripple");
            return (
              j(),
              O("div", Ue, [
                C(ve, { title: "菜单管理" }),
                L("div", je, [
                  X(
                    C(
                      i,
                      {
                        ref_key: "searchBarRef",
                        ref: w,
                        modelValue: N(p),
                        "onUpdate:modelValue":
                          o[0] || (o[0] = (e) => (M(p) ? (p.value = e) : null)),
                        items: N(U),
                        rules: x,
                        "is-expand": !1,
                        "show-expand": !0,
                        "show-reset": !0,
                        "show-search": !0,
                        "disabled-search": !1,
                        "default-expanded": !1,
                        "include-audit": "",
                        onSearch: qe,
                        onReset: Se,
                      },
                      null,
                      8,
                      ["modelValue", "items"]
                    ),
                    [[F, N(b)]]
                  ),
                  C(
                    V,
                    {
                      shadow: "hover",
                      class: "fa-table-card",
                      style: A({ "margin-top": N(b) ? "12px" : "0" }),
                    },
                    {
                      default: E(() => [
                        C(
                          g,
                          {
                            columns: N(Ke),
                            "onUpdate:columns":
                              o[1] || (o[1] = (e) => (M(Ke) ? (Ke.value = e) : null)),
                            showSearchBar: N(b),
                            "onUpdate:showSearchBar":
                              o[2] || (o[2] = (e) => (M(b) ? (b.value = e) : null)),
                            loading: N(z),
                            onRefresh: Ie,
                          },
                          {
                            left: E(() => [
                              L("div", Oe, [
                                C(
                                  s,
                                  {
                                    "remove-ids": N(le),
                                    "perm-create": ["module_platform:menu:create"],
                                    "perm-delete": ["module_platform:menu:delete"],
                                    "perm-patch": ["module_platform:menu:patch"],
                                    "delete-loading": N(oe),
                                    "create-loading": N(re),
                                    "more-loading": N(we),
                                    onAdd: ea,
                                    onDelete: la,
                                    onMore: oa,
                                  },
                                  null,
                                  8,
                                  ["remove-ids", "delete-loading", "create-loading", "more-loading"]
                                ),
                                X(
                                  (j(),
                                  I(
                                    _,
                                    { onClick: Re },
                                    { default: E(() => [$(P(N(W) ? "收起" : "展开"), 1)]), _: 1 }
                                  )),
                                  [[ne]]
                                ),
                              ]),
                            ]),
                            _: 1,
                          },
                          8,
                          ["columns", "showSearchBar", "loading"]
                        ),
                        C(
                          k,
                          {
                            ref_key: "tableRef",
                            ref: q,
                            "row-key": "id",
                            loading: N(z),
                            columns: N(De),
                            data: N(S),
                            "tree-props": { children: "children", hasChildren: "hasChildren" },
                            "default-expand-all": !1,
                            onSelectionChange: ze,
                            onRowClick: He,
                          },
                          null,
                          8,
                          ["loading", "columns", "data"]
                        ),
                      ]),
                      _: 1,
                    },
                    8,
                    ["style"]
                  ),
                  C(
                    se,
                    {
                      modelValue: N(Le).visible,
                      "onUpdate:modelValue": o[24] || (o[24] = (e) => (N(Le).visible = e)),
                      title: N(Le).title,
                      size: N(Me),
                      "form-mode": N(Le).type,
                      "confirm-loading": N(ie),
                      onCancel: Ze,
                      onConfirm:
                        o[25] ||
                        (o[25] = (e) =>
                          "detail" === N(Le).type
                            ? Ze()
                            : (async function () {
                                const e = Ye.value;
                                if (!e.length) return;
                                const a = Ee.value.type;
                                (e.includes(a) || (Ee.value.type = e[0]),
                                  Pe.value?.validate(async (e) => {
                                    if (!e) return;
                                    ie.value = !0;
                                    const a = Ee.value.id;
                                    try {
                                      (a
                                        ? await _e.updateMenu(a, { id: a, ...Ee.value })
                                        : await _e.createMenu(Ee.value),
                                        (Le.visible = !1),
                                        await Qe(),
                                        await Ie(),
                                        await r.getUserInfo());
                                    } catch (t) {
                                    } finally {
                                      ie.value = !1;
                                    }
                                  }));
                              })()),
                    },
                    {
                      default: E(() => [
                        "detail" === N(Le).type
                          ? (j(),
                            I(
                              K,
                              { key: 0, column: 4, data: N(Ae), items: Ce, scrollbar: !1 },
                              {
                                type: E(({ row: e }) => [
                                  e?.type === N(ge).CATALOG
                                    ? (j(), I(T, { key: 0, type: "warning", label: "目录" }))
                                    : R("", !0),
                                  e?.type === N(ge).MENU
                                    ? (j(), I(T, { key: 1, type: "success", label: "菜单" }))
                                    : R("", !0),
                                  e?.type === N(ge).BUTTON
                                    ? (j(), I(T, { key: 2, type: "danger", label: "按钮" }))
                                    : R("", !0),
                                  e?.type === N(ge).EXTLINK
                                    ? (j(), I(T, { key: 3, type: "info", label: "外链" }))
                                    : R("", !0),
                                ]),
                                icon: E(({ row: e }) => [
                                  e?.icon
                                    ? (j(),
                                      I(
                                        be,
                                        { key: 0, icon: e?.icon, style: "vertical-align: -0.15em" },
                                        null,
                                        8,
                                        ["icon"]
                                      ))
                                    : R("", !0),
                                ]),
                                _: 1,
                              },
                              8,
                              ["data"]
                            ))
                          : (j(),
                            I(
                              te,
                              {
                                key: N(Je),
                                ref_key: "dataFormRef",
                                ref: Pe,
                                modelValue: N(Ee),
                                "onUpdate:modelValue":
                                  o[23] || (o[23] = (e) => (M(Ee) ? (Ee.value = e) : null)),
                                items: N(Ne),
                                rules: N(Xe),
                                "label-suffix": ":",
                                "label-width": 100,
                                "label-position": "right",
                                span: 12,
                                gutter: 16,
                                "show-reset": !1,
                                "show-submit": !1,
                                class: "crud-dialog-art-form",
                              },
                              {
                                parent_id: E(() => [
                                  C(
                                    J,
                                    {
                                      modelValue: N(Ee).parent_id,
                                      "onUpdate:modelValue":
                                        o[3] || (o[3] = (e) => (N(Ee).parent_id = e)),
                                      placeholder: "选择上级菜单",
                                      data: N(xe),
                                      "node-key": "value",
                                      filterable: "",
                                      "check-strictly": "",
                                      "render-after-expand": !1,
                                      disabled: N(Ve),
                                    },
                                    null,
                                    8,
                                    ["modelValue", "data", "disabled"]
                                  ),
                                  N(Ve)
                                    ? (j(),
                                      I(
                                        Q,
                                        {
                                          key: 0,
                                          type: "info",
                                          size: "small",
                                          class: "block mt-1",
                                        },
                                        {
                                          default: E(() => [
                                            ...(o[26] ||
                                              (o[26] = [
                                                $(" 在菜单下仅可新增按钮，父级已固定 ", -1),
                                              ])),
                                          ]),
                                          _: 1,
                                        }
                                      ))
                                    : R("", !0),
                                ]),
                                type: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).type,
                                      "onUpdate:modelValue":
                                        o[4] || (o[4] = (e) => (N(Ee).type = e)),
                                      onChange: ta,
                                    },
                                    {
                                      default: E(() => [
                                        N(Ye).includes(N(ge).CATALOG)
                                          ? (j(),
                                            I(
                                              H,
                                              { key: 0, value: N(ge).CATALOG },
                                              {
                                                default: E(() => [
                                                  ...(o[27] || (o[27] = [$(" 目录 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["value"]
                                            ))
                                          : R("", !0),
                                        N(Ye).includes(N(ge).MENU)
                                          ? (j(),
                                            I(
                                              H,
                                              { key: 1, value: N(ge).MENU },
                                              {
                                                default: E(() => [
                                                  ...(o[28] || (o[28] = [$(" 菜单 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["value"]
                                            ))
                                          : R("", !0),
                                        N(Ye).includes(N(ge).BUTTON)
                                          ? (j(),
                                            I(
                                              H,
                                              { key: 2, value: N(ge).BUTTON },
                                              {
                                                default: E(() => [
                                                  ...(o[29] || (o[29] = [$(" 按钮 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["value"]
                                            ))
                                          : R("", !0),
                                        N(Ye).includes(N(ge).EXTLINK)
                                          ? (j(),
                                            I(
                                              H,
                                              { key: 3, value: N(ge).EXTLINK },
                                              {
                                                default: E(() => [
                                                  ...(o[30] || (o[30] = [$(" 外链 ", -1)])),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["value"]
                                            ))
                                          : R("", !0),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                link: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).link,
                                      "onUpdate:modelValue":
                                        o[5] || (o[5] = (e) => (N(Ee).link = e)),
                                      placeholder: "请输入外链完整路径",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                is_iframe: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).is_iframe,
                                      "onUpdate:modelValue":
                                        o[6] || (o[6] = (e) => (N(Ee).is_iframe = e)),
                                    },
                                    {
                                      default: E(() => [
                                        C(
                                          H,
                                          { value: !0 },
                                          {
                                            default: E(() => [
                                              ...(o[31] || (o[31] = [$("是", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        C(
                                          H,
                                          { value: !1 },
                                          {
                                            default: E(() => [
                                              ...(o[32] || (o[32] = [$("否", -1)])),
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
                                ]),
                                route_name: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).route_name,
                                      "onUpdate:modelValue":
                                        o[7] || (o[7] = (e) => (N(Ee).route_name = e)),
                                      placeholder: "请输入路由名称",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                route_path: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).route_path,
                                      "onUpdate:modelValue":
                                        o[8] || (o[8] = (e) => (N(Ee).route_path = e)),
                                      placeholder: "请输入路由路径，如 system",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                component_path: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).component_path,
                                      "onUpdate:modelValue":
                                        o[9] || (o[9] = (e) => (N(Ee).component_path = e)),
                                      placeholder: "请输入组件路径，如system/user/index",
                                      style: "width: 95%",
                                    },
                                    {
                                      prepend: E(() => [
                                        ...(o[33] || (o[33] = [$("src/views/", -1)])),
                                      ]),
                                      append: E(() => [...(o[34] || (o[34] = [$(".vue", -1)]))]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                active_path: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).active_path,
                                      "onUpdate:modelValue":
                                        o[10] || (o[10] = (e) => (N(Ee).active_path = e)),
                                      placeholder: "请输入激活菜单路径，用于高亮父级菜单",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                params: E(() => [
                                  !N(Ee).params ||
                                  (Array.isArray(N(Ee).params) && 0 === N(Ee).params.length)
                                    ? (j(),
                                      I(
                                        _,
                                        {
                                          key: 0,
                                          type: "success",
                                          plain: "",
                                          onClick:
                                            o[11] ||
                                            (o[11] = (e) =>
                                              (N(Ee).params = [{ key: "", value: "" }])),
                                        },
                                        {
                                          default: E(() => [
                                            ...(o[35] || (o[35] = [$(" 添加路由参数 ", -1)])),
                                          ]),
                                          _: 1,
                                        }
                                      ))
                                    : (j(!0),
                                      O(
                                        B,
                                        { key: 1 },
                                        G(
                                          N(Ee).params,
                                          (e, a) => (
                                            j(),
                                            O("div", { key: a }, [
                                              C(
                                                Z,
                                                {
                                                  modelValue: e.key,
                                                  "onUpdate:modelValue": (a) => (e.key = a),
                                                  placeholder: "参数名",
                                                  style: "width: 100px",
                                                },
                                                null,
                                                8,
                                                ["modelValue", "onUpdate:modelValue"]
                                              ),
                                              o[36] ||
                                                (o[36] = L("span", { class: "mx-1" }, "=", -1)),
                                              C(
                                                Z,
                                                {
                                                  modelValue: e.value,
                                                  "onUpdate:modelValue": (a) => (e.value = a),
                                                  placeholder: "参数值",
                                                  style: "width: 100px",
                                                },
                                                null,
                                                8,
                                                ["modelValue", "onUpdate:modelValue"]
                                              ),
                                              N(Ee).params.indexOf(e) === N(Ee).params.length - 1
                                                ? (j(),
                                                  I(
                                                    ee,
                                                    {
                                                      key: 0,
                                                      class:
                                                        "ml-2 cursor-pointer color-[var(--el-color-success)]",
                                                      style: "vertical-align: -0.15em",
                                                      onClick:
                                                        o[12] ||
                                                        (o[12] = (e) =>
                                                          N(Ee).params.push({
                                                            key: "",
                                                            value: "",
                                                          })),
                                                    },
                                                    { default: E(() => [C(N(f))]), _: 1 }
                                                  ))
                                                : R("", !0),
                                              C(
                                                ee,
                                                {
                                                  class:
                                                    "ml-2 cursor-pointer color-[var(--el-color-danger)]",
                                                  style: "vertical-align: -0.15em",
                                                  onClick: (a) =>
                                                    N(Ee).params.splice(N(Ee).params.indexOf(e), 1),
                                                },
                                                { default: E(() => [C(N(h))]), _: 1 },
                                                8,
                                                ["onClick"]
                                              ),
                                            ])
                                          )
                                        ),
                                        128
                                      )),
                                ]),
                                hidden: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).hidden,
                                      "onUpdate:modelValue":
                                        o[13] || (o[13] = (e) => (N(Ee).hidden = e)),
                                    },
                                    {
                                      default: E(() => [
                                        C(
                                          H,
                                          { value: !0 },
                                          {
                                            default: E(() => [
                                              ...(o[37] || (o[37] = [$("是", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        C(
                                          H,
                                          { value: !1 },
                                          {
                                            default: E(() => [
                                              ...(o[38] || (o[38] = [$("否", -1)])),
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
                                ]),
                                always_show: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).always_show,
                                      "onUpdate:modelValue":
                                        o[14] || (o[14] = (e) => (N(Ee).always_show = e)),
                                    },
                                    {
                                      default: E(() => [
                                        C(
                                          H,
                                          { value: !0 },
                                          {
                                            default: E(() => [
                                              ...(o[39] || (o[39] = [$("是", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        C(
                                          H,
                                          { value: !1 },
                                          {
                                            default: E(() => [
                                              ...(o[40] || (o[40] = [$("否", -1)])),
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
                                ]),
                                keep_alive: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).keep_alive,
                                      "onUpdate:modelValue":
                                        o[15] || (o[15] = (e) => (N(Ee).keep_alive = e)),
                                    },
                                    {
                                      default: E(() => [
                                        C(
                                          H,
                                          { value: !0 },
                                          {
                                            default: E(() => [
                                              ...(o[41] || (o[41] = [$("开启", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        C(
                                          H,
                                          { value: !1 },
                                          {
                                            default: E(() => [
                                              ...(o[42] || (o[42] = [$("关闭", -1)])),
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
                                ]),
                                permission: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).permission,
                                      "onUpdate:modelValue":
                                        o[16] || (o[16] = (e) => (N(Ee).permission = e)),
                                      placeholder: "请输入权限标识，如sys:user:add",
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                icon: E(() => [
                                  C(
                                    ae,
                                    {
                                      modelValue: N(Ee).icon,
                                      "onUpdate:modelValue":
                                        o[17] || (o[17] = (e) => (N(Ee).icon = e)),
                                    },
                                    null,
                                    8,
                                    ["modelValue"]
                                  ),
                                ]),
                                redirect: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).redirect,
                                      "onUpdate:modelValue":
                                        o[18] || (o[18] = (e) => (N(Ee).redirect = e)),
                                      placeholder:
                                        N(Ee).type === N(ge).CATALOG
                                          ? "目录必填，一般为默认子路由 path，如 /system/user"
                                          : "可选，请输入重定向路由",
                                    },
                                    null,
                                    8,
                                    ["modelValue", "placeholder"]
                                  ),
                                ]),
                                affix: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).affix,
                                      "onUpdate:modelValue":
                                        o[19] || (o[19] = (e) => (N(Ee).affix = e)),
                                    },
                                    {
                                      default: E(() => [
                                        C(
                                          H,
                                          { value: !0 },
                                          {
                                            default: E(() => [
                                              ...(o[43] || (o[43] = [$("是", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        C(
                                          H,
                                          { value: !1 },
                                          {
                                            default: E(() => [
                                              ...(o[44] || (o[44] = [$("否", -1)])),
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
                                ]),
                                is_hide_tab: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).is_hide_tab,
                                      "onUpdate:modelValue":
                                        o[20] || (o[20] = (e) => (N(Ee).is_hide_tab = e)),
                                    },
                                    {
                                      default: E(() => [
                                        C(
                                          H,
                                          { value: !0 },
                                          {
                                            default: E(() => [
                                              ...(o[45] || (o[45] = [$("是", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        C(
                                          H,
                                          { value: !1 },
                                          {
                                            default: E(() => [
                                              ...(o[46] || (o[46] = [$("否", -1)])),
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
                                ]),
                                show_badge: E(() => [
                                  C(
                                    Y,
                                    {
                                      modelValue: N(Ee).show_badge,
                                      "onUpdate:modelValue":
                                        o[21] || (o[21] = (e) => (N(Ee).show_badge = e)),
                                    },
                                    {
                                      default: E(() => [
                                        C(
                                          H,
                                          { value: !0 },
                                          {
                                            default: E(() => [
                                              ...(o[47] || (o[47] = [$("是", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        C(
                                          H,
                                          { value: !1 },
                                          {
                                            default: E(() => [
                                              ...(o[48] || (o[48] = [$("否", -1)])),
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
                                ]),
                                show_text_badge: E(() => [
                                  C(
                                    Z,
                                    {
                                      modelValue: N(Ee).show_text_badge,
                                      "onUpdate:modelValue":
                                        o[22] || (o[22] = (e) => (N(Ee).show_text_badge = e)),
                                      placeholder: "请输入文字角标内容",
                                    },
                                    null,
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
                    ["modelValue", "title", "size", "form-mode", "confirm-loading"]
                  ),
                ]),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-847fa898"]]
  );
export { Ae as default };
