import { describe, expect, it } from "vitest";
import baseEn from "../../../base/src/locales/en";
import baseZhHant from "../../../base/src/locales/zh-Hant";
import baseZh from "../../../base/src/locales/zh";
import mesEn from "../../../mes/src/locales/en";
import mesZhHant from "../../../mes/src/locales/zh-Hant";
import mesZh from "../../../mes/src/locales/zh";
import vuiEn from "../../../vui/src/i18n/locales/en";
import vuiZhHant from "../../../vui/src/i18n/locales/zh-Hant";
import vuiZh from "../../../vui/src/i18n/locales/zh";
import { mergeLocaleMessages, type LocaleMessages } from "../i18n";

function flattenKeys(messages: LocaleMessages, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? flattenKeys(value as LocaleMessages, path)
      : [path];
  });
}

function valueAt(messages: LocaleMessages, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        typeof value === "object" && value !== null
          ? (value as LocaleMessages)[key]
          : undefined,
      messages,
    );
}

describe("locale ownership", () => {
  it.each([
    ["zh", vuiZh, baseZh, mesZh],
    ["en", vuiEn, baseEn, mesEn],
    ["zh-Hant", vuiZhHant, baseZhHant, mesZhHant],
  ])("%s has no duplicate leaf keys across packages", (_, vui, base, mes) => {
    const groups = [flattenKeys(vui), flattenKeys(base), flattenKeys(mes)];

    for (let left = 0; left < groups.length; left += 1) {
      for (let right = left + 1; right < groups.length; right += 1) {
        const rightKeys = new Set(groups[right]);
        expect(groups[left].filter((key) => rightKeys.has(key))).toEqual([]);
      }
    }
  });

  it("keeps representative messages in their owning packages", () => {
    expect(valueAt(vuiZh, "matcher.EQ")).toBe("等于");
    expect(valueAt(vuiZh, "auth.signin")).toBe("登录");
    expect(valueAt(vuiZh, "ganttLabel.Daily")).toBeUndefined();
    expect(valueAt(vuiZh, "auth.agedaccountreceivable")).toBeUndefined();

    expect(valueAt(baseZh, "auth.agedaccountreceivable")).toBe("应收账龄");
    expect(valueAt(baseZh, "moduleLabel.base")).toBe("基础数据");

    expect(valueAt(mesZh, "ganttLabel.Daily")).toBe("按日");
    expect(valueAt(mesZh, "stationlabel.reportwork")).toBe("报工");
    expect(valueAt(mesZh, "model.ProductCode")).toBe("制品编码");
  });
});

describe("mergeLocaleMessages", () => {
  it("combines package messages recursively without mutating inputs", () => {
    const merged = mergeLocaleMessages(baseZh, mesZh);

    expect(valueAt(merged, "invalid.requiredPartners")).toBe(
      "不能添加相同的贸易伙伴",
    );
    expect(valueAt(merged, "invalid.requiredTools")).toBe("不能添加相同的工具");
    expect(valueAt(baseZh, "invalid.requiredTools")).toBeUndefined();
    expect(valueAt(mesZh, "invalid.requiredPartners")).toBeUndefined();
  });
});
