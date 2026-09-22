/**
 * 最底层渲染器：把一个 HTML 壳节点（div/span/section）变成平台节点。
 * 只拼 HTML 壳，组件调用走 UiFactory / UiFieldFactory / UiBuilder。
 */
export interface UiRenderer<TNode = any, TProps = unknown> {
  /** `children` 允许 `string` 文本节点（Vue 的 `VNodeChild` / React 的 `ReactNode` 都含文本）。 */
  render(tag: string, props?: TProps, children?: Array<TNode | string>): TNode
}
