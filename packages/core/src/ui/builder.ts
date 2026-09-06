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

  toast(
    context: UiContext,
    props: Record<string, unknown>,
  ): void | Promise<void>

  /** 是/否。原 confirmMessage。 */
  confirm(
    context: UiContext,
    props: Record<string, unknown>,
  ): Promise<boolean>

  /** 弹层里塞内容。原 confirmDialog。 */
  dialog(
    content: TNode | TNode[],
    context: UiContext,
    props?: Record<string, unknown>,
  ): Promise<unknown>

  /**
   * 按 context.view 拼整页/弹层。many → 列表，one → 表单。
   * 选择器就是 selectOne/selectMany，不要另做 buildSelector。
   */
  buildView(context: UiContext, props?: Record<string, unknown>): TNode
}
