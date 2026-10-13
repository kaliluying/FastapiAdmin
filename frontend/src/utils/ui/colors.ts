import { ElMessage } from "element-plus";
import { ThemeMode } from "@/enums";

// -----------------------------
// Colors
// -----------------------------

interface RgbaResult {
  red: number;
  green: number;
  blue: number;
  rgba: string;
}

export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function isValidHexColor(hex: string): boolean {
  const cleanHex = hex.trim().replace(/^#/, "");
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

function isValidRgbValue(r: number, g: number, b: number): boolean {
  const isValid = (value: number) => Number.isInteger(value) && value >= 0 && value <= 255;
  return isValid(r) && isValid(g) && isValid(b);
}

export function hexToRgba(hex: string, opacity: number): RgbaResult {
  if (!isValidHexColor(hex)) throw new Error("Invalid hex color format");

  let cleanHex = hex.trim().replace(/^#/, "").toUpperCase();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char.repeat(2))
      .join("");
  }

  const [red, green, blue] = cleanHex.match(/\w\w/g)!.map((x) => parseInt(x, 16)) as [
    number,
    number,
    number,
  ];
  const validOpacity = Math.max(0, Math.min(1, opacity));
  const rgba = `rgba(${red}, ${green}, ${blue}, ${validOpacity.toFixed(2)})`;
  return { red, green, blue, rgba };
}

export function hexToRgb(hexColor: string): number[] {
  if (!isValidHexColor(hexColor)) {
    ElMessage.warning("输入错误的hex颜色值");
    throw new Error("Invalid hex color format");
  }

  const cleanHex = hexColor.replace(/^#/, "");
  let hex = cleanHex;
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char.repeat(2))
      .join("");
  }

  const hexPairs = hex.match(/../g);
  if (!hexPairs) throw new Error("Invalid hex color format");
  return hexPairs.map((hexPair) => parseInt(hexPair, 16));
}

export function rgbToHex(r: number, g: number, b: number): string {
  if (!isValidRgbValue(r, g, b)) {
    ElMessage.warning("输入错误的RGB颜色值");
    throw new Error("Invalid RGB color values");
  }

  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function colourBlend(color1: string, color2: string, ratio: number): string {
  const validRatio = Math.max(0, Math.min(1, Number(ratio)));
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const blendedRgb = rgb1.map((value1, index) => {
    const value2 = rgb2[index]!;
    return Math.round(value1 * (1 - validRatio) + value2 * validRatio);
  });

  return rgbToHex(blendedRgb[0]!, blendedRgb[1]!, blendedRgb[2]!);
}

export function getLightColor(color: string, level: number, isDark: boolean = false): string {
  if (!isValidHexColor(color)) {
    ElMessage.warning("输入错误的hex颜色值");
    throw new Error("Invalid hex color format");
  }

  if (isDark) return getDarkColor(color, level);

  const rgb = hexToRgb(color);
  const lightRgb = rgb.map((value) => Math.floor((255 - value) * level + value));
  return rgbToHex(lightRgb[0]!, lightRgb[1]!, lightRgb[2]!);
}

export function getDarkColor(color: string, level: number): string {
  if (!isValidHexColor(color)) {
    ElMessage.warning("输入错误的hex颜色值");
    throw new Error("Invalid hex color format");
  }

  const rgb = hexToRgb(color);
  const darkRgb = rgb.map((value) => Math.floor(value * (1 - level)));
  return rgbToHex(darkRgb[0]!, darkRgb[1]!, darkRgb[2]!);
}

export function handleElementThemeColor(theme: string, isDark: boolean = false): void {
  applyTheme(generateThemeColors(theme, isDark ? ThemeMode.DARK : ThemeMode.LIGHT));
}

export function setElementThemeColor(color: string, isDark: boolean): void {
  const mixColor = "#ffffff";
  const elStyle = document.documentElement.style;

  elStyle.setProperty("--el-color-primary", color);
  handleElementThemeColor(color, isDark);

  for (let i = 1; i < 16; i++) {
    const itemColor = colourBlend(color, mixColor, i / 16);
    elStyle.setProperty(`--el-color-primary-custom-${i}`, itemColor);
  }
}

// -----------------------------
// Theme utils
// -----------------------------

/** WCAG contrast for solid sRGB colors; shared by theme text and its regression checks. */
export function colorContrast(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = hexToRgb(color).map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function contrastForeground(background: string): string {
  return colorContrast("#ffffff", background) >= colorContrast("#000000", background)
    ? "#ffffff"
    : "#000000";
}

export function generateThemeColors(
  selectedColor: string,
  theme: ThemeMode
): Record<string, string> {
  const isDark = theme === ThemeMode.DARK;
  const surface = isDark ? "#141922" : "#ffffff";
  // Keep the saved brand swatch. Its default action fill has a separate readable pair.
  let primary = selectedColor;
  if (selectedColor.toLowerCase() === "#3b73e8") {
    primary = isDark ? "#6f9bff" : "#3267d6";
  }
  const hover = isDark ? getLightColor(primary, 0.2) : getDarkColor(primary, 0.15);
  const soft = colourBlend(primary, surface, 0.9);
  let text = primary;
  const destination = isDark ? "#ffffff" : "#000000";
  for (
    let step = 1;
    (colorContrast(text, surface) < 4.5 || colorContrast(text, soft) < 4.5) && step <= 10;
    step++
  ) {
    text = colourBlend(primary, destination, step / 10);
  }
  const colors: Record<string, string> = {
    primary,
    "primary-text": text,
    "primary-contrast": contrastForeground(primary),
    "primary-hover-contrast": contrastForeground(hover),
    "primary-dark-2": hover,
  };
  for (let i = 1; i <= 9; i++) {
    colors[`primary-light-${i}`] = colourBlend(primary, surface, i / 10);
  }
  return colors;
}

export function applyTheme(colors: Record<string, string>): void {
  const el = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    el.style.setProperty(`--el-color-${key}`, value);
  });

  requestAnimationFrame(() => {
    el.style.setProperty("--theme-update-trigger", Date.now().toString());
  });
}

export function toggleDarkMode(isDark: boolean): void {
  if (isDark) document.documentElement.classList.add(ThemeMode.DARK);
  else document.documentElement.classList.remove(ThemeMode.DARK);
}

export function toggleSidebarColor(isBlueSidebar: boolean): void {
  if (isBlueSidebar) document.documentElement.classList.add("sidebar-color-blue");
  else document.documentElement.classList.remove("sidebar-color-blue");
}
