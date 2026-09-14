import { describe, expect, it, vi } from "vitest";
import {
  ApiClient,
  toQueryParams,
  toSearchRequest,
} from "../net/api_client";
import { SortOrder } from "../models/pagination";
import {
  EntitySearchParam,
  FieldFilter,
  NamedQueryRef,
  EntityQuery,
  FilterModel,
} from "../models/entity_search";

describe("ApiClient.searchAll", () => {
  it("toQueryParams 合并 pager 与 queryParams", () => {
    const param = EntitySearchParam.create("仓");
    param.queryParams = { site: "SZ" };
    expect(toQueryParams(param)).toMatchObject({
      pageSize: 20,
      pageNo: 1,
      searchWord: "仓",
      site: "SZ",
    });
  });

  it("filterModel 使用结构化过滤并与 GET 参数分离", () => {
    const param = EntitySearchParam.create("仓");
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

  it("advancedFilterModel 不进入 searchAll 请求", () => {
    const param = EntitySearchParam.create();
    param.filterModel = { status: FieldFilter.in("OPEN") };
    param.advancedFilterModel = {
      filterType: "join",
      operator: "OR",
      conditions: [
        {
          fieldName: "age",
          filterType: "number",
          operator: "GT",
          value: 23,
        },
        {
          fieldName: "sport",
          filterType: "text",
          operator: "ENDS_WITH",
          value: "ing",
        },
      ],
    };
    const request = toSearchRequest(param);
    expect(request.filterModel).toEqual(param.filterModel);
    expect(JSON.stringify(request)).not.toContain("sport");
    expect(request.queryParams).not.toHaveProperty("advancedFilterModel");
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
    const param = EntitySearchParam.create();
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
    const param = EntitySearchParam.create("仓");
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
    const param = EntitySearchParam.create();
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

  it("getPivotValues GET pivotValues?field=", async () => {
    const http = {
      baseUrl: "",
      buildJsonHeaders: vi.fn(() => vi.fn()),
      getJson: vi.fn(async () => ["A", "B"]),
    };
    const api = new ApiClient(http as any, {
      service: "base",
      repository: "Orders",
    });
    await expect(api.getPivotValues("status", { reload: true })).resolves.toEqual(
      ["A", "B"],
    );
    expect(http.getJson).toHaveBeenCalledWith(
      expect.stringMatching(/\/Orders\/pivotValues\?/),
      expect.anything(),
    );
    const postedUrl = String(
      (http.getJson as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] ??
        "",
    );
    expect(postedUrl).toContain("field=status");
    expect(postedUrl).toContain("reload=");
  });

  it("getPivotDates GET pivotDates?field=", async () => {
    const http = {
      baseUrl: "",
      buildJsonHeaders: vi.fn(() => vi.fn()),
      getJson: vi.fn(async () => ["2026-05-01", "2026-06-01"]),
    };
    const api = new ApiClient(http as any, {
      service: "base",
      repository: "Orders",
    });
    await expect(api.getPivotDates("createdAt")).resolves.toEqual([
      "2026-05-01",
      "2026-06-01",
    ]);
    expect(http.getJson).toHaveBeenCalledWith(
      expect.stringMatching(/\/Orders\/pivotDates\?/),
      expect.anything(),
    );
    const postedUrl = String(
      (http.getJson as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] ??
        "",
    );
    expect(postedUrl).toContain("field=createdAt");
  });
});

describe("EntityQuery", () => {
  it("NamedQueryRef.parse 按 queryID;queryName| 拆芯片", () => {
    expect(NamedQueryRef.parse("1;全部|2;启用|3;停用")).toEqual([
      { queryID: "1", queryName: "全部" },
      { queryID: "2", queryName: "启用" },
      { queryID: "3", queryName: "停用" },
    ]);
    expect(NamedQueryRef.parse("|2;启用|;空|缺名")).toEqual([
      { queryID: "2", queryName: "启用" },
    ]);
  });

  it("queryExpression 编解码 EntityQuery，旧 SQL 双读", () => {
    const param = EntitySearchParam.create("仓");
    param.filterModel = { status: FieldFilter.in("USED") };
    param.advancedFilterModel = {
      fieldName: "qty",
      filterType: "number",
      operator: "GT",
      value: 10,
    };
    param.pager.sorts = [{ sortBy: "code", sortOrder: SortOrder.ASC }];
    const expr = EntityQuery.stringify(param);
    const parsed = EntityQuery.parse(expr);
    expect(parsed?.kind).toBe("query");
    if (parsed?.kind === "query") {
      expect(parsed.query).not.toHaveProperty("searchWord");
      expect(parsed.query.filterModel).toEqual(param.filterModel);
      expect(parsed.query.advancedFilterModel).toEqual(param.advancedFilterModel);
      expect(parsed.query.pager.sorts?.[0].sortBy).toBe("code");
    }
    expect(EntityQuery.parse("status='OPEN'")?.kind).toBe("sql");
  });
});

describe("IS_BLANK expand", () => {
  it("toSearchRequest 只展开 IS_BLANK / IS_NOT_BLANK", () => {
    const param = EntitySearchParam.create();
    param.filterModel = {
      remark: FieldFilter.blank(),
      note: FieldFilter.blank("IS_NOT_BLANK"),
      toolkitID: FieldFilter.nil(),
      qty: { filterType: "number", operator: "IS_NULL" },
    };
    const request = toSearchRequest(param);
    expect(request.filterModel?.remark).toEqual(
      FieldFilter.join("OR", [
        { filterType: "text", operator: "IS_NULL" },
        { filterType: "text", operator: "EQ", value: "" },
      ]),
    );
    expect(request.filterModel?.note).toEqual(
      FieldFilter.join("AND", [
        { filterType: "text", operator: "IS_NOT_NULL" },
        { filterType: "text", operator: "NEQ", value: "" },
      ]),
    );
    expect(request.filterModel?.toolkitID).toEqual(FieldFilter.nil());
    expect(request.filterModel?.qty).toEqual({
      filterType: "number",
      operator: "IS_NULL",
    });
  });

  it("EQ / NEQ 的空串不当空条件；CONTAINS '' 仍丢掉", () => {
    expect(
      FieldFilter.compact({ filterType: "text", operator: "EQ", value: "" }),
    ).toEqual({ filterType: "text", operator: "EQ", value: "" });
    expect(
      FieldFilter.compact({
        filterType: "text",
        operator: "CONTAINS",
        value: "",
      }),
    ).toBeUndefined();
    expect(FieldFilter.compact(FieldFilter.blank())).toEqual(FieldFilter.blank());
  });

  it("FilterModel.expandBlank 递归 join / multi，不 compact", () => {
    const expanded = FilterModel.expandBlank({
      name: FieldFilter.join("AND", [
        FieldFilter.blank(),
        { filterType: "text", operator: "CONTAINS", value: "仓" },
      ]),
    });
    expect(expanded?.name).toMatchObject({
      filterType: "join",
      operator: "AND",
    });
    const join = expanded?.name as ReturnType<typeof FieldFilter.join>;
    expect(join.conditions[0]).toEqual(
      FieldFilter.join("OR", [
        { filterType: "text", operator: "IS_NULL" },
        { filterType: "text", operator: "EQ", value: "" },
      ]),
    );
  });
});

describe("EntityFilter join/multi", () => {
  it("FieldFilter.join / FieldFilter.multi round-trip through FilterModel.clone", () => {
    const join = FieldFilter.join("AND", [
      { filterType: "text", operator: "CONTAINS", value: "a" },
      { filterType: "text", operator: "CONTAINS", value: "b" },
    ]);
    const multi = FieldFilter.multi([
      { filterType: "text", operator: "CONTAINS", value: "仓" },
      FieldFilter.in(["LABOR", "PART"]),
    ]);
    const model = { name: join, category: multi };
    const cloned = FilterModel.clone(model)!;
    expect(cloned).toEqual(model);
    expect(cloned.name).not.toBe(join);
    expect((cloned.name as typeof join).conditions).not.toBe(join.conditions);
    expect((cloned.category as typeof multi).filterModels).not.toBe(
      multi.filterModels,
    );
  });

  it("FieldFilter.combineCompareAndSet 摊平单块、两块则 multi", () => {
    expect(
      FieldFilter.combineCompareAndSet({
        filterType: "text",
        operator: "CONTAINS",
        value: "a",
      }),
    ).toEqual({
      filterType: "text",
      operator: "CONTAINS",
      value: "a",
    });
    expect(FieldFilter.combineCompareAndSet(undefined, FieldFilter.in("OPEN"))).toEqual(
      FieldFilter.in("OPEN"),
    );
    expect(
      FieldFilter.combineCompareAndSet(
        { filterType: "text", operator: "CONTAINS", value: "a" },
        FieldFilter.in("OPEN"),
      ),
    ).toEqual(
      FieldFilter.multi([
        { filterType: "text", operator: "CONTAINS", value: "a" },
        FieldFilter.in("OPEN"),
      ]),
    );
  });
});

describe("ApiClient.searchJoinList", () => {
  it("没有复杂字段条件时 GET getJoinList", async () => {
    const http = {
      baseUrl: "",
      buildJsonHeaders: vi.fn(() => vi.fn()),
      get: vi.fn(async () => ({ list: [], pagination: {} })),
    };
    const api = new ApiClient(http as any, {
      service: "base",
      repository: "Orders",
    });
    await api.searchJoinList(EntitySearchParam.create("仓"), { repository: "Orders" });
    expect(http.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/Orders\/getJoinList\?/),
      expect.anything(),
    );
  });

  it("存在 filterModel 时 POST searchJoinList", async () => {
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
    const param = EntitySearchParam.create();
    param.filterModel = filterModel;
    await api.searchJoinList(param, { repository: "Orders" });
    expect(http.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/Orders\/searchJoinList(?:\?|$)/),
      expect.objectContaining({
        options: { body: JSON.stringify(filterModel) },
      }),
    );
  });
});
