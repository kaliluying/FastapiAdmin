import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pages = [
  "views/module_system/user/index.vue",
  "views/module_system/role/index.vue",
  "views/module_system/dept/index.vue",
  "views/module_system/dict/index.vue",
  "views/module_system/params/index.vue",
  "views/module_system/log/index.vue",
  "views/module_platform/menu/index.vue",
];

describe("management page contract", () => {
  for (const page of pages) {
    it(`${page} uses the operational page shell`, () => {
      const source = readFileSync(resolve(__dirname, "..", page), "utf-8");
      expect(source).toContain("<FaPageHeader");
      expect(source).toContain("fa-management-page");
    });
  }
});
