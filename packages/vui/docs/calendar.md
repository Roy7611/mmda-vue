# 日历设计

chrome 月视选日，走 `factory.calendar`。EJ2 见 [Calendar Vue 3 getting started](https://ej2.syncfusion.com/vue/documentation/calendar/vue3-getting-started)。日/周/月**事件排程**走 [scheduler.md](./scheduler.md)，不是本控件。

程序员用法：[calendar_usage.md](./calendar_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

带输入框的选日是 [`datePicker`](./date_picker.md) / 字段 `fldFactory.datePicker`，不是本控件。区间用 [`dateRangePicker`](./date_range_picker.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/calendar.ts` | `UiCalendarProps`：值、多选、范围、视图、格子渲染、`locale` |
| 皮肤 `factory/calendar.ts` | SF `CalendarComponent`；Prime 内联 `DatePicker`；Naive 面板 `NDatePicker` |
| Builder | 不要 `buildCalendar`；业务（农历、生产日历）在 Logic 算完再调 factory |

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 单选 `Date \| null`；多选 `Date[]`。也认 `modelValue` |
| `selectionMode` | `single`（默认）/ `multiple`。不要写成 EJ2 `isMultiSelection` / `values` |
| `min` / `max` | 可选区间 |
| `disabled` | 整控件不可用 |
| `firstDayOfWeek` | `0` = 周日。有值时盖过 locale 默认周起始 |
| `view` / `depth` | `'month' \| 'year' \| 'decade'`，对应 EJ2 `start` / `depth` |
| `showTodayButton` | 今天按钮；Prime/Naive 没有则忽略 |
| `showOtherMonth` | 是否显示上/下月填空日；`false` 时挂 `mmda-calendar--no-other-month` |
| `isDateDisabled` | 禁选某一天（休息日不可点） |
| `dayCellRenderer` | 格子内容（公历数字也由你画）。打点、农历、班/休/假走这里 |
| `locale` | BCP 47，如 `zh-Hans` / `en-US`。省略跟应用 i18n。农历不是 locale |
| `onChange` | 与 `value` 同型。也认 `onUpdate:modelValue` |

不暴露 `weekNumber`、`range`、`enableRtl`、`renderDayCell`、Islamic `calendarMode`。

钩子 class：`mmda-calendar`；多选 `mmda-calendar--multiple`。格子示例：`mmda-calendar-day` / `__num` / `__extra` / `__mark`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `value` 单选 | `value` | `modelValue` | 时间戳 |
| `selectionMode: 'multiple'` | `isMultiSelection` + `values` | `selectionMode: 'multiple'` | `type: 'dates'` |
| `onChange` | `change` | `onUpdate:modelValue` | `onUpdate:value` → `Date` / `Date[]` |
| `min` / `max` | `min` / `max` | `minDate` / `maxDate` | 并入 `is-date-disabled` |
| `firstDayOfWeek` | `firstDayOfWeek` | `firstDayOfWeek` / locale | `first-day-of-week` |
| `view` / `depth` | `start` / `depth` | `view`：month→date，year→month，decade→year | 年/月用 `type`；decade 忽略 |
| `showTodayButton` | `showTodayButton` | 无则忽略 | 无则忽略 |
| `locale` | `locale` | DatePicker locale 对象 | ConfigProvider |
| `dayCellRenderer` | `renderDayCell` 格子内 host | `#date` | 有 date 插槽则挂；没有则只显示数字 |

## 源码

- vui：[`calendar.ts`](../src/ui/factory/calendar.ts)
- SF：[`vui-syncfusion/src/factory/calendar.ts`](../../vui-syncfusion/src/factory/calendar.ts)
- Prime：[`vui-primevue/src/factory/calendar.ts`](../../vui-primevue/src/factory/calendar.ts)
- Naive：[`vui-agnaive/src/factory/calendar.ts`](../../vui-agnaive/src/factory/calendar.ts)
