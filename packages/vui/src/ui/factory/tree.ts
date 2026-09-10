/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/treeview/vue-3-getting-started
 * API: https://ej2.syncfusion.com/vue/documentation/api/treeview/index-default
 *
 * chrome 导航树走 factory.tree。vui 名是 tree，不要 TreeView / ejs-treeview / NTree。
 * 不是 treeSelect（树下拉）、不是 treeGrid（多列表格）。没有 fieldFactory.tree。
 * buildTreeView 是 Builder 组合，不是厂商控件名。
 */
import type { VNodeChild } from 'vue'
import { uiCssClass } from '@mmda/core'
import type {
  UiTreeDropPosition,
  UiTreeFields,
  UiTreeProps,
  UiTreeViewProps,
} from '@mmda/core'

export type {
  UiTreeDropPosition,
  UiTreeFields,
  UiTreeMoveMeta,
  UiTreeProps,
  UiTreeSelectionMode,
  UiTreeViewProps,
} from '@mmda/core'

/** @deprecated 用 UiTreeProps（props + emits 已合成） */
export type UiTreePropsType<T = any> = UiTreeProps<T>
/** @deprecated 用 UiTreeViewProps */
export type UiTreeViewPropsType<T = any> = UiTreeViewProps<T>
/** @deprecated 事件已并进 UiTreeProps */
export type UiTreeEmits<T = any> = Pick<
  UiTreeProps<T>,
  | 'onNodeSelect'
  | 'onExpand'
  | 'onNodeContextMenu'
  | 'onNodeRename'
  | 'onNodeAddChild'
  | 'onNodeMove'
>
/** @deprecated 事件已并进 UiTreeViewProps */
export type UiTreeViewEmits<T = any> = Pick<
  UiTreeViewProps<T>,
  | 'onNodeRename'
  | 'onNodeAdd'
  | 'onNodeAddChild'
  | 'onNodeAddSibling'
  | 'onNodeDelete'
  | 'onTreeRefresh'
>
export interface UiTreeViewSlots<T = any> {
  header?: () => VNodeChild
  footer?: () => VNodeChild
  footerContent?: (node: T) => VNodeChild
}

export function treeSelectionModeOf(
  props: UiTreeProps = {},
): NonNullable<UiTreeProps['selectionMode']> {
  if (props.selectionMode === 'checkbox' || props.selectionMode === 'none') {
    return props.selectionMode
  }
  return 'single'
}

export function treeModifierClasses(props: UiTreeProps = {}): unknown[] {
  const mode = treeSelectionModeOf(props)
  return [
    uiCssClass('tree'),
    mode === 'checkbox' ? uiCssClass('tree', undefined, 'checkbox') : undefined,
    mode === 'none' ? uiCssClass('tree', undefined, 'none') : undefined,
    props.showIcon ? uiCssClass('tree', undefined, 'icons') : undefined,
    props.allowDragDrop ? uiCssClass('tree', undefined, 'drag') : undefined,
    props.class,
  ]
}

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

