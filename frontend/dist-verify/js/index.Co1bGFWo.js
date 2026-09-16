import {
  w as e,
  x as a,
  A as t,
  d as s,
  aC as o,
  z as r,
  J as l,
} from "./element-plus.BPg5EhXK.js";
import { _ as n } from "./index.SppbxYir.js";
import {
  z as i,
  aX as c,
  b4 as d,
  b5 as u,
  aw as p,
  br as m,
  ac as v,
  ae as y,
  ag as f,
  p as k,
  aI as w,
  u as b,
  o as g,
  w as j,
  bt as h,
  m as x,
  ax as _,
  bw as L,
  bv as C,
  v as S,
  X as K,
  a4 as E,
  bu as z,
  bo as P,
  b as D,
  j as V,
  al as A,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as q } from "./index.liOxemVZ.js";
import { C as I } from "./crypto.BDUiruHv.js";
import { a6 as B, a5 as F, a4 as T, G as H } from "./index.CJ_YH8gZ.js";
import "./file-saver.CjVB4eGa.js";
import { _ as R } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./@intlify.CbtlSmdZ.js";
import "./index.BRxvSTh5.js";
import "./index.vue_vue_type_script_setup_true_lang.BjaQnZim.js";
import "./useHeaderBar.jPAVpWpj.js";
import "./index.BpYlApL9.js";
import "./exceljs.CGWu2obp.js";
import "./object-inspect.Ju1NJVd1.js";
/* empty css                    */ import "./axios.Da-QW0H8.js";
import "./qs.USnEJzjK.js";
import "./side-channel.DybIsWO5.js";
import "./es-errors.DK26Ybqf.js";
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
const U = { class: "layout-lock-screen" },
  M = {
    key: 0,
    class:
      "fixed top-0 left-0 z-999999 flex items-center justify-center w-full h-full text-white bg-linear-to-br from-[#1e1e1e] to-black animate-fade-in",
  },
  O = { key: 1 },
  W = { class: "lock-dialog-content" },
  G = ["src"],
  N = { key: 1, class: "lock-dialog-avatar", src: q, alt: "" },
  X = { class: "lock-dialog-name" },
  $ = { class: "time-container flex-cc w-screen h-screen" },
  J = { class: "hour-container mr-5 md:mr-20 w-2/5 h-2/5 md:h-4/5" },
  Q = { class: "minute-container flex-cc w-2/5 h-2/5 md:h-4/5" },
  Z = { class: "entry-wrapper flex-cc" },
  Y = { class: "entry-content" },
  ee = { class: "avatar-container" },
  ae = ["src"],
  te = { key: 1, class: "avatar", src: q, alt: "" },
  se = { class: "username" },
  oe = { key: 0, class: "error-message" },
  re = { class: "button-group" },
  le = { class: "date-container" },
  ne = { class: "time-display" },
  ie = { class: "meridiem-display" },
  ce = { class: "full-date" },
  de = R(
    i({
      name: "FaScreenLock",
      __name: "index",
      setup(i) {
        const { t: q } = c(),
          R = d(),
          de = u(),
          ue = "s3cur3k3y4adpro",
          pe = B(),
          me = F(),
          { info: ve, lockPassword: ye, isLock: fe } = p(pe),
          { isDark: ke } = p(me),
          we = V(() => ({
            backgroundImage: `linear-gradient(rgb(0 0 0 / 46%), rgb(0 0 0 / 46%)), url(${ke.value ? "/webp/bg_dark.BoZNsetB.webp" : "/webp/bg_light.WsVMpqKz.webp"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          })),
          { hour: be, month: ge, minute: je, meridiem: he, year: xe, day: _e, week: Le } = T(!0),
          Ce = V(() => ve.value?.name || ve.value?.username || "—"),
          Se = V(() => {
            const e = ve.value?.avatar?.trim();
            return e || "";
          }),
          Ke = A(!1),
          Ee = A(null),
          ze = A(),
          Pe = A(!1),
          De = A(!0),
          Ve = A(""),
          Ae = A(!1),
          qe = A(!1),
          Ie = A(),
          Be = A({ password: "" }),
          Fe = V(() => ({
            password: [{ required: !0, message: q("lock.required"), trigger: "blur" }],
          })),
          Te = () =>
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            ),
          He = (e) => {
            e.altKey &&
              "¬" === e.key.toLowerCase() &&
              (e.preventDefault(), fe.value || (Ke.value = !0));
          },
          Re = () => {
            setTimeout(() => {
              Ee.value?.input?.focus();
            }, 100);
          },
          Ue = async () => {
            Ie.value &&
              (await Ie.value.validate((e, a) => {
                if (e) {
                  const e = I.AES.encrypt(Be.value.password, ue).toString();
                  (pe.setLockStatus(!0),
                    pe.setLockPassword(e),
                    (Ke.value = !1),
                    (Be.value.password = ""),
                    (De.value = !0),
                    (Ve.value = ""),
                    (Ae.value = !1));
                }
              }));
          };
        function Me() {
          ((De.value = !1),
            (Ae.value = !1),
            requestAnimationFrame(() => {
              ze.value?.focus?.();
            }));
        }
        function Oe() {
          ((De.value = !0), (Ve.value = ""), (Ae.value = !1));
        }
        async function We() {
          if (Ve.value) {
            qe.value = !0;
            try {
              if (
                ((e, a) => {
                  try {
                    return e === I.AES.decrypt(a, ue).toString(I.enc.Utf8);
                  } catch (t) {
                    return !1;
                  }
                })(Ve.value, ye.value)
              )
                (pe.setLockStatus(!1),
                  pe.setLockPassword(""),
                  (Ve.value = ""),
                  (Ae.value = !1),
                  (Ke.value = !1),
                  (Pe.value = !1),
                  (De.value = !0));
              else {
                ((Ae.value = !0), l.error(q("lockScreen.pwdError")));
                const e = ze.value?.$el,
                  a = e?.querySelector?.(".el-input__wrapper"),
                  t = a ?? e;
                (t &&
                  (t.classList.add("shake-animation"),
                  setTimeout(() => {
                    t.classList.remove("shake-animation");
                  }, 300)),
                  (Ve.value = ""));
              }
            } finally {
              qe.value = !1;
            }
          }
        }
        async function Ge() {
          await pe.logout({ navigate: !1 }).catch(() => {});
          const e = "/login" !== R.path && "Login" !== R.name ? R.fullPath : void 0;
          await de.replace({ name: "Login", ...(e ? { query: { redirect: e } } : {}) });
        }
        const Ne = () => {
          fe.value || (Ke.value = !0);
        };
        m(fe, (e) => {
          e
            ? ((document.body.style.overflow = "hidden"),
              (De.value = !0),
              (Ve.value = ""),
              (Ae.value = !1))
            : ((document.body.style.overflow = "auto"), (Pe.value = !1));
        });
        let Xe = null;
        return (
          v(() => {
            (H.on("openLockScreen", Ne),
              document.addEventListener("keydown", He),
              fe.value && (document.body.style.overflow = "hidden"),
              (Xe = (() => {
                const e = (e) => {
                  if (fe.value) return (e.preventDefault(), e.stopPropagation(), !1);
                };
                document.addEventListener("contextmenu", e, !0);
                const a = (e) => {
                  if (fe.value) {
                    if ("F12" === e.key) return (e.preventDefault(), e.stopPropagation(), !1);
                    if (e.ctrlKey && e.shiftKey) {
                      const a = e.key.toLowerCase();
                      if (["i", "j", "c", "k"].includes(a))
                        return (e.preventDefault(), e.stopPropagation(), !1);
                    }
                    return (e.ctrlKey && "u" === e.key.toLowerCase()) ||
                      (e.ctrlKey && "s" === e.key.toLowerCase()) ||
                      (e.ctrlKey && "a" === e.key.toLowerCase()) ||
                      (e.ctrlKey && "p" === e.key.toLowerCase()) ||
                      (e.ctrlKey && "f" === e.key.toLowerCase()) ||
                      (e.altKey && "Tab" === e.key) ||
                      (e.ctrlKey && "Tab" === e.key) ||
                      (e.ctrlKey && "w" === e.key.toLowerCase()) ||
                      (e.ctrlKey && "r" === e.key.toLowerCase()) ||
                      "F5" === e.key ||
                      (e.ctrlKey && e.shiftKey && "r" === e.key.toLowerCase())
                      ? (e.preventDefault(), e.stopPropagation(), !1)
                      : void 0;
                  }
                };
                document.addEventListener("keydown", a, !0);
                const t = (e) => {
                  if (fe.value) return (e.preventDefault(), !1);
                };
                document.addEventListener("selectstart", t, !0);
                const s = (e) => {
                  if (fe.value) return (e.preventDefault(), !1);
                };
                document.addEventListener("dragstart", s, !0);
                const o = { open: !1 };
                let r = null;
                const l = () => {
                  if (!fe.value || Te()) return;
                  const e =
                    window.outerHeight - window.innerHeight > 160 ||
                    window.outerWidth - window.innerWidth > 160;
                  e && !o.open
                    ? ((o.open = !0), (Pe.value = !0))
                    : !e && o.open && ((o.open = !1), (Pe.value = !1));
                };
                return (
                  Te() || (r = setInterval(l, 500)),
                  () => {
                    (document.removeEventListener("contextmenu", e, !0),
                      document.removeEventListener("keydown", a, !0),
                      document.removeEventListener("selectstart", t, !0),
                      document.removeEventListener("dragstart", s, !0),
                      r && clearInterval(r));
                  }
                );
              })()));
          }),
          y(() => {
            (H.off("openLockScreen", Ne),
              document.removeEventListener("keydown", He),
              (document.body.style.overflow = "auto"),
              Xe && (Xe(), (Xe = null)));
          }),
          (l, i) => {
            const c = a,
              d = e,
              u = s,
              p = n,
              m = r;
            return (
              f(),
              k("div", U, [
                w(Pe)
                  ? (f(),
                    k("div", M, [
                      ...(i[3] ||
                        (i[3] = [
                          b(
                            '<div class="p-5 text-center select-none" data-v-2deb5392><div class="mb-7.5 text-5xl" data-v-2deb5392>🔒</div><h1 class="m-0 mb-5 text-3xl font-semibold text-danger" data-v-2deb5392>系统已锁定</h1><p class="max-w-125 m-0 text-lg leading-relaxed text-white" data-v-2deb5392> 检测到开发者工具已打开 <br data-v-2deb5392> 为了系统安全，请关闭开发者工具后继续使用 </p><div class="mt-7.5 text-sm text-gray-400" data-v-2deb5392>Security Lock Activated</div></div>',
                            1
                          ),
                        ])),
                    ]))
                  : g("", !0),
                w(fe)
                  ? (f(),
                    k(
                      "div",
                      { key: 2, class: "lockpage", style: E(w(we)) },
                      [
                        z(
                          x(
                            "div",
                            { class: "unlock-container", onClick: Me },
                            [
                              j(m, null, { default: h(() => [j(w(o))]), _: 1 }),
                              x("span", null, _(w(q)("lock.unlock")), 1),
                            ],
                            512
                          ),
                          [[P, w(De)]]
                        ),
                        x("div", $, [
                          x("div", J, [
                            x("span", null, _(w(be)), 1),
                            z(
                              x(
                                "span",
                                { class: "meridiem absolute left-5 top-5 text-md xl:text-xl" },
                                _(w(he)),
                                513
                              ),
                              [[P, w(De)]]
                            ),
                          ]),
                          x("div", Q, [x("span", null, _(w(je)), 1)]),
                        ]),
                        j(
                          D,
                          { name: "fade-slide" },
                          {
                            default: h(() => [
                              z(
                                x(
                                  "div",
                                  Z,
                                  [
                                    x("div", Y, [
                                      x("div", ee, [
                                        w(Se)
                                          ? (f(),
                                            k(
                                              "img",
                                              {
                                                key: 0,
                                                src: w(Se),
                                                alt: "",
                                                class: "avatar object-cover",
                                              },
                                              null,
                                              8,
                                              ae
                                            ))
                                          : (f(), k("img", te)),
                                        x("span", se, _(w(Ce)), 1),
                                      ]),
                                      j(
                                        w(t),
                                        {
                                          ref_key: "passwordInputRef",
                                          ref: ze,
                                          modelValue: w(Ve),
                                          "onUpdate:modelValue":
                                            i[2] || (i[2] = (e) => (K(Ve) ? (Ve.value = e) : null)),
                                          placeholder: w(q)("lock.placeholder"),
                                          class: "password-input",
                                          "show-password": "",
                                          clearable: "",
                                          onKeydown: C(We, ["enter"]),
                                        },
                                        null,
                                        8,
                                        ["modelValue", "placeholder"]
                                      ),
                                      w(Ae)
                                        ? (f(), k("span", oe, _(w(q)("lock.message")), 1))
                                        : g("", !0),
                                      x("div", re, [
                                        j(
                                          u,
                                          {
                                            type: "primary",
                                            size: "small",
                                            class: "back-button",
                                            link: "",
                                            disabled: w(qe),
                                            onClick: Oe,
                                          },
                                          {
                                            default: h(() => [S(_(w(q)("common.back")), 1)]),
                                            _: 1,
                                          },
                                          8,
                                          ["disabled"]
                                        ),
                                        j(
                                          u,
                                          {
                                            type: "primary",
                                            size: "small",
                                            class: "login-button",
                                            link: "",
                                            disabled: w(qe),
                                            onClick: Ge,
                                          },
                                          {
                                            default: h(() => [S(_(w(q)("lock.backToLogin")), 1)]),
                                            _: 1,
                                          },
                                          8,
                                          ["disabled"]
                                        ),
                                        j(
                                          u,
                                          {
                                            type: "primary",
                                            class: "entry-button",
                                            size: "small",
                                            link: "",
                                            disabled: w(qe),
                                            onClick: We,
                                          },
                                          {
                                            default: h(() => [S(_(w(q)("lock.entrySystem")), 1)]),
                                            _: 1,
                                          },
                                          8,
                                          ["disabled"]
                                        ),
                                      ]),
                                    ]),
                                  ],
                                  512
                                ),
                                [[P, !w(De)]]
                              ),
                            ]),
                            _: 1,
                          }
                        ),
                        x("div", le, [
                          z(
                            x(
                              "div",
                              ne,
                              [S(_(w(be)) + ":" + _(w(je)) + " ", 1), x("span", ie, _(w(he)), 1)],
                              512
                            ),
                            [[P, !w(De)]]
                          ),
                          x(
                            "div",
                            ce,
                            _(w(xe)) + "/" + _(w(ge)) + "/" + _(w(_e)) + " " + _(w(Le)),
                            1
                          ),
                        ]),
                      ],
                      4
                    ))
                  : (f(),
                    k("div", O, [
                      j(
                        p,
                        {
                          modelValue: w(Ke),
                          "onUpdate:modelValue":
                            i[1] || (i[1] = (e) => (K(Ke) ? (Ke.value = e) : null)),
                          width: "500px",
                          "max-height": "170px",
                          title: w(q)("lock.lockScreen"),
                          class: "v-lock-dialog",
                          onOpened: Re,
                        },
                        {
                          footer: h(() => [
                            j(
                              u,
                              { type: "primary", onClick: Ue },
                              { default: h(() => [S(_(w(q)("navbar.lock")), 1)]), _: 1 }
                            ),
                          ]),
                          default: h(() => [
                            x("div", W, [
                              w(Se)
                                ? (f(),
                                  k(
                                    "img",
                                    {
                                      key: 0,
                                      src: w(Se),
                                      alt: "",
                                      class: "lock-dialog-avatar object-cover",
                                      loading: "eager",
                                    },
                                    null,
                                    8,
                                    G
                                  ))
                                : (f(), k("img", N)),
                              x("span", X, _(w(Ce)), 1),
                            ]),
                            j(
                              d,
                              {
                                ref_key: "formRef",
                                ref: Ie,
                                model: w(Be),
                                rules: w(Fe),
                                onSubmit: L(Ue, ["prevent"]),
                              },
                              {
                                default: h(() => [
                                  j(
                                    c,
                                    { label: w(q)("lockScreen.lockPassword"), prop: "password" },
                                    {
                                      default: h(() => [
                                        j(
                                          w(t),
                                          {
                                            ref_key: "lockInputRef",
                                            ref: Ee,
                                            modelValue: w(Be).password,
                                            "onUpdate:modelValue":
                                              i[0] || (i[0] = (e) => (w(Be).password = e)),
                                            type: "password",
                                            "show-password": "",
                                            clearable: "",
                                            autocomplete: "new-password",
                                            placeholder: w(q)("lock.placeholder"),
                                            onKeydown: C(Ue, ["enter"]),
                                          },
                                          null,
                                          8,
                                          ["modelValue", "placeholder"]
                                        ),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["label"]
                                  ),
                                ]),
                                _: 1,
                              },
                              8,
                              ["model", "rules"]
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ["modelValue", "title"]
                      ),
                    ])),
              ])
            );
          }
        );
      },
    }),
    [["__scopeId", "data-v-2deb5392"]]
  );
export { de as default };
