import { describe, expect, it } from "vitest";
import { assembleViewUi, MetaUi, MetaUiGroup } from "../index";
import { createMockField } from "./helpers/metaui_mock";

function joinMeta(flags: {
  many?: boolean
  requiredAny?: boolean
  allowJoinList?: boolean
}) {
  const groups = [
    MetaUiGroup.master({
      groupName: "a1",
      groupLabel: "主",
      fields: [createMockField({ fieldName: "id" })],
    }),
  ]
  if (flags.many !== false) {
    groups.push(
      MetaUiGroup.sub({
        groupName: "items",
        groupLabel: "明细",
        relObjName: "Item",
        joinOn: "id=@id",
        requiredAny: flags.requiredAny,
        allowJoinList: flags.allowJoinList,
        groupUi: new MetaUi({
          objName: "Item",
          displayLabel: "明细",
          groups: [
            {
              groupName: "a1",
              groupLabel: "明细",
              many: false,
              fields: [createMockField({ fieldName: "itemID" })],
            },
          ],
        }),
      }),
    )
  }
  return new MetaUi({
    objName: "Order",
    displayLabel: "订单",
    groups,
  })
}

describe("MetaUi.hasJoinList", () => {
  it("需要 many && requiredAny && allowJoinList", () => {
    expect(joinMeta({ requiredAny: true, allowJoinList: true }).hasJoinList()).toBe(true)
    expect(joinMeta({ requiredAny: true, allowJoinList: false }).hasJoinList()).toBe(false)
    expect(joinMeta({ requiredAny: false, allowJoinList: true }).hasJoinList()).toBe(false)
    expect(joinMeta({ allowJoinList: true }).hasJoinList()).toBe(false)
  })
})

function viewSourceMeta() {
  return new MetaUi({
    objName: "Order",
    displayLabel: "订单",
    primaryKey: "id",
    groups: [
      MetaUiGroup.master({
        groupName: "a1",
        groupLabel: "主",
        fields: [
          createMockField({
            fieldName: "id",
            displayLabel: "标识",
            listed: true,
            fieldIdx: 1,
          }),
          createMockField({
            fieldName: "status",
            displayLabel: "状态",
            listed: true,
            fieldIdx: 2,
            selectOptions: "0;OPEN;打开|1;CLOSED;关闭",
          }),
        ],
      }),
      MetaUiGroup.sub({
        groupName: "items",
        groupLabel: "明细",
        relObjName: "Item",
        joinOn: "id=@id",
        requiredAny: true,
        allowJoinList: true,
        groupUi: new MetaUi({
          objName: "Item",
          displayLabel: "明细",
          primaryKey: "itemID",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行信息",
              many: false,
              fields: [
                createMockField({
                  fieldName: "id",
                  displayLabel: "订单",
                  listed: true,
                  fieldIdx: 9,
                }),
                createMockField({
                  fieldName: "itemID",
                  displayLabel: "行号",
                  listed: true,
                  fieldIdx: 10,
                }),
                createMockField({
                  fieldName: "spec",
                  displayLabel: "规格",
                  listed: true,
                  fieldIdx: 11,
                }),
              ],
            },
          ],
        }),
      }),
    ],
  })
}

describe("assembleViewUi", () => {
  it("主表 reference 共用；子表 fieldName 加前缀；同名主键隐藏", () => {
    const metaUi = viewSourceMeta()
    const status = metaUi.getField("status")!
    const view = assembleViewUi(metaUi, "items")
    expect(view.objName).toBe("ItemView")
    expect(view.primaryKey).toBe("id,items.itemID")
    expect(view.getField("status")?.reference).toBe(status.reference)
    expect(view.getField("status")?.subGroupLabel).toBeUndefined()
    expect(view.getField("items.itemID")?.fieldName).toBe("items.itemID")
    expect(view.getField("items.itemID")?.hidden).not.toBe(true)
    expect(view.getField("items.itemID")?.subGroupLabel).toBe("行信息")
    expect(view.getField("items.spec")?.displayLabel).toBe("规格")
    expect(view.getField("items.id")?.hidden).toBe(true)
    expect(view.getField("items.id")?.readOnly).toBe(true)
    expect(view.getListedFields().map(field => field.fieldName)).toEqual([
      "id",
      "status",
      "items.itemID",
      "items.spec",
    ])
  })

  it("没有 groupUi 时抛错", () => {
    expect(() => assembleViewUi(joinMeta({ allowJoinList: true }), "missing")).toThrow(
      /missing/,
    )
  })
})
