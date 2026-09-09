import type { UiProps } from './props'
import { uiCssClass } from './css'

export type UiBarcodeFormat =
  | 'code128'
  | 'code128A'
  | 'code128B'
  | 'code128C'
  | 'code39'
  | 'code39Extended'
  | 'code93'
  | 'code32'
  | 'codabar'
  | 'ean8'
  | 'ean13'
  | 'upcA'
  | 'upcE'

/** 条下人读。函数参数是编码用的 `value`。不要传 EJ2 `{ text, visibility }`。 */
export type UiCodeDisplayText = string | ((data: string) => string)

export interface UiBarcodeProps extends UiProps {
  value: string
  format?: UiBarcodeFormat
  width?: string | number
  height?: string | number
  showValue?: boolean
  displayText?: UiCodeDisplayText
}

export interface UiCodeCaption {
  text: string
  visible: boolean
}

export type UiQrCodeFormat = 'dataMatrix'

export interface UiQrCodeProps extends UiProps {
  value: string
  format?: UiQrCodeFormat
  width?: string | number
  height?: string | number
  showValue?: boolean
  displayText?: UiCodeDisplayText
}

export function resolveBarcodeDisplayText(
  displayText: UiCodeDisplayText | undefined,
  value: string,
): string | undefined {
  if (displayText == null) return undefined
  const text = typeof displayText === 'function' ? displayText(value) : displayText
  return text === '' ? undefined : text
}

export function resolveBarcodeCaption(
  value: string,
  displayText: UiCodeDisplayText | undefined,
  showValue: boolean | undefined,
  defaultShowValue: boolean,
): UiCodeCaption {
  const custom = resolveBarcodeDisplayText(displayText, value)
  if (custom != null) return { text: custom, visible: true }
  return { text: value, visible: showValue ?? defaultShowValue }
}

export function barcodeFormatClass(format?: UiBarcodeFormat): string {
  const fmt = format ?? 'code128'
  return uiCssClass('barcode', fmt.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`))
}

export function qrCodeModifierClasses(format?: UiQrCodeFormat): unknown[] {
  return format === 'dataMatrix' ? [uiCssClass('qrcode', 'data-matrix')] : undefined
}

export function codeSizeCss(
  size: string | number | undefined,
  fallback: string,
): string {
  if (size == null) return fallback
  return typeof size === 'number' ? `${size}px` : size
}

export function codeSizePx(
  size: string | number | undefined,
  fallback: number,
): number {
  if (typeof size === 'number') return size
  if (typeof size === 'string') {
    const n = parseFloat(size)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}
