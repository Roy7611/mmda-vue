/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/progressbar/vue-3-getting-started
 *
 * chrome 进度条走 factory.progressBar。vui 名是 progressBar，不要 ProgressBarComponent / NProgress。
 * 字段 fldFactory.progressBar 译 MetaUiField 后再调本控件。展示控件，没有 onChange。
 * 值 0–100，不要按 percentage 显示字段那样 * 100。
 */
import type { MetaUiField } from '@mmda/core'
import type { UiColorRole } from '../../app/material'
import type { PropData } from '../layout/layout'

export type UiProgressBarKind = 'linear' | 'circular'
export type UiProgressBarSize = 'small' | 'large'

export interface UiProgressBarProps extends PropData {
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

export type ProgressBarFieldContext = {
  getFieldValue: (field: MetaUiField, row?: unknown) => unknown
}

export function progressBarModifierClasses(props: UiProgressBarProps): unknown[] {
  return [
    'mmda-progressbar',
    props.kind === 'circular' ? 'mmda-progressbar--circular' : undefined,
    props.size ? `mmda-progressbar--${props.size}` : undefined,
    props.colorRole ? `mmda-progressbar--${props.colorRole}` : undefined,
    props.indeterminate ? 'mmda-progressbar--indeterminate' : undefined,
    props.class,
  ]
}

const numberOf = (raw: unknown): number => {
  if (raw == null || raw === '') return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function progressBarPropsFromField(
  field: MetaUiField,
  context: ProgressBarFieldContext,
  extra: PropData = {},
): UiProgressBarProps {
  return {
    value: numberOf(context.getFieldValue(field, extra.row)),
    min: extra.min as number | undefined,
    max: extra.max as number | undefined,
    kind: extra.kind as UiProgressBarKind | undefined,
    size: extra.size as UiProgressBarSize | undefined,
    indeterminate: extra.indeterminate as boolean | undefined,
    showValue: extra.showValue as boolean | undefined,
    colorRole: extra.colorRole as UiColorRole | undefined,
    class: extra.class,
    htmlAttributes: extra.htmlAttributes,
  }
}
