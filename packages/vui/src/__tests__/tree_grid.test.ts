import { describe, expect, it, vi } from "vitest";
import { h, render } from "vue";
import {
  MetaUi,
  MetaUiField,
  MetaUiGroupLogic,
  SqlDataType,
} from "@mmda/core";
import { UiViewContext } from "../ui/ui_context";
import { UiViewManyKind } from "../ui/ui_view";
import { treeGridSpecFromGroup } from "../ui/ui_tree_grid";
import { TestUiBuilder } from "./test_builder";

const field = (name: string, label: string) =>
  new MetaUiField({
    fieldName: name,
    displayLabel: label,
    fieldIdx: 0,
    dataType: SqlDataType.NVARCHAR,
    nullable: true,
  });

function itemsMetaui(shape: string, shapeKey: string) {
  return new MetaUi({
    objName: "Order",
    displayLabel: "订单",
    groups: [
      {
        groupName: "items",
        groupLabel: "明细",
        many: true,
        relObjName: "OrderItem",
        joinOn: "orderID=@orderID",
        displayShape: shape,
        shapeKey,
        groupUi: {
          objName: "OrderItem",
          displayLabel: "明细",
          primaryKey: "id",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行",
              many: false,
              fields: [field("name", "名称"), field(shapeKey, "键")],
            },
          ],
        },
      },
    ],
  });
}

describe("TreeGrid builder", () => {
  it("子表 TREE + shapeKey 走 factory.treeGrid，全量不分页", () => {
    const metaui = itemsMetaui("TREE", "parentId");
    const context = new UiViewContext({
      model: {
        items: [
          { id: "1", name: "根", parentId: "" },
          { id: "2", name: "子", parentId: "1" },
        ],
      },
      metaui,
      view: "edit",
    });
    let captured: any;
    const builder = new TestUiBuilder();
    builder.factory.treeGrid = (rows, _metaui, props) => {
      captured = { rows, props };
      return h("div", { class: "mmda-tree-grid" });
    };
    builder.buildGroup(metaui.getGroup("items")!, context);
    expect(captured.rows).toHaveLength(2);
    expect(captured.props.treeShape).toBe("TREE");
    expect(captured.props.shapeKey).toBe("parentId");
    expect(captured.props.loadMode).toBe("full");
    expect(captured.props.pagination).toBeUndefined();
    expect(captured.props.idField).toBe("id");
  });

  it("复合主键不当 idField", () => {
    const metaui = itemsMetaui("TREE", "moduleCode");
    const group = metaui.getGroup("items")!;
    Object.defineProperty(group.groupUi!, "primaryKey", {
      value: "roleID,moduleCode",
    });
    const spec = treeGridSpecFromGroup(group);
    expect(spec?.idField).toBe("id");
  });

  it("缺 shapeKey 且无嵌套仍走 factory.table", () => {
    const metaui = itemsMetaui("TREE", "");
    const group = metaui.getGroup("items")!;
    Object.defineProperty(group, "shapeKey", { value: undefined });
    const context = new UiViewContext({
      model: { items: [] },
      metaui,
      view: "edit",
    });
    let used = "none";
    const builder = new TestUiBuilder();
    builder.factory.table = () => {
      used = "table";
      return h("div");
    };
    builder.factory.treeGrid = () => {
      used = "treeGrid";
      return h("div");
    };
    builder.buildGroup(group, context);
    expect(used).toBe("table");
  });

  it("服务端已组装嵌套行即使 LIST 也走 treeGrid", () => {
    const metaui = itemsMetaui("LIST", "");
    const group = metaui.getGroup("items")!;
    const context = new UiViewContext({
      model: {
        items: [
          {
            id: "1",
            name: "根",
            subModuleAuths: [{ id: "2", name: "子" }],
          },
        ],
      },
      metaui,
      view: "details",
    });
    let used = "none";
    let captured: any;
    const builder = new TestUiBuilder();
    builder.factory.table = () => {
      used = "table";
      return h("div");
    };
    builder.factory.treeGrid = (_rows, _metaui, props) => {
      used = "treeGrid";
      captured = props;
      return h("div");
    };
    builder.buildGroup(group, context);
    expect(used).toBe("treeGrid");
    expect(captured.sourceShape).toBe("nested");
    expect(captured.childrenKey).toBe("subModuleAuths");
  });

  it("组 customRenderer 优先于表格", () => {
    const metaui = itemsMetaui("LIST", "");
    const context = new UiViewContext({
      model: { items: [] },
      metaui,
      view: "details",
    });
    const logic = new MetaUiGroupLogic(metaui.getGroup("items")!);
    logic.customRenderer = () => h("div", { class: "mmda-custom-group" }, "bpmn");
    context.setupGroupLogic(logic);
    const host = document.createElement("div");
    render(
      new TestUiBuilder().buildGroup(metaui.getGroup("items")!, context),
      host,
    );
    expect(host.querySelector(".mmda-custom-group")?.textContent).toBe("bpmn");
  });

  it("viewKind treeGrid 走 buildTreeGridView", () => {
    const metaui = new MetaUi({
      objName: "MaterialCat",
      displayLabel: "类别",
      primaryKey: "categoryID",
      groups: [
        {
          groupName: "a1",
          groupLabel: "基本",
          many: false,
          fields: [field("categoryName", "名称")],
        },
      ],
    });
    const context = new UiViewContext({
      model: { list: [{ categoryID: "1", categoryName: "根" }] },
      metaui,
      view: "index",
    });
    (context as any).logic = {
      viewOptions: {
        index: () => ({
          viewKind: UiViewManyKind.treeGrid,
          treeShape: "TREE",
          shapeKey: "parentCatID",
        }),
      },
    };
    const builder = new TestUiBuilder();
    const spy = vi.spyOn(builder, "buildTreeGridView");
    builder.build(context);
    expect(spy).toHaveBeenCalled();
  });
});
