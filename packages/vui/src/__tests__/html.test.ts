import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, render } from "vue";
import { MetaUi, MetaUiField, SqlDataType } from "@mmda/core";
import { UiViewContext } from "../ui/ui_context";
import { UiViewManyKind } from "../ui/ui_view";
import { renderTreeView } from "../ui/ui_tree_view";
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
        listOption: { showToolbar: false, showSearchbar: false },
        treeOption: () => ({
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

  it("选中分类后面包屑增加一级，折叠后仍可展开且表格还在", async () => {
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
        showTreeSearchBar: true,
        treeOption: () => ({
          data: [{ id: "c1", label: "添加剂包装物" }],
          selected: "c1",
          selectedNode: { id: "c1", label: "添加剂包装物" },
          showTreeFooter: true,
        }),
      }),
      host,
    );
    expect(host.querySelector(".mmda-breadcrumb")?.textContent).toContain(
      "添加剂包装物",
    );
    expect(host.querySelector(".mmda-list-scroll")).toBeTruthy();
    expect(
      host.querySelector(".mmda-splitter-pane")?.getAttribute("data-collapsible"),
    ).toBe("true");
    const toggle = host.querySelector<HTMLButtonElement>(".mmda-splitter-collapse")!;
    expect(toggle).toBeTruthy();
    toggle.click();
    await nextTick();
    expect(
      host.querySelector(".mmda-splitter-pane")?.getAttribute("data-collapsed"),
    ).toBe("true");
    expect(host.querySelector(".mmda-list-scroll")).toBeTruthy();
    expect(host.querySelector(".mmda-splitter-collapse")).toBeTruthy();
    host.querySelector<HTMLButtonElement>(".mmda-splitter-collapse")!.click();
    await nextTick();
    expect(
      host.querySelector(".mmda-splitter-pane")?.getAttribute("data-collapsed"),
    ).toBeNull();
    expect(host.querySelector(".mmda-tree-view")).toBeTruthy();
    expect(host.querySelector(".mmda-list-scroll")).toBeTruthy();
  });

  it("折叠左树只改布局，不改查询条件", async () => {
    const search = vi.fn();
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    (context as { search?: () => Promise<unknown> }).search = search;
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeListView(context, {
        foreignKey: "categoryID",
        listOption: { showSearchbar: false },
        treeOption: () => ({
          data: [{ id: "c1", label: "添加剂包装物" }],
          selected: "c1",
          selectedNode: { id: "c1", label: "添加剂包装物" },
        }),
      }),
      host,
    );
    host.querySelector<HTMLElement>(".mmda-tree-row")!.click();
    await nextTick();
    expect(context.searchParam.queryParams?.categoryID).toBe("c1");
    const afterSelect = search.mock.calls.length;
    host.querySelector<HTMLButtonElement>(".mmda-splitter-collapse")!.click();
    await nextTick();
    expect(
      host.querySelector(".mmda-splitter-pane")?.getAttribute("data-collapsed"),
    ).toBe("true");
    expect(context.searchParam.queryParams?.categoryID).toBe("c1");
    expect(search.mock.calls.length).toBe(afterSelect);
    expect(host.querySelector(".mmda-breadcrumb")?.textContent).toContain(
      "添加剂包装物",
    );
    host.querySelector<HTMLButtonElement>(".mmda-splitter-collapse")!.click();
    await nextTick();
    expect(
      host.querySelector(".mmda-splitter-pane")?.getAttribute("data-collapsed"),
    ).toBeNull();
    expect(context.searchParam.queryParams?.categoryID).toBe("c1");
    expect(search.mock.calls.length).toBe(afterSelect);
  });

  it("点树只带类别 getAll，模糊搜索清外键后按 SearchParam 查全部", async () => {
    const search = vi.fn();
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    (context as { search?: () => Promise<unknown> }).search = search;
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeListView(context, {
        foreignKey: "categoryID",
        treeOption: () => ({
          data: [{ id: "c1", label: "添加剂包装物" }],
          selected: "c1",
          selectedNode: { id: "c1", label: "添加剂包装物" },
        }),
      }),
      host,
    );
    host.querySelector<HTMLElement>(".mmda-tree-row")!.click();
    await nextTick();
    expect(context.searchParam.queryParams?.categoryID).toBe("c1");
    expect(context.searchParam.searchWord ?? "").toBe("");
    expect(search.mock.lastCall?.[1]?.searchAll).not.toBe(true);
    const input = host.querySelector<HTMLInputElement>(".mmda-searchbar-input")!;
    expect(input).toBeTruthy();
    input.value = "螺丝刀";
    input.dispatchEvent(new Event("change"));
    await nextTick();
    expect(context.searchParam.searchWord).toBe("螺丝刀");
    expect(context.searchParam.queryParams?.categoryID).toBeUndefined();
    expect(search.mock.lastCall?.[1]?.searchAll).not.toBe(true);
    host.querySelector<HTMLElement>(".mmda-tree-row")!.click();
    await nextTick();
    expect(context.searchParam.searchWord ?? "").toBe("");
    expect(context.searchParam.queryParams?.categoryID).toBe("c1");
    expect(search.mock.lastCall?.[1]?.searchAll).not.toBe(true);
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
        showSearchBar: true,
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

  it("buildTreeView 无自定义 footer 时显示选中节点文本", async () => {
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
        selectedNode: { id: "1", label: "苹果" },
        showSearchBar: true,
        showTreeFooter: true,
      }),
      host,
    );
    expect(host.querySelector(".mmda-tree-view-footer-label")?.textContent).toBe(
      "苹果",
    );
    expect(host.querySelector(".mmda-tree-view-collapse")).toBeFalsy();
    const rows = host.querySelectorAll<HTMLElement>(".mmda-tree-row");
    expect(rows[1]).toBeTruthy();
    rows[1]!.click();
    await nextTick();
    expect(host.querySelector(".mmda-tree-view-footer-label")?.textContent).toBe(
      "香蕉",
    );
  });

  it("buildTreeView 有 header 时替换过滤框，无 header 仍画过滤框", () => {
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView({
        data: [{ id: "1", label: "苹果" }],
        showSearchBar: true,
        header: () => h("span", { class: "mmda-test-tree-header" }, "顶"),
      }),
      host,
    );
    expect(host.querySelector(".mmda-test-tree-header")?.textContent).toBe("顶");
    expect(host.querySelector(".mmda-tree-view-header")).toBeTruthy();
    expect(host.querySelector(".mmda-tree-view-search")).toBeFalsy();
    render(
      new TestUiBuilder().buildTreeView({
        data: [{ id: "1", label: "苹果" }],
        showSearchBar: true,
      }),
      host,
    );
    expect(host.querySelector(".mmda-tree-view-header")).toBeFalsy();
    expect(host.querySelector(".mmda-tree-view-search .mmda-factory-input")).toBeTruthy();
  });

  it("buildTreeView footerContent 渲染选中节点描述，footer 仍优先", () => {
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      new TestUiBuilder().buildTreeView({
        data: [{ id: "1", label: "苹果" }],
        selectedNode: { id: "1", label: "苹果", code: "A1" } as any,
        showTreeFooter: true,
        footerContent: (node: { code?: string; label: string }) =>
          h("span", { class: "mmda-test-node-desc" }, `${node.code} ${node.label}`),
      }),
      host,
    );
    expect(host.querySelector(".mmda-test-node-desc")?.textContent).toBe("A1 苹果");
    render(
      new TestUiBuilder().buildTreeView({
        data: [{ id: "1", label: "苹果" }],
        selectedNode: { id: "1", label: "苹果" },
        showTreeFooter: true,
        footer: () => h("span", { class: "mmda-test-tree-footer" }, "脚"),
        footerContent: () => h("span", { class: "mmda-test-node-desc" }, "描述"),
      }),
      host,
    );
    expect(host.querySelector(".mmda-test-tree-footer")?.textContent).toBe("脚");
    expect(host.querySelector(".mmda-test-node-desc")).toBeFalsy();
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
          treeOption: () => ({ data: [{ id: "c1", label: "分类" }] }),
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
          treeOption: () => ({ data: [{ id: "c1", label: "分类" }] }),
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
          showSearchBar: false,
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
          editMode: "contextMenu",
          showSearchBar: false,
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
          editMode: "contextMenu",
          showSearchBar: false,
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

  it("父级重渲不重拉顶层树", async () => {
    let loads = 0;
    const preloader = async () => {
      loads += 1;
      return [{ id: "c1", label: "分类", childrenCount: 0 }];
    };
    const context = new UiViewContext({
      model: {
        list: [{ name: "A" }],
        pagination: { pageNo: 1, pageSize: 10 },
      },
      metaui,
      view: "index",
    });
    const treeOption = () => ({
      repository: "MaterialCats",
      loadMode: "lazy" as const,
      preloader,
      fields: {
        id: "id",
        label: "label",
        childrenCount: "childrenCount",
      },
      showTreeFooter: false,
    });
    const n = ref(0);
    const Parent = defineComponent({
      setup() {
        return () => {
          n.value;
          return new TestUiBuilder().buildTreeListView(context, {
            showTreeSearchBar: false,
            listOption: { showToolbar: false, showSearchbar: false },
            treeOption,
          });
        };
      },
    });
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(h(Parent), host);
    await nextTick();
    await Promise.resolve();
    await nextTick();
    expect(loads).toBe(1);
    n.value += 1;
    await nextTick();
    await Promise.resolve();
    await nextTick();
    expect(loads).toBe(1);
  });

  it("叶子不拉子节点，无 childrenCount 展开才拉", async () => {
    const loads: string[] = [];
    const leaf = { id: "leaf", label: "叶", childrenCount: 0 };
    const unk: { id: string; label: string; children?: unknown[] } = {
      id: "unk",
      label: "未知",
    };
    const host = document.createElement("div");
    hosts.push(host);
    document.body.append(host);
    render(
      renderTreeView(
        new TestUiBuilder().factory,
        {
          loadMode: "lazy",
          fields: {
            id: "id",
            label: "label",
            children: "children",
            childrenCount: "childrenCount",
          },
          showSearchBar: false,
          showTreeFooter: false,
        },
        async (parent) => {
          loads.push(parent ? String(parent.id) : "root");
          return parent ? [] : [leaf, unk];
        },
      ),
      host,
    );
    await nextTick();
    await Promise.resolve();
    await nextTick();
    expect(loads).toEqual(["root"]);
    const expandOf = (label: string) =>
      [...host.querySelectorAll(".mmda-tree-row")]
        .find((row) => row.textContent?.includes(label))
        ?.querySelector<HTMLButtonElement>(".mmda-tree-expand");
    expandOf("叶")!.click();
    await nextTick();
    await Promise.resolve();
    expect(loads).toEqual(["root"]);
    expandOf("未知")!.click();
    await nextTick();
    await Promise.resolve();
    expect(loads).toEqual(["root", "unk"]);
    expect(unk.children).toEqual([]);
    expandOf("未知")!.click();
    await nextTick();
    await Promise.resolve();
    expect(loads).toEqual(["root", "unk"]);
  });
});
