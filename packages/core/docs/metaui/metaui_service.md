# metaui/metaui_service.ts

- **层**：Data / metaui
- **源码**：[`packages/core/src/metaui/metaui_service.ts`](../../src/metaui/metaui_service.ts)

## 职责

拉/缓存 MetaUi 与快捷过滤器 pack。允许依赖 net：用 `ApiClient.buildEntityURL` + `http.getJson` 拿 JSON，在本层 `new MetaUi`。

### 本地查询定义

`MetaUiPack` 可带 **`lastQuery?: EntityQuery`**（含 `pager.sorts`）。

- IndexedDB 键：`meta/{cacheRepo}/query`
- `updateForCache` **仅当 pack 显式含 `lastQuery` 字段**时写入该键，避免服务器 pack 冲掉本地上次查询
- 排序 **不**再单独缓存；SSOT 是 EntityQuery 的 `pager.sorts`

打开列表时 vui/Logic 用 `lastQuery` 套到 `searchParam`。详见 [entity_search.md](../models/entity_search.md)、[entity_query_usage.md](../logic/entity_query_usage.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要把 sorts 再拆成独立缓存条目。
