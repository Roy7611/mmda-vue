// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  MetaUi,
  MetaUiField,
  MetaUiFieldFrozen,
  compareListColumns,
  defaultMetaUiService,
  ensureListFieldVisibleWhenFrozen,
} from "../index";
import { SqlDataType } from "../metaui/datatype";

const field = (
  name: string,
  init: Partial<MetaUiField> = {},
): MetaUiField =>
  new MetaUiField({
    fieldName: name,
    displayLabel: name,
    fieldIdx: 0,
    dataType: SqlDataType.NVARCHAR,
    nullable: true,
    listed: true,
    ...init,
  } as any);

const metaOf = (...fields: MetaUiField[]) =>
  new MetaUi({
    objName: "Thing",
    displayLabel: "物",
    groups: [
      {
        groupName: "a1",
        groupLabel: "主",
        many: false,
        fields,
      },
    ],
  });

describe("列表列顺序", () => {
  it("按 listPos 优先于 fieldIdx", () => {
    const a = field("a", { fieldIdx: 0, listPos: 2 });
    const b = field("b", { fieldIdx: 1, listPos: 0 });
    const c = field("c", { fieldIdx: 2, listPos: 1 });
    expect(compareListColumns(a, b)).toBeGreaterThan(0);
    const listed = metaOf(a, b, c).getListedFields();
    expect(listed.map((item) => item.fieldName)).toEqual(["b", "c", "a"]);
  });

  it("冻左在前、冻右在后", () => {
    const free = field("free", { fieldIdx: 0, listPos: 0 });
    const left = field("left", {
      fieldIdx: 1,
      listPos: 1,
      frozen: MetaUiFieldFrozen.Left,
    });
    const right = field("right", {
      fieldIdx: 2,
      listPos: 2,
      frozen: MetaUiFieldFrozen.Right,
    });
    expect(metaOf(free, left, right).getListedFields().map((item) => item.fieldName)).toEqual([
      "left",
      "free",
      "right",
    ]);
  });

  it("冻结列写入 listed=true、hidden=false 后出现在列表", () => {
    const qty = field("qty", {
      listed: false,
      hidden: true,
      frozen: MetaUiFieldFrozen.Right,
    });
    ensureListFieldVisibleWhenFrozen(qty);
    expect(qty.listed).toBe(true);
    expect(qty.hidden).toBe(false);
    expect(metaOf(qty).getListedFields().map((item) => item.fieldName)).toEqual(
      ["qty"],
    );
  });

  it("未列出且未冻结的列不在列表", () => {
    const qty = field("qty", { listed: false, hidden: false });
    expect(metaOf(qty).getListedFields()).toEqual([]);
  });
});

describe("updateToCache", () => {
  it("只写入 MetaUi，不写 filters/sorts/lastQuery", async () => {
    const metaUi = metaOf(field("code", { listSize: 120, listPos: 0 }));
    const apiClient = {
      config: { service: "base", locale: "zh" },
      http: { postJson: async () => ({}) },
      buildEntityURL: () => "meta/listSettings/save",
    } as any;
    const service = defaultMetaUiService(apiClient);
    await service.updateToCache("Things", metaUi, "base");
    const cached = await service.get("Things", "base");
    expect(cached.getField("code")?.listSize).toBe(120);
    expect(await service.localDb.get("Things/lastQuery")).toBeFalsy();
    expect(await service.localDb.get("meta/Things/filters")).toBeFalsy();
  });
});
