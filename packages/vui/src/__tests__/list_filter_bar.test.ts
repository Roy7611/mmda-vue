import { describe, expect, it, vi } from "vitest";
import { h, nextTick, reactive, ref, render } from "vue";
import {
  FieldFilter,
  MetaUi,
  MetaUiField,
  MetaUiFieldAlignment,
  SqlDataType,
} from "@mmda/core";
import {
  clearListFilterBar,
  createListFilterBar,
  ListFilterBarView,
  listFilterBarChips,
  removeListFilterBarChip,
} from "../ui/builder/list_filter_bar";

const field = (name: string, init: Partial<MetaUiField> = {}) =>
  new MetaUiField({
    fieldName: name,
    displayLabel:
      name === "qty"
        ? "数量"
        : name === "status"
          ? "状态"
          : name === "createdAt"
            ? "创建时间"
            : "名称",
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

const t = (key: string) => {
  const map: Record<string, string> = {
    "matcher.CONTAINS": "包含",
    "matcher.IN": "属于",
    "matcher.WITHIN": "处于期间",
    "dateRange.THIS_MONTH": "本月",
    "boolean.yes": "是",
    "tableSettings.activeFilters": "当前过滤",
    "action.clearFilters": "清除过滤",
  };
  return map[key] ?? key;
};

const contextOf = (filterModel?: Record<string, any>, extra: Record<string, any> = {}) => {
  const search = vi.fn(async () => undefined);
  return {
    t,
    metaUi: metaOf(
      field("name"),
      field("qty", { dataType: SqlDataType.INT, align: MetaUiFieldAlignment.RIGHT }),
      field("createdAt", { dataType: SqlDataType.DATETIME }),
      field("status"),
    ),
    searchParam: {
      filterModel,
      pager: { pageNo: 2, pageSize: 20 },
    },
    searchFields: extra.searchFields ?? [],
    listLayoutRev: ref(0),
    search,
    joinListMode: false,
  } as any;
};

describe("listFilterBarChips", () => {
  it("skips empty filterModel", () => {
    expect(listFilterBarChips(contextOf())).toEqual([]);
    expect(listFilterBarChips(contextOf({}))).toEqual([]);
  });

  it("formats text, set, and date chips", () => {
    const chips = listFilterBarChips(
      contextOf({
        name: { filterType: "text", operator: "CONTAINS", value: "钢" },
        status: FieldFilter.in(["OPEN", "USED"]),
        createdAt: FieldFilter.dateKind("THIS_MONTH"),
        blank: { filterType: "text", operator: "CONTAINS", value: "" },
      }),
    );
    expect(chips.map((chip) => chip.fieldName)).toEqual([
      "name",
      "status",
      "createdAt",
    ]);
    expect(chips[0]?.label).toBe("名称 包含 钢");
    expect(chips[1]?.label).toBe("状态 属于 OPEN、USED");
    expect(chips[2]?.label).toBe("创建时间 处于期间 本月");
  });
});

describe("list filter bar actions", () => {
  it("removes one field and searches", async () => {
    const ctx = contextOf({
      name: { filterType: "text", operator: "CONTAINS", value: "钢" },
      status: FieldFilter.in(["OPEN"]),
    });
    await removeListFilterBarChip(ctx, "name");
    expect(ctx.searchParam.filterModel).toEqual({
      status: FieldFilter.in(["OPEN"]),
    });
    expect(ctx.searchParam.pager.pageNo).toBe(1);
    expect(ctx.listLayoutRev.value).toBe(1);
    expect(ctx.search).toHaveBeenCalledOnce();
  });

  it("clears all model filters and matching search fields", async () => {
    const searchField = {
      field: { fieldName: "name" },
      searchWord: "钢",
      searchVal: { value: "钢" },
    };
    const ctx = contextOf(
      {
        name: { filterType: "text", operator: "CONTAINS", value: "钢" },
        status: FieldFilter.in(["OPEN"]),
      },
      { searchFields: [searchField] },
    );
    ctx.searchParam.searchWord = "keep";
    await clearListFilterBar(ctx);
    expect(ctx.searchParam.filterModel).toBeUndefined();
    expect(searchField.searchVal.value).toBeNull();
    expect(ctx.searchParam.searchWord).toBe("keep");
    expect(ctx.search).toHaveBeenCalledOnce();
  });

  it("does not render an empty bar and renders chips when filters exist", () => {
    const factory = {
      chips: (props: any) =>
        h("div", { class: "mmda-chips", "data-count": props.items?.length }),
      button: (props: any) => h("button", props.label),
    } as any;
    expect(createListFilterBar(factory, contextOf())).toBeNull();
    const vnode = createListFilterBar(
      factory,
      contextOf({
        name: { filterType: "text", operator: "CONTAINS", value: "钢" },
      }),
    );
    expect(vnode?.props?.class).toBe("mmda-list-filter-bar");
    expect(vnode?.children).not.toContain(undefined);
    let chipsProps: any;
    const capturing = {
      chips: (props: any) => {
        chipsProps = props;
        return h("div", { class: "mmda-chips" });
      },
      button: (props: any) => h("button", props.label),
    } as any;
    createListFilterBar(
      capturing,
      contextOf({
        status: FieldFilter.in(["OPEN", "USED"]),
      }),
    );
    expect(chipsProps.kind).toBe("input");
    expect(chipsProps.outlined).toBe(true);
    expect(chipsProps.removable).toBe(true);
    expect(chipsProps.items.map((item: { label: string }) => item.label)).toEqual(
      ["状态 属于 OPEN、USED"],
    );
  });

  it("ListFilterBarView appears after filterModel is written", async () => {
    const factory = {
      chips: (props: any) =>
        h("div", { class: "mmda-chips", "data-count": props.items?.length }),
      button: (props: any) => h("button", props.label),
    } as any;
    const context = contextOf();
    context.searchParam = reactive(context.searchParam);
    const host = document.createElement("div");
    document.body.append(host);
    render(
      h(ListFilterBarView, { factory, context }),
      host,
    );
    expect(host.querySelector(".mmda-list-filter-bar")).toBeNull();
    context.searchParam.filterModel = {
      name: { filterType: "text", operator: "CONTAINS", value: "钢" },
    };
    await nextTick();
    expect(host.querySelector(".mmda-list-filter-bar")).toBeTruthy();
    render(null, host);
    host.remove();
  });
});
