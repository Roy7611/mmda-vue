# 树：怎么写

从当前皮肤的 `builder.factory.tree` 取节点。设计见 [tree.md](./tree.md)。EJ2：[TreeView getting started](https://ej2.syncfusion.com/vue/documentation/treeview/vue-3-getting-started)。

```ts
factory.tree({
  data: [{ id: '1', label: '根' }],
})
```

多选勾选：

```ts
factory.tree({
  data,
  fields: { id: 'id', label: 'name', parentId: 'parentId' },
  selectionMode: 'checkbox',
  selected: ['a', 'b'],
  onNodeSelect: (nodes) => {},
})
```

`buildTree(props)` 只转调 `factory.tree`（缺省 `selectionMode: 'single'`）。带顶栏搜索和底栏走 `buildTreeView`。

不要 `factory.treeView`。树下拉用 [treeSelect](./tree_select_usage.md)。多列表格用 [treeGrid](./treegrid_usage.md)。不要把 EJ2 `fields.dataSource` / `parentID` / `text` 写进 vui。
