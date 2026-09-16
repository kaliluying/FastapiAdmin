import {
  z as a,
  ag as e,
  p as s,
  F as i,
  w as r,
  aI as l,
  I as o,
  m as n,
  ax as t,
  o as c,
  j as p,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as u } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./@intlify.CbtlSmdZ.js";
const g = { class: "fa-ai-process-status", "aria-live": "polite" },
  d = { class: "fa-ai-process-status__label" },
  v = u(
    a({
      name: "FaAiProcessStatus",
      __name: "FaAiProcessStatus",
      props: { stage: {} },
      setup(a) {
        const u = a,
          v = {
            idle: { label: "", icon: "" },
            retrieving: { label: "正在检索", icon: "ri:search-eye-line" },
            reranking: { label: "正在重排", icon: "ri:sort-desc" },
            generating: { label: "正在生成", icon: "svg-spinners:3-dots-fade" },
            complete: { label: "生成完成", icon: "ri:check-line" },
            error: { label: "生成失败", icon: "ri:error-warning-line" },
          },
          _ = p(() => v[u.stage]?.label ?? ""),
          b = p(() => v[u.stage]?.icon ?? "");
        return (p, u) => (
          e(),
          s("div", g, [
            "idle" !== a.stage && _.value
              ? (e(),
                s(
                  i,
                  { key: 0 },
                  [
                    r(l(o), { icon: b.value, class: "fa-ai-process-status__icon" }, null, 8, [
                      "icon",
                    ]),
                    n("span", d, t(_.value), 1),
                  ],
                  64
                ))
              : c("", !0),
          ])
        );
      },
    }),
    [["__scopeId", "data-v-a0ab93b0"]]
  );
export { v as default };
