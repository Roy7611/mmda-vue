import { describe, expect, it } from "vitest";
import {
  categoryCreateParams,
  categoryTreeAuth,
  categoryTreeAuthHasAction,
} from "../ui/ui_tree_category";
import { collectNodeAndDescendantIds } from "../ui/ui_tree";

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
