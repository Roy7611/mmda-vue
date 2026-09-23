import { describe, expect, it } from "vitest";
import { PagerCtor, type TranslateFn, UiViewOne, UiViewMany } from "@mmda/core";
import {
  isViewMany,
  isViewOne,
  resolveSearchParam,
  resolveViewManyType,
  resolveViewOneType,
} from "../contexts/view";
import { UiActionDivider, VuiActionCtor } from "../ui/factory/action";
import { loading, UiDataState } from "../app/state";
import { quickFiltersToSQL, VuiFilter } from "../ui/factory/filter";
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
    const action = VuiActionCtor(
      { name: "save", role: "success", onAction: () => 1 },
      t,
      (icon) => `icon:${icon}`,
    );
    expect(action.name).toBe("save");
    expect(action.label).toBe("action.save");
    expect(action.icon).toBe("icon:save");
  });

  it("loading() 不依赖 VuiContext", () => {
    expect(loading("wait").state).toBe(UiDataState.LOADING);
  });
});

