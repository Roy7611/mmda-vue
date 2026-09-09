# 树形表格

单纯树、树形表格、左树右表是三套东西，场景不同。

程序员用法：[treegrid_usage.md](./treegrid_usage.md)。列表契约：[list.md](./list.md)。

| 能力 | 控件 | 场景 |
|---|---|---|
| 单纯树 | `factory.tree` / `buildTreeView` | 分类导航、只有节点标签。见 [树](./tree.md) |
| 左树右表 | `viewKind: categoryList` | 左栏 TreeView 过滤右表。见 [Builder](./builder.md) |
| 树形表格 | `factory.treeGrid` / `buildTreeGridView` | 多列 + 层级。子表 TREE/HIERARCHY，或 index 要看多列 |

`categoryList` 不要改成 TreeGrid。DropDownTree 是树下拉，UI 也不是 TreeView，只和树表共用 `TreeDataProvider`。

[EJ2 TreeGrid](https://ej2.syncfusion.com/vue/documentation/treegrid/overview) 的 `GridColumn` / `childMapping` 等是皮肤内部映射，不是 vui 契约。

## 分层

```text
皮肤组件：SfTreeGrid / AgGrid（treeData）/ Prime DataTable
Factory 短名：treeGrid
Builder 薄包：buildTreeGrid（ui/builder/list_view.ts；也可经 factory.list 且 display: treeGrid）
Builder 拼屏：buildTreeGridView
build()：viewKind === treeGrid → buildTreeGridView
```

```ts
factory.treeGrid(rows, metaUi, props: UiTreeGridPropsType)
buildTreeGrid(rows, metaUi, rowContext, props)
buildTreeGridView(context, props)
```

`UiTreeGridProps` 在列表 props 上加：`treeShape`、`shapeKey`、`idField`、`parentIdField`、`loadMode`、`sourceShape`、`bindShape`、`onExpand`。

## 行明细不是树子行

TreeGrid = **同构**树（物料套物料，同一套列）。行明细 `rowDetail.detail(row)` = **异构**孙子组（工序表）。不要把工序写进 `children`。若某皮肤 TreeGrid 不能和行展开共存，该皮肤外层退回 `grid` + 行明细。

## 列

列来自 **`MetaUi` 已列出字段**（`getListedFields` / `listedTableFields`），与 table/grid 同一套。皮肤再映射成厂商列（SF `sfTreeGridColumnOf`、Prime `Column`、AG colDefs）。

不要在 vui / Logic 写：`GridColumn`、`columns`、`headerText`、`editType`、`displayAsCheckBox`、`childMapping`、`idMapping`。树缩进列由皮肤用第一列出 expander，vui 不暴露厂商列下标名。

进格走 vui `editable` + 可选 `fieldCellEditors`。enum / ref / hasOne 只走 `valueOf` / `labelOf`。SF 格内编辑类型见 [SfGrid 设计](../../vui-syncfusion/docs/sf-grid-design.md)，不要写进 Logic。

## 子表形状

`MetaUiSubGroupShape`：

- `LIST`：扁平表（默认）
- `TREE`：`shapeKey` = 父字段名（`parentId`、`parentCatID`…）
- `HIERARCHY`：`shapeKey` = 编码字段名（`moduleCode`）。父 = 点分前缀，`M.01.001` → `M.01`
- `CALENDAR`：日历子表形态；整页排程走 `viewKind: scheduler` 与 [排程插件](./scheduler.md)，本枚举不自动接线
- `IMAGE_GALLERY`：图片画廊（原 `PHOTO`）

BPMN、GANTT 不进枚举：要拼多表，走组 `customRenderer` / `customEditor`。

子表走 TreeGrid 的条件（满足其一）：

- 元数据 `displayShape` 为 TREE/HIERARCHY **且** 有 `shapeKey`
- 服务端已组装嵌套行（`children` / `subModuleAuths` / `subModules` 非空）——不再用编码猜父

## 全量 vs 懒加载

**子表（编辑/详情）**：数据已在 `model[groupName]`，一次绑全量，不分页，展开不请求。`loadMode: 'full'`。进格同上节 `editable`。

**index**：`viewKind: treeGrid`，默认 `loadMode: 'lazy'`，逐层展开。

- 首屏只拉根：TREE 父字段为空；HIERARCHY 没有点号的编码
- 展开：TREE 用 `queryParams[shapeKey] = 当前行 id`；HIERARCHY 查直接子编码
- `children` 已是数组（含 `[]`）不再拉；`childrenCount === 0` 是叶子
- 展开走 `onExpand`，结果 `attachChildren`

## TreeDataProvider

放在 [`tree_data.ts`](../src/ui/builder/tree_data.ts)。TreeGrid 和 DropDownTree 共用。只认原行对象，不复制实体。

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
