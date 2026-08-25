import { describe, expect, it } from "vitest";
import { PagerCtor, type TranslateFn } from "@mmda/core";
import {
  UiViewMany,
  UiViewOne,
  isViewMany,
  isViewOne,
  resolveSearchParam,
  resolveViewManyType,
  resolveViewOneType,
} from "../ui/ui_view";
import { UiActionDivider, UiActionCtor } from "../ui/ui_action";
import { loading, UiDataState } from "../ui/ui_state";
import { quickFiltersToSQL, UiFilter, UiSearchField } from "../ui/ui_filter";
import { SqlDataType, MetaUiField } from "@mmda/core";

const t: TranslateFn = (message) =>
  typeof message === "string" ? message : message.message;

describe("view types", () => {
  it("分辨单对象 / 多对象视图", () => {
    expect(isViewOne(UiViewOne.Edit)).toBe(true);
    expect(isViewOne(UiViewMany.Index)).toBe(false);
    expect(isViewMany(UiViewMany.SelectOne)).toBe(true);
  });

  it("从路由解析视图类型，非法值回落默认", () => {
    expect(resolveViewOneType("edit", undefined, undefined)).toBe(
      UiViewOne.Edit,
    );
    expect(resolveViewOneType("nope", undefined, undefined)).toBe(
      UiViewOne.Details,
    );
    expect(resolveViewManyType("selectMany", undefined, undefined)).toBe(
      UiViewMany.SelectMany,
    );
  });

  it("resolveSearchParam 接到 core Pager", () => {
    const param = resolveSearchParam({
      pageSize: 20,
      pageNo: 2,
      sort: "code DESC",
      searchWord: "仓",
      queryParams: { site: "SZ" },
    });
    expect(param.pager.pageSize).toBe(20);
    expect(param.pager.pageNo).toBe(2);
    expect(param.searchWord).toBe("仓");
    expect(param.queryParams).toEqual({ site: "SZ" });
    expect(PagerCtor(20, 2).pageSize).toBe(20);
  });
});

describe("actions and loading", () => {
  it("分隔符动作", () => {
    expect(UiActionDivider()).toEqual({ divider: true });
  });

  it("从 EntityAction 构造 UiAction", () => {
    const action = UiActionCtor(
      { name: "save", role: "success", onAction: () => 1 },
      t,
      (icon) => `icon:${icon}`,
    );
    expect(action.name).toBe("save");
    expect(action.label).toBe("action.save");
    expect(action.icon).toBe("icon:save");
  });

  it("loading() 不依赖 UiViewContext", () => {
    expect(loading("wait").state).toBe(UiDataState.LOADING);
  });
});

describe("UiSearchField", () => {
  it("按字段类型给出搜索算子", () => {
    const field = new MetaUiField({
      fieldIdx: 0,
      fieldName: "whName",
      displayLabel: "仓库",
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
    });
    const search = new UiSearchField(field, t);
    expect(search.availableOps.length).toBeGreaterThan(0);
    expect(search.hasVal).toBe(false);
  });

  it("UiFilter 把选中条件拼成 OR", () => {
    const filter = new UiFilter({
      filterName: "status",
      filterTitle: "状态",
      fixed: false,
      filterConditions: [
        { condition: "status='OPEN'", displayLabel: "开立", fallback: false },
      ],
    });
    filter.selectedConditions.value = [
      { condition: "status='OPEN'", displayLabel: "开立", fallback: false },
    ];
    expect(filter.toQuerySQL()).toBe("(status='OPEN')");
  });

  it("快捷过滤组内 OR、组间 AND", () => {
    const status = new UiFilter({
      filterName: "status",
      filterTitle: "状态",
      fixed: false,
      filterConditions: [
        { condition: "status='OPEN'", displayLabel: "开立", fallback: false },
        { condition: "status='DONE'", displayLabel: "完成", fallback: false },
      ],
    });
    const site = new UiFilter({
      filterName: "site",
      filterTitle: "站点",
      fixed: false,
      filterConditions: [
        { condition: "site='SZ'", displayLabel: "深圳", fallback: false },
      ],
    });
    status.selectedConditions.value = status.selectOptions;
    site.selectedConditions.value = site.selectOptions;

    expect(quickFiltersToSQL([status, site])).toBe(
      "((status='OPEN' OR status='DONE')) AND ((site='SZ'))",
    );
  });
});
