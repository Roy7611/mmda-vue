import type { ActionCallback } from '../models/entity_action'
import type { UiContext } from './context'
import type { UiBoxed, UiColorRole } from './props'
/** 行/实体谓词；与 Logic Predicate 同形，ui 层不依赖 logic/。 */
export type UiPredicate<T = unknown> = (t: T, context?: UiContext) => boolean

/**
 * 界面动作（菜单、按钮、行操作）。无 Vue。
 * visible 可盒子化标量；表格行用 UiPredicate。
 */
export interface UiAction {
  id?: string
  name?: string
  role?: string
  icon?: string
  label?: string
  onAction?: ActionCallback
  divider?: boolean
  colorRole?: UiColorRole
  tooltip?: string
  disabled?: boolean
  /** 缺省出现。盒子化兼容 Vue ref。 */
  visible?: UiBoxed<boolean> | UiPredicate<any> | boolean
  /** false：可见但不可点。 */
  canDo?: UiPredicate<any> | boolean
  group?: string
  loading?: boolean
  view?: string
  items?: UiAction[]
}

/** 菜单项。chrome `factory.menu` / `contextMenu` 用。 */
export interface UiMenuItem extends UiAction {
  url?: string
  items?: UiMenuItem[]
}


/** 后端动作 role → UI 色阶。兼容数字线格式与 warn / error 别名。 */
export function normalizeActionColorRole(
  role?: string | number | null,
): UiColorRole | undefined {
  if (role == null || role === '') return undefined
  const numeric: Record<string, UiColorRole> = {
    '0': 'info',
    '1': 'success',
    '2': 'warning',
    '4': 'danger',
  }
  const raw = String(role).trim()
  if (!raw) return undefined
  if (numeric[raw] != null) return numeric[raw]
  const normalized = raw.toLowerCase()
  if (normalized === 'warn') return 'warning'
  if (normalized === 'error') return 'danger'
  if (
    normalized === 'primary' ||
    normalized === 'secondary' ||
    normalized === 'success' ||
    normalized === 'info' ||
    normalized === 'warning' ||
    normalized === 'danger'
  ) {
    return normalized
  }
  return undefined
}

/** 界面动作分隔符。 */
export function UiActionDivider(): UiAction {
  return { divider: true }
}

/** 是否渲染此项。target 为行或页 model；Predicate 时传入。 */
export function isActionVisible(
  action: UiAction,
  target?: unknown,
  ctx?: UiContext,
): boolean {
  const visible = action.visible
  if (visible == null) return true
  if (typeof visible === 'boolean') return visible
  if (typeof visible === 'function') return visible(target, ctx) !== false
  if (typeof visible === 'object' && 'value' in visible) {
    return visible.value !== false
  }
  return true
}

/** 是否可点。先看静态 disabled，再看 canDo。 */
export function isActionEnabled(
  action: UiAction,
  target?: unknown,
  ctx?: UiContext,
): boolean {
  if (action.disabled === true) return false
  const canDo = action.canDo
  if (canDo == null) return true
  if (typeof canDo === 'boolean') return canDo
  return canDo(target, ctx) !== false
}
