# NumberInput：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.numberInput`。设计见 [number_input.md](./number_input.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/numerictextbox/vue3-getting-started)、[formats](https://ej2.syncfusion.com/vue/documentation/numerictextbox/formats)。

值是 **`number | null`**。`format` 用 EJ2 语法。不要写 `NumericTextBox` / `InputNumber` / Prime `mode: 'currency'` 进 vui。

```ts
factory.numberInput({
  value: model.qty,
  min: 0,
  decimals: 3,
  placeholder: '数量',
  onChange: (value) => (model.qty = value),
})
```

带单位后缀：

```ts
factory.numberInput({
  value: model.weight,
  suffix: 'KG',
  step: 0.1,
  onChange: (value) => (model.weight = value),
})
```

百分数（chrome 也可直接写 `kind: 'percent'`）：

```ts
factory.numberInput({
  kind: 'percent',
  value: model.rate,
  format: 'p2',
  onChange: (value) => (model.rate = value),
})
```

货币展示走 `format: 'c'` / `'c2'`，不要另开 `currency` 属性。

`modelValue` / `onUpdate` 也认（MES 现有写法）。误传的 `maxFractionDigits` 会归一成 `decimals`。

## 表单字段

```ts
fldFactory.numberInput(field, context)
fldFactory.positiveNumberInput(field, context) // min: 0
fldFactory.negativenumberInput(field, context) // max: 0
fldFactory.percentInput(field, context)        // kind: 'percent'
```

内部 `numberInputPropsFromField`：
- `value` ← `getFieldValue`（空 → `null`）
- `decimals` ← `scale` / `numericScale`
- `step` ← 显式才覆盖；否则 number `1`、percent `0.01`
- `format` ← 显式或按 kind 缺省 `n` / `p`
- `suffix` ← 字段 `suffix`（SF 还可从纯单位 `formatter` 解析）

不要在字段层再 `control(NumericTextBoxComponent)` / `InputNumber` / `NInputNumber`。

## 不要

- 在 Builder 上再开 `buildNumberInput`
- 把字段展示 `formatter`（单位文本）当成 NumericTextBox `format`
- 把 EJ2 `currency`（货币代码）/`validateDecimalOnType` 写进 vui
- 按 `decimals` 自动推 `step = 10^-decimals`
- 用 mask / OTP 代替数值录入
