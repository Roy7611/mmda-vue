# DateTimePicker 设计

chrome 日期+时间，走 `factory.dateTimePicker`。[EJ2 DateTimePicker](https://ej2.syncfusion.com/vue/documentation/api/datetimepicker/)。

共用输入契约见 [date_picker.md](./date_picker.md)。用法：[date_time_picker_usage.md](./date_time_picker_usage.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/date_time_picker.ts` | `UiDateTimePickerProps`：`step` 分钟缺省 30；format 缺省 `yyyy-MM-dd HH:mm:ss` |
| 皮肤 | SF `DateTimePickerComponent`；Prime `DatePicker` `showTime`；Naive `type: datetime` |
| 字段 `fldFactory.dateTimePicker` | 译字段，调 `createDateTimePicker` |

钩子 class：`mmda-datetimepicker`。

`showShortcuts: true` 仍是今天、昨天（带当前时刻 / 昨天同时刻）。
