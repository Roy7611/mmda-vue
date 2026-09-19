/*
 * 图表是 Builder 插件，不进 chrome UiFactory。
 * App / 皮肤：builder.use(chartAsPlugin(createSfChartFactory()))。
 * 契约在 @mmda/core ui/plugins。vui 钉成 VNode。
 */
import type { VNode } from 'vue'
import type { UiChartFactory, UiChartProps, UiPlugin } from '@mmda/core'
import { UiPluginName, uiPlugin } from '@mmda/core'

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

/** 把现有 UiChartFactory 收成 plugin('chart').buildUi；图种在 props.type / chartKind。 */
export function chartAsPlugin(factory: UiChartFactory): UiPlugin {
  return uiPlugin(UiPluginName.chart, (_context, props) => {
    const p = (props ?? {}) as UiChartProps & { chartKind?: string }
    const kind = String(p.chartKind ?? p.type ?? 'bar')
    switch (kind) {
      case 'line':
        return factory.lineChart(p.data!, p)
      case 'area':
        return factory.areaChart(p.data!, p)
      case 'pie':
        return factory.pieChart(p.data!, p)
      case 'doughnut':
        return factory.doughnutChart(p.data!, p)
      case 'scatter':
        return factory.scatterChart(p.data!, p)
      case 'radar':
        return factory.radarChart(p.data!, p)
      case 'combo':
      case 'comboChart':
        return factory.comboChart(p.data!, p)
      case 'circularGauge':
      case 'circular-gauge':
        return factory.circularGauge(p as any)
      case 'linearGauge':
      case 'linear-gauge':
        return factory.linearGauge(p as any)
      case 'heatMap':
      case 'heat-map':
        return factory.heatMap(p as any)
      case 'geoHeatMap':
      case 'geo-heat-map':
        return factory.geoHeatMap(p as any)
      case 'calendarHeatMap':
      case 'calendar-heat-map':
        return factory.calendarHeatMap(p as any)
      case 'sankey':
        return factory.sankey(p as any)
      case 'smithChart':
      case 'smith-chart':
        return factory.smithChart(p as any)
      case 'sparkline':
        return factory.sparkline(p as any)
      case 'stockChart':
      case 'stock-chart':
        return factory.stockChart(p as any)
      case 'treeMap':
      case 'tree-map':
        return factory.treeMap(p as any)
      case 'funnel':
        return factory.funnel(p as any)
      case 'pyramid':
        return factory.pyramid(p as any)
      case 'waterfall':
        return factory.waterfall(p as any)
      case 'boxPlot':
      case 'box-plot':
        return factory.boxPlot(p as any)
      case 'histogram':
        return factory.histogram(p as any)
      case 'bubble':
        return factory.bubble(p as any)
      case 'bullet':
        return factory.bullet(p as any)
      case 'sunburst':
        return factory.sunburst(p as any)
      case 'bar':
      default:
        return factory.barChart(p.data!, p)
    }
  })
}
