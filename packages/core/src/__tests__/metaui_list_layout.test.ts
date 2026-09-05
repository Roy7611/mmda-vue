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

describe("updateForCache", () => {
  it("把 metaui/filters 与 lastQuery 写入缓存，不写 sorts", async () => {
    const metaui = metaOf(field("code", { listSize: 120, listPos: 0 }));
    const apiClient = {
      config: { service: "base", locale: "zh" },
      http: { postJson: async () => ({}) },
      buildEntityURL: () => "meta/listSettings/save",
    } as any;
    const service = defaultMetaUiService(apiClient);
    const filters = [
      {
        filterName: "status",
        filterTitle: "状态",
        fixed: false,
        filterConditions: [
          {
            displayLabel: "开",
            condition: "t.status=1",
            fallback: true,
            active: true,
          },
        ],
      },
    ];
    await service.updateForCache("Things", { metaui, filters, lastQuery: { pager: { pageSize: 20, pageNo: 1 }, searchWord: "x" }, sorts: [{ sortBy: "code", sortOrder: "ASC" }] } as any, "base");
    const cached = await service.getPack({ repository: "Things", service: "base" });
    expect(cached.metaui.getField("code")?.listSize).toBe(120);
    expect(cached.filters?.[0]?.filterConditions[0].active).toBe(true);
    expect((cached as { sorts?: unknown }).sorts).toBeUndefined();
    expect(cached.lastQuery?.searchWord).toBe("x");
  });
});
