# TimePicker 设计

chrome 时刻，走 `factory.timePicker`。[EJ2 TimePicker](https://ej2.syncfusion.com/vue/documentation/api/timepicker/)。

值仍是 `Date`（只用时分秒）。共用输入契约见 [date_picker.md](./date_picker.md)。用法：[time_picker_usage.md](./time_picker_usage.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/time_picker.ts` | `UiTimePickerProps`：`step` 分钟缺省 30；format 缺省 `HH:mm:ss` |
| 皮肤 | SF `TimePickerComponent`；Prime `DatePicker` `timeOnly`；Naive `type: time` |
| 字段 `fldFactory.timePicker` | 译字段，调 `createTimePicker` |

钩子 class：`mmda-timepicker`。快捷日期忽略。
