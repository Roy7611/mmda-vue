# 树形表格：怎么写

从当前皮肤的 `builder.factory.treeGrid` 取节点，或 Logic 配 `viewKind`。设计见 [treegrid.md](./treegrid.md)。

不要手写 `columns` / `GridColumn` / `headerText` / `childMapping`。列来自元数据已列出字段。

## index

```ts
this.viewOptions = {
  index: () => ({
    viewKind: UiViewManyKind.treeGrid,
    treeShape: MetaUiSubGroupShape.TREE,
    shapeKey: 'parentCatID',
    loadMode: 'lazy',
  }),
}
```

HIERARCHY 把 `treeShape` / `shapeKey` 换成编码字段。展开懒加载由 Builder `onExpand` 接好，不必在 Logic 拼厂商树 API。

## 子表

组元数据带 `displayShape`（TREE / HIERARCHY）和 `shapeKey` 即可，不必再传 `columns`。已嵌套的 `children` 数组也走 TreeGrid。

## 进格

```ts
factory.treeGrid(rows, metaUi, {
  treeShape: 'TREE',
  shapeKey: 'parentId',
  loadMode: 'full',
  inplaceEdit: true,
  editableFields: ['enabled', 'roleId'],
})
```

不要写 EJ2 `editSettings` / `editType`。布尔与引用怎么画在皮肤里，见 [SfGrid 设计](../../vui-syncfusion/docs/sf-grid-design.md)。
