import { describe, expect, it, vi } from "vitest";
import { MetaUi, MetaUiGroup } from "@mmda/core";
import { VuiContext } from "../contexts/vue_ui_context";
import {
  indexTableMetaUi,
  joinListColumnLabel,
  joinListModeMenuItems,
  toggleJoinListMode,
} from "../ui/builder/join_list_mode";
import {
  bumpListLayout,
  snapshotListLayoutRows,
} from "../ui/builder/list_layout";
import { UiViewMany } from "../contexts/view";

function field(name: string) {
  return {
    fieldName: name,
    displayLabel: name,
    fieldIdx: 0,
    dataType: 12,
    nullable: true,
    listed: true,
  };
}

function metaWithJoin(allow = true, requiredAny = true) {
  return new MetaUi({
    objName: "Order",
    displayLabel: "订单",
    primaryKey: "id",
    groups: [
      {
        groupName: "a1",
        groupLabel: "主",
        many: false,
        fields: [field("id")],
      },
      MetaUiGroup.sub({
        groupName: "items",
        groupLabel: "明细",
        relObjName: "Item",
        joinOn: "id=@id",
        requiredAny,
        allowJoinList: allow,
        groupUi: new MetaUi({
          objName: "Item",
          displayLabel: "明细",
          groups: [
            {
              groupName: "a1",
              groupLabel: "明细",
              many: false,
              fields: [field("itemID")],
            },
          ],
        }),
      }),
    ],
  });
}

describe("joinListMode", () => {
  it("没有 hasJoinList 时不出现菜单", () => {
    const metaUi = metaWithJoin(false, true);
    const ctx = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
    });
    ctx.logic = { metaUi } as any;
    expect(joinListModeMenuItems(ctx)).toEqual([]);
  });

  it("Index 且 hasJoinList 时出现菜单；toggle 后切 metaVui", async () => {
    const metaUi = metaWithJoin(true, true);
    const metaVui = new MetaUi({
      objName: "OrderJoin",
      displayLabel: "联查",
      primaryKey: "id,itemID",
      groups: [
        {
          groupName: "a1",
          groupLabel: "联查",
          many: false,
          fields: [field("id"), field("itemID")],
        },
      ],
    });
    const ctx = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
      logic: {
        repository: "Orders",
        apiService: "mes",
        metaUi,
        metaUiService: {
          getViewUi: vi.fn(async () => metaVui),
        },
        getJoinList: vi.fn(async () => ({ list: [], pagination: {} })),
        getAll: vi.fn(async () => ({ list: [], pagination: {} })),
      } as any,
    });
    const items = joinListModeMenuItems(ctx);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("joinListMode");
    expect(items[0].icon).toBeUndefined();
    expect(indexTableMetaUi(ctx)).toBe(metaUi);

    await toggleJoinListMode(ctx);
    expect(ctx.joinListMode).toBe(true);
    expect(indexTableMetaUi(ctx)).toBe(metaVui);
    expect(joinListModeMenuItems(ctx)[0].icon).toBe("check");
    expect(ctx.logic?.getJoinList).toHaveBeenCalled();
  });

  it("joinListColumnLabel 联查表头保留点，设置不截", () => {
    expect(joinListColumnLabel("移料清单.规格")).toBe(".规格");
    expect(joinListColumnLabel({ displayLabel: "移料清单.规格" })).toBe(".规格");
    expect(joinListColumnLabel("移料清单.规格", false)).toBe("移料清单.规格");
    expect(joinListColumnLabel("状态")).toBe("状态");
    expect(joinListColumnLabel("状态", false)).toBe("状态");
  });

  it("联查设置 snapshot 用 metaVui 全名，bump 刷新联查列", async () => {
    const metaUi = metaWithJoin(true, true);
    const metaVui = new MetaUi({
      objName: "OrderJoin",
      displayLabel: "联查",
      primaryKey: "id,itemID",
      groups: [
        {
          groupName: "a1",
          groupLabel: "联查",
          many: false,
          fields: [
            { ...field("id"), displayLabel: "标识", listed: true, fieldIdx: 0 },
            {
              ...field("spec"),
              displayLabel: "移料清单.规格",
              listed: true,
              fieldIdx: 1,
            },
          ],
        },
      ],
    });
    const ctx = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
      logic: {
        repository: "Orders",
        apiService: "mes",
        metaUi,
        metaUiService: {
          getViewUi: vi.fn(async () => metaVui),
        },
        getJoinList: vi.fn(async () => ({ list: [], pagination: {} })),
        getAll: vi.fn(async () => ({ list: [], pagination: {} })),
      } as any,
    });
    await toggleJoinListMode(ctx);
    const rows = snapshotListLayoutRows(indexTableMetaUi(ctx));
    expect(rows.map((row) => row.fieldName)).toEqual(["id", "spec"]);
    expect(rows.find((row) => row.fieldName === "spec")?.displayLabel).toBe(
      "移料清单.规格",
    );
    expect(snapshotListLayoutRows(ctx.metaUi).map((row) => row.fieldName)).toEqual(
      ["id"],
    );
    const listed = indexTableMetaUi(ctx).getListedFields();
    listed[1]!.listed = false;
    bumpListLayout(ctx);
    expect(
      indexTableMetaUi(ctx)
        .getListedFields()
        .map((item) => item.fieldName),
    ).toEqual(["id"]);
  });
});
