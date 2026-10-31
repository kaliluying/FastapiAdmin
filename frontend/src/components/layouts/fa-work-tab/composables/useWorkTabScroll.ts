import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useWorktabStore } from "@stores";

/** 标签横向滚动步长（px） */
export const SCROLL_STEP = 200;

interface ScrollState {
  translateX: number;
  transition: string;
}

interface TouchState {
  startX: number;
  currentX: number;
}

/**
 * 工作栏标签的横向滚动与溢出检测
 * 负责：平移状态、滚轮/触摸拖动、激活标签自动入视野、溢出时显示左右滚动按钮
 */
export function useWorkTabScroll() {
  const store = useWorktabStore();
  const { currentRoute } = useRouter();

  const scrollRef = ref<HTMLElement | null>(null);
  const tabsRef = ref<HTMLElement | null>(null);
  const scrollState = ref<ScrollState>({ translateX: 0, transition: "" });
  const touchState = ref<TouchState>({ startX: 0, currentX: 0 });

  /** 标签总宽度超过可视区时才显示左右滚动按钮（与常见控制台一致） */
  const tabOverflow = ref(false);

  const activeTabIndex = computed(() =>
    store.opened.findIndex((tab) => tab.path === currentRoute.value.path)
  );

  function measureTabOverflow(): void {
    requestAnimationFrame(() => {
      const wrap = scrollRef.value;
      const tabs = tabsRef.value;
      if (!wrap || !tabs) {
        tabOverflow.value = false;
        return;
      }
      tabOverflow.value = tabs.scrollWidth > wrap.clientWidth + 1;
    });
  }

  let tabOverflowResizeObserver: ResizeObserver | null = null;

  function setupTabOverflowObserver(): void {
    teardownTabOverflowObserver();
    if (typeof ResizeObserver === "undefined") return;
    tabOverflowResizeObserver = new ResizeObserver(() => measureTabOverflow());
    if (scrollRef.value) tabOverflowResizeObserver.observe(scrollRef.value);
    if (tabsRef.value) tabOverflowResizeObserver.observe(tabsRef.value);
  }

  function teardownTabOverflowObserver(): void {
    tabOverflowResizeObserver?.disconnect();
    tabOverflowResizeObserver = null;
  }

  function setTransition(): void {
    scrollState.value.transition = "transform 0.5s cubic-bezier(0.15, 0, 0.15, 1)";
    setTimeout(() => {
      scrollState.value.transition = "";
    }, 250);
  }

  function calculateScrollPosition() {
    if (!scrollRef.value || !tabsRef.value) return;

    const scrollWidth = scrollRef.value.offsetWidth;
    const ulWidth = tabsRef.value.offsetWidth;
    const curTabEl = document.getElementById(`scroll-li-${activeTabIndex.value}`);

    if (!curTabEl) return;

    const { offsetLeft, clientWidth } = curTabEl;
    const curTabRight = offsetLeft + clientWidth;

    return {
      scrollWidth,
      ulWidth,
      offsetLeft,
      clientWidth,
      curTabRight,
      targetLeft: scrollWidth - curTabRight,
    };
  }

  function autoPositionTab(): void {
    const positions = calculateScrollPosition();
    if (!positions) return;

    const { scrollWidth, ulWidth, offsetLeft, curTabRight, targetLeft } = positions;

    if (
      (offsetLeft > Math.abs(scrollState.value.translateX) && curTabRight <= scrollWidth) ||
      (scrollState.value.translateX < targetLeft && targetLeft < 0)
    ) {
      return;
    }

    requestAnimationFrame(() => {
      if (curTabRight > scrollWidth) {
        scrollState.value.translateX = Math.max(targetLeft - 6, scrollWidth - ulWidth);
      } else if (offsetLeft < Math.abs(scrollState.value.translateX)) {
        scrollState.value.translateX = -offsetLeft;
      }
    });
  }

  function adjustPositionAfterClose(): void {
    const positions = calculateScrollPosition();
    if (!positions) return;

    const { scrollWidth, ulWidth, offsetLeft, clientWidth } = positions;
    const curTabLeft = offsetLeft + clientWidth;

    requestAnimationFrame(() => {
      scrollState.value.translateX = curTabLeft > scrollWidth ? scrollWidth - ulWidth : 0;
    });
  }

  function scrollTabs(delta: number): void {
    if (!scrollRef.value || !tabsRef.value) return;
    const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth;
    scrollState.value.translateX = Math.min(
      Math.max(scrollState.value.translateX + delta, xMin),
      0
    );
    setTransition();
  }

  function handleWheelScroll(event: WheelEvent): void {
    if (!scrollRef.value || !tabsRef.value) return;

    event.preventDefault();

    if (tabsRef.value.offsetWidth <= scrollRef.value.offsetWidth) return;

    const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    scrollState.value.translateX = Math.min(
      Math.max(scrollState.value.translateX - delta, xMin),
      0
    );
  }

  function handleTouchStart(event: TouchEvent): void {
    touchState.value.startX = event.touches[0]!.clientX;
  }

  function handleTouchMove(event: TouchEvent): void {
    if (!scrollRef.value || !tabsRef.value) return;

    touchState.value.currentX = event.touches[0]!.clientX;
    const deltaX = touchState.value.currentX - touchState.value.startX;
    const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth;

    scrollState.value.translateX = Math.min(
      Math.max(scrollState.value.translateX + deltaX, xMin),
      0
    );
    touchState.value.startX = touchState.value.currentX;
  }

  function handleTouchEnd(): void {
    setTransition();
  }

  function setupEventListeners(): void {
    if (tabsRef.value) {
      tabsRef.value.addEventListener("wheel", handleWheelScroll, { passive: false });
      tabsRef.value.addEventListener("touchstart", handleTouchStart, { passive: true });
      tabsRef.value.addEventListener("touchmove", handleTouchMove, { passive: true });
      tabsRef.value.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
  }

  function cleanupEventListeners(): void {
    if (tabsRef.value) {
      tabsRef.value.removeEventListener("wheel", handleWheelScroll);
      tabsRef.value.removeEventListener("touchstart", handleTouchStart);
      tabsRef.value.removeEventListener("touchmove", handleTouchMove);
      tabsRef.value.removeEventListener("touchend", handleTouchEnd);
    }
  }

  return {
    scrollRef,
    tabsRef,
    scrollState,
    tabOverflow,
    measureTabOverflow,
    setupTabOverflowObserver,
    teardownTabOverflowObserver,
    setTransition,
    autoPositionTab,
    adjustPositionAfterClose,
    scrollTabs,
    setupEventListeners,
    cleanupEventListeners,
  };
}
