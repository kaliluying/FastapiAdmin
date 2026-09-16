import { a3 as e, e as t } from "./element-plus.BPg5EhXK.js";
import {
  z as a,
  b3 as s,
  br as i,
  ac as o,
  a1 as l,
  a7 as r,
  ag as n,
  p,
  a4 as d,
  al as m,
  n as h,
  bt as c,
  w as f,
  m as u,
  v as y,
  j as g,
} from "./vue-vendor.Dwx3gfQr.js";
import {
  u as x,
  i as b,
  e as j,
  t as v,
  a as _,
  b as w,
  c as S,
  k as z,
  j as A,
  l as k,
} from "./echarts.r3cQDZl7.js";
import { _ as C } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
const I = a({
    name: "FaECharts",
    __name: "index",
    props: { options: {}, width: { default: "100%" }, height: { default: "100%" } },
    setup(e) {
      x([j, v, _, w, S, z, A, k]);
      const t = e,
        a = m(null);
      let h = null;
      return (
        s(a, () => {
          h?.resize();
        }),
        i(
          () => t.options,
          (e) => {
            h && e && h.setOption(e);
          },
          { deep: !0 }
        ),
        o(() => {
          l(() => {
            a.value && ((h = b(a.value)), t.options && h.setOption(t.options));
          });
        }),
        r(() => {
          h?.dispose();
        }),
        (t, s) => (
          n(),
          p(
            "div",
            { ref_key: "chartRef", ref: a, style: d({ width: e.width, height: e.height }) },
            null,
            4
          )
        )
      );
    },
  }),
  L = { class: "flex flex-wrap items-center justify-between gap-3" },
  O = C(
    a({
      name: "VisitTrendCard",
      __name: "visit-trend-card",
      setup(a) {
        const s = ["06-06", "06-07", "06-08", "06-09", "06-10", "06-11", "06-12"],
          i = [42, 58, 54, 73, 88, 82, 104],
          o = [88, 106, 124, 136, 148, 164, 182],
          l = g(() => ({
            tooltip: { trigger: "axis", axisPointer: { type: "line" } },
            legend: { top: 0, right: 0, data: ["AI 对话", "知识检索"] },
            grid: { top: 44, left: 12, right: 16, bottom: 8, containLabel: !0 },
            xAxis: {
              type: "category",
              boundaryGap: !1,
              data: s,
              axisLine: { lineStyle: { color: "#d7e0ec" } },
              axisTick: { show: !1 },
            },
            yAxis: {
              type: "value",
              splitLine: { lineStyle: { type: "dashed", color: "#e7edf5" } },
            },
            series: [
              {
                name: "AI 对话",
                type: "line",
                smooth: !0,
                symbolSize: 7,
                data: i,
                itemStyle: { color: "#3b82f6" },
                lineStyle: { width: 3, color: "#3b82f6" },
                areaStyle: { color: "rgba(59, 130, 246, 0.12)" },
              },
              {
                name: "知识检索",
                type: "line",
                smooth: !0,
                symbolSize: 7,
                data: o,
                itemStyle: { color: "#2dd4bf" },
                lineStyle: { width: 3, color: "#2dd4bf" },
                areaStyle: { color: "rgba(45, 212, 191, 0.1)" },
              },
            ],
          }));
        return (a, s) => {
          const i = e,
            o = t;
          return (
            n(),
            h(
              o,
              { shadow: "hover", class: "home-card h-full" },
              {
                header: c(() => [
                  u("div", L, [
                    s[1] ||
                      (s[1] = u(
                        "div",
                        null,
                        [
                          u(
                            "div",
                            { class: "text-base font-semibold text-g-900" },
                            "知识库使用趋势"
                          ),
                          u(
                            "div",
                            { class: "mt-1 text-xs text-g-500" },
                            "近 7 日问答与检索调用走势"
                          ),
                        ],
                        -1
                      )),
                    f(
                      i,
                      { type: "primary", effect: "light" },
                      { default: c(() => [...(s[0] || (s[0] = [y("实时统计", -1)]))]), _: 1 }
                    ),
                  ]),
                ]),
                default: c(() => [
                  f(
                    I,
                    { options: l.value, height: "320px", style: { "min-height": "220px" } },
                    null,
                    8,
                    ["options"]
                  ),
                ]),
                _: 1,
              }
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-99572f5d"]]
  );
export { O as default };
