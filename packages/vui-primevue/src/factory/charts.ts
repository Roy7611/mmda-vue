import { h } from 'vue'
import Chart from 'primevue/chart'
import type {
  UiChartData,
  UiChartFactory,
  UiChartProps,
  UiCircularGaugeProps,
  UiBubbleProps,
} from '@mmda/vui'
import {
  chartHookClass,
  chartShortcuts,
  htmlAttributesOf,
  resolveChartData,
  resolveChartType,
  unsupportedChartMethod,
} from '@mmda/vui'

function primeType(type: ReturnType<typeof resolveChartType>): string {
  return type === 'area' ? 'line' : type
}

function primeData(data: UiChartData, type: ReturnType<typeof resolveChartType>) {
  if (type !== 'area') return data
  return {
    ...data,
    datasets: data.datasets.map((set) => ({ ...set, fill: true })),
  }
}

function renderChart(data: UiChartData, props: UiChartProps = {}) {
  const resolved = resolveChartData(data, props)
  const type = resolveChartType(props)
  const {
    data: _d,
    type: _t,
    stacked,
    orientation,
    options,
    htmlAttributes,
    class: className,
    ...rest
  } = props
  const indexAxis =
    type === 'bar' && orientation === 'horizontal' ? 'y' : undefined
  return h(Chart as any, {
    ...rest,
    ...htmlAttributesOf(props),
    type: primeType(type),
    data: primeData(resolved, type),
    options: {
      indexAxis,
      scales:
        stacked && (type === 'bar' || type === 'area')
          ? { x: { stacked: true }, y: { stacked: true } }
          : undefined,
      ...options,
    },
    class: chartHookClass('chart', className),
  })
}

function renderBubble(props: UiBubbleProps) {
  const {
    data,
    options,
    htmlAttributes,
    class: className,
    ...rest
  } = props
  return h(Chart as any, {
    ...rest,
    ...htmlAttributesOf(props),
    type: 'bubble',
    data: {
      datasets: [
        {
          data: (data ?? []).map((point) => ({
            x: point.x,
            y: point.y,
            r: point.size,
          })),
        },
      ],
    },
    options,
    class: chartHookClass('bubble', className),
  })
}

function renderComboChart(data: UiChartData, props: UiChartProps = {}) {
  const resolved = resolveChartData(data, props)
  const {
    data: _d,
    type: _t,
    stacked,
    orientation,
    options,
    htmlAttributes,
    class: className,
    ...rest
  } = props
  const indexAxis = orientation === 'horizontal' ? 'y' : undefined
  return h(Chart as any, {
    ...rest,
    ...htmlAttributesOf(props),
    type: 'bar',
    data: {
      ...resolved,
      datasets: resolved.datasets.map((set) => ({
        ...set,
        type: set.type === 'area' ? 'line' : (set.type ?? 'bar'),
        fill: set.type === 'area',
      })),
    },
    options: {
      indexAxis,
      scales:
        stacked
          ? { x: { stacked: true }, y: { stacked: true } }
          : undefined,
      ...options,
    },
    class: chartHookClass('combo-chart', className),
  })
}

export function createPrimeChartFactory(): UiChartFactory {
  const chart = (data: UiChartData, props?: UiChartProps) =>
    renderChart(data, props)
  return {
    chart,
    ...chartShortcuts(chart),
    circularGauge: unsupportedChartMethod(
      'circularGauge',
    ) as UiChartFactory['circularGauge'],
    linearGauge: unsupportedChartMethod(
      'linearGauge',
    ) as UiChartFactory['linearGauge'],
    heatMap: unsupportedChartMethod('heatMap') as UiChartFactory['heatMap'],
    geoHeatMap: unsupportedChartMethod(
      'geoHeatMap',
    ) as UiChartFactory['geoHeatMap'],
    calendarHeatMap: unsupportedChartMethod(
      'calendarHeatMap',
    ) as UiChartFactory['calendarHeatMap'],
    sankey: unsupportedChartMethod('sankey') as UiChartFactory['sankey'],
    smithChart: unsupportedChartMethod(
      'smithChart',
    ) as UiChartFactory['smithChart'],
    sparkline: unsupportedChartMethod(
      'sparkline',
    ) as UiChartFactory['sparkline'],
    stockChart: unsupportedChartMethod(
      'stockChart',
    ) as UiChartFactory['stockChart'],
    treeMap: unsupportedChartMethod('treeMap') as UiChartFactory['treeMap'],
    funnel: unsupportedChartMethod('funnel') as UiChartFactory['funnel'],
    pyramid: unsupportedChartMethod('pyramid') as UiChartFactory['pyramid'],
    waterfall: unsupportedChartMethod(
      'waterfall',
    ) as UiChartFactory['waterfall'],
    boxPlot: unsupportedChartMethod('boxPlot') as UiChartFactory['boxPlot'],
    histogram: unsupportedChartMethod(
      'histogram',
    ) as UiChartFactory['histogram'],
    bubble: renderBubble,
    bullet: unsupportedChartMethod('bullet') as UiChartFactory['bullet'],
    sunburst: unsupportedChartMethod('sunburst') as UiChartFactory['sunburst'],
    comboChart: renderComboChart,
  }
}

export type { UiCircularGaugeProps }
