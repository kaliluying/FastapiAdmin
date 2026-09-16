import {
  w as e,
  T as t,
  i as a,
  x as l,
  M as s,
  g as o,
  Q as r,
  d as i,
  U as d,
  ad as n,
  a6 as u,
  a5 as p,
  f as m,
  X as f,
  S as y,
  R as c,
  h as b,
  _ as v,
  V as g,
  B as x,
  C as k,
  A as h,
} from "./element-plus.BPg5EhXK.js";
import {
  z as _,
  aX as j,
  b8 as w,
  a$ as E,
  aC as O,
  ar as V,
  ag as F,
  n as R,
  bt as S,
  m as A,
  w as B,
  a0 as $,
  aI as C,
  p as U,
  F as W,
  ao as L,
  t as z,
  as as T,
  ax as X,
  ap as H,
  o as M,
  a4 as P,
  bu as Z,
  v as I,
  $ as N,
  al as Q,
  j as q,
  aA as D,
  bi as G,
} from "./vue-vendor.Dwx3gfQr.js";
import { F as J, d as K } from "./index.E8bA6rDJ.js";
import "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
const Y = { class: "px-4 pb-0 pt-4 md:px-4 md:pt-4" },
  ee = { key: 1 },
  te = { class: "flex gap-2 md:justify-center" },
  ae = { key: 1, class: "px-4 pb-0 pt-4 md:px-4 md:pt-4" },
  le = { key: 1 },
  se = { class: "flex gap-2 md:justify-center" },
  oe = _({
    name: "FaForm",
    __name: "index",
    props: N(
      {
        items: { default: () => [] },
        span: { default: 6 },
        gutter: { default: 12 },
        labelPosition: { default: "right" },
        labelWidth: { default: "70px" },
        buttonLeftLimit: { default: 2 },
        showReset: { type: Boolean, default: !0 },
        showSubmit: { type: Boolean, default: !0 },
        disabledSubmit: { type: Boolean, default: !1 },
        loading: { type: Boolean, default: !1 },
        sanitizeOutput: { default: () => ({}) },
        scrollbar: { type: Boolean, default: !1 },
        maxHeight: { default: "75vh" },
      },
      { modelValue: { default: {} }, modelModifiers: {} }
    ),
    emits: N(["reset", "submit"], ["update:modelValue"]),
    setup(_, { expose: N, emit: oe }) {
      const re = {
          input: h,
          // 输入框
          inputtag: k,
          // 标签输入框
          number: x,
          // 数字输入框
          select: g,
          // 选择器
          switch: v,
          // 开关
          checkbox: o,
          // 复选框
          checkboxgroup: b,
          // 复选框组
          radiogroup: c,
          // 单选框组
          date: J,
          // 日期选择器
          daterange: J,
          // 日期范围选择器
          datetime: J,
          // 日期时间选择器
          datetimerange: J,
          // 日期时间范围选择器
          rate: y,
          // 评分
          slider: f,
          // 滑块
          cascader: m,
          // 级联选择器
          timepicker: p,
          // 时间选择器
          timeselect: u,
          // 时间选择
          treeselect: n,
        },
        { width: ie } = G(),
        { t: de } = j(),
        ne = q(() => ie.value < 500),
        ue = w("formRef"),
        pe = _,
        me = oe,
        fe = E(_, "modelValue"),
        ye = Q({}),
        ce = (e) => {
          if (!e) return {};
          const t = (e) => {
            if (Array.isArray(e)) return e.map((e) => t(e));
            if (e && "object" == typeof e) {
              const a = D(e);
              return Object.keys(a).reduce((e, l) => ((e[l] = t(a[l])), e), {});
            }
            return e;
          };
          return t(D(e));
        };
      ye.value = ce(fe.value);
      const be = ["label", "labelWidth", "key", "type", "hidden", "span", "slots"],
        ve = q(() => ({
          removeEmptyString: !0,
          removeEmptyArray: !0,
          removeEmptyObject: !0,
          removeEmptyRichText: !0,
          keepZero: !0,
          keepFalse: !0,
          ...pe.sanitizeOutput,
        })),
        ge = /^\d+$/,
        xe = (e) =>
          e
            .split(".")
            .filter(Boolean)
            .map((e) => (ge.test(e) ? Number(e) : e)),
        ke = (e) =>
          xe(e).reduce((e, t) => {
            if (null != e) return e[t];
          }, fe.value),
        he = (e, t) => {
          const a = "" === t ? void 0 : t,
            l = xe(e);
          if (!l.length) return;
          if (void 0 === a)
            return void ((e) => {
              const t = xe(e);
              if (!t.length) return;
              const a = t.pop(),
                l = t.reduce((e, t) => {
                  if (null != e) return e[t];
                }, fe.value);
              null != l && void 0 !== a && delete l[a];
            })(e);
          let s = fe.value;
          l.forEach((e, t) => {
            if (t === l.length - 1) return void (s[e] = a);
            const o = "number" == typeof l[t + 1] ? [] : {};
            ((null !== s[e] && void 0 !== s[e] && "object" == typeof s[e]) || (s[e] = o),
              (s = s[e]));
          });
        },
        _e = (e) => {
          const t = ve.value;
          if (Array.isArray(e)) {
            const a = e.map((e) => _e(e)).filter((e) => void 0 !== e);
            return 0 === a.length && t.removeEmptyArray ? void 0 : a;
          }
          if (e && "object" == typeof e) {
            const a = D(e),
              l = Object.entries(a).reduce((e, [t, a]) => {
                const l = _e(a);
                return (void 0 !== l && (e[t] = l), e);
              }, {});
            return 0 === Object.keys(l).length && t.removeEmptyObject ? void 0 : l;
          }
          if ("string" == typeof e) {
            if (t.removeEmptyString && "" === e.trim()) return;
            if (
              t.removeEmptyRichText &&
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
            ? t.keepZero
              ? e
              : void 0
            : !1 === e
              ? t.keepFalse
                ? e
                : void 0
              : (e ?? void 0);
        },
        je = () => _e(ce(fe.value)) || {},
        we = (e) => {
          let t;
          e.props ? (t = { ...e.props }) : ((t = { ...e }), be.forEach((e) => delete t[e]));
          return (
            e.type &&
              ["date", "daterange", "datetime", "datetimerange", "monthrange"].includes(e.type) &&
              !t.type &&
              (t.type = e.type),
            t
          );
        },
        Ee = (e) => {
          if (!e.slots) return {};
          const t = {};
          return (
            Object.entries(e.slots).forEach(([e, a]) => {
              a && (t[e] = a);
            }),
            t
          );
        },
        Oe = (e) => {
          if (e.render) return e.render;
          const { type: t } = e;
          return re[t] || re.input;
        },
        Ve = (e, t) => K(e, Be.value, t),
        Fe = q(() => pe.items.filter((e) => !e.hidden)),
        Re = q(() => ({
          "justify-content": ne.value
            ? "flex-end"
            : pe.items.filter((e) => !e.hidden).length <= pe.buttonLeftLimit
              ? "flex-start"
              : "flex-end",
        })),
        Se = () => {
          (ue.value?.resetFields(),
            Object.keys(fe.value).forEach((e) => {
              delete fe.value[e];
            }),
            Object.assign(fe.value, ce(ye.value)),
            me("reset"));
        },
        Ae = () => {
          me("submit", je());
        };
      N({
        ref: ue,
        validate: (...e) => ue.value?.validate(...e),
        /** 代理 ElForm.resetFields */
        resetFields: (...e) => ue.value?.resetFields(...e),
        /** 代理 ElForm.clearValidate */
        clearValidate: (...e) => ue.value?.clearValidate(...e),
        /** 代理 ElForm.validateField */
        validateField: (...e) => ue.value?.validateField(...e),
        reset: Se,
        // 允许外部在不触发提交事件时主动获取清洗后的输出。
        getOutput: je,
      });
      const { span: Be, gutter: $e, labelPosition: Ce, labelWidth: Ue } = O(pe);
      return (n, u) => {
        const p = s,
          m = r,
          f = l,
          y = a,
          c = i,
          b = t,
          v = e,
          g = d,
          x = V("ripple");
        return _.scrollbar
          ? (F(),
            R(
              g,
              { key: 0, "max-height": _.maxHeight, "view-style": { overflowX: "hidden" } },
              {
                default: S(() => [
                  A("section", Y, [
                    B(
                      v,
                      $(
                        { ref: "formRef", model: fe.value, "label-position": C(Ce) },
                        { ...n.$attrs }
                      ),
                      {
                        default: S(() => [
                          B(
                            b,
                            { class: "flex flex-wrap", gutter: C($e) },
                            {
                              default: S(() => [
                                (F(!0),
                                U(
                                  W,
                                  null,
                                  L(
                                    C(Fe),
                                    (e) => (
                                      F(),
                                      R(
                                        y,
                                        {
                                          key: e.key,
                                          xs: Ve(e.span, "xs"),
                                          sm: Ve(e.span, "sm"),
                                          md: Ve(e.span, "md"),
                                          lg: Ve(e.span, "lg"),
                                          xl: Ve(e.span, "xl"),
                                        },
                                        {
                                          default: S(() => [
                                            B(
                                              f,
                                              {
                                                prop: e.key,
                                                "label-width": e.label
                                                  ? e.labelWidth || C(Ue)
                                                  : void 0,
                                              },
                                              z(
                                                {
                                                  default: S(() => [
                                                    H(
                                                      n.$slots,
                                                      e.key,
                                                      { item: e, modelValue: fe.value },
                                                      () => [
                                                        (F(),
                                                        R(
                                                          T(Oe(e)),
                                                          $(
                                                            {
                                                              "model-value": ke(e.key),
                                                              "onUpdate:modelValue": (t) =>
                                                                he(e.key, t),
                                                            },
                                                            { ref_for: !0 },
                                                            we(e)
                                                          ),
                                                          z(
                                                            {
                                                              default: S(() => [
                                                                "select" === e.type &&
                                                                we(e)?.options
                                                                  ? (F(!0),
                                                                    U(
                                                                      W,
                                                                      { key: 0 },
                                                                      L(
                                                                        we(e).options,
                                                                        (e) => (
                                                                          F(),
                                                                          R(
                                                                            p,
                                                                            $({ ref_for: !0 }, e, {
                                                                              key: e.value,
                                                                            }),
                                                                            null,
                                                                            16
                                                                          )
                                                                        )
                                                                      ),
                                                                      128
                                                                    ))
                                                                  : M("", !0),
                                                                "checkboxgroup" === e.type &&
                                                                we(e)?.options
                                                                  ? (F(!0),
                                                                    U(
                                                                      W,
                                                                      { key: 1 },
                                                                      L(
                                                                        we(e).options,
                                                                        (e) => (
                                                                          F(),
                                                                          R(
                                                                            C(o),
                                                                            $({ ref_for: !0 }, e, {
                                                                              key: e.value,
                                                                            }),
                                                                            null,
                                                                            16
                                                                          )
                                                                        )
                                                                      ),
                                                                      128
                                                                    ))
                                                                  : M("", !0),
                                                                "radiogroup" === e.type &&
                                                                we(e)?.options
                                                                  ? (F(!0),
                                                                    U(
                                                                      W,
                                                                      { key: 2 },
                                                                      L(
                                                                        we(e).options,
                                                                        (e) => (
                                                                          F(),
                                                                          R(
                                                                            m,
                                                                            $({ ref_for: !0 }, e, {
                                                                              key: e.value,
                                                                            }),
                                                                            null,
                                                                            16
                                                                          )
                                                                        )
                                                                      ),
                                                                      128
                                                                    ))
                                                                  : M("", !0),
                                                              ]),
                                                              _: 2,
                                                            },
                                                            [
                                                              L(Ee(e), (e, t) => ({
                                                                name: t,
                                                                fn: S(() => [(F(), R(T(e)))]),
                                                              })),
                                                            ]
                                                          ),
                                                          1040,
                                                          ["model-value", "onUpdate:modelValue"]
                                                        )),
                                                      ]
                                                    ),
                                                  ]),
                                                  _: 2,
                                                },
                                                [
                                                  e.label
                                                    ? {
                                                        name: "label",
                                                        fn: S(() => [
                                                          "string" != typeof e.label
                                                            ? (F(), R(T(e.label), { key: 0 }))
                                                            : (F(), U("span", ee, X(e.label), 1)),
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
                                B(
                                  y,
                                  {
                                    xs: 24,
                                    sm: 24,
                                    md: C(Be),
                                    lg: C(Be),
                                    xl: C(Be),
                                    class: "max-w-full flex-1",
                                  },
                                  {
                                    default: S(() => [
                                      A(
                                        "div",
                                        {
                                          class:
                                            "mb-3 flex items-center flex-wrap justify-end md:flex-row md:items-stretch md:gap-2",
                                          style: P(C(Re)),
                                        },
                                        [
                                          A("div", te, [
                                            _.showReset
                                              ? Z(
                                                  (F(),
                                                  R(
                                                    c,
                                                    { key: 0, class: "reset-button", onClick: Se },
                                                    {
                                                      default: S(() => [
                                                        I(X(C(de)("table.form.reset")), 1),
                                                      ]),
                                                      _: 1,
                                                    }
                                                  )),
                                                  [[x]]
                                                )
                                              : M("", !0),
                                            _.showSubmit
                                              ? Z(
                                                  (F(),
                                                  R(
                                                    c,
                                                    {
                                                      key: 1,
                                                      type: "primary",
                                                      class: "submit-button",
                                                      onClick: Ae,
                                                      disabled: _.disabledSubmit,
                                                      loading: _.loading,
                                                    },
                                                    {
                                                      default: S(() => [
                                                        I(X(C(de)("table.form.submit")), 1),
                                                      ]),
                                                      _: 1,
                                                    },
                                                    8,
                                                    ["disabled", "loading"]
                                                  )),
                                                  [[x]]
                                                )
                                              : M("", !0),
                                          ]),
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
                  ]),
                ]),
                _: 3,
              },
              8,
              ["max-height"]
            ))
          : (F(),
            U("section", ae, [
              B(
                v,
                $({ ref: "formRef", model: fe.value, "label-position": C(Ce) }, { ...n.$attrs }),
                {
                  default: S(() => [
                    B(
                      b,
                      { class: "flex flex-wrap", gutter: C($e) },
                      {
                        default: S(() => [
                          (F(!0),
                          U(
                            W,
                            null,
                            L(
                              C(Fe),
                              (e) => (
                                F(),
                                R(
                                  y,
                                  {
                                    key: e.key,
                                    xs: Ve(e.span, "xs"),
                                    sm: Ve(e.span, "sm"),
                                    md: Ve(e.span, "md"),
                                    lg: Ve(e.span, "lg"),
                                    xl: Ve(e.span, "xl"),
                                  },
                                  {
                                    default: S(() => [
                                      B(
                                        f,
                                        {
                                          prop: e.key,
                                          "label-width": e.label ? e.labelWidth || C(Ue) : void 0,
                                        },
                                        z(
                                          {
                                            default: S(() => [
                                              H(
                                                n.$slots,
                                                e.key,
                                                { item: e, modelValue: fe.value },
                                                () => [
                                                  (F(),
                                                  R(
                                                    T(Oe(e)),
                                                    $(
                                                      {
                                                        "model-value": ke(e.key),
                                                        "onUpdate:modelValue": (t) => he(e.key, t),
                                                      },
                                                      { ref_for: !0 },
                                                      we(e)
                                                    ),
                                                    z(
                                                      {
                                                        default: S(() => [
                                                          "select" === e.type && we(e)?.options
                                                            ? (F(!0),
                                                              U(
                                                                W,
                                                                { key: 0 },
                                                                L(
                                                                  we(e).options,
                                                                  (e) => (
                                                                    F(),
                                                                    R(
                                                                      p,
                                                                      $({ ref_for: !0 }, e, {
                                                                        key: e.value,
                                                                      }),
                                                                      null,
                                                                      16
                                                                    )
                                                                  )
                                                                ),
                                                                128
                                                              ))
                                                            : M("", !0),
                                                          "checkboxgroup" === e.type &&
                                                          we(e)?.options
                                                            ? (F(!0),
                                                              U(
                                                                W,
                                                                { key: 1 },
                                                                L(
                                                                  we(e).options,
                                                                  (e) => (
                                                                    F(),
                                                                    R(
                                                                      C(o),
                                                                      $({ ref_for: !0 }, e, {
                                                                        key: e.value,
                                                                      }),
                                                                      null,
                                                                      16
                                                                    )
                                                                  )
                                                                ),
                                                                128
                                                              ))
                                                            : M("", !0),
                                                          "radiogroup" === e.type && we(e)?.options
                                                            ? (F(!0),
                                                              U(
                                                                W,
                                                                { key: 2 },
                                                                L(
                                                                  we(e).options,
                                                                  (e) => (
                                                                    F(),
                                                                    R(
                                                                      m,
                                                                      $({ ref_for: !0 }, e, {
                                                                        key: e.value,
                                                                      }),
                                                                      null,
                                                                      16
                                                                    )
                                                                  )
                                                                ),
                                                                128
                                                              ))
                                                            : M("", !0),
                                                        ]),
                                                        _: 2,
                                                      },
                                                      [
                                                        L(Ee(e), (e, t) => ({
                                                          name: t,
                                                          fn: S(() => [(F(), R(T(e)))]),
                                                        })),
                                                      ]
                                                    ),
                                                    1040,
                                                    ["model-value", "onUpdate:modelValue"]
                                                  )),
                                                ]
                                              ),
                                            ]),
                                            _: 2,
                                          },
                                          [
                                            e.label
                                              ? {
                                                  name: "label",
                                                  fn: S(() => [
                                                    "string" != typeof e.label
                                                      ? (F(), R(T(e.label), { key: 0 }))
                                                      : (F(), U("span", le, X(e.label), 1)),
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
                          B(
                            y,
                            {
                              xs: 24,
                              sm: 24,
                              md: C(Be),
                              lg: C(Be),
                              xl: C(Be),
                              class: "max-w-full flex-1",
                            },
                            {
                              default: S(() => [
                                A(
                                  "div",
                                  {
                                    class:
                                      "mb-3 flex items-center flex-wrap justify-end md:flex-row md:items-stretch md:gap-2",
                                    style: P(C(Re)),
                                  },
                                  [
                                    A("div", se, [
                                      _.showReset
                                        ? Z(
                                            (F(),
                                            R(
                                              c,
                                              { key: 0, class: "reset-button", onClick: Se },
                                              {
                                                default: S(() => [
                                                  I(X(C(de)("table.form.reset")), 1),
                                                ]),
                                                _: 1,
                                              }
                                            )),
                                            [[x]]
                                          )
                                        : M("", !0),
                                      _.showSubmit
                                        ? Z(
                                            (F(),
                                            R(
                                              c,
                                              {
                                                key: 1,
                                                type: "primary",
                                                class: "submit-button",
                                                onClick: Ae,
                                                disabled: _.disabledSubmit,
                                                loading: _.loading,
                                              },
                                              {
                                                default: S(() => [
                                                  I(X(C(de)("table.form.submit")), 1),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["disabled", "loading"]
                                            )),
                                            [[x]]
                                          )
                                        : M("", !0),
                                    ]),
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
            ]));
      };
    },
  });
export { oe as _ };
