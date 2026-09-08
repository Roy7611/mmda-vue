# CheckBoxList：程序员怎么写

```ts
factory.checkBoxList({
  value: selectedIds,
  options: [
    { value: 'a', label: '甲' },
    { value: 'b', label: '乙' },
  ],
  onChange: (keys) => (selectedIds = keys),
})

factory.bitCheckBoxList({
  value: mask,
  options: [
    { value: 1, label: '读' },
    { value: 2, label: '写' },
  ],
  onChange: (next) => (mask = next),
})
```

`showSelectAll` 缺省 true。服务端 `editor: 'CheckBoxList'` / `'BitCheckBoxList'`。
