import { ref, watch, onUnmounted, getCurrentInstance, type Ref } from "vue";

export interface SmoothStreamOptions {
  /** 每次动画帧消费的固定字符数，未指定时自适应队列长度 */
  charsPerFrame?: number;
  /** 突发大块内容时的加速追赶阈值（字符数），默认 80 */
  maxLag?: number;
  /** 强制启用动画循环（单元测试验证步进逻辑时使用） */
  forceAnimation?: boolean;
}

/**
 * 流式文本平滑微插值 Hook
 * 在网络粘包或大模型突发推流时，将瞬时大量字符平滑按帧消费展示，
 * 流式结束或中止时立即同步刷新，确保内容与复制/断言 100% 一致。
 */
export function useSmoothStream(
  sourceText: Ref<string>,
  isStreaming: Ref<boolean | undefined>,
  options: SmoothStreamOptions = {}
) {
  const displayedText = ref(sourceText.value);
  let rafId: number | null = null;

  const flush = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    displayedText.value = sourceText.value;
  };

  const isReducedMotion = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const isTestEnv = () => {
    if (options.forceAnimation) return false;
    return (
      typeof window === "undefined" ||
      typeof window.requestAnimationFrame !== "function" ||
      Boolean((window as unknown as { __VITEST__?: boolean }).__VITEST__) ||
      process.env.NODE_ENV === "test"
    );
  };

  const tick = () => {
    rafId = null;
    const target = sourceText.value;
    const current = displayedText.value;

    if (!isStreaming.value || isReducedMotion() || isTestEnv()) {
      displayedText.value = target;
      return;
    }

    if (!target.startsWith(current) || current.length >= target.length) {
      displayedText.value = target;
      return;
    }

    const remaining = target.length - current.length;
    const step =
      options.charsPerFrame ??
      (remaining > (options.maxLag ?? 80)
        ? Math.ceil(remaining / 3)
        : remaining > 20
          ? Math.ceil(remaining / 5)
          : Math.min(remaining, Math.max(1, Math.ceil(remaining / 6))));

    displayedText.value = target.slice(0, current.length + step);

    if (displayedText.value.length < target.length) {
      rafId = requestAnimationFrame(tick);
    }
  };

  watch(
    [sourceText, isStreaming],
    ([newText, streaming]) => {
      if (!streaming) {
        flush();
        return;
      }

      if (isReducedMotion() || isTestEnv()) {
        displayedText.value = newText;
        return;
      }

      if (!newText.startsWith(displayedText.value)) {
        displayedText.value = newText;
        return;
      }

      if (displayedText.value.length < newText.length && rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    },
    { immediate: true, flush: "sync" }
  );

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }

  return {
    displayedText,
    flush,
  };
}
