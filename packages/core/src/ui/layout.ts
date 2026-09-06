/**
 * 框架无关的界面布局契约。vui 用 VNode 实现；不要在此引入 Vue。
 */
export type UiDirection = 'vertical' | 'horizontal'
export type UiFieldLayout = UiDirection

export interface UiLayout<TNode = any> {
  fieldLayout: UiFieldLayout
  fieldMessage?: boolean
  wrapManyGroup: boolean
  maxCols: number
  cell: (child: TNode, nCol?: number) => TNode
  row: (
    children: TNode[],
    nCols: number[],
    props?: Record<string, unknown>,
  ) => TNode
  column: (children: TNode[], props?: Record<string, unknown>) => TNode
  grid: (
    children: TNode[],
    nCols: number[],
    props?: Record<string, unknown>,
  ) => TNode
}
