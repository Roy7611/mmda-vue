# DatePicker 设计

chrome 带输入框选日，走 `factory.datePicker`。[EJ2 DatePicker](https://ej2.syncfusion.com/vue/documentation/api/datepicker/)。

选月是同一控件 `precision: 'month'`，捷径 `factory.monthPicker`。月视面板仍是 [calendar.md](./calendar.md)，不要混。

程序员用法：[date_picker_usage.md](./date_picker_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

表单字段走 `fieldFactory.datePicker` / `fieldFactory.monthPicker`：翻译 `MetaUiField` 后调本控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/date_picker.ts` | `UiDatePickerProps`：`value` / `precision` / `allowInput` / `showShortcuts`；`datePickerPropsFromField` |
| 皮肤 `factory/date_picker.ts` | SF `DatePickerComponent`；Prime `DatePicker`；Naive `NDatePicker` `type: date` |
| 字段 `fieldFactory.datePicker` | 译字段，调 `createDatePicker`。`monthPicker` 带 `precision: 'month'` |

**不是** `factory.calendar`。**不要**把 EJ2 `start` / `depth` 写成 vui 属性。

## 属性

共用基类还用于 dateTime / time / range。

| 属性 | 说明 |
|---|---|
| `value` | `Date \| null`。也认 `modelValue` |
| `precision` | `'day'`（缺省）/ `'month'` |
| `min` / `max` | 也认 MES `minDate` / `maxDate` |
| `format` | 选日缺省 `yyyy-MM-dd`；选月缺省 `yyyy-MM`。不是 Prime `yy-mm-dd` |
| `placeholder` | |
| `disabled` | 缺省 false。不暴露 `enabled` |
| `allowInput` | 允许手输。**缺省 false**（只从面板选）。也认 MES `manualInput` |
| `showClear` | 字段 `nullable` 时默认 true |
| `openOnFocus` | 焦点即弹面板 |
| `inputFormats` | 可解析的键入格式 |
| `readonly` | 看得见不可改；与 `disabled` / `allowInput` 三分 |
| `showShortcuts` | 缺省 false。true 时只内置今天、昨天（选月：本月、上月） |
| `shortcuts` | `{ label, value }[]` 自定义，接在内置后面。只传数组不加今天/昨天 |
| `firstDayOfWeek` | `0`=周日；**缺省 `1`（周一）** |
| `onChange` | `(Date \| null)`。也认 `onUpdate:modelValue` / `onUpdate` / `onUpdatePicker` |
| `onClear` / `onFocus` / `onBlur` | |

设了 `min` / `max` / `format` 就必须遵守；不暴露 `strictMode`。

`UiDateShortcut.value` 可以是 `Date`、`[Date, Date]` 或函数。

钩子 class：`mmda-datepicker`；选月 `mmda-datepicker--month`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `value` | `value` | `modelValue` | 时间戳，皮肤转 Date |
| `precision: month` | `start`/`depth: Year` | `view: 'month'` | `type: 'month'` |
| `format` | 原样 | `yyyy`→`yy`，`MM`→`mm` | `yyyy`→`YYYY`，`dd`→`DD` |
| `allowInput` | `allowEdit`（仅 true 才开） | `manualInput` | `inputReadonly` 取反 |
| `disabled` | `enabled: !disabled` | `disabled` | `disabled` |
| `firstDayOfWeek` | 原样 | 原样 | Naive `0`=周一，皮肤换算 |
| `showShortcuts` / `shortcuts` | footer / range `presets` | footer slot | `shortcuts` |

## 源码

- vui [`date_picker.ts`](../src/ui/factory/date_picker.ts)
- Syncfusion [`factory/date_picker.ts`](../../vui-syncfusion/src/factory/date_picker.ts)
- Prime [`factory/date_picker.ts`](../../vui-primevue/src/factory/date_picker.ts)
- Naive [`factory/date_picker.ts`](../../vui-agnaive/src/factory/date_picker.ts)
