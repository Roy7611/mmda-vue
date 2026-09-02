import { describe, expect, it } from "vitest";
import {
  categoryCreateParams,
  categoryTreeAuth,
  categoryTreeAuthHasAction,
} from "../ui/ui_tree_category";
import {
  collectNodeAndDescendantIds,
  mapTreeNodes,
  treeShouldLoadChildren,
} from "../ui/ui_tree";

const fields = {
  id: "categoryID",
  label: "categoryName",
  parentId: "parentCatID",
};

describe("category tree helpers", () => {
  it("按模块权限和节点 editable/deletable 计算菜单条件", () => {
    expect(categoryTreeAuth(undefined).allowRead).toBe(true);
    expect(
      categoryTreeAuth({
        authority: {
          allowRead: true,
          allowCreate: false,
          allowEdit: true,
          allowDelete: true,
        },
      } as any).allowCreate,
    ).toBe(false);
    expect(
      categoryTreeAuth(
        {
          authority: {
            allowRead: true,
            allowCreate: true,
            allowEdit: true,
            allowDelete: true,
          },
        } as any,
        { editable: false, deletable: true },
      ).allowEdit,
    ).toBe(false);
    expect(
      categoryTreeAuthHasAction({
        allowRead: false,
        allowCreate: false,
        allowEdit: false,
        allowDelete: false,
      }),
    ).toBe(false);
    expect(
      categoryTreeAuthHasAction({
        allowRead: true,
        allowCreate: false,
        allowEdit: false,
        allowDelete: false,
      }),
    ).toBe(true);
  });

  it("收集节点及其全部子孙 id", () => {
    const data = [
      { categoryID: "a", categoryName: "A", parentCatID: "" },
      { categoryID: "b", categoryName: "B", parentCatID: "a" },
      { categoryID: "c", categoryName: "C", parentCatID: "b" },
      { categoryID: "d", categoryName: "D", parentCatID: "" },
    ];
    expect(collectNodeAndDescendantIds(data, data[0], fields)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(collectNodeAndDescendantIds(data, data[3], fields)).toEqual(["d"]);
  });

  it("按根/子/兄弟生成创建参数", () => {
    const node = {
      categoryID: "b",
      categoryName: "B",
      parentCatID: "a",
      depth: 1,
      materialX: "ToolFlask",
    };
    expect(categoryCreateParams("root", node, fields)).toMatchObject({
      parentCatID: "",
      depth: 0,
    });
    expect(categoryCreateParams("child", node, fields)).toMatchObject({
      parentCatID: "b",
      depth: 2,
      materialX: "ToolFlask",
    });
    expect(categoryCreateParams("sibling", node, fields)).toMatchObject({
      parentCatID: "a",
      depth: 1,
    });
  });
});

describe("tree children load rules", () => {
  const withCount = { children: "children", childrenCount: "childrenCount" };

  it("有 childrenCount 时 0 是叶子，已是数组不再拉", () => {
    expect(
      treeShouldLoadChildren({ childrenCount: 0 }, withCount),
    ).toBe(false);
    expect(
      treeShouldLoadChildren({ childrenCount: 2 }, withCount),
    ).toBe(true);
    expect(
      treeShouldLoadChildren({ childrenCount: 2, children: [] }, withCount),
    ).toBe(false);
    expect(
      treeShouldLoadChildren(
        { childrenCount: 2, children: [{ id: "c" }] },
        withCount,
      ),
    ).toBe(false);
  });

  it("没有 childrenCount 则未加载就要查，查完数组不再查", () => {
    expect(treeShouldLoadChildren({ id: "a" }, { children: "children" })).toBe(
      true,
    );
    expect(
      treeShouldLoadChildren({ id: "a", children: [] }, { children: "children" }),
    ).toBe(false);
    expect(
      mapTreeNodes([{ id: "a" }], { children: "children" })[0].hasChildren,
    ).toBe(true);
    expect(
      mapTreeNodes([{ id: "a", children: [] }], { children: "children" })[0]
        .hasChildren,
    ).toBe(false);
    expect(
      mapTreeNodes([{ id: "a", childrenCount: 0 }], withCount)[0].hasChildren,
    ).toBe(false);
    expect(
      mapTreeNodes([{ id: "a", childrenCount: 3 }], withCount)[0].hasChildren,
    ).toBe(true);
    const flat = mapTreeNodes(
      [
        { categoryID: "a", categoryName: "A", parentCatID: "" },
        { categoryID: "b", categoryName: "B", parentCatID: "a" },
        { categoryID: "c", categoryName: "C", parentCatID: "" },
      ],
      fields,
    );
    expect(flat.find((node) => node.id === "a")?.hasChildren).toBe(true);
    expect(flat.find((node) => node.id === "c")?.hasChildren).toBe(false);
  });

  it("嵌套子节点不升成根，childrenCount 仍算可展开", () => {
    const child = {
      id: "c",
      label: "添加剂包装物",
      parentId: "p",
      childrenCount: 0,
    };
    const parent = {
      id: "p",
      label: "包装物",
      childrenCount: 1,
      children: [child],
    };
    const mapped = mapTreeNodes([parent, child], {
      ...withCount,
      id: "id",
      label: "label",
      parentId: "parentId",
    });
    expect(mapped).toHaveLength(1);
    expect(mapped[0].id).toBe("p");
    expect(mapped[0].hasChildren).toBe(true);
    expect(mapped[0].children).toHaveLength(1);
    expect(mapped[0].children[0].id).toBe("c");
  });
});
