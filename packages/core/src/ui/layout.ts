/**
 * 框架无关的界面布局契约。vui 用 VNode 实现；不要在此引入 Vue。
 * 与 AppLayout（应用脚手架）不是一回事。
 */
import { uiCssClass } from './css'
import type { UiProps } from './props'

/** 横竖。控件和域布局都用这个名。 */
export type UiOrientation = 'vertical' | 'horizontal'
/** @deprecated 用 UiOrientation */
export type UiDirection = UiOrientation
export type UiFieldLayout = UiOrientation

/** 水平内容对齐。物理左右，不是 flex/grid start/end。 */
export type UiHorzAlign =
  | 'left'
  | 'center'
  | 'right'
  | 'between'
  | 'around'
  | 'evenly'

/** 垂直内容对齐。对偶 UiHorzAlign。 */
export type UiVertAlign =
  | 'top'
  | 'middle'
  | 'bottom'
  | 'between'
  | 'around'
  | 'evenly'

/** 分组排法。属性名仍是 orientation。 */
export type UiFieldGroupOrientation = 'row' | 'column' | 'table'

export interface UiFixedColWidth {
  fixed: string
}

export type UiColWidth = number | UiFixedColWidth

export interface UiListTileSlots<TNode = any> {
  leading?: () => TNode
  title: () => TNode
  subtitle?: () => TNode
  trailing?: () => TNode
}

export interface UiFieldLayoutOptions<TNode = any> {
  label: TNode
  control: TNode
  orientation?: UiOrientation
  message?: TNode
  props?: UiProps
}

export interface UiFieldGroupLayoutOptions<TNode = any> {
  fields: TNode[]
  orientation?: UiFieldGroupOrientation
  cols?: 1 | 2 | 3
  props?: UiProps
}

export interface UiPageLayoutOptions<TNode = any> {
  toolbar?: TNode
  primary: TNode[]
  summary?: TNode[]
  tails?: TNode[]
  footer?: TNode
  summaryExpanded?: boolean
  props?: UiProps
}

export interface UiLayout<TNode = any> {
  fieldLayout: UiFieldLayout
  fieldMessage?: boolean
  wrapManyGroup: boolean
  maxCols: number
  cell(child: TNode, nCol?: number): TNode
  row(children: TNode[], nCols: number[], props?: UiProps): TNode
  column(children: TNode[], props?: UiProps): TNode
  grid(children: TNode[], nCols: number[], props?: UiProps): TNode
  layoutField(options: UiFieldLayoutOptions<TNode>): TNode
  layoutFieldGroup(options: UiFieldGroupLayoutOptions<TNode>): TNode
  layoutPage(options: UiPageLayoutOptions<TNode>): TNode
  listTile(slots: UiListTileSlots<TNode>): TNode
}

/**
 * 能上移的骨架：cell / row / column / grid / field / group / page / listTile。造节点走 wrap。
 */
export abstract class AbstractUiLayout<TNode> implements UiLayout<TNode> {
  abstract fieldLayout: UiFieldLayout
  fieldMessage?: boolean
  abstract wrapManyGroup: boolean
  abstract maxCols: number

  protected abstract wrap(
    className: string,
    style: Record<string, unknown>,
    props: UiProps | undefined,
    children: TNode[],
    tag?: string,
  ): TNode

  cell(child: TNode, nCol = 1): TNode {
    return this.wrap(
      uiCssClass('cell'),
      { gridColumn: `span ${Math.max(1, nCol)}` },
      undefined,
      [child],
    )
  }

  row(
    children: TNode[],
    nCols: number[],
    props?: UiProps,
  ): TNode {
    return this.wrap(
      uiCssClass('row'),
      {
        display: 'grid',
        gridTemplateColumns: nCols.map((n) => `${n}fr`).join(' '),
        gap: '0.75rem',
      },
      props,
      children,
    )
  }

