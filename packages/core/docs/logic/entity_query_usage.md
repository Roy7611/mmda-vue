# 列表查询：程序员怎么写

从 `@mmda/core` 导入。不要 `@mmda/core/src/...`。设计见 [entity_search.md](../models/entity_search.md)。SQL 片段见 [sql_operator.md](./sql_operator.md)。

## 列表只走 `searchAll`

```ts
import {
  defaultSearchParam,
  inFilter,
  notInFilter,
  eqFilter,
  nullFilter,
} from '@mmda/core'

const param = defaultSearchParam('仓')
param.filterModel = {
  status: inFilter('USED'),
  materialType: notInFilter(['LABOR']),
}

const page = await this.apiClient.searchAll(param, {
  repository: 'Materials',
  service: 'base',
  queryParams: { moduleCode: this.module?.moduleCode ?? '' },
})
```

- 空 `filterModel`（或没有键）：客户端 **GET** `getAll`。
- 有字段条件：客户端 **POST** `.../searchAll`，body 是 `EntityFilterModel` 映射。
- `moduleCode` 等鉴权放 **第二个参数** 的 `queryParams`，不要塞进 EntityQuery。

## 条件进 `filterModel`

```ts
filterModel: {
  status: inFilter(['OPEN', 'USED']),
  categoryID: eqFilter(id),
  toolkitID: nullFilter(), // IS_NULL
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
| `inFilter(v)` | set + `IN` |
| `notInFilter(v)` | set + `NOT_IN` |
| `eqFilter(v, filterType?)` | 简单相等，默认 `text` |
| `nullFilter('IS_NULL' \| 'IS_NOT_NULL')` | 空值判断 |

不要再写：

```ts
// 旧写法，不要
queryParams: {
  status: getSqlOperator('IN')!.toSQL('USED'),
}
```

`queryParams` 只给旧调用和快捷过滤 SQL（`filter=`）兼容。新状态、外键、表头条件一律 `filterModel`。

## 命名查询芯片

`Module.defaultFilter`：

```text
1;全部|2;启用|3;停用
```

```ts
import { parseDefaultFilter } from '@mmda/core'

const chips = parseDefaultFilter(module.defaultFilter)
// [{ queryID: '1', queryName: '全部' }, ...]
```

芯片显示 `queryName`，点选用 `queryID` 加载 `CustomizedQuery`，再：

```ts
import {
  parseQueryExpression,
  applyEntityQuery,
} from '@mmda/core'

const parsed = parseQueryExpression(customized.queryExpression)
if (parsed?.kind === 'query') {
  applyEntityQuery(context.searchParam, parsed.query)
}
```

未选中命名查询时用 `module.defaultSort`（`parseDefaultSort`）；有查询以该查询的 `pager.sorts` 为准。

## 保存 / 套用 CustomizedQuery

```ts
import {
  toEntityQuery,
  stringifyQueryExpression,
} from '@mmda/core'

customized.objName = 'Material'
customized.queryName = '启用物料'
customized.queryExpression = stringifyQueryExpression(
  toEntityQuery(context.searchParam),
)
```

`toEntityQuery` 会丢掉 `queryParams`，只保留可保存文档。

## 打开列表时的默认

vui 侧典型顺序（Logic 也可自己做）：

1. 本地 pack 的 `lastQuery`（一份 EntityQuery，含 pager）
2. 否则用户选中的 CustomizedQuery
3. 否则 `Module.defaultSort`（无 sorts 时）
4. 字段条件始终来自当前 `searchParam.filterModel`

持久化上次查询时把整个 `toEntityQuery(searchParam)` 写入 pack 的 `lastQuery`，不要单存 sorts。

## `refFilter` 才用 `SqlOperator`

元数据 `reference.where` 是硬限制，不可改写。业务加码用 Logic `refFilter`，与 `where` AND：

```ts
import { getSqlOperator } from '@mmda/core'

this.field('materialID').refFilter((model) => {
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
| 列表调 `getAll` 拼过滤 | 调 `searchAll` |
| 另存一份 sorts 到 IndexedDB | 只存 EntityQuery（含 `pager.sorts`） |
| `defaultFilter` 当 FilterModel JSON 解析 | 按 `queryID;queryName\|…` 解析芯片 |
| 用 SearchOp / label 对象 | 已删除；用 `EntityFilterOperator` + i18n |

## 相关

- 设计：[entity_search.md](../models/entity_search.md)
- 传输：[api_client.md](../net/api_client.md)
- 模块默认：[module.md](../metaui/module.md)
- 本地 pack：[metaui_service.md](../metaui/metaui_service.md)
- vui 列表：[list.md](../../../vui/docs/list.md)
