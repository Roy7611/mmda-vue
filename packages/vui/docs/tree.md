# 树

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
  data: T[]
  fields?: UiTreeFields<T>
  selectionMode?: 'single' | 'checkbox' | 'none'
  selected?: string | string[]
  showIcon?: boolean
  class?: string
  editing?: string
  contextMenu?: (node: T) => UiAction[]
  showHoverAdd?: boolean | ((node: T) => boolean)
}

export interface UiTreeEmits<T = any> {
  onNodeSelect?: (node: T | T[]) => void
  onExpand?: (node: T) => void | Promise<void>
  onNodeContextMenu?: (node: T, event: MouseEvent) => void
  onNodeRename?: (node: T, text: string) => void
}
```

`label` / `icon` / `childrenCount`：字符串当字段名，函数则 `(node) =>` 取值。`childrenCount > 0` 时即使子节点未加载也画展开箭头，不再另加 `hasChildren`。展开走 `onExpand`（可懒加载）。

`data` 是 `T[]`，不是 `Ref`。接口对着 `h()`，不会自动解包。Logic 里可以 `ref`，调用时传 `.value`。

控件类型拆 Props / Emits，合成 `UiTreePropsType`。树上暂无槽，不建 `UiTreeSlots`。`selected` 属 Props；`onNodeSelect` 属 Emits。

## 组合树

```ts
export interface UiTreeViewProps<T> extends UiTreeProps<T> {
  showTreeSearchBar?: boolean
  showTreeFooter?: boolean
  editable?: boolean
  repository?: string
  treeNodeActions?: 'hover' | 'contextMenu'
}

export interface UiTreeViewEmits<T> extends UiTreeEmits<T> {
  onNodeRename?: (node: T, text: string) => void
  onNodeAdd?: (parent?: T) => void
  onNodeAddChild?: (parent: T) => void
  onNodeAddSibling?: (node: T) => void
  onNodeDelete?: (node: T) => void
}
```

- `showTreeSearchBar`：树顶搜索框，走 `factory.input`（皮肤控件），按节点文本本地过滤；点节点仍走 `onNodeSelect`。
- `showTreeFooter`：树底栏。有 `footer()` 用插槽，否则显示当前选中节点文本；右侧有折叠按钮，可收起整棵树（左树右表时左栏收成细条）。`categoryList` 默认打开。
- `editable`：工具条上的添加 / 重命名 / 删除（演示用）。默认不可编辑。
- `repository`：分类仓库。节点操作用皮肤树控件：默认 `treeNodeActions: 'hover'`，悬停出现添加子节点；`contextMenu` 才启用各皮肤自带 ContextMenu。物料分类树示例开 `treeNodeActions: 'contextMenu'`。菜单按分类模块 `allowRead` / `allowCreate` / `allowEdit` / `allowDelete` 显示：查看、分隔、添加根/子/兄弟、分隔、删除（含子孙）、分隔、编辑、原地重命名。分类模块没有可用权限时回退到当前列表页模块权限。
- `buildTreeView` 只拼 `factory.input` + `factory.tree` + `factory.button`，不自造树或菜单。左树右表的分隔条走 `factory.splitter`（各皮肤自己的 Splitter）。

## 皮肤

皮肤内部把扁平 `parentId` 收成树。`factory.tree` 对外只认 `UiTreePropsType`。右键菜单和原地重命名都走各皮肤官方控件，不自绘浮层。

| 皮肤 | 控件 | 菜单 | 重命名 |
|---|---|---|---|
| Syncfusion | `TreeViewComponent`；`iconCss` / `imageUrl`；`showCheckBox`；`nodeExpanded` → `onExpand` | `ContextMenuComponent.open` | `allowEditing` / F2 / 双击 / `beginEdit`；`nodeEdited` |
| Prime | `primevue/tree`；`selectionMode`；`@node-expand` → `onExpand` | 节点槽 `@contextmenu` + `ContextMenu.show` | 节点槽 `InputText`；F2 / 双击 |
| Agnaive | `NTree`；`checkable`；图标走节点 `prefix` | `node-props.onContextmenu` + `NDropdown` | `render-label` + `NInput`；F2 / 双击 |

类型在 [`ui_tree.ts`](../src/ui/ui_tree.ts)。
