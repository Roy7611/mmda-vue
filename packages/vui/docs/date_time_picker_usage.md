# DateTimePicker：怎么写

设计见 [date_time_picker.md](./date_time_picker.md)。共用属性见 [date_picker.md](./date_picker.md)。

```ts
factory.dateTimePicker({
  value: at,
  step: 15,
  onChange: (next) => (at = next),
})
```

```ts
fieldFactory.dateTimePicker(field, context)
```
