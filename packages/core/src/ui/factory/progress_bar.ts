import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
import type { UiColorRole, UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiProgressBarKind = 'linear' | 'circular'
export type UiProgressBarSize = 'small' | 'large'

export interface UiProgressBarProps extends UiProps {
  value?: number
  min?: number
  max?: number
  kind?: UiProgressBarKind
  /** 粗细。省略 = 中档。不要写 EJ2 height:'4px' */
  size?: UiProgressBarSize
  /** 不确定进度。对应 EJ2 isIndeterminate */
  indeterminate?: boolean
  /** 是否显示数值。对应 EJ2 showProgressValue */
  showValue?: boolean
  colorRole?: UiColorRole
}

export function progressBarModifierClasses(
  props: UiProgressBarProps,
): unknown[] {
  return [
    uiCssClass('progressbar'),
    props.kind === 'circular'
      ? uiCssClass('progressbar', undefined, 'circular')
      : undefined,
    props.size ? uiCssClass('progressbar', undefined, props.size) : undefined,
    props.colorRole
      ? uiCssClass('progressbar', undefined, props.colorRole)
      : undefined,
    props.indeterminate
      ? uiCssClass('progressbar', undefined, 'indeterminate')
      : undefined,
    props.class,
  ]
}

function progressNumberOf(raw: unknown): number {
  if (raw == null || raw === '') return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function progressBarPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext
): UiProgressBarProps {
  return {
    value: progressNumberOf(context.getFieldValue(field)),
  }
}
