import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../net/api_client";
import { defaultSearchParam } from "../models/entity_search";

describe("ApiClient.searchEntities", () => {
  it("searchAll 使用 POST JSON body，不发送非法 GET body", async () => {
    const http = {
      baseUrl: "",
      buildJsonHeaders: vi.fn(() => vi.fn()),
      post: vi.fn(async () => ({ list: [], pagination: {} })),
    };
    const api = new ApiClient(http as any, {
      service: "base",
      repository: "Orders",
    });
    const body = {
      status: { filterType: "set" as const, values: ["OPEN"] },
    };

    await api.searchAll(body, { repository: "Orders" });

    expect(http.post).toHaveBeenCalledWith(
      expect.stringContaining("/Orders"),
      expect.objectContaining({
        options: { body: JSON.stringify(body) },
      }),
    );
  });

  it("没有复杂字段条件时使用纯 GET", async () => {
    const api = Object.create(ApiClient.prototype) as ApiClient;
    api.getAll = vi.fn(async () => ({ list: [], pagination: {} }) as any);
    api.searchAll = vi.fn(async () => ({ list: [], pagination: {} }) as any);
    const param = defaultSearchParam("仓");
    param.queryParams = { ownerID: "u1" };

    await api.searchEntities(param, { repository: "Warehouses" });

    expect(api.getAll).toHaveBeenCalledWith({
      repository: "Warehouses",
      queryParams: expect.objectContaining({
        pageNo: 1,
        pageSize: 10,
        searchWord: "仓",
        ownerID: "u1",
      }),
    });
    expect(api.searchAll).not.toHaveBeenCalled();
  });

  it("存在 filterModel 时 body 走 searchAll，URL 仍保留 queryParams", async () => {
    const api = Object.create(ApiClient.prototype) as ApiClient;
    api.getAll = vi.fn(async () => ({ list: [], pagination: {} }) as any);
    api.searchAll = vi.fn(async () => ({ list: [], pagination: {} }) as any);
    const param = defaultSearchParam();
    param.queryParams = { filter: "status='OPEN'" };
    param.searchParams = {
      amount: {
        filterType: "number",
        operator: "BETWEEN",
        value: 10,
        valueTo: 20,
      },
    };

    await api.searchEntities(param, { repository: "Orders" });

    expect(api.searchAll).toHaveBeenCalledWith(param.searchParams, {
      repository: "Orders",
      queryParams: expect.objectContaining({
        filter: "status='OPEN'",
        pageNo: 1,
        pageSize: 10,
      }),
    });
    expect(api.getAll).not.toHaveBeenCalled();
  });
});
