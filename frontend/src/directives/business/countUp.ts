/**
 * v-count-up 数字滚动计数指令
 *
 * 元素挂载时把数字从 0 滚动到目标值，提升数据卡片的「活」感。
 * 尊重 prefers-reduced-motion：开启减弱动效时直接显示终值，不做动画。
 *
 * ## 使用示例
 *
 * ```vue
 * <template>
 *   <!-- 直接传目标值 -->
 *   <div v-count-up="1280">0</div>
 *
 *   <!-- 传对象（指定时长） -->
 *   <div v-count-up="{ value: 1280, duration: 1200 }">0</div>
 * </template>
 * ```
 *
 * @module directives/countUp
 * @author FastapiAdmin Team
 */

import type { App, Directive, DirectiveBinding } from "vue";

export interface CountUpOptions {
  /** 目标数值 */
  value?: number;
  /** 动画时长（ms），默认 900 */
  duration?: number;
}

export type CountUpDirective = Directive<HTMLElement, number | CountUpOptions>;

/**
 * 解析指令绑定值并补齐默认动画参数。
 *
 * Args:
 *   binding: Vue 指令绑定对象，值可以是目标数字或配置对象。
 *
 * Returns:
 *   标准化后的目标数字和动画时长。
 */
function resolve(binding: DirectiveBinding): { target: number; duration: number } {
  const v = binding.value;
  if (typeof v === "number") return { target: v, duration: 900 };
  const opt = (v || {}) as CountUpOptions;
  return { target: opt.value ?? 0, duration: opt.duration ?? 900 };
}

export const vCountUp: CountUpDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { target, duration } = resolve(binding);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !Number.isFinite(target)) {
      el.textContent = String(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(target * eased));
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = String(target);
      }
    };
    requestAnimationFrame(tick);
  },
};

/**
 * 在 Vue 应用中注册数字滚动指令。
 *
 * Args:
 *   app: 待注册全局指令的 Vue 应用实例。
 *
 * Returns:
 *   无返回值。
 *
 * Side Effects:
 *   以 `count-up` 名称修改应用的全局指令注册表。
 */
export function setupCountUpDirective(app: App) {
  app.directive("count-up", vCountUp);
}
