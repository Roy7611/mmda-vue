# net/api_client.ts

- **层**：Data / net
- **源码**：[`packages/core/src/net/api_client.ts`](../../src/net/api_client.ts)

## 职责

实体 REST。列表统一入口 **`searchAll(EntitySearchParam, EntityUrlParam?)`**：

```text
toSearchRequest(param)
  queryParams  ← pager（pageSize/pageNo/sort）+ searchWord + param.queryParams
  filterModel  ← 有键才带
→ 无 filterModel：GET getAll
→ 有 filterModel：POST .../searchAll，body = JSON(EntityFilterModel)
```

| API | 说明 |
|---|---|
| `toQueryParams` | pager + searchWord + 旧 `queryParams` → URL |
| `hasFilterModel` | filterModel 是否有键 |
| `toSearchRequest` | 拆成 URL / body |

`queryParams` **仅兼容**旧 URL 与快捷过滤 SQL。新字段条件进 `filterModel`。鉴权用的 `moduleCode` 放 **第二个参数** `EntityUrlParam.queryParams`，不是查询文档的一部分。

本轮不改成直接吃 FetchApi。不构造 `MetaUi`：`metaui` / `metaUiPack` 只返回 JSON，由 `MetaUiService` 组装。

概念与程序员写法：[entity_search.md](../models/entity_search.md)、[entity_query_usage.md](../logic/entity_query_usage.md)。

## 不要

- 不要 `import` `metaui/` 或 `new MetaUi`。
- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要在 net 层把 EntityQuery 整包当 POST body（body 仍是 FilterModel 映射）。
