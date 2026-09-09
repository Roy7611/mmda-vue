import type { UiAction } from './action'
import type { UiListProps } from './list'
import type { UiProps } from './props'

export interface UiTreeFields<T = any> {
  id?: string
  label?: string | ((node: T) => string)
  parentId?: string
  /** 子节点数组字段名。已加载的儿子从这里取，懒加载展开后写回这里。 */
  children?: string
  icon?: string | ((node: T) => string)
  childrenCount?: string | ((node: T) => number)
}

export type UiTreeDropPosition = 'inside' | 'before' | 'after'

export interface UiTreeMoveMeta {
  position: UiTreeDropPosition
}

export type UiTreeSelectionMode = 'single' | 'checkbox' | 'none'

/**
 * chrome 导航树。`factory.tree` / `buildTree`。
 * 不是 treeSelect（树下拉）、不是 treeGrid（多列表格）。
 */
export interface UiTreeProps<T = any, TNode = any> extends UiProps {
  data?: T[]
  fields?: UiTreeFields<T>
  selectionMode?: UiTreeSelectionMode
  selected?: string | string[]
  showIcon?: boolean
  /** 正在原地重命名的节点 id；皮肤据此 beginEdit。 */
  editing?: string
  /** 右键菜单项。有值时皮肤用自带 ContextMenu。 */
  contextMenu?: (node: T) => UiAction[]
  /** 悬停添加子节点。函数返回 false 时不显示。 */
  showHoverAdd?: boolean | ((node: T) => boolean)
  /**
   * 拖放改父节点。未设时：`editable === true`，或分类树有 `repository` 且模块 `allowEdit`。
   * 不要只因默认 `editMode: 'hover'` 就打开。
   */
  allowDragDrop?: boolean
  onNodeSelect?: (node: T | T[]) => void
  onExpand?: (node: T) => void | Promise<void>
  onNodeContextMenu?: (node: T, event: MouseEvent) => void
  onNodeRename?: (node: T, text: string) => void
  onNodeAddChild?: (parent: T) => void
  /** 拖到某节点上（Inside）或其兄弟位（Before/After）。`parent` 为空即升到根。 */
  onNodeMove?: (
    node: T,
    parent: T | undefined,
    meta: UiTreeMoveMeta,
  ) => void | Promise<void>
  header?: () => TNode
  footer?: () => TNode
  footerContent?: (node: T) => TNode
}

/**
 * Builder 组合树（搜索 + factory.tree + 底栏）。`buildTreeView`。
 * 不是厂商 TreeView 控件名。
 */
export interface UiTreeViewProps<T = any, TNode = any>
  extends UiTreeProps<T, TNode> {
  /** 树顶搜索框，按节点文本本地过滤。 */
  showSearchBar?: boolean
  /** 树底插槽。为 true 时渲染 `footer`。 */
  showTreeFooter?: boolean
  editable?: boolean
  /** 分类仓库。CategoryList 用来做节点 CRUD 与模块权限。 */
  repository?: string
  /**
   * 节点编辑方式。默认 `hover`：悬停出现添加子节点。
   * `contextMenu` 才启用皮肤自带右键菜单。
   */
  editMode?: 'hover' | 'contextMenu'
  /** 当前选中实体，给底栏用。 */
  selectedNode?: T
  /** 有 repository 时的取数方式。默认 eager。 */
  loadMode?: 'eager' | 'lazy'
  /** 仅 lazy 挂载：拉顶层节点。 */
  preloader?: () => T[] | Promise<T[]>
  /** CRUD 后递增，TreeView 重新取数。 */
  reloadTick?: { value: number }
  onNodeAdd?: (parent?: T) => void
  onNodeAddSibling?: (node: T) => void
  onNodeDelete?: (node: T) => void
  /** 分类树落库后刷新节点。 */
  onTreeRefresh?: () => void | Promise<void>
}

/** 左树右表。`buildTreeListView`。`listOption` 整页 extras 由 vui 交叉。 */
export interface UiTreeListViewProps<T = any, TNode = any> {
  viewKind?: string
  treeOption?:
    | UiTreeViewProps<T, TNode>
    | (() => UiTreeViewProps<T, TNode>)
  listOption?: UiListProps<T>
  /** 列表外键，对应 `treeOption.fields.id`。 */
  foreignKey?: string
  treeWidth?: string | number
  /** 左树顶过滤框。与列表 `showSearchbar` 区分，内部传给树的 `showSearchBar`。 */
  showTreeSearchBar?: boolean
}
