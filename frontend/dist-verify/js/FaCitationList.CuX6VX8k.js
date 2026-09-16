import {
  z as a,
  ag as i,
  p as t,
  F as e,
  ao as s,
  m as n,
  ax as o,
  w as l,
  aI as c,
  I as d,
  o as p,
  al as r,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./@intlify.CbtlSmdZ.js";
const m = { class: "fa-citation-list" },
  u = { class: "fa-citation-item__header" },
  f = { class: "fa-citation-item__number" },
  v = ["onClick"],
  k = ["aria-expanded", "aria-label", "onClick"],
  h = { key: 0, class: "fa-citation-item__snippet" },
  y = { key: 1, class: "fa-citation-list__empty" },
  b = _(
    a({
      name: "FaCitationList",
      __name: "FaCitationList",
      props: { citations: {} },
      emits: ["select"],
      setup(a, { emit: _ }) {
        const b = _,
          w = r(new Set());
        return (r, _) => (
          i(),
          t("div", m, [
            a.citations && a.citations.length > 0
              ? (i(!0),
                t(
                  e,
                  { key: 0 },
                  s(
                    a.citations,
                    (a, e) => (
                      i(),
                      t("div", { key: a.id, class: "fa-citation-item" }, [
                        n("div", u, [
                          n("span", f, o(e + 1), 1),
                          n(
                            "span",
                            { class: "fa-citation-item__title", onClick: (i) => b("select", a) },
                            o(a.title),
                            9,
                            v
                          ),
                          n(
                            "button",
                            {
                              type: "button",
                              class: "fa-citation-item__expand",
                              "aria-expanded": w.value.has(a.id) ? "true" : "false",
                              "aria-label": `展开引用: ${a.title}`,
                              onClick: (i) =>
                                (function (a) {
                                  const i = new Set(w.value);
                                  (i.has(a) ? i.delete(a) : i.add(a), (w.value = i));
                                })(a.id),
                            },
                            [
                              l(
                                c(d),
                                {
                                  icon: w.value.has(a.id)
                                    ? "ri:arrow-up-s-line"
                                    : "ri:arrow-down-s-line",
                                },
                                null,
                                8,
                                ["icon"]
                              ),
                            ],
                            8,
                            k
                          ),
                        ]),
                        w.value.has(a.id) && a.snippet
                          ? (i(), t("div", h, o(a.snippet), 1))
                          : p("", !0),
                      ])
                    )
                  ),
                  128
                ))
              : (i(), t("div", y, "当前回答未提供可定位引用")),
          ])
        );
      },
    }),
    [["__scopeId", "data-v-9da4fc5b"]]
  );
export { b as default };
