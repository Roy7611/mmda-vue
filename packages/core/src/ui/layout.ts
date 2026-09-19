/**
 * 框架无关的界面布局契约。vui 用 VNode 实现；不要在此引入 Vue。
 *
 * {@link UiLayout} 管页内排法与应用壳 scaffold，为 UiBuilder 提供布局能力。
 */
import { uiCssClass, uiClassModifiers } from './css'
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

/** {@link UiLayout.layoutField} 入参：这一行的节点。方向由 {@link UiLayout.fieldVertical} 切换。校验文案由控件自己画，不经 layout。 */
export interface UiFieldSlots<TNode = any> {
  /** 标签 */
  label: TNode
  /** 控件 */
  control: TNode
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

/** 详情页壳：左右卡（默认）或顶栏重要字段 + 每组一页签。 */
export type UiPageLayout = 'cards' | 'tabs'

/** 实体详情/编辑页布局配置 {@link UiLayout.layoutPage} 入参。 */
export interface UiPageSlots<TNode = any> {
  /** 工具栏 */
  toolbar?: TNode
  /** 页面消息提示（横跨 primary + summary），消息提示会把两栏一起往下挤。 */
  banner?: TNode
  /**
   * 页壳。缺省 `cards`（banner + primary | summary）。
   * `tabs`：banner + {@link emphasis} + primary（通常是 factory.tabs）。
   */
  pageLayout?: UiPageLayout
  /**
   * 重要字段条（`MetaUiField.emphasized`）。仅 `pageLayout: 'tabs'` 使用；
   * 由 FormBuilder 用 `displayFor` 拼成只读节点，可与 tabs 内字段重复。
   */
  emphasis?: TNode
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

/** 索引/选择列表页 {@link UiLayout.layoutIndexPage} 入参。 */
export interface UiIndexPageSlots<TNode = any> {
  /** 模块工具栏（面包屑 + 动作 + 搜索）。 */
  toolbar?: TNode
  /** 工具栏与表格之间的过滤条。 */
  filterBar?: TNode
  /** 数据区：table / grid / list。 */
  default?: TNode
  /** 底部分页器。 */
  footer?: TNode
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
  /**
   * 实体详情页壳：`cards` | `tabs`。默认 `cards`。
   * Vue 皮肤可从本地偏好 `mmda/pageLayout` 初始化并写回。
   */
  pageLayout: UiPageLayout
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

  /** 单元格：flex 权重 `nCol`（默认 1），`minWidth: 0`。 */
  cell(child: TNode, nCol?: number): TNode
  /**
   * 横排 flex（可 wrap）；`nCols[i]` 为第 i 项权重。
   * 列表项请用 {@link listTile}，不要拿本方法硬套图标行。
   */
  row(children: TNode[], nCols: number[], props?: UiProps): TNode
  /** 列布局。默认垂直排列 */
  column(children: TNode[], props?: UiProps): TNode
  /** CSS grid 装箱（字段组等）；`nCols` 为各列 fr。与 {@link row} 的 flex 权重不同。 */
  grid(children: TNode[], nCols: number[], props?: UiProps): TNode

  /**
   * 字段行入口（函数槽）。外部始终调这个；切换方向时挂上 Horz 或 Vert。
   */
  layoutField: (slots: UiFieldSlots<TNode>) => TNode
  /** 横排字段：label | control。校验文案由控件自绘。 */
  layoutFieldHorz(slots: UiFieldSlots<TNode>): TNode
  /** 竖排字段：label 在上、control 在下。校验文案由控件自绘。 */
  layoutFieldVert(slots: UiFieldSlots<TNode>): TNode
  /** 字段组布局。排法用 fieldGroupLayout */
  layoutFieldGroup(options: UiFieldGroupProps<TNode>): TNode
  /**
   * 功能模块实体页：固定工具栏、横幅通栏、主体、右边摘要、底部尾栏、页脚。
   */
  layoutPage(slots: UiPageSlots<TNode>): TNode

