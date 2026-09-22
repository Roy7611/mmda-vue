import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  CHARTS_PLUGIN_NOT_INSTALLED,
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
  UiPluginName,
  type UiChartData,
  type UiChartFactory,
} from '@mmda/core'
import { chartAsPlugin } from '../ui/plugins/chart'
import { TestUiBuilder } from './test_builder'

const sample: UiChartData = {
  labels: ['A', 'B'],
  datasets: [{ label: 's', data: [1, 2] }],
}

const stubFactory = (): UiChartFactory => {
  const chart = () => h('div', { class: 'mmda-chart', 'data-type': 'bar' })
  return {
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
}

describe('UiChartFactory', () => {
  it('throws chart plugin not installed until use()', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.requirePlugin(UiPluginName.chart)).toThrow(
      CHARTS_PLUGIN_NOT_INSTALLED,
    )
    expect(() => unimplementedChartFactory().barChart(sample)).toThrow(
      CHARTS_PLUGIN_NOT_INSTALLED,
    )
    expect(() => unimplementedChartFactory().circularGauge({ value: 1 })).toThrow(
      CHARTS_PLUGIN_NOT_INSTALLED,
    )
  })

  it('uses plugin().buildUi after chartAsPlugin', () => {
    const ui = new TestUiBuilder()
    ui.use(chartAsPlugin(stubFactory()))
    const build = (kind: string, extra: Record<string, unknown> = {}) =>
      ui.plugin(UiPluginName.chart)!.buildUi({} as any, {
        chartKind: kind,
        data: sample,
        ...extra,
      } as any)
    expect(build('bar').props?.['data-type']).toBe('bar')
    expect(build('circularGauge', { value: 10 }).props?.class).toBe(
      'mmda-circular-gauge',
    )
    expect(build('linearGauge', { value: 10 }).props?.class).toBe(
      'mmda-linear-gauge',
    )
    expect(
      build('heatMap', {
        xLabels: ['A'],
        yLabels: ['B'],
        values: [[1]],
      }).props?.class,
    ).toBe('mmda-heat-map')
    expect(
      build('sankey', {
        links: [{ source: 'a', target: 'b', value: 1 }],
      }).props?.class,
    ).toBe('mmda-sankey')
    expect(
      build('smithChart', {
        series: [{ points: [{ resistance: 1, reactance: 0 }] }],
      }).props?.class,
    ).toBe('mmda-smith-chart')
    expect(build('sparkline', { data: [1, 2] }).props?.class).toBe(
      'mmda-sparkline',
    )
    expect(
      build('stockChart', {
        data: [{ date: '2026-01-01', open: 1, high: 2, low: 1, close: 2 }],
      }).props?.class,
    ).toBe('mmda-stock-chart')
    expect(build('treeMap', { data: [{ name: 'a', value: 1 }] }).props?.class).toBe(
      'mmda-tree-map',
    )
    expect(build('funnel', { data: [{ name: 'a', value: 1 }] }).props?.class).toBe(
      'mmda-funnel',
    )
    expect(
      build('pyramid', { data: [{ name: 'a', value: 1 }] }).props?.class,
    ).toBe('mmda-pyramid')
    expect(
      build('waterfall', { data: [{ name: 'a', value: 1 }] }).props?.class,
    ).toBe('mmda-waterfall')
    expect(build('comboChart').props?.class).toBe('mmda-combo-chart')
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
