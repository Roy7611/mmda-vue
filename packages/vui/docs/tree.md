# 树

单纯树（节点标签 + 展开）。树形表格是另一套，见 [treegrid.md](./treegrid.md)。

`factory.tree` 是皮肤树控件。`buildTree` 薄包它。`buildTreeView` 在树上再加搜索和可选编辑，不依赖左树右表。组合页见 [Builder](./builder.md)，挂接见 [Logic](./logic.md)。

## 单纯树

```ts
factory.tree(props: UiTreePropsType)
buildTree(props: UiTreePropsType)
```

默认 `selectionMode: 'single'`。`checkbox` 时 `selected` / `onNodeSelect` 用数组。树的模式是 `'single' | 'checkbox' | 'none'`，不要复用列表的 `UiSelectionMode`。

```ts
export interface UiTreeFields<T = any> {
  id?: string
  label?: string | ((node: T) => string)
  parentId?: string
  children?: string
  icon?: string | ((node: T) => string)
  childrenCount?: string | ((node: T) => number)
}

export interface UiTreeProps<T = any> {
  data?: T[]
  fields?: UiTreeFields<T>
  selectionMode?: 'single' | 'checkbox' | 'none'
  selected?: string | string[]
  showIcon?: boolean
  class?: string
  editing?: string
  contextMenu?: (node: T) => UiAction[]
  showHoverAdd?: boolean | ((node: T) => boolean)
  allowDragDrop?: boolean
}

export interface UiTreeEmits<T = any> {
  onNodeSelect?: (node: T | T[]) => void
  onExpand?: (node: T) => void | Promise<void>
  onNodeContextMenu?: (node: T, event: MouseEvent) => void
  onNodeRename?: (node: T, text: string) => void
  onNodeMove?: (node: T, parent: T | undefined, meta: { position: 'inside' | 'before' | 'after' }) => void | Promise<void>
}
```

`label` / `icon` / `childrenCount`：字符串当字段名，函数则 `(node) =>` 取值。`children` 是子节点数组字段名，已加载的儿子从这里取，懒加载展开后写回这里。`parentId` 是服务端查子节点的外键。

懒加载要不要请求：`children` 已是数组（含 `[]`）不再拉。配了 `childrenCount` 且读到 number 时，`0` 是叶子不拉，`> 0` 才展开再拉。没配 `childrenCount` 则无法判叶子，展开查一次，空也写成 `[]`。展开箭头：有 count 用 count；无 count 且未查过就画，查完 `[]` 再收。展开走 `onExpand`。

`data` 是 `T[]`，不是 `Ref`。接口对着 `h()`，不会自动解包。Logic 里可以 `ref`，调用时传 `.value`。

控件类型拆 Props / Emits，合成 `UiTreePropsType`。树上暂无槽，不建 `UiTreeSlots`。`selected` 属 Props；`onNodeSelect` 属 Emits。

## 组合树

```ts
export interface UiTreeViewProps<T> extends UiTreeProps<T> {
  showSearchBar?: boolean
  showTreeFooter?: boolean
  editable?: boolean
  repository?: string
  editMode?: 'hover' | 'contextMenu'
  selectedNode?: T
  header?: () => VNodeChild
  footerContent?: (node: T) => VNodeChild
  loadMode?: 'eager' | 'lazy'
  preloader?: () => T[] | Promise<T[]>
}

export interface UiTreeViewEmits<T> extends UiTreeEmits<T> {
  onNodeRename?: (node: T, text: string) => void
  onNodeAdd?: (parent?: T) => void
  onNodeAddChild?: (parent: T) => void
  onNodeAddSibling?: (node: T) => void
  onNodeDelete?: (node: T) => void
}
```

