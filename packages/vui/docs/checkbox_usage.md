# 勾选：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.checkBox`。设计见 [checkbox.md](./checkbox.md)。

```ts
factory.checkBox({
  checked: true,
  label: '同意条款',
  onChange: (v) => {},
})
```

半选显式传 `indeterminate: true`。省略即 `false`。

不要两参 `factory.checkbox(value, props)`。不要写 Prime `binary`。

## 表单字段

```ts
fieldFactory.checkBox(field, context)
```
```

内部 `checkBoxPropsFromField`：`checked` ← `getFieldValue`，`label` ← `displayLabel`（`props.label === ''` 则无文案），只读 → `disabled`。

## 不要

- `labelPosition` / `e-small` 写进 chrome
- 在 Builder 上再开 `buildCheckBox`
- 字段层再 `control(CheckBoxComponent)`
