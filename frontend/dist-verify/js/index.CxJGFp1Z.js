import {
  D as e,
  x as a,
  V as l,
  A as r,
  z as t,
  aQ as o,
  a9 as s,
  aC as i,
  g as n,
  d as u,
  w as d,
  M as c,
  aD as m,
  t as p,
  s as g,
  r as f,
  U as v,
  L as h,
  J as _,
} from "./element-plus.BPg5EhXK.js";
import { _ as y } from "./index.BFbuWJ1r.js";
import {
  z as w,
  ag as b,
  p as x,
  a2 as k,
  m as j,
  w as $,
  aI as V,
  ax as A,
  bt as F,
  v as L,
  a$ as q,
  ar as P,
  n as R,
  F as K,
  ao as C,
  bu as E,
  bv as U,
  $ as M,
  al as S,
  o as T,
  aO as D,
  aw as I,
  aX as z,
  j as B,
  a4 as H,
  br as G,
  b5 as X,
  b4 as O,
  ac as W,
  a7 as J,
  X as N,
  a1 as Q,
  ai as Y,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as Z } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import {
  a1 as ee,
  a5 as ae,
  a6 as le,
  a as re,
  y as te,
  X as oe,
  Y as se,
  H as ie,
  U as ne,
} from "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import { _ as ue } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import { u as de, _ as ce } from "./useHeaderBar.jPAVpWpj.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./dompurify.C2yrXNAa.js";
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
function me(e, a, l = "") {
  for (const r of a) {
    const a = e?.[r]?.config_value;
    if (null == a) continue;
    const l = String(a).trim();
    if ("" !== l) return l;
  }
  return l;
}
const pe = { class: "login-center-backdrop__hero-wrap" },
  ge = Z(
    w({
      name: "LoginCenterBackdrop",
      __name: "FaLoginCenterBackdrop",
      props: { viewportFixed: { type: Boolean, default: !1 } },
      setup: (e) => (a, l) => {
        const r = y;
        return (
          b(),
          x(
            "div",
            {
              class: k([
                "login-center-backdrop",
                { "login-center-backdrop--viewport-fixed": e.viewportFixed },
              ]),
              "aria-hidden": "true",
            },
            [
              l[0] || (l[0] = j("div", { class: "login-center-backdrop__bg" }, null, -1)),
              j("div", pe, [
                $(
                  r,
                  {
                    src: V("/img/background.C4TVlUS8.svg"),
                    size: "100%",
                    class: "login-center-backdrop__hero",
                  },
                  null,
                  8,
                  ["src"]
                ),
              ]),
            ],
            2
          )
        );
      },
    }),
    [["__scopeId", "data-v-2e893585"]]
  ),
  fe = {
    class:
      "login-auth-link-row mt-6 flex flex-wrap items-center justify-center gap-1 text-sm leading-normal",
  },
  ve = { class: "inline-flex items-center text-(--el-text-color-secondary)" },
  he = Z(
    w({
      name: "FaLoginAuthLinkRow",
      __name: "FaLoginAuthLinkRow",
      props: { hint: {}, linkText: {} },
      emits: ["link"],
      setup: (a) => (l, r) => {
        const t = e;
        return (
          b(),
          x("div", fe, [
            j("span", ve, A(a.hint), 1),
            $(
              t,
              {
                type: "primary",
                underline: "never",
                class: "inline-flex items-center font-medium leading-[inherit]!",
                onClick: r[0] || (r[0] = (e) => l.$emit("link")),
              },
              { default: F(() => [L(A(a.linkText), 1)]), _: 1 }
            ),
          ])
        );
      },
    }),
    [["__scopeId", "data-v-c011292f"]]
  ),
  _e = { class: "login-form-tail flex flex-col gap-[1.1rem]" },
  ye = { class: "login-options-row flex items-center justify-between text-sm" },
  we = Z(
    w({
      name: "FaLoginAccountForm",
      __name: "FaLoginAccountForm",
      props: M(
        { rules: {}, demoAccountKey: {}, accounts: {}, formKey: {}, loading: { type: Boolean } },
        { loginForm: { required: !0 }, loginFormModifiers: {} }
      ),
      emits: M(["submit", "setupAccount", "forget", "register"], ["update:loginForm"]),
      setup(m, { expose: p, emit: g }) {
        const f = q(m, "loginForm"),
          v = g,
          h = S(),
          _ = S(!1);
        function y(e) {
          e instanceof KeyboardEvent &&
            ((_.value = e.getModifierState("CapsLock")), "Enter" === e.key && v("submit"));
        }
        return (
          p({
            validate: () => h.value?.validate?.(),
            clearValidate: () => h.value?.clearValidate?.(),
          }),
          (p, g) => {
            const v = c,
              w = l,
              k = a,
              q = t,
              M = r,
              S = s,
              T = n,
              D = e,
              I = u,
              z = d,
              B = he,
              H = P("ripple");
            return (
              b(),
              x("div", null, [
                (b(),
                R(
                  z,
                  {
                    ref_key: "formRef",
                    ref: h,
                    model: f.value,
                    rules: m.rules,
                    key: m.formKey,
                    class: "login-page-form",
                    "validate-on-rule-change": !1,
                    onKeyup: g[6] || (g[6] = U((e) => p.$emit("submit"), ["enter"])),
                  },
                  {
                    default: F(() => [
                      $(k, null, {
                        default: F(() => [
                          $(
                            w,
                            {
                              "model-value": m.demoAccountKey,
                              class: "w-full",
                              placeholder: p.$t("login.quickSelectAccount"),
                              "onUpdate:modelValue":
                                g[0] || (g[0] = (e) => p.$emit("setupAccount", e)),
                            },
                            {
                              default: F(() => [
                                (b(!0),
                                x(
                                  K,
                                  null,
                                  C(
                                    m.accounts,
                                    (e) => (
                                      b(),
                                      R(
                                        v,
                                        { key: e.key, label: e.label, value: e.key },
                                        {
                                          default: F(() => [j("span", null, A(e.label), 1)]),
                                          _: 2,
                                        },
                                        1032,
                                        ["label", "value"]
                                      )
                                    )
                                  ),
                                  128
                                )),
                              ]),
                              _: 1,
                            },
                            8,
                            ["model-value", "placeholder"]
                          ),
                        ]),
                        _: 1,
                      }),
                      $(
                        k,
                        { prop: "username" },
                        {
                          default: F(() => [
                            $(
                              M,
                              {
                                class: "custom-height",
                                modelValue: f.value.username,
                                "onUpdate:modelValue":
                                  g[1] || (g[1] = (e) => (f.value.username = e)),
                                modelModifiers: { trim: !0 },
                                clearable: "",
                                placeholder: p.$t("login.placeholder.username"),
                              },
                              {
                                prefix: F(() => [
                                  $(q, null, { default: F(() => [$(V(o))]), _: 1 }),
                                ]),
                                _: 1,
                              },
                              8,
                              ["modelValue", "placeholder"]
                            ),
                          ]),
                          _: 1,
                        }
                      ),
                      $(
                        S,
                        { visible: V(_), content: p.$t("login.capsLock"), placement: "right" },
                        {
                          default: F(() => [
                            $(
                              k,
                              { prop: "password" },
                              {
                                default: F(() => [
                                  $(
                                    M,
                                    {
                                      class: "custom-height",
                                      modelValue: f.value.password,
                                      "onUpdate:modelValue":
                                        g[2] || (g[2] = (e) => (f.value.password = e)),
                                      modelModifiers: { trim: !0 },
                                      type: "password",
                                      autocomplete: "off",
                                      "show-password": "",
                                      clearable: "",
                                      placeholder: p.$t("login.placeholder.password"),
                                      onKeyup: y,
                                    },
                                    {
                                      prefix: F(() => [
                                        $(q, null, { default: F(() => [$(V(i))]), _: 1 }),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue", "placeholder"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["visible", "content"]
                      ),
                      j("div", _e, [
                        j("div", ye, [
                          $(
                            T,
                            {
                              modelValue: f.value.remember,
                              "onUpdate:modelValue": g[3] || (g[3] = (e) => (f.value.remember = e)),
                              class: "login-remember",
                            },
                            { default: F(() => [L(A(p.$t("login.rememberPwd")), 1)]), _: 1 },
                            8,
                            ["modelValue"]
                          ),
                          $(
                            D,
                            {
                              type: "primary",
                              underline: "never",
                              class: "inline-flex items-center text-sm leading-[inherit]!",
                              onClick: g[4] || (g[4] = (e) => p.$emit("forget")),
                            },
                            { default: F(() => [L(A(p.$t("login.forgetPwd")), 1)]), _: 1 }
                          ),
                        ]),
                        j("div", null, [
                          E(
                            (b(),
                            R(
                              I,
                              {
                                class: "login-submit-btn h-11 w-full text-base font-medium",
                                type: "primary",
                                loading: m.loading,
                                onClick: g[5] || (g[5] = (e) => p.$emit("submit")),
                              },
                              { default: F(() => [L(A(p.$t("login.btnText")), 1)]), _: 1 },
                              8,
                              ["loading"]
                            )),
                            [[H]]
                          ),
                        ]),
                      ]),
                    ]),
                    _: 1,
                  },
                  8,
                  ["model", "rules"]
                )),
                $(
                  B,
                  {
                    hint: p.$t("login.noAccount"),
                    "link-text": p.$t("login.register"),
                    onLink: g[7] || (g[7] = (e) => p.$emit("register")),
                  },
                  null,
                  8,
                  ["hint", "link-text"]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-209d8f81"]]
  ),
  be = { class: "mt-6" },
  xe = Z(
    w({
      name: "FaLoginForgetPanel",
      __name: "FaLoginForgetPanel",
      props: M(
        { forgetRules: {}, formKey: {}, forgetLoading: { type: Boolean } },
        { forgetForm: { required: !0 }, forgetFormModifiers: {} }
      ),
      emits: M(["submit", "toLogin"], ["update:forgetForm"]),
      setup(e, { expose: l, emit: n }) {
        const c = q(e, "forgetForm"),
          m = n,
          p = S(),
          g = S(!1);
        function f(e) {
          e instanceof KeyboardEvent &&
            ((g.value = e.getModifierState("CapsLock")), "Enter" === e.key && m("submit"));
        }
        return (
          l({
            validate: () => p.value?.validate?.(),
            clearValidate: () => p.value?.clearValidate?.(),
          }),
          (l, n) => {
            const m = t,
              v = r,
              h = a,
              _ = s,
              y = u,
              w = d,
              k = he,
              q = P("ripple");
            return (
              b(),
              x("div", null, [
                (b(),
                R(
                  w,
                  {
                    ref_key: "formRef",
                    ref: p,
                    model: c.value,
                    rules: e.forgetRules,
                    key: e.formKey,
                    class: "login-page-form mt-4",
                    onKeyup: n[5] || (n[5] = U((e) => l.$emit("submit"), ["enter"])),
                  },
                  {
                    default: F(() => [
                      $(
                        h,
                        { prop: "username" },
                        {
                          default: F(() => [
                            $(
                              v,
                              {
                                modelValue: c.value.username,
                                "onUpdate:modelValue":
                                  n[0] || (n[0] = (e) => (c.value.username = e)),
                                modelModifiers: { trim: !0 },
                                class: "custom-height",
                                clearable: "",
                                placeholder: l.$t("login.placeholder.username"),
                                onKeyup: n[1] || (n[1] = U((e) => l.$emit("submit"), ["enter"])),
                              },
                              {
                                prefix: F(() => [
                                  $(m, null, { default: F(() => [$(V(o))]), _: 1 }),
                                ]),
                                _: 1,
                              },
                              8,
                              ["modelValue", "placeholder"]
                            ),
                          ]),
                          _: 1,
                        }
                      ),
                      $(
                        _,
                        { visible: V(g), content: l.$t("login.capsLock"), placement: "right" },
                        {
                          default: F(() => [
                            $(
                              h,
                              { prop: "new_password" },
                              {
                                default: F(() => [
                                  $(
                                    v,
                                    {
                                      modelValue: c.value.new_password,
                                      "onUpdate:modelValue":
                                        n[2] || (n[2] = (e) => (c.value.new_password = e)),
                                      modelModifiers: { trim: !0 },
                                      class: "custom-height",
                                      type: "password",
                                      autocomplete: "off",
                                      "show-password": "",
                                      clearable: "",
                                      placeholder: l.$t("login.placeholder.password"),
                                      onKeyup: f,
                                    },
                                    {
                                      prefix: F(() => [
                                        $(m, null, { default: F(() => [$(V(i))]), _: 1 }),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue", "placeholder"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["visible", "content"]
                      ),
                      $(
                        _,
                        { visible: V(g), content: l.$t("login.capsLock"), placement: "right" },
                        {
                          default: F(() => [
                            $(
                              h,
                              { prop: "confirmPassword" },
                              {
                                default: F(() => [
                                  $(
                                    v,
                                    {
                                      modelValue: c.value.confirmPassword,
                                      "onUpdate:modelValue":
                                        n[3] || (n[3] = (e) => (c.value.confirmPassword = e)),
                                      modelModifiers: { trim: !0 },
                                      class: "custom-height",
                                      type: "password",
                                      autocomplete: "off",
                                      "show-password": "",
                                      clearable: "",
                                      placeholder: l.$t("login.message.password.confirm"),
                                      onKeyup: f,
                                    },
                                    {
                                      prefix: F(() => [
                                        $(m, null, { default: F(() => [$(V(i))]), _: 1 }),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue", "placeholder"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["visible", "content"]
                      ),
                      j("div", be, [
                        E(
                          (b(),
                          R(
                            y,
                            {
                              class: "h-11 w-full min-w-0 rounded-lg! text-base font-medium",
                              type: "primary",
                              loading: e.forgetLoading,
                              onClick: n[4] || (n[4] = (e) => l.$emit("submit")),
                            },
                            { default: F(() => [L(A(l.$t("common.confirm")), 1)]), _: 1 },
                            8,
                            ["loading"]
                          )),
                          [[q]]
                        ),
                      ]),
                    ]),
                    _: 1,
                  },
                  8,
                  ["model", "rules"]
                )),
                $(
                  k,
                  {
                    hint: l.$t("login.thinkOfPasswd"),
                    "link-text": l.$t("login.backLoginBtnText"),
                    onLink: n[6] || (n[6] = (e) => l.$emit("toLogin")),
                  },
                  null,
                  8,
                  ["hint", "link-text"]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-26c5928f"]]
  ),
  ke = { class: "flex flex-wrap items-center gap-2" },
  je = { class: "mt-6" },
  $e = Z(
    w({
      name: "FaLoginRegisterPanel",
      __name: "FaLoginRegisterPanel",
      props: M(
        {
          registerRules: {},
          formKey: {},
          registerLoading: { type: Boolean },
          userAgreementHref: {},
          showEmail: { type: Boolean, default: !1 },
        },
        {
          registerForm: { required: !0 },
          registerFormModifiers: {},
          registerAgreementRead: { type: Boolean, required: !0 },
          registerAgreementReadModifiers: {},
        }
      ),
      emits: M(["submit", "toLogin"], ["update:registerForm", "update:registerAgreementRead"]),
      setup(l, { expose: c, emit: p }) {
        const g = q(l, "registerForm"),
          f = q(l, "registerAgreementRead"),
          v = p,
          h = S(),
          _ = S(!1);
        function y(e) {
          e instanceof KeyboardEvent &&
            ((_.value = e.getModifierState("CapsLock")), "Enter" === e.key && v("submit"));
        }
        return (
          c({
            validate: () => h.value?.validate?.(),
            clearValidate: () => h.value?.clearValidate?.(),
            validateField: (e) => h.value?.validateField?.(e),
          }),
          (c, p) => {
            const v = t,
              w = r,
              k = a,
              q = s,
              K = n,
              C = e,
              M = u,
              S = d,
              D = he,
              I = P("ripple");
            return (
              b(),
              x("div", null, [
                (b(),
                R(
                  S,
                  {
                    ref_key: "formRef",
                    ref: h,
                    model: g.value,
                    rules: l.registerRules,
                    key: l.formKey,
                    class: "login-page-form",
                    onKeyup: p[6] || (p[6] = U((e) => c.$emit("submit"), ["enter"])),
                  },
                  {
                    default: F(() => [
                      $(
                        k,
                        { prop: "username" },
                        {
                          default: F(() => [
                            $(
                              w,
                              {
                                class: "custom-height",
                                modelValue: g.value.username,
                                "onUpdate:modelValue":
                                  p[0] || (p[0] = (e) => (g.value.username = e)),
                                modelModifiers: { trim: !0 },
                                clearable: "",
                                placeholder: c.$t("login.placeholder.username"),
                              },
                              {
                                prefix: F(() => [
                                  $(v, null, { default: F(() => [$(V(o))]), _: 1 }),
                                ]),
                                _: 1,
                              },
                              8,
                              ["modelValue", "placeholder"]
                            ),
                          ]),
                          _: 1,
                        }
                      ),
                      $(
                        q,
                        { visible: V(_), content: c.$t("login.capsLock"), placement: "right" },
                        {
                          default: F(() => [
                            $(
                              k,
                              { prop: "password" },
                              {
                                default: F(() => [
                                  $(
                                    w,
                                    {
                                      class: "custom-height",
                                      modelValue: g.value.password,
                                      "onUpdate:modelValue":
                                        p[1] || (p[1] = (e) => (g.value.password = e)),
                                      modelModifiers: { trim: !0 },
                                      type: "password",
                                      autocomplete: "off",
                                      "show-password": "",
                                      clearable: "",
                                      placeholder: c.$t("login.placeholder.password"),
                                      onKeyup: y,
                                    },
                                    {
                                      prefix: F(() => [
                                        $(v, null, { default: F(() => [$(V(i))]), _: 1 }),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue", "placeholder"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["visible", "content"]
                      ),
                      $(
                        q,
                        { visible: V(_), content: c.$t("login.capsLock"), placement: "right" },
                        {
                          default: F(() => [
                            $(
                              k,
                              { prop: "confirmPassword" },
                              {
                                default: F(() => [
                                  $(
                                    w,
                                    {
                                      class: "custom-height",
                                      modelValue: g.value.confirmPassword,
                                      "onUpdate:modelValue":
                                        p[2] || (p[2] = (e) => (g.value.confirmPassword = e)),
                                      modelModifiers: { trim: !0 },
                                      type: "password",
                                      autocomplete: "off",
                                      "show-password": "",
                                      clearable: "",
                                      placeholder: c.$t("login.message.password.confirm"),
                                      onKeyup: y,
                                    },
                                    {
                                      prefix: F(() => [
                                        $(v, null, { default: F(() => [$(V(i))]), _: 1 }),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["modelValue", "placeholder"]
                                  ),
                                ]),
                                _: 1,
                              }
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["visible", "content"]
                      ),
                      l.showEmail
                        ? (b(),
                          R(
                            k,
                            { key: 0, prop: "email" },
                            {
                              default: F(() => [
                                $(
                                  w,
                                  {
                                    class: "custom-height",
                                    modelValue: g.value.email,
                                    "onUpdate:modelValue":
                                      p[3] || (p[3] = (e) => (g.value.email = e)),
                                    modelModifiers: { trim: !0 },
                                    clearable: "",
                                    placeholder: c.$t("login.placeholder.email"),
                                  },
                                  {
                                    prefix: F(() => [
                                      $(v, null, { default: F(() => [$(V(m))]), _: 1 }),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["modelValue", "placeholder"]
                                ),
                              ]),
                              _: 1,
                            }
                          ))
                        : T("", !0),
                      $(k, null, {
                        default: F(() => [
                          j("div", ke, [
                            $(
                              K,
                              {
                                modelValue: f.value,
                                "onUpdate:modelValue": p[4] || (p[4] = (e) => (f.value = e)),
                              },
                              { default: F(() => [L(A(c.$t("login.agree")), 1)]), _: 1 },
                              8,
                              ["modelValue"]
                            ),
                            $(
                              C,
                              {
                                type: "primary",
                                underline: "never",
                                class: "text-sm font-medium",
                                href: l.userAgreementHref,
                                target: "_blank",
                                rel: "noopener noreferrer",
                              },
                              { default: F(() => [L(A(c.$t("login.userAgreement")), 1)]), _: 1 },
                              8,
                              ["href"]
                            ),
                          ]),
                        ]),
                        _: 1,
                      }),
                      j("div", je, [
                        E(
                          (b(),
                          R(
                            M,
                            {
                              class: "h-11 w-full rounded-lg! text-base font-medium",
                              type: "primary",
                              loading: l.registerLoading,
                              onClick: p[5] || (p[5] = (e) => c.$emit("submit")),
                            },
                            { default: F(() => [L(A(c.$t("login.register")), 1)]), _: 1 },
                            8,
                            ["loading"]
                          )),
                          [[I]]
                        ),
                      ]),
                    ]),
                    _: 1,
                  },
                  8,
                  ["model", "rules"]
                )),
                $(
                  D,
                  {
                    hint: c.$t("login.haveAccount"),
                    "link-text": c.$t("login.backLoginBtnText"),
                    onLink: p[7] || (p[7] = (e) => c.$emit("toLogin")),
                  },
                  null,
                  8,
                  ["hint", "link-text"]
                ),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-77e85827"]]
  ),
  Ve = {
    class:
      "auth-top-bar pointer-events-none fixed left-0 right-0 top-0 z-100 flex items-center justify-between gap-3 bg-transparent px-5 py-4.5 md:gap-4 md:px-10",
  },
  Ae = { class: "pointer-events-auto flex min-w-0 flex-1 items-center gap-3" },
  Fe = { class: "min-w-0 flex-1" },
  Le = { class: "flex flex-wrap items-center gap-2" },
  qe = { class: "auth-top-bar__site-title" },
  Pe = ["title"],
  Re = { class: "logo-version-pill" },
  Ke = {
    class:
      "auth-top-bar-actions-panel pointer-events-auto flex shrink-0 flex items-center justify-center gap-1.5 px-2 py-1.5 max-sm:mr-1",
  },
  Ce = { class: "color-picker-expandable relative flex items-center max-sm:hidden!" },
  Ee = {
    class:
      "color-dots absolute right-0 rounded-full flex items-center gap-2 rounded-5 px-2.5 py-2 pr-9 pl-2.5 opacity-0",
  },
  Ue = ["onClick"],
  Me = {
    class:
      "btn palette-btn auth-top-bar__action relative z-2 h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300",
  },
  Se = ["title"],
  Te = { class: "menu-txt" },
  De = {
    class:
      "btn language-btn auth-top-bar__action h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300",
  },
  Ie = { class: "menu-txt" },
  ze = Z(
    w({
      name: "AuthTopBar",
      __name: "FaAuthTopBar",
      props: { panelAlign: {} },
      emits: ["update:panelAlign"],
      setup(e, { emit: a }) {
        D((e) => ({ v86d5b762: y.value }));
        const l = e,
          r = a,
          t = [
            { value: "left", icon: "ri:layout-left-2-line", labelKey: "login.panelAlign.left" },
            { value: "center", icon: "ri:layout-column-line", labelKey: "login.panelAlign.center" },
            { value: "right", icon: "ri:layout-right-2-line", labelKey: "login.panelAlign.right" },
          ],
          o = B(() => {
            const e = t.find((e) => e.value === l.panelAlign);
            return e?.icon ?? "ri:layout-column-line";
          });
        function s(e) {
          ("left" !== e && "center" !== e && "right" !== e) || r("update:panelAlign", e);
        }
        const i = ee(),
          n = ae(),
          u = le(),
          { isDark: d, systemThemeColor: c } = I(n),
          { shouldShowThemeToggle: m, shouldShowLanguage: v } = de(),
          { locale: h } = z(),
          _ = re.systemMainColor,
          y = B(() => c.value),
          w = B(() => i.configData.system_logo?.config_value?.trim() || void 0),
          L = B(() => i.configData.system_name?.config_value?.trim() || re.systemInfo.name),
          q = B(() => {
            const e = i.configData.system_version?.config_value?.trim(),
              a = e || "3.0.0";
            return a.startsWith("v") || a.startsWith("V") ? a : `v${a}`;
          }),
          P = (e) => {
            h.value !== e && ((h.value = e), u.setLanguage(e));
          };
        return (a, l) => {
          const r = ce,
            i = ue,
            u = g,
            y = p,
            E = f;
          return (
            b(),
            x("header", Ve, [
              j("div", Ae, [
                $(r, { class: "icon shrink-0", size: "46", src: w.value }, null, 8, ["src"]),
                j("div", Fe, [
                  j("div", Le, [
                    j("h1", qe, A(L.value), 1),
                    j(
                      "div",
                      { class: "logo-version-badge shrink-0", title: q.value },
                      [j("span", Re, A(q.value), 1)],
                      8,
                      Pe
                    ),
                  ]),
                ]),
              ]),
              j("div", Ke, [
                j("div", Ce, [
                  j("div", Ee, [
                    (b(!0),
                    x(
                      K,
                      null,
                      C(
                        V(_),
                        (e, a) => (
                          b(),
                          x(
                            "div",
                            {
                              key: e,
                              class: k([
                                "color-dot relative size-5 cursor-pointer flex items-center justify-center rounded-full opacity-0",
                                { active: e === V(c) },
                              ]),
                              style: H({ background: e, "--index": a }),
                              onClick: (a) => {
                                return (
                                  (l = e),
                                  void (c.value !== l && (n.setElementTheme(l), n.reload()))
                                );
                                var l;
                              },
                            },
                            [
                              e === V(c)
                                ? (b(),
                                  R(i, { key: 0, icon: "ri:check-fill", class: "text-white" }))
                                : T("", !0),
                            ],
                            14,
                            Ue
                          )
                        )
                      ),
                      128
                    )),
                  ]),
                  j("div", Me, [
                    $(i, {
                      icon: "ri:palette-line",
                      class: "text-xl transition-colors duration-300",
                    }),
                  ]),
                ]),
                null != e.panelAlign
                  ? (b(),
                    R(
                      E,
                      { key: 0, onCommand: s, "popper-class": "langDropDownStyle" },
                      {
                        dropdown: F(() => [
                          $(y, null, {
                            default: F(() => [
                              (b(),
                              x(
                                K,
                                null,
                                C(t, (l) =>
                                  j("div", { key: l.value, class: "lang-btn-item" }, [
                                    $(
                                      u,
                                      {
                                        command: l.value,
                                        class: k({ "is-selected": e.panelAlign === l.value }),
                                      },
                                      {
                                        default: F(() => [
                                          $(i, { icon: l.icon, class: "mr-2 text-base" }, null, 8, [
                                            "icon",
                                          ]),
                                          j("span", Te, A(a.$t(l.labelKey)), 1),
                                          e.panelAlign === l.value
                                            ? (b(),
                                              R(i, {
                                                key: 0,
                                                icon: "ri:check-fill",
                                                class: "text-base",
                                              }))
                                            : T("", !0),
                                        ]),
                                        _: 2,
                                      },
                                      1032,
                                      ["command", "class"]
                                    ),
                                  ])
                                ),
                                64
                              )),
                            ]),
                            _: 1,
                          }),
                        ]),
                        default: F(() => [
                          j(
                            "div",
                            {
                              class:
                                "btn layout-align-btn auth-top-bar__action h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300",
                              title: a.$t("login.panelAlign.label"),
                            },
                            [
                              $(
                                i,
                                {
                                  icon: o.value,
                                  class: "text-xl text-g-800 transition-colors duration-300",
                                },
                                null,
                                8,
                                ["icon"]
                              ),
                            ],
                            8,
                            Se
                          ),
                        ]),
                        _: 1,
                      }
                    ))
                  : T("", !0),
                V(v)
                  ? (b(),
                    R(
                      E,
                      { key: 1, onCommand: P, "popper-class": "langDropDownStyle" },
                      {
                        dropdown: F(() => [
                          $(y, null, {
                            default: F(() => [
                              (b(!0),
                              x(
                                K,
                                null,
                                C(
                                  V(te),
                                  (e) => (
                                    b(),
                                    x("div", { key: e.value, class: "lang-btn-item" }, [
                                      $(
                                        u,
                                        {
                                          command: e.value,
                                          class: k({ "is-selected": V(h) === e.value }),
                                        },
                                        {
                                          default: F(() => [
                                            j("span", Ie, A(e.label), 1),
                                            V(h) === e.value
                                              ? (b(),
                                                R(i, {
                                                  key: 0,
                                                  icon: "ri:check-fill",
                                                  class: "text-base",
                                                }))
                                              : T("", !0),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ["command", "class"]
                                      ),
                                    ])
                                  )
                                ),
                                128
                              )),
                            ]),
                            _: 1,
                          }),
                        ]),
                        default: F(() => [
                          j("div", De, [
                            $(i, {
                              icon: "ri:translate-2",
                              class: "text-[19px] text-g-800 transition-colors duration-300",
                            }),
                          ]),
                        ]),
                        _: 1,
                      }
                    ))
                  : T("", !0),
                V(m)
                  ? (b(),
                    x(
                      "div",
                      {
                        key: 2,
                        class:
                          "btn theme-btn auth-top-bar__action h-8 w-8 cursor-pointer flex items-center justify-center transition duration-300",
                        onClick:
                          l[0] ||
                          (l[0] = //@ts-ignore
                            (...e) => V(oe) && V(oe)(...e)),
                      },
                      [
                        $(
                          i,
                          {
                            icon: V(d) ? "ri:sun-fill" : "ri:moon-line",
                            class: "text-xl text-g-800 transition-colors duration-300",
                          },
                          null,
                          8,
                          ["icon"]
                        ),
                      ]
                    ))
                  : T("", !0),
              ]),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-cd4995cf"]]
  ),
  Be = { class: "fa-enterprise-intro", "aria-labelledby": "enterprise-intro-title" },
  He = { class: "fa-enterprise-intro__content" },
  Ge = { class: "fa-enterprise-intro__highlights", "aria-label": "Enterprise highlights" },
  Xe = { class: "fa-enterprise-intro__highlight-code" },
  Oe = Z(
    w({
      name: "FaEnterpriseIntro",
      __name: "FaEnterpriseIntro",
      setup(e) {
        const a = [
          {
            code: "RBAC",
            title: "权限",
            description: "细粒度角色与资源授权，覆盖复杂组织协作场景。",
          },
          {
            code: "Audit",
            title: "审计",
            description: "关键操作留痕可追溯，帮助团队满足安全合规要求。",
          },
          {
            code: "API",
            title: "接口优先",
            description: "以开放接口连接业务系统，支撑快速集成与扩展。",
          },
        ];
        return (e, l) => (
          b(),
          x("section", Be, [
            j("div", He, [
              l[0] ||
                (l[0] = j("p", { class: "fa-enterprise-intro__badge" }, "Enterprise Ready", -1)),
              l[1] ||
                (l[1] = j(
                  "div",
                  { class: "fa-enterprise-intro__header" },
                  [
                    j("h1", { id: "enterprise-intro-title" }, "企业级管理系统"),
                    j(
                      "p",
                      null,
                      "提供安全、高效、可扩展的管理解决方案，助力企业数字化转型与业务增长。"
                    ),
                  ],
                  -1
                )),
              j("div", Ge, [
                (b(),
                x(
                  K,
                  null,
                  C(a, (e) =>
                    j("article", { key: e.code, class: "fa-enterprise-intro__highlight" }, [
                      j("span", Xe, A(e.code), 1),
                      j("div", null, [
                        j("h2", null, A(e.title), 1),
                        j("p", null, A(e.description), 1),
                      ]),
                    ])
                  ),
                  64
                )),
              ]),
            ]),
          ])
        );
      },
    }),
    [["__scopeId", "data-v-4d38d2e7"]]
  ),
  We = "login-panel-align";
function Je() {
  const e = S(
    (function () {
      try {
        const e = localStorage.getItem(We);
        if ("left" === e || "center" === e || "right" === e) return e;
      } catch {}
      return "right";
    })()
  );
  return (
    G(e, (e) => {
      try {
        localStorage.setItem(We, e);
      } catch {}
    }),
    { panelAlign: e }
  );
}
const Ne = { class: "login-page-root flex h-screen w-full flex-col overflow-hidden" },
  Qe = { key: 0, class: "login-auth-split__col login-auth-split__col--illustration" },
  Ye = {
    class:
      "login-page-panel__main relative z-1 flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-2 pt-14 md:px-10 md:pt-18",
  },
  Ze = { class: "auth-right-wrap" },
  ea = { class: "form" },
  aa = { class: "form-intro" },
  la = { class: "title" },
  ra = { class: "sub-title" },
  ta = { class: "login-footer-text text-sm" },
  oa = { class: "login-footer-row" },
  sa = ["href"],
  ia = { class: "login-footer-row" },
  na = ["href"],
  ua = ["href"],
  da = ["href"],
  ca = { key: 0, class: "login-page-footer__sep" },
  ma = { key: 1, class: "login-page-footer__record" },
  pa = Z(
    w({
      name: "Login",
      __name: "index",
      setup(e) {
        const a = ee(),
          l = ae(),
          r = se(),
          { t: t, locale: o } = z(),
          { panelAlign: s } = Je(),
          i = S("login"),
          n = B(() =>
            "register" === i.value
              ? t("login.reg")
              : "forget" === i.value
                ? t("login.resetPassword")
                : t("login.title")
          ),
          u = B(() =>
            "register" === i.value
              ? t("register.subTitle")
              : "forget" === i.value
                ? t("forgetPassword.subTitle")
                : t("login.subTitle")
          ),
          d = B(() => me(a.configData, ["copyright", "sys_web_copyright"])),
          c = B(() => me(a.configData, ["git_code", "sys_git_code"], "#")),
          m = B(() => me(a.configData, ["help_doc", "sys_help_doc"], "#")),
          p = B(() => me(a.configData, ["privacy", "sys_web_privacy"], "#")),
          g = B(() => me(a.configData, ["clause", "sys_web_clause"], "#")),
          f = B(() => me(a.configData, ["keep_record", "sys_keep_record"])),
          y = B(() => g.value);
        function w(e) {
          ((i.value = e),
            Q(() => {
              (U.value?.clearValidate?.(), M.value?.clearValidate?.(), D.value?.clearValidate?.());
            }));
        }
        const L = S(0);
        G(o, () => {
          L.value++;
        });
        const q = B(() => [
            {
              key: "super",
              label: t("login.roles.super"),
              username: "super",
              password: "123456",
              roles: ["R_SUPER"],
            },
            {
              key: "admin",
              label: t("login.roles.admin"),
              username: "admin",
              password: "123456",
              roles: ["R_ADMIN"],
            },
            {
              key: "user",
              label: t("login.roles.user"),
              username: "user",
              password: "123456",
              roles: ["R_USER"],
            },
          ]),
          P = S("super"),
          K = le(),
          C = X(),
          E = O(),
          U = S(null),
          M = S(null),
          D = S(null),
          I = S(!1),
          H = S(!1),
          Z = S(!1),
          re = S(!1),
          te = Y({ username: "", password: "", confirmPassword: "", email: "" }),
          oe = Y({ username: "", new_password: "", confirmPassword: "" }),
          ue = (e, a, l) => {
            a
              ? (te.confirmPassword && M.value?.validateField?.("confirmPassword"), l())
              : l(new Error(t("login.message.password.required")));
          },
          de = (e, a, l) => {
            a
              ? a === te.password
                ? l()
                : l(new Error(t("login.message.password.inconformity")))
              : l(new Error(t("login.message.password.required")));
          },
          ce = B(() => ({
            username: [
              { required: !0, message: t("login.message.username.required"), trigger: "blur" },
            ],
            password: [
              { required: !0, validator: ue, trigger: "blur" },
              { min: 6, message: t("login.message.password.min"), trigger: "blur" },
            ],
            confirmPassword: [
              { required: !0, message: t("login.message.password.required"), trigger: "blur" },
              { min: 6, message: t("login.message.password.min"), trigger: "blur" },
              { validator: de, trigger: "blur" },
            ],
            email: [
              { required: !0, message: t("login.email.required"), trigger: "blur" },
              { type: "email", message: t("login.email.invalid"), trigger: "blur" },
            ],
          })),
          pe = (e, a, l) => {
            a
              ? a === oe.new_password
                ? l()
                : l(new Error(t("login.message.password.inconformity")))
              : l(new Error(t("login.message.password.required")));
          },
          fe = B(() => ({
            username: [
              { required: !0, message: t("login.message.username.required"), trigger: "blur" },
            ],
            new_password: [
              { required: !0, message: t("login.message.password.required"), trigger: "blur" },
              { min: 6, message: t("login.message.password.min"), trigger: "blur" },
            ],
            confirmPassword: [
              { required: !0, message: t("login.message.password.required"), trigger: "blur" },
              { min: 6, message: t("login.message.password.min"), trigger: "blur" },
              { validator: pe, trigger: "blur" },
            ],
          })),
          ve = Y({ username: "", password: "", remember: !0, login_type: "PC" }),
          he = B(() => ({
            username: [
              { required: !0, trigger: "blur", message: t("login.message.username.required") },
            ],
            password: [
              { required: !0, trigger: "blur", message: t("login.message.password.required") },
              { min: 6, message: t("login.message.password.min"), trigger: "blur" },
            ],
          }));
        function _e(e) {
          const a = q.value.find((a) => a.key === e);
          ((P.value = e), (ve.username = a?.username ?? ""), (ve.password = a?.password ?? ""));
        }
        function ye(e) {
          const a = e.redirect || "/";
          try {
            const e = C.resolve(a);
            return { path: e.path, query: e.query };
          } catch {
            return { path: "/" };
          }
        }
        let be = null,
          ke = null;
        (W(async () => {
          _e("super");
          try {
            await a.getConfig(!0);
          } catch (e) {}
          K.isLogin ? await C.replace(ye(E.query)) : (ke = setTimeout(() => {}, 500));
        }),
          J(() => {
            (null !== ke && clearTimeout(ke), be?.close(), (be = null));
          }));
        const je = async () => {
          if (U.value)
            try {
              if (!(await U.value.validate?.())) return;
              ((I.value = !0),
                await K.login(ve),
                await C.replace(ye(E.query)),
                l.showGuide && r.showGuide(!0));
            } catch (e) {
              e instanceof ie ||
                h({
                  title: "提示",
                  message: e instanceof Error ? e.message : String(e),
                  type: "error",
                });
            } finally {
              I.value = !1;
            }
        };
        async function Ve() {
          if (re.value) {
            if (M.value)
              try {
                (await M.value.validate?.(),
                  (H.value = !0),
                  _.info("内部系统账号请联系管理员创建"),
                  (ve.username = te.username),
                  (te.username = ""),
                  (te.password = ""),
                  (te.confirmPassword = ""),
                  (te.email = ""),
                  (re.value = !1),
                  w("login"));
              } catch (e) {
              } finally {
                H.value = !1;
              }
          } else _.warning(t("login.message.agree.required"));
        }
        async function Ae() {
          if (D.value)
            try {
              (await D.value.validate?.(),
                (Z.value = !0),
                await ne.forgetPassword(oe),
                (ve.username = oe.username),
                (ve.password = oe.new_password),
                (oe.username = ""),
                (oe.new_password = ""),
                (oe.confirmPassword = ""),
                w("login"));
            } catch (e) {
            } finally {
              Z.value = !1;
            }
        }
        return (e, a) => {
          const l = ge,
            r = v;
          return (
            b(),
            x("div", Ne, [
              "center" === V(s) ? (b(), R(l, { key: 0, "viewport-fixed": "" })) : T("", !0),
              $(
                ze,
                {
                  "panel-align": V(s),
                  "onUpdate:panelAlign": a[0] || (a[0] = (e) => (N(s) ? (s.value = e) : null)),
                },
                null,
                8,
                ["panel-align"]
              ),
              j(
                "div",
                {
                  class: k([
                    "login-auth-split relative z-1 flex min-h-0 flex-1 overflow-hidden",
                    `login-auth-split--${V(s)}`,
                  ]),
                },
                [
                  "center" !== V(s) ? (b(), x("div", Qe, [$(Oe)])) : T("", !0),
                  j(
                    "div",
                    {
                      class: k([
                        "login-auth-split__col login-auth-split__col--form login-page-panel relative flex min-h-0 min-w-0 flex-col",
                        "center" === V(s) ? "bg-transparent" : "bg-(--el-bg-color-page)",
                      ]),
                    },
                    [
                      j("div", Ye, [
                        $(r, null, {
                          default: F(() => [
                            j(
                              "div",
                              {
                                class: k([
                                  "login-page-panel__scroll pb-6",
                                  "center" === V(s) && "login-page-panel__scroll--centered",
                                ]),
                              },
                              [
                                j(
                                  "div",
                                  {
                                    class: k([
                                      "login-panel-align-row flex w-full items-center justify-center max-sm:min-h-0",
                                      "center" === V(s)
                                        ? "min-h-0 flex-1 py-4"
                                        : "min-h-[min(720px,calc(100vh-13rem))]",
                                    ]),
                                  },
                                  [
                                    j("div", Ze, [
                                      j("div", ea, [
                                        j("div", aa, [
                                          j("h3", la, A(V(n)), 1),
                                          j("p", ra, A(V(u)), 1),
                                        ]),
                                        "login" === V(i)
                                          ? (b(),
                                            R(
                                              we,
                                              {
                                                key: 0,
                                                ref_key: "accountFormRef",
                                                ref: U,
                                                "login-form": V(ve),
                                                "onUpdate:loginForm":
                                                  a[1] ||
                                                  (a[1] = (e) => (N(ve) ? (ve.value = e) : null)),
                                                rules: V(he),
                                                "demo-account-key": V(P),
                                                accounts: V(q),
                                                "form-key": V(L),
                                                loading: V(I),
                                                onSubmit: je,
                                                onSetupAccount: _e,
                                                onForget: a[2] || (a[2] = (e) => w("forget")),
                                                onRegister: a[3] || (a[3] = (e) => w("register")),
                                              },
                                              null,
                                              8,
                                              [
                                                "login-form",
                                                "rules",
                                                "demo-account-key",
                                                "accounts",
                                                "form-key",
                                                "loading",
                                              ]
                                            ))
                                          : "register" === V(i)
                                            ? (b(),
                                              R(
                                                $e,
                                                {
                                                  key: 1,
                                                  ref_key: "registerPanelRef",
                                                  ref: M,
                                                  "register-agreement-read": V(re),
                                                  "onUpdate:registerAgreementRead":
                                                    a[4] ||
                                                    (a[4] = (e) => (N(re) ? (re.value = e) : null)),
                                                  "register-form": V(te),
                                                  "onUpdate:registerForm":
                                                    a[5] ||
                                                    (a[5] = (e) => (N(te) ? (te.value = e) : null)),
                                                  "register-rules": V(ce),
                                                  "form-key": V(L),
                                                  "register-loading": V(H),
                                                  "show-email": !0,
                                                  "user-agreement-href": V(y),
                                                  onSubmit: Ve,
                                                  onToLogin: a[6] || (a[6] = (e) => w("login")),
                                                },
                                                null,
                                                8,
                                                [
                                                  "register-agreement-read",
                                                  "register-form",
                                                  "register-rules",
                                                  "form-key",
                                                  "register-loading",
                                                  "user-agreement-href",
                                                ]
                                              ))
                                            : (b(),
                                              R(
                                                xe,
                                                {
                                                  key: 2,
                                                  ref_key: "forgetPanelRef",
                                                  ref: D,
                                                  "forget-form": V(oe),
                                                  "onUpdate:forgetForm":
                                                    a[7] ||
                                                    (a[7] = (e) => (N(oe) ? (oe.value = e) : null)),
                                                  "forget-rules": V(fe),
                                                  "form-key": V(L),
                                                  "forget-loading": V(Z),
                                                  onSubmit: Ae,
                                                  onToLogin: a[8] || (a[8] = (e) => w("login")),
                                                },
                                                null,
                                                8,
                                                [
                                                  "forget-form",
                                                  "forget-rules",
                                                  "form-key",
                                                  "forget-loading",
                                                ]
                                              )),
                                      ]),
                                    ]),
                                  ],
                                  2
                                ),
                              ],
                              2
                            ),
                          ]),
                          _: 1,
                        }),
                      ]),
                      j(
                        "footer",
                        {
                          class: k([
                            "login-page-footer login-page-footer--pinned shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
                            "center" === V(s) && "login-page-footer--floating-layout",
                          ]),
                        },
                        [
                          j("div", ta, [
                            j("div", oa, [
                              j(
                                "a",
                                {
                                  href: V(c),
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  class: "login-page-footer__link",
                                },
                                A(V(d)),
                                9,
                                sa
                              ),
                            ]),
                            a[11] ||
                              (a[11] = j(
                                "span",
                                { class: "login-page-footer__sep login-footer-sep-center" },
                                "|",
                                -1
                              )),
                            j("div", ia, [
                              j(
                                "a",
                                {
                                  href: V(m),
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  class: "login-page-footer__link",
                                },
                                " 帮助 ",
                                8,
                                na
                              ),
                              a[9] ||
                                (a[9] = j("span", { class: "login-page-footer__sep" }, "|", -1)),
                              j(
                                "a",
                                {
                                  href: V(p),
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  class: "login-page-footer__link",
                                },
                                " 隐私 ",
                                8,
                                ua
                              ),
                              a[10] ||
                                (a[10] = j("span", { class: "login-page-footer__sep" }, "|", -1)),
                              j(
                                "a",
                                {
                                  href: V(g),
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  class: "login-page-footer__link",
                                },
                                " 条款 ",
                                8,
                                da
                              ),
                              V(f) ? (b(), x("span", ca, "|")) : T("", !0),
                              V(f) ? (b(), x("span", ma, A(V(f)), 1)) : T("", !0),
                            ]),
                          ]),
                        ],
                        2
                      ),
                    ],
                    2
                  ),
                ],
                2
              ),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-0085ca50"]]
  );
export { pa as default };
