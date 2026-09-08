# MultiSelect：程序员怎么写

从当前皮肤 `builder.factory.multiSelect` 取节点。设计见 [multi_select.md](./multi_select.md)。

不要写 Prime `optionValue` / `optionLabel` / `dataKey`。

```ts
factory.multiValueSelect({
  value: ids,
  options: [
    { value: 'a', label: '甲' },
    { value: 'b', label: '乙' },
  ],
  onChange: (keys) => (ids = keys),
})
```

子表（缺省 `item_array`）：

```ts
factory.multiItemSelect({
  value: row.authorizedActions,
  options: row.moduleActions,
  valueField: 'actionName',
  labelField: 'displayLabel',
  onChange: () => MetaModel.modify(row),
})
```

`onChange` 在子表模式下可能仍是同一数组引用（已 `syncSelection`）。位掩码用 `multiBitSelect`；封闭 join 文本用 `multiTextSelect`。
