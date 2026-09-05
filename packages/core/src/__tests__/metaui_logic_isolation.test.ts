import { describe, it, expect } from "vitest";
import { MetaUiFieldLogic, MetaUiGroupLogic } from "../index";
import { createMockField } from "./helpers/metaui_mock";

describe("MetaUiFieldLogic 属性隔离", () => {
  it("两个实例分别调 hideIf，hiddenFn 互不相等", () => {
    const f1 = createMockField({ fieldName: "fieldA" });
    const f2 = createMockField({ fieldName: "fieldA" });
    const l1 = new MetaUiFieldLogic(f1);
    const l2 = new MetaUiFieldLogic(f2);
    l1.hideIf(() => true);
    l2.hideIf(() => false);
    expect(l1.hiddenFn).toBeDefined();
    expect(l2.hiddenFn).toBeDefined();
    expect(l1.hiddenFn).not.toBe(l2.hiddenFn);
  });

  it("两个实例分别调 lockIf，readonlyFn 互不相等", () => {
    const l1 = new MetaUiFieldLogic(createMockField({ fieldName: "fieldA" }));
    const l2 = new MetaUiFieldLogic(createMockField({ fieldName: "fieldA" }));
    l1.lockIf(() => true);
    l2.lockIf(() => false);
    expect(l1.readonlyFn).not.toBe(l2.readonlyFn);
  });

  it("链式调用 hideIf().lock().inplaceEdit()，属性全部写入 logic", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    logic.hideIf(() => true).lock().inplaceEdit();
    expect(logic.hiddenFn).toBeDefined();
    expect(logic.readonlyFn).toBeDefined();
    expect(logic.inplaceEditable).toBe(true);
  });

  it("调 hideIf 后 logic.field 上无 hiddenFn", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    logic.hideIf(() => true);
    expect((logic.field as any).hiddenFn).toBeUndefined();
  });

  it("onChange、setCustomRenderer 写入 logic 实例", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    const fn1 = () => {};
    const fn3 = () => "render";
    logic.onChange(fn1).setCustomRenderer(fn3);
    expect(logic.onChangeFn).toBe(fn1);
    expect(logic.customRenderer).toBe(fn3);
  });

  it("setCustomCellEditor 注册表格单元格编辑器", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    const editor = (): null => null;

    expect(logic.setCustomCellEditor(editor)).toBe(logic);
    expect(logic.customCellEditor).toBe(editor);
  });

  it("inplaceEdit(false) 可关闭单个字段原位编辑", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    expect(logic.inplaceEdit(false)).toBe(logic);
    expect(logic.inplaceEditable).toBe(false);
  });

  it("lockIf 连续调用 OR 叠加", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    logic.lockIf((m: { a?: boolean }) => !!m.a).lockIf((m: { b?: boolean }) => !!m.b);
    expect(logic.readonlyFn?.({ a: true, b: false } as any)).toBe(true);
    expect(logic.readonlyFn?.({ a: false, b: true } as any)).toBe(true);
    expect(logic.readonlyFn?.({ a: false, b: false } as any)).toBe(false);
  });

  it("hideIf 连续调用 OR 叠加", () => {
    const logic = new MetaUiFieldLogic(createMockField());
    logic.hideIf(() => false).hideIf(() => true);
    expect(logic.hiddenFn?.({} as any)).toBe(true);
  });
});

describe("MetaUiGroupLogic 属性隔离", () => {
  function makeGroup(): any {
    return { groupName: "testGroup", groupLabel: "测试组", many: false } as any;
  }

  it("两个实例分别调 hideIf，hiddenFn 互不相等", () => {
    const l1 = new MetaUiGroupLogic(makeGroup());
    const l2 = new MetaUiGroupLogic(makeGroup());
    l1.hideIf(() => true);
    l2.hideIf(() => false);
    expect(l1.hiddenFn).not.toBe(l2.hiddenFn);
  });

  it("lockIf 连续调用不会误写 hiddenFn", () => {
    const logic = new MetaUiGroupLogic(makeGroup());
    logic.lockIf(() => true);
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
    expect(logic.inplaceEditable).toBe(true);
    expect(logic.inplaceEditStart).toBe("excel");
    expect(logic.inplaceEdit(false)).toBe(logic);
    expect(logic.inplaceEditable).toBe(false);
    expect(logic.setInplaceEditStart("click")).toBe(logic);
    expect(logic.inplaceEditStart).toBe("click");
  });

  it("canDo 叠加到 stdActions.executableExpression，实例隔离", () => {
    const many = () =>
      ({ groupName: "items", groupLabel: "明细", many: true }) as any;
    const l1 = new MetaUiGroupLogic(many());
    const l2 = new MetaUiGroupLogic(many());
    l1.canDo("clear", (m: { a?: boolean }) => !!m.a);
    l1.canDo("clear", (m: { b?: boolean }) => !!m.b);
    l2.canDo("add", () => false);
    const clear1 = l1.stdActions.find((a) => a.name === "clear")
      ?.executableExpression as (m: any) => boolean;
    const add2 = l2.stdActions.find((a) => a.name === "add")
      ?.executableExpression as (m: any) => boolean;
    expect(clear1({ a: true, b: true })).toBe(true);
    expect(clear1({ a: true, b: false })).toBe(false);
    expect(add2({})).toBe(false);
    expect(l1.stdActions.find((a) => a.name === "add")?.executableExpression)
      .toBeUndefined();
  });

  it("itemDeletableFunc 行+主表 AND 叠加；beforeItemRemove 后写覆盖", () => {
    const logic = new MetaUiGroupLogic<{ status: string }, { locked?: boolean }>(
      { groupName: "items", groupLabel: "明细", many: true } as any,
    );
    logic
      .itemDeletable((row) => !row.locked)
      .itemDeletable((_row, master) => master.status === "NEW");
    expect(logic.itemDeletableFunc?.({ locked: false }, { status: "NEW" })).toBe(
      true,
    );
    expect(logic.itemDeletableFunc?.({ locked: true }, { status: "NEW" })).toBe(
      false,
    );
    expect(
      logic.itemDeletableFunc?.({ locked: false }, { status: "DONE" }),
    ).toBe(false);
    const first = () => false;
    const second = () => true;
    logic.beforeItemRemove(first).beforeItemRemove(second);
    expect(logic.beforeItemRemoveFunc).toBe(second);
  });

  it("setCustomRenderer、setCustomPrepend、setCustomAppend 渲染函数隔离", () => {
    const l1 = new MetaUiGroupLogic(makeGroup());
    const l2 = new MetaUiGroupLogic(makeGroup());
    const r1 = () => "r1";
    const r2 = () => "r2";
    l1.setCustomRenderer(r1);
    l2.setCustomRenderer(r2);
    l1.setCustomPrepend(() => "p1");
    l2.setCustomAppend(() => "a2");
    expect(l1.customRenderer).toBe(r1);
    expect(l2.customRenderer).toBe(r2);
    expect(l1.customPrepend).toBeDefined();
    expect(l2.customAppend).toBeDefined();
    expect(l1.customPrepend).not.toBe(l2.customPrepend);
  });

  it("aggregateWith 只写 customAggregator", () => {
    const logic = new MetaUiGroupLogic(makeGroup());
    const fn = () => 0;
    expect(logic.aggregateWith(fn)).toBe(logic);
    expect(logic.customAggregator).toBe(fn);
  });
});
