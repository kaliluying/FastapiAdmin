import { describe, expect, it, vi } from "vitest";
import { MenuThemeEnum, MenuTypeEnum } from "@/enums/appEnum";
import { LayoutMode, SidebarColor, ThemeMode } from "@/enums";

describe("brand and setting defaults", () => {
  async function loadConfig() {
    vi.resetModules();
    vi.stubGlobal("__APP_INFO__", {
      pkg: {
        name: "fastapiadmin",
        version: "3.0.0",
      },
    });
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.doMock("./assets/images", () => ({
      configImages: {
        themeStyles: {
          light: "light.png",
          dark: "dark.png",
          system: "system.png",
        },
        menuLayouts: {
          vertical: "vertical.png",
          horizontal: "horizontal.png",
          mixed: "mixed.png",
          dualColumn: "dual-column.png",
        },
        menuStyles: {
          design: "design.png",
          dark: "dark-menu.png",
          light: "light-menu.png",
        },
      },
    }));
    vi.doMock("./modules/headerBar", () => ({
      headerBarConfig: {},
      default: {},
    }));

    const [{ default: AppConfig }, { SETTING_DEFAULT_CONFIG, themeColorPresets }] = await Promise.all([
      import("./index"),
      import("./setting"),
    ]);

    return { AppConfig, SETTING_DEFAULT_CONFIG, themeColorPresets };
  }

  it("uses generic admin brand and premium console defaults", async () => {
    const { AppConfig, SETTING_DEFAULT_CONFIG, themeColorPresets } = await loadConfig();

    expect(AppConfig.systemInfo.name).toBe("FastAPI Admin");
    expect(SETTING_DEFAULT_CONFIG.title).toBe("FastAPI Admin");
    expect(SETTING_DEFAULT_CONFIG.layout).toBe(LayoutMode.LEFT);
    expect(SETTING_DEFAULT_CONFIG.theme).toBe(ThemeMode.LIGHT);
    expect(SETTING_DEFAULT_CONFIG.themeColor).toBe("#2d7d72");
    expect(themeColorPresets[0]).toBe("#2d7d72");
    expect(SETTING_DEFAULT_CONFIG.sidebarColorScheme).toBe(SidebarColor.CLASSIC_BLUE);
    expect(SETTING_DEFAULT_CONFIG.menuType).toBe(MenuTypeEnum.LEFT);
    expect(SETTING_DEFAULT_CONFIG.menuThemeType).toBe(MenuThemeEnum.DARK);
    expect(SETTING_DEFAULT_CONFIG.showWatermark).toBe(false);
    expect(SETTING_DEFAULT_CONFIG.watermarkVisible).toBe(false);
  });
});
