import { afterEach, describe, expect, it } from "vitest";
import { h, nextTick, render } from "vue";
import { MetaUi, MetaUiField, SqlDataType } from "@mmda/core";
import { UiViewContext } from "../ui/ui_context";
import { UiViewManyKind } from "../ui/ui_view";
import { TestUiBuilder } from "./test_builder";

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

describe("AbstractUiBuilder tree chrome", () => {
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
    render(new TestUiBuilder().buildView(context), host);

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
      new TestUiBuilder().confirm(context, { message: "确认吗？" }),
    ).resolves.toBe("yes");
    window.confirm = original;
  });

  it("buildTreeListView 用 splitter 分出树和表", () => {
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
      new TestUiBuilder().buildTreeListView(context, {
        showToolbar: false,
        showSearchbar: false,
        tree: () => ({
          data: [{ id: "c1", label: "分类" }],
          class: "mmda-test-tree",
        }),
      }),
      host,
    );

    expect(host.querySelector(".mmda-list-view.mmda-tree-list-view")).toBeTruthy();
    expect(host.querySelector(".mmda-splitter")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-view")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-view-search .mmda-factory-input")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-view-footer")).toBeTruthy();
    expect(host.querySelector(".mmda-test-tree")?.textContent).toContain("分类");
    expect(host.querySelector(".mmda-list-scroll")).toBeTruthy();
  });

  it("buildTreeView 搜索过滤节点，底栏渲染 footer 插槽", async () => {
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView({
        data: [
          { id: "1", label: "苹果" },
          { id: "2", label: "香蕉" },
        ],
        showTreeSearchBar: true,
        showTreeFooter: true,
        footer: () => h("span", { class: "mmda-test-tree-footer" }, "脚"),
      }),
      host,
    );
    expect(host.querySelector(".mmda-tree-view-search .mmda-factory-input")).toBeTruthy();
    expect(host.querySelector(".mmda-test-tree-footer")?.textContent).toBe("脚");
    expect(host.textContent).toContain("苹果");
    expect(host.textContent).toContain("香蕉");
    const input = host.querySelector<HTMLInputElement>(
      ".mmda-tree-view-search input, input.mmda-tree-view-search",
    )!;
    input.value = "苹";
    input.dispatchEvent(new Event("input"));
    await nextTick();
    expect(host.textContent).toContain("苹果");
    expect(host.textContent).not.toContain("香蕉");
  });

  it("buildTreeView 无自定义 footer 时显示选中节点文本", () => {
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView({
        data: [
          { id: "1", label: "苹果" },
          { id: "2", label: "香蕉" },
        ],
        selected: "1",
        showTreeSearchBar: true,
        showTreeFooter: true,
      }),
      host,
    );
    expect(host.querySelector(".mmda-tree-view-footer-label")?.textContent).toBe(
      "苹果",
    );
    expect(host.querySelector(".mmda-tree-view-collapse")).toBeTruthy();
  });

  it("buildTreeView 底栏折叠按钮可隐藏和展开树", async () => {
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView({
        data: [{ id: "1", label: "苹果" }],
        showTreeSearchBar: true,
        showTreeFooter: true,
      }),
      host,
    );
    expect(host.querySelector(".mmda-tree-view-body")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-view-search")).toBeTruthy();
    const toggle = host.querySelector<HTMLButtonElement>(
      ".mmda-tree-view-collapse",
    )!;
    toggle.click();
    await nextTick();
    expect(
      host.querySelector(".mmda-tree-view")?.classList.contains(
        "mmda-tree-view--collapsed",
      ),
    ).toBe(true);
    expect(host.querySelector(".mmda-tree-view-body")).toBeNull();
    expect(host.querySelector(".mmda-tree-view-search")).toBeNull();
    host.querySelector<HTMLButtonElement>(".mmda-tree-view-collapse")!.click();
    await nextTick();
    expect(host.querySelector(".mmda-tree-view-body")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-view-search")).toBeTruthy();
  });

  it("build 按 viewOptions[view].viewKind 走 tree list", () => {
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    context.logic = {
      viewOptions: {
        index: () => ({
          viewKind: UiViewManyKind.categoryList,
          tree: () => ({ data: [{ id: "c1", label: "分类" }] }),
        }),
      },
    } as any;
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().build(context, {
        showToolbar: false,
        showSearchbar: false,
      }),
      host,
    );
    expect(host.querySelector(".mmda-tree-list-view")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-label")?.textContent).toBe("分类");
  });

  it("build 有 tree 即使没有 viewKind 也走 tree list", () => {
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    context.logic = {
      viewOptions: {
        index: () => ({
          tree: () => ({ data: [{ id: "c1", label: "分类" }] }),
        }),
      },
    } as any;
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().build(context, {
        showToolbar: false,
        showSearchbar: false,
      }),
      host,
    );
    expect(host.querySelector(".mmda-tree-list-view")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-label")?.textContent).toBe("分类");
  });

  it("缺省 hover，右键不自造菜单", async () => {
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    context.app = {
      name: "base",
      findModule: () => ({
        authority: {
          allowRead: true,
          allowCreate: true,
          allowEdit: true,
          allowDelete: true,
        },
      }),
      di: { injectAsync: async () => undefined },
    } as any;
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView(
        {
          data: [{ id: "c1", categoryName: "分类" }],
          fields: { id: "id", label: "categoryName" },
          repository: "MaterialCats",
          showTreeSearchBar: false,
          showTreeFooter: false,
        },
        context,
      ),
      host,
    );
    expect(host.querySelector("[data-mmda-tree-actions]")?.getAttribute("data-mmda-tree-actions")).toBe(
      "hover",
    );
    host.querySelector(".mmda-tree-row")!.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, button: 2 }),
    );
    await nextTick();
    expect(host.querySelector(".mmda-test-tree-menu")).toBeFalsy();
    expect(document.querySelector(".mmda-tree-context-menu")).toBeFalsy();
  });

  it("CategoryList 右键按模块权限弹出树菜单", async () => {
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    context.app = {
      name: "base",
      findModule: () => ({
        authority: {
          allowRead: true,
          allowCreate: true,
          allowEdit: true,
          allowDelete: false,
        },
      }),
      di: { injectAsync: async () => undefined },
    } as any;
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView(
        {
          data: [{ id: "c1", categoryName: "分类", editable: true }],
          fields: { id: "id", label: "categoryName" },
          repository: "MaterialCats",
          treeNodeActions: "contextMenu",
          showTreeSearchBar: false,
          showTreeFooter: true,
        },
        context,
      ),
      host,
    );
    expect(host.querySelector("[data-has-context-menu]")?.getAttribute("data-has-context-menu")).toBe(
      "1",
    );
    const row = host.querySelector(".mmda-tree-row")!;
    row.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        button: 2,
        clientX: 12,
        clientY: 24,
      }),
    );
    await nextTick();
    const menu = host.querySelector(".mmda-test-tree-menu");
    expect(menu).toBeTruthy();
    const labels = [...menu!.querySelectorAll(".mmda-test-tree-menu-item")].map(
      (item) => item.textContent,
    );
    expect(labels.some((text) => text?.includes("查看") || text?.includes("view"))).toBe(
      true,
    );
    expect(labels.some((text) => text?.includes("添加根") || text?.includes("addRoot"))).toBe(
      true,
    );
    expect(labels.some((text) => text?.includes("删除") || text?.includes("delete"))).toBe(
      false,
    );
    const first = menu!.firstElementChild;
    expect(
      first?.textContent?.includes("查看") || first?.textContent?.includes("view"),
    ).toBe(true);
    expect(first?.nextElementSibling?.classList.contains("mmda-test-tree-menu-divider")).toBe(
      true,
    );
  });

  it("分类模块无权限时右键菜单回退到列表模块权限", async () => {
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    context.logic = {
      module: {
        authority: {
          allowRead: true,
          allowCreate: true,
          allowEdit: true,
          allowDelete: true,
        },
      },
    } as any;
    context.app = {
      name: "base",
      findModule: () => ({
        authority: {
          allowRead: false,
          allowCreate: false,
          allowEdit: false,
          allowDelete: false,
        },
      }),
      di: { injectAsync: async () => undefined },
    } as any;
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView(
        {
          data: [{ id: "c1", categoryName: "分类", editable: true }],
          fields: { id: "id", label: "categoryName" },
          repository: "MaterialCats",
          treeNodeActions: "contextMenu",
          showTreeSearchBar: false,
          showTreeFooter: false,
        },
        context,
      ),
      host,
    );
    host.querySelector(".mmda-tree-row")!.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        button: 2,
        clientX: 12,
        clientY: 24,
      }),
    );
    await nextTick();
    const labels = [
      ...host.querySelectorAll(".mmda-test-tree-menu-item"),
    ].map((item) => item.textContent);
    expect(labels.some((text) => text?.includes("查看") || text?.includes("view"))).toBe(
      true,
    );
    expect(labels.some((text) => text?.includes("删除") || text?.includes("delete"))).toBe(
      true,
    );
  });
});
