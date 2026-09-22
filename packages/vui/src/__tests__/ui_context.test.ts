import { describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import { isReactive, isShallow, toRaw } from "vue";
import { isActionEnabled, MetaUi, MetaUiField, MetaUiFieldLogic, MetaUiGroupLogic, SqlDataType, type UiContext, UiViewOne, UiViewMany } from "@mmda/core";
import { VuiContext } from "../contexts/vue_ui_context";
import { TestUiBuilder } from "./test_builder";

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
  const metaUi = new MetaUi({
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
  return { metaUi, itemName, quantity };
};

describe("VuiContext", () => {
  it("实现 core UiContext", () => {
    const { metaUi } = createOrderMetaUi();
    const ctx: UiContext = new VuiContext({
      model: { id: "o1", orderNo: "SO-1", items: [] } as any,
      metaUi,
      view: UiViewOne.Details,
    });
    expect(ctx.model).toEqual({ id: "o1", orderNo: "SO-1", items: [] });
    expect(ctx.displayField("orderNo")).toBe("SO-1");
  });

  it("索引和详情使用浅响应，编辑页保留深层双向绑定", () => {
    const { metaUi } = createOrderMetaUi();
    const details = new VuiContext({
      model: { id: "o1", orderNo: "SO-1", items: [{ itemName: "A" }] } as any,
      metaUi,
      view: UiViewOne.Details,
    });
    const edit = new VuiContext({
      model: { id: "o1", orderNo: "SO-1", items: [{ itemName: "A" }] } as any,
      metaUi,
      view: UiViewOne.Edit,
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
    const metaUi = new MetaUi({
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
    const hidden = new VuiContext({
      model: { id: "1", featuredSku: false, skus: [], features: [] } as any,
      metaUi,
      view: UiViewOne.Details,
    });
    const shown = new VuiContext({
      model: { id: "1", featuredSku: true, skus: [], features: [] } as any,
      metaUi,
      view: UiViewOne.Details,
    });

    expect(hidden.isGroupHidden("skus")).toBe(true);
    expect(hidden.isGroupHidden("features")).toBe(true);
    expect(shown.isGroupHidden("skus")).toBe(false);
    expect(shown.isGroupHidden("features")).toBe(false);
  });

  it("详情 setFieldValue 写入浅模型但不建立深层响应", () => {
    const { metaUi } = createOrderMetaUi();
    const model = {
      id: "o1",
      orderNo: "SO-1",
      items: [{ itemName: "A" }],
    };
    const ctx = new VuiContext<any>({
      model,
      metaUi,
      view: UiViewOne.Details,
    });

    ctx.setFieldValue("orderNo", "SO-2");

    expect(model.orderNo).toBe("SO-2");
    expect(isShallow(ctx.model)).toBe(true);
    expect(isReactive(ctx.model.items)).toBe(false);
  });

  it("详情 in-place setFieldValue 触发 onChange", () => {
    const { metaUi } = createOrderMetaUi();
    let changed = 0;
    const ctx = new VuiContext<any>({
      model: { id: "o1", orderNo: "SO-1", items: [] } as any,
      metaUi,
      view: UiViewOne.Details,
    });
    ctx.setupFieldLogic(
      new MetaUiFieldLogic(metaUi.getField("orderNo")!).onChange(() => {
        changed++;
      }),
    );
    ctx.setFieldValue("orderNo", "SO-2");
    expect(changed).toBe(1);
    expect(ctx.model.orderNo).toBe("SO-2");
  });

  it("索引单元格渲染不创建行上下文", () => {
    const { metaUi } = createOrderMetaUi();
    const row = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new VuiContext({
      model: [row] as any,
      metaUi,
      view: UiViewMany.Index,
    });
    const builder = new TestUiBuilder();

    builder.displayCellFor(metaUi.getField("orderNo")!, row, ctx);

    expect(ctx.contextCount).toBe(1);
  });

  it("详情子表只创建集合上下文，不创建只读行上下文", () => {
    const { metaUi } = createOrderMetaUi();
    const ctx = new VuiContext({
      model: {
        id: "o1",
        orderNo: "SO-1",
        items: [
          { id: "i1", itemName: "A" },
          { id: "i2", itemName: "B" },
        ],
      } as any,
      metaUi,
      view: UiViewOne.Details,
    });

    new TestUiBuilder().buildGroup(metaUi.getGroup("items")!, ctx, []);

    expect(ctx.contextCount).toBe(2);
  });

  it("编辑子表复用既有行上下文，不产生嵌套行上下文", () => {
    const { metaUi } = createOrderMetaUi();
    const ctx = new VuiContext({
      model: {
        id: "o1",
        orderNo: "SO-1",
        items: [
          { id: "i1", itemName: "A" },
          { id: "i2", itemName: "B" },
        ],
      } as any,
      metaUi,
      view: UiViewOne.Edit,
    });

    new TestUiBuilder().buildGroup(metaUi.getGroup("items")!, ctx, []);

    expect(ctx.contextCount).toBe(3);
  });

  it("表格编辑只为 beginEdit 的行创建上下文并可释放", () => {
    const { metaUi } = createOrderMetaUi();
    const row = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new VuiContext<any>({
      model: [row] as any,
      metaUi,
      view: UiViewMany.EditMany,
    });

    const rowContext = ctx.beginEditRow(row);
    expect(toRaw(rowContext.model)).toBe(row);
    expect(ctx.contextCount).toBe(2);

    ctx.endEditRow(row);
    expect(ctx.contextCount).toBe(1);
  });

  it("双向绑定当前实体，并执行该实体的字段逻辑", () => {
    const { metaUi } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new VuiContext<any>({ model, metaUi, view: UiViewOne.Edit });

    ctx.setFieldValue("orderNo", "SO-2");

    expect(model.orderNo).toBe("SO-2");
    expect(ctx.getFieldValue("orderNo")).toBe("SO-2");
    expect(ctx.editing).toBe(true);
  });

  it("主表、子表集合和每一行构成独立且可复用的 context 树", () => {
    const { metaUi } = createOrderMetaUi();
    const first = { id: "i1", itemName: "A", quantity: 1 };
    const second = { id: "i2", itemName: "B", quantity: 2 };
    const model = { id: "o1", orderNo: "SO-1", items: [first, second] };
    const root = new VuiContext<any>({ model, metaUi, view: UiViewOne.Edit });

    const group = root.subGroupContext("items");
    const firstCtx = root.subGroupItemContext("items", first as any);
    const secondCtx = root.subGroupItemContext("items", second as any);

    expect(group.model).toEqual(model.items);
    expect(firstCtx).toBe(root.subGroupItemContext("items", first as any));
    expect(firstCtx).not.toBe(secondCtx);
    expect(firstCtx.parent).toBe(root);
    expect(secondCtx.root).toBe(root);
  });

  it("每一行独享校验和关联搜索状态，但共享逻辑定义", async () => {
    const { metaUi, itemName, quantity } = createOrderMetaUi();
    const first = { id: "i1", itemName: "", quantity: 0 };
    const second = { id: "i2", itemName: "B", quantity: 2 };
    const quantityLogic = new MetaUiFieldLogic<any>(quantity).lockIf(
      (row) => row.quantity === 0,
    );
    const root = new VuiContext({
      model: { id: "o1", orderNo: "SO-1", items: [first, second] } as any,
      metaUi,
      view: UiViewOne.Edit,
      fieldLogics: { quantity: quantityLogic },
    });
    const firstCtx = root.subGroupItemContext("items", first as any);
    const secondCtx = root.subGroupItemContext("items", second as any);

    firstCtx.getFieldSearchOptions(itemName).searchParam.searchWord = "first";
    await firstCtx.validate();

    expect(firstCtx.isFieldReadonly(quantity)).toBe(true);
    expect(secondCtx.isFieldReadonly(quantity)).toBe(false);
    expect(firstCtx.getFieldSearchOptions(itemName)).not.toBe(
      secondCtx.getFieldSearchOptions(itemName),
    );
    expect(secondCtx.getFieldSearchOptions(itemName).searchParam.searchWord).not.toBe(
      "first",
    );
    expect(firstCtx.isInvalid(itemName)).toBe(true);
    expect(secondCtx.isInvalid(itemName)).toBe(false);
  });

  it("没有持久化主键的不同新行不会共用 context", () => {
    const { metaUi } = createOrderMetaUi();
    const first = { itemName: "A" };
    const second = { itemName: "B" };
    const root = new VuiContext({
      model: { id: "o1", orderNo: "SO-1", items: [first, second] } as any,
      metaUi,
      view: UiViewOne.Edit,
    });

    expect(root.subGroupItemContext("items", first as any)).toBe(
      root.subGroupItemContext("items", first as any),
    );
    expect(root.subGroupItemContext("items", first as any)).not.toBe(
      root.subGroupItemContext("items", second as any),
    );
  });

  it("子表增删走 MetaModel 并触发组 onChange", () => {
    const { metaUi } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const root = new VuiContext<any>({ model, metaUi, view: UiViewOne.Edit });
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

  it("子表标准 add/clear 的 canDo 响应 lockIf 与 canDo 叠加", () => {
    const { metaUi } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", locked: false, items: [] };
    const root = new VuiContext<any>({ model, metaUi, view: UiViewOne.Edit });
    const grp = metaUi.getGroup("items")!;
    const logic = new MetaUiGroupLogic(grp);
    logic.canDo("clear", (m: any) => !m.locked);
    root.setupGroupLogic(logic);
    const actions = root.getGroupActions(grp);
    const add = actions.find((a) => a.name === "add")!;
    const clear = actions.find((a) => a.name === "clear")!;
    expect(isActionEnabled(add, model, root)).not.toBe(false);
    expect(isActionEnabled(clear, model, root)).not.toBe(false);
    model.locked = true;
    expect(isActionEnabled(clear, model, root)).toBe(false);
    logic.lock();
    expect(isActionEnabled(add, model, root)).toBe(false);
  });

  it("行删：row.deletable 与 itemDeletableFunc AND；beforeItemRemove 可取消", async () => {
    const { metaUi } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", status: "NEW", items: [] as object[] };
    const root = new VuiContext<any>({ model, metaUi, view: UiViewOne.Edit });
    const grp = metaUi.getGroup("items")!;
    const logic = new MetaUiGroupLogic<any, any>(grp);
    logic.itemDeletable((row, master) => !row.locked && master.status === "NEW");
    let blocked = true;
    logic.beforeItemRemove(() => !blocked);
    root.setupGroupLogic(logic);
    const allowed = { id: "i1", itemName: "A", locked: false } as any;
    const locked = { id: "i2", itemName: "B", locked: true } as any;
    const flagOff = { id: "i3", itemName: "C", deletable: false } as any;
    root.addSubGroupItem("items", allowed);
    root.addSubGroupItem("items", locked);
    root.addSubGroupItem("items", flagOff);
    expect(root.isSubGroupItemDeletable(grp, allowed)).toBe(true);
    expect(root.isSubGroupItemDeletable(grp, locked)).toBe(false);
    expect(root.isSubGroupItemDeletable(grp, flagOff)).toBe(false);
    await root.removeSubGroupItem(grp, allowed);
    expect(model.items).toHaveLength(3);
    blocked = false;
    await root.removeSubGroupItem(grp, allowed);
    expect(
      (model.items[0] as { entityState?: number }).entityState,
    ).toBeDefined();
  });

  it("newSubGroupItem 先入集，对话框取消则移除，确定则保留", async () => {
    const { metaUi } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const dialog = vi
      .fn()
      .mockResolvedValueOnce("cancel")
      .mockResolvedValueOnce("ok");
    const root = new VuiContext<any>({
      model,
      metaUi,
      view: UiViewOne.Edit,
      app: {
        ui: { buildView: () => ({}), dialog, editDialog: dialog },
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
    expect(dialog).toHaveBeenCalledTimes(2);
  });

  it("批量字段赋值会校验，重置筛选保留固定 GET 查询参数", () => {
    const { metaUi } = createOrderMetaUi();
    const model = { id: "o1", orderNo: "SO-1", items: [] as object[] };
    const ctx = new VuiContext<any>({ model, metaUi, view: UiViewOne.Edit });

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
    const metaUi = new MetaUi({
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
    const ctx = new VuiContext({
      model: { packID: "25", pack: { packID: "25", packFullName: "塑料" } } as any,
      metaUi,
      view: UiViewOne.Details,
      app: {
        name: "base",
        api: { config: { service: "base" }, http: { baseUrl: "/api" } },
      } as any,
      logic: { router } as any,
    });

    expect(ctx.routeToRelative(packField)).toBe("/BASE/MaterialPackages/25");
  });

  it("routeToRelative 优先使用 logic.apiService（统一宿主 app.name=base）", () => {
    const orderField = new MetaUiField({
      fieldName: "orderID",
      displayLabel: "工单",
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      selectOptions: "HAS_ONE WorkOrder(orderID,orderNo) AS workOrder",
    });
    const metaUi = new MetaUi({
      objName: "ProductionTask",
      displayLabel: "任务",
      primaryKey: "id",
      groups: [
        {
          groupName: "a1",
          groupLabel: "任务",
          many: false,
          fields: [orderField],
        },
      ],
    });
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/MES/:repository/:id", component: { template: "<div/>" } },
        { path: "/BASE/:repository/:id", component: { template: "<div/>" } },
      ],
    });
    const ctx = new VuiContext({
      model: {
        orderID: "9",
        workOrder: { orderID: "9", orderNo: "WO-9" },
      } as any,
      metaUi,
      view: UiViewOne.Details,
      app: {
        name: "base",
        api: { config: { service: "base" }, http: { baseUrl: "/api" } },
      } as any,
      logic: { router, apiService: "mes" } as any,
    });

    expect(ctx.routeToRelative(orderField)).toBe("/MES/WorkOrders/9");
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
    const metaUi = new MetaUi({
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
    const rows = [
      { packID: "1", packFullName: "纸箱" },
      { packID: "2", packFullName: "托盘" },
    ];
    const searchRelative = vi.fn(async () => ({
      list: rows,
      pagination: { pageSize: 50, pageNo: 1, recordCount: 2 },
    }));
    const getPivotValues = vi.fn();
    const ctx = new VuiContext({
      model: { id: "m1" } as any,
      metaUi,
      view: UiViewMany.Index,
      logic: { searchRelative } as any,
      app: {
        api: {
          getPivotValues,
          config: { repository: "Materials", service: "base" },
        },
      } as any,
    });

    const loaded = await ctx.loadReferenceOptions(packField);
    await expect(ctx.loadReferenceOptions(packField)).resolves.toEqual(loaded);

    expect(packField.reference?.refOptions).toEqual(rows);
    expect(packField.reference?.labelOf(rows[0])).toBe("纸箱");
    expect(packField.reference?.refOptionsComplete).toBe(true);
    expect(ctx.getFieldSearchOptions(packField).selectOptions).toEqual(
      packField.reference?.refOptions,
    );
    expect(searchRelative).toHaveBeenCalledOnce();
    expect((searchRelative.mock.calls[0] as any[])[0].pager.pageSize).toBe(50);
    expect((searchRelative.mock.calls[0] as any[])[1]).toEqual({
      repository: packField.reference?.refRepository,
      service: packField.reference?.service,
    });
    expect(getPivotValues).not.toHaveBeenCalled();
  });

  it("首页未穷尽时标记 incomplete，第二次 load 不请求", async () => {
    const packField = new MetaUiField({
      fieldName: "packID",
      displayLabel: "包装规格",
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      selectOptions: "REF MaterialPackage(packID,packFullName)",
    });
    const metaUi = new MetaUi({
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
    const list = Array.from({ length: 50 }, (_, index) => ({
      packID: String(index),
      packFullName: `规格${index}`,
    }));
    const searchRelative = vi.fn(async () => ({
      list,
      pagination: { pageSize: 50, pageNo: 1, recordCount: 80 },
    }));
    const ctx = new VuiContext({
      model: { id: "m1" } as any,
      metaUi,
      view: UiViewMany.Index,
      logic: { searchRelative } as any,
    });
    await ctx.loadReferenceOptions(packField);
    await ctx.loadReferenceOptions(packField);
    expect(searchRelative).toHaveBeenCalledOnce();
    expect(packField.reference?.refOptions).toHaveLength(50);
    expect(packField.reference?.refOptionsComplete).toBe(false);
  });

  it("有 refOptions 缓存时不请求接口", async () => {
    const packField = new MetaUiField({
      fieldName: "packID",
      displayLabel: "包装规格",
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      selectOptions: "REF MaterialPackage(packID,packFullName)",
    });
    packField.reference!.refOptions.push({ packID: "1", packFullName: "纸箱" });
    const metaUi = new MetaUi({
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
    const searchRelative = vi.fn();
    const getPivotValues = vi.fn();
    const ctx = new VuiContext({
      model: { id: "m1" } as any,
      metaUi,
      view: UiViewMany.Index,
      logic: { searchRelative } as any,
      app: { api: { getPivotValues, searchAll: vi.fn() } } as any,
    });
    await expect(ctx.loadReferenceOptions(packField)).resolves.toEqual([
      { packID: "1", packFullName: "纸箱" },
    ]);
    expect(searchRelative).not.toHaveBeenCalled();
    expect(getPivotValues).not.toHaveBeenCalled();
  });

  it("hasOne 也走首页 50，不调 pivotValues", async () => {
    const material = new MetaUiField({
      fieldName: "matID",
      displayLabel: "物料",
      fieldIdx: 0,
      dataType: SqlDataType.BIGINT,
      nullable: true,
      selectOptions: "HAS_ONE Material(matID,matName) AS material",
    });
    const metaUi = new MetaUi({
      objName: "Order",
      displayLabel: "订单",
      primaryKey: "id",
      groups: [
        {
          groupName: "a1",
          groupLabel: "订单",
          many: false,
          fields: [material],
        },
      ],
    });
    const rows = [{ matID: "M1", matName: "螺丝" }];
    const searchRelative = vi.fn(async () => ({
      list: rows,
      pagination: { pageSize: 50, pageNo: 1, recordCount: 1 },
    }));
    const getPivotValues = vi.fn();
    const ctx = new VuiContext({
      model: { id: "o1" } as any,
      metaUi,
      view: UiViewMany.Index,
      logic: { searchRelative } as any,
      app: { api: { getPivotValues } } as any,
    });
    await expect(ctx.loadReferenceOptions(material)).resolves.toEqual(rows);
    expect(material.reference?.refOptionsComplete).toBe(true);
    expect((searchRelative.mock.calls[0] as any[])[0].pager.pageSize).toBe(50);
    expect((searchRelative.mock.calls[0] as any[])[1].repository).toBe(
      material.reference?.refRepository,
    );
    expect(getPivotValues).not.toHaveBeenCalled();
  });

  it("根 context 校验子表每一行并暴露组错误", async () => {
    const { metaUi } = createOrderMetaUi();
    const root = new VuiContext({
      model: {
        id: "o1",
        orderNo: "SO-1",
        items: [{ id: "i1", rowNum: "1", itemName: "", quantity: 1 }],
      } as any,
      metaUi,
      view: UiViewOne.Edit,
    });

    await expect(root.validate()).resolves.toBe(false);
    expect(root.hasGroupError("items")).toBe(true);
    expect(root.cachedContextByID("i1")?.model).toMatchObject({ itemName: "" });
  });

  it("打开列表时勾选 fallback 过滤，不从元数据拉排序", () => {
    const { metaUi } = createOrderMetaUi();
    const ctx = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
      logic: {},
    } as any);
    ctx.configureSearch([
      {
        filterName: "st",
        filterTitle: "状态",
        fixed: false,
        filterConditions: [
          { displayLabel: "A", condition: "1=1", fallback: true, active: false },
          { displayLabel: "B", condition: "1=0", fallback: false, active: true },
        ],
      },
    ]);
    expect(ctx.filters[0]?.selectedConditions.value.map((item) => item.displayLabel)).toEqual(
      ["A"],
    );
    expect(ctx.searchParam.pager.sorts ?? []).toEqual([]);
  });

  it("列表 pageSize 用全局 mmda/pageSize，不被 lastQuery 覆盖", async () => {
    localStorage.setItem("mmda/pageSize", "200");
    const { metaUi } = createOrderMetaUi();
    const ctx = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
      logic: {
        getLastQuery: async () => ({
          pager: { pageNo: 3, pageSize: 1000 },
          searchWord: "螺丝",
        }),
      },
    } as any);
    ctx.configureSearch([]);
    const { loadLastQuery } = await import("../ui/builder/list_last_query");
    await loadLastQuery(ctx);
    ctx.searchParam.pager.pageSize = 200;
    expect(ctx.searchParam.pager.pageSize).toBe(200);
    expect(ctx.searchParam.pager.pageNo).toBe(3);
    expect(ctx.searchParam.searchWord).toBe("螺丝");
  });

  it("lastQuery 没有 queryID 时不带回列头 filterModel", async () => {
    const { metaUi } = createOrderMetaUi();
    const ctx = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
      logic: {
        getLastQuery: async () => ({
          pager: { pageNo: 1, pageSize: 20 },
          filterModel: {
            status: { filterType: "set", operator: "IN", values: ["OPEN"] },
          },
        }),
      },
    } as any);
    ctx.configureSearch([]);
    const { loadLastQuery } = await import("../ui/builder/list_last_query");
    await loadLastQuery(ctx);
    expect(ctx.searchParam.filterModel).toBeUndefined();
  });

  it("保存过的命名查询 lastQuery 才带回 filterModel", async () => {
    const { metaUi } = createOrderMetaUi();
    const ctx = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
      logic: {
        getLastQuery: async () => ({
          queryID: "q1",
          queryName: "在岗",
          pager: { pageNo: 1, pageSize: 20 },
          filterModel: {
            status: { filterType: "set", operator: "IN", values: ["OPEN"] },
          },
        }),
      },
    } as any);
    ctx.configureSearch([]);
    const { loadLastQuery } = await import("../ui/builder/list_last_query");
    await loadLastQuery(ctx);
    expect(ctx.searchParam.filterModel).toEqual({
      status: { filterType: "set", operator: "IN", values: ["OPEN"] },
    });
    expect(ctx.searchParam.queryID).toBe("q1");
  });
});