  column(children: TNode[], props?: UiProps): TNode {
    return this.wrap(
      uiCssClass('column'),
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      },
      props,
      children,
    )
  }

  grid(
    children: TNode[],
    nCols: number[],
    props?: UiProps,
  ): TNode {
    return this.wrap(
      uiCssClass('grid'),
      {
        display: 'grid',
        gridTemplateColumns:
          nCols.length > 0
            ? nCols.map((n) => `${n}fr`).join(' ')
            : 'repeat(auto-fit, minmax(16rem, 1fr))',
        gap: '0.75rem',
      },
      props,
      children,
    )
  }

  /** 页体节点。缺省铺平 primary / tails / summary / footer。vui 覆写成可折叠区域壳。 */
  protected pageBody(options: UiPageLayoutOptions<TNode>): TNode[] {
    return [
      ...options.primary,
      ...(options.tails ?? []),
      ...(options.summary ?? []),
      ...(options.footer == null ? [] : [options.footer]),
    ]
  }

  layoutField(options: UiFieldLayoutOptions<TNode>): TNode {
    const orientation = options.orientation ?? 'vertical'
    const horizontal = orientation === 'horizontal'
    const controlChildren =
      options.message == null
        ? [options.control]
        : [
            options.control,
            this.wrap(uiCssClass('field-message'), {}, undefined, [
              options.message,
            ]),
          ]
    return this.wrap(
      [uiCssClass('field-layout'), uiCssClass('field-layout', orientation)].join(
        ' ',
      ),
      horizontal
        ? {}
        : {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          },
      { 'data-orientation': orientation, ...options.props },
      [
        this.wrap(uiCssClass('field-label'), {}, undefined, [options.label]),
        this.wrap(
          uiCssClass('field-control'),
          { minWidth: 0 },
          undefined,
          controlChildren,
        ),
      ],
    )
  }

  layoutFieldGroup(options: UiFieldGroupLayoutOptions<TNode>): TNode {
    const orientation = options.orientation ?? 'row'
    const cols =
      options.cols ?? (orientation === 'column' ? 1 : 2)
    return this.wrap(
      [
        uiCssClass('field-group-layout'),
        uiCssClass('field-group-layout', orientation),
      ].join(' '),
      {},
      {
        role: orientation === 'table' ? 'table' : 'group',
        'data-cols': cols,
        ...options.props,
      },
      options.fields,
    )
  }

  layoutPage(options: UiPageLayoutOptions<TNode>): TNode {
    const toolbarNode =
      options.toolbar == null
        ? undefined
        : this.wrap(
            [
              uiCssClass('page-toolbar'),
              uiCssClass('page-toolbar', 'sticky'),
            ].join(' '),
            { position: 'sticky', top: 0, zIndex: 2 },
            undefined,
            [options.toolbar],
            'header',
          )
    const body = this.pageBody(options)
    const children =
      toolbarNode == null ? body : [toolbarNode, ...body]
    return this.wrap(
      uiCssClass('page-layout'),
      {
        display: 'grid',
        gridTemplateRows:
          options.toolbar == null
            ? 'minmax(0, 1fr)'
            : 'auto minmax(0, 1fr)',
        height: '100%',
        minHeight: 0,
        overflow: 'auto',
      },
      options.props,
      children,
      'section',
    )
  }

  listTile(slots: UiListTileSlots<TNode>): TNode {
    const children: TNode[] = []
    let leftCols = this.maxCols
    const nCols: number[] = []
    if (slots.leading) {
      const leadingCols = 2
      leftCols -= leadingCols
      children.push(slots.leading())
      nCols.push(leadingCols)
    }
    if (slots.subtitle) {
      children.push(this.column([slots.title(), slots.subtitle()]))
    } else {
      children.push(slots.title())
    }
    if (slots.trailing) {
      const trailingCols = 2
      leftCols -= trailingCols
      nCols.push(leftCols)
      children.push(slots.trailing())
      nCols.push(trailingCols)
    } else {
      nCols.push(leftCols)
    }
    return this.row(children, nCols)
  }
}
