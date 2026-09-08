/*
 * 二维码走 factory.qrCode。省略 format 即 QR；只允许 dataMatrix，没有 format: 'qr'。
 * Data Matrix 皮肤画不了时只出文本，禁止改画 QR。
 */
import type { PropData } from '../layout/layout'
import type { UiCodeDisplayText } from './barcode'

export type { UiCodeDisplayText }

export type UiQrCodeFormat = 'dataMatrix'

export interface UiQrCodeProps extends PropData {
  value: string
  format?: UiQrCodeFormat
  width?: string | number
  height?: string | number
  showValue?: boolean
  displayText?: UiCodeDisplayText
}

export function qrCodeModifierClasses(format?: UiQrCodeFormat): unknown[] {
  return format === 'dataMatrix' ? ['mmda-qrcode--data-matrix'] : undefined
}
