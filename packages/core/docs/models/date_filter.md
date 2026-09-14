# 日期过滤与 Filter API 设计

- **层**：Data / models（传输 net；相对日历 `date_range`；表头 UI 在 vui-agnaive）
- **源码**：[`entity_search.ts`](../../src/models/entity_search.ts)、[`date_filter.ts`](../../src/models/date_filter.ts)、[`date_range.ts`](../../src/models/date_range.ts)
- **程序员怎么写**：[date_filter_usage.md](../logic/date_filter_usage.md)
- **查询总设计**：[entity_search.md](./entity_search.md)

产品分层仍是 **UI → Logic → Data**。皮肤只把勾选收成 `FieldFilter`；Logic 不写日历算法；Data 定义形状，POST 前只展开**绝对**日期 token。框架见 [entity_filter_design.md](./entity_filter_design.md)。

## 问题

DATETIME 列上 `EQ '2026-09-05'` 会漏带时分秒的行。保存成具体 `BETWEEN 本月1日 … 下月1日` 的查询，下个月不能复用。Excel 年→月→日多选若按 AG 叶子原样提交，会变成几百个日，且勾「月」不等于「本月」。

## 形状（不新增 filterType）

仍用已有 Filter API：

| filterType | 日期场景 |
|---|---|
| `date` | 比较（`EQ` / `GT` / `BETWEEN`…）或相对语义 **`WITHIN` + `value`（kind）** |
| `set` | Excel 绝对勾选；`values` 为周期 token |
| `join` | 同一比较器多段 AND/OR（本月 **或** 上月；不相邻绝对区间） |
| `multi` | 同一列叠不同种类（条件页 + 列表页；服务端 AND） |

不新增 `dateSet`。`join` ≠ `multi`：两段 `WITHIN` 用 join；`date` 比较 + `set` 树用 multi。

`operator === 'WITHIN'` 时把 `value` 解释为相对日历 kind。不要另开 `dateKind` 字段：

```json
{ "createdAt": { "filterType": "date", "operator": "WITHIN", "value": "THIS_MONTH" } }
```

`FieldFilter.compact` 会收成上面的形状。

## 谁展开

| 形态 | 保存 EntityQuery | POST `searchAll` | 谁算「现在」 |
|---|---|---|---|
| `WITHIN` + kind | 原样 | **原样**，不要收成日期 | **服务端**（服务器时区） |
| 周期 token `set` | token（可经 `DatePeriodToken.compact`） | `FilterModel.expandDates` → `BETWEEN` 或 `join` OR | 不需要「现在」 |

`toSearchRequest` 调用 `FilterModel.expandDates`。`status: FieldFilter.in(['OPEN'])` 不会被当成日期。`WITHIN` 的 kind 不展开。

服务端应对齐：半开 `[start, next)`，本周周一。TS `dateTimeRange` 只给芯片预览（闭区间 `startOf`/`endOf`），不是 POST 前强制展开。Java 解释 `dateKind` 不在本包。

## 周期 token 与合并

token：`YYYY` | `YYYY-MM` | `YYYY-MM-DD`。先变成半开区间，按 `start` 排序，`prev.next >= next.start` 则合并（相邻或重叠）。

| token | `[start, next)` |
|---|---|
| `2026` | `[2026-01-01, 2027-01-01)` |
| `2026-05` | `[2026-05-01, 2026-06-01)` |
| `2026-05-18` | `[当天 00:00, 次日 00:00)` |

DATETIME 单日不是 `EQ` 零点。`['2026-05','2026-06']` → 一段 `BETWEEN` 到 `2026-07-01 00:00:00`。`['2026-05','2026-06-01','2025-12']` → 两段 `FieldFilter.join('OR', …)`。

`DatePeriodToken.compact(selectedDays, pivotDays)`：pivot 里某年/月叶子被全选则收成 `YYYY` / `YYYY-MM`。勾树上的「2026年9月」是绝对九月，不是 `THIS_MONTH`。

`NOT_IN` 的日期 set **不**展开（不能收成一个 NOT BETWEEN）。

## DateRangeKind

可保存进 `dateKind` 的见 `DATE_RANGE_FILTER_KINDS`（不含 `EARLIER`）。清单与预览：[date_range.md](./date_range.md)。

不补「本月至今」：对已发生的行与 `THIS_MONTH` 相同。

## 表头（vui-agnaive）

日期列默认 `agDateColumnFilter`。显式 `DATE|SET|MULTI` 才是 `agMultiColumnFilter`：

1. **条件**：`agDateColumnFilter`。`filterOptions` = 比较运算符 + `DateRangeKind`（AG 把 kind 摊成 0 输入 option）。`type === 'THIS_MONTH'` → `FieldFilter.dateKind`（`operator: 'WITHIN'`）。Prime / QueryBuilder / SF Menu 是选 `WITHIN` 后再选 kind。两段 AND/OR → `join`。
2. **列表**：Set 勾选树。AG 是 `agSetColumnFilter` + `treeList`；SF Menu 是可折叠「选项过滤」+ EJ2 TreeView。选项都来自 `getPivotDates`（`GET .../pivotDates?field=`），叶子收成 token。

两页都填 = multi AND。不要第三套 Naive 下拉。

## 不要

- 不要在客户端把 `THIS_MONTH` 收成 `2026-09` 再保存。
- 不要对日期列当前页 `getDistinct`。
- 不要改 `SqlDataType` / `toSQL`（那是列类型与时刻字符串，不是语义枚举）。
- 不要让 Data 依赖 logic。
