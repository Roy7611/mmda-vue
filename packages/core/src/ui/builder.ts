import type { UiContext } from './context'
import type { UiFactory } from './factory'
import type { UiFieldFactory } from './field_factory'

/**
 * 框架无关的 UI 宿主。vui 实现为 VueUiBuilder（TNode = VNode）。
 * 不要在这里引入 Vue。
 */
export interface UiBuilder<TNode = any> {
  readonly factory: UiFactory<TNode>
  readonly fldFactory: UiFieldFactory<TNode>

  /** 提示，不必等。props：severity / title / message / life。 */
  toast(
    context: UiContext,
    props: Record<string, unknown>,
  ): void | Promise<void>

  /** 是/否 → boolean。props：title / message。业务写在 if (ok) 里，不要 accept 回调。 */
  confirm(
    context: UiContext,
    props: Record<string, unknown>,
  ): Promise<boolean>

  /** 弹层塞内容 → 是否确定。props：title / width / showFooter / onAccept。不要 factory.dialog。 */
  dialog(
    content: TNode | TNode[],
    context: UiContext,
    props?: Record<string, unknown>,
  ): Promise<boolean>

  /**
   * 按 context.view 拼整页/弹层。many → 列表，one → 表单。
   * 选择器就是 selectOne/selectMany，不要另做 buildSelector。
   */
  buildView(context: UiContext, props?: Record<string, unknown>): TNode
}
