import type { VNodeChild } from 'vue'
import type { UiAction } from './ui_action'

export interface UiTreeFields<T = any> {
  id?: string
  label?: string | ((node: T) => string)
  parentId?: string
  /** 子节点数组字段名。已加载的儿子从这里取，懒加载展开后写回这里。 */
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
  /** 正在原地重命名的节点 id；皮肤据此 beginEdit。 */
  editing?: string
  /** 右键菜单项。有值时皮肤用自带 ContextMenu。 */
  contextMenu?: (node: T) => UiAction[]
  /** 悬停添加子节点。函数返回 false 时不显示。 */
  showHoverAdd?: boolean | ((node: T) => boolean)
}

export interface UiTreeEmits<T = any> {
  onNodeSelect?: (node: T | T[]) => void
  onExpand?: (node: T) => void | Promise<void>
  onNodeContextMenu?: (node: T, event: MouseEvent) => void
  onNodeRename?: (node: T, text: string) => void
  onNodeAddChild?: (parent: T) => void
}

export type UiTreePropsType<T = any> = UiTreeProps<T> & UiTreeEmits<T>

export interface UiTreeViewProps<T = any> extends UiTreeProps<T> {
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
}

export interface UiTreeViewEmits<T = any> extends UiTreeEmits<T> {
  onNodeRename?: (node: T, text: string) => void
  onNodeAdd?: (parent?: T) => void
  onNodeAddChild?: (parent: T) => void
  onNodeAddSibling?: (node: T) => void
  onNodeDelete?: (node: T) => void
  /** 分类树落库后刷新节点。 */
  onTreeRefresh?: () => void | Promise<void>
}

export interface UiTreeViewSlots<T = any> {
  /** 自定义树顶。有内容时替换内置过滤框。 */
  header?: () => VNodeChild
  footer?: () => VNodeChild
  /** 用当前选中节点画底栏。无参 `footer()` 优先。 */
  footerContent?: (node: T) => VNodeChild
}

export type UiTreeViewPropsType<T = any> = UiTreeViewProps<T> &
  UiTreeViewEmits<T> &
  UiTreeViewSlots<T>

export interface UiTreeMappedNode<T = any> {
  id: string
  label: string
  parentId: string
  icon?: string
  childrenCount: number
  hasChildren: boolean
  children: UiTreeMappedNode<T>[]
  src: T
}

export function readTreeField<T>(
  node: T,
  field?: string | ((node: T) => unknown),
): unknown {
  if (field == null) return undefined
  if (typeof field === 'function') return field(node)
  return (node as Record<string, unknown>)[field]
}

export function treeIdOf<T>(node: T, fields?: UiTreeFields<T>): string {
  const id = readTreeField(node, fields?.id) ?? (node as { id?: unknown }).id
  return id == null ? '' : String(id)
}

export function treeLabelOf<T>(node: T, fields?: UiTreeFields<T>): string {
  const label =
    readTreeField(node, fields?.label) ??
    (node as { label?: unknown; name?: unknown }).label ??
    (node as { name?: unknown }).name
  return label == null ? '' : String(label)
}

export function treeChildrenKey<T = unknown>(fields?: UiTreeFields<T>): string {
  return typeof fields?.children === 'string' ? fields.children : 'children'
}

export function treeChildrenOf<T>(
  node: T,
  fields?: UiTreeFields<T>,
): T[] | undefined {
  const kids = (node as Record<string, unknown>)[treeChildrenKey(fields)]
  return Array.isArray(kids) ? (kids as T[]) : undefined
}

export function setTreeChildren<T>(
  node: T,
  children: T[],
  fields?: UiTreeFields<T>,
): void {
  (node as Record<string, unknown>)[treeChildrenKey(fields)] = children
}

export function treeChildrenCountOf<T>(
  node: T,
  fields?: UiTreeFields<T>,
): number {
  const count = treeKnownChildrenCountOf(node, fields)
  if (count != null) return count
  const kids = (node as Record<string, unknown>)[treeChildrenKey(fields)]
  return Array.isArray(kids) ? kids.length : 0
}

/** 模型上的 `childrenCount` 数值。没配或不是 number 则未知。 */
export function treeKnownChildrenCountOf<T>(
  node: T,
  fields?: UiTreeFields<T>,
): number | undefined {
  const count = readTreeField(node, fields?.childrenCount)
  return typeof count === 'number' ? count : undefined
}

/** `fields.children` 已是数组（含 `[]`）即已加载。 */
export function treeChildrenLoaded<T>(
  node: T,
  fields?: UiTreeFields<T>,
): boolean {
  return Array.isArray((node as Record<string, unknown>)[treeChildrenKey(fields)])
}

/**
 * 懒加载还要不要请求。
 * 已是数组不拉；有 count 且为 0 是叶子不拉；无 count 只能查一次。
 */
export function treeShouldLoadChildren<T>(
  node: T,
  fields?: UiTreeFields<T>,
): boolean {
  if (treeChildrenLoaded(node, fields)) return false
  return treeKnownChildrenCountOf(node, fields) !== 0
}

/** 展开箭头：有 count 用 count；无 count 且未查过就画；查完 `[]` 再收。 */
export function treeHasExpandableChildren<T>(
  node: T,
  fields?: UiTreeFields<T>,
): boolean {
  const count = treeKnownChildrenCountOf(node, fields)
  if (count === 0) return false
  if (typeof count === 'number' && count > 0) return true
  const kids = treeChildrenOf(node, fields)
  if (kids) return kids.length > 0
  return true
}

