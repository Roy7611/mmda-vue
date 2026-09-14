# metaui/module.ts

- **层**：Data / metaui
- **源码**：[`packages/core/src/metaui/module.ts`](../../src/metaui/module.ts)

## 职责

功能目录与权限位（从 models 迁入）。

与列表查询相关的默认串：

| 字段 | 含义 |
|---|---|
| `defaultFilter` | 固定字段芯片 + 进 index 默认：`[alias.]field[=value]`，多个 `\|` |
| `defaultSort` | 无 `lastQuery` 时的默认排序 |
| `defaultGroupBy` | 默认分组 |

例：`t.status=1`、`status=NEW`、`status=NEW|materialType=LABOR`、`items.xxx=2`（子表别名先解析、本轮不写 filterModel）。

- `t` / 缺省 = 本实体；其它别名留给子组。
- `=NEW` 对选项 `value`/`code`；`=1` 对 JSON `id` 或 pipe 三元组序号，写入仍是 `valueOf`（code）。
- 解析：`DefaultFieldFilter.parse`（models/`entity_search.ts`）。设计见 [entity_search.md](../models/entity_search.md)。

命名查询（CustomizedQuery）不走 `defaultFilter`，工具栏「命名」模式按 `queryName` 搜索。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要把 `defaultFilter` 当 AG FilterModel 或 `queryID;queryName` 去解析。
