import type { VNode } from 'vue'

export type UiToastSeverity = 'success' | 'info' | 'warning' | 'error'

export interface UiToastProps {
  severity?: UiToastSeverity
  title?: string
  message?: string
  /** @deprecated 用 message */
  detail?: string
  life?: number
}

export interface UiConfirmProps {
  title?: string
  message: string
}

export interface UiDialogProps {
  title?: string
  width?: string | number
  height?: string | number
  maxHeight?: string | number
  modal?: boolean
  showFooter?: boolean
  cssClass?: string
  onAccept?: () => boolean | Promise<boolean>
  onReject?: () => boolean | Promise<boolean>
  onConfirm?: () => void
  onClose?: () => void
  onOpen?: () => void
}

/** @deprecated 使用 UiDialogProps */
export type UiDialogPropsType = UiDialogProps

export type UiDialogContent = VNode | VNode[]
