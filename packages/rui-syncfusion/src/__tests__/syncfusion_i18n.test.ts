import { describe, expect, it } from "vitest";
import { resolveSyncfusionCulture } from "../syncfusion_i18n";

describe("resolveSyncfusionCulture", () => {
  it("maps MMDA locales to EJ2 cultures", () => {
    expect(resolveSyncfusionCulture("zh")).toBe("zh-Hans");
    expect(resolveSyncfusionCulture("zh-CN")).toBe("zh-Hans");
    expect(resolveSyncfusionCulture("zh-Hant")).toBe("zh-Hant");
    expect(resolveSyncfusionCulture("zh-TW")).toBe("zh-Hant");
    expect(resolveSyncfusionCulture("en")).toBe("en-US");
  });
});
