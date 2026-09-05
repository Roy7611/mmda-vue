// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { ApiClient, MetaUi, defaultMetaUiService } from "../index";

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
    expect(pack.metaui).toBeInstanceOf(MetaUi);
    expect(pack.metaui.objName).toBe("Thing");
  });
});
