/** 表单与搜索栏共用的响应式布局计算。 */

// -----------------------------
// Responsive layout
// -----------------------------

export type ResponsiveBreakpoint = "xs" | "sm" | "md" | "lg" | "xl";

interface BreakpointConfig {
  threshold: number;
  fallback: number;
}

const BREAKPOINT_CONFIG: Record<ResponsiveBreakpoint, BreakpointConfig | null> = {
  xs: { threshold: 12, fallback: 24 },
  sm: { threshold: 12, fallback: 12 },
  md: { threshold: 8, fallback: 8 },
  lg: null,
  xl: null,
};

export function calculateResponsiveSpan(
  itemSpan: number | undefined,
  defaultSpan: number,
  breakpoint: ResponsiveBreakpoint
): number {
  const finalSpan = itemSpan ?? defaultSpan;
  const config = BREAKPOINT_CONFIG[breakpoint];
  if (!config) return finalSpan;
  return finalSpan >= config.threshold ? finalSpan : config.fallback;
}
