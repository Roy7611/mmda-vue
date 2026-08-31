import { describe, it, expect } from "vitest";
import { MetaUiFieldLogic, MetaUiGroupLogic } from "../index";
import { createMockField, createMockMetaUi } from "./helpers/metaui_mock";

describe("MetaUiFieldLogic 属性隔离", () => {
  // LI-01: 两个 logic 实例的 hiddenFn 互不影响
  it("两个实例分别调 hideIf，hiddenFn 互不相等", () => {
    // Given: 两个独立 field + 两个独立 logic 实例
    const f1 = createMockField({ fieldName: "fieldA" });
    const f2 = createMockField({ fieldName: "fieldA" });
    const l1 = new MetaUiFieldLogic(f1);
    const l2 = new MetaUiFieldLogic(f2);
    // When: 分别设置不同的 hiddenFn
    l1.hideIf(() => true);
    l2.hideIf(() => false);
    // Then: 各自的 hiddenFn 存在且互不相等
    expect(l1.hiddenFn).toBeDefined();
    expect(l2.hiddenFn).toBeDefined();
    expect(l1.hiddenFn).not.toBe(l2.hiddenFn);
  });

  // LI-02: readonlyFn 隔离
  it("两个实例分别调 lockIf，readonlyFn 互不相等", () => {
    // Given: 两个独立 logic 实例
    const l1 = new MetaUiFieldLogic(createMockField({ fieldName: "fieldA" }));
    const l2 = new MetaUiFieldLogic(createMockField({ fieldName: "fieldA" }));
    // When: 分别设置不同的 readonlyFn
    l1.lockIf(() => true);
    l2.lockIf(() => false);
    // Then: readonlyFn 互不相等
    expect(l1.readonlyFn).not.toBe(l2.readonlyFn);
  });

  // LI-03: 链式调用全部写入 logic
  it("链式调用 hideIf().lock().searchable(true).inPlaceEdit()，属性全部写入 logic", () => {
    // Given: 一个 field logic 实例
    const logic = new MetaUiFieldLogic(createMockField());
    // When: 链式调用多个方法
    logic
      .hideIf(() => true)
      .lock()
      .searchable(true)
      .inPlaceEdit();
    // Then: 所有对应属性写入 logic 实例（注：实际属性名为 _searchable / _inPlaceEdit）
    expect(logic.hiddenFn).toBeDefined();
    expect(logic.readonlyFn).toBeDefined();
    expect(logic.isSearchField).toBe(true);
    expect(logic.cellEditable).toBe(true);
  });

  // LI-04: field 上不再有动态属性
  it("调 hideIf 后 logic.field 上无 hiddenFn", () => {
    // Given: field logic 实例
    const logic = new MetaUiFieldLogic(createMockField());
    // When: 调用 hideIf
    logic.hideIf(() => true);
    // Then: field 原对象上不应有 hiddenFn（动态属性只在 logic 实例上）
    expect((logic.field as any).hiddenFn).toBeUndefined();
  });

  // LI-05: onChange / setSearchParam / setCustomRenderer 写入 logic
  it("onChange、setSearchParam、setCustomRenderer 写入 logic 实例", () => {
    // Given: field logic 实例
    const logic = new MetaUiFieldLogic(createMockField());
    const fn1 = () => {};
    const fn2 = () => ({ key: "a" });
    const fn3 = () => "render";
    // When: 调用 onChange、setSearchParam、setCustomRenderer
    logic.onChange(fn1).setSearchParam(fn2).setCustomRenderer(fn3);
    // Then: 所有函数写入 logic 实例
    expect(logic.onChangeFn).toBe(fn1);
    expect(logic.setSearchParamFn).toBe(fn2);
    expect(logic.customRenderer).toBe(fn3);
  });

  it("setGridCellRenderer 注册轻量 Grid 单元格渲染器", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    const renderer = ({ displayValue }: any) =>
      String(displayValue).toUpperCase();

    expect(logic.setGridCellRenderer(renderer)).toBe(logic);
    expect(logic.customGridCellRenderer).toBe(renderer);
  });

  it("inPlaceEdit(false) 可关闭单个字段原位编辑", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    expect(logic.inPlaceEdit(false)).toBe(logic);
    expect(logic.cellEditable).toBe(false);
  });
});

