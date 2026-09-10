/**
 * 框架无关的界面布局契约。vui 用 VNode 实现；不要在此引入 Vue。
 *
 * {@link UiLayout} 管页内排法与应用壳 scaffold，为 UiBuilder 提供布局能力。
 */
import { uiCssClass, uiCssClasses } from './css'
import type { UiProps } from './props'

/** 界面定位方向，横竖两种。控件和域布局都用这个名。 */
export type UiOrientation = 'vertical' | 'horizontal'

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

/** 移动端列表项布局槽位 */
export interface UiListTileSlots<TNode = any> {
  /** 左侧图标 */
  leading?: () => TNode
  /** 中间标题 */
  title: () => TNode
  /** 副标题 */
  subtitle?: () => TNode
  /** 右侧操作项 */
  trailing?: () => TNode
}

/** 字段组排法。 */
export type UiFieldGroupType = 'row' | 'column' | 'grid'

/** 字段组布局配置 */
export interface UiFieldGroupLayout {
  /** 排法，row 行排法，column 列排法，grid 默认网格排法 */
  type: UiFieldGroupType
  /** 网格布局列数，缺省 2 列 */
  gridCols?: 1 | 2 | 3
}

/** 字段文案严重程度：叠在 `mmda-field-message` 上的 class，仅此两种。 */
export type UiFieldMessageKind = 'error' | 'warning'

/** {@link UiLayout.layoutField} 入参：这一行的节点。方向由 {@link UiLayout.fieldVertical} 切换。 */
export interface UiFieldSlots<TNode = any> {
  /** 标签 */
  label: TNode
  /** 控件 */
  control: TNode
  message?: TNode
  /** 文案严重程度；缺省 error。有 message 时根 class 为 `mmda-field-message error|warning`。 */
  messageKind?: UiFieldMessageKind
  /** 组网格列：占格结果，如 `2 / span 2` */
  gridColumn?: string
  /** 组网格行：占格结果，如 `1 / span 3` */
  gridRow?: string
}

/** 字段占格（入参）。 */
export interface UiFieldSpan {
  colSpan?: number
  rowSpan?: number
}

/** 占格后的单元格（0-based 起点）。 */
export interface UiFieldCell {
  column: number
  row: number
  colSpan: number
  rowSpan: number
}

/**
 * 按顺序在宽 `gridCols` 的组网格上 first-fit 占格，不重叠。
 * `colSpan` 大于列数时钳成列数。
 */
export function placeFields(
  gridCols: number,
  spans: UiFieldSpan[],
): UiFieldCell[] {
  const cols = Math.max(1, Math.floor(gridCols) || 1)
  const occupied = new Set<string>()
  const key = (c: number, r: number) => `${c},${r}`

  const fits = (c: number, r: number, cs: number, rs: number) => {
    if (c + cs > cols) return false
    for (let rr = r; rr < r + rs; rr++) {
      for (let cc = c; cc < c + cs; cc++) {
        if (occupied.has(key(cc, rr))) return false
      }
    }
    return true
  }

  const mark = (c: number, r: number, cs: number, rs: number) => {
    for (let rr = r; rr < r + rs; rr++) {
      for (let cc = c; cc < c + cs; cc++) {
        occupied.add(key(cc, rr))
      }
    }
  }

  const results: UiFieldCell[] = []
  for (const span of spans) {
    const colSpan = Math.min(cols, Math.max(1, Math.floor(span.colSpan ?? 1)))
    const rowSpan = Math.max(1, Math.floor(span.rowSpan ?? 1))
    let placed: UiFieldCell | undefined
    for (let r = 0; placed == null; r++) {
      for (let c = 0; c <= cols - colSpan; c++) {
        if (!fits(c, r, colSpan, rowSpan)) continue
        mark(c, r, colSpan, rowSpan)
        placed = { column: c, row: r, colSpan, rowSpan }
        break
      }
    }
    results.push(placed!)
  }
  return results
}

/** {@link AbstractUiLayout.wrap} 第二参，对标 `h(tag, props, children)`。 */
export interface UiWrapProps {
  className?: string
  style?: Record<string, unknown>
  attributes?: UiProps
}

/** {@link UiLayout.layoutFieldGroup} 入参。排法用 {@link UiFieldGroupLayout}。 */
export interface UiFieldGroupProps<TNode = any> {
  fields: TNode[]
}

/** 实体详情/编辑页布局配置 {@link UiLayout.layoutPage} 入参。 */
export interface UiPageSlots<TNode = any> {
  /** 工具栏 */
  toolbar?: TNode
  /** 页面消息提示（横跨 primary + summary），消息提示会把两栏一起往下挤。 */
  banner?: TNode
  /** 主体区域 */
  primary: TNode[]
  /** 摘要区域 */
  summary?: TNode[]
  /** 尾栏区域 */
  tails?: TNode[]
  /** 页脚区域 */
  footer?: TNode
  /** 摘要区域是否默认展开。默认不展开 */
  summaryExpanded?: boolean
}

