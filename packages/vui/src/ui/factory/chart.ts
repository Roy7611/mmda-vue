/*
 * 图表是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setChartFactory(...)；皮肤 `./charts` 或独立引擎包。
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiChartFactory } from '@mmda/core'

export type {
  UiChartType,
  UiChartOrientation,
  UiComboSeriesType,
  UiChartDataset,
  UiChartData,
  UiChartProps,
  UiChartRange,
  UiCircularGaugeProps,
  UiLinearGaugeProps,
  UiHeatMapProps,
  UiGeoHeatMapProps,
  UiCalendarHeatMapProps,
  UiSankeyNode,
  UiSankeyLink,
  UiSankeyLabelOf,
  UiSankeyProps,
  UiSmithChartPoint,
  UiSmithChartSeries,
  UiSmithChartType,
  UiSmithChartProps,
  UiSparklineType,
  UiSparklinePoint,
  UiSparklineProps,
  UiStockChartType,
  UiStockChartProps,
  UiStockChartKeys,
  UiTreeMapLayout,
  UiTreeMapNode,
  UiTreeMapLabelOf,
  UiTreeMapProps,
  UiFunnelItem,
  UiFunnelProps,
  UiPyramidProps,
  UiWaterfallItem,
  UiWaterfallProps,
  UiBoxPlotItem,
  UiBoxPlotProps,
  UiHistogramProps,
  UiBubblePoint,
  UiBubbleProps,
  UiBulletProps,
  UiSunburstProps,
  UiChartRenderer,
  UiChartFactory,
  UiChartHookKind,
} from '@mmda/core'

export {
  sankeyNodesOf,
  sankeyLabelOf,
  chartBoxStyle,
  sparklinePointsOf,
  stockChartKeysOf,
  stockChartHasVolume,
  treeMapLabelOf,
  treeMapWeightedOf,
  CHART_PLUGIN_NOT_INSTALLED,
  chartNotSupportedMessage,
  unsupportedChartMethod,
  unimplementedChartFactory,
  chartShortcuts,
  resolveChartData,
  resolveChartType,
  chartHookClass,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueChartFactory = UiChartFactory<VNode>
