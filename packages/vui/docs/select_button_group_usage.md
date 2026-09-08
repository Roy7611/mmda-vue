# SelectButtonGroup：程序员怎么写

分段选一个或多个值。设计见 [select_button_group.md](./select_button_group.md)。不要包进 `buttonGroup`。

```ts
builder.factory.selectButtonGroup(align, {
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  optionLabel: 'label',
  optionValue: 'value',
  onUpdate: setAlign,
})

builder.factory.selectButtonGroup(styles, {
  selectionMode: 'multiple',
  options: [
    { label: 'Bold', value: 'bold' },
    { label: 'Italic', value: 'italic' },
  ],
  onUpdate: setStyles,
})
```

`htmlAttributes` 透传到壳。不要把 `class` 塞进去。
