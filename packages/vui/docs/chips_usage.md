# Chips：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.chips`。设计见 [chips.md](./chips.md)。

```ts
factory.chips({
  items: [
    { label: '成功', colorRole: 'success', icon: 'check' },
    { label: '警告', colorRole: 'warning', outlined: true },
    { label: '张三', avatarLabel: '张' },
  ],
})
```

单选 / 多选：

```ts
factory.chips({
  kind: 'choice',
  items: ['S', 'M', 'L'],
  selected: 'M',
  onChange: (v) => {},
})

factory.chips({
  kind: 'filter',
  items: ['原料', '辅料'],
  selected: ['原料'],
})
```

`kind: 'input'` 视为可关（EJ2 Input Chip）。字段格默认 `action`。

## 表单字段

```ts
fldFactory.tags(field, context)
fldFactory.chips(field, context)
```

内部 `chipsPropsFromField`：`items` ← 逗号/数组/`labelOf`。`tags` 调用 chips chrome。不要把数字位掩码交给 `tags`。

```ts
fldFactory.enumChipSet(field, context) // 枚举多值；Pascal EnumChipSet
fldFactory.bitChipSet(field, context)  // 按位勾选；Pascal BitChipSet
```

可写时 `kind: 'filter'`，选项来自 `refOptions`（`valueOf` / `labelOf`）。`bitChipSet` 写 int（跳过 `value === 0`）。`enumChipSet`：值是数组则 `value_array`，否则 `join_text`。只读只画已选项。

不要和 `bitCheckBoxList` / `multiBitSelect` 混名。不要 `enumSetTags` / `BitTags`。

## 不要

- `selection: 'Single'` / `cssClass: 'e-primary'` 写进 chrome
- Prime `Chips` 输入框、`NDynamicTags` 当 Input 类型
- 在 Builder 上再开 `buildChips`
