# logic/sql_operator.ts

- **层**：Logic
- **源码**：[`packages/core/src/logic/sql_operator.ts`](../../src/logic/sql_operator.ts)

## 职责

`SqlOperator`、`defaultSqlOps`、`getSqlOperator`、`getFieldSqlOps`、`getFieldFilterOps`。

**只**用于：

- 元数据 `reference.where` / 其它 where 片段
- Logic `refFilter` 拼 SQL

**不要**用于列表主路径。列表字段条件用 models 的 `EntityFilterOperator` + `EntityFilterModel`，经 `searchAll` 的 `filterModel` 提交。

已删除旧名 **SearchOp** / `getSearchOp` / `getFieldSearchOps`。

## 与 EntityFilterOperator 的关系

`SqlOperator.name` 与 `EntityFilterOperator` 同名（`EQ` / `GE` / `IN` / `BETWEEN` …）。

| API | 返回 |
|---|---|
| `getSqlOperator(op)` | 带 `toSQL` / `parameters` 的 `SqlOperator` |
| `getFieldSqlOps(field)` | 该字段可用的 `SqlOperator[]`（含 `toSQL`） |
| `getFieldFilterOps(field)` | 同集合的名字：`EntityFilterOperator[]`（给表头/搜索栏） |

`parameters`：值个数（`IS_NULL` 为 0，`BETWEEN` 为 2，`IN` 视为多值）。UI 用它决定要不要编辑值，不要依赖已删除的 SearchOp 对象。

标签：i18n `matcher.${op}`，不要改 `SqlOperator` 上的可变 `label`。

## 示例

```ts
import { getSqlOperator, getFieldFilterOps } from '@mmda/core'

// refFilter
const frag = getSqlOperator('NOT_IN')!.toSQL(['CANCELED', 'CLOSED'])
// → "NOT IN CANCELED,CLOSED" 一类片段，再拼进 `status ${frag}`

// 表头可选运算符
const ops = getFieldFilterOps(field)
```

程序员完整用法见 [entity_query_usage.md](./entity_query_usage.md)。设计见 [entity_search.md](../models/entity_search.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要把 `toSQL` 结果塞进列表 `queryParams` 当新代码主路径。
