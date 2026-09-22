/**
 * Tempis 时间轴画布（二维：时间 × 泳道 + 依赖箭头）契约。无 Vue。
 *
 * 与列表时间轴（{@link file://./timeline.ts `factory.timeline`}）的关系：
 * {@link UiTempisTimelineProps} **extends** {@link UiTimelineProps}，共用行绑定与
 * `UiTimelineItem` 骨架；两维轴自己的东西（起止、泳道、类别、依赖、可见范围、缩放、
 * 图例、tooltip、选择、控制器）全部长在这一层。
 *
 * 判定（拍定 D2 / D4 / D5）：**普通 timeline 不支持的，共享契约里不放** —— 所以
 * 事件、控制器、`range`、tooltip 模板都只在这里，不在 {@link UiTimelineProps}。
 *
 * 入口是 Builder 插件：`builder.use(createTempisTimelinePlugin())` +
 * `builder.buildTempisTimeline(ctx, props)`（未装插件**抛错**，不回落列表时间轴）。
 * 命名沿用 Tempis 自己的词（`verticalFill` / `stackMode` / `minimap` / …），
 * 唯一改名的是 `style`（与 `UiProps.style` 撞名，拆成 `font` / `itemStyle` / `gridColor`）
 * 与 `selection`（拆成「模式」`selectionMode` 与「受控值」`selectedIds`）。
 */
import type { UiTimelineFieldOf, UiTimelineItem, UiTimelineProps } from './timeline'
import {
  timelineBoolOf,
  timelineFieldValueOf,
  timelineKeyOf,
  timelineStringOf,
} from './timeline'

export const TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED =
  'tempis-timeline plugin not installed'

/** 边框 / 连接线线型。 */
export type UiTempisLineStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'dash-dot'
  | 'long-dash'

/** 逐项（或按类别）覆盖的条目样式。 */
export interface UiTempisItemStyle {
  backgroundColor?: string
  fontColor?: string
  padding?: number
  borderColor?: string
  borderThickness?: number
  borderStyle?: UiTempisLineStyle
  borderRadius?: number
}

export interface UiTempisFont {
  size?: number
  family?: string
  style?: string
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number
  lineHeight?: number | string
}

/** 轴级数据：类别（配色 + 图例 + 点击筛选的键，对应行的 `category`）。 */
export interface UiTempisCategory {
  name: string
  label: string
  style?: UiTempisItemStyle
}

export interface UiTempisBandStyle {
  color?: string
  borderColor?: string
  borderThickness?: number
  opacity?: number
}

/** 轴级数据：时间带（高亮区段 / 截止线）。`end` 缺省画线。 */
export interface UiTempisBand {
  start: Date | string | number
  end?: Date | string | number
  style?: UiTempisBandStyle
}

export interface UiTempisDependencyStyle {
  color?: string
  lineWidth?: number
  lineStyle?: UiTempisLineStyle
  opacity?: number
}

/** 轴级数据：条目关系（箭头由 `source` 指向 `target`，取值是行的 `key`）。 */
export interface UiTempisDependency {
  source: string | number
  target: string | number
  style?: UiTempisDependencyStyle
}

export interface UiTempisRangeZoom {
  enabled?: boolean
  /** 最小可缩范围（毫秒）。 */
  min?: number
  /** 最大可缩范围（毫秒）。 */
  max?: number
  wheelSensitivity?: number
  pinchSensitivity?: number
  /** 是否要求按住 Ctrl / Cmd 才滚轮缩放。 */
  requireModifier?: boolean
}

/** 刻度文案格式（年 / 月 / 日 / … 各给一个模板串）。 */
export interface UiTempisRangeUnitFormats {
  millisecond?: string
  second?: string
  minute?: string
  hour?: string
  day?: string
  month?: string
  year?: string
}

/** 刻度单位样式：次要（细刻度）与主要（粗刻度）各一份。 */
export interface UiTempisRangeUnit {
  font?: UiTempisFont
  formats?: UiTempisRangeUnitFormats
}

export interface UiTempisRange {
  start?: Date | string | number
  end?: Date | string | number
  position?: 'top' | 'bottom' | 'both' | 'none'
  /** 固定后用户不能平移缩放。 */
  fixed?: boolean
  min?: Date | string | number
  max?: Date | string | number
  /** 细刻度（次要单位）的字体与文案格式。 */
  minorUnit?: UiTempisRangeUnit
  /** 粗刻度（主要单位）的字体与文案格式。 */
  majorUnit?: UiTempisRangeUnit
  zoom?: UiTempisRangeZoom
}

