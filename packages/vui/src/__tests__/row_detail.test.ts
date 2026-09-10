import { afterEach, describe, expect, it } from "vitest";
import { h, render } from "vue";
import { MetaUi, MetaUiField, MetaUiGroupLogic, SqlDataType } from "@mmda/core";
import { VueUiContext } from "../contexts/vue_ui_context";
import { TestUiBuilder } from "./test_builder";

const hosts: HTMLElement[] = [];

function mount(node: ReturnType<typeof h>) {
  const host = document.createElement("div");
  hosts.push(host);
  document.body.append(host);
  render(node, host);
  return host;
}

afterEach(() => {
  for (const host of hosts) {
    render(null, host);
    host.remove();
  }
  hosts.length = 0;
});

const field = (name: string, label: string) =>
  new MetaUiField({
    fieldName: name,
    displayLabel: label,
    fieldIdx: 0,
    dataType: SqlDataType.NVARCHAR,
    nullable: true,
    listed: true,
  });

function bomLikeMetaUi() {
  return new MetaUi({
    objName: "Bom",
    displayLabel: "BOM",
    primaryKey: "id",
    groups: [
      {
        groupName: "items",
        groupLabel: "物料",
        many: true,
        relObjName: "BomItem",
        joinOn: "bomID=@id",
        groupUi: {
          objName: "BomItem",
          displayLabel: "物料",
          primaryKey: "id",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行",
              many: false,
              fields: [field("name", "名称")],
            },
            {
              groupName: "operations",
              groupLabel: "工序",
              many: true,
              relObjName: "BomItemOperation",
              joinOn: "itemID=@id",
              groupUi: {
                objName: "BomItemOperation",
                displayLabel: "工序",
                primaryKey: "id",
                groups: [
                  {
                    groupName: "a1",
                    groupLabel: "行",
                    many: false,
                    fields: [field("opCode", "工序")],
                  },
                ],
              },
            },
          ],
        },
      },
      {
        groupName: "operations",
        groupLabel: "整表工序",
        many: true,
        relObjName: "BomItemOperation",
        joinOn: "bomID=@id",
        groupUi: {
          objName: "BomItemOperation",
          displayLabel: "工序",
          primaryKey: "id",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行",
              many: false,
              fields: [field("opCode", "工序")],
            },
          ],
        },
      },
    ],
  });
}

describe("Grid rowDetail", () => {
  it("buildGroup 把 operations 接到 items.rowDetail，内层不再嵌套", () => {
    const metaUi = bomLikeMetaUi();
    const items = metaUi.getGroup("items")!;
    const context = new VueUiContext({
      model: {
        items: [
          {
            id: "i1",
            name: "件",
            operations: [{ id: "o1", opCode: "OP10" }],
          },
        ],
        operations: [{ id: "orphan", opCode: "SHOULD-SKIP" }],
      },
      metaUi,
      view: "edit",
    });
    context.setupGroupLogic(new MetaUiGroupLogic(items).rowDetail("operations"));
    let captured: any;
    const builder = new TestUiBuilder();
    const realList = builder.factory.list.bind(builder.factory);
    builder.factory.list = (rows, ui, props) => {
      if ((ui as any).objName === "BomItem") captured = { rows, ui, props };
      return realList(rows, ui, props);
    };
    const node = builder.buildGroup(items, context);
    expect(captured.props.rowDetail?.expandAll).toBe(true);
    expect(typeof captured.props.rowDetail?.detail).toBe("function");
    const host = mount(node);
    expect(host.querySelector("[data-row-detail]")).toBeTruthy();
    expect(captured.props.rowDetail.detail(captured.rows[0])).toBeTruthy();
  });

  it("同屏不要再画被 rowDetail 占用的并列 many 组", () => {
    const metaUi = bomLikeMetaUi();
    const items = metaUi.getGroup("items")!;
    const context = new VueUiContext({
      model: {
        items: [{ id: "i1", name: "件", operations: [] }],
        operations: [{ id: "orphan", opCode: "SHOULD-SKIP" }],
      },
      metaUi,
      view: "edit",
    });
    context.setupGroupLogic(new MetaUiGroupLogic(items).rowDetail("operations"));
    const host = mount(new TestUiBuilder().buildView(context));
    expect(host.textContent).not.toContain("SHOULD-SKIP");
    expect(host.textContent).not.toContain("整表工序");
  });
});
