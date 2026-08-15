/**
 * 本地注册 Iconify 图标集，实现离线显示（不再从 CDN 加载）
 */
import { addCollection } from "@iconify/vue";

export async function initIconify(): Promise<void> {
  const [{ default: ri }, { default: svgSpinners }, { default: lineMd }] = await Promise.all([
    import("@iconify-json/ri/icons.json"),
    import("@iconify-json/svg-spinners/icons.json"),
    import("@iconify-json/line-md/icons.json"),
  ]);
  addCollection(ri);
  addCollection(svgSpinners);
  addCollection(lineMd);
}
