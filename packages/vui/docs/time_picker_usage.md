# TimePicker：怎么写

设计见 [time_picker.md](./time_picker.md)。共用属性见 [date_picker.md](./date_picker.md)。

```ts
factory.timePicker({
  value: at,
  step: 30,
  onChange: (next) => (at = next),
})
```

```ts
fieldFactory.timePicker(field, context)
```
