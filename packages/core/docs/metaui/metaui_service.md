# metaui/metaui_service.ts

- **层**：Data / metaui
- **源码**：[`packages/core/src/metaui/metaui_service.ts`](../../src/metaui/metaui_service.ts)

## 职责

拉/缓存 `MetaUi`。允许依赖 net：用 `ApiClient.buildEntityURL` + `http.getJson` 拿 JSON，在本层 `new MetaUi`。

服务器 **getMetaUi**：`GET {service}/{repository}/metaui`。响应体就是 `MetaUi` JSON，不再包 `{ metaUi, filters, sorts }`。

默认条件 / 排序不在元数据里：

- 快捷默认条件 → `Module.defaultFilter`（`configureSearch` 里 `DefaultFieldFilter.parse`）
- 默认排序 → `Module.defaultSort`（`EntityQuery.parseDefaultSort`）

上次查询、列设置、待办数、报表模板都不在本服务。见 [entity_logic.md](../logic/entity_logic.md)。

### 缓存

IndexedDB：**库名 = 微服务名**（`base` / `mes`…）；键：`meta/{repository}`（及子表拆分）。不写 `/filters`。

`updateToCache(repository, metaUi, service?)` 只写 MetaUi。只改列设置时不删联查视图。

### 联查视图（本地组装）

`getViewUi` 用已有主表 + 子表 `groupUi` 调 `assembleViewUi`，**不** `GET .../metaVui`。

- IDB 键：`meta/{repository}/{relationName}View`（如 `meta/MaterialReturnes/itemsView`）
- 字段 `Object.assign` 新实例，`reference` 与源字段共用
- 子表字段名 `items.fieldName`，原内分组写在 `subGroupLabel`
- 服务端重新写入 metaUi / groupUi（`get(..., true)` / `putToCache`）时删除对应 `{relationName}View`，下次再组装

Logic 上对应字段叫 `viewUi`。

### 上次查询

键只认 `{repository}/lastQuery`，由 `EntityLogic.getLastQuery` / `putLastQuery` / `deleteLastQuery` 读写 `metaUiService.localDb`。详见 [entity_search.md](../models/entity_search.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要把 sorts / filters 再拆成独立缓存条目。
