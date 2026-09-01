import { describe, expect, it } from "vitest";
import {
  MATERIAL_SYMBOL_PREFIX,
  createIconVNode,
  isMaterialSymbol,
  mergeIconClass,
} from "../ui/ui_icon";

describe("ui_icon", () => {
  it("merges icon and extra classes", () => {
    expect(mergeIconClass("e-icons e-spacing-after", "extra")).toBe(
      "e-icons e-spacing-after extra",
    );
  });

  it("renders material symbol ligatures", () => {
    const vnode = createIconVNode(`${MATERIAL_SYMBOL_PREFIX}drag_indicator`, {
      class: "mmda-list-setting__drag-handle",
    });
    expect(isMaterialSymbol(`${MATERIAL_SYMBOL_PREFIX}drag_indicator`)).toBe(
      true,
    );
    expect(vnode.type).toBe("span");
    expect(vnode.props?.class).toContain("material-symbols-outlined");
    expect(vnode.props?.class).toContain("mmda-list-setting__drag-handle");
    expect(vnode.children).toBe("drag_indicator");
  });

  it("keeps font icon classes on i elements", () => {
    const vnode = createIconVNode("e-icons e-spacing-before", {
      class: "extra",
    });
    expect(vnode.type).toBe("i");
    expect(vnode.props?.class).toBe("e-icons e-spacing-before extra");
  });
});
