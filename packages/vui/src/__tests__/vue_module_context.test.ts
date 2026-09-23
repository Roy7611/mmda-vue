import { describe, expect, it, vi } from "vitest";
import { createModuleContext } from "../contexts/vue_module_context";
import type { VuiContext } from "../contexts/vue_ui_context";

describe("createModuleContext", () => {
  it("does not expose revealCurrent; applyCurrentRow only patches the host row", () => {
    const applyRow = vi.fn();
    const insertAtZero = vi.fn();
    const applyRemove = vi.fn();
    const rebind = vi.fn();
    const sync = createModuleContext();
    expect(sync).not.toHaveProperty("revealCurrent");
    const current = { id: "d1", shortName: "旧", rowNum: "7" };
    const context = {
      many: true,
      metaUi: { primaryKey: "id" },
      currentItem: current,
      currentIndex: 6,
      model: [current] as any,
      searchParam: { pager: { pageNo: 1, pageSize: 20, recordCount: 1 } },
      indexTableHost: { applyRow, insertAtZero, applyRemove, rebind },
    } as unknown as VuiContext;
    sync.registerIndex(context);
    sync.applyCurrentRow({ id: "d1", shortName: "新简称" });
    expect(current.shortName).toBe("新简称");
    expect(current.rowNum).toBe("7");
    expect(applyRow).toHaveBeenCalledWith(current);
    expect(insertAtZero).not.toHaveBeenCalled();
  });

  it("applyCurrentRow no-ops after host destroy and works after remount", () => {
    const applyRow = vi.fn();
    const insertAtZero = vi.fn();
    const applyRemove = vi.fn();
    const rebind = vi.fn();
    const sync = createModuleContext();
    const current = { id: "d1", shortName: "旧", rowNum: "7" };
    const context = {
      many: true,
      metaUi: { primaryKey: "id" },
      currentItem: current,
      currentIndex: 0,
      model: [current] as any,
      searchParam: { pager: { pageNo: 1, pageSize: 20, recordCount: 1 } },
      indexTableHost: { applyRow, insertAtZero, applyRemove, rebind },
    } as unknown as VuiContext;
    sync.registerIndex(context);
    context.indexTableHost = undefined;
    sync.applyCurrentRow({ id: "d1", shortName: "离页" });
    expect(current.shortName).toBe("离页");
    expect(applyRow).not.toHaveBeenCalled();
    context.indexTableHost = { applyRow, insertAtZero, applyRemove, rebind };
    sync.applyCurrentRow({ id: "d1", shortName: "回来" });
    expect(applyRow).toHaveBeenCalledWith(current);
    expect(current.shortName).toBe("回来");
  });
});