/**
 * 应用壳变体。
 * - `sidebarLeft`：左侧 nav + 右侧 page（可选顶栏）
 * - `topBarFull`：顶栏通栏，其下 nav | page
 */
export type UiAppLayoutVariant = 'sidebarLeft' | 'topBarFull'

/** {@link UiLayout.scaffold} 的槽位。已是节点，不是路由组件名。 */
export interface UiAppScaffoldSlots<TNode = any> {
  /** 壳变体。缺省 sidebarLeft。 */
  variant?: UiAppLayoutVariant
  /** 顶栏。 */
  topBar?: TNode
  /** 导航槽（通常是 `buildAppSideMenu` 产物）。 */
  nav?: TNode
  /** 主内容（RouterView 等）。 */
  page?: TNode
  /** 底栏。 */
  bottomBar?: TNode
}

/**
 * 界面布局器：app 壳、page、list、form 等。
 * - 字段行默认经 {@link layoutField}；
 * - 列表/表单外壳用 {@link layoutPage}；
 * - 应用壳用 {@link scaffold}（AppShell 直接调，不要经 Builder）。
 */
export interface UiLayout<TNode = any> {
  /**
   * 字段是否竖排。默认 `false`（横排）。
   * 赋值时把 {@link layoutFieldHorz} / {@link layoutFieldVert} 挂到 {@link layoutField}。
   */
  fieldVertical: boolean
  /** 字段组布局默认。缺省 grid 排法，2 列 */
  fieldGroupLayout: UiFieldGroupLayout
  /** row / column / grid 的间距。默认 0.75rem */
  gap: string
  /** 屏幕宽度最大列数，厂商可能 12/24/36 等。默认 12 */
  readonly maxCols: number

  /**
   * 应用脚手架。外壳不滚动；nav / page 各自管滚动。
   * AppShell 调本方法，不要 `builder.buildAppScaffold`。
   */
  scaffold(slots: UiAppScaffoldSlots<TNode>): TNode

  /** 单元格布局。默认 1 列 */
  cell(child: TNode, nCol?: number): TNode
  /** 行布局。默认按列数分配宽度 */
  row(children: TNode[], nCols: number[], props?: UiProps): TNode
  /** 列布局。默认垂直排列 */
  column(children: TNode[], props?: UiProps): TNode
  /** 网格布局。默认按列数分配宽度，不足时按 16rem 最小宽度自适应 */
  grid(children: TNode[], nCols: number[], props?: UiProps): TNode

  /**
   * 字段行入口（函数槽）。外部始终调这个；切换方向时挂上 Horz 或 Vert。
   */
  layoutField: (slots: UiFieldSlots<TNode>) => TNode
  /** 横排字段：label | control（+ 可选 message） */
  layoutFieldHorz(slots: UiFieldSlots<TNode>): TNode
  /** 竖排字段：label 在上、control 在下（+ 可选 message） */
  layoutFieldVert(slots: UiFieldSlots<TNode>): TNode
  /** 字段组布局。排法用 fieldGroupLayout */
  layoutFieldGroup(options: UiFieldGroupProps<TNode>): TNode
  /**
   * 功能模块实体页：固定工具栏、横幅通栏、主体、右边摘要、底部尾栏、页脚。
   */
  layoutPage(slots: UiPageSlots<TNode>): TNode

  /** 移动端列表项。左侧图标、中间标题/副标题、右侧操作 */
  listTile(slots: UiListTileSlots<TNode>): TNode
}

/**
 * 能上移的骨架：cell / row / column / grid / field / group / page / listTile。
 * 造节点走 wrap；scaffold 由实现类提供。
 */
export abstract class AbstractUiLayout<TNode> implements UiLayout<TNode> {
  #fieldVertical = false
  /** row / column / grid 间距 */
  gap = '0.75rem'
  /** 字段行入口；默认挂横排。改 {@link fieldVertical} 时重绑。 */
  layoutField: (slots: UiFieldSlots<TNode>) => TNode = (slots) =>
    this.layoutFieldHorz(slots)

  get fieldVertical(): boolean {
    return this.#fieldVertical
  }

  set fieldVertical(value: boolean) {
    this.#fieldVertical = value
    this.layoutField = value
      ? (slots) => this.layoutFieldVert(slots)
      : (slots) => this.layoutFieldHorz(slots)
  }

  abstract fieldGroupLayout: UiFieldGroupLayout
  abstract maxCols: number

  abstract scaffold(slots: UiAppScaffoldSlots<TNode>): TNode

  protected abstract wrap(
    tag: string,
    props: UiWrapProps,
    children: TNode[],
  ): TNode

