# ComboBox：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.comboBox`。设计见 [combo_box.md](./combo_box.md)。

```ts
factory.comboBox({
  value: 'LABOR',
  options: [
    { value: 'LABOR', label: '劳动力' },
    { value: 'CONSUMABLE', label: '办公用品' },
  ],
  onChange: (value) => {},
})
```

只允许列表内的值：

```ts
factory.comboBox({
  value: 'A',
  options: ['A', 'B'],
  allowCustom: false,
  onChange: (value) => {},
})
```

选项带 `group` / `icon`、远程 `suggest` 与 [dropDownList](./drop_down_list_usage.md) 相同。

## 表单字段

```ts
fieldFactory.comboBox(field, context)
```

内部 `comboBoxPropsFromField`：同一套取值/选项规则，另透传 `allowCustom`。