  /**
   * 索引/选择列表页：工具栏、过滤条、数据区、底部分页。
   * 与 {@link layoutPage} 并列，不要用 cards/tabs。
   */
  layoutIndexPage(slots: UiIndexPageSlots<TNode>): TNode

  /** 移动端列表项。左侧图标、中间标题/副标题、右侧操作 */
  listTile(slots: UiListTileSlots<TNode>): TNode
}

/**
 * 界面布局抽象类，实现能上移的骨架：cell / row / column / grid / field / group / page / listTile。
 * 造节点走 wrap；scaffold 由实现类提供。
 */
export abstract class AbstractUiLayout<TNode> implements UiLayout<TNode> {
  #fieldVertical = false
  /** 详情页壳偏好。默认 cards；皮肤可覆写 getter/setter 做本地持久化。 */
  pageLayout: UiPageLayout = 'cards'
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

  /** 包装器，vui使用h()实现。 */
  protected abstract wrap(
    tag: string,
    props: UiWrapProps,
    children: TNode[],
  ): TNode

  cell(child: TNode, nCol = 1): TNode {
    const n = Math.max(1, nCol)
    return this.wrap(
      'div',
      {
        className: uiCssClass('cell'),
        style: { flexGrow: n, flexShrink: 1, flexBasis: 0, minWidth: 0 },
      },
      [child],
    )
  }

