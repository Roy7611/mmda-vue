import { describe, expect, it, vi } from "vitest";
import { h, nextTick, reactive, ref, render } from "vue";
import {
  DateRangeKind,
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
  listFixedFilterChipGroups,
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
    "action.filter": "过滤",
    "action.clearFilters": "清除过滤",
    "action.all": "全部",
    "action.saveQuery": "保存查询",
    "action.deleteQuery": "删除查询",
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
        createdAt: FieldFilter.dateKind(DateRangeKind.THIS_MONTH),
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
    expect(ctx.listLayoutRev.value).toBe(0);
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

  it("always renders the bar and adds chips when filters exist", () => {
    const factory = {
      chips: (props: any) =>
        h("div", { class: "mmda-chips", "data-count": props.items?.length }),
      button: (props: any) => h("button", { title: props.tooltip }, props.label),
      resolveIcon: (name: string) => name,
    } as any;
    const empty = createListFilterBar(factory, contextOf());
    expect(empty.props?.class).toBe(
      "mmda-list-filter-bar mmda-list-filter-bar--empty",
    );
    expect((empty.children as any[])?.[0]).toMatchObject({
      props: { class: "mmda-list-filter-bar__title" },
      children: "过滤",
    });
    let emptyChips: any;
    createListFilterBar(
      {
        chips: (props: any) => {
          emptyChips = props;
          return h("div", { class: "mmda-chips" });
        },
        button: (props: any) => h("button", { title: props.tooltip }, props.label),
        resolveIcon: (name: string) => name,
      } as any,
      contextOf(),
    );
    expect(emptyChips.kind).toBe("action");
    expect(emptyChips.selected).toBe("__all__");
    expect(emptyChips.items.map((item: { label: string }) => item.label)).toEqual(
      ["全部"],
    );
    const vnode = createListFilterBar(
      factory,
      contextOf({
        name: { filterType: "text", operator: "CONTAINS", value: "钢" },
      }),
    );
    expect(vnode.props?.class).toBe("mmda-list-filter-bar");
    expect(vnode?.children).not.toContain(undefined);
    let chipsProps: any;
    const capturing = {
      chips: (props: any) => {
        chipsProps = props;
        return h("div", { class: "mmda-chips" });
      },
      button: (props: any) => h("button", { title: props.tooltip }, props.label),
      resolveIcon: (name: string) => name,
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

  it("t.status=1 画固定芯片，摘要不再重复状态", () => {
    const statusField = field("status", {
      selectOptions: JSON.stringify([
        { id: 0, value: "OLD", text: "停用" },
        { id: 1, value: "NEW", text: "启用" },
      ]),
    });
    const ctx = contextOf({
      status: FieldFilter.in("NEW"),
      name: { filterType: "text", operator: "CONTAINS", value: "钢" },
    });
    ctx.metaUi = metaOf(
      field("name"),
      field("qty", { dataType: SqlDataType.INT, align: MetaUiFieldAlignment.RIGHT }),
      field("createdAt", { dataType: SqlDataType.DATETIME }),
      statusField,
    );
    ctx.logic = { module: { defaultFilter: "t.status=1|items.xxx=2" } };
    const groups = listFixedFilterChipGroups(ctx);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.items.map((item) => item.label)).toEqual([
      "全部",
      "停用",
      "启用",
    ]);
    expect(groups[0]?.selected).toBe("NEW");
    expect(listFilterBarChips(ctx).map((chip) => chip.fieldName)).toEqual([
      "name",
    ]);
  });

  it("固定芯片 click 写 status IN [USED]，列头 IN 仍能高亮多项", async () => {
    const statusField = field("status", {
      selectOptions: "0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用",
    });
    const ctx = contextOf({
      status: FieldFilter.in(["NEW", "DEPRECATED"]),
    });
    ctx.metaUi = metaOf(statusField);
    ctx.logic = { module: { defaultFilter: "t.status" } };
    const groups = listFixedFilterChipGroups(ctx);
    expect(groups[0]?.items.map((item) => item.label)).toEqual([
      "全部",
      "新",
      "已启用",
      "已弃用",
    ]);
    expect(groups[0]?.items.map((item) => item.value)).toEqual([
      "__all__",
      "NEW",
      "USED",
      "DEPRECATED",
    ]);
    expect(groups[0]?.selected).toEqual(["NEW", "DEPRECATED"]);
    expect(
      groups[0]?.items
        .filter((item) => item.colorRole === "primary")
        .map((item) => item.label),
    ).toEqual(["新", "已弃用"]);
    const byLabel = contextOf({
      status: FieldFilter.in(["新", "已弃用"]),
    });
    byLabel.metaUi = ctx.metaUi;
    byLabel.logic = ctx.logic;
    expect(
      listFixedFilterChipGroups(byLabel)[0]?.items
        .filter((item) => item.colorRole === "primary")
        .map((item) => item.label),
    ).toEqual(["新", "已弃用"]);
    const oneCtx = contextOf({
      status: FieldFilter.in("USED"),
    });
    oneCtx.metaUi = ctx.metaUi;
    oneCtx.logic = ctx.logic;
    expect(listFixedFilterChipGroups(oneCtx)[0]?.selected).toBe("USED");
    const checkedTwo = contextOf({
      status: FieldFilter.in(["NEW", "USED"]),
    });
    checkedTwo.metaUi = ctx.metaUi;
    checkedTwo.logic = ctx.logic;
    expect(
      listFixedFilterChipGroups(checkedTwo)[0]?.items
        .filter((item) => item.colorRole === "primary")
        .map((item) => item.label),
    ).toEqual(["新", "已启用"]);
    const leftoverNeq = contextOf({
      status: { filterType: "text", operator: "NEQ", value: "DEPRECATED" },
    });
    leftoverNeq.metaUi = ctx.metaUi;
    leftoverNeq.logic = ctx.logic;
    expect(
      listFixedFilterChipGroups(leftoverNeq)[0]?.items
        .filter((item) => item.colorRole === "primary")
        .map((item) => item.label),
    ).toEqual(["新", "已启用"]);
    let chipsProps: any;
    createListFilterBar(
      {
        chips: (props: any) => {
          chipsProps = props;
          return h("div", { class: "mmda-chips" });
        },
        button: (props: any) => h("button", { title: props.tooltip }, props.label),
        resolveIcon: (name: string) => name,
      } as any,
      ctx,
    );
    expect(chipsProps.kind).toBe("action");
    expect(chipsProps.selected).toEqual(["NEW", "DEPRECATED"]);
    expect(chipsProps.onChange).toBeUndefined();
    await chipsProps.onClick({ label: "已启用", value: "USED" });
    expect(ctx.searchParam.filterModel).toEqual({
      status: FieldFilter.in("USED"),
    });
    expect(ctx.search).toHaveBeenCalledOnce();
    await chipsProps.onClick({ label: "已启用", value: 1 });
    expect(ctx.searchParam.filterModel).toEqual({
      status: FieldFilter.in("USED"),
    });
    await chipsProps.onClick({ label: "已弃用", value: -1 });
    expect(ctx.searchParam.filterModel).toEqual({
      status: FieldFilter.in("DEPRECATED"),
    });
  });

  it("ListFilterBarView stays visible and grows chips after filterModel is written", async () => {
    const factory = {
      chips: (props: any) =>
        h("div", { class: "mmda-chips", "data-count": props.items?.length }),
      button: (props: any) => h("button", { title: props.tooltip }, props.label),
      resolveIcon: (name: string) => name,
    } as any;
    const context = contextOf();
    context.searchParam = reactive(context.searchParam);
    const host = document.createElement("div");
    document.body.append(host);
    render(
      h(ListFilterBarView, { factory, context }),
      host,
    );
    expect(host.querySelector(".mmda-list-filter-bar")).toBeTruthy();
    expect(host.querySelector(".mmda-chips")?.getAttribute("data-count")).toBe(
      "1",
    );
    context.searchParam.filterModel = {
      name: { filterType: "text", operator: "CONTAINS", value: "钢" },
    };
    await nextTick();
    expect(host.querySelector(".mmda-list-filter-bar")).toBeTruthy();
    expect(host.querySelector(".mmda-chips")?.getAttribute("data-count")).toBe(
      "1",
    );
    render(null, host);
    host.remove();
  });

  it("ListFilterBarView grows chips when filterModel is written without listLayoutRev", async () => {
    const factory = {
      chips: (props: any) =>
        h("div", { class: "mmda-chips", "data-count": props.items?.length }),
      button: (props: any) => h("button", { title: props.tooltip }, props.label),
      resolveIcon: (name: string) => name,
    } as any;
    const context = contextOf();
    context.searchParam = reactive(context.searchParam);
    const host = document.createElement("div");
    document.body.append(host);
    render(h(ListFilterBarView, { factory, context }), host);
    expect(host.querySelector(".mmda-list-filter-bar")).toBeTruthy();
    expect(host.querySelector(".mmda-chips")?.getAttribute("data-count")).toBe(
      "1",
    );
    context.searchParam.filterModel = {
      workDeptID: FieldFilter.in(3),
    };
    await nextTick();
    expect(host.querySelector(".mmda-chips")?.getAttribute("data-count")).toBe(
      "1",
    );
    render(null, host);
    host.remove();
  });
});
