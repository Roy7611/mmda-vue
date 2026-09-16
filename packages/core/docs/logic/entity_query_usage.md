# 列表查询：程序员怎么写

从 `@mmda/core` 导入。不要 `@mmda/core/src/...`。设计见 [entity_search.md](../models/entity_search.md)。日期 / `dateKind` / Excel token 见 [date_filter_usage.md](./date_filter_usage.md)。SQL 片段见 [sql_operator.md](./sql_operator.md)。

## 列表只走 `searchAll`

```ts
import {
  EntitySearchParam,
  FieldFilter,
} from '@mmda/core'

const param = EntitySearchParam.create('仓')
param.filterModel = {
  status: FieldFilter.in('USED'),
  materialType: FieldFilter.notIn(['LABOR']),
}

const page = await this.apiClient.searchAll(param, {
  repository: 'Materials',
  service: 'base',
  queryParams: { moduleCode: this.module?.moduleCode ?? '' },
})
```

- 空 `filterModel`（或没有键）：客户端 **GET** `getAll`。
- 有字段条件：客户端 **POST** `.../searchAll`，body 是 `FilterModel`。
- Query Builder 的树写在 `advancedFilterModel`，**不要** POST 进 `searchAll`（服务端尚未接）。

```ts
search.advancedFilterModel = {
  filterType: 'join',
  operator: 'OR',
  conditions: [
    { fieldName: 'age', filterType: 'number', operator: 'GT', value: 23 },
    { fieldName: 'sport', filterType: 'text', operator: 'ENDS_WITH', value: 'ing' },
  ],
}
```
- `moduleCode` 等鉴权放 **第二个参数** 的 `queryParams`，不要塞进 EntityQuery。

## 条件进 `filterModel`

```ts
filterModel: {
  status: FieldFilter.in(['OPEN', 'USED']),
  categoryID: FieldFilter.eq(id),
  toolkitID: FieldFilter.nil(), // IS_NULL
  qty: {
    filterType: 'number',
    operator: 'BETWEEN',
    value: 10,
    valueTo: 100,
  },
}
```

| 工厂 | 结果 |
|---|---|
| `FieldFilter.in(v)` | set + `IN` |
| `FieldFilter.notIn(v)` | set + `NOT_IN` |
| `FieldFilter.eq(v, filterType?)` | 简单相等，默认 `text` |
| `FieldFilter.between(from, to)` | `date` + `BETWEEN` |
| `FieldFilter.dateKind('THIS_MONTH')` | `WITHIN` + `value`（kind），POST 原样带 kind |
| `FieldFilter.nil('IS_NULL' \| 'IS_NOT_NULL')` | 真 NULL（数字 / 日期 / 外键） |
| `FieldFilter.blank('IS_BLANK' \| 'IS_NOT_BLANK')` | 字符串没内容；POST 展开成 `IS_NULL OR = ''` |

可复用「本月」：

```ts
import { FieldFilter } from '@mmda/core'

param.filterModel = { createdAt: FieldFilter.dateKind('THIS_MONTH') }
```

Excel 勾选绝对年月日用 `FieldFilter.in(['2026-05', '2026-06-01'])`。完整日期示例（本月 OR 上月、pivot 树、常见坑）见 [date_filter_usage.md](./date_filter_usage.md)。

不要再写：

```ts
// 旧写法，不要
queryParams: {
  status: getSqlOperator('IN')!.toSQL('USED'),
}
```

`queryParams` 只给旧调用和快捷过滤 SQL（`filter=`）兼容。新状态、外键、表头条件一律 `filterModel`。

## 默认字段芯片

`Module.defaultFilter`：

```text
t.status=1
status=NEW|materialType=LABOR
items.xxx=2
```

```ts
import { DefaultFieldFilter } from '@mmda/core'

const items = DefaultFieldFilter.parse(module.defaultFilter)
// [{ alias: 't', fieldName: 'status', rawDefault: '1' }, ...]

searchParam.filterModel = DefaultFieldFilter.applySelfToModel(
  searchParam.filterModel,
  items,
  (name) => metaUi.getField(name),
)
```

`t` / 无别名才写入本实体 `filterModel`；`items.xxx` 本轮跳过。`=1` 对 enum 选项 `id`（或 pipe 序号），写入仍是 `valueOf`（code）。

命名查询（CustomizedQuery）走工具栏「命名」搜索，不绑 `defaultFilter`。套用：

```ts
import { EntityQuery } from '@mmda/core'

const parsed = EntityQuery.parse(customized.queryExpression)
if (parsed?.kind === 'query') {
  EntityQuery.apply(context.searchParam, parsed.query)
}
```

无 `lastQuery` 时用 `module.defaultSort`（`EntityQuery.parseDefaultSort`）；有查询以该查询的 `pager.sorts` 为准。

## 保存 / 套用 CustomizedQuery

```ts
import {
  EntityQuery,
} from '@mmda/core'

customized.objName = 'Material'
customized.queryName = '启用物料'
customized.queryExpression = EntityQuery.stringify(
  EntityQuery.copy(context.searchParam),
)
```

`EntityQuery.copy` 会丢掉 `queryParams`，只保留可保存文档。

## 打开列表时的默认

vui 侧典型顺序（Logic 也可自己做）：

1. 本地 `{repository}/lastQuery`（一份 EntityQuery，含 pager）
2. 否则用户选中的 CustomizedQuery
3. 否则 `Module.defaultSort`（无 sorts 时）
4. 字段条件始终来自当前 `searchParam.filterModel`

持久化上次查询时把 `EntityQuery.lastCache(searchParam)` 写入 `{repository}/lastQuery`，不要单存 sorts。没保存查询不写 `filterModel`。

## `refWhere` 才用 `SqlOperator`

元数据 `reference.where` 是硬限制，不可改写。业务加码用 Logic `refWhere`，与 `where` AND：

```ts
import { getSqlOperator } from '@mmda/core'

this.field('materialID').refWhere((model) => {
  const status = getSqlOperator('IN')!.toSQL('USED')
  return `status ${status}`
})
```

表头/搜索栏可选运算符：

```ts
import { getFieldFilterOps } from '@mmda/core'

const ops = getFieldFilterOps(field) // EntityFilterOperator[]
```

UI 文案：`t('matcher.' + op)`。

## 常见坑

| 错误 | 正确 |
|---|---|
| 字段条件写进 `queryParams` | 写进 `filterModel` |
| Query Builder 树摊进 `filterModel` | 放 `advancedFilterModel`；跨列 OR 不能压成列 map |
| 列表调 `getAll` 拼过滤 | 调 `searchAll` |
| 另存一份 sorts 到 IndexedDB | 只存 EntityQuery（含 `pager.sorts`） |
| `defaultFilter` 当 FilterModel JSON 或 `queryID;queryName` | 按 `[alias.]field[=value]` 解析（`DefaultFieldFilter.parse`） |
| 用 SearchOp / label 对象 | 已删除；用 `EntityFilterOperator` + i18n |
| 把本月存成 `FieldFilter.in(['2026-09'])` | `FieldFilter.dateKind('THIS_MONTH')`，见 [date_filter_usage.md](./date_filter_usage.md) |

## 相关

- 设计：[entity_search.md](../models/entity_search.md)
- 日期过滤：[date_filter.md](../models/date_filter.md) · [date_filter_usage.md](./date_filter_usage.md)
- 传输：[api_client.md](../net/api_client.md)
- 模块默认：[module.md](../metaui/module.md)
- 上次查询 / MetaUi：[metaui_service.md](../metaui/metaui_service.md)
- vui 列表：[list.md](../../../vui/docs/list.md)
