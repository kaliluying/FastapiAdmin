import {
  z as a,
  ag as e,
  p as s,
  m as t,
  ax as i,
  ap as o,
  o as p,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as r } from "./_plugin-vue_export-helper.BCo6x5W8.js";
const d = { class: "fa-page-header" },
  c = { class: "fa-page-header__main" },
  _ = { class: "fa-page-header__title-row" },
  l = { class: "fa-page-header__title" },
  n = { key: 0, class: "fa-page-header__description" },
  g = { key: 0, class: "fa-page-header__actions" },
  h = r(
    a({
      name: "FaPageHeader",
      __name: "index",
      props: { title: {}, description: {}, status: {} },
      setup: (a) => (r, h) => (
        e(),
        s("header", d, [
          t("div", c, [
            t("div", _, [t("h1", l, i(a.title), 1), o(r.$slots, "status", {}, void 0, !0)]),
            a.description ? (e(), s("p", n, i(a.description), 1)) : p("", !0),
          ]),
          r.$slots.actions
            ? (e(), s("div", g, [o(r.$slots, "actions", {}, void 0, !0)]))
            : p("", !0),
        ])
      ),
    }),
    [["__scopeId", "data-v-ca5c90e6"]]
  );
export { h as F };
