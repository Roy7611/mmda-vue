import { describe, expect, it } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import { MetaUi, MetaUiField, MetaUiFieldLogic, SqlDataType } from "@mmda/core";
import { UiViewContext } from "../ui/ui_context";

const field = (fieldName: string, nullable = true, fieldIdx = 0) =>
  new MetaUiField({
    fieldName,
    displayLabel: fieldName,
    fieldIdx,
    dataType: SqlDataType.NVARCHAR,
    nullable,
  });

const createOrderMetaUi = () => {
  const orderNo = field("orderNo", false);
  const itemName = field("itemName", false);
  const quantity = field("quantity", true, 1);
  const itemMeta = {
    objName: "OrderItem",
    displayLabel: "订单行",
    primaryKey: "id",
    groups: [
      {
        groupName: "a1",
        groupLabel: "订单行",
        many: false,
        fields: [itemName, quantity],
      },
    ],
  };
  const metaui = new MetaUi({
    objName: "Order",
    displayLabel: "订单",
    primaryKey: "id",
    groups: [
      {
        groupName: "a1",
        groupLabel: "订单",
        many: false,
        fields: [orderNo],
      },
      {
        groupName: "items",
        groupLabel: "明细",
        many: true,
        fields: [],
        joinOn: "orderID=@id",
        groupUi: itemMeta,
      },
    ],
  });
  return { metaui, itemName, quantity };
};

describe("UiViewContext", () => {
  it("双向绑定当前实体，并执行该实体的字段逻辑", () => {
    const { metaui } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new UiViewContext({ model, metaui, view: "edit" });

    ctx.setFieldValue("orderNo", "SO-2");

    expect(model.orderNo).toBe("SO-2");
    expect(ctx.getFieldValue("orderNo")).toBe("SO-2");
    expect(ctx.editing).toBe(true);
  });

  it("主表、子表集合和每一行构成独立且可复用的 context 树", () => {
    const { metaui } = createOrderMetaUi();
    const first = { id: "i1", itemName: "A", quantity: 1 };
    const second = { id: "i2", itemName: "B", quantity: 2 };
    const model = { id: "o1", orderNo: "SO-1", items: [first, second] };
    const root = new UiViewContext({ model, metaui, view: "edit" });

    const group = root.subGroupContext("items");
    const firstCtx = root.subGroupItemContext("items", first as any);
    const secondCtx = root.subGroupItemContext("items", second as any);

    expect(group.model).toEqual(model.items);
    expect(firstCtx).toBe(root.subGroupItemContext("items", first as any));
    expect(firstCtx).not.toBe(secondCtx);
    expect(firstCtx.prev).toBe(root);
    expect(secondCtx.root).toBe(root);
  });

  it("每一行独享校验和关联搜索状态，但共享逻辑定义", async () => {
    const { metaui, itemName, quantity } = createOrderMetaUi();
    const first = { id: "i1", itemName: "", quantity: 0 };
    const second = { id: "i2", itemName: "B", quantity: 2 };
    const quantityLogic = new MetaUiFieldLogic<any>(quantity).lockIf(
      (row) => row.quantity === 0,
    );
    const root = new UiViewContext({
      model: { id: "o1", orderNo: "SO-1", items: [first, second] },
      metaui,
      view: "edit",
      fieldLogics: { quantity: quantityLogic },
    });
    const firstCtx = root.subGroupItemContext("items", first as any);
    const secondCtx = root.subGroupItemContext("items", second as any);

    firstCtx.getFieldOptions(itemName).searchParam.searchWord = "first";
    await firstCtx.validate();

    expect(firstCtx.isFieldReadonly(quantity)).toBe(true);
    expect(secondCtx.isFieldReadonly(quantity)).toBe(false);
    expect(firstCtx.getFieldOptions(itemName)).not.toBe(
      secondCtx.getFieldOptions(itemName),
    );
    expect(secondCtx.getFieldOptions(itemName).searchParam.searchWord).not.toBe(
      "first",
    );
    expect(firstCtx.isInvalid(itemName)).toBe(true);
    expect(secondCtx.isInvalid(itemName)).toBe(false);
  });

  it("没有持久化主键的不同新行不会共用 context", () => {
    const { metaui } = createOrderMetaUi();
    const first = { itemName: "A" };
    const second = { itemName: "B" };
    const root = new UiViewContext({
      model: { id: "o1", orderNo: "SO-1", items: [first, second] },
      metaui,
      view: "edit",
    });

    expect(root.subGroupItemContext("items", first as any)).toBe(
      root.subGroupItemContext("items", first as any),
    );
    expect(root.subGroupItemContext("items", first as any)).not.toBe(
      root.subGroupItemContext("items", second as any),
    );
  });

  it("子表增删走 MetaModel 并触发组 onChange", () => {
    const { metaui } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const root = new UiViewContext({ model, metaui, view: "edit" });
    const row = { id: "i1", itemName: "A", quantity: 1, rowNum: "1" } as any;
    root.addSubGroupItem("items", row);
    expect(model.items).toHaveLength(1);
    root.removeSubGroupItem("items", row);
    expect(
      (model.items[0] as { entityState?: number }).entityState,
    ).toBeDefined();
  });

  it("批量字段赋值会校验，重置筛选保留固定 GET 查询参数", () => {
    const { metaui } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new UiViewContext({ model, metaui, view: "edit" });

    ctx.batchSetFieldValue({ orderNo: "  SO-2  " });
    ctx.addQueryParam("ownerID", "u1");
    ctx.addQueryParam("filter", "status='OPEN'");
    expect(model.orderNo).toBe("SO-2");
    expect(ctx.getQueryParam()).toEqual({
      ownerID: "u1",
      filter: "status='OPEN'",
    });

    ctx.resetFilters();
    expect(ctx.getQueryParam()).toEqual({
      ownerID: "u1",
      filter: "status='OPEN'",
    });
  });

  it("routeToRelative 使用 refRepository 路径导航（通用 EntityPages 路由）", () => {
    const packField = new MetaUiField({
      fieldName: "packID",
      displayLabel: "包装规格",
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      selectOptions:
        "HAS_ONE MaterialPackage(packID,packFullName) AS pack",
    });
    const metaui = new MetaUi({
      objName: "MaterialPartner",
      displayLabel: "供货号",
      primaryKey: "id",
      groups: [
        {
          groupName: "a1",
          groupLabel: "供货号",
          many: false,
          fields: [packField],
        },
      ],
    });
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/BASE/:repository/:id", component: { template: "<div/>" } },
      ],
    });
    const ctx = new UiViewContext({
      model: { packID: "25", pack: { packID: "25", packFullName: "塑料" } },
      metaui,
      view: "details",
      app: { name: "base", api: { config: { service: "base" }, http: { baseUrl: "/api" } } } as any,
      logic: { router } as any,
    });

    expect(ctx.routeToRelative(packField)).toBe("/BASE/MaterialPackages/25");
  });

  it("根 context 校验子表每一行并暴露组错误", async () => {
    const { metaui } = createOrderMetaUi();
    const root = new UiViewContext({
      model: {
        id: "o1",
        orderNo: "SO-1",
        items: [{ id: "i1", rowNum: "1", itemName: "", quantity: 1 }],
      },
      metaui,
      view: "edit",
    });

    await expect(root.validate()).resolves.toBe(false);
    expect(root.hasGroupError("items")).toBe(true);
    expect(root.getCacheByID("i1")?.model).toMatchObject({ itemName: "" });
  });
});