export function writeTreeField<T>(
  node: T,
  field: string | ((node: T) => unknown) | undefined,
  value: unknown,
): void {
  if (field == null || typeof field === 'function') return
  ;(node as Record<string, unknown>)[field] = value
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

export function normalizeTreeDropPosition(
  position?: string | number,
): UiTreeDropPosition {
  if (position === -1 || String(position).toLowerCase() === 'before') {
    return 'before'
  }
  if (position === 1 || String(position).toLowerCase() === 'after') {
    return 'after'
  }
  return 'inside'
}

export function treeDropParent<T>(
  dropped: T | undefined,
  position: UiTreeDropPosition,
  droppedParent?: T,
): T | undefined {
  if (!dropped || position === 'inside') return dropped
  return droppedParent
}

export function treeCannotDropOn<T>(
  dragged: T,
  dropped: T | undefined,
  data: T[],
  fields?: UiTreeFields<T>,
): boolean {
  if (!dropped) return false
  const dragId = treeIdOf(dragged, fields)
  const dropId = treeIdOf(dropped, fields)
  if (!dragId || !dropId) return true
  if (dragId === dropId) return true
  return collectNodeAndDescendantIds(data, dragged, fields).includes(dropId)
}

export function resolveMappedTreeDrop<T>(
  dragId: string,
  dropId: string | undefined,
  position: string | number | undefined,
  byId: Map<string, UiTreeMappedNode<T>>,
  data: T[],
  fields?: UiTreeFields<T>,
):
  | { dragged: T; parent: T | undefined; position: UiTreeDropPosition }
  | undefined {
  const dragged = byId.get(String(dragId))?.src
  if (dragged == null) return undefined
  const droppedMapped = dropId ? byId.get(String(dropId)) : undefined
  const pos = normalizeTreeDropPosition(position)
  const parent = treeDropParent(
    droppedMapped?.src,
    pos,
    droppedMapped?.parentId ? byId.get(droppedMapped.parentId)?.src : undefined,
  )
  if (treeCannotDropOn(dragged, parent ?? droppedMapped?.src, data, fields)) {
    return undefined
  }
  return { dragged, parent, position: pos }
}

function treeDataHasChildArrays<T>(data: T[], fields?: UiTreeFields<T>): boolean {
  const key = treeChildrenKey(fields)
  return data.some((node) =>
    Array.isArray((node as Record<string, unknown>)[key]),
  )
}

function bumpTreeChildrenCount<T>(
  node: T,
  delta: number,
  fields?: UiTreeFields<T>,
): void {
  const key =
    typeof fields?.childrenCount === 'string' ? fields.childrenCount : undefined
  if (!key) return
  const cur = (node as Record<string, unknown>)[key]
  if (typeof cur === 'number') {
    ;(node as Record<string, unknown>)[key] = Math.max(0, cur + delta)
  }
}

function writeMovedParent<T>(
  node: T,
  parent: T | undefined,
  fields?: UiTreeFields<T>,
): void {
  const parentId = parent ? treeIdOf(parent, fields) : ''
  writeTreeField(node, treeParentFieldName(fields), parentId)
  const rec = node as Record<string, unknown>
  if ('depth' in rec) {
    rec.depth = parent
      ? Number((parent as Record<string, unknown>).depth ?? 0) + 1
      : 0
  }
}

export function detachTreeNode<T>(
  roots: T[],
  node: T,
  fields?: UiTreeFields<T>,
): T | undefined {
  const id = treeIdOf(node, fields)
  if (!id) return undefined
  const childrenKey = treeChildrenKey(fields)
  const visit = (nodes: T[], parent?: T): T | undefined => {
    for (let i = 0; i < nodes.length; i++) {
      if (treeIdOf(nodes[i], fields) === id) {
        const [found] = nodes.splice(i, 1)
        if (parent) bumpTreeChildrenCount(parent, -1, fields)
        return found
      }
      const kids = (nodes[i] as Record<string, unknown>)[childrenKey]
      if (Array.isArray(kids)) {
        const found = visit(kids as T[], nodes[i])
        if (found) return found
      }
    }
    return undefined
  }
  return visit(roots)
}

/** 改父节点。扁平 `parentId` 只写字段；已有 `children` 数组则从原子树摘到新父。 */
export function moveTreeNode<T>(
  roots: T[],
  node: T,
  parent: T | undefined,
  fields?: UiTreeFields<T>,
): T[] {
  if (parent && treeCannotDropOn(node, parent, roots, fields)) return roots
  if (!treeDataHasChildArrays(roots, fields)) {
    writeMovedParent(node, parent, fields)
    return roots
  }
  const found = detachTreeNode(roots, node, fields) ?? node
  writeMovedParent(found, parent, fields)
  if (parent) {
    const kids = treeChildrenOf(parent, fields)
    if (kids) kids.push(found)
    else setTreeChildren(parent, [found], fields)
    bumpTreeChildrenCount(parent, 1, fields)
  } else {
    roots.push(found)
  }
  return roots
}
