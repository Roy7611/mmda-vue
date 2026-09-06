import { describe, expect, it } from "vitest";
import { cleanTableCellProps } from "../ui/factory/factory";

describe("cleanTableCellProps", () => {
  it("strips table-level props such as rowStyle from cell renderer props", () => {
    const rowStyle = () => ({});
    const cleaned = cleanTableCellProps({
      rowStyle,
      showGridlines: true,
      enableSort: false,
      tableMetaui: { objName: "MaterialPartner" },
      class: "mmda-prime-table",
      title: "cell title",
    });

    expect(cleaned).toEqual({ title: "cell title" });
    expect(cleaned).not.toHaveProperty("rowStyle");
    expect(cleaned).not.toHaveProperty("showGridlines");
  });
});
