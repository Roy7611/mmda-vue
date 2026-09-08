/*
 * 图表是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setChartFactory(...)；皮肤 `./charts` 或独立引擎包。
 */
import type { VNode } from 'vue'
import type { PropData, UiOrientation } from '../layout/layout'

export type UiChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'scatter'
  | 'radar'

/** @deprecated 用 UiOrientation */
export type UiChartOrientation = UiOrientation

export type UiComboSeriesType = 'bar' | 'line' | 'area'

export interface UiChartDataset {
  label?: string
  data: number[]
  type?: UiComboSeriesType
  backgroundColor?: string | string[]
  borderColor?: string | string[]
}

export interface UiChartData {
  labels?: string[]
  datasets: UiChartDataset[]
}

export interface UiChartProps extends PropData {
  data?: UiChartData
  type?: UiChartType
  stacked?: boolean
  orientation?: UiOrientation
  options?: Record<string, unknown>
}

export interface UiChartRange {
  from: number
  to: number
  color?: string
  label?: string
}

export interface UiCircularGaugeProps extends PropData {
  value: number
  min?: number
  max?: number
  label?: string
  needle?: boolean
  ranges?: UiChartRange[]
}

export interface UiLinearGaugeProps extends PropData {
  value: number
  min?: number
  max?: number
  label?: string
  needle?: boolean
  ranges?: UiChartRange[]
  orientation?: UiOrientation
}

export interface UiHeatMapProps extends PropData {
  xLabels: string[]
  yLabels: string[]
  values: number[][]
  min?: number
  max?: number
  options?: Record<string, unknown>
}

export interface UiGeoHeatMapProps extends PropData {
  points?: { lng: number; lat: number; value: number }[]
  regions?: { regionId: string; value: number }[]
  map?: string | object
  min?: number
  max?: number
  options?: Record<string, unknown>
}

export interface UiCalendarHeatMapProps extends PropData {
  dates: { date: string; value: number }[]
  min?: number
  max?: number
  options?: Record<string, unknown>
}

export interface UiSankeyNode {
  id: string
  label?: string
}

export interface UiSankeyLink {
  source: string
  target: string
  value: number
}

export type UiSankeyLabelOf = (node: UiSankeyNode) => string

export interface UiSankeyProps extends PropData {
  nodes?: UiSankeyNode[]
  links: UiSankeyLink[]
  orientation?: UiOrientation
  width?: string | number
  height?: string | number
  labelOf?: UiSankeyLabelOf
  options?: Record<string, unknown>
}

export function sankeyNodesOf(props: Pick<UiSankeyProps, 'nodes' | 'links'>): UiSankeyNode[] {
  if (props.nodes?.length) return props.nodes
  const seen = new Set<string>()
  const nodes: UiSankeyNode[] = []
  for (const link of props.links ?? []) {
    for (const id of [link.source, link.target]) {
      if (!id || seen.has(id)) continue
      seen.add(id)
      nodes.push({ id })
    }
  }
  return nodes
}

export function sankeyLabelOf(
  node: UiSankeyNode,
  labelOf?: UiSankeyLabelOf,
): string {
  if (labelOf) return labelOf(node)
  return node.label ?? node.id
}

export function chartBoxStyle(
  width?: string | number,
  height?: string | number,
): Record<string, string> | undefined {
  const style: Record<string, string> = {}
  if (width != null && width !== '') {
    style.width = typeof width === 'number' ? `${width}px` : String(width)
  }
  if (height != null && height !== '') {
    style.height = typeof height === 'number' ? `${height}px` : String(height)
  }
  return Object.keys(style).length ? style : undefined
}

export interface UiSmithChartPoint {
  resistance: number
  reactance: number
}

export interface UiSmithChartSeries {
  name?: string
  points: UiSmithChartPoint[]
}

export type UiSmithChartType = 'impedance' | 'admittance'

export interface UiSmithChartProps extends PropData {
  series: UiSmithChartSeries[]
  type?: UiSmithChartType
  title?: string
  width?: string | number
  height?: string | number
  options?: Record<string, unknown>
}

export type UiSparklineType = 'line' | 'column' | 'area' | 'winLoss' | 'pie'

export interface UiSparklinePoint {
  x?: string | number
  y: number
}

export interface UiSparklineProps extends PropData {
  data: number[] | UiSparklinePoint[]
  type?: UiSparklineType
  width?: string | number
  height?: string | number
  fill?: string
  highColor?: string
  lowColor?: string
  startColor?: string
  endColor?: string
  negativeColor?: string
  options?: Record<string, unknown>
}

