/** 服务端已组好的嵌套树，或扁平待客户端组装。未传则探测。 */
export type TreeSourceShape = 'nested' | 'flat'

/** 皮肤控件要的绑定形态。 */
export type TreeBindShape = 'flatParent' | 'nestedChildren' | 'dataPath'

const asRecord = (row: unknown) => row as Record<string, unknown>

export const TREE_PARENT_KEY = '__mmdaTreeParent'
export const TREE_CHILDREN_KEY = 'children'
/** 服务端嵌套子表常用键；有非空数组的优先。 */
export const TREE_CHILDREN_CANDIDATES = [
  TREE_CHILDREN_KEY,
  'subModuleAuths',
  'subModules',
] as const

/** 复合主键（如 `roleID,moduleCode`）不能当一行的字段名。 */
export function treeIdField(
  treeShape: TreeDataSpec['treeShape'],
  shapeKey: string,
  primaryKey?: string,
) {
  if (isHierarchy(treeShape)) return shapeKey || 'id'
  if (primaryKey && !primaryKey.includes(',')) return primaryKey
  return 'id'
}

export function detectChildrenKey<T>(rows: T[], preferred?: string): string {
  const list = Array.isArray(rows) ? rows : []
  const keys = preferred
    ? [preferred, ...TREE_CHILDREN_CANDIDATES.filter((key) => key !== preferred)]
    : [...TREE_CHILDREN_CANDIDATES]
  for (const key of keys) {
    if (
      list.some((row) => {
        const kids = asRecord(row)[key]
        return Array.isArray(kids) && kids.length > 0
      })
    ) {
      return key
    }
  }
  return preferred ?? TREE_CHILDREN_KEY
}

export interface TreeDataSpec {
  treeShape: 'TREE' | 'HIERARCHY' | string
  shapeKey: string
  idField?: string
  labelField?: string
  childrenKey?: string
  sourceShape?: TreeSourceShape
  bindShape?: TreeBindShape
}

export interface TreeDataAssemble<T = any> {
  bindShape: TreeBindShape
  sourceShape: TreeSourceShape
  childrenKey: string
  roots: T[]
  rows: T[]
  getDataPath: (row: T) => string[]
}

export function hierarchyParentCode(code: unknown): string {
  const text = String(code ?? '')
  const index = text.lastIndexOf('.')
  return index < 0 ? '' : text.slice(0, index)
}

export function treeRowId<T>(row: T, spec: Pick<TreeDataSpec, 'idField' | 'shapeKey' | 'treeShape'>): string {
  const record = asRecord(row)
  const idField = spec.idField || (isHierarchy(spec.treeShape) ? spec.shapeKey : 'id')
  const value = record[idField] ?? record.id
  return value == null ? '' : String(value)
}

export function treeRowParentId<T>(row: T, spec: Pick<TreeDataSpec, 'shapeKey' | 'treeShape'>): string {
  const record = asRecord(row)
  if (isHierarchy(spec.treeShape)) {
    const computed = record[TREE_PARENT_KEY]
    if (computed != null && String(computed).length) return String(computed)
    return hierarchyParentCode(record[spec.shapeKey])
  }
  const value = record[spec.shapeKey]
  return value == null ? '' : String(value)
}

export function detectTreeSourceShape<T>(
  rows: T[],
  childrenKey = TREE_CHILDREN_KEY,
): TreeSourceShape {
  return rows.some((row) => {
    const kids = asRecord(row)[childrenKey]
    return Array.isArray(kids) && kids.length > 0
  })
    ? 'nested'
    : 'flat'
}

export function setTreeParent<T>(row: T, parentId: string) {
  Object.defineProperty(row as object, TREE_PARENT_KEY, {
    value: parentId,
    enumerable: false,
    configurable: true,
    writable: true,
  })
}

export function attachChildren<T>(
  parent: T,
  kids: T[],
  childrenKey = TREE_CHILDREN_KEY,
) {
  asRecord(parent)[childrenKey] = kids
}

function isHierarchy(shape: TreeDataSpec['treeShape']) {
  return shape === 'HIERARCHY'
}

function childrenOf<T>(row: T, childrenKey: string): T[] {
  const kids = asRecord(row)[childrenKey]
  return Array.isArray(kids) ? (kids as T[]) : []
}

