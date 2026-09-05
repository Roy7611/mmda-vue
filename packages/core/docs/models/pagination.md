# models/pagination.ts

- **层**：Data / models
- **源码**：[`packages/core/src/models/pagination.ts`](../../src/models/pagination.ts)

## 职责

`Pager` / `PagedList` / `Sort` / `SortOrder`。列表排序的唯一来源是 **`pager.sorts`**（也写在 `EntityQuery.pager` 里）。不要在查询文档或本地缓存里另开 sorts 字段。

`defaultPager`、`PagerCtor`、`parseSorts` / 与 URL 的 `sort=` 互转见源码。Module 默认排序串用 `parseDefaultSort`（在 `entity_search.ts`）。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要把 sorts 从 EntityQuery 拆出去单独持久化。
