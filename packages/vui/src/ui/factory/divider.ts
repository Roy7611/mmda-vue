/*
 * chrome 分隔线走 factory.divider。不要写成 separator（breadcrumb / splitter），
 * 也不要复用菜单 UiAction.divider。
 */
import type { PropData, UiOrientation } from '../layout/layout'

/** @deprecated 用 UiOrientation */
export type UiDividerOrientation = UiOrientation

export interface UiDividerProps extends PropData {
  /** 缺省 horizontal */
  orientation?: UiOrientation
  /** 线中间文案；竖线时皮肤能画则画，不能则忽略 */
  label?: string
}

export function dividerModifierClasses(
  props: UiDividerProps = {},
): unknown[] {
  const orientation =
    props.orientation && props.orientation !== 'horizontal'
      ? 'mmda-divider--vertical'
      : undefined
  const labeled = props.label ? 'mmda-divider--labeled' : undefined
  return ['mmda-divider', orientation, labeled, props.class]
}
