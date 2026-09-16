import {
  t as e,
  s as t,
  r as a,
  a9 as s,
  aP as n,
  m as l,
  n as r,
  a3 as o,
  U as i,
} from "./element-plus.BPg5EhXK.js";
import { h as c } from "./ohash.BS5RKZcF.js";
import { _ as u } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import { _ as p } from "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import { a6 as d, t as m, $ as f } from "./index.CJ_YH8gZ.js";
import {
  z as y,
  ag as h,
  p as g,
  aI as b,
  n as _,
  bt as v,
  w as x,
  F as A,
  ao as k,
  m as C,
  a4 as w,
  o as z,
  ax as N,
  j as T,
  a2 as $,
  G as j,
  aL as S,
  a0 as L,
  t as B,
  ap as R,
  v as E,
  al as F,
  br as I,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as K } from "./_plugin-vue_export-helper.BCo6x5W8.js";
const U = () => {
    const e = d();
    return {
      hasAuth: (t) => m(t, { is_superuser: e.basicInfo?.is_superuser, permissions: e.prems }),
    };
  },
  M = y({
    name: "FaButtonMore",
    __name: "index",
    props: { list: {}, auth: {} },
    emits: ["click"],
    setup(s, { emit: n }) {
      const { hasAuth: l } = U(),
        r = s,
        o = T(() => r.list.some((e) => !e.auth || l(e.auth))),
        i = n;
      return (n, r) => {
        const c = p,
          d = u,
          m = t,
          f = e,
          y = a;
        return (
          h(),
          g("div", null, [
            b(o)
              ? (h(),
                _(
                  y,
                  { key: 0 },
                  {
                    dropdown: v(() => [
                      x(f, null, {
                        default: v(() => [
                          (h(!0),
                          g(
                            A,
                            null,
                            k(
                              s.list,
                              (e) => (
                                h(),
                                g(
                                  A,
                                  { key: e.key },
                                  [
                                    !e.auth || b(l)(e.auth)
                                      ? (h(),
                                        _(
                                          m,
                                          {
                                            key: 0,
                                            disabled: e.disabled,
                                            onClick: (t) =>
                                              ((e) => {
                                                i("click", e);
                                              })(e),
                                          },
                                          {
                                            default: v(() => [
                                              C(
                                                "div",
                                                {
                                                  class: "flex items-center gap-2",
                                                  style: w({ color: e.color }),
                                                },
                                                [
                                                  e.icon
                                                    ? (h(),
                                                      _(d, { key: 0, icon: e.icon }, null, 8, [
                                                        "icon",
                                                      ]))
                                                    : z("", !0),
                                                  C("span", null, N(e.label), 1),
                                                ],
                                                4
                                              ),
                                            ]),
                                            _: 2,
                                          },
                                          1032,
                                          ["disabled", "onClick"]
                                        ))
                                      : z("", !0),
                                  ],
                                  64
                                )
                              )
                            ),
                            128
                          )),
                        ]),
                        _: 1,
                      }),
                    ]),
                    default: v(() => [
                      x(c, {
                        icon: "ri:more-2-fill",
                        class: "size-8! bg-g-200 dark:bg-g-300/45 text-sm",
                      }),
                    ]),
                    _: 1,
                  }
                ))
              : z("", !0),
          ])
        );
      };
    },
  }),
  D = y({
    name: "FaButtonTable",
    __name: "index",
    props: { type: {}, icon: {}, iconClass: {}, iconColor: {}, buttonBgColor: {} },
    emits: ["click"],
    setup(e, { emit: t }) {
      const a = e,
        s = t,
        n = {
          add: { icon: "ri:add-fill", class: "bg-theme/12 text-theme" },
          edit: { icon: "ri:pencil-line", class: "bg-secondary/12 text-secondary" },
          delete: { icon: "ri:delete-bin-5-line", class: "bg-error/12 text-error" },
          view: { icon: "ri:eye-line", class: "bg-info/12 text-info" },
          more: { icon: "ri:more-2-fill", class: "bg-primary/12 text-primary" },
        },
        l = T(() => a.icon || (a.type ? n[a.type]?.icon : "") || ""),
        r = T(() => a.iconClass || (a.type ? n[a.type]?.class : "") || ""),
        o = () => {
          s("click");
        };
      return (t, a) => {
        const s = u;
        return (
          h(),
          g(
            "div",
            {
              class: $([
                "inline-flex items-center justify-center min-w-8 h-8 px-2.5 mr-2.5 text-sm cursor-pointer rounded-md align-middle transition-all duration-200 hover-btn",
                b(r),
              ]),
              style: w({ backgroundColor: e.buttonBgColor, color: e.iconColor }),
              onClick: o,
            },
            [x(s, { icon: b(l) }, null, 8, ["icon"])],
            6
          )
        );
      };
    },
  }),
  O = { paginationKey: { current: "page_no", size: "page_size" } };
