# Stepper：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.stepper`。设计见 [stepper.md](./stepper.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/stepper/vue-3-getting-started)。

值是 **当前步索引**。vui 名是 **`stepper`**。不要写 `ejs-stepper` / `StepperComponent` / Prime `Stepper` / `NSteps` 进 vui。

```ts
factory.stepper({
  value: model.phase,
  items: [
    { label: '填写', icon: 'edit' },
    { label: '审核' },
    { label: '完成' },
  ],
  onChange: (value) => {
    model.phase = value
  },
})
```

竖排、按序（`orientation` 是 `UiOrientation`）：

```ts
factory.stepper({
  value: model.phase,
  items: [{ label: '甲' }, { label: '乙' }, { label: '丙' }],
  orientation: 'vertical',
  linear: true,
})
```

子表行不必先建成 `UiStepperItem`；用字段名或函数绑定：

```ts
factory.stepper({
  value: model.current,
  items: model.phases,
  labelField: 'phaseName',
  textField: (row) => row.remark ?? '',
  iconField: 'iconCss',
  statusField: (row) => (row.done ? 'completed' : 'inProgress'),
})
```

缺省无 `*Field` 时仍直读行上的 `label` / `text` / `icon` / `status` 等。

`modelValue` 也认。`onReady` 拿 `next` / `previous` / `reset`。

## 表单字段

```ts
fieldFactory.stepper(field, context, {
  items: model.phases,
  labelField: 'phaseName',
})
```

内部 `stepperPropsFromField`：
- `value` ← `getFieldValue`（空 → `0`）
- `items` / `*Field` ← extra
- `onChange` → `setFieldValue`

不要在字段层再 `h(StepperComponent)` / Prime `Steps` / `NSteps`。

## 不要

- 在 Builder 上再开 `buildStepper`
- 把 EJ2 `Horizontal` / `Default` 写进 vui（用 `vertical` / `indicator`）
- 再造 `UiStepperOrientation`（用 `UiOrientation`）
- 在皮肤里自己读 `labelField`（只吃 `stepperItemsOf`）
- 指望 Prime / Naive 实现 `display` / `labelPosition` / `animation` / `persist` / `rtl` / `onChanging`
