import {
  U as e,
  N as a,
  aS as t,
  a1 as l,
  u as o,
  a0 as r,
  a9 as n,
  t as s,
  s as i,
  r as d,
  g as u,
  O as p,
  d as c,
  Y as m,
  aG as f,
  aN as v,
  aw as g,
  at as y,
  ai as h,
  l as b,
  w as _,
  x as k,
  A as w,
  V as x,
  M as C,
  ad as S,
  z as B,
  J as V,
  a3 as z,
  T,
  i as U,
  Q as R,
  aJ as L,
  aK as O,
  al as D,
  ah as E,
  a6 as I,
  a5 as A,
  f as $,
  X as F,
  S as j,
  R as P,
  h as Y,
  _ as M,
  B as H,
  C as N,
} from "./element-plus.BPg5EhXK.js";
import {
  A as q,
  al as Z,
  z as K,
  a$ as G,
  br as W,
  ag as X,
  n as J,
  bt as Q,
  m as ee,
  a2 as ae,
  w as te,
  $ as le,
  b6 as oe,
  aw as re,
  aL as ne,
  b3 as se,
  bs as ie,
  a1 as de,
  p as ue,
  aI as pe,
  bu as ce,
  F as me,
  ao as fe,
  a0 as ve,
  ax as ge,
  as as ye,
  o as he,
  ap as be,
  bi as _e,
  j as ke,
  Z as we,
  G as xe,
  D as Ce,
  aX as Se,
  ac as Be,
  ae as Ve,
  v as ze,
  X as Te,
  ar as Ue,
  aq as Re,
  a4 as Le,
  bv as Oe,
  ai as De,
  b8 as Ee,
  aC as Ie,
  t as Ae,
  aA as $e,
} from "./vue-vendor.Dwx3gfQr.js";
import { a0 as Fe, U as je } from "./index.CJ_YH8gZ.js";
import { l as Pe } from "./vue-draggable-plus.B5VWpxKS.js";
import { _ as Ye } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import { _ as Me } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
const He = {
  xs: { threshold: 12, fallback: 24 },
  sm: { threshold: 12, fallback: 12 },
  md: { threshold: 8, fallback: 8 },
  lg: null,
  xl: null,
};
function Ne(e, a, t) {
  const l = e ?? a,
    o = He[t];
  return o ? (l >= o.threshold ? l : o.fallback) : l;
}
var qe = ((e) => ((e.DEFAULT = "default"), (e.SMALL = "small"), (e.LARGE = "large"), e))(qe || {});
const Ze = q(
    "tableStore",
    () => {
      const e = Z(qe.DEFAULT),
        a = Z(!1),
        t = Z(!1),
        l = Z(!1),
        o = Z(!1),
        r = Z(!1),
        n = Z(!1);
      return {
        tableSize: e,
        isZebra: a,
        isBorder: t,
        isHeaderBackground: l,
        setTableSize: (a) => (e.value = a),
        setIsZebra: (e) => (a.value = e),
        setIsBorder: (e) => (t.value = e),
        setIsHeaderBackground: (e) => (l.value = e),
        isFullScreen: o,
        setIsFullScreen: (e) => (o.value = e),
        isRowDrag: r,
        setIsRowDrag: (e) => (r.value = e),
        highlightCurrentRow: n,
        setHighlightCurrentRow: (e) => (n.value = e),
      };
    },
    {
      persist: {
        key: "table",
        storage: localStorage,
        pick: ["tableSize", "isZebra", "isBorder", "isHeaderBackground"],
      },
    }
  ),
  Ke = Ye(
    K({
      name: "FaPagination",
      __name: "index",
      props: le(
        {
          total: { default: 0 },
          pageSizes: { default: () => [10, 20, 30, 50, 100] },
          layout: { default: "total, sizes, prev, pager, next, jumper" },
          background: { type: Boolean, default: !0 },
          disabled: { type: Boolean, default: !1 },
          pagerCount: { default: void 0 },
          size: { default: void 0 },
          autoScroll: { type: Boolean, default: !0 },
          hidden: { type: Boolean, default: !1 },
        },
        {
          page: { type: Number, required: !0, default: 1 },
          pageModifiers: {},
          limit: { type: Number, required: !0, default: 10 },
          limitModifiers: {},
        }
      ),
      emits: le(["pagination"], ["update:page", "update:limit"]),
      setup(t, { emit: l }) {
        const o = t,
          r = l,
          n = G(t, "page"),
          s = G(t, "limit");
        function i(e) {
          ((n.value = 1), r("pagination", { page: n.value, limit: e }));
        }
        function d(e) {
          r("pagination", { page: e, limit: s.value });
        }
        return (
          W(
            () => o.total,
            (e) => {
              const a = Math.ceil(e / s.value);
              e > 0 &&
                n.value > a &&
                ((n.value = a), r("pagination", { page: n.value, limit: s.value }));
            }
          ),
          (l, o) => {
            const r = a,
              u = e;
            return (
              X(),
              J(u, null, {
                default: Q(() => [
                  ee(
                    "div",
                    { class: ae([{ hidden: t.hidden }, "pagination"]) },
                    [
                      te(
                        r,
                        {
                          "current-page": n.value,
                          "onUpdate:currentPage": o[0] || (o[0] = (e) => (n.value = e)),
                          "page-size": s.value,
                          "onUpdate:pageSize": o[1] || (o[1] = (e) => (s.value = e)),
                          background: t.background,
                          disabled: t.disabled,
                          layout: t.layout,
                          "page-sizes": t.pageSizes,
                          "pager-count": t.pagerCount,
                          size: t.size,
                          total: t.total,
                          onSizeChange: i,
                          onCurrentChange: d,
                        },
                        null,
                        8,
                        [
                          "current-page",
                          "page-size",
                          "background",
                          "disabled",
                          "layout",
                          "page-sizes",
                          "pager-count",
                          "size",
                          "total",
                        ]
                      ),
                    ],
                    2
                  ),
                ]),
                _: 1,
              })
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-2c804721"]]
  ),
  Ge = { class: "fa-table__main" },
  We = { key: 0 },
  Xe = Ye(
    K({
      name: "FaTable",
      __name: "index",
      props: {
        loading: { type: Boolean },
        columns: { default: () => [] },
        pagination: {},
        paginationOptions: {},
        emptyHeight: { default: "100%" },
        emptyText: { default: "暂无数据" },
        showTableHeader: { type: Boolean, default: !0 },
        disableRowDrag: { type: Boolean, default: !1 },
        data: {},
        size: { default: void 0 },
        width: {},
        height: {},
        maxHeight: {},
        fit: { type: Boolean, default: !0 },
        stripe: { type: Boolean, default: void 0 },
        border: { type: Boolean, default: void 0 },
        rowKey: {},
        context: {},
        showHeader: { type: Boolean, default: !0 },
        showSummary: { type: Boolean },
        sumText: {},
        summaryMethod: {},
        rowClassName: {},
        rowStyle: {},
        cellClassName: {},
        cellStyle: {},
        headerRowClassName: {},
        headerRowStyle: {},
        headerCellClassName: {},
        headerCellStyle: {},
        highlightCurrentRow: { type: Boolean },
        currentRowKey: {},
        expandRowKeys: {},
        defaultExpandAll: { type: Boolean },
        rowExpandable: {},
        defaultSort: {},
        tooltipEffect: {},
        tooltipOptions: {},
        spanMethod: {},
        selectOnIndeterminate: { type: Boolean },
        indent: {},
        treeProps: {},
        lazy: { type: Boolean },
        load: {},
        className: {},
        style: { type: [Boolean, null, String, Object, Array] },
        tableLayout: {},
        scrollbarAlwaysOn: { type: Boolean },
        flexible: { type: Boolean },
        showOverflowTooltip: { type: [Boolean, Object] },
        tooltipFormatter: {},
        appendFilterPanelTo: {},
        scrollbarTabindex: {},
        nativeScrollbar: { type: Boolean },
      },
      emits: [
        "pagination:size-change",
        "pagination:current-change",
        "update:data",
        "row-order-change",
      ],
      setup(e, { expose: a, emit: n }) {
        const { width: s } = _e(),
          i = Z(null),
          d = Z(),
          u = Z(),
          p = Ze(),
          c = oe(),
          {
            isBorder: m,
            isZebra: f,
            tableSize: v,
            isFullScreen: g,
            isHeaderBackground: y,
            isRowDrag: h,
            highlightCurrentRow: b,
          } = re(p),
          _ = e,
          k = Ce(),
          w = ne(),
          x = (e) => {
            const a = k?.vnode.props || {},
              t = e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
            return e in a || t in a;
          },
          C = "prev, pager, next, sizes, jumper, total",
          S = "prev, pager, next, jumper, total",
          B = "total, prev, pager, next, sizes, jumper",
          V = {
            pageSizes: [10, 20, 30, 50, 100],
            align: "center",
            background: !0,
            layout: ke(() => (s.value < 768 ? C : s.value < 1024 ? S : B)).value,
            hideOnSinglePage: !1,
            size: "default",
            pagerCount: s.value > 1200 ? 7 : 5,
          },
          z = ke(() => ({ ...V, ..._.paginationOptions })),
          T = ke(() => {
            const e = _.pagination,
              a = z.value;
            if (!e || !a.hideOnSinglePage) return !1;
            const t = e.size || 10,
              l = e.total ?? 0;
            return !(l <= 0) && Math.ceil(l / t) <= 1;
          }),
          U = ke(() => _.border ?? m.value),
          R = ke(() => _.stripe ?? f.value),
          L = ke(() => _.size ?? v.value),
          O = ke(() => 0 === _.data?.length),
          D = Z(0),
          E = Z(0);
        (se(d, (e) => {
          const a = e[0];
          a &&
            requestAnimationFrame(() => {
              D.value = a.contentRect.height;
            });
        }),
          se(u, (e) => {
            const a = e[0];
            a &&
              requestAnimationFrame(() => {
                E.value = a.contentRect.height;
              });
          }));
        const I = ke(() =>
            g.value ? "100%" : O.value && !_.loading ? _.emptyHeight : _.height ? _.height : "100%"
          ),
          A = ke(() => ({
            background: y.value ? "var(--el-fill-color-lighter)" : "var(--default-box-color)",
            ...(_.headerCellStyle || {}),
          })),
          $ = ke(() => ({
            ...w,
            ..._,
            height: I.value,
            stripe: R.value,
            border: U.value,
            size: L.value,
            headerCellStyle: A.value,
            highlightCurrentRow: b.value,
            // Element Plus 默认值为 true，未显式传入时不应被 FaTable 覆盖成 false。
            selectOnIndeterminate: x("selectOnIndeterminate") ? _.selectOnIndeterminate : void 0,
          })),
          F = n,
          j = Z([]),
          P = ke({
            get() {
              const e = _.data;
              return Array.isArray(e) ? e : j.value;
            },
            set(e) {
              F("update:data", e);
            },
          }),
          Y = ke(() => !_.disableRowDrag && h.value),
          M = ke(() => !Y.value || !!_.loading),
          H = () => {
            const e = _.data;
            Array.isArray(e) && F("row-order-change", e);
          },
          N = ke(() => !!_.pagination),
          q = (e) => void 0 === e.$index || e.$index >= 0;
        const G = K({
            name: "TableFormatterOutlet",
            props: {
              column: { type: Object, required: !0 },
              /** 避免 prop 名 row 与插槽解构冲突 */
              record: { type: Object, required: !0 },
            },
            setup: (e) => () =>
              ((e, a) => {
                if (!e.formatter) return null;
                const t = e.formatter(a);
                return we(t) ? t : null == t ? null : xe("span", String(t));
              })(e.column, e.record),
          }),
          W = (e) => {
            const a = { ...e };
            return (
              delete a.useHeaderSlot,
              delete a.headerSlotName,
              delete a.useSlot,
              delete a.slotName,
              a
            );
          },
          le = (e) => {
            const a = W(e);
            return (delete a.formatter, a);
          },
          { scrollToTop: Se } = Fe(),
          Be = () => {
            de(() => {
              (i.value?.setScrollTop(0), Se());
            });
          },
          Ve = (e) => {
            const a = _.pagination;
            a &&
              (e.limit === a.size
                ? e.page !== a.current && (F("pagination:current-change", e.page), Be())
                : F("pagination:size-change", e.limit));
          },
          ze = (e) => {
            if (!_.pagination) return e + 1;
            const { current: a, size: t } = _.pagination;
            return (a - 1) * t + e + 1;
          };
        return (
          ie(
            () => {
              _.data;
              _.showTableHeader
                ? de(() => {
                    (() => {
                      if (!_.showTableHeader) return void (u.value = void 0);
                      const e = document.getElementById("fa-table-header");
                      u.value = e || void 0;
                    })();
                  })
                : (u.value = void 0);
            },
            { flush: "post" }
          ),
          a({ scrollToTop: Be, elTableRef: i }),
          (a, n) => {
            const s = l,
              u = o,
              p = r,
              m = Ke,
              f = t;
            return (
              X(),
              ue(
                "div",
                { class: ae(["fa-table", { "is-empty": O.value }]) },
                [
                  ee("div", Ge, [
                    te(
                      pe(Pe),
                      {
                        class: "fa-table__drag-wrap",
                        target: "tbody",
                        modelValue: P.value,
                        "onUpdate:modelValue": n[0] || (n[0] = (e) => (P.value = e)),
                        animation: 150,
                        disabled: M.value,
                        onEnd: H,
                      },
                      {
                        default: Q(() => [
                          ce(
                            (X(),
                            J(
                              p,
                              ve({ ref_key: "elTableRef", ref: i }, $.value),
                              {
                                empty: Q(() => [
                                  e.loading
                                    ? (X(), ue("div", We))
                                    : (X(),
                                      J(
                                        u,
                                        { key: 1, description: e.emptyText, "image-size": 80 },
                                        null,
                                        8,
                                        ["description"]
                                      )),
                                ]),
                                default: Q(() => [
                                  (X(!0),
                                  ue(
                                    me,
                                    null,
                                    fe(
                                      e.columns,
                                      (e) => (
                                        X(),
                                        ue(
                                          me,
                                          { key: e.prop || e.type },
                                          [
                                            "globalIndex" === e.type
                                              ? (X(),
                                                J(
                                                  s,
                                                  ve({ key: 0, ref_for: !0 }, { ...e }),
                                                  {
                                                    default: Q(({ $index: e }) => [
                                                      ee("span", null, ge(ze(e)), 1),
                                                    ]),
                                                    _: 1,
                                                  },
                                                  16
                                                ))
                                              : "expand" === e.type
                                                ? (X(),
                                                  J(
                                                    s,
                                                    ve({ key: 1, ref_for: !0 }, W(e)),
                                                    {
                                                      default: Q(({ row: a }) => [
                                                        (X(),
                                                        J(ye(e.formatter ? e.formatter(a) : null))),
                                                      ]),
                                                      _: 2,
                                                    },
                                                    1040
                                                  ))
                                                : (X(),
                                                  J(
                                                    s,
                                                    ve({ key: 2, ref_for: !0 }, le(e)),
                                                    {
                                                      header: Q((a) => [
                                                        e.useHeaderSlot && e.prop
                                                          ? (X(),
                                                            J(
                                                              ye(() =>
                                                                (function (e, a) {
                                                                  const t =
                                                                    a.headerSlotName ||
                                                                    `${a.prop}-header`;
                                                                  return (
                                                                    c[t]?.({
                                                                      ...e,
                                                                      prop: a.prop,
                                                                      label: a.label,
                                                                    }) ?? a.label
                                                                  );
                                                                })(a, e)
                                                              ),
                                                              { key: 0 }
                                                            ))
                                                          : he("", !0),
                                                      ]),
                                                      default: Q((a) => [
                                                        e.useSlot && e.prop && q(a)
                                                          ? (X(),
                                                            J(
                                                              ye(() =>
                                                                (function (e, a) {
                                                                  const t = a.slotName || a.prop,
                                                                    l = e.row;
                                                                  return (
                                                                    c[t]?.({
                                                                      ...e,
                                                                      prop: a.prop,
                                                                      value: a.prop
                                                                        ? l?.[a.prop]
                                                                        : void 0,
                                                                    }) ?? null
                                                                  );
                                                                })(a, e)
                                                              ),
                                                              { key: 0 }
                                                            ))
                                                          : e.formatter && !e.useSlot && q(a)
                                                            ? (X(),
                                                              J(
                                                                pe(G),
                                                                {
                                                                  key: 1,
                                                                  column: e,
                                                                  record: a.row,
                                                                },
                                                                null,
                                                                8,
                                                                ["column", "record"]
                                                              ))
                                                            : he("", !0),
                                                      ]),
                                                      _: 2,
                                                    },
                                                    1040
                                                  )),
                                          ],
                                          64
                                        )
                                      )
                                    ),
                                    128
                                  )),
                                  a.$slots.default
                                    ? be(a.$slots, "default", { key: 0 }, void 0, !0)
                                    : he("", !0),
                                ]),
                                _: 3,
                              },
                              16
                            )),
                            [[f, !!e.loading]]
                          ),
                        ]),
                        _: 3,
                      },
                      8,
                      ["modelValue", "disabled"]
                    ),
                  ]),
                  N.value
                    ? (X(),
                      ue(
                        "div",
                        {
                          key: 0,
                          class: ae(["pagination custom-pagination", z.value?.align]),
                          ref_key: "paginationRef",
                          ref: d,
                        },
                        [
                          e.pagination
                            ? (X(),
                              J(
                                m,
                                {
                                  key: 0,
                                  page: e.pagination.current,
                                  limit: e.pagination.size,
                                  total: e.pagination.total,
                                  "page-sizes": z.value.pageSizes,
                                  layout: z.value.layout,
                                  background: z.value.background ?? !0,
                                  disabled: !!e.loading,
                                  hidden: T.value,
                                  "pager-count": z.value.pagerCount,
                                  size: z.value.size,
                                  onPagination: Ve,
                                },
                                null,
                                8,
                                [
                                  "page",
                                  "limit",
                                  "total",
                                  "page-sizes",
                                  "layout",
                                  "background",
                                  "disabled",
                                  "hidden",
                                  "pager-count",
                                  "size",
                                ]
                              ))
                            : he("", !0),
                        ],
                        2
                      ))
                    : he("", !0),
                ],
                2
              )
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-6f1bb593"]]
  ),
  Je = { class: "flex items-center justify-between max-md:block!", id: "fa-table-header" },
  Qe = { class: "flex-wrap" },
  ea = { class: "flex items-center md:justify-end max-md:mt-3 max-sm:hidden!" },
  aa = { class: "button" },
  ta = { class: "button" },
  la = { class: "button" },
  oa = { class: "flex min-w-[200px] flex-col gap-2" },
  ra = Ye(
    K({
      name: "FaTableHeader",
      __name: "index",
      props: le(
        {
          fullClass: { default: "fa-full-height" },
          layout: { default: "search,refresh,size,fullscreen,columns,rowDrag,settings" },
          loading: { type: Boolean },
          showSearchBar: { type: Boolean, default: void 0 },
        },
        { columns: { required: !1, default: () => [] }, columnsModifiers: {} }
      ),
      emits: le(["refresh", "search", "update:showSearchBar"], ["update:columns"]),
      setup(a, { emit: t }) {
        const { t: l } = Se(),
          o = a,
          r = G(a, "columns"),
          c = t,
          m = [
            { value: qe.SMALL, label: l("table.sizeOptions.small") },
            { value: qe.DEFAULT, label: l("table.sizeOptions.default") },
            { value: qe.LARGE, label: l("table.sizeOptions.large") },
          ],
          f = Ze(),
          {
            tableSize: v,
            isZebra: g,
            isBorder: y,
            isHeaderBackground: h,
            isRowDrag: b,
            highlightCurrentRow: _,
          } = re(f),
          k = () => {
            f.setIsRowDrag(!b.value);
          },
          w = ke(() => o.layout.split(",").map((e) => e.trim())),
          x = (e) => w.value.includes(e),
          C = (e) => {
            const a = e.related;
            return !a || !a.classList.contains("fixed-column");
          },
          S = () => {
            (c("update:showSearchBar", !o.showSearchBar), c("search"));
          },
          B = () => {
            ((z.value = !0), c("refresh"));
          },
          V = (e) => {
            Ze().setTableSize(e);
          },
          z = Z(!1),
          T = Z(!1),
          U = Z(""),
          R = () => {
            const e = document.querySelector(`.${o.fullClass}`);
            e &&
              ((T.value = !T.value),
              T.value
                ? ((U.value = document.body.style.overflow),
                  (document.body.style.overflow = "hidden"),
                  e.classList.add("el-full-screen"),
                  f.setIsFullScreen(!0))
                : ((document.body.style.overflow = U.value),
                  e.classList.remove("el-full-screen"),
                  f.setIsFullScreen(!1)));
          },
          L = (e) => {
            "Escape" === e.key && T.value && R();
          };
        return (
          Be(() => {
            document.addEventListener("keydown", L);
          }),
          Ve(() => {
            if ((document.removeEventListener("keydown", L), T.value)) {
              document.body.style.overflow = U.value;
              const e = document.querySelector(`.${o.fullClass}`);
              e && e.classList.remove("el-full-screen");
            }
          }),
          (t, o) => {
            const c = Me,
              f = n,
              w = i,
              U = s,
              L = d,
              O = u,
              D = e,
              E = p;
            return (
              X(),
              ue("div", Je, [
                ee("div", Qe, [be(t.$slots, "left", {}, void 0, !0)]),
                ee("div", ea, [
                  null != a.showSearchBar
                    ? (X(),
                      J(
                        f,
                        {
                          key: 0,
                          placement: "bottom",
                          content: a.showSearchBar
                            ? pe(l)("table.toolbar.hideSearch")
                            : pe(l)("table.toolbar.showSearch"),
                        },
                        {
                          default: Q(() => [
                            ee(
                              "div",
                              {
                                class: ae([
                                  "button",
                                  a.showSearchBar ? "" : "active bg-theme! hover:bg-theme/80!",
                                ]),
                                onClick: S,
                              },
                              [
                                te(
                                  c,
                                  {
                                    icon: "ri:search-line",
                                    class: ae(a.showSearchBar ? "text-g-700" : "text-white"),
                                  },
                                  null,
                                  8,
                                  ["class"]
                                ),
                              ],
                              2
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["content"]
                      ))
                    : he("", !0),
                  x("refresh")
                    ? (X(),
                      ue(
                        "div",
                        {
                          key: 1,
                          class: ae(["button", { loading: a.loading && z.value }]),
                          onClick: B,
                        },
                        [
                          te(
                            c,
                            {
                              icon: "ri:refresh-line",
                              class: ae(a.loading && z.value ? "animate-spin text-g-600" : ""),
                            },
                            null,
                            8,
                            ["class"]
                          ),
                        ],
                        2
                      ))
                    : he("", !0),
                  x("size")
                    ? (X(),
                      J(
                        L,
                        { key: 2, onCommand: V },
                        {
                          dropdown: Q(() => [
                            te(U, null, {
                              default: Q(() => [
                                (X(),
                                ue(
                                  me,
                                  null,
                                  fe(m, (e) =>
                                    ee(
                                      "div",
                                      {
                                        key: e.value,
                                        class:
                                          "table-size-btn-item [&_.el-dropdown-menu__item]:mb-[3px]! last:[&_.el-dropdown-menu__item]:mb-0!",
                                      },
                                      [
                                        (X(),
                                        J(
                                          w,
                                          {
                                            key: e.value,
                                            command: e.value,
                                            class: ae(pe(v) === e.value ? "bg-g-300/55!" : ""),
                                          },
                                          { default: Q(() => [ze(ge(e.label), 1)]), _: 2 },
                                          1032,
                                          ["command", "class"]
                                        )),
                                      ]
                                    )
                                  ),
                                  64
                                )),
                              ]),
                              _: 1,
                            }),
                          ]),
                          default: Q(() => [
                            ee("div", aa, [te(c, { icon: "ri:arrow-up-down-fill" })]),
                          ]),
                          _: 1,
                        }
                      ))
                    : he("", !0),
                  x("fullscreen")
                    ? (X(),
                      ue("div", { key: 3, class: "button", onClick: R }, [
                        te(
                          c,
                          { icon: T.value ? "ri:fullscreen-exit-line" : "ri:fullscreen-line" },
                          null,
                          8,
                          ["icon"]
                        ),
                      ]))
                    : he("", !0),
                  x("rowDrag")
                    ? (X(),
                      J(
                        f,
                        {
                          key: 4,
                          placement: "bottom",
                          content: pe(b)
                            ? pe(l)("table.toolbar.disableRowDrag")
                            : pe(l)("table.toolbar.enableRowDrag"),
                        },
                        {
                          default: Q(() => [
                            ee(
                              "div",
                              {
                                class: ae([
                                  "button",
                                  pe(b) ? "active bg-theme! hover:bg-theme/80!" : "",
                                ]),
                                onClick: k,
                              },
                              [
                                te(
                                  c,
                                  {
                                    icon: "ri:drag-move-line",
                                    class: ae(pe(b) ? "text-white" : "text-g-700"),
                                  },
                                  null,
                                  8,
                                  ["class"]
                                ),
                              ],
                              2
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["content"]
                      ))
                    : he("", !0),
                  x("columns")
                    ? (X(),
                      J(
                        E,
                        { key: 5, placement: "bottom", trigger: "click" },
                        {
                          reference: Q(() => [ee("div", ta, [te(c, { icon: "ri:align-right" })])]),
                          default: Q(() => [
                            ee("div", null, [
                              te(
                                D,
                                { "max-height": "380px" },
                                {
                                  default: Q(() => [
                                    te(
                                      pe(Pe),
                                      {
                                        modelValue: r.value,
                                        "onUpdate:modelValue":
                                          o[0] || (o[0] = (e) => (r.value = e)),
                                        disabled: !1,
                                        filter: ".fixed-column",
                                        "prevent-on-filter": !1,
                                        onMove: C,
                                      },
                                      {
                                        default: Q(() => [
                                          (X(!0),
                                          ue(
                                            me,
                                            null,
                                            fe(r.value, (e) => {
                                              return (
                                                X(),
                                                ue(
                                                  "div",
                                                  {
                                                    key: e.prop || e.type,
                                                    class: ae([
                                                      "column-option flex items-center",
                                                      { "fixed-column": e.fixed },
                                                    ]),
                                                  },
                                                  [
                                                    ee(
                                                      "div",
                                                      {
                                                        class: ae([
                                                          "drag-icon mr-2 h-4.5 flex items-center justify-center text-g-500",
                                                          e.fixed
                                                            ? "cursor-default text-g-300"
                                                            : "cursor-move",
                                                        ]),
                                                      },
                                                      [
                                                        te(
                                                          c,
                                                          {
                                                            icon: e.fixed
                                                              ? "ri:unpin-line"
                                                              : "ri:drag-move-2-fill",
                                                            class: "text-base",
                                                          },
                                                          null,
                                                          8,
                                                          ["icon"]
                                                        ),
                                                      ],
                                                      2
                                                    ),
                                                    te(
                                                      O,
                                                      {
                                                        "model-value":
                                                          ((a = e),
                                                          void 0 !== a.visible
                                                            ? a.visible
                                                            : (a.checked ?? !0)),
                                                        "onUpdate:modelValue": (a) =>
                                                          ((e, a) => {
                                                            const t = !!a;
                                                            ((e.checked = t), (e.visible = t));
                                                          })(e, a),
                                                        disabled: e.disabled,
                                                        class:
                                                          "flex-1 min-w-0 [&_.el-checkbox__label]:overflow-hidden [&_.el-checkbox__label]:text-ellipsis [&_.el-checkbox__label]:whitespace-nowrap",
                                                      },
                                                      {
                                                        default: Q(() => [
                                                          ze(
                                                            ge(
                                                              e.label ||
                                                                ("selection" === e.type
                                                                  ? pe(l)("table.selection")
                                                                  : "")
                                                            ),
                                                            1
                                                          ),
                                                        ]),
                                                        _: 2,
                                                      },
                                                      1032,
                                                      [
                                                        "model-value",
                                                        "onUpdate:modelValue",
                                                        "disabled",
                                                      ]
                                                    ),
                                                  ],
                                                  2
                                                )
                                              );
                                              var a;
                                            }),
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
                            ]),
                          ]),
                          _: 1,
                        }
                      ))
                    : he("", !0),
                  x("settings")
                    ? (X(),
                      J(
                        E,
                        { key: 6, placement: "bottom", trigger: "click" },
                        {
                          reference: Q(() => [
                            ee("div", la, [te(c, { icon: "ri:settings-line" })]),
                          ]),
                          default: Q(() => [
                            ee("div", oa, [
                              te(
                                O,
                                {
                                  modelValue: pe(g),
                                  "onUpdate:modelValue":
                                    o[1] || (o[1] = (e) => (Te(g) ? (g.value = e) : null)),
                                  value: !0,
                                },
                                { default: Q(() => [ze(ge(pe(l)("table.zebra")), 1)]), _: 1 },
                                8,
                                ["modelValue"]
                              ),
                              te(
                                O,
                                {
                                  modelValue: pe(y),
                                  "onUpdate:modelValue":
                                    o[2] || (o[2] = (e) => (Te(y) ? (y.value = e) : null)),
                                  value: !0,
                                },
                                { default: Q(() => [ze(ge(pe(l)("table.border")), 1)]), _: 1 },
                                8,
                                ["modelValue"]
                              ),
                              te(
                                O,
                                {
                                  modelValue: pe(h),
                                  "onUpdate:modelValue":
                                    o[3] || (o[3] = (e) => (Te(h) ? (h.value = e) : null)),
                                  value: !0,
                                },
                                {
                                  default: Q(() => [ze(ge(pe(l)("table.headerBackground")), 1)]),
                                  _: 1,
                                },
                                8,
                                ["modelValue"]
                              ),
                              te(
                                O,
                                {
                                  modelValue: pe(_),
                                  "onUpdate:modelValue":
                                    o[4] || (o[4] = (e) => (Te(_) ? (_.value = e) : null)),
                                  value: !0,
                                },
                                {
                                  default: Q(() => [ze(ge(pe(l)("table.highlightCurrentRow")), 1)]),
                                  _: 1,
                                },
                                8,
                                ["modelValue"]
                              ),
                            ]),
                          ]),
                          _: 1,
                        }
                      ))
                    : he("", !0),
                  be(t.$slots, "right", {}, void 0, !0),
                ]),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-bd13fa52"]]
  ),
  na = { class: "data-table__toolbar--left inline-flex flex-wrap items-center gap-2" },
  sa = K({
    name: "FaTableHeaderLeft",
    __name: "index",
    props: {
      configButtons: {},
      removeIds: { default: () => [] },
      permCreate: {},
      permImport: {},
      permExport: {},
      importLoading: { type: Boolean, default: !1 },
      exportLoading: { type: Boolean, default: !1 },
      permDelete: {},
      permPatch: {},
      deleteLoading: { type: Boolean, default: !1 },
      createLoading: { type: Boolean, default: !1 },
      moreLoading: { type: Boolean, default: !1 },
    },
    emits: ["toolbar", "add", "import", "export", "delete", "more"],
    setup(e) {
      const a = e,
        t = ke(() => 0 === a.removeIds.length || a.deleteLoading || a.moreLoading);
      return (a, l) => {
        const o = c,
          r = i,
          n = s,
          u = d,
          p = m,
          b = Ue("hasPerm"),
          _ = Ue("ripple");
        return (
          X(),
          ue("div", na, [
            e.configButtons && e.configButtons.length
              ? (X(!0),
                ue(
                  me,
                  { key: 0 },
                  fe(e.configButtons, (t, l) =>
                    ce(
                      (X(),
                      J(
                        o,
                        ve({ key: l, ref_for: !0 }, t.attrs, {
                          disabled: "delete" === t.name && 0 === e.removeIds.length,
                          onClick: (e) => a.$emit("toolbar", t.name),
                        }),
                        { default: Q(() => [ze(ge(t.text), 1)]), _: 2 },
                        1040,
                        ["disabled", "onClick"]
                      )),
                      [[b, t.perm ?? "*:*:*"]]
                    )
                  ),
                  128
                ))
              : be(a.$slots, "default", { key: 1 }, () => [
                  be(a.$slots, "default", {}, () => [
                    te(p, null, {
                      default: Q(() => [
                        e.permCreate
                          ? ce(
                              (X(),
                              J(
                                o,
                                {
                                  key: 0,
                                  type: "primary",
                                  icon: pe(f),
                                  loading: e.createLoading,
                                  onClick: l[0] || (l[0] = (e) => a.$emit("add")),
                                  plain: "",
                                },
                                {
                                  default: Q(() => [...(l[6] || (l[6] = [ze(" 新增 ", -1)]))]),
                                  _: 1,
                                },
                                8,
                                ["icon", "loading"]
                              )),
                              [[b, e.permCreate]]
                            )
                          : he("", !0),
                        e.permImport
                          ? ce(
                              (X(),
                              J(
                                o,
                                {
                                  key: 1,
                                  type: "success",
                                  loading: e.importLoading,
                                  icon: pe(v),
                                  onClick: l[1] || (l[1] = (e) => a.$emit("import")),
                                  plain: "",
                                },
                                {
                                  default: Q(() => [...(l[7] || (l[7] = [ze(" 导入 ", -1)]))]),
                                  _: 1,
                                },
                                8,
                                ["loading", "icon"]
                              )),
                              [[b, e.permImport], [_]]
                            )
                          : he("", !0),
                        e.permExport
                          ? ce(
                              (X(),
                              J(
                                o,
                                {
                                  key: 2,
                                  type: "warning",
                                  loading: e.exportLoading,
                                  icon: pe(g),
                                  onClick: l[2] || (l[2] = (e) => a.$emit("export")),
                                  plain: "",
                                },
                                {
                                  default: Q(() => [...(l[8] || (l[8] = [ze(" 导出 ", -1)]))]),
                                  _: 1,
                                },
                                8,
                                ["loading", "icon"]
                              )),
                              [[b, e.permExport], [_]]
                            )
                          : he("", !0),
                        e.permDelete
                          ? ce(
                              (X(),
                              J(
                                o,
                                {
                                  key: 3,
                                  type: "danger",
                                  loading: e.deleteLoading,
                                  disabled: 0 === e.removeIds.length,
                                  icon: pe(y),
                                  onClick: l[3] || (l[3] = (e) => a.$emit("delete")),
                                  plain: "",
                                },
                                {
                                  default: Q(() => [...(l[9] || (l[9] = [ze(" 批量删除 ", -1)]))]),
                                  _: 1,
                                },
                                8,
                                ["loading", "disabled", "icon"]
                              )),
                              [[b, e.permDelete]]
                            )
                          : he("", !0),
                        e.permPatch
                          ? ce(
                              (X(),
                              J(
                                u,
                                { key: 4, trigger: "click" },
                                {
                                  dropdown: Q(() => [
                                    te(n, null, {
                                      default: Q(() => [
                                        te(
                                          r,
                                          {
                                            icon: "Check",
                                            onClick: l[4] || (l[4] = (e) => a.$emit("more", 0)),
                                          },
                                          {
                                            default: Q(() => [
                                              ...(l[11] || (l[11] = [ze("批量启用", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                        te(
                                          r,
                                          {
                                            icon: "CircleClose",
                                            onClick: l[5] || (l[5] = (e) => a.$emit("more", 1)),
                                          },
                                          {
                                            default: Q(() => [
                                              ...(l[12] || (l[12] = [ze(" 批量停用 ", -1)])),
                                            ]),
                                            _: 1,
                                          }
                                        ),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  default: Q(() => [
                                    te(
                                      o,
                                      {
                                        type: "default",
                                        disabled: 0 === e.removeIds.length || t.value,
                                        loading: e.moreLoading,
                                      },
                                      {
                                        icon: Q(() => [te(pe(h))]),
                                        default: Q(() => [l[10] || (l[10] = ze(" 更多 ", -1))]),
                                        _: 1,
                                      },
                                      8,
                                      ["disabled", "loading"]
                                    ),
                                  ]),
                                  _: 1,
                                }
                              )),
                              [[b, e.permPatch]]
                            )
                          : he("", !0),
                      ]),
                      _: 1,
                    }),
                  ]),
                ]),
          ])
        );
      };
    },
  }),
  ia = { class: "custom-date-picker" },
  da = Ye(
    K({
      name: "FaDatePicker",
      __name: "FaDatePicker",
      props: {
        modelValue: {},
        type: { default: "datetimerange" },
        format: {},
        rangeSeparator: { default: "至" },
        startPlaceholder: { default: "开始日期" },
        endPlaceholder: { default: "结束日期" },
      },
      emits: ["update:model-value"],
      setup(e, { emit: a }) {
        const t = e,
          l = a,
          o = ke(() => ["datetimerange", "daterange", "monthrange"].includes(t.type)),
          r = ke(() => {
            if (t.format) return t.format;
            switch (t.type) {
              case "datetime":
              case "datetimerange":
                return "YYYY-MM-DD HH:mm:ss";
              case "date":
              case "daterange":
              default:
                return "YYYY-MM-DD";
              case "month":
              case "monthrange":
                return "YYYY-MM";
              case "year":
                return "YYYY";
              case "week":
                return "YYYY-wo";
            }
          }),
          n = ke(() => t.type),
          s = [
            {
              text: "近一天",
              value: () => {
                const e = new Date(),
                  a = new Date();
                return (a.setTime(a.getTime() - 864e5), [a, e]);
              },
            },
            {
              text: "近三天",
              value: () => {
                const e = new Date(),
                  a = new Date();
                return (a.setTime(a.getTime() - 2592e5), [a, e]);
              },
            },
            {
              text: "近一周",
              value: () => {
                const e = new Date(),
                  a = new Date();
                return (a.setTime(a.getTime() - 6048e5), [a, e]);
              },
            },
            {
              text: "近一个月",
              value: () => {
                const e = new Date(),
                  a = new Date();
                return (a.setTime(a.getTime() - 2592e6), [a, e]);
              },
            },
            {
              text: "近三个月",
              value: () => {
                const e = new Date(),
                  a = new Date();
                return (a.setTime(a.getTime() - 7776e6), [a, e]);
              },
            },
          ];
        return (a, t) => {
          const i = b;
          return (
            X(),
            ue("div", ia, [
              te(
                i,
                ve(
                  {
                    "model-value": e.modelValue,
                    type: n.value,
                    format: r.value,
                    "value-format": r.value,
                    "range-separator": e.rangeSeparator,
                    "start-placeholder": e.startPlaceholder,
                    "end-placeholder": e.endPlaceholder,
                    shortcuts: o.value ? s : void 0,
                  },
                  a.$attrs,
                  { "onUpdate:modelValue": t[0] || (t[0] = (e) => l("update:model-value", e)) }
                ),
                null,
                16,
                [
                  "model-value",
                  "type",
                  "format",
                  "value-format",
                  "range-separator",
                  "start-placeholder",
                  "end-placeholder",
                  "shortcuts",
                ]
              ),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-21344608"]]
  ),
  ua = { class: "feedback" },
  pa = Ye(
    K({
      name: "FaTableSelect",
      __name: "index",
      props: { selectConfig: {}, text: { default: "" } },
      emits: ["confirmClick", "clearClick"],
      setup(e, { emit: a }) {
        const o = e,
          n = a,
          s = o.selectConfig.pk ?? "id",
          i = !0 === o.selectConfig.multiple,
          d = o.selectConfig.width ?? "100%",
          u = o.selectConfig.placeholder ?? "请选择",
          m = Z(!1),
          f = Z(!1),
          v = Z(0),
          g = Z([]),
          y = De({ page_no: 1, page_size: 10 }),
          h = Z(),
          z = Z(d);
        se(h, (e) => {
          z.value = `${e[0].contentRect.width}px`;
        });
        const T = Z();
        for (const t of o.selectConfig.formItems) y[t.prop] = t.initialValue ?? "";
        function U() {
          (T.value?.resetFields(), L(!0));
        }
        function R() {
          L(!0);
        }
        async function L(e = !1) {
          ((f.value = !0), e && ((y.page_no = 1), (y.page_size = 10)));
          try {
            const e = await o.selectConfig.indexAction(y);
            ((v.value = e.total), (g.value = e.list));
          } finally {
            f.value = !1;
          }
        }
        const O = Z(),
          D = ke(() =>
            o.selectConfig.tableColumns.map((e) =>
              "selection" === e.type ? { ...e, reserveSelection: !0 } : e
            )
          ),
          E = Z([]),
          I = ke(() => (E.value.length > 0 ? `已选(${E.value.length})` : "确 定"));
        function A(e) {
          i || 0 === e.length
            ? (E.value = e)
            : ((E.value = [e[e.length - 1]]),
              O.value?.clearSelection(),
              O.value?.toggleRowSelection(E.value[0], !0),
              O.value?.setCurrentRow(E.value[0]));
        }
        function $(e) {
          i && (E.value = e);
        }
        function F() {
          L();
        }
        const j = Z(!1);
        function P() {
          !1 === j.value && ((j.value = !0), L());
        }
        function Y() {
          0 !== E.value.length
            ? ((m.value = !1), n("confirmClick", E.value))
            : V.error("请选择数据");
        }
        function M() {
          (O.value?.clearSelection(), (E.value = []), n("clearClick"));
        }
        function H() {
          m.value = !1;
        }
        const N = Z();
        return (a, o) => {
          const n = Re("ArrowDown"),
            V = B,
            L = w,
            E = C,
            j = x,
            q = S,
            Z = b,
            K = k,
            G = c,
            W = _,
            le = l,
            oe = r,
            re = Ke,
            ne = p,
            se = t;
          return (
            X(),
            ue(
              "div",
              { ref_key: "tableSelectRef", ref: h, style: Le("width:" + pe(d)) },
              [
                te(
                  ne,
                  ve(
                    {
                      visible: m.value,
                      width: e.selectConfig.popover?.width ?? z.value,
                      placement: "bottom-end",
                    },
                    e.selectConfig.popover,
                    { onShow: P }
                  ),
                  {
                    reference: Q(() => [
                      ee("div", { onClick: o[0] || (o[0] = (e) => (m.value = !m.value)) }, [
                        be(
                          a.$slots,
                          "default",
                          {},
                          () => [
                            te(
                              L,
                              {
                                class: "reference",
                                style: "width: 100%",
                                "model-value": e.text,
                                readonly: !0,
                                placeholder: pe(u),
                                clearable: !0,
                                onClear: M,
                              },
                              {
                                suffix: Q(() => [
                                  te(
                                    V,
                                    {
                                      style: Le({
                                        transform: m.value ? "rotate(180deg)" : "rotate(0)",
                                        transition: "transform .5s",
                                      }),
                                    },
                                    { default: Q(() => [te(n)]), _: 1 },
                                    8,
                                    ["style"]
                                  ),
                                ]),
                                _: 1,
                              },
                              8,
                              ["model-value", "placeholder"]
                            ),
                          ],
                          !0
                        ),
                      ]),
                    ]),
                    default: Q(() => [
                      ee(
                        "div",
                        { ref_key: "popoverContentRef", ref: N },
                        [
                          te(
                            W,
                            { ref_key: "formRef", ref: T, model: y, inline: !0 },
                            {
                              default: Q(() => [
                                (X(!0),
                                ue(
                                  me,
                                  null,
                                  fe(
                                    e.selectConfig.formItems,
                                    (e) => (
                                      X(),
                                      J(
                                        K,
                                        { key: e.prop, label: e.label, prop: e.prop },
                                        {
                                          default: Q(() => [
                                            "input" === e.type
                                              ? (X(),
                                                ue(
                                                  me,
                                                  { key: 0 },
                                                  [
                                                    "number" === e.attrs?.type
                                                      ? (X(),
                                                        J(
                                                          L,
                                                          ve(
                                                            {
                                                              key: 0,
                                                              modelValue: y[e.prop],
                                                              "onUpdate:modelValue": (a) =>
                                                                (y[e.prop] = a),
                                                              modelModifiers: { number: !0 },
                                                            },
                                                            { ref_for: !0 },
                                                            e.attrs,
                                                            { onKeyup: Oe(R, ["enter"]) }
                                                          ),
                                                          null,
                                                          16,
                                                          ["modelValue", "onUpdate:modelValue"]
                                                        ))
                                                      : (X(),
                                                        J(
                                                          L,
                                                          ve(
                                                            {
                                                              key: 1,
                                                              modelValue: y[e.prop],
                                                              "onUpdate:modelValue": (a) =>
                                                                (y[e.prop] = a),
                                                            },
                                                            { ref_for: !0 },
                                                            e.attrs,
                                                            { onKeyup: Oe(R, ["enter"]) }
                                                          ),
                                                          null,
                                                          16,
                                                          ["modelValue", "onUpdate:modelValue"]
                                                        )),
                                                  ],
                                                  64
                                                ))
                                              : "select" === e.type
                                                ? (X(),
                                                  J(
                                                    j,
                                                    ve(
                                                      {
                                                        key: 1,
                                                        modelValue: y[e.prop],
                                                        "onUpdate:modelValue": (a) =>
                                                          (y[e.prop] = a),
                                                      },
                                                      { ref_for: !0 },
                                                      e.attrs
                                                    ),
                                                    {
                                                      default: Q(() => [
                                                        (X(!0),
                                                        ue(
                                                          me,
                                                          null,
                                                          fe(
                                                            e.options,
                                                            (e) => (
                                                              X(),
                                                              J(
                                                                E,
                                                                {
                                                                  key: e.value,
                                                                  label: e.label,
                                                                  value: e.value,
                                                                },
                                                                null,
                                                                8,
                                                                ["label", "value"]
                                                              )
                                                            )
                                                          ),
                                                          128
                                                        )),
                                                      ]),
                                                      _: 2,
                                                    },
                                                    1040,
                                                    ["modelValue", "onUpdate:modelValue"]
                                                  ))
                                                : "tree-select" === e.type
                                                  ? (X(),
                                                    J(
                                                      q,
                                                      ve(
                                                        {
                                                          key: 2,
                                                          modelValue: y[e.prop],
                                                          "onUpdate:modelValue": (a) =>
                                                            (y[e.prop] = a),
                                                        },
                                                        { ref_for: !0 },
                                                        e.attrs
                                                      ),
                                                      null,
                                                      16,
                                                      ["modelValue", "onUpdate:modelValue"]
                                                    ))
                                                  : "date-picker" === e.type
                                                    ? (X(),
                                                      J(
                                                        Z,
                                                        ve(
                                                          {
                                                            key: 3,
                                                            modelValue: y[e.prop],
                                                            "onUpdate:modelValue": (a) =>
                                                              (y[e.prop] = a),
                                                          },
                                                          { ref_for: !0 },
                                                          e.attrs
                                                        ),
                                                        null,
                                                        16,
                                                        ["modelValue", "onUpdate:modelValue"]
                                                      ))
                                                    : (X(),
                                                      ue(
                                                        me,
                                                        { key: 4 },
                                                        [
                                                          "number" === e.attrs?.type
                                                            ? (X(),
                                                              J(
                                                                L,
                                                                ve(
                                                                  {
                                                                    key: 0,
                                                                    modelValue: y[e.prop],
                                                                    "onUpdate:modelValue": (a) =>
                                                                      (y[e.prop] = a),
                                                                    modelModifiers: { number: !0 },
                                                                  },
                                                                  { ref_for: !0 },
                                                                  e.attrs,
                                                                  { onKeyup: Oe(R, ["enter"]) }
                                                                ),
                                                                null,
                                                                16,
                                                                [
                                                                  "modelValue",
                                                                  "onUpdate:modelValue",
                                                                ]
                                                              ))
                                                            : (X(),
                                                              J(
                                                                L,
                                                                ve(
                                                                  {
                                                                    key: 1,
                                                                    modelValue: y[e.prop],
                                                                    "onUpdate:modelValue": (a) =>
                                                                      (y[e.prop] = a),
                                                                  },
                                                                  { ref_for: !0 },
                                                                  e.attrs,
                                                                  { onKeyup: Oe(R, ["enter"]) }
                                                                ),
                                                                null,
                                                                16,
                                                                [
                                                                  "modelValue",
                                                                  "onUpdate:modelValue",
                                                                ]
                                                              )),
                                                        ],
                                                        64
                                                      )),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ["label", "prop"]
                                      )
                                    )
                                  ),
                                  128
                                )),
                                te(K, null, {
                                  default: Q(() => [
                                    te(
                                      G,
                                      { type: "primary", icon: "search", onClick: R },
                                      {
                                        default: Q(() => [...(o[4] || (o[4] = [ze("搜索", -1)]))]),
                                        _: 1,
                                      }
                                    ),
                                    te(
                                      G,
                                      { icon: "refresh", onClick: U },
                                      {
                                        default: Q(() => [...(o[5] || (o[5] = [ze("重置", -1)]))]),
                                        _: 1,
                                      }
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
                          ce(
                            (X(),
                            J(
                              oe,
                              {
                                ref_key: "tableRef",
                                ref: O,
                                data: g.value,
                                border: !0,
                                "max-height": 250,
                                "row-key": pe(s),
                                class: ae({ radio: !i }),
                                onSelect: A,
                                onSelectAll: $,
                              },
                              {
                                default: Q(() => [
                                  (X(!0),
                                  ue(
                                    me,
                                    null,
                                    fe(
                                      D.value,
                                      (e) => (
                                        X(),
                                        ue(
                                          me,
                                          { key: e.prop },
                                          [
                                            "custom" === e.templet
                                              ? (X(),
                                                J(
                                                  le,
                                                  ve({ key: 0, ref_for: !0 }, e),
                                                  {
                                                    default: Q((t) => [
                                                      be(
                                                        a.$slots,
                                                        e.slotName ?? e.prop,
                                                        ve({ prop: e.prop }, { ref_for: !0 }, t),
                                                        void 0,
                                                        !0
                                                      ),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1040
                                                ))
                                              : (X(),
                                                J(le, ve({ key: 1, ref_for: !0 }, e), null, 16)),
                                          ],
                                          64
                                        )
                                      )
                                    ),
                                    128
                                  )),
                                ]),
                                _: 3,
                              },
                              8,
                              ["data", "row-key", "class"]
                            )),
                            [[se, f.value]]
                          ),
                          te(
                            re,
                            {
                              class: "mt-2",
                              total: v.value,
                              "onUpdate:total": o[1] || (o[1] = (e) => (v.value = e)),
                              page: y.page_no,
                              "onUpdate:page": o[2] || (o[2] = (e) => (y.page_no = e)),
                              limit: y.page_size,
                              "onUpdate:limit": o[3] || (o[3] = (e) => (y.page_size = e)),
                              onPagination: F,
                            },
                            null,
                            8,
                            ["total", "page", "limit"]
                          ),
                          ee("div", ua, [
                            te(
                              G,
                              { type: "primary", size: "small", onClick: Y },
                              { default: Q(() => [ze(ge(I.value), 1)]), _: 1 }
                            ),
                            te(
                              G,
                              { type: "danger", size: "small", onClick: M },
                              { default: Q(() => [...(o[6] || (o[6] = [ze("清 空", -1)]))]), _: 1 }
                            ),
                            te(
                              G,
                              { size: "small", onClick: H },
                              { default: Q(() => [...(o[7] || (o[7] = [ze("关 闭", -1)]))]), _: 1 }
                            ),
                          ]),
                        ],
                        512
                      ),
                    ]),
                    _: 3,
                  },
                  16,
                  ["visible", "width"]
                ),
              ],
              4
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-ef0d8cfc"]]
  ),
  ca = K({
    name: "FaUserTableSelect",
    __name: "FaUserTableSelect",
    props: { modelValue: {} },
    emits: ["confirmClick", "update:modelValue"],
    setup(e, { emit: a }) {
      const t = e,
        l = a,
        o = {
          pk: "id",
          /** 与 FaSearchBar 栅格内 ElInput 一致，占满表单项内容区 */
          width: "100%",
          placeholder: "请选择用户",
          popover: { width: 720 },
          formItems: [
            {
              type: "select",
              label: "状态",
              prop: "status",
              initialValue: "0",
              attrs: { placeholder: "全部", clearable: !0, style: { width: "140px" } },
              options: [
                { label: "启用", value: "0" },
                { label: "停用", value: "1" },
              ],
            },
          ],
          async indexAction(e) {
            const a = { ...e };
            (Object.keys(a).forEach((e) => {
              const t = a[e];
              ("" !== t && null != t) || delete a[e];
            }),
              "string" == typeof a.status &&
                ("true" === a.status ? (a.status = !0) : "false" === a.status && (a.status = !1)));
            const t = await je.listUser(a);
            return { total: t.data.data.total, list: t.data.data.items };
          },
          tableColumns: [
            { type: "selection", width: 50, align: "center" },
            { label: "编号", align: "center", prop: "id", width: 100 },
            { label: "账号", align: "center", prop: "username" },
            { label: "用户名", align: "center", prop: "name", width: 120 },
            {
              label: "状态",
              align: "center",
              prop: "status",
              templet: "custom",
              slotName: "status",
            },
          ],
        },
        r = Z();
      function n(e) {
        r.value = e[0];
        const a = r.value?.id;
        (l("update:modelValue", a), l("confirmClick", e));
      }
      function s() {
        ((r.value = void 0), l("update:modelValue", void 0));
      }
      W(
        () => t.modelValue,
        (e) => {
          null == e && (r.value = void 0);
        }
      );
      const i = ke(() => (r.value ? `${r.value.username} - ${r.value.name}` : ""));
      return (e, a) => {
        const t = z,
          l = pa;
        return (
          X(),
          J(
            l,
            { text: pe(i), "select-config": o, onConfirmClick: n, onClearClick: s },
            {
              status: Q((e) => [
                te(
                  t,
                  { type: "0" === e.row[e.prop] ? "success" : "danger" },
                  { default: Q(() => [ze(ge("0" === e.row[e.prop] ? "启用" : "停用"), 1)]), _: 2 },
                  1032,
                  ["type"]
                ),
              ]),
              _: 1,
            },
            8,
            ["text"]
          )
        );
      };
    },
  });
const ma = { key: 1 },
  fa = { key: 0, class: "w-full min-w-0" },
  va = { key: 1, class: "w-full min-w-0" },
  ga = { class: "form-buttons" },
  ya = { class: "icon-wrapper" },
  ha = Ye(
    K({
      name: "FaSearchBar",
      __name: "index",
      props: le(
        {
          items: { default: () => [] },
          span: { default: 6 },
          gutter: { default: 12 },
          isExpand: { type: Boolean, default: !1 },
          defaultExpanded: { type: Boolean, default: !1 },
          labelPosition: { default: "right" },
          labelWidth: { default: "70px" },
          showExpand: { type: Boolean, default: !0 },
          buttonLeftLimit: { default: 0 },
          showReset: { type: Boolean, default: !0 },
          showSearch: { type: Boolean, default: !0 },
          disabledSearch: { type: Boolean, default: !1 },
          sanitizeOutput: { default: () => ({}) },
          includeAudit: { type: Boolean, default: !1 },
          auditItemOptions: {},
        },
        { modelValue: { default: {} }, modelModifiers: {} }
      ),
      emits: le(["reset", "search"], ["update:modelValue"]),
      setup(e, { expose: a, emit: t }) {
        const l = {
            input: w,
            // 输入框
            inputTag: N,
            // 标签输入框
            number: H,
            // 数字输入框
            select: x,
            // 选择器
            switch: M,
            // 开关
            checkbox: u,
            // 复选框
            checkboxgroup: Y,
            // 复选框组
            radiogroup: P,
            // 单选框组
            date: da,
            // 日期选择器
            daterange: da,
            // 日期范围选择器
            datetime: da,
            // 日期时间选择器
            datetimerange: da,
            // 日期时间范围选择器
            rate: j,
            // 评分
            slider: F,
            // 滑块
            cascader: $,
            // 级联选择器
            timepicker: A,
            // 时间选择器
            timeselect: I,
            // 时间选择
            treeselect: S,
          },
          { width: o } = _e(),
          { t: r } = Se(),
          n = ke(() => o.value < 500),
          s = Ee("formRef"),
          i = e,
          d = t,
          p = G(e, "modelValue"),
          m = Z({}),
          f = ke(() =>
            (function (e) {
              const a = e?.span ?? 6,
                t = e?.valueFormat ?? "YYYY-MM-DD HH:mm:ss",
                l = e?.rangeSeparator ?? "至",
                o = e?.startPlaceholder ?? "开始",
                r = e?.endPlaceholder ?? "结束",
                n = e?.showCreatedBy ?? !0,
                s = e?.showUpdatedBy ?? !0,
                i = e?.showCreatedTime ?? !0,
                d = e?.showUpdatedTime ?? !0,
                u = {
                  created_id: {
                    label: e?.createdByLabel ?? "创建人",
                    key: "created_id",
                    type: "input",
                    props: {
                      placeholder: e?.createdByPlaceholder ?? "请选择创建人",
                      style: { width: "100%" },
                    },
                    span: a,
                    expandOnly: !0,
                  },
                  updated_id: {
                    label: e?.updatedByLabel ?? "更新人",
                    key: "updated_id",
                    type: "input",
                    props: {
                      placeholder: e?.updatedByPlaceholder ?? "请选择更新人",
                      style: { width: "100%" },
                    },
                    span: a,
                    expandOnly: !0,
                  },
                  created_time: {
                    label: e?.createdTimeLabel ?? "创建时间",
                    key: "created_time",
                    type: "datetimerange",
                    props: {
                      style: { width: "100%" },
                      type: "datetimerange",
                      rangeSeparator: l,
                      startPlaceholder: o,
                      endPlaceholder: r,
                      valueFormat: t,
                    },
                    span: a,
                    expandOnly: !0,
                  },
                  updated_time: {
                    label: e?.updatedTimeLabel ?? "更新时间",
                    key: "updated_time",
                    type: "datetimerange",
                    props: {
                      style: { width: "100%" },
                      type: "datetimerange",
                      rangeSeparator: l,
                      startPlaceholder: o,
                      endPlaceholder: r,
                      valueFormat: t,
                    },
                    span: a,
                    expandOnly: !0,
                  },
                },
                p = [];
              return (
                n && p.push("created_id"),
                s && p.push("updated_id"),
                i && p.push("created_time"),
                d && p.push("updated_time"),
                p.map((e) => u[e]).filter((e) => Boolean(e))
              );
            })(i.auditItemOptions)
          ),
          v = ke(() => (i.includeAudit ? [...i.items, ...f.value] : i.items)),
          g = (e) => {
            if (!e) return {};
            const a = (e) => {
              if (Array.isArray(e)) return e.map((e) => a(e));
              if (e && "object" == typeof e) {
                const t = $e(e);
                return Object.keys(t).reduce((e, l) => ((e[l] = a(t[l])), e), {});
              }
              return e;
            };
            return a($e(e));
          };
        m.value = g(p.value);
        const y = Z(i.defaultExpanded),
          h = ["label", "labelWidth", "key", "type", "hidden", "span", "slots"],
          b = ke(() => ({
            removeEmptyString: !0,
            removeEmptyArray: !0,
            removeEmptyObject: !0,
            removeEmptyRichText: !0,
            keepZero: !0,
            keepFalse: !0,
            ...i.sanitizeOutput,
          })),
          V = (e) => {
            if (e.props) return e.props;
            const a = { ...e };
            return (h.forEach((e) => delete a[e]), a);
          },
          z = (e) => {
            if (!e.slots) return {};
            const a = {};
            return (
              Object.entries(e.slots).forEach(([e, t]) => {
                t && (a[e] = t);
              }),
              a
            );
          },
          q = (e, a) => Ne(e, Ve.value, a),
          K = (e) => {
            const a = b.value;
            if (Array.isArray(e)) {
              const t = e.map((e) => K(e)).filter((e) => void 0 !== e);
              return 0 === t.length && a.removeEmptyArray ? void 0 : t;
            }
            if (e && "object" == typeof e) {
              const t = $e(e),
                l = Object.entries(t).reduce((e, [a, t]) => {
                  const l = K(t);
                  return (void 0 !== l && (e[a] = l), e);
                }, {});
              return 0 === Object.keys(l).length && a.removeEmptyObject ? void 0 : l;
            }
            if ("string" == typeof e) {
              if (a.removeEmptyString && "" === e.trim()) return;
              if (
                a.removeEmptyRichText &&
                ((e) =>
                  !/<(img|video|audio|iframe|embed|object)\b/i.test(e) &&
                  "" ===
                    e
                      .replace(/&nbsp;/gi, "")
                      .replace(/<br\s*\/?>/gi, "")
                      .replace(/<[^>]*>/g, "")
                      .trim())(e)
              )
                return;
              return e;
            }
            return 0 === e
              ? a.keepZero
                ? e
                : void 0
              : !1 === e
                ? a.keepFalse
                  ? e
                  : void 0
                : (e ?? void 0);
          },
          W = () => K(g(p.value)) || {},
          le = (e) => {
            if (e.render) return e.render;
            const { type: a } = e;
            return l[a] || l.input;
          },
          oe = (e, a) => {
            p.value = { ...p.value, [e]: a };
          },
          re = () => {
            d("search", W());
          },
          ne = ke(() => {
            const e = v.value.filter((e) => !e.hidden);
            if (!i.isExpand && !y.value) {
              const a = Math.floor(24 / i.span) - 1;
              return e.filter((e) => !e.expandOnly).slice(0, a);
            }
            return e;
          }),
          se = ke(() => v.value.filter((e) => !e.hidden).length),
          ie = ke(() => !i.isExpand && i.showExpand && se.value > Math.floor(24 / i.span) - 1),
          de = ke(() => (y.value ? r("table.searchBar.collapse") : r("table.searchBar.expand"))),
          we = ke(() => ({
            "justify-content": n.value
              ? "flex-end"
              : i.items.filter((e) => !e.hidden).length <= i.buttonLeftLimit
                ? "flex-start"
                : "flex-end",
          })),
          xe = () => {
            y.value = !y.value;
          },
          Ce = () => {
            (s.value?.resetFields(),
              Object.keys(p.value).forEach((e) => {
                delete p.value[e];
              }),
              Object.assign(p.value, g(m.value)),
              d("reset"));
          },
          Be = () => {
            d("search", W());
          };
        a({
          ref: s,
          validate: (...e) => s.value?.validate(...e),
          reset: Ce,
          // 允许外部在手动组装请求前直接读取清洗后的参数。
          getOutput: W,
        });
        const { span: Ve, gutter: Te, labelPosition: Re, labelWidth: Oe } = Ie(i);
        return (a, t) => {
          const l = C,
            o = R,
            n = k,
            s = U,
            i = c,
            d = B,
            m = T,
            f = _,
            v = Ue("ripple");
          return (
            X(),
            ue(
              "section",
              { class: ae(["fa-search-bar fa-card-xs", { "is-expanded": pe(y) }]) },
              [
                te(
                  f,
                  ve({ ref: "formRef", model: p.value, "label-position": pe(Re) }, { ...a.$attrs }),
                  {
                    default: Q(() => [
                      te(
                        m,
                        { gutter: pe(Te) },
                        {
                          default: Q(() => [
                            (X(!0),
                            ue(
                              me,
                              null,
                              fe(
                                pe(ne),
                                (e) => (
                                  X(),
                                  J(
                                    s,
                                    {
                                      key: e.key,
                                      xs: q(e.span, "xs"),
                                      sm: q(e.span, "sm"),
                                      md: q(e.span, "md"),
                                      lg: q(e.span, "lg"),
                                      xl: q(e.span, "xl"),
                                    },
                                    {
                                      default: Q(() => [
                                        te(
                                          n,
                                          {
                                            prop: e.key,
                                            "label-width": e.label
                                              ? e.labelWidth || pe(Oe)
                                              : void 0,
                                          },
                                          Ae(
                                            {
                                              default: Q(() => [
                                                "created_id" !== e.key || a.$slots.created_id
                                                  ? "updated_id" !== e.key || a.$slots.updated_id
                                                    ? be(
                                                        a.$slots,
                                                        e.key,
                                                        { key: 2, item: e, modelValue: p.value },
                                                        () => {
                                                          return [
                                                            (X(),
                                                            J(
                                                              ye(le(e)),
                                                              ve(
                                                                {
                                                                  "model-value":
                                                                    ((a = e.key), p.value[a]),
                                                                  "onUpdate:modelValue": (a) =>
                                                                    ((e, a) => {
                                                                      const t = ((e) =>
                                                                        "" === e ? void 0 : e)(a);
                                                                      void 0 !== t
                                                                        ? (p.value[e] = t)
                                                                        : delete p.value[e];
                                                                    })(e.key, a),
                                                                },
                                                                { ref_for: !0 },
                                                                V(e)
                                                              ),
                                                              Ae(
                                                                {
                                                                  default: Q(() => [
                                                                    "select" === e.type &&
                                                                    V(e)?.options
                                                                      ? (X(!0),
                                                                        ue(
                                                                          me,
                                                                          { key: 0 },
                                                                          fe(
                                                                            V(e).options,
                                                                            (e) => (
                                                                              X(),
                                                                              J(
                                                                                l,
                                                                                ve(
                                                                                  { ref_for: !0 },
                                                                                  e,
                                                                                  { key: e.value }
                                                                                ),
                                                                                null,
                                                                                16
                                                                              )
                                                                            )
                                                                          ),
                                                                          128
                                                                        ))
                                                                      : he("", !0),
                                                                    "checkboxgroup" === e.type &&
                                                                    V(e)?.options
                                                                      ? (X(!0),
                                                                        ue(
                                                                          me,
                                                                          { key: 1 },
                                                                          fe(
                                                                            V(e).options,
                                                                            (e) => (
                                                                              X(),
                                                                              J(
                                                                                pe(u),
                                                                                ve(
                                                                                  { ref_for: !0 },
                                                                                  e,
                                                                                  { key: e.value }
                                                                                ),
                                                                                null,
                                                                                16
                                                                              )
                                                                            )
                                                                          ),
                                                                          128
                                                                        ))
                                                                      : he("", !0),
                                                                    "radiogroup" === e.type &&
                                                                    V(e)?.options
                                                                      ? (X(!0),
                                                                        ue(
                                                                          me,
                                                                          { key: 2 },
                                                                          fe(
                                                                            V(e).options,
                                                                            (e) => (
                                                                              X(),
                                                                              J(
                                                                                o,
                                                                                ve(
                                                                                  { ref_for: !0 },
                                                                                  e,
                                                                                  { key: e.value }
                                                                                ),
                                                                                null,
                                                                                16
                                                                              )
                                                                            )
                                                                          ),
                                                                          128
                                                                        ))
                                                                      : he("", !0),
                                                                  ]),
                                                                  _: 2,
                                                                },
                                                                [
                                                                  fe(z(e), (e, a) => ({
                                                                    name: a,
                                                                    fn: Q(() => [(X(), J(ye(e)))]),
                                                                  })),
                                                                ]
                                                              ),
                                                              1040,
                                                              ["model-value", "onUpdate:modelValue"]
                                                            )),
                                                          ];
                                                          var a;
                                                        },
                                                        !0
                                                      )
                                                    : (X(),
                                                      ue("div", va, [
                                                        te(
                                                          ca,
                                                          {
                                                            "model-value":
                                                              null == p.value?.updated_id
                                                                ? void 0
                                                                : p.value.updated_id,
                                                            "onUpdate:modelValue":
                                                              t[1] ||
                                                              (t[1] = (e) => oe("updated_id", e)),
                                                            onConfirmClick: re,
                                                            onClearClick: re,
                                                          },
                                                          null,
                                                          8,
                                                          ["model-value"]
                                                        ),
                                                      ]))
                                                  : (X(),
                                                    ue("div", fa, [
                                                      te(
                                                        ca,
                                                        {
                                                          "model-value":
                                                            null == p.value?.created_id
                                                              ? void 0
                                                              : p.value.created_id,
                                                          "onUpdate:modelValue":
                                                            t[0] ||
                                                            (t[0] = (e) => oe("created_id", e)),
                                                          onConfirmClick: re,
                                                          onClearClick: re,
                                                        },
                                                        null,
                                                        8,
                                                        ["model-value"]
                                                      ),
                                                    ])),
                                              ]),
                                              _: 2,
                                            },
                                            [
                                              e.label
                                                ? {
                                                    name: "label",
                                                    fn: Q(() => [
                                                      "string" != typeof e.label
                                                        ? (X(), J(ye(e.label), { key: 0 }))
                                                        : (X(), ue("span", ma, ge(e.label), 1)),
                                                    ]),
                                                    key: "0",
                                                  }
                                                : void 0,
                                            ]
                                          ),
                                          1032,
                                          ["prop", "label-width"]
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1032,
                                    ["xs", "sm", "md", "lg", "xl"]
                                  )
                                )
                              ),
                              128
                            )),
                            te(
                              s,
                              {
                                xs: 24,
                                sm: 24,
                                md: pe(Ve),
                                lg: pe(Ve),
                                xl: pe(Ve),
                                class: "action-column",
                              },
                              {
                                default: Q(() => [
                                  ee(
                                    "div",
                                    { class: "action-buttons-wrapper", style: Le(pe(we)) },
                                    [
                                      ee("div", ga, [
                                        e.showReset
                                          ? ce(
                                              (X(),
                                              J(
                                                i,
                                                { key: 0, class: "reset-button", onClick: Ce },
                                                {
                                                  icon: Q(() => [te(pe(L))]),
                                                  default: Q(() => [
                                                    ze(" " + ge(pe(r)("table.searchBar.reset")), 1),
                                                  ]),
                                                  _: 1,
                                                }
                                              )),
                                              [[v]]
                                            )
                                          : he("", !0),
                                        e.showSearch
                                          ? ce(
                                              (X(),
                                              J(
                                                i,
                                                {
                                                  key: 1,
                                                  type: "primary",
                                                  class: "search-button",
                                                  onClick: Be,
                                                  disabled: e.disabledSearch,
                                                },
                                                {
                                                  icon: Q(() => [te(pe(O))]),
                                                  default: Q(() => [
                                                    ze(
                                                      " " + ge(pe(r)("table.searchBar.search")),
                                                      1
                                                    ),
                                                  ]),
                                                  _: 1,
                                                },
                                                8,
                                                ["disabled"]
                                              )),
                                              [[v]]
                                            )
                                          : he("", !0),
                                      ]),
                                      pe(ie)
                                        ? (X(),
                                          ue(
                                            "div",
                                            { key: 0, class: "filter-toggle", onClick: xe },
                                            [
                                              ee("span", null, ge(pe(de)), 1),
                                              ee("div", ya, [
                                                te(d, null, {
                                                  default: Q(() => [
                                                    pe(y)
                                                      ? (X(), J(pe(D), { key: 0 }))
                                                      : (X(), J(pe(E), { key: 1 })),
                                                  ]),
                                                  _: 1,
                                                }),
                                              ]),
                                            ]
                                          ))
                                        : he("", !0),
                                    ],
                                    4
                                  ),
                                ]),
                                _: 1,
                              },
                              8,
                              ["md", "lg", "xl"]
                            ),
                          ]),
                          _: 3,
                        },
                        8,
                        ["gutter"]
                      ),
                    ]),
                    _: 3,
                  },
                  16,
                  ["model", "label-position"]
                ),
              ],
              2
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-86a0df64"]]
  );
export { da as F, ha as _, ra as a, Xe as b, sa as c, Ne as d };
