import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sidebarSource = readFileSync(resolve(currentDir, "FaSidebar.vue"), "utf-8");

describe("FaSidebar user menu", () => {
  it("does not expose the settings menu action", () => {
    expect(sidebarSource).not.toContain('command="settings"');
    expect(sidebarSource).not.toContain('command === "settings"');
  });

  it("does not expose a footer user actions dropdown", () => {
    expect(sidebarSource).not.toContain("handleUserCommand");
    expect(sidebarSource).not.toContain("user-menu-icon");
    expect(sidebarSource).not.toContain('command="profile"');
    expect(sidebarSource).not.toContain('command="logout"');
  });
});
