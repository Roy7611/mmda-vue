# 日期过滤与 Filter API：程序员怎么写

从 `@mmda/core` 导入。不要 `@mmda/core/src/...`。设计见 [date_filter.md](../models/date_filter.md)。列表总用法见 [entity_query_usage.md](./entity_query_usage.md)。

## 可复用：本月 / 今天

```ts
import { dateKindFilter, defaultSearchParam } from '@mmda/core'

const param = defaultSearchParam()
param.filterModel = { createdAt: dateKindFilter('THIS_MONTH') }

await this.apiClient.searchAll(param, { repository: 'Orders' })
```

POST body **仍带** `dateKind: 'THIS_MONTH'`。下个月打开同一 CustomizedQuery 仍是「当时的本月」。不要先算成 `BETWEEN '2026-09-01' AND …` 再保存。

```ts
import { joinFilter, dateKindFilter } from '@mmda/core'

// 本月或上月
param.filterModel = {
  createdAt: joinFilter('OR', [
    dateKindFilter('THIS_MONTH'),
    dateKindFilter('LAST_MONTH'),
  ]),
}
```

可用 kind：`TODAY` `YESTERDAY` `TOMORROW` `THIS_WEEK` `LAST_WEEK` `NEXT_WEEK` `LAST_7_DAYS` `LAST_30_DAYS` `LAST_90_DAYS` `THIS_MONTH` `LAST_MONTH` `NEXT_MONTH` `THIS_QUARTER` `LAST_QUARTER` `THIS_YEAR` `LAST_YEAR`。不要把 `EARLIER` 写入 filterModel。

芯片预览（闭区间，给人看，不是 POST）：

```ts
import { DateRangeKind, dateTimeRange } from '@mmda/core'

const { start, end } = dateTimeRange[DateRangeKind.THIS_MONTH]()
```

## 绝对：Excel 年月日

```ts
import { inFilter } from '@mmda/core'

param.filterModel = {
  createdAt: inFilter(['2026-05', '2026-06-01']),
}
```

`searchAll` → `expandDateFilters`：相邻合成半开 `BETWEEN`（上界不含）。不相邻 → `join` OR。保存路径请留 token，不要先展开。

对照 pivot 收成年/月（表头树已做）：

```ts
import { compactDateSet } from '@mmda/core'

const tokens = compactDateSet(
  ['2026-05-01', '2026-05-15'],
  ['2026-05-01', '2026-05-15', '2026-06-01'],
)
// ['2026-05']
```

树的选项：

```ts
const days = await this.apiClient.getPivotDates('createdAt', {
  repository: 'Orders',
})
```

`GET {service}/{repository}/pivotDates/{field}`。不要对日期列当前页 distinct。

## 比较区间（绝对时刻）

```ts
import { betweenFilter, eqFilter } from '@mmda/core'

param.filterModel = {
  createdAt: betweenFilter('2026-05-01 00:00:00', '2026-07-01 00:00:00'),
}
```

这是死日期，不能当「本月」保存。DATETIME 勾一天请用 token `2026-05-18`（会展开成 `[当天, 次日)`），不要 `eqFilter('2026-05-18', 'date')`。

## 条件 + 列表（multi）

表头两页都填时是 AND：

```ts
import { combineCompareAndSet, dateKindFilter, inFilter } from '@mmda/core'

param.filterModel = {
  createdAt: combineCompareAndSet(
    dateKindFilter('THIS_YEAR'),
    inFilter(['2026-05', '2026-06']),
  ),
}
```

少见。通常要么 kind，要么树。

## 保存查询

```ts
customized.queryExpression = stringifyQueryExpression(
  toEntityQuery(context.searchParam),
)
```

`toEntityQuery` 不会调用 `expandDateFilters`。`searchAll` 才会展开绝对 token。

## 常见坑

| 错误 | 正确 |
|---|---|
| 把本月存成 `inFilter(['2026-09'])` | `dateKindFilter('THIS_MONTH')` |
| 客户端把 `dateKind` 收成 BETWEEN 再 POST | 原样 POST，服务端展开 |
| DATETIME 上 `EQ` 某一天 | 日 token 或半开 `BETWEEN` |
| 日期列 `getDistinct` 当前页 | `getPivotDates` |
| `EARLIER` 写进 filterModel | 只做 UI 哨兵 |
| 新 `filterType: 'dateSet'` | 用已有 `set` + token |

## 相关

- 设计：[date_filter.md](../models/date_filter.md)
- 查询总设计 / 总用法：[entity_search.md](../models/entity_search.md) · [entity_query_usage.md](./entity_query_usage.md)
- 区间枚举：[date_range.md](../utils/date_range.md)
- 传输：[api_client.md](../net/api_client.md)
- vui 表头：[list.md](../../../vui/docs/list.md)
