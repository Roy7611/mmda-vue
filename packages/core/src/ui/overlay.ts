import type { UiContext } from './context'
import type {
  UiConfirmProps,
  UiDialogButton,
  UiDialogProps,
  UiToastProps,
} from './dialog'

/**
 * 弹层宿主。Builder.toast / confirm / dialog 委托给皮肤 Overlay。
 * 不要 factory.dialog。无 Vue。
 */
export interface UiOverlay<TNode = any> {
  toast(props: UiToastProps): void
  confirm(props: UiConfirmProps): Promise<boolean>
  /**
   * @param content 弹层内容
   * @param props 头/脚/标准键；customActions 用 context（dialog 第二参）调 onAction
   * @param context 会话；选择器传 selectCtx，留给左侧 customActions
   * @returns 用户点的右侧标准键（含 X→cancel）
   */
  dialog(
    content: TNode,
    props: UiDialogProps<TNode>,
    context?: UiContext,
  ): Promise<UiDialogButton>
  /**
   * 关闭最上层对话框，等价点右侧标准键（如选择列表双击 → 'ok'）。
   * 左侧 customAction 不要走这个，除非该动作自己要关。
   */
  closeTopDialog?(button: UiDialogButton): Promise<void>
}
