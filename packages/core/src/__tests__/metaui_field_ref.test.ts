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
  });
});
