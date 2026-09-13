// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  ApiClient,
  MetaUi,
  MetaUiGroup,
  defaultMetaUiService,
} from "../index";
import { createMockField } from "./helpers/metaui_mock";

const metaJson = {
  objName: "Thing",
  displayLabel: "物",
  groups: [
    {
      groupName: "a1",
      groupLabel: "主",
      many: false,
      fields: [] as any[],
    },
  ],
};

describe("MetaUiService 从 JSON 构造 MetaUi", () => {
  it("fetchPackFromServer 消费 metaUi JSON，不经过 ApiClient.new MetaUi", async () => {
    const getJson = vi.fn(async () => ({
      filters: [],
      metaUi: metaJson,
    }));
    const api = new ApiClient(
      { getJson } as any,
      { service: "base", repository: "Things" },
    );
    const service = defaultMetaUiService(api);

    const pack = await service.fetchPackFromServer({ repository: "Things" });

    expect(getJson).toHaveBeenCalledWith(
      expect.stringMatching(/Things\/metaUiPack/),
    );
    expect(pack.metaUi).toBeInstanceOf(MetaUi);
    expect(pack.metaUi.objName).toBe("Thing");
  });

  it("按 service 分本地库；key 为 meta/{repository}，不含 service 前缀", async () => {
    const api = new ApiClient({ getJson: vi.fn() } as any, {
      service: "base",
      repository: "Things",
      locale: "zh",
    });
    const service = defaultMetaUiService(api);
    const pack = { metaUi: metaJson, filters: [] };

    await service.updateForCache("Equipments", pack as any, "mes");
    await service.updateForCache("Users", pack as any, "base");

    // 宿主 localDb = base 库：有 Users，没有 mes 的 Equipments
    expect(await service.localDb.get("meta/Users")).toBeTruthy();
    expect(await service.localDb.get("meta/Equipments")).toBeFalsy();
    // 不再使用 meta/{service}/{repository}
    expect(await service.localDb.get("meta/mes/Equipments")).toBeFalsy();
    expect(await service.localDb.get("meta/base/Users")).toBeFalsy();

    // mes 库命中缓存，不再请求网络
    const mesPack = await service.getPack({
      repository: "Equipments",
      service: "mes",
    });
    expect(mesPack.metaUi).toBeInstanceOf(MetaUi);
    expect(mesPack.metaUi.objName).toBe("Thing");
  });

  it("getMetaVui 本地组装并写入 itemsView", async () => {
    const getJson = vi.fn();
    const api = new ApiClient(
      { getJson } as any,
      { service: "base", repository: "Things" },
    );
    const service = defaultMetaUiService(api);
    const metaUi = new MetaUi({
      objName: "Thing",
      displayLabel: "物",
      primaryKey: "id",
      groups: [
        MetaUiGroup.master({
          groupName: "a1",
          groupLabel: "主",
          fields: [
            createMockField({ fieldName: "id", listed: true }),
          ],
        }),
        MetaUiGroup.sub({
          groupName: "items",
          groupLabel: "明细",
          relObjName: "Item",
          joinOn: "id=@id",
          requiredAny: true,
          allowJoinList: true,
          groupUi: new MetaUi({
            objName: "Item",
            displayLabel: "明细",
            primaryKey: "itemID",
            groups: [
              {
                groupName: "a1",
                groupLabel: "行",
                many: false,
                fields: [
                  createMockField({ fieldName: "itemID", listed: true }),
                ],
              },
            ],
          }),
        }),
      ],
    });
    await service.updateForCache("Things", { metaUi, filters: [] });
    const view = await service.getMetaVui({ repository: "Things" });
    expect(getJson).not.toHaveBeenCalled();
    expect(view.objName).toBe("ThingJoin");
    expect(view.getField("items.itemID")?.fieldName).toBe("items.itemID");
    expect(await service.localDb.get("meta/Things/itemsView")).toBeTruthy();

    const again = await service.getMetaVui({ repository: "Things" });
    expect(getJson).not.toHaveBeenCalled();
    expect(again.objName).toBe("ThingJoin");
  });

  it("服务端重载 pack 后删除 itemsView", async () => {
    const metaJson = {
      objName: "Thing",
      displayLabel: "物",
      primaryKey: "id",
      groups: [
        {
          groupName: "a1",
          groupLabel: "主",
          many: false,
          fields: [{ fieldName: "id", displayLabel: "id", fieldIdx: 0, dataType: 12, nullable: true, listed: true }],
        },
        {
          groupName: "items",
          groupLabel: "明细",
          many: true,
          relObjName: "Item",
          joinOn: "id=@id",
          requiredAny: true,
          allowJoinList: true,
          groupUi: {
            objName: "Item",
            displayLabel: "明细",
            primaryKey: "itemID",
            groups: [
              {
                groupName: "a1",
                groupLabel: "行",
                many: false,
                fields: [
                  { fieldName: "itemID", displayLabel: "行号", fieldIdx: 0, dataType: 12, nullable: true, listed: true },
                ],
              },
            ],
          },
        },
      ],
    };
    const getJson = vi.fn(async () => ({
      filters: [],
      metaUi: metaJson,
    }));
    const api = new ApiClient(
      { getJson } as any,
      { service: "base", repository: "Things" },
    );
    const service = defaultMetaUiService(api);
    await service.updateForCache("Things", { metaUi: new MetaUi(metaJson), filters: [] });
    await service.getMetaVui({ repository: "Things" });
    expect(await service.localDb.get("meta/Things/itemsView")).toBeTruthy();

    await service.fetchPackFromServer({ repository: "Things" }, true);
    expect(await service.localDb.get("meta/Things/itemsView")).toBeFalsy();
  });
});