export function sparklinePointsOf(
  data: number[] | UiSparklinePoint[] | undefined,
): UiSparklinePoint[] {
  if (!data?.length) return []
  if (typeof data[0] === 'number') {
    return (data as number[]).map((y, i) => ({ x: i, y }))
  }
  return (data as UiSparklinePoint[]).map((point, i) => ({
    x: point.x ?? i,
    y: point.y,
  }))
}

export type UiStockChartType = 'candle' | 'ohlc'

export interface UiStockChartProps extends PropData {
  data: Record<string, unknown>[]
  xName?: string
  open?: string
  high?: string
  low?: string
  close?: string
  volume?: string
  type?: UiStockChartType
  width?: string | number
  height?: string | number
  periodSelector?: boolean
  options?: Record<string, unknown>
}

export interface UiStockChartKeys {
  xName: string
  open: string
  high: string
  low: string
  close: string
  volume: string
}

export function stockChartKeysOf(
  props: Pick<
    UiStockChartProps,
    'xName' | 'open' | 'high' | 'low' | 'close' | 'volume'
  >,
): UiStockChartKeys {
  return {
    xName: props.xName ?? 'date',
    open: props.open ?? 'open',
    high: props.high ?? 'high',
    low: props.low ?? 'low',
    close: props.close ?? 'close',
    volume: props.volume ?? 'volume',
  }
}

export function stockChartHasVolume(
  data: Record<string, unknown>[] | undefined,
  volumeKey: string,
): boolean {
  return (data ?? []).some((row) => row[volumeKey] != null)
}

export type UiTreeMapLayout = 'squarified' | 'sliceAndDice'

export interface UiTreeMapNode {
  name: string
  value?: number
  children?: UiTreeMapNode[]
}

export type UiTreeMapLabelOf = (node: UiTreeMapNode) => string

export interface UiTreeMapProps extends PropData {
  data: UiTreeMapNode[]
  width?: string | number
  height?: string | number
  labelOf?: UiTreeMapLabelOf
  palette?: string[]
  layout?: UiTreeMapLayout
  drillDown?: boolean
  options?: Record<string, unknown>
}

export function treeMapLabelOf(
  node: UiTreeMapNode,
  labelOf?: UiTreeMapLabelOf,
): string {
  if (labelOf) return labelOf(node)
  return node.name
}

export function treeMapWeightedOf(
  data: UiTreeMapNode[] | undefined,
): UiTreeMapNode[] {
  return (data ?? []).map(weightTreeMapNode)
}

function weightTreeMapNode(node: UiTreeMapNode): UiTreeMapNode {
  const children = node.children?.length
    ? node.children.map(weightTreeMapNode)
    : undefined
  const childSum =
    children?.reduce((sum, child) => sum + (child.value ?? 0), 0) ?? 0
  return {
    ...node,
    children,
    value: node.value ?? childSum,
  }
}

export interface UiFunnelItem {
  name: string
  value: number
}

export interface UiFunnelProps extends PropData {
  data: UiFunnelItem[]
  width?: string | number
  height?: string | number
  options?: Record<string, unknown>
}

export type UiPyramidProps = UiFunnelProps

export interface UiWaterfallItem {
  name: string
  value: number
  total?: boolean
}

export interface UiWaterfallProps extends PropData {
  data: UiWaterfallItem[]
  width?: string | number
  height?: string | number
  options?: Record<string, unknown>
}

export interface UiBoxPlotItem {
  name: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
}

export interface UiBoxPlotProps extends PropData {
  data: UiBoxPlotItem[]
  width?: string | number
  height?: string | number
  options?: Record<string, unknown>
}

export interface UiHistogramProps extends PropData {
  values: number[]
  bins?: number
  width?: string | number
  height?: string | number
  options?: Record<string, unknown>
}

export interface UiBubblePoint {
  x: number
  y: number
  size: number
}

export interface UiBubbleProps extends PropData {
  data: UiBubblePoint[]
  width?: string | number
  height?: string | number
  options?: Record<string, unknown>
}

export interface UiBulletProps extends PropData {
  value: number
  target: number
  min?: number
  max?: number
  ranges?: UiChartRange[]
  orientation?: UiOrientation
  width?: string | number
  height?: string | number
  options?: Record<string, unknown>
}

export interface UiSunburstProps extends PropData {
  data: UiTreeMapNode[]
  width?: string | number
  height?: string | number
  labelOf?: UiTreeMapLabelOf
  options?: Record<string, unknown>
}

export type UiChartRenderer = (
  data: UiChartData,
  props?: UiChartProps,
) => VNode

