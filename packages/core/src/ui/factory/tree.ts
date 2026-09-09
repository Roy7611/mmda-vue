import type { UiAction } from '../action'
import type { UiProps } from '../props'

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
