import { _ as e } from "./index.BpYlApL9.js";
import {
  aK as l,
  A as a,
  aM as n,
  d as t,
  g as o,
  aS as r,
  a0 as i,
  a1 as s,
  h as d,
  k as u,
  a as c,
  a9 as f,
  z as p,
  aI as m,
  w as v,
  x as h,
  V as g,
  M as _,
  U as x,
  ac as y,
  u as b,
  G as w,
  J as k,
} from "./element-plus.BPg5EhXK.js";
import {
  br as S,
  a1 as C,
  G as V,
  al as T,
  j as I,
  z as R,
  ag as E,
  p as j,
  m as B,
  w as M,
  aI as U,
  X as z,
  bt as D,
  v as A,
  ax as N,
  bu as F,
  n as K,
  F as L,
  ao as P,
  ac as G,
  o as O,
  bw as q,
} from "./vue-vendor.Dwx3gfQr.js";
import { Y as J, q as W, B as X, a6 as Y, D as Z } from "./index.CJ_YH8gZ.js";
import "./file-saver.CjVB4eGa.js";
import { _ as H } from "./index.vue_vue_type_script_setup_true_lang.BjaQnZim.js";
import { _ as Q } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import { R as $ } from "./role.Br_Al1vx.js";
import { D as ee } from "./dept.qQ6KULTg.js";
import { M as le } from "./menu.BhC7sKR_.js";
function ae(e) {
  return 1 === e || 2 === e;
}
function ne(e) {
  return null != e && e >= 3;
}
function te(e) {
  const l = { menuTree: e.menuTree, checkedIds: e.checkedIds ?? [], loading: e.loading },
    a = T(""),
    n = T(!0),
    t = T(!0),
    o = T(!1),
    r = T(),
    i = T([]),
    s = T({}),
    d = T(new Set()),
    u = I(() =>
      a.value
        ? (function (e, l) {
            if (!l) return e;
            const a = l.toLowerCase();
            function n(e) {
              const l = (e.name || "").toLowerCase().includes(a),
                t = e.children?.map(n).filter(Boolean) ?? [];
              return l || t.length > 0 ? { ...e, children: t.length > 0 ? t : e.children } : null;
            }
            return e.map(n).filter(Boolean);
          })(l.menuTree, a.value)
        : l.menuTree
    );
  function c(e, l) {
    for (const a of e) (l(a), a.children && c(a.children, l));
  }
  function f(e, l) {
    for (const a of l) {
      if (a.id === e) return a;
      if (a.children) {
        const l = f(e, a.children);
        if (l) return l;
      }
    }
  }
  function p(e, l) {
    for (const a of l) {
      if (a.id === e) return a;
      if (a.children) {
        const l = p(e, a.children);
        if (l) return l;
      }
    }
  }
  function m(e, l) {
    for (const a of l) {
      if (a.children?.some((l) => l.id === e)) return a;
      if (a.children) {
        const l = m(e, a.children);
        if (l) return l;
      }
    }
    return null;
  }
  function v(e) {
    const a = f(e.id, l.menuTree);
    return a?.children ? a.children.filter((e) => ne(e.type)) : [];
  }
  function h(e) {
    if (s.value[e.id]?.length) return !0;
    const l = p(e.id, i.value);
    if (l?.children) for (const a of l.children) if (ae(a.type) && h(a)) return !0;
    return !1;
  }
  function g(e) {
    return (function e(a, n) {
      for (const t of a) {
        if (t.children?.some((e) => e.id === n)) return [t.id, ...e(l.menuTree, t.id)];
        if (t.children) {
          const l = e(t.children, n);
          if (l.length > 0) return l;
        }
      }
      return [];
    })(l.menuTree, e)
      .map((e) => p(e, i.value))
      .filter(Boolean);
  }
  function _(e) {
    return e
      .filter((e) => ae(e.type))
      .map((e) => ({ ...e, children: e.children ? _(e.children) : void 0 }));
  }
  function x(e) {
    const l = v(e).map((e) => e.id);
    l.length && (s.value[e.id] = l);
  }
  function y(e) {
    (r.value?.toggleRowSelection(e, !0), x(e));
    const l = p(e.id, i.value);
    if (l?.children) for (const a of l.children) ae(a.type) && y(a);
  }
  function b(e) {
    (r.value?.toggleRowSelection(e, !1), (s.value[e.id] = []));
    const l = p(e.id, i.value);
    if (l?.children) for (const a of l.children) ae(a.type) && b(a);
  }
  function w(e) {
    g(e.id).forEach((e) => r.value?.toggleRowSelection(e, !0));
  }
  function k(e) {
    g(e.id).forEach((e) => {
      h(e) || r.value?.toggleRowSelection(e, !1);
    });
  }
  function R(e) {
    o.value = !0;
    try {
      e();
    } finally {
      o.value = !1;
    }
  }
  function E(e) {
    C(() => {
      const l = r.value;
      l &&
        i.value.length &&
        c(i.value, (a) => {
          a.children?.length && l.toggleRowExpansion(a, e);
        });
    });
  }
  async function j(e) {
    await C();
    const a = {},
      n = [];
    (c(i.value, (l) => {
      ae(l.type) && e.includes(l.id) && n.push(l);
    }),
      c(l.menuTree, (n) => {
        if (!ne(n.type) || !e.includes(n.id)) return;
        const t = m(n.id, l.menuTree);
        t && (a[t.id] ??= []).push(n.id);
      }),
      (s.value = a),
      R(() => {
        const e = r.value?.store;
        e && (e.clearSelection(), n.forEach((l) => e.toggleRowSelection(l, !0, !1)));
      }));
  }
  function B() {
    a.value = "";
    const e = l.menuTree;
    ((t.value = (function (e, l) {
      if (!e.length || !l.length) return !0;
      const a = new Map();
      c(l, (e) => a.set(e.id, e));
      for (const n of e) {
        const t = a.get(n);
        if (!t) continue;
        if (t.children?.length && t.children.some((l) => !e.includes(l.id))) return !1;
        const o = m(n, l);
        if (o && !e.includes(o.id)) return !1;
      }
      return !0;
    })(l.checkedIds, e)),
      (i.value = _(e)),
      C(() => j(l.checkedIds)));
  }
  return (
    S(
      () => [l.menuTree, l.checkedIds],
      () => B(),
      { immediate: !1 }
    ),
    S(a, () => {
      const e = u.value;
      ((i.value = _(e)), C(() => j(l.checkedIds)), a.value && E(!0));
    }),
    {
      // 状态
      filterText: a,
      isExpanded: n,
      parentChildLinked: t,
      permTableRef: r,
      tableData: i,
      checkedBtns: s,
      // 工具
      formatMenuName: function (e) {
        const l = e.name || "";
        return e.icon
          ? V("span", { class: "inline-flex items-center gap-1.5" }, [
              V(H, { icon: e.icon, style: { verticalAlign: "-0.15em" } }),
              l,
            ])
          : l;
      },
      getMenuBtns: v,
      // 事件
      onSelectionChange: function () {
        const e = r.value?.store,
          l = e?.states?.selection?.value || [],
          a = new Set();
        (l.forEach((e) => {
          ae(e.type) && a.add(e.id);
        }),
          (d.value = a),
          0 === a.size && (s.value = {}));
      },
      onSelectAll: function () {
        const e = r.value?.store,
          l = e?.states?.selection?.value || [];
        R(() => {
          if (!l.length) return ((s.value = {}), void d.value.clear());
          for (const e of l) ae(e.type) && (d.value.add(e.id), t.value && x(e));
        });
      },
      onSelect: function (e, l) {
        if (o.value || !t.value) return;
        const a = p(l.id, i.value);
        if (!a) return;
        const n = e.some((e) => e.id === a.id);
        R(() => {
          n ? (w(a), y(a)) : (b(a), k(a));
        });
      },
      onBtnChange: function (e, l) {
        ((s.value[e.id] = l.map((e) => Number(e))),
          t.value &&
            R(() => {
              l.length > 0
                ? (r.value?.toggleRowSelection(e, !0), w(e))
                : h(e) || (r.value?.toggleRowSelection(e, !1), k(e));
            }));
      },
      toggleExpand: function () {
        ((n.value = !n.value), E(n.value));
      },
      // 对外方法
      getCheckedIds: function () {
        const e = new Set();
        return (
          d.value.forEach((l) => e.add(l)),
          Object.values(s.value).forEach((l) => l.forEach((l) => e.add(l))),
          [...e]
        );
      },
      refresh: B,
    }
  );
}
const oe = { class: "flex flex-col h-full overflow-hidden" },
  re = { class: "mb-3 flex items-center gap-3 shrink-0" },
  ie = Q(
    R({
      name: "FaMenuTreeTable",
      __name: "index",
      props: { menuTree: {}, checkedIds: { default: () => [] }, loading: { type: Boolean } },
      setup(e, { expose: u }) {
        const c = e,
          {
            filterText: f,
            isExpanded: p,
            parentChildLinked: m,
            permTableRef: v,
            tableData: h,
            checkedBtns: g,
            formatMenuName: _,
            getMenuBtns: x,
            onSelectionChange: y,
            onSelectAll: b,
            onSelect: w,
            onBtnChange: k,
            toggleExpand: S,
            getCheckedIds: C,
            refresh: V,
          } = te(c);
        return (
          u({ getCheckedIds: C, refresh: V }),
          (u, c) => {
            const C = a,
              V = t,
              T = o,
              I = s,
              R = d,
              G = i,
              O = r;
            return (
              E(),
              j("div", oe, [
                B("div", re, [
                  M(
                    C,
                    {
                      modelValue: U(f),
                      "onUpdate:modelValue": c[0] || (c[0] = (e) => (z(f) ? (f.value = e) : null)),
                      placeholder: "搜索菜单名称",
                      clearable: "",
                      class: "menu-tree-search-input",
                      "prefix-icon": U(l),
                      size: "small",
                    },
                    null,
                    8,
                    ["modelValue", "prefix-icon"]
                  ),
                  M(
                    V,
                    { type: "primary", size: "small", plain: "", onClick: U(S) },
                    {
                      icon: D(() => [M(U(n))]),
                      default: D(() => [A(" " + N(U(p) ? "收起" : "展开"), 1)]),
                      _: 1,
                    },
                    8,
                    ["onClick"]
                  ),
                  M(
                    T,
                    {
                      modelValue: U(m),
                      "onUpdate:modelValue": c[1] || (c[1] = (e) => (z(m) ? (m.value = e) : null)),
                    },
                    { default: D(() => [...(c[2] || (c[2] = [A(" 父子联动 ", -1)]))]), _: 1 },
                    8,
                    ["modelValue"]
                  ),
                ]),
                F(
                  (E(),
                  K(
                    G,
                    {
                      ref_key: "permTableRef",
                      ref: v,
                      data: U(h),
                      "row-key": "id",
                      "tree-props": { children: "children", hasChildren: "hasChildren" },
                      "default-expand-all": !0,
                      class: "flex-1 min-h-0",
                      onSelectionChange: U(y),
                      onSelect: U(w),
                      onSelectAll: U(b),
                    },
                    {
                      default: D(() => [
                        M(I, { type: "selection", width: "48" }),
                        M(
                          I,
                          {
                            prop: "name",
                            label: "菜单名称",
                            width: "220",
                            "show-overflow-tooltip": "",
                            formatter: U(_),
                          },
                          null,
                          8,
                          ["formatter"]
                        ),
                        M(
                          I,
                          { label: "功能权限" },
                          {
                            default: D(({ row: e }) => [
                              M(
                                R,
                                {
                                  modelValue: U(g)[e.id],
                                  "onUpdate:modelValue": (l) => (U(g)[e.id] = l),
                                  class: "flex flex-wrap gap-x-3",
                                  onChange: (l) => U(k)(e, l),
                                },
                                {
                                  default: D(() => [
                                    (E(!0),
                                    j(
                                      L,
                                      null,
                                      P(
                                        U(x)(e),
                                        (e) => (
                                          E(),
                                          K(T, { key: e.id, value: e.id, label: e.name }, null, 8, [
                                            "value",
                                            "label",
                                          ])
                                        )
                                      ),
                                      128
                                    )),
                                  ]),
                                  _: 2,
                                },
                                1032,
                                ["modelValue", "onUpdate:modelValue", "onChange"]
                              ),
                            ]),
                            _: 1,
                          }
                        ),
                      ]),
                      _: 1,
                    },
                    8,
                    ["data", "onSelectionChange", "onSelect", "onSelectAll"]
                  )),
                  [[O, e.loading]]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-ce2d0d05"]]
  ),
  se = { class: "drawer-perm-content flex flex-col flex-1 overflow-hidden" },
  de = {
    class: "border-r border-r-(--el-border-color-lighter) b-r-solid h-full p-[20px] box-border",
  },
  ue = { class: "flex items-center" },
  ce = { class: "flex gap-[10px]" },
  fe = { class: "mt-3" },
  pe = { class: "flex gap-[10px]" },
  me = { class: "mt-3 flex-1 min-h-0" },
  ve = { class: "dialog-footer" },
  he = R({
    __name: "FaPermissonDrawer",
    props: { roleName: {}, roleId: {}, modelValue: { type: Boolean } },
    emits: ["update:modelValue", "saved"],
    setup(l, { emit: n }) {
      const o = l,
        r = n,
        i = J(),
        s = I(() => (i.device === Z.DESKTOP ? "1200px" : "90%")),
        d = I({
          get: () => o.modelValue,
          set(e) {
            r("update:modelValue", e);
          },
        }),
        V = T(),
        R = T(""),
        j = T(),
        z = T(!1),
        N = T([]),
        F = T([]),
        L = T([]),
        P = T(),
        H = T({ role_ids: [], menu_ids: [], data_scope: 1, dept_ids: [] });
      function Q() {
        d.value = !1;
      }
      async function ae() {
        try {
          if (1 === o.roleId) return void k.warning("系统默认角色，不可操作");
          z.value = !0;
          const e = (function (e, l) {
              const a = new Map(),
                n = (e, l) => {
                  for (const t of e) {
                    const e = t.id;
                    (a.set(e, l), t.children?.length && n(t.children, e));
                  }
                };
              n(l, void 0);
              const t = new Set();
              for (const o of e) {
                let e = o;
                for (; void 0 !== e; ) (t.add(e), (e = a.get(e)));
              }
              return [...t];
            })(P.value?.getCheckedIds() ?? [], F.value),
            l = {
              role_ids: [o.roleId],
              menu_ids: e,
              data_scope: H.value.data_scope,
              dept_ids: (V.value?.getCheckedKeys() || []).map((e) => Number(e)),
            };
          await $.setPermission(l);
          const a = Y();
          (await a.getUserInfo(), (d.value = !1), r("saved"));
        } catch (e) {
        } finally {
          z.value = !1;
        }
      }
      const ne = (e) => {
        H.value.dept_ids = e;
      };
      function te(e, l) {
        return !e || l.label?.includes(e);
      }
      return (
        S(R, (e) => {
          V.value.filter(e);
        }),
        G(async () => {
          await (async () => {
            z.value = !0;
            try {
              const e = await ee.listDept();
              N.value = W(X(e.data.data));
              const l = await le.listMenu();
              F.value = l.data.data || [];
              const a = await $.detailRole(o.roleId),
                n = a.data.data.menus?.map((e) => e.id) || [];
              ((H.value = {
                role_ids: [o.roleId],
                menu_ids: n,
                data_scope: a.data.data.data_scope || 1,
                dept_ids: a.data.data.depts?.map((e) => e.id) || [],
              }),
                (L.value = n),
                await C(),
                5 === H.value.data_scope &&
                  V.value &&
                  (await V.value.setCheckedKeys(H.value.dept_ids)));
            } catch (e) {
              const l = e instanceof Error ? e.message : String(e);
              k.error("获取权限数据失败: " + l);
            } finally {
              z.value = !1;
            }
          })();
        }),
        (l, n) => {
          const r = p,
            i = f,
            k = _,
            S = g,
            C = h,
            T = v,
            I = a,
            G = b,
            J = y,
            W = x,
            X = c,
            Y = w,
            Z = u,
            $ = t,
            ee = e;
          return (
            E(),
            K(
              ee,
              {
                modelValue: d.value,
                "onUpdate:modelValue": n[2] || (n[2] = (e) => (d.value = e)),
                title: "【" + o.roleName + "】权限分配",
                size: s.value,
                "destroy-on-close": "",
                onClose: Q,
              },
              {
                footer: D(() => [
                  B("div", ve, [
                    M(
                      $,
                      { onClick: Q },
                      { default: D(() => [...(n[9] || (n[9] = [A("取 消", -1)]))]), _: 1 }
                    ),
                    M(
                      $,
                      { type: "primary", loading: z.value, onClick: q(ae, ["stop"]) },
                      { default: D(() => [...(n[10] || (n[10] = [A("确 定", -1)]))]), _: 1 },
                      8,
                      ["loading"]
                    ),
                  ]),
                ]),
                default: D(() => [
                  B("div", se, [
                    M(
                      Z,
                      { class: "h-full min-h-0 flex-1" },
                      {
                        default: D(() => [
                          M(X, null, {
                            default: D(() => [
                              B("div", de, [
                                B("div", ue, [
                                  B("div", ce, [
                                    n[5] ||
                                      (n[5] = B(
                                        "div",
                                        { class: "w-[10px] bg-(--el-color-primary)" },
                                        null,
                                        -1
                                      )),
                                    B("div", null, [
                                      n[4] ||
                                        (n[4] = B(
                                          "span",
                                          { class: "text-[16px]" },
                                          "数据授权",
                                          -1
                                        )),
                                      M(
                                        i,
                                        { placement: "right" },
                                        {
                                          content: D(() => [
                                            ...(n[3] ||
                                              (n[3] = [
                                                B("span", null, "授权用户可操作的数据范围", -1),
                                              ])),
                                          ]),
                                          default: D(() => [
                                            M(
                                              r,
                                              { class: "ml-1 inline-block cursor-pointer" },
                                              { default: D(() => [M(U(m))]), _: 1 }
                                            ),
                                          ]),
                                          _: 1,
                                        }
                                      ),
                                    ]),
                                  ]),
                                ]),
                                B("div", fe, [
                                  M(
                                    T,
                                    { ref_key: "dataFormRef", ref: j, model: H.value },
                                    {
                                      default: D(() => [
                                        M(
                                          C,
                                          { prop: "data_scope" },
                                          {
                                            default: D(() => [
                                              M(
                                                S,
                                                {
                                                  modelValue: H.value.data_scope,
                                                  "onUpdate:modelValue":
                                                    n[0] ||
                                                    (n[0] = (e) => (H.value.data_scope = e)),
                                                },
                                                {
                                                  default: D(() => [
                                                    (E(),
                                                    K(k, {
                                                      key: 1,
                                                      label: "仅本人数据权限",
                                                      value: 1,
                                                    })),
                                                    (E(),
                                                    K(k, {
                                                      key: 2,
                                                      label: "本部门数据权限",
                                                      value: 2,
                                                    })),
                                                    (E(),
                                                    K(k, {
                                                      key: 3,
                                                      label: "本部门及以下数据权限",
                                                      value: 3,
                                                    })),
                                                    (E(),
                                                    K(k, {
                                                      key: 4,
                                                      label: "全部数据权限",
                                                      value: 4,
                                                    })),
                                                    (E(),
                                                    K(k, {
                                                      key: 5,
                                                      label: "自定义数据权限",
                                                      value: 5,
                                                    })),
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
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["model"]
                                  ),
                                  5 === H.value.data_scope && N.value.length
                                    ? (E(),
                                      K(
                                        W,
                                        {
                                          key: 0,
                                          class:
                                            "mt-5 max-h-[72vh] b-1 b-solid b-[var(--el-border-color-lighter)] p-10px box-border",
                                        },
                                        {
                                          default: D(() => [
                                            M(
                                              I,
                                              {
                                                modelValue: R.value,
                                                "onUpdate:modelValue":
                                                  n[1] || (n[1] = (e) => (R.value = e)),
                                                placeholder: "部门名称",
                                              },
                                              null,
                                              8,
                                              ["modelValue"]
                                            ),
                                            M(
                                              J,
                                              {
                                                ref_key: "deptTreeRef",
                                                ref: V,
                                                "node-key": "value",
                                                "show-checkbox": "",
                                                data: N.value,
                                                "filter-node-method": te,
                                                "default-expand-all": "",
                                                "highlight-current": !0,
                                                style:
                                                  "height: calc(100% - 60px); margin-top: 10px",
                                                onCheck: ne,
                                              },
                                              {
                                                empty: D(() => [
                                                  M(G, {
                                                    "image-size": 80,
                                                    description: "暂无数据",
                                                  }),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["data"]
                                            ),
                                          ]),
                                          _: 1,
                                        }
                                      ))
                                    : O("", !0),
                                ]),
                              ]),
                            ]),
                            _: 1,
                          }),
                          M(Y, null, {
                            default: D(() => [
                              B("div", pe, [
                                n[8] ||
                                  (n[8] = B(
                                    "div",
                                    { class: "w-[10px] bg-(--el-color-primary)" },
                                    null,
                                    -1
                                  )),
                                B("div", null, [
                                  n[7] ||
                                    (n[7] = B("span", { class: "text-[16px]" }, "菜单授权", -1)),
                                  M(
                                    i,
                                    { placement: "right" },
                                    {
                                      content: D(() => [
                                        ...(n[6] ||
                                          (n[6] = [
                                            B("span", null, "勾选菜单和对应的功能按钮权限", -1),
                                          ])),
                                      ]),
                                      default: D(() => [
                                        M(
                                          r,
                                          { class: "ml-1 inline-block cursor-pointer" },
                                          { default: D(() => [M(U(m))]), _: 1 }
                                        ),
                                      ]),
                                      _: 1,
                                    }
                                  ),
                                ]),
                              ]),
                              B("div", me, [
                                M(
                                  ie,
                                  {
                                    ref_key: "menuTreeTableRef",
                                    ref: P,
                                    "menu-tree": F.value,
                                    "checked-ids": L.value,
                                    loading: z.value,
                                  },
                                  null,
                                  8,
                                  ["menu-tree", "checked-ids", "loading"]
                                ),
                              ]),
                            ]),
                            _: 1,
                          }),
                        ]),
                        _: 1,
                      }
                    ),
                  ]),
                ]),
                _: 1,
              },
              8,
              ["modelValue", "title", "size"]
            )
          );
        }
      );
    },
  });
export { he as _ };
