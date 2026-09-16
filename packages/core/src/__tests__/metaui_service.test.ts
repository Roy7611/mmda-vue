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
  it("get 消费 MetaUi JSON，不经过 ApiClient.new MetaUi", async () => {
    const getJson = vi.fn(async () => metaJson);
    const api = new ApiClient(
      { getJson } as any,
      { service: "base", repository: "Things" },
    );
    const service = defaultMetaUiService(api);

    const metaUi = await service.get("Things", undefined, true);

    expect(getJson).toHaveBeenCalledWith(
      expect.stringMatching(/Things\/metaui/),
    );
    expect(metaUi).toBeInstanceOf(MetaUi);
    expect(metaUi.objName).toBe("Thing");
  });

  it("按 service 分本地库；key 为 meta/{repository}，不含 service 前缀", async () => {
    const api = new ApiClient({ getJson: vi.fn() } as any, {
      service: "base",
      repository: "Things",
      locale: "zh",
    });
    const service = defaultMetaUiService(api);

    await service.updateToCache("Equipments", new MetaUi(metaJson), "mes");
    await service.updateToCache("Users", new MetaUi(metaJson), "base");

    expect(await service.localDb.get("meta/Users")).toBeTruthy();
    expect(await service.localDb.get("meta/Equipments")).toBeFalsy();
    expect(await service.localDb.get("meta/mes/Equipments")).toBeFalsy();
    expect(await service.localDb.get("meta/base/Users")).toBeFalsy();

    const mesMeta = await service.get("Equipments", "mes");
    expect(mesMeta).toBeInstanceOf(MetaUi);
    expect(mesMeta.objName).toBe("Thing");
  });

  it("getViewUi 本地组装并写入 itemsView", async () => {
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
    await service.updateToCache("Things", metaUi);
    const view = await service.getViewUi({ repository: "Things" });
    expect(getJson).not.toHaveBeenCalled();
    expect(view.objName).toBe("ItemView");
    expect(view.getField("items.itemID")?.fieldName).toBe("items.itemID");
    expect(await service.localDb.get("meta/Things/itemsView")).toBeTruthy();

    const again = await service.getViewUi({ repository: "Things" });
    expect(getJson).not.toHaveBeenCalled();
    expect(again.objName).toBe("ItemView");
  });

  it("服务端重载 MetaUi 后删除 itemsView", async () => {
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
    const getJson = vi.fn(async () => metaJson);
    const api = new ApiClient(
      { getJson } as any,
      { service: "base", repository: "Things" },
    );
    const service = defaultMetaUiService(api);
    await service.updateToCache("Things", new MetaUi(metaJson));
    await service.getViewUi({ repository: "Things" });
    expect(await service.localDb.get("meta/Things/itemsView")).toBeTruthy();

    await service.get("Things", undefined, true);
    expect(await service.localDb.get("meta/Things/itemsView")).toBeFalsy();
  });
});