  /**
   * 横排 flex：可 wrap；`nCols[i]` 为第 i 项权重（`flexGrow`，缺省 1）。
   * 用 longhand（非 `flex` 简写），避免 jsdom 丢样式。
   * 列表项请用 {@link listTile}（nowrap 三槽），不要拿本方法硬套图标行。
   */
  row(children: TNode[], nCols: number[], props?: UiProps): TNode {
    const cells = children.map((child, i) => {
      const n = Math.max(1, nCols[i] ?? 1)
      return this.wrap(
        'div',
        {
          className: uiCssClass('cell'),
          style: { flexGrow: n, flexShrink: 1, flexBasis: 0, minWidth: 0 },
        },
        [child],
      )
    })
    return this.wrap(
      'div',
      {
        className: uiCssClass('row'),
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'start',
          gap: this.gap,
        },
        attributes: props,
      },
      cells,
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

  /** 组网格占格坐标 → 根 style。 */
  protected fieldCellStyle(
    slots: UiFieldSlots<TNode>,
  ): Record<string, unknown> {
    const style: Record<string, unknown> = {}
    if (slots.gridColumn != null) style.gridColumn = slots.gridColumn
    if (slots.gridRow != null) style.gridRow = slots.gridRow
    return style
  }

  /** 包一层控件节点，便于测控选中。 */
  protected fieldControl(slots: UiFieldSlots<TNode>): TNode {
    return this.wrap(
      'div',
      {
        className: uiCssClass('field-control'),
        style: { minWidth: 0 },
      },
      [slots.control],
    )
  }

  layoutFieldHorz(slots: UiFieldSlots<TNode>): TNode {
    return this.wrap(
      'div',
      {
        className: uiClassModifiers('field', 'horizontal'),
        style: {
          minWidth: 0,
          ...this.fieldCellStyle(slots),
        },
      },
      [slots.label, this.fieldControl(slots)],
    )
  }

  layoutFieldVert(slots: UiFieldSlots<TNode>): TNode {
    return this.wrap(
      'div',
      {
        className: uiClassModifiers('field', 'vertical'),
        style: {
          minWidth: 0,
          ...this.fieldCellStyle(slots),
        },
      },
      [slots.label, this.fieldControl(slots)],
    )
  }

  layoutFieldGroup(options: UiFieldGroupProps<TNode>): TNode {
    const type = this.fieldGroupLayout.type
    const gridCols = this.fieldGroupLayout.gridCols ?? 2
    return this.wrap(
      'div',
      {
        className: uiClassModifiers('field-group', type),
        attributes: {
          role: 'group',
          'data-grid-cols': gridCols,
        },
      },
      options.fields,
    )
  }

  /**
   * 缺省铺平槽位（测试 / 无壳后端）。折叠摘要、左右栏、tabs 壳由 vui 等覆写本方法。
   */
  layoutPage(slots: UiPageSlots<TNode>): TNode {
    const toolbarNode =
      slots.toolbar == null
        ? undefined
        : this.wrap(
            'header',
            {
              className: [
                uiCssClass('page', 'header'),
                uiCssClass('page', 'header', 'sticky'),
              ].join(' '),
              style: { position: 'sticky', top: 0, zIndex: 2 },
            },
            [slots.toolbar],
          )
    const body = [
      ...(slots.banner == null ? [] : [slots.banner]),
      ...(slots.emphasis == null ? [] : [slots.emphasis]),
      ...slots.primary,
      ...(slots.tails ?? []),
      ...(slots.summary ?? []),
      ...(slots.footer == null ? [] : [slots.footer]),
    ]
    const children = toolbarNode == null ? body : [toolbarNode, ...body]
    const rows = [
      slots.toolbar == null ? null : 'auto',
      'minmax(0, 1fr)',
      slots.footer == null ? null : 'auto',
    ].filter(Boolean)
    const pageLayout = slots.pageLayout === 'tabs' ? 'tabs' : undefined
    return this.wrap(
      'section',
      {
        className: pageLayout
          ? uiClassModifiers('page', pageLayout)
          : uiCssClass('page'),
        style: {
          display: 'grid',
          gridTemplateRows: rows.join(' '),
          height: '100%',
          minHeight: 0,
          overflow: 'auto',
        },
      },
      children,
    )
  }

  /**
   * 缺省铺平：toolbar → filterBar → default → footer。vui 覆写加 list-view 壳。
   */
  layoutIndexPage(slots: UiIndexPageSlots<TNode>): TNode {
    const children: TNode[] = []
    if (slots.toolbar != null) {
      children.push(
        this.wrap(
          'header',
          { className: uiCssClass('page', 'header') },
          [slots.toolbar],
        ),
      )
    }
    if (slots.filterBar != null) children.push(slots.filterBar)
    if (slots.default != null) {
      children.push(
        this.wrap(
          'div',
          {
            className: uiCssClass('page', 'body'),
            style: { flex: '1 1 auto', minWidth: 0, minHeight: 0, overflow: 'auto' },
          },
          [slots.default],
        ),
      )
    }
    if (slots.footer != null) {
      children.push(
        this.wrap(
          'footer',
          { className: uiCssClass('page', 'footer') },
          [slots.footer],
        ),
      )
    }
    return this.wrap(
      'section',
      {
        className: uiCssClass('index-page'),
        style: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
        },
      },
      children,
    )
  }

  /**
   * 移动端列表项：三槽 nowrap（leading | body | trailing）。
   * 左右按内容宽，中间吃剩并靠 minWidth:0 省略；不走可 wrap 的 {@link row}。
   */
  listTile(slots: UiListTileSlots<TNode>): TNode {
    const bodyInner = slots.subtitle
      ? this.column([slots.title(), slots.subtitle()])
      : slots.title()
    const children: TNode[] = []
    if (slots.leading) {
      children.push(
        this.wrap(
          'div',
          {
            className: uiCssClass('list-tile', 'leading'),
            style: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
          },
          [slots.leading()],
        ),
      )
    }
    children.push(
      this.wrap(
        'div',
        {
          className: uiCssClass('list-tile', 'body'),
          style: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 0,
            minWidth: 0,
          },
        },
        [bodyInner],
      ),
    )
    if (slots.trailing) {
      children.push(
        this.wrap(
          'div',
          {
            className: uiCssClass('list-tile', 'trailing'),
            style: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
          },
          [slots.trailing()],
        ),
      )
    }
    return this.wrap(
      'div',
      {
        className: uiCssClass('list-tile'),
        style: {
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: this.gap,
          minWidth: 0,
        },
      },
      children,
    )
  }
}
