import { describe, expect, it } from "vitest";
import { MetaUiFieldRef } from "../metaui/metaui_field";

describe("MetaUiFieldRef pipe enum", () => {
  it("parses value;code;label so valueOf is code and labelOf is text", () => {
    const reference = MetaUiFieldRef.parse(
      "0;LABOR;劳动力|64;CONSUMABLE;办公用品",
    )!;
    expect(reference.refFlds).toEqual(["code", "label"]);
    expect(reference.valueOf(reference.refOptions[0])).toBe("LABOR");
    expect(reference.labelOf(reference.refOptions[0])).toBe("劳动力");
    expect(reference.valueOf(reference.refOptions[1])).toBe("CONSUMABLE");
    expect(reference.labelOf(reference.refOptions[1])).toBe("办公用品");
    const negative = MetaUiFieldRef.parse(
      "0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用",
    )!;
    expect(negative.valueOf(negative.refOptions[1])).toBe("USED");
    expect(negative.labelOf(negative.refOptions[1])).toBe("已启用");
    expect(negative.refOptions[2].value).toBe(-1);
    expect(negative.valueOf(negative.refOptions[2])).toBe("DEPRECATED");
  });

  it("JSON selectOptions labelOf 认 text 或 label", () => {
    const byText = MetaUiFieldRef.parse(
      JSON.stringify([{ id: 1, value: "USED", text: "已启用" }]),
    )!;
    expect(byText.valueOf(byText.refOptions[0])).toBe("USED");
    expect(byText.labelOf(byText.refOptions[0])).toBe("已启用");
    const byLabel = MetaUiFieldRef.parse(
      JSON.stringify([{ id: -1, value: "DEPRECATED", label: "已弃用" }]),
    )!;
    expect(byLabel.valueOf(byLabel.refOptions[0])).toBe("DEPRECATED");
    expect(byLabel.labelOf(byLabel.refOptions[0])).toBe("已弃用");
  });
});