  cell(child: TNode, nCol = 1): TNode {
    return this.wrap(
      'div',
      {
        className: uiCssClass('cell'),
        style: { gridColumn: `span ${Math.max(1, nCol)}` },
      },
      [child],
    )
  }

  row(children: TNode[], nCols: number[], props?: UiProps): TNode {
    return this.wrap(
      'div',
      {
        className: uiCssClass('row'),
        style: {
          display: 'grid',
          gridTemplateColumns: nCols.map((n) => `${n}fr`).join(' '),
          gap: this.gap,
        },
        attributes: props,
      },
      children,
    )
  }

  column(children: TNode[], props?: UiProps): TNode {
    return this.wrap(
      'div',
      {
        className: uiCssClass('column'),
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: this.gap,
        },
        attributes: props,
      },
      children,
    )
  }

  grid(children: TNode[], nCols: number[], props?: UiProps): TNode {
    return this.wrap(
      'div',
      {
        className: uiCssClass('grid'),
        style: {
          display: 'grid',
          gridTemplateColumns:
            nCols.length > 0
              ? nCols.map((n) => `${n}fr`).join(' ')
              : 'repeat(auto-fit, minmax(16rem, 1fr))',
          gap: this.gap,
        },
        attributes: props,
      },
      children,
    )
  }

  /** 页体节点。缺省铺平 banner / primary / tails / summary / footer。vui 覆写成可折叠区域壳。 */
  protected pageBody(slots: UiPageSlots<TNode>): TNode[] {
    return [
      ...(slots.banner == null ? [] : [slots.banner]),
      ...slots.primary,
      ...(slots.tails ?? []),
      ...(slots.summary ?? []),
      ...(slots.footer == null ? [] : [slots.footer]),
    ]
  }

  /** 组网格占格坐标 → 根 style。 */
  protected fieldCellStyle(
    slots: UiFieldSlots<TNode>,
  ): Record<string, unknown> {
    const style: Record<string, unknown> = {}
    if (slots.gridColumn != null) style.gridColumn = slots.gridColumn
    if (slots.gridRow != null) style.gridRow = slots.gridRow
    return style
  }

  /** 包一层控件 / 文案节点，便于测控选中。 */
  protected fieldParts(slots: UiFieldSlots<TNode>): {
    control: TNode
    message?: TNode
  } {
    const control = this.wrap(
      'div',
      {
        className: uiCssClass('field-control'),
        style: { minWidth: 0 },
      },
      [slots.control],
    )
    if (slots.message == null) return { control }
    const kind = slots.messageKind ?? 'error'
    const message = this.wrap(
      'small',
      { className: `${uiCssClass('field-message')} ${kind}` },
      [slots.message],
    )
    return { control, message }
  }

  layoutFieldHorz(slots: UiFieldSlots<TNode>): TNode {
    const { control, message } = this.fieldParts(slots)
    const children =
      message == null ? [slots.label, control] : [slots.label, control, message]
    return this.wrap(
      'div',
      {
        className: uiCssClasses('field', 'horizontal'),
        style: {
          minWidth: 0,
          ...this.fieldCellStyle(slots),
        },
      },
      children,
    )
  }

  layoutFieldVert(slots: UiFieldSlots<TNode>): TNode {
    const { control, message } = this.fieldParts(slots)
    const children =
      message == null ? [slots.label, control] : [slots.label, control, message]
    return this.wrap(
      'div',
      {
        className: uiCssClasses('field', 'vertical'),
        style: {
          minWidth: 0,
          ...this.fieldCellStyle(slots),
        },
      },
      children,
    )
  }

  layoutFieldGroup(options: UiFieldGroupProps<TNode>): TNode {
    const type = this.fieldGroupLayout.type
    const gridCols = this.fieldGroupLayout.gridCols ?? 2
    return this.wrap(
      'div',
      {
        className: uiCssClasses('field-group', type),
        attributes: {
          role: 'group',
          'data-grid-cols': gridCols,
        },
      },
      options.fields,
    )
  }

  layoutPage(slots: UiPageSlots<TNode>): TNode {
    const toolbarNode =
      slots.toolbar == null
        ? undefined
        : this.wrap(
            'header',
            {
              className: uiCssClasses('page-toolbar', 'sticky'),
              style: { position: 'sticky', top: 0, zIndex: 2 },
            },
            [slots.toolbar],
          )
    const body = this.pageBody(slots)
    const children = toolbarNode == null ? body : [toolbarNode, ...body]
    return this.wrap(
      'section',
      {
        className: uiCssClass('page'),
        style: {
          display: 'grid',
          gridTemplateRows:
            slots.toolbar == null
              ? 'minmax(0, 1fr)'
              : 'auto minmax(0, 1fr)',
          height: '100%',
          minHeight: 0,
          overflow: 'auto',
        },
      },
      children,
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
