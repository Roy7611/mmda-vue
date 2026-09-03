# 树形表格

单纯树、树形表格、左树右表是三套东西，场景不同。

| 能力 | 控件 | 场景 |
|---|---|---|
| 单纯树 | `factory.tree` / `buildTreeView` | 分类导航、只有节点标签。见 [树](./tree.md) |
| 左树右表 | `viewKind: categoryList` | 左栏 TreeView 过滤右表。见 [Builder](./builder.md) |
| 树形表格 | `factory.treeGrid` / `buildTreeGridView` | 多列 + 层级。子表 TREE/HIERARCHY，或 index 要看多列 |

`categoryList` 不要改成 TreeGrid。DropDownTree 是树下拉，UI 也不是 TreeView，只和树表共用 `TreeDataProvider`。

## 分层

```text
Factory 短名：treeGrid
Builder 薄包：buildTreeGrid
Builder 拼屏：buildTreeGridView
build()：viewKind === treeGrid → buildTreeGridView
```

```ts
factory.treeGrid(rows, metaui, props: UiTreeGridPropsType)
buildTreeGrid(rows, metaui, rowContext, props)
buildTreeGridView(context, props)
```

`UiTreeGridProps` 在列表 props 上加：`treeShape`、`shapeKey`、`idField`、`parentIdField`、`loadMode`、`sourceShape`、`bindShape`、`onExpand`。

## 子表形状

`MetaUiSubGroupShape`：

- `LIST`：扁平表（默认）
- `TREE`：`shapeKey` = 父字段名（`parentId`、`parentCatID`…）
- `HIERARCHY`：`shapeKey` = 编码字段名（`moduleCode`）。父 = 点分前缀，`M.01.001` → `M.01`
- `CALENDAR`：日历（Scheduler，后做）
- `IMAGE_GALLERY`：图片画廊（原 `PHOTO`）

BPMN、GANTT 不进枚举：要拼多表，走组 `customRenderer` / `customEditor`。

子表走 TreeGrid 的条件（满足其一）：

- 元数据 `displayShape` 为 TREE/HIERARCHY **且** 有 `shapeKey`
- 服务端已组装嵌套行（`children` / `subModuleAuths` / `subModules` 非空）——不再用编码猜父

## 全量 vs 懒加载

**子表（编辑/详情）**：数据已在 `model[groupName]`，一次绑全量，不分页，展开不请求。`loadMode: 'full'`。单元格编辑与 Grid 同一套 `editType`（布尔 `booleanedit`、引用 `dropdownedit`），枚举用 `refOptions` + `valueOf` / `labelOf`。

**index**：`viewKind: treeGrid`，默认 `loadMode: 'lazy'`，逐层展开。

- 首屏只拉根：TREE 父字段为空；HIERARCHY 没有点号的编码
- 展开：TREE 用 `queryParams[shapeKey] = 当前行 id`；HIERARCHY 查直接子编码
- `children` 已是数组（含 `[]`）不再拉；`childrenCount === 0` 是叶子
- 展开走 `onExpand`，结果 `attachChildren`

## TreeDataProvider

放在 `ui_tree_data.ts`。TreeGrid 和 DropDownTree 共用。只认原行对象，不复制实体。

输入两种都吃（可传 `sourceShape`，不传则探测：`children` / `subModuleAuths` / `subModules` 有非空数组当嵌套）：

- **服务端已组装**（角色功能权限这种）：嵌套子节点，或扁平但已带父字段。信任结构，不再用编码猜父。
- **客户端自行组装**：扁平行。TREE 用 `shapeKey` 组父子；HIERARCHY 用点分编码算父。

按皮肤输出 `bindShape`：`flatParent` / `nestedChildren` / `dataPath`。

```ts
treeDataProvider.assemble(rows, {
  treeShape: 'TREE',
  shapeKey: 'parentId',
  idField: 'id',
  sourceShape: 'flat',   // 可选
  bindShape: 'nestedChildren',
})
```

## Logic 示例

子表由服务端元数据带 `displayShape` + `shapeKey`。index：

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