function P(e) {
  if (!e || "object" != typeof e || Array.isArray(e)) return !1;
  const t = e;
  return (
    Array.isArray(t.items) &&
    "number" == typeof t.total &&
    "number" == typeof t.page_no &&
    "number" == typeof t.page_size &&
    "boolean" == typeof t.has_next
  );
}
function W(e) {
  if (!e || "object" != typeof e || Array.isArray(e)) return null;
  const t = e,
    a =
      (Array.isArray(t.items) && t.items) ||
      (Array.isArray(t.records) && t.records) ||
      (Array.isArray(t.list) && t.list) ||
      (Array.isArray(t.rows) && t.rows) ||
      null;
  if (!a) return null;
  const s = t.total,
    n = "number" == typeof s ? s : "string" == typeof s ? Number(s) : NaN;
  if (!Number.isFinite(n)) return null;
  const l = t.page_no ?? t.current ?? t.page,
    r = "number" == typeof l ? l : "string" == typeof l ? Number(l) : NaN;
  if (!Number.isFinite(r)) return null;
  const o = t.page_size ?? t.size ?? t.limit ?? t.pageSize,
    i = "number" == typeof o ? o : "string" == typeof o ? Number(o) : NaN;
  if (!Number.isFinite(i)) return null;
  let c;
  return (
    (c =
      "boolean" == typeof t.has_next
        ? t.has_next
        : "boolean" == typeof t.hasNext
          ? t.hasNext
          : r * i < n),
    { items: a, total: n, page_no: r, page_size: i, has_next: c }
  );
}
var G = ((e) => (
  (e.CLEAR_ALL = "clear_all"),
  (e.CLEAR_CURRENT = "clear_current"),
  (e.CLEAR_PAGINATION = "clear_pagination"),
  (e.KEEP_ALL = "keep_all"),
  e
))(G || {});
class H {
  constructor(e = 3e5, t = 50, a = !1) {
    ((this.cache = new Map()), (this.cacheTime = e), (this.maxSize = t), (this.enableLog = a));
  }
  log(e, ...t) {
    this.enableLog;
  }
  generateKey(e) {
    return c(e);
  }
  generateTags(e) {
    const t = new Set(),
      a = Object.keys(e).filter(
        (t) =>
          !["current", "size", "total", "page_no", "page_size"].includes(t) &&
          void 0 !== e[t] &&
          "" !== e[t] &&
          null !== e[t]
      );
    if (a.length > 0) {
      const s = a.map((t) => `${t}:${String(e[t])}`).join("|");
      t.add(`search:${s}`);
    } else t.add("search:default");
    const s = e,
      n = s.page_size ?? s.size;
    return (t.add(`pagination:${"number" == typeof n ? n : 10}`), t.add("pagination"), t);
  }
  evictLRU() {
    if (this.cache.size <= this.maxSize) return;
    let e = "",
      t = Infinity,
      a = Infinity;
    for (const [s, n] of this.cache.entries())
      (n.accessCount < t || (n.accessCount === t && n.lastAccessTime < a)) &&
        ((e = s), (t = n.accessCount), (a = n.lastAccessTime));
    e && (this.cache.delete(e), this.log(`LRU 清理缓存: ${e}`));
  }
  set(e, t, a) {
    const s = this.generateKey(e),
      n = this.generateTags(e),
      l = Date.now();
    (this.evictLRU(),
      this.cache.set(s, {
        data: t,
        response: a,
        timestamp: l,
        params: s,
        tags: n,
        accessCount: 1,
        lastAccessTime: l,
      }));
  }
  get(e) {
    const t = this.generateKey(e),
      a = this.cache.get(t);
    return a
      ? Date.now() - a.timestamp > this.cacheTime
        ? (this.cache.delete(t), null)
        : (a.accessCount++, (a.lastAccessTime = Date.now()), a)
      : null;
  }
  clearByTags(e) {
    let t = 0;
    for (const [a, s] of this.cache.entries()) {
      e.some((e) => Array.from(s.tags).some((t) => t.includes(e))) && (this.cache.delete(a), t++);
    }
    return t;
  }
  clearCurrentSearch(e) {
    const t = this.generateKey(e);
    return this.cache.delete(t) ? 1 : 0;
  }
  clearPagination() {
    return this.clearByTags(["pagination"]);
  }
  clear() {
    this.cache.clear();
  }
  getStats() {
    const e = this.cache.size;
    let t = 0,
      a = 0;
    for (const s of this.cache.values())
      ((t += JSON.stringify(s.data).length), (a += s.accessCount));
    return {
      total: e,
      size: `${(t / 1024).toFixed(2)}KB`,
      hitRate: `${e > 0 ? (a / e).toFixed(1) : "0"} avg hits`,
    };
  }
  cleanupExpired() {
    let e = 0;
    const t = Date.now();
    for (const [a, s] of this.cache.entries())
      t - s.timestamp > this.cacheTime && (this.cache.delete(a), e++);
    return e;
  }
}
const J = (e) => {
    const t = (function (e) {
      const t = [],
        a = (e) => {
          null != e && t.push(e);
        };
      (a(e),
        a(
          (function (e) {
            if (null === e || "object" != typeof e) return e;
            const t = e;
            return "data" in t &&
              "status" in t &&
              "number" == typeof t.status &&
              "config" in t &&
              "object" == typeof t.config
              ? t.data
              : e;
          })(e)
        ));
      for (let s = 0; s < t.length; s++) {
        const e = t[s];
        if (P(e)) return e;
        const n = W(e);
        if (n) return n;
        if (e && "object" == typeof e && !Array.isArray(e) && "data" in e) {
          const t = e.data;
          (a(t), t && "object" == typeof t && !Array.isArray(t) && "data" in t && a(t.data));
        }
      }
      return null;
    })(e);
    return t
      ? {
          records: t.items,
          total: t.total,
          current: t.page_no,
          size: t.page_size,
          has_next: t.has_next,
        }
      : { records: [], total: 0, current: 1, size: 10 };
  },
  X = (e) => {
    const t = e.records;
    return Array.isArray(t) ? t : [];
  },
  q = (e, t) => {
    const a = t.total;
    "number" == typeof a && (e.total = a);
  },
  Q = (e, t) => {
    let a = null,
      s = null,
      n = null,
      l = null;
    const r = (...r) =>
      new Promise((o, i) => {
        (a && clearTimeout(a),
          (s = r),
          (n = o),
          (l = i),
          (a = setTimeout(async () => {
            try {
              const t = await e(...r);
              o(t);
            } catch (t) {
              i(t);
            } finally {
              ((a = null), (s = null), (n = null), (l = null));
            }
          }, t)));
      });
    return (
      (r.cancel = () => {
        (a && clearTimeout(a), (a = null), (s = null), (n = null), (l = null));
      }),
      (r.flush = async () => {
        if (a && s && n && l) {
          (clearTimeout(a), (a = null));
          const r = s,
            o = n,
            i = l;
          ((s = null), (n = null), (l = null));
          try {
            const t = await e(...r);
            return (o(t), t);
          } catch (t) {
            throw (i(t), t);
          }
        }
      }),
      r
    );
  },
  V =
    (e, t = !1) =>
    (t, a = "操作失败") => {
      const s = { code: t?.code || "UNKNOWN_ERROR", message: t?.message || a, details: t };
      return (e?.(s), s);
    },
  Y = {
    add: "ri:add-fill",
    edit: "ri:pencil-line",
    delete: "ri:delete-bin-5-line",
    view: "ri:eye-line",
    more: "ri:more-2-fill",
  };
