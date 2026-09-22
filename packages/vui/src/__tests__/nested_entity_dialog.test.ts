import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { MetaUi, MetaUiField, SqlDataType } from "@mmda/core";
import { VuiContext } from "../contexts/vue_ui_context";
import { UiViewMany } from "../contexts/view";
import { TestUiBuilder } from "./test_builder";

const listMeta = new MetaUi({
  objName: "MaterialCat",
  displayLabel: "物料类别",
  primaryKey: "id",
  groups: [
    {
      groupName: "base",
      groupLabel: "基本",
      many: false,
      fields: [
        new MetaUiField({
          fieldName: "categoryName",
          displayLabel: "名称",
          fieldIdx: 0,
          dataType: SqlDataType.NVARCHAR,
          nullable: true,
          listed: true,
        }),
      ],
    },
  ],
});

describe("nested entity dialog", () => {
  it("isInDialog 时 create/edit/details 走 openNestEntityDialog，不 routeTo", () => {
    const openNestEntityDialog = vi.fn(async () => ({
      action: "cancel" as const,
    }));
    const routeTo = vi.fn();
    const ctx = new VuiContext({
      model: [] as any,
      metaUi: listMeta,
      view: UiViewMany.SelectOne,
      app: {
        ui: { openNestEntityDialog },
        i18n: { global: { t: (k: string) => k } },
      } as any,
    });
    ctx.isInDialog = true;
    ctx.navigate = routeTo as any;

    ctx.routeToCreate();
    expect(openNestEntityDialog).toHaveBeenCalledWith(ctx, "create");
    expect(routeTo).not.toHaveBeenCalled();

    openNestEntityDialog.mockClear();
    ctx.routeToEdit({ id: "e1", categoryName: "A" } as any);
    expect(openNestEntityDialog).toHaveBeenCalledWith(ctx, "edit", {
      id: "e1",
      categoryName: "A",
    });
    expect(routeTo).not.toHaveBeenCalled();

    openNestEntityDialog.mockClear();
    ctx.routeToDetails({ id: "e1", categoryName: "A" });
    expect(openNestEntityDialog).toHaveBeenCalledWith(ctx, "details", {
      id: "e1",
      categoryName: "A",
    });
    expect(routeTo).not.toHaveBeenCalled();
  });

  it("非对话框 create 仍 routeTo", () => {
    const routeTo = vi.fn();
    const openNestEntityDialog = vi.fn();
    const ctx = new VuiContext({
      model: [] as any,
      metaUi: listMeta,
      view: UiViewMany.Index,
      app: {
        ui: { openNestEntityDialog },
        i18n: { global: { t: (k: string) => k } },
      } as any,
    });
    ctx.isInDialog = false;
    ctx.navigate = routeTo as any;
    ctx.routeToCreate();
    expect(routeTo).toHaveBeenCalledWith(expect.stringContaining("/Create"));
    expect(openNestEntityDialog).not.toHaveBeenCalled();
  });

  it("selectDialog 标题按单选统一，SearchBar 在工具栏不在标题栏", async () => {
    const builder = new TestUiBuilder();
    const searchbar = vi.fn(() => h("div", { class: "mmda-searchbar" }));
    builder.buildModuleSearchbar = searchbar as any;
    const dialog = vi.fn(async () => "cancel" as const);
    builder.dialog = dialog as any;

    const ctx = new VuiContext({
      model: [] as any,
      metaUi: listMeta,
      view: UiViewMany.SelectOne,
      app: {
        ui: builder,
        i18n: {
          global: {
            t: (k: string, p?: { entity?: string }) =>
              k === "view.selectOneEntity"
                ? `选择一个${p?.entity ?? ""}`
                : k,
          },
        },
      } as any,
    });
    ctx.search = vi.fn(async () => undefined) as any;

    await builder.selectDialog(ctx, {
      viewProps: { selectionMode: "single", showSearchbar: true },
    });

    expect(dialog).toHaveBeenCalled();
    const dlgProps = (dialog.mock.calls[0] as any[])[2] as any;
    expect(dlgProps.header).toBeUndefined();
    expect(String(dlgProps.title)).toMatch(/选择一个/);
    expect(searchbar).not.toHaveBeenCalled();
  });

  it("openNestEntityDialog ok 后刷新 parent 并勾选该行", async () => {
    const saved = { id: "n1", categoryName: "新建" };
    const builder = new TestUiBuilder();
    const parent = new VuiContext({
      model: [] as any,
      metaUi: listMeta,
      view: UiViewMany.SelectOne,
      app: {
        ui: builder,
        i18n: { global: { t: (k: string) => k } },
      } as any,
      logic: {
        delete: vi.fn(async () => undefined),
        createEntity: (s: object) => ({ ...s }),
        applyTo: async () => undefined,
        initMetadata: async () => ({ metaUi: listMeta, filters: [] }),
        get: async () => saved,
        save: async () => saved,
        beforeSearch: () => undefined,
        getAll: async () => ({
          list: [saved],
          pagination: { pageNo: 1, pageSize: 20, recordCount: 1 },
        }),
      } as any,
    });
    parent.search = vi.fn(async () => {
      (parent.model as any).list = [saved];
    }) as any;
    parent.selectedItems = [];

    builder.editDialog = vi.fn(async (child: any) => {
      Object.assign(child.model, saved);
      return "ok" as const;
    }) as any;

    // create 会走 init；stub 掉避免缺 API
    const initSpy = vi
      .spyOn(VuiContext.prototype, "init")
      .mockResolvedValue(undefined as any);

    try {
      const result = await builder.openNestEntityDialog(parent, "create");
      expect(result.action).toBe("ok");
      expect(parent.search).toHaveBeenCalled();
      expect(parent.selectedItems).toEqual([saved]);
    } finally {
      initSpy.mockRestore();
    }
  });
});
