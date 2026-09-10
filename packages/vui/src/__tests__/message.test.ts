import { describe, expect, it, vi } from "vitest";
import { MetaUi, MetaUiField, SqlDataType } from "@mmda/core";
import { VueUiContext } from "../contexts/vue_ui_context";
import { UiViewMany, UiViewOne } from "../contexts/view";
import { TestUiBuilder } from "./test_builder";

describe("uiBuilder.message", () => {
  it("writes pageNotice on one views and does not toast", () => {
    const builder = new TestUiBuilder();
    const toast = vi.spyOn(builder.overlay, "toast");
    const ctx = new VueUiContext({
      model: { id: "1" },
      metaUi: new MetaUi({
        objName: "Item",
        groups: [
          {
            groupName: "base",
            groupLabel: "Base",
            many: false,
            fields: [
              new MetaUiField({
                fieldName: "name",
                displayLabel: "Name",
                fieldIdx: 0,
                dataType: SqlDataType.NVARCHAR,
                nullable: false,
                listed: true,
              }),
            ],
          },
        ],
      }),
      view: UiViewOne.Edit,
    });

    builder.message(ctx, {
      severity: "error",
      content: "必填未填",
    });

    expect(toast).not.toHaveBeenCalled();
    expect(ctx.pageNotice.value?.content).toBe("必填未填");
    expect(ctx.pageNotice.value?.severity).toBe("error");
    expect(ctx.pageNotice.value?.variant).toBe("filled");
    expect(ctx.pageNotice.value?.showCloseIcon).toBe(true);
    expect(ctx.pageNotice.value?.showIcon).toBe(true);
  });

  it("falls back to overlay toast on many views", () => {
    const builder = new TestUiBuilder();
    const toast = vi.spyOn(builder.overlay, "toast");
    const ctx = new VueUiContext({
      model: { list: [], pagination: { pageNo: 1, pageSize: 20, recordCount: 0 } },
      metaUi: new MetaUi({ objName: "Item", groups: [] }),
      view: UiViewMany.Index,
    });

    builder.message(ctx, {
      severity: "warning",
      content: "列表提示",
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "warning",
        message: "列表提示",
      }),
    );
    expect(ctx.pageNotice.value).toBeNull();
  });

  it("module pending notice is consumed once for Edit→Details", async () => {
    const { createModuleContext } = await import("../contexts/vue_module_context");
    const sync = createModuleContext();
    sync.setPendingPageNotice({
      severity: "success",
      content: "保存成功",
      variant: "filled",
    });
    expect(sync.consumePendingPageNotice()?.content).toBe("保存成功");
    expect(sync.consumePendingPageNotice()).toBeNull();
  });
});
