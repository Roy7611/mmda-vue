/*
 * 契约（`UiTempisTimelineProps`）→ Tempis 引擎选项（纯函数，无 Vue）。
 *
 * 三件事，多一件都不干：
 * 1. **数据**：`items` / `categories` / `bands` / `dependencies`
 *    （行标识 `key → id` 的翻译在 `tempis_items.ts`）。
 * 2. **结构**：range / legend / tooltip / style / scrollbar / minimap / grouping /
 *    accessibility / selection —— Tempis 只在**构造时**读它们，变了要重建实例，
 *    重建判定用 {@link tempisStructureOf}。
 * 3. **节点委托**：契约 `tooltip.template` 返回 `unknown`（Vue VNode / ReactNode /
 *    HTML 字符串），由宿主注入 `renderNode` 换成引擎认的 `HTMLElement | string`。
 *
 * 回调（click / hover / selectionChange / rangeChange / groupToggle / onReady）
 * 按引用透传；**最新引用由宿主转发**（引擎活过很多次渲染，闭包不能钉死旧 props）。
 */
import type {
  TempisTimelineBand,
  TempisTimelineCategory,
  TempisTimelineDependency,
  TempisTimelineOptions,
  TempisTimelineRangeOptions,
  TempisTimelineTooltipOptions,
} from '@tempis/timeline'
import type { UiTempisRange, UiTempisTimelineProps, UiTempisTooltip } from '@mmda/vui'
import { tempisItemsForEngine } from './tempis_items'

/** 契约模板返回值 → 元素。由框架宿主提供（Vue 用 `createApp`，React 用 `createRoot`）。 */
export type TempisNodeRenderer = (node: unknown) => HTMLElement | string | null

export type TempisOptionDeps = {
  /** 节点渲染委托；不给时非字符串节点一律当「没给」（回落引擎默认 tooltip）。 */
  renderNode?: TempisNodeRenderer
}

/** 模板返回值 → 引擎内容：字符串直传（引擎按 HTML 塞入），节点交给渲染委托，其余当没给。 */
export function tempisTooltipNodeOf(
  node: unknown,
  renderNode?: TempisNodeRenderer,
): HTMLElement | string | null {
  if (node == null) return null
  if (typeof node === 'string') return node
  return renderNode ? renderNode(node) : null
}

export function tempisCategoriesForEngine<T>(
  props: UiTempisTimelineProps<T>,
): TempisTimelineCategory[] {
  return (props.categories ?? []).map((category) => {
    const next: TempisTimelineCategory = {
      name: category.name,
      label: category.label,
    }
    if (category.style) next.style = category.style
    return next
  })
}

export function tempisBandsForEngine<T>(
  props: UiTempisTimelineProps<T>,
): TempisTimelineBand[] {
  return (props.bands ?? []).map((band) => {
    const next: TempisTimelineBand = { start: band.start }
    if (band.end != null) next.end = band.end
    if (band.style) next.style = band.style
    return next
  })
}

export function tempisDependenciesForEngine<T>(
  props: UiTempisTimelineProps<T>,
): TempisTimelineDependency[] {
  return (props.dependencies ?? []).map((dependency) => {
    const next: TempisTimelineDependency = {
      source: dependency.source,
      target: dependency.target,
    }
    if (dependency.style) next.style = dependency.style
    return next
  })
}

export function tempisRangeOf(
  range?: UiTempisRange,
): TempisTimelineRangeOptions | undefined {
  if (!range) return undefined
  const next: TempisTimelineRangeOptions = {}
  if (range.start != null) next.start = range.start
  if (range.end != null) next.end = range.end
  if (range.position != null) next.position = range.position
  if (range.fixed != null) next.fixed = range.fixed
  if (range.min != null) next.min = range.min
  if (range.max != null) next.max = range.max
  if (range.minorUnit) next.minorUnit = range.minorUnit
  if (range.majorUnit) next.majorUnit = range.majorUnit
  if (range.zoom) next.zoom = range.zoom
  return next
}

