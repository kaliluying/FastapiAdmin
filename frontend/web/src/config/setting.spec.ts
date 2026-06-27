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

    const [{ default: AppConfig }, { SETTING_DEFAULT_CONFIG }] = await Promise.all([
      import("./index"),
      import("./setting"),
    ]);

    return { AppConfig, SETTING_DEFAULT_CONFIG };
  }

  it("uses WeComAgent brand and official web defaults", async () => {
    const { AppConfig, SETTING_DEFAULT_CONFIG } = await loadConfig();

    expect(AppConfig.systemInfo.name).toBe("WeComAgent");
    expect(SETTING_DEFAULT_CONFIG.title).toBe("WeComAgent");
    expect(SETTING_DEFAULT_CONFIG.layout).toBe(LayoutMode.LEFT);
    expect(SETTING_DEFAULT_CONFIG.theme).toBe(ThemeMode.LIGHT);
    expect(SETTING_DEFAULT_CONFIG.themeColor).toBe("#4080FF");
    expect(SETTING_DEFAULT_CONFIG.sidebarColorScheme).toBe(SidebarColor.CLASSIC_BLUE);
    expect(SETTING_DEFAULT_CONFIG.menuType).toBe(MenuTypeEnum.LEFT);
    expect(SETTING_DEFAULT_CONFIG.menuThemeType).toBe(MenuThemeEnum.DESIGN);
    expect(SETTING_DEFAULT_CONFIG.showWatermark).toBe(false);
    expect(SETTING_DEFAULT_CONFIG.watermarkVisible).toBe(false);
    expect(SETTING_DEFAULT_CONFIG.aiEnabled).toBe(false);
  });
});