export interface UiTempisGrouping {
  /** 泳道排序；不给按 items 首现顺序。 */
  sort?: (a: string, b: string) => number
  /** 允许点泳道头折叠。 */
  collapsible?: boolean
}

export interface UiTempisLegend {
  position?: 'top' | 'bottom' | 'none'
  alignment?: 'start' | 'center' | 'end'
  markerStyle?: 'square' | 'square-rounded' | 'circle'
  isHighlightOnHover?: boolean
  isFilterOnClick?: boolean
  gap?: number
}

export interface UiTempisTooltip {
  enabled?: boolean
  delay?: number
  /** 厂商格式 token（如 `D MMMM HH:mm:ss`），与列表侧 `timeFormat` 不是一套。 */
  dateFormat?: string
  overflowBehavior?: 'none' | 'canvas' | 'viewport'
  /**
   * 自定义 tooltip 内容。**节点渲染委托**：vui 传 VNode、rui 传 ReactNode，
   * 也可直接给 HTML 字符串 —— core 不收框架类型，故此处是 `unknown`。
   */
  template?: (id: string | number) => unknown
  shouldShow?: (id: string | number) => boolean
}

export interface UiTempisScrollbar {
  visibility?: 'always' | 'hover' | 'panning' | 'never'
  color?: string
}

/** 给小地图就不为空即开启。 */
export interface UiTempisMinimap {
  height?: number
  backgroundColor?: string
  viewportColor?: string
}

export interface UiTempisAccessibility {
  ariaLabel?: string
  /** 方向键平移、± 缩放。 */
  keyboard?: boolean
  keyboardPanStep?: number
  keyboardZoomStep?: number
}

export type UiTempisSelectionMode = 'none' | 'single' | 'multi'

export type UiTempisVerticalFill = 'content' | 'fill-canvas' | 'grow-canvas'

export type UiTempisStackMode = 'compact' | 'stable'

/** 选择变化：一条 = 一个条目的选中态变化。 */
export interface UiTempisSelectionChange {
  id: string | number
  selected: boolean
}

/** 动画缓动名（引擎内置曲线，不是回调）。 */
export type UiTempisEasing =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'

/** 定位目标：条目 / 日期 / 区间三选一。 */
export interface UiTempisFocusOptions {
  id?: string | number
  date?: Date | string | number
  range?: [Date | string | number, Date | string | number]
  animate?: boolean
  duration?: number
  easing?: UiTempisEasing
  zoom?: boolean | 'auto'
}

/** 命令式入口（`onReady` 给到业务）。`destroy` 不进契约：宿主生命周期自管。 */
export interface UiTempisTimelineController {
  focus: (options?: UiTempisFocusOptions | Date | string | number) => void
  getRange: () => { start: Date; end: Date } | undefined
  redraw: () => void
  toImage: (options?: {
    type?: string
    quality?: number
    dpr?: number
    backgroundColor?: string
  }) => Promise<Blob | undefined>
  getSelection: () => Array<string | number>
  setSelection: (ids: Array<string | number>) => void
  clearSelection: () => void
  getItems: () => UiTempisTimelineItem[]
  setItems: (items: UiTempisTimelineItem[]) => void
  getCategories: () => UiTempisCategory[]
  setCategories: (categories: UiTempisCategory[]) => void
  setBands: (bands: UiTempisBand[]) => void
  setDependencies: (dependencies: UiTempisDependency[]) => void
  setGroupCollapsed: (group: string, collapsed?: boolean) => void
  isGroupCollapsed: (group: string) => boolean
}

/** 解析后的画布行：列表行骨架 + 两维轴要的字段。 */
export interface UiTempisTimelineItem extends UiTimelineItem {
  /** 条/点起点。**必给**（没有 start 的行不会出现在轴上）。 */
  start?: Date | string | number
  /** 有 = 区间条；无 = 时间点标记。 */
  end?: Date | string | number
  /** 泳道名。 */
  grouping?: string
  /** 类别名，对应 {@link UiTempisCategory.name}。 */
  category?: string
  /** 0–1，区间条内填充比例。 */
  progress?: number
  style?: UiTempisItemStyle
  selected?: boolean
}

export interface UiTempisTimelineProps<T = unknown> extends UiTimelineProps<T> {
  // —— 行 → 轴字段（列表侧只认 timeField，其余在这里）——
  /** 起点。不给时回落 `timeField`（只给 `time` 的点事件也能落在轴上）。 */
  startField?: UiTimelineFieldOf<T, Date | string | number>
  endField?: UiTimelineFieldOf<T, Date | string | number>
  groupingField?: UiTimelineFieldOf<T, string>
  categoryField?: UiTimelineFieldOf<T, string>
  /** 0–1。 */
  progressField?: UiTimelineFieldOf<T, number>
  styleField?: UiTimelineFieldOf<T, UiTempisItemStyle>
  /** 行级选中；`selectedIds` 给了就以它为准。 */
  selectedField?: UiTimelineFieldOf<T, boolean>

