import type { UiDialogSeverity } from '../builder/dialog'
import type { UiProps } from '../props'

/** 对齐 EJ2 Message variant；产品默认 filled。 */
export type UiMessageVariant = 'text' | 'outlined' | 'filled'

/**
 * 页内消息条（非 Toast）。
 * 字段名对齐 Syncfusion MessageComponent。
 * @see https://ej2.syncfusion.com/vue/documentation/api/message/index-default
 */
export interface UiMessageProps extends UiProps {
  content?: string
  /** 缺省 info */
  severity?: UiDialogSeverity
  /** 缺省 true */
  showCloseIcon?: boolean
  /** 缺省 true */
  showIcon?: boolean
  /** 缺省 filled（EJ2 文档默认 Text，产品用 Filled） */
  variant?: UiMessageVariant
  visible?: boolean
  cssClass?: string
  onClose?: () => void
}

export function messageSeverityOf(
  severity?: UiDialogSeverity,
): UiDialogSeverity {
  return severity ?? 'info'
}

export function messageVariantOf(variant?: UiMessageVariant): UiMessageVariant {
  return variant ?? 'filled'
}

export function messageShowCloseIconOf(value?: boolean): boolean {
  return value !== false
}

export function messageShowIconOf(value?: boolean): boolean {
  return value !== false
}
