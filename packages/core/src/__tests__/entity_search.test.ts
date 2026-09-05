import { describe, expect, it, vi } from "vitest";
import {
  ApiClient,
  toQueryParams,
  toSearchRequest,
} from "../net/api_client";
import { SortOrder } from "../models/pagination";
import {
  defaultSearchParam,
  inFilter,
  parseDefaultFilter,
  parseQueryExpression,
  stringifyQueryExpression,
} from "../models/entity_search";

describe("ApiClient.searchAll", () => {
  it("toQueryParams 合并 pager 与 queryParams", () => {
    const param = defaultSearchParam("仓");
    param.queryParams = { site: "SZ" };
    expect(toQueryParams(param)).toMatchObject({
      pageSize: 20,
      pageNo: 1,
      searchWord: "仓",
      site: "SZ",
    });
  });

  it("filterModel 使用结构化过滤并与 GET 参数分离", () => {
    const param = defaultSearchParam("仓");
    param.queryParams = { status: "OPEN" };
    param.filterModel = {
      quantity: {
        filterType: "number",
        operator: "BETWEEN",
        value: 10,
        valueTo: 20,
      },
      category: { filterType: "set", values: ["A", "B"] },
    };
    const request = toSearchRequest(param);

    expect(request.queryParams).toMatchObject({
      pageSize: 20,
      pageNo: 1,
      searchWord: "仓",
      status: "OPEN",
    });
    expect(request.queryParams).not.toHaveProperty("quantity");
    expect(request.filterModel).toEqual(param.filterModel);
  });

  it("有 filterModel 时 POST JSON body，不发送非法 GET body", async () => {
    const http = {
      baseUrl: "",
      buildJsonHeaders: vi.fn(() => vi.fn()),
      post: vi.fn(async () => ({ list: [], pagination: {} })),
    };
    const api = new ApiClient(http as any, {
      service: "base",
      repository: "Orders",
    });
    const filterModel = {
      status: { filterType: "set" as const, values: ["OPEN"] },
    };
    const param = defaultSearchParam();
    param.filterModel = filterModel;

    await api.searchAll(param, { repository: "Orders" });

    expect(http.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/Orders\/searchAll(?:\?|$)/),
      expect.objectContaining({
        options: { body: JSON.stringify(filterModel) },
      }),
    );
  });

  it("没有复杂字段条件时使用纯 GET", async () => {
    const api = Object.create(ApiClient.prototype) as ApiClient;
    api.getAll = vi.fn(async () => ({ list: [], pagination: {} }) as any);
    const param = defaultSearchParam("仓");
    param.queryParams = { ownerID: "u1" };

    await api.searchAll(param, { repository: "Warehouses" });

    expect(api.getAll).toHaveBeenCalledWith({
      repository: "Warehouses",
      queryParams: expect.objectContaining({
        pageNo: 1,
        pageSize: 20,
        searchWord: "仓",
        ownerID: "u1",
      }),
    });
  });

  it("存在 filterModel 时 POST searchAll，URL 仍保留 queryParams", async () => {
    const http = {
      baseUrl: "",
      buildJsonHeaders: vi.fn(() => vi.fn()),
      post: vi.fn(async () => ({ list: [], pagination: {} })),
    };
    const api = new ApiClient(http as any, {
      service: "base",
      repository: "Orders",
    });
    const param = defaultSearchParam();
    param.queryParams = { filter: "status='OPEN'" };
    param.searchWord = "仓";
    param.filterModel = {
      amount: {
        filterType: "number",
        operator: "BETWEEN",
        value: 10,
        valueTo: 20,
      },
    };

    await api.searchAll(param, { repository: "Orders" });

    expect(http.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/Orders\/searchAll\?/),
      expect.objectContaining({
        options: { body: JSON.stringify(param.filterModel) },
      }),
    );
    const postedUrl = String((http.post as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] ?? "");
    expect(postedUrl).toContain("filter=");
    expect(postedUrl).toContain("searchWord=");
    expect(postedUrl).toContain("pageNo=");
    expect(http.post.mock.calls.length).toBe(1);
  });
});

describe("EntityQuery", () => {
  it("parseDefaultFilter 按 queryID;queryName| 拆芯片", () => {
    expect(parseDefaultFilter("1;全部|2;启用|3;停用")).toEqual([
      { queryID: "1", queryName: "全部" },
      { queryID: "2", queryName: "启用" },
      { queryID: "3", queryName: "停用" },
    ]);
    expect(parseDefaultFilter("|2;启用|;空|缺名")).toEqual([
      { queryID: "2", queryName: "启用" },
    ]);
  });

  it("queryExpression 编解码 EntityQuery，旧 SQL 双读", () => {
    const param = defaultSearchParam("仓");
    param.filterModel = { status: inFilter("USED") };
    param.pager.sorts = [{ sortBy: "code", sortOrder: SortOrder.ASC }];
    const expr = stringifyQueryExpression(param);
    const parsed = parseQueryExpression(expr);
    expect(parsed?.kind).toBe("query");
    if (parsed?.kind === "query") {
      expect(parsed.query.searchWord).toBe("仓");
      expect(parsed.query.filterModel).toEqual(param.filterModel);
      expect(parsed.query.pager.sorts?.[0].sortBy).toBe("code");
    }
    expect(parseQueryExpression("status='OPEN'")?.kind).toBe("sql");
  });
});
