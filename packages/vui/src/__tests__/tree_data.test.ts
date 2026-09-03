import { describe, expect, it } from "vitest";
import {
  detectChildrenKey,
  detectTreeSourceShape,
  hierarchyParentCode,
  TREE_PARENT_KEY,
  treeDataProvider,
  treeIdField,
  treeRowId,
  treeRowParentId,
} from "../ui/ui_tree_data";

describe("TreeDataProvider", () => {
  it("点分编码取父", () => {
    expect(hierarchyParentCode("M.01.001")).toBe("M.01");
    expect(hierarchyParentCode("M.01")).toBe("M");
    expect(hierarchyParentCode("M")).toBe("");
  });

  it("扁平 TREE 组装成嵌套且保留原行", () => {
    const root = { id: "1", name: "根", parentId: "" };
    const child = { id: "2", name: "子", parentId: "1" };
    const assembled = treeDataProvider.assemble([root, child], {
      treeShape: "TREE",
      shapeKey: "parentId",
      idField: "id",
      bindShape: "nestedChildren",
    });
    expect(assembled.roots).toEqual([root]);
    expect((root as any).children).toContain(child);
    expect(assembled.rows[0]).toBe(root);
    expect(assembled.rows[1]).toBe(child);
  });

  it("扁平 HIERARCHY 算出父再组树", () => {
    const a = { moduleCode: "M", label: "制造" };
    const b = { moduleCode: "M.01", label: "计划" };
    const c = { moduleCode: "M.01.001", label: "工单" };
    const assembled = treeDataProvider.assemble([a, b, c], {
      treeShape: "HIERARCHY",
      shapeKey: "moduleCode",
      bindShape: "nestedChildren",
    });
    expect(treeRowParentId(c, { treeShape: "HIERARCHY", shapeKey: "moduleCode" })).toBe(
      "M.01",
    );
    expect((c as any)[TREE_PARENT_KEY]).toBe("M.01");
    expect(assembled.roots).toEqual([a]);
    expect((a as any).children[0]).toBe(b);
    expect((b as any).children[0]).toBe(c);
  });

  it("服务端嵌套树不再猜父，只展平", () => {
    const leaf = { id: "2", name: "子" };
    const root = { id: "1", name: "根", children: [leaf] };
    expect(detectTreeSourceShape([root])).toBe("nested");
    const assembled = treeDataProvider.assemble([root], {
      treeShape: "TREE",
      shapeKey: "parentId",
      idField: "id",
      sourceShape: "nested",
    });
    expect(assembled.roots[0]).toBe(root);
    expect(assembled.rows).toContain(root);
    expect(assembled.rows).toContain(leaf);
    expect(treeRowId(leaf, { treeShape: "TREE", shapeKey: "parentId", idField: "id" })).toBe(
      "2",
    );
  });

  it("探测 subModuleAuths 嵌套，复合主键用 id", () => {
    const leaf = { id: "202,B.01", moduleCode: "B.01", moduleLabel: "组织" };
    const root = {
      id: "202,B",
      moduleCode: "B",
      moduleLabel: "BASE",
      subModuleAuths: [leaf],
    };
    expect(detectChildrenKey([root])).toBe("subModuleAuths");
    expect(treeIdField("TREE", "moduleCode", "roleID,moduleCode")).toBe("id");
    const assembled = treeDataProvider.assemble([root], {
      treeShape: "TREE",
      shapeKey: "moduleCode",
      idField: "id",
    });
    expect(assembled.sourceShape).toBe("nested");
    expect(assembled.childrenKey).toBe("subModuleAuths");
    expect(assembled.roots).toEqual([root]);
    expect(assembled.rows).toContain(leaf);
    expect((leaf as any)[TREE_PARENT_KEY]).toBe("202,B");
  });

  it("dataPath：HIERARCHY 按编码分段", () => {
    const row = { moduleCode: "M.01.001" };
    const assembled = treeDataProvider.assemble([row], {
      treeShape: "HIERARCHY",
      shapeKey: "moduleCode",
      bindShape: "dataPath",
    });
    expect(assembled.getDataPath(row)).toEqual(["M", "M.01", "M.01.001"]);
  });
});
