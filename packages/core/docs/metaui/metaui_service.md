# metaui/metaui_service.ts

- **层**：Data / metaui
- **源码**：[`packages/core/src/metaui/metaui_service.ts`](../../src/metaui/metaui_service.ts)

## 职责

拉/缓存 MetaUi 与快捷过滤器 pack。允许依赖 net：用 `ApiClient.buildEntityURL` + `http.getJson` 拿 JSON，在本层 `new MetaUi`。

### 本地查询定义

`MetaUiPack` 可带 **`lastQuery?: EntityQuery`**（含 `pager.sorts`）。

- IndexedDB：**库名 = 微服务名**（`base` / `mes`…）；键：`meta/{repository}/query`（不再带 service 前缀）
- `updateForCache` **仅当 pack 显式含 `lastQuery` 字段**时写入该键，避免服务器 pack 冲掉本地上次查询
- 排序 **不**再单独缓存；SSOT 是 EntityQuery 的 `pager.sorts`

打开列表时 vui/Logic 用 `lastQuery` 套到 `searchParam`。详见 [entity_search.md](../models/entity_search.md)、[entity_query_usage.md](../logic/entity_query_usage.md)。

### 联查视图（本地组装）

`assembleViewUi(metaUi, relationName)` 用已有主表 + 子表 `groupUi` 拼扁平联查列，**不** `GET .../metaVui`。

- IDB 键：`meta/{repository}/{relationName}View`（如 `meta/MaterialReturnes/itemsView`）
- 字段 `Object.assign` 新实例，`reference` 与源字段共用
- 子表字段名 `items.fieldName`，原内分组写在 `subGroupLabel`
- 服务端重新写入 metaUi / groupUi（`getPackFromServer` / `putToCache`）时删除对应 `{relationName}View`，下次再组装
- 只改列设置的 `updateForCache` 不删视图；若 pack 带 `metaVui` 则写回 `itemsView`

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要把 sorts 再拆成独立缓存条目。
