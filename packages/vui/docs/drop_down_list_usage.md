# DropDownList：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.dropDownList`。设计见 [drop_down_list.md](./drop_down_list.md)。

不要写 `factory.dropdown`。不要把厂商 `fields` / `dataSource` / `filtering` 写进 vui 调用。

```ts
factory.dropDownList({
  value: 'LABOR',
  options: [
    { value: 'LABOR', label: '劳动力' },
    { value: 'CONSUMABLE', label: '办公用品' },
  ],
  onChange: (value) => {},
})
```

分组 + 图标：

```ts
factory.dropDownList({
  value: '1',
  options: [
    { value: '1', label: 'A', group: '原料', icon: 'box' },
    { value: '2', label: 'B', group: '辅料' },
  ],
  onChange: (value) => {},
})
```

远程过滤：

```ts
factory.dropDownList({
  suggest: async (query) => api.search(query),
  onChange: (value) => {},
})
```

## 表单字段

```ts
fldFactory.dropDownList(field, context)
```

内部 `dropDownListPropsFromField`：`value` ← `valueOf`；`options` ← enum/ref `refOptions`；`GROUP BY` → `group`；选项上的 `icon` 原样拷。hasOne 默认 `suggest` 接 `searchRelative`，不写回 `refOptions`。
