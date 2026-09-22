import { createElement, type ReactNode } from 'react'
import {
  chartHookClass,
  chartShortcuts,
  resolveChartData,
  resolveChartType,
  sankeyLabelOf,
  sankeyNodesOf,
  sparklinePointsOf,
  stockChartHasVolume,
  stockChartKeysOf,
  treeMapLabelOf,
  treeMapWeightedOf,
  UiPluginName,
  uiPlugin,
  type UiChartData,
  type UiChartFactory,
  type UiChartProps,
  type UiPlugin,
  type UiSankeyProps,
  type UiSmithChartProps,
  type UiSparklineProps,
  type UiStockChartProps,
  type UiBulletProps,
  type UiTreeMapProps,
  type UiFunnelProps,
  type UiPyramidProps,
  type UiWaterfallProps,
  type UiBoxPlotProps,
  type UiHistogramProps,
  type UiBubbleProps,
  type UiCircularGaugeProps,
  type UiLinearGaugeProps,
  type UiHeatMapProps,
  type UiGeoHeatMapProps,
  type UiCalendarHeatMapProps,
  type UiSunburstProps,
} from '@mmda/core'
import {
  AccumulationChartComponent,
  BulletChartComponent,
  ChartComponent,
  CandleSeries,
  HiloOpenCloseSeries,
  Inject,
  SankeyComponent,
  SmithchartComponent,
  SparklineComponent,
  StockChartComponent,
} from '@syncfusion/ej2-react-charts'
import { joinClass, reactDomProps } from './utils'

const ej2CartesianType = (
  type: ReturnType<typeof resolveChartType>,
  orientation?: UiChartProps['orientation'],
): string => {
  if (type === 'bar') return orientation === 'horizontal' ? 'Bar' : 'Column'
  if (type === 'area') return 'Area'
  if (type === 'line') return 'Line'
  if (type === 'scatter') return 'Scatter'
  if (type === 'radar') return 'Radar'
  return 'Column'
}

function accumulationPoints(data: UiChartData) {
  const labels = data.labels ?? []
  const values = data.datasets[0]?.data ?? []
  return labels.map((x, i) => ({ x, y: values[i] ?? 0 }))
}

function renderChart(data: UiChartData, props: UiChartProps = {}): ReactNode {
  const resolved = resolveChartData(data, props)
  const type = resolveChartType(props)
  const {
    data: _data,
    type: _type,
    stacked,
    orientation,
    options,
    htmlAttributes,
    class: className,
    ...rest
  } = props as any
  const css = joinClass(chartHookClass('chart', className))

  if (type === 'pie' || type === 'doughnut') {
    return createElement(AccumulationChartComponent as any, {
      ...rest,
      ...options,
      ...reactDomProps(props),
      cssClass: css,
      series: [
        {
          type: type === 'doughnut' ? 'Doughnut' : 'Pie',
          dataSource: accumulationPoints(resolved),
          xName: 'x',
          yName: 'y',
        },
      ],
    })
  }

  return createElement(ChartComponent as any, {
    ...rest,
    ...options,
    ...reactDomProps(props),
    cssClass: css,
    primaryXAxis: { valueType: 'Category' },
    series: resolved.datasets.map((set) => ({
      type: ej2CartesianType(type, orientation),
      dataSource: (resolved.labels ?? []).map((label, i) => ({
        x: label,
        y: set.data?.[i],
      })),
      xName: 'x',
      yName: 'y',
      name: set.label,
    })),
  })
}

function fallback(name: string, className: string): ReactNode {
  return createElement(
    'p',
    { className: `mmda-chart-missing ${className ?? ''}` },
    `${name} is not installed`,
  )
}

function renderSankey(props: UiSankeyProps): ReactNode {
  const nodes = sankeyNodesOf(props)
  return createElement(SankeyComponent as any, {
    ...(props as any).options,
    ...reactDomProps(props),
    cssClass: joinClass(chartHookClass('sankey', props.class)),
    dataSource: props.links,
    nodes: nodes.map((node) => ({
      id: node.id,
      label: sankeyLabelOf(node, props.labelOf),
    })),
  })
}

function renderSmithChart(props: UiSmithChartProps): ReactNode {
  return createElement(SmithchartComponent as any, {
    ...(props as any).options,
    ...reactDomProps(props),
    cssClass: joinClass(chartHookClass('smith-chart', props.class)),
    series: props.series.map((series) => ({
      name: series.name,
      points: series.points.map((point) => ({
        resistance: point.resistance,
        reactance: point.reactance,
      })),
    })),
  })
}

function renderSparkline(props: UiSparklineProps): ReactNode {
  const points = sparklinePointsOf(props.data)
  return createElement(SparklineComponent as any, {
    ...(props as any).options,
    ...reactDomProps(props),
    cssClass: joinClass(chartHookClass('sparkline', props.class)),
    type: String(props.type ?? 'Line').charAt(0).toUpperCase() + String(props.type ?? 'Line').slice(1),
    dataSource: points,
    xName: 'x',
    yName: 'y',
    fill: props.fill,
    highPointColor: props.highColor,
    lowPointColor: props.lowColor,
    startPointColor: props.startColor,
    endPointColor: props.endColor,
    negativePointColor: props.negativeColor,
  })
}

