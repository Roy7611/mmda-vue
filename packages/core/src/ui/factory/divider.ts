import type { UiOrientation } from '../layout'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'

/** @deprecated 用 UiOrientation */
export type UiDividerOrientation = UiOrientation

export interface UiDividerProps extends UiProps {
  orientation?: UiOrientation
  label?: string
}

export function dividerModifierClasses(
  props: UiDividerProps = {},
): unknown[] {
  const orientation =
    props.orientation && props.orientation !== 'horizontal'
      ? uiCssClass('divider', undefined, 'vertical')
      : undefined
  const labeled = props.label ? uiCssClass('divider', undefined, 'labeled') : undefined
  return [uiCssClass('divider'), orientation, labeled, props.class]
}