function Z(e) {
  return e.icon ?? Y[e.artType];
}
const ee = {
  add: "var(--el-color-primary)",
  edit: "var(--el-color-success)",
  delete: "var(--el-color-danger)",
  view: "var(--el-color-info)",
  more: "var(--el-text-color-regular)",
};
function te(e) {
  return null != e.iconColor ? e.iconColor : ee[e.artType];
}
function ae(e) {
  return null != e.color ? e.color : "delete" === String(e.key) ? "var(--el-color-danger)" : void 0;
}
function se(e, t) {
  const a = t?.maxInline ?? 3,
    n = t?.wrapperClass ?? "inline-flex flex-wrap items-center justify-end gap-1",
    l = t?.emptyText ?? "—";
  if (0 === e.length) return j("span", { class: "text-g-400" }, l);
  const r = e.slice(0, a),
    o = e.slice(a),
    i = r.map((e) =>
      j(s, { content: e.label, placement: "top" }, () =>
        j(
          "span",
          { class: e.disabled ? "inline-flex opacity-40 pointer-events-none" : "inline-flex" },
          [j(D, { type: e.artType, icon: Z(e), iconColor: te(e), onClick: e.run })]
        )
      )
    );
  if (0 === o.length) return j("div", { class: n }, i);
  const c = j(M, {
    list: o.map((e) => ({
      key: e.key,
      label: e.label,
      icon: Z(e),
      auth: e.perm,
      disabled: e.disabled,
      iconColor: te(e),
      color: ae(e),
    })),
    onClick: (e) => {
      const t = o.find((t) => String(t.key) === String(e.key));
      t?.run();
    },
  });
  return j("div", { class: n }, [...i, c]);
}
const ne = K(
    y({
      name: "FaDescriptions",
      __name: "index",
      props: {
        column: { default: 4 },
        border: { type: Boolean, default: !0 },
        size: { default: "default" },
        labelWidth: { default: void 0 },
        items: { default: () => [] },
        data: { default: null },
        span: { default: 2 },
        scrollbar: { type: Boolean, default: !0 },
        maxHeight: { default: "70vh" },
      },
      setup(e) {
        const t = S(),
          a = n("descriptions"),
          s = e,
          c = T(() => {
            const e = { column: s.column, border: s.border, ...t };
            return (
              "default" !== s.size && (e.size = s.size),
              void 0 !== s.labelWidth && (e.labelWidth = s.labelWidth),
              e
            );
          });
        function u(e, t) {
          if (e)
            return t.split(".").reduce((e, t) => {
              if (e && "object" == typeof e && t in e) return e[t];
            }, e);
        }
        function p(e, t) {
          if ("boolean" == typeof t) return t ? "success" : "danger";
          if (t.map) {
            const a = null == e ? "" : String(e);
            if (a in t.map) {
              const e = t.map[a].type;
              if (e && d.has(e)) return e;
            }
          }
          return t.type && d.has(t.type) ? t.type : "info";
        }
        const d = new Set(["primary", "success", "warning", "danger", "info"]);
        function m(e, t) {
          const a = null == e ? "" : String(e);
          return "boolean" == typeof t ? a : t.map && a in t.map ? (t.map[a].text ?? a) : a;
        }
        return (t, s) => {
          const n = o,
            d = r,
            f = l,
            y = i;
          return e.scrollbar
            ? (h(),
              _(
                y,
                { key: 0, "max-height": e.maxHeight, "view-style": { overflowX: "hidden" } },
                {
                  default: v(() => [
                    x(
                      f,
                      L(c.value, { class: b(a).b() }),
                      B(
                        {
                          default: v(() => [
                            t.$slots.default
                              ? R(t.$slots, "default", { key: 1 }, void 0, !0)
                              : (h(!0),
                                g(
                                  A,
                                  { key: 0 },
                                  k(
                                    e.items,
                                    (a) => (
                                      h(),
                                      _(
                                        d,
                                        {
                                          key: a.prop,
                                          label: a.label,
                                          span: a.span || e.span,
                                          "label-class-name": a.labelClassName,
                                          "class-name": a.className,
                                        },
                                        {
                                          default: v(() => [
                                            a.slot
                                              ? R(
                                                  t.$slots,
                                                  a.slot,
                                                  {
                                                    key: 0,
                                                    item: a,
                                                    value: e.data ? u(e.data, a.prop) : void 0,
                                                    row: e.data,
                                                  },
                                                  void 0,
                                                  !0
                                                )
                                              : null != a.tag
                                                ? (h(),
                                                  _(
                                                    n,
                                                    { key: 1, type: p(u(e.data, a.prop), a.tag) },
                                                    {
                                                      default: v(() => [
                                                        E(N(m(u(e.data, a.prop), a.tag)), 1),
                                                      ]),
                                                      _: 2,
                                                    },
                                                    1032,
                                                    ["type"]
                                                  ))
                                                : R(
                                                    t.$slots,
                                                    a.prop,
                                                    {
                                                      key: 2,
                                                      item: a,
                                                      value: e.data ? u(e.data, a.prop) : void 0,
                                                      row: e.data,
                                                    },
                                                    () => [
                                                      E(N(e.data ? u(e.data, a.prop) : ""), 1),
                                                    ],
                                                    !0
                                                  ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ["label", "span", "label-class-name", "class-name"]
                                      )
                                    )
                                  ),
                                  128
                                )),
                          ]),
                          _: 2,
                        },
                        [
                          t.$slots.title
                            ? {
                                name: "title",
                                fn: v(() => [R(t.$slots, "title", {}, void 0, !0)]),
                                key: "0",
                              }
                            : void 0,
                        ]
                      ),
                      1040,
                      ["class"]
                    ),
                  ]),
                  _: 3,
                },
                8,
                ["max-height"]
              ))
            : (h(),
              _(
                f,
                L({ key: 1 }, c.value, { class: b(a).b() }),
                B(
                  {
                    default: v(() => [
                      t.$slots.default
                        ? R(t.$slots, "default", { key: 1 }, void 0, !0)
                        : (h(!0),
                          g(
                            A,
                            { key: 0 },
                            k(
                              e.items,
                              (a) => (
                                h(),
                                _(
                                  d,
                                  {
                                    key: a.prop,
                                    label: a.label,
                                    span: a.span || e.span,
                                    "label-class-name": a.labelClassName,
                                    "class-name": a.className,
                                  },
                                  {
                                    default: v(() => [
                                      a.slot
                                        ? R(
                                            t.$slots,
                                            a.slot,
                                            {
                                              key: 0,
                                              item: a,
                                              value: e.data ? u(e.data, a.prop) : void 0,
                                              row: e.data,
                                            },
                                            void 0,
                                            !0
                                          )
                                        : null != a.tag
                                          ? (h(),
                                            _(
                                              n,
                                              { key: 1, type: p(u(e.data, a.prop), a.tag) },
                                              {
                                                default: v(() => [
                                                  E(N(m(u(e.data, a.prop), a.tag)), 1),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ["type"]
                                            ))
                                          : R(
                                              t.$slots,
                                              a.prop,
                                              {
                                                key: 2,
                                                item: a,
                                                value: e.data ? u(e.data, a.prop) : void 0,
                                                row: e.data,
                                              },
                                              () => [E(N(e.data ? u(e.data, a.prop) : ""), 1)],
                                              !0
                                            ),
                                    ]),
                                    _: 2,
                                  },
                                  1032,
                                  ["label", "span", "label-class-name", "class-name"]
                                )
                              )
                            ),
                            128
                          )),
                    ]),
                    _: 2,
                  },
                  [
                    t.$slots.title
                      ? {
                          name: "title",
                          fn: v(() => [R(t.$slots, "title", {}, void 0, !0)]),
                          key: "0",
                        }
                      : void 0,
                  ]
                ),
                1040,
                ["class"]
              ));
        };
      },
    }),
    [["__scopeId", "data-v-41778157"]]
  ),
  le = {
    selection: { prop: "__selection__", label: f("table.column.selection") },
    expand: { prop: "__expand__", label: f("table.column.expand") },
    index: { prop: "__index__", label: f("table.column.index") },
  },
  re = (e) => le[e.type]?.prop ?? e.prop,
  oe = (e) => (void 0 !== e.visible ? e.visible : (e.checked ?? !0)),
  ie = (e) =>
    e.map((e) => {
      const t = e.type && le[e.type],
        a = oe(e);
      return t
        ? { ...e, prop: t.prop, label: t.label, checked: !0, visible: !0 }
        : { ...e, checked: a, visible: a };
    });
function ce(e) {
  const t = F(e()),
    a = F(ie(t.value));
  I(
    t,
    (e) => {
      const t = new Map(a.value.map((e) => [re(e), oe(e)])),
        s = ie(e).map((e) => {
          const a = re(e),
            s = t.has(a) ? t.get(a) : oe(e);
          return { ...e, checked: s, visible: s };
        });
      a.value = s;
    },
    { deep: !0 }
  );
  const s = T(() => {
      const e = new Map(t.value.map((e) => [re(e), e]));
      return a.value
        .filter((e) => oe(e))
        .map((t) => e.get(re(t)))
        .filter(Boolean);
    }),
    n = (e) => {
      const a = [...t.value],
        s = e(a);
      t.value = Array.isArray(s) ? s : a;
    };
  return {
    columns: s,
    columnChecks: a,
    /**
     * 新增列（支持单个或批量）
     */
    addColumn: (e, t) =>
      n((a) => {
        const s = [...a],
          n = Array.isArray(e) ? e : [e],
          l = "number" == typeof t && t >= 0 && t <= s.length ? t : s.length;
        return (s.splice(l, 0, ...n), s);
      }),
    /**
     * 删除列（支持单个或批量）
     */
    removeColumn: (e) =>
      n((t) => {
        const a = Array.isArray(e) ? e : [e];
        return t.filter((e) => !a.includes(re(e)));
      }),
    /**
     * 更新列（支持单个或批量）
     */
    updateColumn: (e, t) => {
      Array.isArray(e)
        ? n((t) => {
            const a = new Map(e.map((e) => [e.prop, e.updates]));
            return t.map((e) => {
              const t = re(e),
                s = a.get(t);
              return s ? { ...e, ...s } : e;
            });
          })
        : t && n((a) => a.map((a) => (re(a) === e ? { ...a, ...t } : a)));
    },
    /**
     * 切换列显示状态（支持单个或批量）
     */
    toggleColumn: (e, t) => {
      const s = Array.isArray(e) ? e : [e],
        n = [...a.value];
      (s.forEach((e) => {
        const a = n.findIndex((t) => re(t) === e);
        if (a > -1) {
          const e = oe(n[a]),
            s = t ?? !e;
          n[a] = { ...n[a], checked: s, visible: s };
        }
      }),
        (a.value = n));
    },
    /**
     * 重置所有列
     */
    resetColumns: () => {
      t.value = e();
    },
    /**
     * 批量更新列（兼容旧版本）
     * @deprecated 推荐使用 updateColumn 的数组模式
     */
    batchUpdateColumns: (e) =>
      n((t) => {
        const a = new Map(e.map((e) => [e.prop, e.updates]));
        return t.map((e) => {
          const t = re(e),
            s = a.get(t);
          return s ? { ...e, ...s } : e;
        });
      }),
    /**
     * 重新排序列
     */
    reorderColumns: (e, t) =>
      n((a) => {
        if (e < 0 || e >= a.length || t < 0 || t >= a.length || e === t) return a;
        const s = [...a],
          [n] = s.splice(e, 1);
        return (n && s.splice(t, 0, n), s);
      }),
    /**
     * 获取列配置
     */
    getColumnConfig: (e) => t.value.find((t) => re(t) === e),
    /**
     * 获取所有列配置
     */
    getAllColumns: () => [...t.value],
  };
}
export {
  G as C,
  H as T,
  ne as _,
  Q as a,
  U as b,
  V as c,
  J as d,
  X as e,
  ce as f,
  se as r,
  O as t,
  q as u,
};
