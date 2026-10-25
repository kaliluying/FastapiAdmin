import { ref } from "vue";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useSmoothStream } from "./useSmoothStream";

describe("useSmoothStream", () => {
  it("immediately syncs text in default test environment", () => {
    const source = ref("初始文本");
    const streaming = ref(true);
    const { displayedText } = useSmoothStream(source, streaming);

    expect(displayedText.value).toBe("初始文本");

    source.value = "初始文本 + 新增内容";
    expect(displayedText.value).toBe("初始文本 + 新增内容");
  });

  it("synchronously flushes full content when streaming finishes", () => {
    const source = ref("流式内容一");
    const streaming = ref(true);
    const { displayedText } = useSmoothStream(source, streaming);

    source.value = "流式内容一 + 流式内容二";
    streaming.value = false;

    expect(displayedText.value).toBe("流式内容一 + 流式内容二");
  });

  describe("with simulated animation frames", () => {
    let rafCallbacks: FrameRequestCallback[] = [];
    let originalRaf: typeof window.requestAnimationFrame;
    let originalCaf: typeof window.cancelAnimationFrame;

    beforeEach(() => {
      rafCallbacks = [];
      originalRaf = window.requestAnimationFrame;
      originalCaf = window.cancelAnimationFrame;
      window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });
      window.cancelAnimationFrame = vi.fn((id: number) => {
        rafCallbacks[id - 1] = () => {};
      });
    });

    afterEach(() => {
      window.requestAnimationFrame = originalRaf;
      window.cancelAnimationFrame = originalCaf;
    });

    const triggerRaf = (time = performance.now()) => {
      const callbacks = [...rafCallbacks];
      rafCallbacks = [];
      callbacks.forEach((cb) => cb(time));
    };

    it("smoothly consumes buffered text across frames", () => {
      const source = ref("开头");
      const streaming = ref(true);
      const { displayedText } = useSmoothStream(source, streaming, {
        forceAnimation: true,
        charsPerFrame: 2,
      });

      expect(displayedText.value).toBe("开头");

      // 突发到达 6 个字符
      source.value = "开头123456";
      expect(displayedText.value).toBe("开头");

      triggerRaf();
      expect(displayedText.value).toBe("开头12");

      triggerRaf();
      expect(displayedText.value).toBe("开头1234");

      triggerRaf();
      expect(displayedText.value).toBe("开头123456");
    });

    it("resets immediately if text is replaced with a non-prefix value", () => {
      const source = ref("前置会话消息");
      const streaming = ref(true);
      const { displayedText } = useSmoothStream(source, streaming, { forceAnimation: true });

      expect(displayedText.value).toBe("前置会话消息");

      // 会话重置或完全切换
      source.value = "全新不相关会话";
      expect(displayedText.value).toBe("全新不相关会话");
    });
  });
});
