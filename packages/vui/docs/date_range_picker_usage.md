# DateRangePicker：怎么写

设计见 [date_range_picker.md](./date_range_picker.md)。共用属性见 [date_picker.md](./date_picker.md)。

```ts
factory.dateRangePicker({
  value: range,
  separator: ' ~ ',
  onChange: (next) => (range = next),
})
```

本周等自定义：

```ts
factory.dateRangePicker({
  value: range,
  showShortcuts: true,
  shortcuts: [{ label: '本周', value: () => thisWeek() }],
  onChange: (next) => (range = next),
})
```

```ts
fldFactory.dateRangePicker(field, context)
```
