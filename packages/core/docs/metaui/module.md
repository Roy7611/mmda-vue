# metaui/module.ts

- **层**：Data / metaui
- **源码**：[`packages/core/src/metaui/module.ts`](../../src/metaui/module.ts)

## 职责

功能目录与权限位（从 models 迁入）。

与列表查询相关的默认串：

| 字段 | 含义 |
|---|---|
| `defaultFilter` | 命名查询芯片：`queryID;queryName\|queryID;queryName`（**不是** FilterModel JSON） |
| `defaultSort` | 未选中命名查询时的默认排序 |
| `defaultGroupBy` | 默认分组 |

解析芯片：`parseDefaultFilter`（在 models/`entity_search.ts`）。设计见 [entity_search.md](../models/entity_search.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要把 `defaultFilter` 当 AG FilterModel 去 `JSON.parse`。