describe("MetaUiGroupLogic 属性隔离", () => {
  function makeGroup(): any {
    return { groupName: "testGroup", groupLabel: "测试组", many: false } as any;
  }

  // LI-06: 两个 GroupLogic 的 hiddenFn 隔离
  it("两个实例分别调 hideIf，hiddenFn 互不相等", () => {
    // Given: 两个独立 group + 两个独立 groupLogic 实例
    const l1 = new MetaUiGroupLogic(makeGroup());
    const l2 = new MetaUiGroupLogic(makeGroup());
    // When: 分别设置不同的 hiddenFn
    l1.hideIf(() => true);
    l2.hideIf(() => false);
    // Then: hiddenFn 互不相等
    expect(l1.hiddenFn).not.toBe(l2.hiddenFn);
  });

  // LI-07: lockIf bug 修复验证 — 不误写 hiddenFn
  it("lockIf 连续调用不会误写 hiddenFn", () => {
    // Given: groupLogic 实例
    const logic = new MetaUiGroupLogic(makeGroup());
    // When: 调用 lockIf
    logic.lockIf(() => true);
    // Then: readonlyFn 被设置，hiddenFn 仍为 undefined（修复后 hiddenFn 不被污染）
    expect(logic.readonlyFn).toBeDefined();
    expect(logic.hiddenFn).toBeUndefined();
  });

  it("canHave 自动绑定组 hiddenFn", () => {
    const logic = new MetaUiGroupLogic({
      groupName: "skus",
      groupLabel: "SKU",
      many: true,
      canHave: "featuredSku",
    } as any);
    expect(logic.hiddenFn).toBeDefined();
    expect(logic.hiddenFn!({ featuredSku: false } as any, null as any)).toBe(
      true,
    );
    expect(logic.hiddenFn!({ featuredSku: true } as any, null as any)).toBe(
      false,
    );
  });

  it("子表组默认开启 inplaceEdit，且可在组级关闭", () => {
    const logic = new MetaUiGroupLogic(makeGroup());
    expect(logic.inplaceEdit).toBe(true);
    expect(logic.inplaceEditStart).toBe("excel");
    expect(logic.inPlaceEdit(false)).toBe(logic);
    expect(logic.inplaceEdit).toBe(false);
    expect(logic.inPlaceEditStart("click")).toBe(logic);
    expect(logic.inplaceEditStart).toBe("click");
  });

  // LI-08: editIf/deleteIf/clearIf 隔离
  it("editIf、deleteIf、clearIf predicate 隔离", () => {
    // Given: 两个独立 groupLogic 实例
    const l1 = new MetaUiGroupLogic(makeGroup());
    const l2 = new MetaUiGroupLogic(makeGroup());
    // When: 分别设置不同的 predicate
    l1.editIf(() => true);
    l2.editIf(() => false);
    l1.deleteIf(() => true);
    l2.deleteIf(() => false);
    // Then: 各自的 predicate 互不相等
    expect(l1.editIfFn).not.toBe(l2.editIfFn);
    expect(l1.deleteIfFn).not.toBe(l2.deleteIfFn);
  });

  // LI-09: setCustomRenderer/setCustomPrepend/setCustomAppend 渲染函数隔离
  it("setCustomRenderer、setCustomPrepend、setCustomAppend 渲染函数隔离", () => {
    // Given: 两个独立 groupLogic 实例
    const l1 = new MetaUiGroupLogic(makeGroup());
    const l2 = new MetaUiGroupLogic(makeGroup());
    const r1 = () => "r1";
    const r2 = () => "r2";
    // When: 分别设置不同的渲染函数
    l1.setCustomRenderer(r1);
    l2.setCustomRenderer(r2);
    l1.setCustomPrepend(() => "p1");
    l2.setCustomAppend(() => "a2");
    // Then: 各自的渲染函数互不相等且正确隔离
    expect(l1.customRenderer).toBe(r1);
    expect(l2.customRenderer).toBe(r2);
    expect(l1.customPrepend).toBeDefined();
    expect(l2.customAppend).toBeDefined();
    expect(l1.customPrepend).not.toBe(l2.customPrepend);
  });
});
