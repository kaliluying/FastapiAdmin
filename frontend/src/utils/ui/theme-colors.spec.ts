import { describe, expect, it } from "vitest";
import { ThemeMode } from "@/enums";
import { colorContrast, generateThemeColors } from "./colors";

describe("theme contrast", () => {
  for (const mode of [ThemeMode.LIGHT, ThemeMode.DARK]) {
    for (const selected of [
      "#3b73e8",
      "#ffcc00",
      "#ef4444",
      "#000000",
      "#ffffff",
      "#777777",
      "#abc",
    ]) {
      it(`keeps action, hover and text readable for ${selected} in ${mode}`, () => {
        const colors = generateThemeColors(selected, mode);
        const surface = mode === ThemeMode.DARK ? "#141922" : "#ffffff";
        expect(colorContrast(colors["primary-contrast"]!, colors.primary!)).toBeGreaterThanOrEqual(
          4.5
        );
        expect(
          colorContrast(colors["primary-hover-contrast"]!, colors["primary-dark-2"]!)
        ).toBeGreaterThanOrEqual(4.5);
        expect(colorContrast(colors["primary-text"]!, surface)).toBeGreaterThanOrEqual(4.5);
        expect(
          colorContrast(colors["primary-text"]!, colors["primary-light-9"]!)
        ).toBeGreaterThanOrEqual(4.5);
        if (selected !== "#3b73e8") expect(colors.primary).toBe(selected);
      });
    }
  }
});
