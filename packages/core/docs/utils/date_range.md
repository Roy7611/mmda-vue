# utils/date_range.ts

- **层**：Data / utils
- **源码**：[`packages/core/src/utils/date_range.ts`](../../src/utils/date_range.ts)
- **列表语义过滤**：[date_filter.md](../models/date_filter.md) · [date_filter_usage.md](../logic/date_filter_usage.md)

## 职责

预定义相对日历区间，给芯片、看板、`dateKind` 预览。`dateTimeRange[kind]()` **每次按 `DateTime.now()`** 算闭区间（`startOf` / `endOf`）。列表 POST 的 `dateKind` **不要**在这里展开成 BETWEEN；服务端用半开 `[start, next)`。

周钉死 **ISO 周一**，不要跟浏览器 locale 漂。

## kind

| `DateRangeKind` | 含义 | 可进 `dateKind` |
|---|---|---|
| `TODAY` / `YESTERDAY` / `TOMORROW` | 今天 / 昨天 / 明天 | 要 |
| `THIS_WEEK` / `LAST_WEEK` / `NEXT_WEEK` | 本周 / 上周 / 下周 | 要 |
| `LAST_7_DAYS` / `LAST_30_DAYS` / `LAST_90_DAYS` | 含今天共 N 个日历日 | 要 |
| `THIS_MONTH` / `LAST_MONTH` / `NEXT_MONTH` | 自然月 | 要 |
| `THIS_QUARTER` / `LAST_QUARTER` | 自然季 | 要 |
| `THIS_YEAR` / `LAST_YEAR` | 自然年 | 要 |
| `EARLIER` | UI「更早」 | **不要** |

`DATE_RANGE_FILTER_KINDS` / `isDateRangeKind` 不含 `EARLIER`。`dateTimeRange[DateRangeKind.EARLIER]` 类型上不存在。

```ts
import { DateRangeKind, dateTimeRange, toDateRange } from '@mmda/core'

const luxonRange = dateTimeRange[DateRangeKind.THIS_MONTH]()
const { start, end } = toDateRange(luxonRange)
```

## 不要

- 不要用本函数的结果覆盖保存查询里的 `dateKind`。
- 不要让 Data 依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。
- 不要改 `Date.prototype.toSQL` 来表达「本月」（那是时刻字符串）。
