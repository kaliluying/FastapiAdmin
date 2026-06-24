import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("FaLoginAccountForm", () => {
  it("renders only account/password login entry points", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/views/fa-login/forms/FaLoginAccountForm.vue"),
      "utf-8",
    );

    expect(source).not.toContain("FaLoginThirdPartySection");
    expect(source).not.toContain("login.mobileLogin");
    expect(source).not.toContain("login.qrLogin");
    expect(source).not.toContain("openMobile");
    expect(source).not.toContain("openQr");
    expect(source).not.toContain("oauth");
    expect(source).not.toContain("captchaState");
    expect(source).not.toContain("getCaptcha");
    expect(source).not.toContain("FaDragVerify");
    expect(source).not.toContain("dragVerify");
    expect(source).not.toContain("sliderText");
  });

  it("keeps the login card height content-driven", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/views/fa-login/_fa-login.scss"),
      "utf-8",
    );

    expect(source).not.toContain("height: 670px");
    expect(source).toContain("max-height: calc(100dvh - 9rem)");
  });
});
