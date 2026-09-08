/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/spinner/vue3-getting-started
 *
 * chrome 忙碌指示走 factory.loading。vui 名是 loading，不要 spinner / ProgressSpinner / NSpin。
 * EJ2 是 createSpinner API，不是 Vue 控件。不是字段展示，没有 fldFactory.loading。
 * 不是 progressBar / skeleton / 按钮 loading。
 */
import type { PropData } from '../layout/layout'

export type UiLoadingSize = 'small' | 'large'

export const LOADING_WIDTH_SMALL = 24
export const LOADING_WIDTH_MEDIUM = 48
export const LOADING_WIDTH_LARGE = 64

export interface UiLoadingProps extends PropData {
  /** 框旁/下说明。可选 */
  label?: string
  /** small / large。省略 = 中档 */
  size?: UiLoadingSize
}

export function loadingLabelOf(props: UiLoadingProps = {}): string | undefined {
  if (props.label == null || props.label === '') return undefined
  return String(props.label)
}

export function loadingSizeOf(
  props: UiLoadingProps = {},
): UiLoadingSize | undefined {
  if (props.size === 'small' || props.size === 'large') return props.size
  return undefined
}

export function loadingWidthOf(props: UiLoadingProps = {}): number {
  const size = loadingSizeOf(props)
  if (size === 'small') return LOADING_WIDTH_SMALL
  if (size === 'large') return LOADING_WIDTH_LARGE
  return LOADING_WIDTH_MEDIUM
}

export function loadingNaiveSizeOf(
  props: UiLoadingProps = {},
): 'small' | 'medium' | 'large' {
  return loadingSizeOf(props) ?? 'medium'
}

export function loadingModifierClasses(
  props: UiLoadingProps = {},
): unknown[] {
  const size = loadingSizeOf(props)
  return [
    'mmda-loading',
    size ? `mmda-loading--${size}` : undefined,
    loadingLabelOf(props) ? 'mmda-loading--labeled' : undefined,
    props.class,
  ]
}
