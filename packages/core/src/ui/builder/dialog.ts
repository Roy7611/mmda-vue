import type { UiAction } from '../action'
import type { UiColorRole } from '../props'

/** toast / confirm / dialog 共用轻重。 */
export type UiDialogSeverity = 'success' | 'info' | 'warning' | 'error'

/** 右侧标准脚按钮名（也是 dialog Promise 的 resolve 值）。 */
export type UiDialogButton =
  | 'ok'
  | 'cancel'
  | 'yes'
  | 'no'
  | 'abort'
  | 'retry'
  | 'ignore'

/** 右侧标准键预设。缺省 okCancel。 */
export type UiDialogButtonsPreset =
  | 'ok'
  | 'okCancel'
  | 'yesNo'
  | 'yesNoCancel'
  | 'retryCancel'
  | 'abortRetryIgnore'

export interface UiToastProps {
  severity?: UiDialogSeverity
  title?: string
  message?: string
  life?: number
}

export interface UiConfirmProps {
  severity?: UiDialogSeverity
  title?: string
  message: string
}

export type UiDialogHeaderKind = 'slot' | 'title'
export type UiDialogFooterKind = 'slot' | 'buttons' | 'none'

export interface UiDialogProps<TNode = any> {
  severity?: UiDialogSeverity
  title?: string
  width?: string | number
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  /** 缺省 true。false = 非模态。 */
  modal?: boolean
  /** 缺省 true。 */
  showCloseIcon?: boolean
  /**
   * Esc 关窗。未传时：模态 false、非模态 true。
   * @see dialogCloseOnEscapeOf
   */
  closeOnEscape?: boolean
  /**
   * 点遮罩关窗。未传时：模态 false、非模态 true。
   * @see dialogCloseOnOverlayOf
   */
  closeOnOverlay?: boolean
  /** 缺省 true。Naive 忽略。 */
  allowDragging?: boolean
  /** 缺省 true。Naive 忽略。 */
  enableResize?: boolean
  /**
   * 标题栏最大化。缺省 true。
   * 仅 Prime 落实；SF / Naive 忽略。
   */
  maximizable?: boolean
  showFooter?: boolean
  /** 头插槽。有则换掉 title 文本。厂商关窗 X 不进槽。 */
  header?: () => TNode | TNode[]
  /** 脚整段插槽。有则不再画 buttons / customActions。 */
  footer?: () => TNode | TNode[]
  /** 右侧标准键。缺省 okCancel。不要把 Apply 塞进这里。 */
  buttons?: UiDialogButtonsPreset
  /**
   * 左侧自定义动作。点了跑 onAction(context)，默认不关窗、不 resolve。
   * context 是 dialog 第二参（选择器即 selectCtx）。
   */
  customActions?: UiAction[]
  /**
   * 主按钮（ok / yes / retry）即将关闭前。return false 不关、不 resolve。
   */
  onAccept?: (button: UiDialogButton) => boolean | Promise<boolean>
  /**
   * 其余键（cancel / no / abort / ignore / X）即将关闭前。return false 不关、不 resolve。
   */
  onReject?: (button: UiDialogButton) => boolean | Promise<boolean>
  onOpen?: () => void
  /** 窗已经关掉之后。Apply 不触发。不能拦关闭。 */
  onClose?: (button: UiDialogButton) => void
}

/** 缺省模态。 */
export function dialogModalOf(
  props: Pick<UiDialogProps, 'modal'>,
): boolean {
  return props.modal !== false
}

/** 缺省 true。 */
export function dialogShowCloseIconOf(
  props: Pick<UiDialogProps, 'showCloseIcon'>,
): boolean {
  return props.showCloseIcon !== false
}

/**
 * 未传 closeOnEscape 时：模态关 Esc，非模态开 Esc。
 */
export function dialogCloseOnEscapeOf(
  props: Pick<UiDialogProps, 'modal' | 'closeOnEscape'>,
): boolean {
  if (props.closeOnEscape !== undefined) return props.closeOnEscape === true
  return !dialogModalOf(props)
}

/**
 * 未传 closeOnOverlay 时：模态关遮罩，非模态开遮罩。
 */
export function dialogCloseOnOverlayOf(
  props: Pick<UiDialogProps, 'modal' | 'closeOnOverlay'>,
): boolean {
  if (props.closeOnOverlay !== undefined) return props.closeOnOverlay === true
  return !dialogModalOf(props)
}

/** 缺省 true。 */
export function dialogAllowDraggingOf(
  props: Pick<UiDialogProps, 'allowDragging'>,
): boolean {
  return props.allowDragging !== false
}

/** 缺省 true。 */
export function dialogEnableResizeOf(
  props: Pick<UiDialogProps, 'enableResize'>,
): boolean {
  return props.enableResize !== false
}

/** 缺省 true。仅 Prime 落实。 */
export function dialogMaximizableOf(
  props: Pick<UiDialogProps, 'maximizable'>,
): boolean {
  return props.maximizable !== false
}

/** 有 header 函数 → slot，否则画 title。 */
export function dialogHeaderKind(
  props: Pick<UiDialogProps, 'header'>,
): UiDialogHeaderKind {
  return typeof props.header === 'function' ? 'slot' : 'title'
}

/** 有 footer 函数 → slot；showFooter === false → none；否则标准键。 */
export function dialogFooterKind(
  props: Pick<UiDialogProps, 'footer' | 'showFooter'>,
): UiDialogFooterKind {
  if (typeof props.footer === 'function') return 'slot'
  if (props.showFooter === false) return 'none'
  return 'buttons'
}

/** 预设 → 右侧按钮名（顺序从左到右）。 */
export function resolveDialogButtons(
  preset?: UiDialogButtonsPreset,
): UiDialogButton[] {
  switch (preset ?? 'okCancel') {
    case 'ok':
      return ['ok']
    case 'yesNo':
      return ['no', 'yes']
    case 'yesNoCancel':
      return ['yes', 'no', 'cancel']
    case 'retryCancel':
      return ['retry', 'cancel']
    case 'abortRetryIgnore':
      return ['abort', 'retry', 'ignore']
    case 'okCancel':
    default:
      return ['cancel', 'ok']
  }
}

/** 标准键是否画成主按钮。 */
export function isDialogPrimaryButton(button: UiDialogButton): boolean {
  return button === 'ok' || button === 'yes' || button === 'retry'
}

/** 关窗前调 onAccept / onReject；false 表示拦住。 */
export async function shouldCloseDialog(
  props: Pick<UiDialogProps, 'onAccept' | 'onReject'>,
  button: UiDialogButton,
): Promise<boolean> {
  if (isDialogPrimaryButton(button)) {
    if (props.onAccept && (await props.onAccept(button)) === false) return false
  } else if (props.onReject && (await props.onReject(button)) === false) {
    return false
  }
  return true
}

/** 标准键默认 colorRole。 */
export function dialogButtonColorRole(
  button: UiDialogButton,
): UiColorRole | undefined {
  if (button === 'ok' || button === 'yes') return 'primary'
  if (button === 'abort') return 'danger'
  return undefined
}
