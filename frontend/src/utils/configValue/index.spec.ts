import { describe, expect, it } from "vitest";

import { getConfigValue } from "./index";

describe("getConfigValue", () => {
  it("returns the first non-empty config_value among keys", () => {
    const configData = {
      emptyText: { config_value: "   " },
      missingValue: {},
      enabled: { config_value: true },
      laterValue: { config_value: "later" },
    };

    expect(getConfigValue(configData, ["emptyText", "missingValue", "enabled", "laterValue"])).toBe(
      "true",
    );
  });

  it("returns fallback when all keys are missing or empty", () => {
    const configData = {
      emptyText: { config_value: "" },
      blankText: { config_value: "   " },
      nullValue: { config_value: null },
    };

    expect(getConfigValue(configData, ["missingKey", "emptyText", "blankText", "nullValue"], "fallback")).toBe(
      "fallback",
    );
  });

  it("returns fallback when config data is absent", () => {
    expect(getConfigValue(undefined, ["title"], "Admin")).toBe("Admin");
    expect(getConfigValue(null, ["title"], "Admin")).toBe("Admin");
  });
});