export function tempisTooltipOf(
  tooltip?: UiTempisTooltip,
  deps: TempisOptionDeps = {},
): TempisTimelineTooltipOptions | undefined {
  if (!tooltip) return undefined
  const next: TempisTimelineTooltipOptions = {}
  if (tooltip.enabled != null) next.enabled = tooltip.enabled
  if (tooltip.delay != null) next.delay = tooltip.delay
  if (tooltip.dateFormat != null) next.dateFormat = tooltip.dateFormat
  if (tooltip.overflowBehavior != null) {
    next.overflowBehavior = tooltip.overflowBehavior
  }
  if (tooltip.shouldShow) next.shouldShow = tooltip.shouldShow
  if (tooltip.template) {
    const template = tooltip.template
    next.template = (id) =>
      tempisTooltipNodeOf(template(id), deps.renderNode)
  }
  return next
}

export function tempisOptionsOf<T>(
  props: UiTempisTimelineProps<T>,
  deps: TempisOptionDeps = {},
): TempisTimelineOptions {
  const options: TempisTimelineOptions = {
    // 契约默认跟着容器走（D7 拍定）；显式 false 才关。
    responsive: props.responsive !== false,
    rtl: Boolean(props.rtl),
    items: tempisItemsForEngine(props),
  }
  if (props.accessibility) options.accessibility = props.accessibility
  if (props.verticalFill) options.verticalFill = props.verticalFill
  if (props.stackMode) options.stackMode = props.stackMode
  if (props.selectionMode) options.selection = props.selectionMode
  const range = tempisRangeOf(props.range)
  if (range) options.range = range
  if (props.legend) options.legend = props.legend
  const tooltip = tempisTooltipOf(props.tooltip, deps)
  if (tooltip) options.tooltip = tooltip
  if (props.scrollbar) options.scrollbar = props.scrollbar
  if (props.minimap) options.minimap = props.minimap
  if (props.grouping) options.grouping = props.grouping
  if (props.font || props.itemStyle || props.gridColor) {
    options.style = {
      font: props.font,
      item: props.itemStyle,
      gridColor: props.gridColor,
    }
  }
  const categories = tempisCategoriesForEngine(props)
  if (categories.length) options.categories = categories
  const bands = tempisBandsForEngine(props)
  if (bands.length) options.bands = bands
  const dependencies = tempisDependenciesForEngine(props)
  if (dependencies.length) options.dependencies = dependencies
  if (props.onItemClick) options.onItemClick = props.onItemClick
  if (props.onItemDoubleClick) {
    options.onItemDoubleClick = props.onItemDoubleClick
  }
  if (props.onItemContextClick) {
    options.onItemContextClick = props.onItemContextClick
  }
  if (props.onItemHover) options.onItemHover = props.onItemHover
  if (props.onSelectionChange) {
    options.onSelectionChange = props.onSelectionChange
  }
  if (props.onRangeChange) options.onRangeChange = props.onRangeChange
  if (props.onGroupToggle) options.onGroupToggle = props.onGroupToggle
  return options
}

/**
 * 只含**构造期**选项的签名对象：宿主 deep-watch 它，变了就重建实例。
 *
 * 刻意排除两类东西：
 * - **数据**（items / categories / bands / dependencies）：走 setter，不重建。
 * - **函数**（各类回调、`tooltip.template` / `shouldShow`、`grouping.sort`）：
 *   回调由宿主按最新 props 转发；`sort` 只在构造时读一次（要换比较器就换 `key` 重建）。
 *
 * deep-watch 的对象里只有标量、枚举与普通对象 —— 引用稳定时不触发重建。
 */
export function tempisStructureOf<T>(
  props: UiTempisTimelineProps<T>,
): Record<string, unknown> {
  return {
    responsive: props.responsive !== false,
    rtl: Boolean(props.rtl),
    verticalFill: props.verticalFill ?? null,
    stackMode: props.stackMode ?? null,
    selectionMode: props.selectionMode ?? null,
    range: tempisRangeOf(props.range) ?? null,
    legend: props.legend ?? null,
    scrollbar: props.scrollbar ?? null,
    minimap: props.minimap ?? null,
    accessibility: props.accessibility ?? null,
    groupingCollapsible: props.grouping?.collapsible ?? null,
    font: props.font ?? null,
    itemStyle: props.itemStyle ?? null,
    gridColor: props.gridColor ?? null,
    tooltip: props.tooltip
      ? {
          enabled: props.tooltip.enabled ?? null,
          delay: props.tooltip.delay ?? null,
          dateFormat: props.tooltip.dateFormat ?? null,
          overflowBehavior: props.tooltip.overflowBehavior ?? null,
        }
      : null,
  }
}
