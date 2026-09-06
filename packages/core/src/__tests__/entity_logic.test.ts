import { describe, expect, it, vi } from "vitest";
import { Entity, EntityLogic, ApiProblem, type EntityLogicInit } from "../index";
import { createMockField, createMockMetaUi } from "./helpers/metaui_mock";

class Item extends Entity {
  id?: string;
  name?: string;
  constructor(o?: object) {
    super();
    Object.assign(this, o);
  }
}

class ItemLogic extends EntityLogic<Item> {}

function createLogic(api: Record<string, unknown> = {}) {
  const metaUi = createMockMetaUi([
    createMockField({ fieldName: "name", displayLabel: "名称" }),
  ]);
  const init: EntityLogicInit = {
    repository: "Items",
    apiService: "base",
    meta: { metaUi } as any,
    module: { moduleCode: "A.01", objName: "Item" } as any,
    metaUiService: {
      getApiClient: () => api,
      getPack: vi.fn(async () => ({ metaUi })),
      findModule: vi.fn(),
    } as any,
  };
  return { logic: new ItemLogic((o) => new Item(o), init), metaUi, init };
}

describe("EntityLogic", () => {
  it("field 从元数据取出 FieldLogic", () => {
    const { logic } = createLogic();
    expect(logic.field("name").field.fieldName).toBe("name");
    expect(() => logic.field("missing")).toThrow(/missing field/);
  });

  it("getAll 走 searchAll 并包成实体", async () => {
    const searchAll = vi.fn(async () => ({
      list: [{ id: "1", name: "a" }],
      pagination: { pageIndex: 1, pageSize: 20, total: 1 },
    }));
    const { logic } = createLogic({ searchAll });
    const page = await logic.getAll();
    expect(searchAll).toHaveBeenCalled();
    expect(page?.list[0]).toBeInstanceOf(Item);
    expect(page?.list[0].name).toBe("a");
  });

  it("searchRelative 用传入的 repository 并委托 getAllOf", async () => {
    const searchAll = vi.fn(async () => ({ list: [], pagination: {} }));
    const { logic } = createLogic({ searchAll });
    await logic.searchRelative({ pager: { pageSize: 10 } }, { repository: "Warehouses" });
    expect(searchAll).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ repository: "Warehouses", service: "base" }),
    );
  });

  it("getAllOf / loadOf 打别的仓库且不包成本实体", async () => {
    const searchAll = vi.fn(async () => ({
      list: [{ id: "b1" }],
      pagination: {},
    }));
    const getOne = vi.fn(async () => ({ id: "m1", name: "mat" }));
    const { logic } = createLogic({ searchAll, getOne });
    const page = await logic.getAllOf<{ id: string }>("Boms", { pager: { pageSize: 10 } }, { service: "mes" });
    expect(searchAll).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ repository: "Boms", service: "mes" }),
    );
    expect(page?.list[0]).not.toBeInstanceOf(Item);
    expect(page?.list[0].id).toBe("b1");
    const row = await logic.loadOf<{ id: string; name: string }>("Materials", "m1", { service: "base" });
    expect(getOne).toHaveBeenCalledWith("m1", expect.objectContaining({ repository: "Materials", service: "base" }));
    expect(row).not.toBeInstanceOf(Item);
    expect(row?.name).toBe("mat");
  });

  it("save 调用 saveOne", async () => {
    const saveOne = vi.fn(async () => 1);
    const { logic } = createLogic({ saveOne });
    await logic.save(new Item({ id: "1", name: "n" }));
    expect(saveOne).toHaveBeenCalled();
  });

  it("doAction 把错误体转成 ApiProblem", async () => {
    const doAction = vi.fn(async () => ({
      status: 400,
      error: "Bad",
      message: "fail",
    }));
    const { logic } = createLogic({ doAction });
    await expect(
      logic.doAction(new Item({ id: "1" }), { name: "approve" } as any),
    ).rejects.toBeInstanceOf(ApiProblem);
  });
});
