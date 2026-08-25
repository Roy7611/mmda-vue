import { describe, expect, it, vi } from "vitest";
import { createApp, h, nextTick } from "vue";
import { MetaUi, MetaUiField, SqlDataType, emptyPagedList } from "@mmda/core";
import { UiSelector } from "../ui/components/Selector";
import { createStubUiBuilder } from "../ui/ui_builder";
import type { UiFactory } from "../ui/ui_factory";

const metaui = new MetaUi({
  objName: "Warehouse",
  displayLabel: "仓库",
  groups: [
    {
      groupName: "a1",
      groupLabel: "仓库",
      many: false,
      fields: [
        new MetaUiField({
          fieldName: "whName",
          displayLabel: "名称",
          fieldIdx: 0,
          dataType: SqlDataType.NVARCHAR,
          nullable: true,
        }),
      ],
    },
  ],
});

describe("UiSelector", () => {
  it("用 factory 画出分页、搜索和列表，不直接依赖 PrimeVue", async () => {
    const calls = { paginator: 0, input: 0, list: 0 };
    const factory = {
      layout: {
        maxCols: 12,
        column: (children: any) => h("div", { class: "col" }, children),
        row: (children: any) => h("div", { class: "row" }, children),
      },
      paginator: () => {
        calls.paginator++;
        return h("div", { class: "pager" });
      },
      input: () => {
        calls.input++;
        return h("input");
      },
      list: () => {
        calls.list++;
        return h("div", { class: "list" });
      },
    } as unknown as UiFactory;

    const ui = { ...createStubUiBuilder(), factory };
    const appStub = {
      ui,
      meta: {
        getPack: vi.fn(async () => ({ metaui })),
      },
      api: {
        searchEntities: vi.fn(async () => emptyPagedList()),
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);
    const vueApp = createApp(UiSelector, { repository: "Warehouses" });
    vueApp.config.globalProperties.$app = appStub;
    vueApp.mount(host);
    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(appStub.meta.getPack).toHaveBeenCalledWith({
      repository: "Warehouses",
      service: undefined,
    });
    expect(appStub.api.searchEntities).toHaveBeenCalled();
    expect(calls.paginator).toBeGreaterThan(0);
    expect(calls.input).toBeGreaterThan(0);
    expect(calls.list).toBeGreaterThan(0);
    vueApp.unmount();
  });
});
