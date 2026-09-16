import { _ as e } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import { z as o, an as s } from "./element-plus.BPg5EhXK.js";
import {
  z as t,
  ag as a,
  p as i,
  m as l,
  w as p,
  bt as n,
  aI as r,
  F as m,
  ao as c,
  bv as d,
  bw as u,
  a2 as _,
  ax as v,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as b } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./dayjs.BHSg66Ch.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
const j = { class: "welcome-screen" },
  y = { class: "welcome-content" },
  f = { class: "ai-mark" },
  h = { class: "ai-mark__core" },
  k = { class: "example-prompts" },
  w = ["onClick", "onKeydown"],
  x = { class: "prompt-card__icon" },
  z = b(
    t({
      __name: "FaWelcomeScreen",
      emits: ["prompt-click"],
      setup(t, { emit: b }) {
        const z = b,
          A = [
            {
              title: "系统介绍",
              body: "请介绍一下 FastApiAdmin 的模块和能力",
              prompt: "请介绍一下FastApiAdmin系统",
              icon: "ri:dashboard-3-line",
              tone: "blue",
            },
            {
              title: "开发指导",
              body: "生成新模块的目录、接口与页面清单",
              prompt: "如何在系统中创建新的模块？",
              icon: "ri:code-box-line",
              tone: "cyan",
            },
            {
              title: "权限管理",
              body: "解释角色、菜单和接口权限的协作关系",
              prompt: "系统的权限管理是如何工作的？",
              icon: "ri:shield-keyhole-line",
              tone: "violet",
            },
            {
              title: "性能优化",
              body: "定位接口、检索和前端渲染的优化机会",
              prompt: "如何优化FA系统的性能？",
              icon: "ri:speed-up-line",
              tone: "amber",
            },
          ],
          g = (e) => {
            z("prompt-click", e);
          };
        return (t, b) => {
          const z = o,
            F = e;
          return (
            a(),
            i("div", j, [
              l("div", y, [
                l("div", f, [
                  l("span", h, [p(z, { size: "34" }, { default: n(() => [p(r(s))]), _: 1 })]),
                  b[0] || (b[0] = l("span", { class: "ai-mark__pulse" }, null, -1)),
                ]),
                b[1] ||
                  (b[1] = l(
                    "div",
                    { class: "welcome-heading" },
                    [
                      l("span", null, "Knowledge Copilot"),
                      l("h1", null, "FA智能助手"),
                      l(
                        "p",
                        null,
                        "连接内部知识库、系统权限与操作上下文，帮你把问题变成可执行的后台动作。"
                      ),
                    ],
                    -1
                  )),
                l("div", k, [
                  (a(),
                  i(
                    m,
                    null,
                    c(A, (e) =>
                      l(
                        "div",
                        {
                          key: e.prompt,
                          class: _(["prompt-card", `prompt-card--${e.tone}`]),
                          role: "button",
                          tabindex: "0",
                          onClick: (o) => g(e.prompt),
                          onKeydown: [
                            d(
                              u((o) => g(e.prompt), ["prevent"]),
                              ["enter"]
                            ),
                            d(
                              u((o) => g(e.prompt), ["prevent"]),
                              ["space"]
                            ),
                          ],
                        },
                        [
                          l("div", x, [p(F, { icon: e.icon }, null, 8, ["icon"])]),
                          l("div", null, [
                            l("h4", null, v(e.title), 1),
                            l("p", null, v(e.body), 1),
                          ]),
                        ],
                        42,
                        w
                      )
                    ),
                    64
                  )),
                ]),
              ]),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-e4cfa3ae"]]
  );
export { z as default };
