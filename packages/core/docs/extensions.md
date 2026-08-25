# 原型扩展（@mmda/core）

面向业务与框架开发者。`extensions` 与 [utils](./utils.md) **同属包内最底层**：无状态、不依赖 models / net / metaui。上层（含 `Module.auth`）可以依赖这里；不要反过来。

import `@mmda/core` 会给 **`Date` / `String` / `Number` / `Array` 打补丁**（`sideEffects`）。日期区间筛选用 `dateTimeRange`（见 utils）。这里讲 **某个 `Date` 实例**上的操作，以及同层的 `hasBit` / `toCamel` / `nonNullArray`。

---

## 1. 最小例子

```ts
import '@mmda/core' // 已从应用入口导入则不必再写

const d = new Date().fromSQL('2024-01-02 15:30:00')
if (!d) return

d.toSQL()           // '2024-01-02 15:30:00.000'
d.toSQLDate()       // '2024-01-02'
d.start()           // 当天 0 点
d.weekStart()       // 本周一 0 点（luxon 周）
d.plus({ days: 1 })
d.calculateDiff(other, 'h')

hasBit(ModuleOp.READ | ModuleOp.EDIT, ModuleOp.READ)

'Warehouse'.firstLetterLower() // 'warehouse'
[1, undefined, null].skipUndefined() // [1, null]
```

约定：

- 所有 Date 方法都作用在 **`this`** 上：写 `d.weekStart()`，不要 `d.weekStart(d)`
- `fromSQL` 失败（空串、非法）返回 **`null`**
- 位标志用函数 **`hasBit(value, bit)`**，不要 `Number.prototype` 方法
- luxon 的 `DurationLike` 字段是复数：`{ years: 1, months: 2 }`，不是 `{ year, month }`

---

## 2. Date：SQL 与比较

| 方法 | 作用 |
|---|---|
| `fromSQL(sql?)` | 解析 `yyyy-MM-dd HH:mm:ss`；无效为 `null`。不读 `this` |
| `tryParseDate(sql, orElse?)` | 同上，失败返回 `orElse`（默认 `null`） |
| `toSQL()` / `toSQLDate()` / `toSQLTime()` | 无 offset 的 SQL 串 |
| `toFormat(fmt)` | luxon 格式串 |
| `toRelative()` | 相对现在，如「2 小时前」 |
| `isAfter` / `isBefore` / `isEquals` | 比较（`isEquals` 比 `getTime()`） |
| `plus` / `minus` | luxon duration，返回新 `Date` |

```ts
import { tryParseDate } from '@mmda/core'

const d = tryParseDate(row.createdOn)
if (!d) return
if (d.isBefore(deadline)) { ... }
```

`new Date().fromSQL(sql)` 也能解析，但忽略当前实例，等价于 `tryParseDate(sql)`。新代码用函数。

---

## 3. Date：边界和推移

全部无参（除 `startOf` / `endOf` 的 unit），返回**新** `Date`，不改 `this`。

```ts
const d = DateTime.fromSQL('2024-01-15 12:00:00').toJSDate()

d.start()              // 当天 00:00:00
d.end()                // 当天结束
d.startOf('month')     // 月初
d.endOf('week')
d.yesterday()
d.tomorrow()
d.weekday()            // 1–7，周一 = 1
d.weekStart()          // 同 monday()
d.weekEnd()            // 同 sunday()（luxon 周，默认周一到周日）
d.lastWeekStart()
d.lastSevenDays()      // this 往前 6 天（含今天共 7 天的起点）
d.monthStart() / monthEnd()
d.quarterStart() / quarterEnd()
d.yearStart() / yearEnd()
```

```ts
start.calculateDiff(end)       // 默认小时
start.calculateDiff(end, 'd')  // 天，保留小数（60 小时 → 2.5）
```

单位：`'h' | 'd' | 'w' | 'm' | 'y'`。用完整时分秒，不会先截成日期。

---

## 4. String / Number / Array

```ts
'Foo'.firstLetterLower()           // 'foo'
'foo'.firstLetterUpper()           // 'Foo'
''.firstLetterLower()              // ''（不会抛）
'1234.5'.thousandDigitFormat()     // '1,234.5'

import { toCamel } from '@mmda/core'
toCamel('warehouse')               // 'Warehouse'（实际是首字母大写，不是 camelCase）

import { hasBit } from '@mmda/core'
hasBit(allowOp, ModuleOp.READ) // (value & bit) === bit；权限位留在本层，不必搬到 utils

;(1.2300).toPrecise(6)             // '1.23'  （toFixed 再去尾零）

[1, undefined, null].skipUndefined() // [1, null]  只去掉 undefined
nonNullArray(list)                   // 同上（名字仍叫 nonNull，并不滤 null）
```

金额展示优先 `formatAmount`（见 utils），不要和 `thousandDigitFormat` 混用两套口径。

---

## 5. 和 luxon / utils 怎么选

| 需求 | 用 |
|---|---|
| 筛选「本月 / 近 7 天」 | `dateTimeRange[DateRangeKind.xxx]()` |
| 已有 `Date`，要月初、本周 | `d.monthStart()` / `d.weekStart()` |
| 和后端互传 SQL | `toSQL*` / `tryParseDate` |
| 显示相对时间、工期 | `relativeTime` / `friendlySeconds`（utils） |
| 位标志（如 `ModuleOp`） | `hasBit(value, bit)`（本层函数，models 可直接用） |

不要：`dateTimeRange` 算完再 `someDate.weekStart(someDate)`。区间用表；单点用实例方法。

---

## 6. 常见错误

1. **`d.weekStart(d)`** — 旧写法。现在是 `d.weekStart()`。多传的 Date 会被当成非法参数。
2. **`d.startOf(d, 'day')`** — 改为 `d.startOf('day')`。
3. **`fromSQL` 当实例转换** — 它解析字符串，失败为 `null`。不要假定永远是 `Date`。
4. **`plus({ year: 1 })`** — luxon 要 `years`。
5. **`toCamel` 当 camelCase** — 只把首字母变大写。
6. **`nonNullArray` / `skipUndefined` 去 null** — 只去 `undefined`。
7. **`weekday` 当年中第几周** — 是周几（1=周一）。
8. **两个 `new Date()` 立刻 `isAfter`** — 几乎同毫秒，结果不稳定。

---

## 7. 从旧签名迁移

| 旧（忽略 this，日期当参数） | 新 |
|---|---|
| `d.startOf(d, 'week')` | `d.startOf('week')` |
| `d.start(d)` / `d.end(d)` | `d.start()` / `d.end()` |
| `d.weekStart(d)` / `d.monday(d)` | `d.weekStart()` |
| `d.weekday(d)` | `d.weekday()` |
| `d.yesterday(d)` | `d.yesterday()` |
| `d.lastSevenDays(d)` | `d.lastSevenDays()` |
| `d.monthStart(d)` 以及 quarter/year/lastWeek 同理 | 全部无参 |
| `start.calculateDiff(start, end, 'd')` | `start.calculateDiff(end, 'd')` |
| `allowOp.hasFlag(ModuleOp.READ)` | `hasBit(allowOp, ModuleOp.READ)` |
| `fromSQL` 无效得到 Invalid Date | `null` |
| `''.firstLetterLower()` 抛错 | `''` |