function flattenNested<T>(
  nodes: T[],
  spec: TreeDataSpec,
  parentId = '',
  out: T[] = [],
): T[] {
  const childrenKey = spec.childrenKey ?? TREE_CHILDREN_KEY
  for (const node of nodes) {
    setTreeParent(node, parentId)
    out.push(node)
    flattenNested(childrenOf(node, childrenKey), spec, treeRowId(node, spec), out)
  }
  return out
}

function nestFlat<T>(rows: T[], spec: TreeDataSpec): T[] {
  const childrenKey = spec.childrenKey ?? TREE_CHILDREN_KEY
  const byId = new Map<string, T>()
  for (const row of rows) {
    const id = treeRowId(row, spec)
    if (id) byId.set(id, row)
    if (!Array.isArray(asRecord(row)[childrenKey])) {
      asRecord(row)[childrenKey] = []
    }
  }
  const roots: T[] = []
  const seen = new Set<T>()
  for (const row of rows) {
    const parentId = treeRowParentId(row, spec)
    const parent = parentId ? byId.get(parentId) : undefined
    if (parent && parent !== row) {
      const siblings = childrenOf(parent, childrenKey)
      if (!siblings.includes(row)) siblings.push(row)
    } else if (!seen.has(row)) {
      roots.push(row)
    }
    seen.add(row)
  }
  return roots
}

function dataPathOf<T>(row: T, spec: TreeDataSpec, byId: Map<string, T>): string[] {
  if (isHierarchy(spec.treeShape)) {
    const code = String(asRecord(row)[spec.shapeKey] ?? '')
    if (!code) return [treeRowId(row, spec)]
    const parts = code.split('.')
    const path: string[] = []
    for (let index = 0; index < parts.length; index += 1) {
      path.push(parts.slice(0, index + 1).join('.'))
    }
    return path
  }
  const path: string[] = []
  const walked = new Set<T>()
  let current: T | undefined = row
  while (current && !walked.has(current)) {
    walked.add(current)
    const id = treeRowId(current, spec)
    if (id) path.unshift(id)
    const parentId = treeRowParentId(current, spec)
    current = parentId ? byId.get(parentId) : undefined
  }
  return path.length ? path : [treeRowId(row, spec)]
}

export class TreeDataProvider {
  assemble<T>(rows: T[], spec: TreeDataSpec): TreeDataAssemble<T> {
    const list = Array.isArray(rows) ? rows : []
    const childrenKey = spec.childrenKey ?? detectChildrenKey(list)
    const resolved: TreeDataSpec = { ...spec, childrenKey }
    const source = spec.sourceShape ?? detectTreeSourceShape(list, childrenKey)
    const bindShape = spec.bindShape ?? 'nestedChildren'

    if (isHierarchy(resolved.treeShape) && source === 'flat') {
      for (const row of list) {
        setTreeParent(row, hierarchyParentCode(asRecord(row)[resolved.shapeKey]))
      }
    }

    const flatRows = source === 'nested' ? flattenNested(list, resolved) : list
    const nestedRoots = source === 'nested' ? list : nestFlat(flatRows, resolved)

    if (source === 'flat') {
      for (const row of flatRows) {
        if (asRecord(row)[TREE_PARENT_KEY] == null) {
          setTreeParent(row, treeRowParentId(row, resolved))
        }
      }
    }

    const byId = new Map<string, T>()
    for (const row of flatRows) {
      const id = treeRowId(row, resolved)
      if (id) byId.set(id, row)
    }

    return {
      bindShape,
      sourceShape: source,
      childrenKey,
      roots: nestedRoots,
      rows: flatRows,
      getDataPath: (row) => dataPathOf(row, resolved, byId),
    }
  }

  attachChildren<T>(parent: T, kids: T[], childrenKey = TREE_CHILDREN_KEY) {
    attachChildren(parent, kids, childrenKey)
  }
}

export const treeDataProvider = new TreeDataProvider()

export function isTreeDisplayShape(shape?: string) {
  return shape === 'TREE' || shape === 'HIERARCHY'
}

export function isImageGalleryShape(shape?: string) {
  return shape === 'IMAGE_GALLERY' || shape === 'PHOTO'
}
