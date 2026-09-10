import type { UiContext } from './context'
import type {
  UiConfirmProps,
  UiDialogAction,
  UiDialogProps,
  UiToastProps,
} from './builder/dialog'

/**
 * 弹层宿主。Builder.toast / confirm / dialog 委托给皮肤 Overlay。
 * 不要 factory.dialog。无 Vue。
 */
export interface UiOverlay<TNode = any> {
  /**
   * 轻提示（右侧 Overlay Toast）。
   * 详情/编辑页顶栏用 {@link message}，不要用本方法顶替。
   */
  toast(props: UiToastProps): void
  /**
   * 页内消息条（详情/编辑 PageBody 全宽顶栏）。
   * 列表等无 PageBody 的会话可回落 `toast`。
   */
  message(props: UiMessageProps): void
  /**
   * 是/否确认。`true` = 确定，`false` = 取消。
   * 业务写在 `if (await confirm(...))` 里，不要 `accept` 回调。
   */
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
  ): Promise<UiDialogAction>
  /**
   * 关闭最上层对话框，等价点右侧标准键（如选择列表双击 → 'ok'）。
   * 左侧 customAction 不要走这个，除非该动作自己要关。
   */
  closeTopDialog?(button: UiDialogAction): Promise<void>
}
