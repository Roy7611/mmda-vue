# 日历：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.calendar`。设计见 [calendar.md](./calendar.md)。参数名约定见 [factory.md](./factory.md)。

```ts
import { h } from 'vue'

factory.calendar({
  value: [new Date(2020, 0, 1), new Date(2020, 0, 15)],
  selectionMode: 'multiple',
  min: new Date(2017, 4, 9),
  max: new Date(2017, 4, 15),
  firstDayOfWeek: 1,
  view: 'month',
  depth: 'month',
  showTodayButton: true,
  showOtherMonth: true,
  locale: 'zh-Hans',
  isDateDisabled: (d) => d.getDay() === 0,
  onChange: (v) => { /* Date | Date[] | null */ },
})
```

单选把 `selectionMode` 省略，`value` 用 `Date | null`。

## 格子：打点 / 农历 / 生产日历

`dayCellRenderer` 替换格子内部。禁选走 `isDateDisabled`；格子上的「班 / 休 / 假」只是展示。

vui **不算农历、不绑** MES `WorkCalendar`。第三方农历、节气、工厂日历在 Logic 算完再画。

```ts
dayCellRenderer: ({ date }) => {
  const lunar = lunarOf(date)
  const shift = workDayOf(date)
  return h('div', { class: 'mmda-calendar-day' }, [
    h('span', { class: 'mmda-calendar-day__num' }, date.getDate()),
    lunar ? h('span', { class: 'mmda-calendar-day__extra' }, lunar) : null,
    shift
      ? h('span', { class: `mmda-calendar-day__mark mmda-calendar-day--${shift}` }, labelOf(shift))
      : null,
  ])
}
```

- 日程打点：`__mark` 放小点，数据按日索引。
- 农历 + 节气：接入第三方计算。`locale: 'zh-Hans'` 只换公历 UI 文案。
- 生产日历：读 `WorkCalendar` / `WorkCalendarDay`，不要把实体塞进 `UiCalendarProps`。

## 不要

- 写成 EJ2 `isMultiSelection` / `values` / `renderDayCell` / `start: 'Month'`
- 在 Builder 上再开 `buildCalendar`
- 把本控件当成带输入框的 `datePicker`（见 [date_picker.md](./date_picker.md)）
