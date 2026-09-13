import { describe, expect, it } from "vitest";
import {
  createDateSetTree,
  dateSetNodesOf,
  dayTokensOfChecked,
} from "../factory/date_set_tree";

describe("dayTokensOfChecked", () => {
  it("compacts checked day leaves to month tokens", () => {
    const pivot = ["2026-05-01", "2026-05-15", "2026-06-01"];
    expect(
      dayTokensOfChecked(["2026", "2026-05", "2026-05-01", "2026-05-15"], pivot),
    ).toEqual(["2026-05"]);
    expect(
      dayTokensOfChecked(
        ["2026", "2026-05", "2026-05-01", "2026-05-15", "2026-06", "2026-06-01"],
        pivot,
      ),
    ).toEqual(["2026"]);
  });
});

describe("createDateSetTree", () => {
  it("appendTo DropDownTree from a server-sorted year/month/day List<String>", () => {
    const input = document.createElement("input");
    input.className = "flm-input";
    document.body.appendChild(input);
    const { tree, pivotDays, destroy } = createDateSetTree({
      input,
      days: [
        "2025",
        "2025-06",
        "2025-06-13",
        "2025-06-16",
        "2025-07",
        "2025-07-01",
      ],
      monthLabel: "月",
      onChange: () => {},
    });
    expect(pivotDays).toEqual(["2025-06-13", "2025-06-16", "2025-07-01"]);
    expect(tree.element?.classList.contains("e-dropdowntree") || tree.element?.classList.contains("e-ddt")).toBeTruthy();
    destroy();
    input.remove();
  });
});

describe("dateSetNodesOf", () => {
  it("keeps server year/month/day order", () => {
    const { nodes, pivotDays } = dateSetNodesOf(
      ["2025", "2025-06", "2025-06-13", "2025-07", "2025-07-01"],
      "月",
    );
    expect(pivotDays).toEqual(["2025-06-13", "2025-07-01"]);
    expect(nodes[0]?.text).toBe("2025");
    expect(nodes[0]?.children?.map((item) => item.text)).toEqual(["6月", "7月"]);
  });
});