export function mapTreeNodes<T>(
  data: T[],
  fields?: UiTreeFields<T>,
): UiTreeMappedNode<T>[] {
  const childrenKey = treeChildrenKey(fields)
  const alreadyNested = data.some((node) => {
    const kids = (node as Record<string, unknown>)[childrenKey]
    return Array.isArray(kids) && kids.length > 0
  })

  const mapOne = (src: T): UiTreeMappedNode<T> => {
    const rawKids = (src as Record<string, unknown>)[childrenKey]
    const children = alreadyNested && Array.isArray(rawKids) ? rawKids.map(mapOne) : []
    const childrenCount = treeChildrenCountOf(src, fields)
    return {
      id: treeIdOf(src, fields),
      label: treeLabelOf(src, fields),
      parentId: String(readTreeField(src, fields?.parentId) ?? ''),
      icon: readTreeField(src, fields?.icon) as string | undefined,
      childrenCount,
      hasChildren: treeHasExpandableChildren(src, fields) || children.length > 0,
      children,
      src,
    }
  }

  if (alreadyNested) {
    const mapped = data.map(mapOne)
    const nested = new Set<string>()
    const walk = (nodes: UiTreeMappedNode<T>[]) => {
      for (const node of nodes) {
        for (const child of node.children) {
          nested.add(child.id)
          walk([child])
        }
      }
    }
    walk(mapped)
    const roots = mapped.filter((node) => !nested.has(node.id))
    return roots.length ? roots : mapped
  }

  const mapped = data.map(mapOne)
  const byId = new Map(mapped.map((node) => [node.id, node]))
  const roots: UiTreeMappedNode<T>[] = []
  let datasetHasLinks = false
  for (const node of mapped) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined
    if (parent && parent !== node) {
      parent.children.push(node)
      parent.hasChildren = true
      datasetHasLinks = true
    } else {
      roots.push(node)
    }
  }
  if (datasetHasLinks) {
    for (const node of mapped) {
      if (node.children.length > 0) {
        node.hasChildren = true
        continue
      }
      const count = treeKnownChildrenCountOf(node.src, fields)
      if (count != null) {
        node.hasChildren = count > 0
        continue
      }
      if (treeChildrenLoaded(node.src, fields)) {
        node.hasChildren = (treeChildrenOf(node.src, fields)?.length ?? 0) > 0
        continue
      }
      node.hasChildren = false
    }
  }
  return roots
}

export function filterMappedTree<T>(
  nodes: UiTreeMappedNode<T>[],
  query: string,
): UiTreeMappedNode<T>[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes
  const keep = (node: UiTreeMappedNode<T>): UiTreeMappedNode<T> | null => {
    const children = node.children.map(keep).filter(Boolean) as UiTreeMappedNode<T>[]
    if (node.label.toLowerCase().includes(q) || children.length) {
      return { ...node, children, hasChildren: children.length > 0 || node.hasChildren }
    }
    return null
  }
  return nodes.map(keep).filter(Boolean) as UiTreeMappedNode<T>[]
}

export function selectedIdSet(selected?: string | string[]): Set<string> {
  if (selected == null) return new Set()
  return new Set(Array.isArray(selected) ? selected.map(String) : [String(selected)])
}

export function flattenMappedTree<T>(
  nodes: UiTreeMappedNode<T>[],
  parentId = '',
): UiTreeMappedNode<T>[] {
  const out: UiTreeMappedNode<T>[] = []
  for (const node of nodes) {
    out.push({ ...node, parentId, children: [] })
    if (node.children.length) {
      out.push(...flattenMappedTree(node.children, node.id))
    }
  }
  return out
}

export function isTreeIconUrl(icon?: string): boolean {
  if (!icon) return false
  return (
    /^(https?:|data:|\/|\.\/)/.test(icon) ||
    /\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(icon)
  )
}

export function findMappedSrc<T>(
  nodes: UiTreeMappedNode<T>[],
  ids: Iterable<string>,
): T[] {
  const want = new Set([...ids].map(String))
  const picked: T[] = []
  const walk = (list: UiTreeMappedNode<T>[]) => {
    for (const node of list) {
      if (want.has(node.id)) picked.push(node.src)
      if (node.children.length) walk(node.children)
    }
  }
  walk(nodes)
  return picked
}

export function treeLabelFieldName<T>(fields?: UiTreeFields<T>): string {
  return typeof fields?.label === 'string' ? fields.label : 'label'
}

export function treeParentFieldName<T>(fields?: UiTreeFields<T>): string {
  return typeof fields?.parentId === 'string' ? fields.parentId : 'parentId'
}

export function collectNodeAndDescendantIds<T>(
  data: T[],
  node: T,
  fields?: UiTreeFields<T>,
): string[] {
  const id = treeIdOf(node, fields)
  if (!id) return []
  const mapped = mapTreeNodes(data, fields)
  const found = findMappedNodeById(mapped, id)
  if (!found) return [id]
  return flattenMappedTree([found]).map((item) => item.id)
}

export function findMappedNodeById<T>(
  nodes: UiTreeMappedNode<T>[],
  id: string,
): UiTreeMappedNode<T> | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const child = findMappedNodeById(node.children, id)
    if (child) return child
  }
  return undefined
}
