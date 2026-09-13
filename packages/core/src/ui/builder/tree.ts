import type { UiTreeProps } from '../factory/tree'

/**
 * Builder 组合树（搜索 + factory.tree + 底栏）。
 * 不是厂商 TreeView 控件名；整页左树右表见 {@link import('./explorer').UiExplorerViewProps}。
 */
export interface UiTreeViewProps<T = any, TNode = any>
  extends UiTreeProps<T, TNode> {
  /** 树顶搜索框，按节点文本本地过滤。 */
  showSearchBar?: boolean
  /** 树底插槽。为 true 时渲染 `footer`。 */
  showTreeFooter?: boolean
  /** 是否可编辑树节点、添加、删除子节点等操作。 */
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
  /** 添加节点后回调。 */
  onNodeAdd?: (parent?: T) => void
  /** 添加同级节点后回调。 */
  onNodeAddSibling?: (node: T) => void
  /** 删除节点后回调。 */
  onNodeDelete?: (node: T) => void
  /** 分类树落库后刷新节点。 */
  onTreeRefresh?: () => void | Promise<void>
}

export type { UiExplorerViewProps } from './explorer'
