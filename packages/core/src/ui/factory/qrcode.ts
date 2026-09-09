import type { UiProps } from '../props'
import { uiCssClass } from '../css'
import type { UiCodeDisplayText } from './barcode'

export type UiQrCodeFormat = 'dataMatrix'

export interface UiQrCodeProps extends UiProps {
  value: string
  format?: UiQrCodeFormat
  width?: string | number
  height?: string | number
  showValue?: boolean
  displayText?: UiCodeDisplayText
}

export function qrCodeModifierClasses(format?: UiQrCodeFormat): unknown[] {
  return format === 'dataMatrix' ? [uiCssClass('qrcode', 'data-matrix')] : undefined
}
