import type { ActionCallback } from '../metaui/metaui_action'
import type { UiBoxed, UiColorRole } from './props'

/** 行/实体谓词；与 Logic Predicate 同形，ui 层不依赖 logic/。 */
export type UiPredicate<T = unknown> = (t: T, context?: any) => boolean

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
