import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  CHART_PLUGIN_NOT_INSTALLED,
  chartNotSupportedMessage,
  chartShortcuts,
  sankeyLabelOf,
  sankeyNodesOf,
  sparklinePointsOf,
  stockChartKeysOf,
  treeMapLabelOf,
  treeMapWeightedOf,
  unimplementedChartFactory,
  unsupportedChartMethod,
  type UiChartData,
  type UiChartFactory,
} from '../ui/factory/chart'
import { TestUiBuilder } from './test_builder'

const sample: UiChartData = {
  labels: ['A', 'B'],
  datasets: [{ label: 's', data: [1, 2] }],
}

describe('UiChartFactory', () => {
  it('throws chart plugin not installed until setChartFactory', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.chartFactory.barChart(sample)).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() => ui.chartFactory.circularGauge({ value: 1 })).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() => ui.chartFactory.linearGauge({ value: 1 })).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() =>
      ui.chartFactory.heatMap({
        xLabels: ['A'],
        yLabels: ['B'],
        values: [[1]],
      }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() => ui.chartFactory.geoHeatMap({})).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() => ui.chartFactory.calendarHeatMap({ dates: [] })).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() =>
      ui.chartFactory.sankey({
        links: [{ source: 'a', target: 'b', value: 1 }],
      }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() =>
      ui.chartFactory.smithChart({
        series: [{ points: [{ resistance: 1, reactance: 0 }] }],
      }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() => ui.chartFactory.sparkline({ data: [1, 2] })).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() =>
      ui.chartFactory.stockChart({
        data: [{ date: '2026-01-01', open: 1, high: 2, low: 1, close: 2 }],
      }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() =>
      ui.chartFactory.treeMap({
        data: [{ name: 'a', value: 1 }],
      }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() =>
      ui.chartFactory.funnel({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() =>
      ui.chartFactory.pyramid({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() =>
      ui.chartFactory.waterfall({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() =>
      ui.chartFactory.boxPlot({
        data: [{ name: 'a', min: 1, q1: 2, median: 3, q3: 4, max: 5 }],
      }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() => ui.chartFactory.histogram({ values: [1, 2] })).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() =>
      ui.chartFactory.bubble({ data: [{ x: 1, y: 2, size: 3 }] }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() => ui.chartFactory.bullet({ value: 1, target: 2 })).toThrow(
      CHART_PLUGIN_NOT_INSTALLED,
    )
    expect(() =>
      ui.chartFactory.sunburst({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
    expect(() =>
      ui.chartFactory.comboChart(sample),
    ).toThrow(CHART_PLUGIN_NOT_INSTALLED)
  })

  it('uses the plugin after setChartFactory', () => {
    const ui = new TestUiBuilder()
    const chart = () => h('div', { class: 'mmda-chart', 'data-type': 'bar' })
    const plugin: UiChartFactory = {
      chart,
      ...chartShortcuts(chart),
      circularGauge: () => h('div', { class: 'mmda-circular-gauge' }),
      linearGauge: () => h('div', { class: 'mmda-linear-gauge' }),
      heatMap: () => h('div', { class: 'mmda-heat-map' }),
      geoHeatMap: () => h('div', { class: 'mmda-geo-heat-map' }),
      calendarHeatMap: () => h('div', { class: 'mmda-calendar-heat-map' }),
      sankey: () => h('div', { class: 'mmda-sankey' }),
      smithChart: () => h('div', { class: 'mmda-smith-chart' }),
      sparkline: () => h('div', { class: 'mmda-sparkline' }),
      stockChart: () => h('div', { class: 'mmda-stock-chart' }),
      treeMap: () => h('div', { class: 'mmda-tree-map' }),
      funnel: () => h('div', { class: 'mmda-funnel' }),
      pyramid: () => h('div', { class: 'mmda-pyramid' }),
      waterfall: () => h('div', { class: 'mmda-waterfall' }),
      boxPlot: () => h('div', { class: 'mmda-box-plot' }),
      histogram: () => h('div', { class: 'mmda-histogram' }),
      bubble: () => h('div', { class: 'mmda-bubble' }),
      bullet: () => h('div', { class: 'mmda-bullet' }),
      sunburst: () => h('div', { class: 'mmda-sunburst' }),
      comboChart: () => h('div', { class: 'mmda-combo-chart' }),
    }
    ui.setChartFactory(plugin)
    expect(ui.chartFactory.barChart(sample).props?.['data-type']).toBe('bar')
    expect(ui.chartFactory.circularGauge({ value: 10 }).props?.class).toBe(
      'mmda-circular-gauge',
    )
    expect(ui.chartFactory.linearGauge({ value: 10 }).props?.class).toBe(
      'mmda-linear-gauge',
    )
    expect(
      ui.chartFactory.heatMap({
        xLabels: ['A'],
        yLabels: ['B'],
        values: [[1]],
      }).props?.class,
    ).toBe('mmda-heat-map')
    expect(
      ui.chartFactory.sankey({
        links: [{ source: 'a', target: 'b', value: 1 }],
      }).props?.class,
    ).toBe('mmda-sankey')
    expect(
      ui.chartFactory.smithChart({
        series: [{ points: [{ resistance: 1, reactance: 0 }] }],
      }).props?.class,
    ).toBe('mmda-smith-chart')
    expect(ui.chartFactory.sparkline({ data: [1, 2] }).props?.class).toBe(
      'mmda-sparkline',
    )
    expect(
      ui.chartFactory.stockChart({
        data: [{ date: '2026-01-01', open: 1, high: 2, low: 1, close: 2 }],
      }).props?.class,
    ).toBe('mmda-stock-chart')
    expect(
      ui.chartFactory.treeMap({ data: [{ name: 'a', value: 1 }] }).props?.class,
    ).toBe('mmda-tree-map')
    expect(
      ui.chartFactory.funnel({ data: [{ name: 'a', value: 1 }] }).props?.class,
    ).toBe('mmda-funnel')
    expect(
      ui.chartFactory.pyramid({ data: [{ name: 'a', value: 1 }] }).props?.class,
    ).toBe('mmda-pyramid')
    expect(
      ui.chartFactory.waterfall({ data: [{ name: 'a', value: 1 }] }).props
        ?.class,
    ).toBe('mmda-waterfall')
    expect(ui.chartFactory.comboChart(sample).props?.class).toBe(
      'mmda-combo-chart',
    )
  })

  it('unsupportedChartMethod throws not supported', () => {
    const gauge = unsupportedChartMethod('circularGauge')
    expect(() => gauge()).toThrow(chartNotSupportedMessage('circularGauge'))
    expect(unimplementedChartFactory().chart).toBeTypeOf('function')
  })

  it('infers sankey nodes and resolves labelOf', () => {
    const nodes = sankeyNodesOf({
      links: [
        { source: 'a', target: 'b', value: 1 },
        { source: 'b', target: 'c', value: 2 },
      ],
    })
    expect(nodes.map((n) => n.id)).toEqual(['a', 'b', 'c'])
    expect(sankeyLabelOf({ id: 'a', label: 'A' })).toBe('A')
    expect(sankeyLabelOf({ id: 'a', label: 'shown' }, (n) => n.id)).toBe('a')
  })

  it('normalizes sparkline number data to points', () => {
    expect(sparklinePointsOf([3, 5])).toEqual([
      { x: 0, y: 3 },
      { x: 1, y: 5 },
    ])
    expect(sparklinePointsOf([{ y: 9 }])).toEqual([{ x: 0, y: 9 }])
  })

  it('defaults stock chart field names', () => {
    expect(stockChartKeysOf({})).toEqual({
      xName: 'date',
      open: 'open',
      high: 'high',
      low: 'low',
      close: 'close',
      volume: 'volume',
    })
  })

  it('resolves treeMap labels and parent weights', () => {
    expect(treeMapLabelOf({ name: 'a' })).toBe('a')
    expect(treeMapLabelOf({ name: 'a' }, (n) => n.name.toUpperCase())).toBe(
      'A',
    )
    expect(
      treeMapWeightedOf([
        {
          name: 'p',
          children: [
            { name: 'c1', value: 2 },
            { name: 'c2', value: 3 },
          ],
        },
      ]),
    ).toEqual([
      {
        name: 'p',
        value: 5,
        children: [
          { name: 'c1', value: 2 },
          { name: 'c2', value: 3 },
        ],
      },
    ])
  })
})
