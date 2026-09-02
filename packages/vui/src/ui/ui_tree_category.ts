import type { Module, ModuleAuth } from '@mmda/core'
import {
  treeIdOf,
  treeParentFieldName,
  type UiTreeFields,
} from './ui_tree'

export interface CategoryTreeAuth {
  allowRead: boolean
  allowCreate: boolean
  allowEdit: boolean
  allowDelete: boolean
}

export function categoryTreeAuth(
  module?: Module,
  node?: { editable?: boolean; deletable?: boolean },
): CategoryTreeAuth {
  const authority = module?.authority as ModuleAuth | undefined
  return {
    allowRead: !authority || authority.allowRead,
    allowCreate: !authority || authority.allowCreate,
    allowEdit:
      (!authority || authority.allowEdit) && node?.editable !== false,
    allowDelete:
      (!authority || authority.allowDelete) && node?.deletable !== false,
  }
}

export function categoryTreeAuthHasAction(auth: CategoryTreeAuth): boolean {
  return auth.allowRead || auth.allowCreate || auth.allowEdit || auth.allowDelete
}

export type CategoryTreeCreateKind = 'root' | 'child' | 'sibling'

export function categoryCreateParams<T>(
  kind: CategoryTreeCreateKind,
  node: T | undefined,
  fields?: UiTreeFields<T>,
): Record<string, unknown> {
  const parentKey = treeParentFieldName(fields)
  const src = node as Record<string, unknown> | undefined
  const nodeId = node ? treeIdOf(node, fields) : ''
  const parentId =
    kind === 'root'
      ? ''
      : kind === 'child'
        ? nodeId
        : String(src?.[parentKey] ?? src?.parentId ?? src?.parentCatID ?? '')
  const depthRaw = Number(src?.depth ?? 0)
  const depth =
    kind === 'root' ? 0 : kind === 'child' ? depthRaw + 1 : depthRaw
  const params: Record<string, unknown> = {
    [parentKey]: parentId,
    parentID: parentId,
    parentCatID: parentId,
    depth,
  }
  if (kind !== 'root' && src?.materialX != null) {
    params.materialX = src.materialX
  }
  return params
}
