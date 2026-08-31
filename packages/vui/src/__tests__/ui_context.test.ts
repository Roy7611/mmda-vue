import { describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import { isReactive, isShallow, toRaw } from "vue";
import { MetaUi, MetaUiField, MetaUiFieldLogic, SqlDataType } from "@mmda/core";
import { UiViewContext } from "../ui/ui_context";
import { HtmlUiBuilder } from "../ui/ui_html";

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
  it("索引和详情使用浅响应，编辑页保留深层双向绑定", () => {
    const { metaui } = createOrderMetaUi();
    const details = new UiViewContext({
      model: { id: "o1", orderNo: "SO-1", items: [{ itemName: "A" }] },
      metaui,
      view: "details",
    });
    const edit = new UiViewContext({
      model: { id: "o1", orderNo: "SO-1", items: [{ itemName: "A" }] },
      metaui,
      view: "edit",
    });

    expect(isReactive(details.model)).toBe(true);
    expect(isShallow(details.model)).toBe(true);
    expect(isReactive(details.model.items)).toBe(false);
    expect(isShallow(edit.model)).toBe(false);
    expect(isReactive(edit.model.items)).toBe(true);
  });

  it("子表 canHave 按主表字段控制组可见性", () => {
    const itemMeta = {
      objName: "Sku",
      displayLabel: "SKU",
      groups: [
        {
          groupName: "a1",
          groupLabel: "行",
          many: false,
          fields: [field("skuCode")],
        },
      ],
    };
    const metaui = new MetaUi({
      objName: "Material",
      displayLabel: "物料",
      primaryKey: "id",
      groups: [
        {
          groupName: "a1",
          groupLabel: "基本",
          many: false,
          fields: [field("featuredSku")],
        },
        {
          groupName: "skus",
          groupLabel: "SKU",
          many: true,
          canHave: "featuredSku",
          joinOn: "materialID=@id",
          groupUi: itemMeta,
        },
        {
          groupName: "features",
          groupLabel: "特征",
          many: true,
          canHave: "featuredSku",
          joinOn: "materialID=@id",
          groupUi: itemMeta,
        },
      ],
    });
    const hidden = new UiViewContext({
      model: { id: "1", featuredSku: false, skus: [], features: [] },
      metaui,
      view: "details",
    });
    const shown = new UiViewContext({
      model: { id: "1", featuredSku: true, skus: [], features: [] },
      metaui,
      view: "details",
    });

    expect(hidden.isGroupHidden("skus")).toBe(true);
    expect(hidden.isGroupHidden("features")).toBe(true);
    expect(shown.isGroupHidden("skus")).toBe(false);
    expect(shown.isGroupHidden("features")).toBe(false);
  });

  it("详情 setFieldValue 写入浅模型但不建立深层响应", () => {
    const { metaui } = createOrderMetaUi();
    const model = {
      id: "o1",
      orderNo: "SO-1",
      items: [{ itemName: "A" }],
    };
    const ctx = new UiViewContext<any>({
      model,
      metaui,
      view: "details",
    });

    ctx.setFieldValue("orderNo", "SO-2");

    expect(model.orderNo).toBe("SO-2");
    expect(isShallow(ctx.model)).toBe(true);
    expect(isReactive(ctx.model.items)).toBe(false);
  });

  it("详情 in-place setFieldValue 触发 onChange", () => {
    const { metaui } = createOrderMetaUi();
    let changed = 0;
    const ctx = new UiViewContext<any>({
      model: { id: "o1", orderNo: "SO-1", items: [] },
      metaui,
      view: "details",
    });
    ctx.setupFieldLogic(
      new MetaUiFieldLogic(metaui.getField("orderNo")!).onChange(() => {
        changed++;
      }),
    );
    ctx.setFieldValue("orderNo", "SO-2");
    expect(changed).toBe(1);
    expect(ctx.model.orderNo).toBe("SO-2");
  });

  it("索引单元格渲染不创建行上下文", () => {
    const { metaui } = createOrderMetaUi();
    const row = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new UiViewContext({
      model: { list: [row], pagination: {} },
      metaui,
      view: "index",
    });
    const builder = new HtmlUiBuilder();

    builder.displayCellFor(metaui.getField("orderNo")!, row, ctx);

    expect(ctx.contextCount).toBe(1);
  });

  it("详情子表只创建集合上下文，不创建只读行上下文", () => {
    const { metaui } = createOrderMetaUi();
    const ctx = new UiViewContext({
      model: {
        id: "o1",
        orderNo: "SO-1",
        items: [
          { id: "i1", itemName: "A" },
          { id: "i2", itemName: "B" },
        ],
      },
      metaui,
      view: "details",
    });

    new HtmlUiBuilder().buildGroup(metaui.getGroup("items")!, ctx, []);

    expect(ctx.contextCount).toBe(2);
  });

  it("编辑子表复用既有行上下文，不产生嵌套行上下文", () => {
    const { metaui } = createOrderMetaUi();
    const ctx = new UiViewContext({
      model: {
        id: "o1",
        orderNo: "SO-1",
        items: [
          { id: "i1", itemName: "A" },
          { id: "i2", itemName: "B" },
        ],
      },
      metaui,
      view: "edit",
    });

    new HtmlUiBuilder().buildGroup(metaui.getGroup("items")!, ctx, []);

    expect(ctx.contextCount).toBe(4);
  });

  it("表格编辑只为 beginEdit 的行创建上下文并可释放", () => {
    const { metaui } = createOrderMetaUi();
    const row = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new UiViewContext<any>({
      model: [row],
      metaui,
      view: "editMany",
    });

    const rowContext = ctx.beginEdit(row);
    expect(toRaw(rowContext.model)).toBe(row);
    expect(ctx.contextCount).toBe(2);

    ctx.endEdit(row);
    expect(ctx.contextCount).toBe(1);
  });

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
    root.addSubGroupItem("items", row);
    expect(model.items).toHaveLength(1);
    root.removeSubGroupItem("items", row);
    expect(
      (model.items[0] as { entityState?: number }).entityState,
    ).toBeDefined();
  });

  it("newSubGroupItem 先入集，对话框取消则移除，确定则保留", async () => {
    const { metaui } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const confirmDialog = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const root = new UiViewContext({
      model,
      metaui,
      view: "edit",
      app: {
        confirmDialog,
        ui: { buildView: () => ({}) },
      } as any,
    });

    await expect(
      root.newSubGroupItem({
        group: "items",
        target: model,
        creator: (o: object) => o as any,
        source: { id: "i-new", itemName: "N", quantity: 1 },
      }),
    ).resolves.toBe(false);
    expect(model.items).toHaveLength(0);

    const kept = await root.newSubGroupItem({
      group: "items",
      target: model,
      creator: (o: object) => o as any,
      source: { id: "i-ok", itemName: "OK", quantity: 2 },
    });
    expect(kept).toBeTruthy();
    expect(kept).toMatchObject({ itemName: "OK" });
    expect(model.items).toHaveLength(1);
    expect(toRaw(model.items[0])).toBe(toRaw(kept as object));
    expect(confirmDialog).toHaveBeenCalledTimes(2);
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

  it("routeToRelative 使用 refRepository 路径导航（通用 EntityView 路由）", () => {
    const packField = new MetaUiField({
      fieldName: "packID",
      displayLabel: "包装规格",
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      selectOptions: "HAS_ONE MaterialPackage(packID,packFullName) AS pack",
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
      app: {
        name: "base",
        api: { config: { service: "base" }, http: { baseUrl: "/api" } },
      } as any,
      logic: { router } as any,
    });

    expect(ctx.routeToRelative(packField)).toBe("/BASE/MaterialPackages/25");
  });

  it("首次加载 REF 选项并缓存到 refOptions", async () => {
    const packField = new MetaUiField({
      fieldName: "packID",
      displayLabel: "包装规格",
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      selectOptions: "REF MaterialPackage(packID,packFullName)",
    });
    const metaui = new MetaUi({
      objName: "Material",
      displayLabel: "物料",
      primaryKey: "id",
      groups: [
        {
          groupName: "a1",
          groupLabel: "物料",
          many: false,
          fields: [packField],
        },
      ],
    });
    const options = [
      { packID: "1", packFullName: "纸箱" },
      { packID: "2", packFullName: "托盘" },
    ];
    const searchEntities = vi.fn(async () => ({
      list: options,
      pagination: { pageNo: 1, pageSize: 1000, recordCount: 2 },
    }));
    const ctx = new UiViewContext({
      model: { id: "m1" },
      metaui,
      view: "index",
      app: {
        api: { searchEntities },
      } as any,
    });

    await expect(ctx.loadReferenceOptions(packField)).resolves.toEqual(options);
    await expect(ctx.loadReferenceOptions(packField)).resolves.toEqual(options);

    expect(packField.reference?.refOptions).toEqual(options);
    expect(ctx.getFieldOptions(packField).selectOptions).toEqual(
      packField.reference?.refOptions,
    );
    expect(searchEntities).toHaveBeenCalledOnce();
    expect(searchEntities).toHaveBeenCalledWith(
      expect.objectContaining({
        pager: expect.objectContaining({ pageNo: 1, pageSize: 1000 }),
      }),
      {
        repository: "MaterialPackages",
        service: undefined,
      },
    );
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
