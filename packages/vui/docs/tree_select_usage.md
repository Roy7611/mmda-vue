# TreeSelect：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.treeSelect`。设计见 [tree_select.md](./tree_select.md)。

`factory.dropDownTree` 与 `treeSelect` 同一实现。不要把 EJ2 `mode` / `Box` / `FieldsModel` 写进 vui 调用。

```ts
factory.treeSelect({
  value: 'a',
  data: [
    { id: 'a', label: '原料', children: [{ id: 'a1', label: '钢材' }] },
  ],
  fields: { id: 'id', label: 'label', children: 'children' },
  onChange: (value) => {},
})
```

多选：

```ts
factory.treeSelect({
  selectionMode: 'checkbox',
  value: ['a1'],
  data: rows,
  onChange: (ids) => {},
})
```

扁平行 + 父字段：

```ts
factory.treeSelect({
  data: flatRows,
  treeShape: 'TREE',
  shapeKey: 'parentCatID',
  fields: { id: 'categoryID', label: 'categoryName', parentId: 'parentCatID' },
})
```

懒加载（分类 Logic 自己实现 `getRoots` / `getChildren`）：

```ts
factory.treeSelect({
  loadMode: 'lazy',
  fields: { id: 'id', label: 'label', childrenCount: 'childrenCount' },
  loadRoots: () => catLogic.getRoots(),
  onExpand: async (node) => {
    node.children = await catLogic.getChildren(node.id)
  },
})
```

## 表单字段

```ts
fldFactory.treeSelect(field, context)
```

`treeSelectPropsFromField`：`refOptionsShape === TREE` 时 `fields.parentId` ← `groupBy` / `refFlds[2]`。ref 用 `refOptions`；hasOne 接 `context.logic.getRoots` / `getChildren`（没有这两方法就不发明默认查询）。
