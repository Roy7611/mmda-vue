# ColorPicker：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.colorPicker`。设计见 [color_picker.md](./color_picker.md)。

值是 **hex**。不要传 `severity`、不要写厂商 `modeSwitcher`。

```ts
factory.colorPicker({
  value: '#035a',
  mode: 'palette',
  showModeSwitcher: false,
  onChange: (hex) => {},
})
```

Picker 面板（缺省）：

```ts
factory.colorPicker({
  value: '#7b1fa2',
  onChange: (hex) => {},
})
```

要 rgba / hsb 在外面自己从 hex 转，vui 不提供转换函数。

## 表单字段

```ts
fieldFactory.colorPicker(field, context)
```

内部 `colorPickerPropsFromField`：`value` ← `getFieldValue`（hex），只读 → `disabled`。字段只存 hex。

## 不要

- `modeSwitcher` / `presetColors` / `inline` 写进 chrome
- 在 Builder 上再开 `buildColorPicker`
- 字段层再 `control(ColorPickerComponent)`