function renderStockChart(props: UiStockChartProps): ReactNode {
  const keys = stockChartKeysOf(props)
  const hasVolume = stockChartHasVolume(props.data, keys.volume)
  return createElement(
    StockChartComponent as any,
    {
      ...(props as any).options,
      ...reactDomProps(props),
      cssClass: joinClass(chartHookClass('stock-chart', props.class)),
      series: [
        {
          type: props.type === 'ohlc' ? 'HiloOpenClose' : 'Candle',
          dataSource: props.data,
          xName: keys.xName,
          open: keys.open,
          high: keys.high,
          low: keys.low,
          close: keys.close,
          volume: hasVolume ? 'Volume' : undefined,
        },
      ],
    },
    createElement(Inject as any, {
      services: [CandleSeries, HiloOpenCloseSeries],
    }),
  )
}

function renderBullet(props: UiBulletProps): ReactNode {
  return createElement(BulletChartComponent as any, {
    ...(props as any).options,
    ...reactDomProps(props),
    cssClass: joinClass(chartHookClass('bullet', props.class)),
    dataSource: [{ value: props.value, target: props.target }],
    valueField: 'value',
    targetField: 'target',
    minimum: props.min,
    maximum: props.max,
    ranges: props.ranges?.map((range) => ({
      start: range.from,
      end: range.to,
      color: range.color,
    })),
  })
}

export function createSfChartFactory(): UiChartFactory<ReactNode> {
  const chart = (data: UiChartData, props?: UiChartProps) =>
    renderChart(data, props)

  return {
    ...chartShortcuts(chart),
    chart,
    circularGauge: (props: UiCircularGaugeProps) =>
      fallback('Circular gauge', chartHookClass('circular-gauge', props.class).join(' ')),
    linearGauge: (props: UiLinearGaugeProps) =>
      fallback('Linear gauge', chartHookClass('linear-gauge', props.class).join(' ')),
    heatMap: (props: UiHeatMapProps) =>
      fallback('Heat map', chartHookClass('heat-map', props.class).join(' ')),
    geoHeatMap: (props: UiGeoHeatMapProps) =>
      fallback('Geo heat map', chartHookClass('geo-heat-map', props.class).join(' ')),
    calendarHeatMap: (props: UiCalendarHeatMapProps) =>
      fallback('Calendar heat map', chartHookClass('calendar-heat-map', props.class).join(' ')),
    sankey: renderSankey,
    smithChart: renderSmithChart,
    sparkline: renderSparkline,
    stockChart: renderStockChart,
    treeMap: (props: UiTreeMapProps) =>
      fallback('Tree map', chartHookClass('tree-map', props.class).join(' ')),
    funnel: (props: UiFunnelProps) =>
      fallback('Funnel', chartHookClass('funnel', props.class).join(' ')),
    pyramid: (props: UiPyramidProps) =>
      fallback('Pyramid', chartHookClass('pyramid', props.class).join(' ')),
    waterfall: (props: UiWaterfallProps) =>
      fallback('Waterfall', chartHookClass('waterfall', props.class).join(' ')),
    boxPlot: (props: UiBoxPlotProps) =>
      fallback('Box plot', chartHookClass('box-plot', props.class).join(' ')),
    histogram: (props: UiHistogramProps) =>
      fallback('Histogram', chartHookClass('histogram', props.class).join(' ')),
    bubble: (props: UiBubbleProps) =>
      fallback('Bubble', chartHookClass('bubble', props.class).join(' ')),
    bullet: renderBullet,
    sunburst: (props: UiSunburstProps) =>
      fallback('Sunburst', chartHookClass('sunburst', props.class).join(' ')),
    comboChart: (data: UiChartData, props?: UiChartProps) =>
      renderChart(data, { ...props, type: 'bar' }),
  }
}

export function chartAsPlugin(factory: UiChartFactory<ReactNode>): UiPlugin {
  return uiPlugin(UiPluginName.chart, (_context, props) => {
    const p = (props ?? {}) as UiChartProps & { chartKind?: string }
    const kind = String(p.chartKind ?? p.type ?? 'bar')
    const data = p.data!
    switch (kind) {
      case 'line':
        return factory.lineChart(data, p)
      case 'area':
        return factory.areaChart(data, p)
      case 'pie':
        return factory.pieChart(data, p)
      case 'doughnut':
        return factory.doughnutChart(data, p)
      case 'scatter':
        return factory.scatterChart(data, p)
      case 'radar':
        return factory.radarChart(data, p)
      case 'combo':
      case 'comboChart':
        return factory.comboChart(data, p)
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
      default:
        return factory.barChart(data, p)
    }
  })
}
