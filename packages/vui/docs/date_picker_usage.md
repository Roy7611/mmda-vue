# DatePicker：怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.datePicker`。设计见 [date_picker.md](./date_picker.md)。

```ts
factory.datePicker({
  value: due,
  min: start,
  onChange: (next) => (due = next),
})
```

选月捷径（仍是 DatePicker，`precision: 'month'`）：

```ts
factory.monthPicker({
  value: month,
  onChange: (next) => (month = next),
})
```

允许手输、快捷今天/昨天，再加自定义：

```ts
factory.datePicker({
  value: due,
  allowInput: true,
  showShortcuts: true,
  shortcuts: [{ label: '上周日', value: () => lastSunday() }],
  onChange: (next) => (due = next),
})
```

字段：

```ts
fieldFactory.datePicker(field, context)
fieldFactory.monthPicker(field, context)
```

内部 `datePickerPropsFromField`：`value` ← `getFieldValue`（Date），只读 → `disabled`，`nullable` → `showClear`。
