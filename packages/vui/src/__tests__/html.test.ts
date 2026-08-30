import { afterEach, describe, expect, it } from "vitest";
import { render } from "vue";
import { MetaUi, MetaUiField, SqlDataType } from "@mmda/core";
import { HtmlUiBuilder } from "../ui/ui_html";
import { UiViewContext } from "../ui/ui_context";

const metaui = new MetaUi({
  objName: "Product",
  displayLabel: "商品",
  groups: [
    {
      groupName: "base",
      groupLabel: "基本信息",
      many: false,
      fields: [
        new MetaUiField({
          fieldName: "name",
          displayLabel: "名称",
          fieldIdx: 0,
          dataType: SqlDataType.NVARCHAR,
          nullable: false,
          listed: true,
        }),
      ],
    },
  ],
});

describe("HtmlUiBuilder", () => {
  const hosts: HTMLElement[] = [];

  afterEach(() => {
    for (const host of hosts) {
      render(null, host);
      host.remove();
    }
    hosts.length = 0;
  });

  it("渲染可编辑表单并把输入写回 context", () => {
    const context = new UiViewContext({
      model: { name: "旧名称" },
      metaui,
      view: "edit",
    });
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(new HtmlUiBuilder().buildView(context), host);

    const input = host.querySelector("input")!;
    expect(input.value).toBe("旧名称");
    input.value = "新名称";
    input.dispatchEvent(new Event("input"));
    expect(context.model.name).toBe("新名称");
  });

  it("原生确认框返回统一的 yes/no 结果", async () => {
    const context = new UiViewContext({ model: {}, metaui });
    const original = window.confirm;
    window.confirm = () => true;
    await expect(
      new HtmlUiBuilder().confirm(context, { message: "确认吗？" }),
    ).resolves.toBe("yes");
    window.confirm = original;
  });

  it("快捷过滤由 HTML 皮肤决定为 Tab，并编译进 queryParams.filter", () => {
    const context = new UiViewContext({
      model: { list: [], pagination: { pageNo: 1, pageSize: 10 } },
      metaui,
      view: "index",
    });
    context.configureSearch([
      {
        filterName: "status",
        filterTitle: "状态",
        fixed: true,
        filterConditions: [
          {
            displayLabel: "启用",
            condition: "status='OPEN'",
            fallback: false,
          },
        ],
      },
    ]);
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(new HtmlUiBuilder().buildModuleSearchbar(context, {}), host);

    const tab = host.querySelector<HTMLButtonElement>('[role="tab"]')!;
    tab.click();

    expect(context.searchParam.queryParams?.filter).toContain("status='OPEN'");
    expect(tab.getAttribute("role")).toBe("tab");
  });

  it("表头过滤写入结构化 searchParams", () => {
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new HtmlUiBuilder().buildListView(context, {
        showToolbar: false,
        showSearchbar: false,
        filterDisplay: "row",
      }),
      host,
    );

    const filter = host.querySelector(".mmda-column-filter")!;
    const operator = filter.querySelector<HTMLSelectElement>("select")!;
    operator.value = "CONTAINS";
    operator.dispatchEvent(new Event("change"));
    const input = filter.querySelector<HTMLInputElement>("input")!;
    input.value = "A";
    input.dispatchEvent(new Event("input"));
    filter.querySelector<HTMLButtonElement>("button")!.click();

    expect(context.searchParam.searchParams?.name).toEqual({
      filterType: "text",
      operator: "CONTAINS",
      value: "A",
      valueTo: undefined,
    });
  });
});
