# RadioButtonGroup：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.radioButtonGroup`。设计见 [radio_button_group.md](./radio_button_group.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/radio-button/vue-3-getting-started)。

绑定语义与 [DropDownList](./drop_down_list.md) 相同：单选标量，enum / 小表 ref。选项少用组，多了用下拉。不要 `ejs-radiobutton` / `radioGroup`。不要 `factory.radioButton`。不要 `selectButtonGroup` 当字段 enum 编辑器。

```ts
factory.radioButtonGroup({
  value: model.kind,
  options: [
    { value: 'LABOR', label: '劳动力' },
    { value: 'CONSUMABLE', label: '办公用品' },
  ],
  onChange: (value) => (model.kind = value),
})
```

Logic 手写对象选项（MES）：

```ts
factory.radioButtonGroup({
  value: model.qualified,
  options: [
    { value: true, text: '合格' },
    { value: false, text: '不合格' },
  ],
  optionLabel: 'text',
  optionValue: 'value',
  onChange: (value) => (model.qualified = value),
})
```

## 表单字段

元数据显式指定（不改 enum 缺省下拉）：

```ts
fieldFactory.radioButtonGroup(field, context)
```

内部 `radioButtonGroupPropsFromField`（复用 DropDownList 同源）：
- 选项 ← `refOptions` + `valueOf` / `labelOf`（enum / ref）
- `hasOne` 且无 `extra.options` → 空数组
- `value` ← `getFieldValue`（空 → `null`）
- 写回命中选项对象则写对象
- 没有 `suggest` / 过滤

不要在字段层再 `h(RadioButtonComponent)` / Prime `RadioButton` / `NRadio`。

## 不要

- 在 Builder 上再开 `buildRadioButtonGroup`
- 把 hasOne 当小表灌进选项
- 把 0–1 bits / 数组当成单选值
- 用 `selectButtonGroup` 或 `checkBoxList` 代替本控件
