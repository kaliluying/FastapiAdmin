import {
  z as e,
  br as a,
  ag as s,
  p as t,
  m as o,
  aI as u,
  a4 as l,
  j as r,
  al as n,
  aw as i,
} from "./vue-vendor.Dwx3gfQr.js";
import { a5 as h, u as c } from "./index.CJ_YH8gZ.js";
const g = "/img/logo.DpKxIT4W.svg",
  d = { class: "flex items-center justify-center" },
  v = ["src"],
  f = e({
    name: "FaLogo",
    __name: "index",
    props: { size: { default: 36 }, src: { default: void 0 } },
    setup(e) {
      const i = e,
        h = n(!1),
        c = r(() => {
          if (h.value) return g;
          const e = i.src?.trim();
          return e || g;
        });
      function f() {
        h.value || (h.value = !0);
      }
      const w = r(() => ({ width: `${i.size}px`, height: `${i.size}px` }));
      return (
        a(
          () => i.src,
          () => {
            h.value = !1;
          }
        ),
        (e, a) => (
          s(),
          t("div", d, [
            o(
              "img",
              {
                style: l(u(w)),
                src: u(c),
                alt: "logo",
                class: "h-full w-full object-contain",
                onError: f,
              },
              null,
              44,
              v
            ),
          ])
        )
      );
    },
  });
function w() {
  const e = h(),
    a = r(() => c),
    {
      showMenuButton: s,
      showRefreshButton: t,
      showCrumbs: o,
      showLanguage: u,
      showMenuSearch: l,
      showFullscreen: n,
      showSizeSelect: g,
      showNotification: d,
    } = i(e),
    v = (e) => a.value[e]?.enabled ?? !1,
    f = (e) => a.value[e],
    w = r(() => v("menuButton") && s.value),
    m = r(() => v("refreshButton") && t.value),
    S = r(() => v("breadcrumb") && o.value),
    b = r(() => v("globalSearch") && l.value),
    F = r(() => v("fullscreen") && n.value),
    p = r(() => v("notification") && d.value),
    B = r(() => v("language") && u.value),
    j = r(() => v("sizeSelect") && g.value),
    x = r(() => v("themeToggle")),
    z = () => Object.keys(a.value).filter((e) => a.value[e]?.enabled),
    y = () => Object.keys(a.value).filter((e) => !a.value[e]?.enabled);
  return {
    // 配置
    headerBarConfig: a,
    // 显示状态计算属性
    shouldShowMenuButton: w,
    // 是否显示菜单按钮
    shouldShowRefreshButton: m,
    // 是否显示刷新按钮
    shouldShowBreadcrumb: S,
    // 是否显示面包屑
    shouldShowGlobalSearch: b,
    // 是否显示全局搜索
    shouldShowFullscreen: F,
    // 是否显示全屏按钮
    shouldShowNotification: p,
    // 是否显示通知中心
    shouldShowLanguage: B,
    // 是否显示语言切换
    shouldShowSizeSelect: j,
    // 是否显示组件尺寸切换
    shouldShowThemeToggle: x,
    // 是否显示主题切换
    // 方法
    isFeatureEnabled: v,
    // 检查功能是否启用
    isFeatureActive: (e) => v(e),
    // 检查功能是否启用（别名）
    getFeatureConfig: f,
    // 获取功能配置
    getFeatureInfo: (e) => f(e),
    // 获取功能配置（别名）
    getEnabledFeatures: z,
    // 获取所有启用的功能
    getDisabledFeatures: y,
    // 获取所有禁用的功能
    getActiveFeatures: () => z(),
    // 获取所有启用的功能（别名）
    getInactiveFeatures: () => y(),
  };
}
export { f as _, w as u };
