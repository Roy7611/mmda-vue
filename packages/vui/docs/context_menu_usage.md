# ContextMenu：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.contextMenu`。设计见 [context_menu.md](./context_menu.md)。

```ts
factory.contextMenu({
  target: '#editor',
  items: [
    { name: 'cut', label: '剪切', icon: 'cut', onAction: () => {} },
    { divider: true },
    { name: 'paste', label: '粘贴', disabled: true },
  ],
  onSelect: (item) => {},
})
```

子菜单用 `items` 嵌套。`visible` / `canDo` 在打开前过滤（`contextMenuItemsOf`）。

## 不要

- 把 `factory.menu` / `dropDownButton` 当右键菜单
- 往 vui 写 EJ2 `showItemOnClick`、厂商 `separator` 字段名
- 本轮去改 Tree 内嵌 ContextMenu