  // —— 轴级数据 ——
  categories?: UiTempisCategory[]
  bands?: UiTempisBand[]
  dependencies?: UiTempisDependency[]

  // —— 视图与交互 ——
  /** 画布跟随容器尺寸，默认 true。 */
  responsive?: boolean
  verticalFill?: UiTempisVerticalFill
  stackMode?: UiTempisStackMode
  range?: UiTempisRange
  grouping?: UiTempisGrouping
  legend?: UiTempisLegend
  tooltip?: UiTempisTooltip
  scrollbar?: UiTempisScrollbar
  minimap?: UiTempisMinimap
  accessibility?: UiTempisAccessibility
  /** Tempis 的 `style.font`。 */
  font?: UiTempisFont
  /** Tempis 的 `style.item`（全局缺省条目样式，逐项 `style` 覆盖它）。 */
  itemStyle?: UiTempisItemStyle
  /** Tempis 的 `style.gridColor`。 */
  gridColor?: string

  // —— 选中 ——
  selectionMode?: UiTempisSelectionMode
  /** **给值 = 受控**：引擎不自管，靠 `onSelectionChange` + `setSelection` 回写。 */
  selectedIds?: Array<string | number>

  // —— 事件（列表时间轴没有这些）——
  onItemClick?: (id: string | number) => void
  onItemDoubleClick?: (id: string | number) => void
  onItemContextClick?: (
    id: string | number,
    position: { x: number; y: number },
  ) => void
  onItemHover?: (id: string | number | null) => void
  onSelectionChange?: (changes: UiTempisSelectionChange[]) => void
  onRangeChange?: (start: Date, end: Date) => void
  onGroupToggle?: (group: string, collapsed: boolean) => void
  onReady?: (controller: UiTempisTimelineController) => void
}

/**
 * 画布侧行解析：字段绑定只在这里解析一次，插件直接把这个数组交给引擎。
 * **没有 `start`（且没有 `time`）的行会被丢掉** —— 二维轴上放不下无时间的行。
 * `selectedIds` 给了就覆盖行级 `selectedField`。
 */
export function tempisTimelineItemsOf<T>(
  props: UiTempisTimelineProps<T>,
): UiTempisTimelineItem[] {
  const rows = Array.isArray(props.items) ? props.items : []
  const controlled = props.selectedIds
  return rows
    .map((row, index) => {
      const start =
        timelineFieldValueOf(row, index, props.startField, 'start') ??
        timelineFieldValueOf(row, index, props.timeField, 'time')
      if (start == null || start === '') return undefined
      const end = timelineFieldValueOf(row, index, props.endField, 'end')
      const progressRaw = timelineFieldValueOf(
        row,
        index,
        props.progressField,
        'progress',
      )
      const key = timelineKeyOf(row, index, props.keyField)
      const id = key ?? index
      const item: UiTempisTimelineItem = {
        key,
        label:
          timelineStringOf(row, index, props.labelField, 'label') ??
          timelineStringOf(row, index, props.contentField, 'content') ??
          String(index + 1),
        start: start as Date | string | number,
        end:
          end == null || end === ''
            ? undefined
            : (end as Date | string | number),
        grouping: timelineStringOf(row, index, props.groupingField, 'grouping'),
        category: timelineStringOf(row, index, props.categoryField, 'category'),
        progress:
          progressRaw == null || String(progressRaw) === ''
            ? undefined
            : Number(progressRaw),
        style: timelineFieldValueOf(row, index, props.styleField, 'style'),
        selected: controlled
          ? controlled.includes(id)
          : timelineBoolOf(row, index, props.selectedField, 'selected'),
      }
      return item
    })
    .filter((row): row is UiTempisTimelineItem => row != null)
}

export const noopTempisTimelineController: UiTempisTimelineController = {
  focus: () => undefined,
  getRange: () => undefined,
  redraw: () => undefined,
  toImage: async () => undefined,
  getSelection: () => [],
  setSelection: () => undefined,
  clearSelection: () => undefined,
  getItems: () => [],
  setItems: () => undefined,
  getCategories: () => [],
  setCategories: () => undefined,
  setBands: () => undefined,
  setDependencies: () => undefined,
  setGroupCollapsed: () => undefined,
  isGroupCollapsed: () => false,
}
