import { a7 as t, e, a8 as s } from "./element-plus.BPg5EhXK.js";
import {
  z as i,
  ag as a,
  n as m,
  bt as o,
  w as r,
  p,
  F as l,
  ao as n,
  m as d,
  ax as c,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as u } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
const y = { class: "text-sm font-medium text-g-900" },
  v = { class: "mt-1 text-xs leading-5 text-g-500" },
  x = u(
    i({
      name: "RecentActivityCard",
      __name: "recent-activity-card",
      setup(i) {
        const u = [
          {
            time: "18:47",
            title: "超级管理员登录系统",
            description: "完成后台权限校验，加载单组织菜单。",
            type: "primary",
          },
          {
            time: "17:20",
            title: "知识库文档完成解析",
            description: "文档切片已写入 MySQL，并提交到 Chroma 集合。",
            type: "success",
          },
          {
            time: "16:05",
            title: "检索测试通过",
            description: "命中相关片段并返回引用上下文。",
            type: "warning",
          },
          {
            time: "15:32",
            title: "模型配置已确认",
            description: "OpenAI 兼容模型与 Embedding 参数已读取。",
            type: "info",
          },
        ];
        return (i, x) => {
          const f = s,
            j = t,
            g = e;
          return (
            a(),
            m(
              g,
              { shadow: "hover", class: "home-card h-full" },
              {
                header: o(() => [
                  ...(x[0] ||
                    (x[0] = [
                      d(
                        "div",
                        null,
                        [
                          d("div", { class: "text-base font-semibold text-g-900" }, "最近活动"),
                          d("div", { class: "mt-1 text-xs text-g-500" }, "后台与知识库关键动态"),
                        ],
                        -1
                      ),
                    ])),
                ]),
                default: o(() => [
                  r(
                    j,
                    { class: "activity-timeline" },
                    {
                      default: o(() => [
                        (a(),
                        p(
                          l,
                          null,
                          n(u, (t) =>
                            r(
                              f,
                              { key: t.time, timestamp: t.time, type: t.type, placement: "top" },
                              {
                                default: o(() => [
                                  d("div", y, c(t.title), 1),
                                  d("div", v, c(t.description), 1),
                                ]),
                                _: 2,
                              },
                              1032,
                              ["timestamp", "type"]
                            )
                          ),
                          64
                        )),
                      ]),
                      _: 1,
                    }
                  ),
                ]),
                _: 1,
              }
            )
          );
        };
      },
    }),
    [["__scopeId", "data-v-6369a413"]]
  );
export { x as default };
