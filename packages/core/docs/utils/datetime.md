# utils/datetime.ts

- **层**：Data / utils
- **源码**：packages/core/src/utils/datetime.ts

## 职责

日期工具。**不给全局 `Date.prototype` 打补丁**（架构门禁禁 `declare global`，见 `src/__tests__/architecture_gate.test.ts`），全部以纯函数 / `DateUtils` 命名空间提供；内部实现走 luxon `DateTime`。

## 导出

| API | 签名 | 用途 |
|---|---|---|
| `DateUtils.fromSQL` | `(value?: string) => Date \| null` | SQL 字符串转 `Date`，非法值给 `null` |
| `tryParseDate` | `(value?: string, orElse?: Date \| null) => Date \| null` | 同上，但失败时可指定兜底值（写回字段、校验的常用入口） |
| `DateUtils.toSQL` | `(date: Date) => string` | `Date` → SQL 字符串（不带时区偏移） |
| `DateUtils.toSQLDate` / `toSQLTime` | `(date: Date) => string` | 仅日期 / 仅时间 |
| `DateUtils.toFormat` | `(date: Date, format: string) => string` | luxon 格式串格式化 |
| `DateUtils.toRelative` | `(date: Date) => string` | 相对时间（「3 天前」） |
| `DateUtils.isAfter` / `isBefore` / `isEquals` | `(date: Date, other: Date) => boolean` | 比较 |
| `DateUtils.calculateDiff` | `(start, end, format?: 'h' \| 'd' \| 'w' \| 'm' \| 'y') => number` | 差值，默认小时 |
| `DateUtils.plus` / `minus` | `(date: Date, duration: DurationLike) => Date` | 推移（`{ days: 1 }`） |
| `DateUtils.startOf` / `endOf` | `(date: Date, unit: DateTimeUnit) => Date` | 边界 |
| `DateUtils.start` / `end` / `yesterday` / `tomorrow` / `weekday` | 单参 | 当日边界、前后一天、星期几 |
| `DateUtils.weekStart` / `weekEnd` / `monday` / `sunday` / `lastWeekStart` / `lastWeekEnd` / `lastSevenDays` | 单参 | 周范围（`monday` = `startOf('week')`） |
| `DateUtils.monthStart` / `monthEnd` / `quarterStart` / `quarterEnd` / `yearStart` / `yearEnd` | 单参 | 月 / 季 / 年边界 |

## 从原型扩展迁移（原 `extensions/datetime_extensions.ts`）

调用形态从「挂在实例上」改为「工具 + 显式入参」，**方法名全部保留**，所以是机械改写：

```ts
// 旧
const d = '2026-09-20'.toDateTime()
if (d.isAfter(other)) { … }
const next = d.plus({ days: 1 })

// 新
const d = DateUtils.fromSQL('2026-09-20')   // 或 tryParseDate(s, null)
if (d && DateUtils.isAfter(d, other)) { … }
const next = DateUtils.plus(d!, { days: 1 })
```

注意：`fromSQL` / `tryParseDate` 返回 `Date | null`（旧扩展直接抛），调用方要自己收空值。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
- 不要再给 `Date.prototype` 加方法（门禁会红）；新工具加在 `DateUtils` 上。