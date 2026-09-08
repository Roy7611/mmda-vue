# DateRangePicker 设计

chrome 日期区间，走 `factory.dateRangePicker`。[EJ2 DateRangePicker](https://ej2.syncfusion.com/vue/documentation/api/daterangepicker/)。

值只暴露 `[Date, Date] | null`，不要拆成厂商 `startDate` / `endDate`。单日仍用 [date_picker.md](./date_picker.md)。用法：[date_range_picker_usage.md](./date_range_picker_usage.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/date_range_picker.ts` | `UiDateRangePickerProps`：`separator` 缺省 ` ~ `；`minDays` / `maxDays` |
| 皮肤 | SF `DateRangePickerComponent`；Prime `selectionMode: range`；Naive `type: daterange` |
| 字段 `fldFactory.dateRangePicker` | 译字段，调 `createDateRangePicker` |

format 缺省 `yyyy-MM-dd`。`showShortcuts: true` 时今天/昨天是起止同一天的区间。自定义 `shortcuts` 的 `value` 用 `[Date, Date]`。

钩子 class：`mmda-daterangepicker`。

皮肤把元组拆给厂商；Naive 时间戳元组在皮肤内转 Date。