export interface UiChartFactory {
  chart: UiChartRenderer
  barChart: UiChartRenderer
  lineChart: UiChartRenderer
  areaChart: UiChartRenderer
  pieChart: UiChartRenderer
  doughnutChart: UiChartRenderer
  scatterChart: UiChartRenderer
  radarChart: UiChartRenderer
  circularGauge: (props: UiCircularGaugeProps) => VNode
  linearGauge: (props: UiLinearGaugeProps) => VNode
  heatMap: (props: UiHeatMapProps) => VNode
  geoHeatMap: (props: UiGeoHeatMapProps) => VNode
  calendarHeatMap: (props: UiCalendarHeatMapProps) => VNode
  sankey: (props: UiSankeyProps) => VNode
  smithChart: (props: UiSmithChartProps) => VNode
  sparkline: (props: UiSparklineProps) => VNode
  stockChart: (props: UiStockChartProps) => VNode
  treeMap: (props: UiTreeMapProps) => VNode
  funnel: (props: UiFunnelProps) => VNode
  pyramid: (props: UiPyramidProps) => VNode
  waterfall: (props: UiWaterfallProps) => VNode
  boxPlot: (props: UiBoxPlotProps) => VNode
  histogram: (props: UiHistogramProps) => VNode
  bubble: (props: UiBubbleProps) => VNode
  bullet: (props: UiBulletProps) => VNode
  sunburst: (props: UiSunburstProps) => VNode
  comboChart: UiChartRenderer
}

export const CHART_PLUGIN_NOT_INSTALLED = 'chart plugin not installed'

export function chartNotSupportedMessage(name: string): string {
  return `not supported: ${name}`
}

export function unsupportedChartMethod(
  name: string,
): (...args: any[]) => never {
  return () => {
    throw new Error(chartNotSupportedMessage(name))
  }
}

function notInstalled(): never {
  throw new Error(CHART_PLUGIN_NOT_INSTALLED)
}

export function unimplementedChartFactory(): UiChartFactory {
  return {
    chart: notInstalled,
    barChart: notInstalled,
    lineChart: notInstalled,
    areaChart: notInstalled,
    pieChart: notInstalled,
    doughnutChart: notInstalled,
    scatterChart: notInstalled,
    radarChart: notInstalled,
    circularGauge: notInstalled,
    linearGauge: notInstalled,
    heatMap: notInstalled,
    geoHeatMap: notInstalled,
    calendarHeatMap: notInstalled,
    sankey: notInstalled,
    smithChart: notInstalled,
    sparkline: notInstalled,
    stockChart: notInstalled,
    treeMap: notInstalled,
    funnel: notInstalled,
    pyramid: notInstalled,
    waterfall: notInstalled,
    boxPlot: notInstalled,
    histogram: notInstalled,
    bubble: notInstalled,
    bullet: notInstalled,
    sunburst: notInstalled,
    comboChart: notInstalled,
  }
}

export function chartShortcuts(chart: UiChartRenderer): Omit<
  UiChartFactory,
  | 'chart'
  | 'circularGauge'
  | 'linearGauge'
  | 'heatMap'
  | 'geoHeatMap'
  | 'calendarHeatMap'
  | 'sankey'
  | 'smithChart'
  | 'sparkline'
  | 'stockChart'
  | 'treeMap'
  | 'funnel'
  | 'pyramid'
  | 'waterfall'
  | 'boxPlot'
  | 'histogram'
  | 'bubble'
  | 'bullet'
  | 'sunburst'
  | 'comboChart'
> {
  return {
    barChart: (data, props) => chart(data, { ...props, type: 'bar' }),
    lineChart: (data, props) => chart(data, { ...props, type: 'line' }),
    areaChart: (data, props) => chart(data, { ...props, type: 'area' }),
    pieChart: (data, props) => chart(data, { ...props, type: 'pie' }),
    doughnutChart: (data, props) =>
      chart(data, { ...props, type: 'doughnut' }),
    scatterChart: (data, props) => chart(data, { ...props, type: 'scatter' }),
    radarChart: (data, props) => chart(data, { ...props, type: 'radar' }),
  }
}

export function resolveChartData(
  data: UiChartData,
  props?: UiChartProps,
): UiChartData {
  return props?.data ?? data
}

export function resolveChartType(
  props: UiChartProps | undefined,
  fallback: UiChartType = 'bar',
): UiChartType {
  return props?.type ?? fallback
}

export type UiChartHookKind =
  | 'chart'
  | 'circular-gauge'
  | 'linear-gauge'
  | 'heat-map'
  | 'geo-heat-map'
  | 'calendar-heat-map'
  | 'sankey'
  | 'smith-chart'
  | 'sparkline'
  | 'stock-chart'
  | 'tree-map'
  | 'funnel'
  | 'pyramid'
  | 'waterfall'
  | 'box-plot'
  | 'histogram'
  | 'bubble'
  | 'bullet'
  | 'sunburst'
  | 'combo-chart'

export function chartHookClass(
  kind: UiChartHookKind,
  extra?: unknown,
): unknown[] {
  return [`mmda-${kind}`, extra]
}