- 树顶：`header()` 有内容时画自定义顶栏（`mmda-tree-view-header`），替换内置过滤框。没有 `header` 且 `showSearchBar` 时，走 `factory.input` 本地过滤。左树右表的 `showTreeSearchBar` 在 `UiTreeListViewProps` 上，内部传给树的 `showSearchBar`。点节点仍走 `onNodeSelect`。
- `showTreeFooter`：树底栏，风格与 `AppUserFooter` 一致。优先级：`footer()` → `footerContent(selectedNode)` → `selectedNode` 的 label。
- `loadMode`：有 `repository` 时默认 `eager`（一次 `getAll` 整树）。`lazy` 挂载走无参 `preloader()`（只拉顶层）；展开按 `fields.parentId` 查子节点，写回 `fields.children`。
- `categoryList` 默认打开树顶搜索和底栏。点选节点只给右表 `search()` 过滤，不因 `loading` 整页 `build`。点树按 `foreignKey` 走 `getAll`，不考虑 `SearchParam`。工具栏模糊搜索和字段过滤清掉类别外键，按 `SearchParam` 查全部：有关键词走 GET `getAll`，有字段过滤才 POST `searchAll`。左树独立挂载：右表查询不重绘树，展开/选中走皮肤树控件 API。折叠只改布局，不听、不改查询。折叠控件走 `factory.splitter`（Syncfusion 为 `paneSettings.collapsible`）。
- `editable`：工具条上的添加 / 重命名 / 删除（演示用）。默认不可编辑。
- `allowDragDrop`：拖放到另一节点上改父节点。未设时：`editable === true`，或分类树有 `repository` 且模块 `allowEdit`。不要只因默认 `editMode: 'hover'` 就打开。`node.editable === false` 不能拖。拖到自己或子孙上取消。`Inside` 新父是目标节点；`Before` / `After` 新父是目标的父（空即升到根）。分类树 `save` 写 `fields.parentId` / `parentCatID` / `depth`，不 `reloadTick`（避免懒加载整树重拉）。落库失败才递增 `reloadTick`。
- `repository`：分类仓库。节点操作用皮肤树控件：默认 `editMode: 'hover'`，悬停出现添加子节点；`contextMenu` 才启用各皮肤自带 ContextMenu。物料分类树示例开 `editMode: 'contextMenu'`。菜单按分类模块 `allowRead` / `allowCreate` / `allowEdit` / `allowDelete` 显示：查看、分隔、添加根/子/兄弟、分隔、删除（含子孙）、分隔、编辑、原地重命名。分类模块没有可用权限时回退到当前列表页模块权限。可编辑时一并打开拖放改父。
- `buildTreeView` 只拼顶栏（`header()` 或 `factory.input`）+ `factory.tree` + 底栏，不自造树或菜单。左树右表的分隔条和折叠走 `factory.splitter`（各皮肤自己的 Splitter / `paneSettings`）。

## 皮肤

皮肤内部把扁平 `parentId` 收成树。`factory.tree` 对外只认 `UiTreePropsType`。右键菜单和原地重命名都走各皮肤官方控件，不自绘浮层。

| 皮肤 | 控件 | 菜单 | 重命名 | 拖放 |
|---|---|---|---|---|
| Syncfusion | `TreeViewComponent`；`iconCss` / `imageUrl`；`showCheckBox`；`nodeExpanded` → `onExpand` | `ContextMenuComponent.open` | `allowEditing` / F2 / 双击 / `beginEdit`；`nodeEdited` | `allowDragAndDrop`；`nodeDragStop` 防环；`nodeDropped` → `onNodeMove` |
| Prime | `primevue/tree`；`selectionMode`；`@node-expand` → `onExpand` | 节点槽 `@contextmenu` + `ContextMenu.show` | 节点槽 `InputText`；F2 / 双击 | `dragdrop`；`@node-drop` → `onNodeMove` |
| Agnaive | `NTree`；`checkable`；图标走节点 `prefix` | `node-props.onContextmenu` + `NDropdown` | `render-label` + `NInput`；F2 / 双击 | `draggable`；`on-drop` → `onNodeMove` |

类型在 [`ui_tree.ts`](../src/ui/ui_tree.ts)。
