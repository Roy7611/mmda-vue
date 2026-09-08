import { describe, expect, it } from 'vitest'
import { createAgChartFactory } from '../factory/charts'

const data = {
  labels: ['A', 'B'],
  datasets: [{ label: 's', data: [1, 2] }],
}

describe('createAgChartFactory', () => {
  it('maps bar to AG bar series', () => {
    const factory = createAgChartFactory()
    const vnode = factory.barChart(data)
    expect(vnode.props?.options?.series?.[0]?.type).toBe('bar')
    expect(vnode.props?.options?.data).toHaveLength(2)
  })

  it('maps doughnut to donut', () => {
    const factory = createAgChartFactory()
    const vnode = factory.doughnutChart(data)
    expect(vnode.props?.options?.series?.[0]?.type).toBe('donut')
  })

  it('renders AgGauge radial-gauge', () => {
    const factory = createAgChartFactory()
    const vnode = factory.circularGauge({ value: 70, min: 0, max: 100 })
    expect(vnode.props?.options?.type).toBe('radial-gauge')
    expect(vnode.props?.options?.value).toBe(70)
  })

  it('renders AgGauge linear-gauge', () => {
    const factory = createAgChartFactory()
    const vnode = factory.linearGauge({
      value: 40,
      min: 0,
      max: 100,
      orientation: 'horizontal',
    })
    expect(vnode.props?.options?.type).toBe('linear-gauge')
    expect(vnode.props?.options?.direction).toBe('horizontal')
    expect(vnode.props?.options?.value).toBe(40)
  })

  it('renders heatmap and map series', () => {
    const factory = createAgChartFactory()
    const heat = factory.heatMap({
      xLabels: ['A', 'B'],
      yLabels: ['r'],
      values: [[1, 2]],
    })
    expect(heat.props?.options?.series?.[0]?.type).toBe('heatmap')
    expect(heat.props?.options?.data).toHaveLength(2)
    const geo = factory.geoHeatMap({
      map: { type: 'FeatureCollection', features: [] },
      regions: [{ regionId: 'CN', value: 9 }],
      points: [{ lng: 1, lat: 2, value: 3 }],
    })
    expect(geo.props?.options?.series?.[0]?.type).toBe('map-shape')
    expect(geo.props?.options?.series?.[1]?.type).toBe('map-marker')
  })

  it('throws not supported for calendarHeatMap', () => {
    const factory = createAgChartFactory()
    expect(() => factory.calendarHeatMap({ dates: [] })).toThrow(
      'not supported: calendarHeatMap',
    )
  })

  it('renders sankey series', () => {
    const factory = createAgChartFactory()
    const vnode = factory.sankey({
      links: [{ source: 'a', target: 'b', value: 3 }],
    })
    expect(vnode.props?.options?.series?.[0]?.type).toBe('sankey')
    expect(vnode.props?.options?.data?.[0]).toEqual({
      from: 'a',
      to: 'b',
      size: 3,
    })
  })

  it('throws not supported for smithChart', () => {
    const factory = createAgChartFactory()
    expect(() =>
      factory.smithChart({
        series: [{ points: [{ resistance: 1, reactance: 0 }] }],
      }),
    ).toThrow('not supported: smithChart')
  })

  it('renders sparkline line series', () => {
    const factory = createAgChartFactory()
    const vnode = factory.sparkline({ data: [3, 5], type: 'column' })
    expect(vnode.props?.options?.type).toBe('bar')
    expect(vnode.props?.options?.data).toEqual([
      { x: 0, y: 3 },
      { x: 1, y: 5 },
    ])
  })

  it('throws not supported for sparkline winLoss', () => {
    const factory = createAgChartFactory()
    expect(() => factory.sparkline({ data: [1, -1], type: 'winLoss' })).toThrow(
      'not supported: sparkline',
    )
  })

  it('renders stockChart candlestick or financial options', () => {
    const factory = createAgChartFactory()
    const vnode = factory.stockChart({
      data: [
        {
          date: '2026-01-02',
          open: 10,
          high: 12,
          low: 9,
          close: 11,
        },
      ],
      type: 'candle',
    })
    const seriesType = vnode.props?.options?.series?.[0]?.type
    if (seriesType) {
      expect(seriesType).toBe('candlestick')
    } else {
      expect(vnode.props?.options?.chartType).toBe('candlestick')
      expect(vnode.props?.options?.dateKey).toBe('date')
    }
  })

  it('renders treeMap series', () => {
    const factory = createAgChartFactory()
    const vnode = factory.treeMap({
      data: [{ name: 'a', value: 2 }],
    })
    expect(vnode.props?.options?.series?.[0]?.type).toBe('treemap')
  })

  it('renders funnel pyramid waterfall box-plot histogram bubble sunburst combo', () => {
    const factory = createAgChartFactory()
    expect(
      factory.funnel({ data: [{ name: 'a', value: 1 }] }).props?.options
        ?.series?.[0]?.type,
    ).toBe('funnel')
    expect(
      factory.pyramid({ data: [{ name: 'a', value: 1 }] }).props?.options
        ?.series?.[0]?.type,
    ).toBe('pyramid')
    expect(
      factory.waterfall({ data: [{ name: 'a', value: 1 }] }).props?.options
        ?.series?.[0]?.type,
    ).toBe('waterfall')
    expect(
      factory.boxPlot({
        data: [{ name: 'a', min: 1, q1: 2, median: 3, q3: 4, max: 5 }],
      }).props?.options?.series?.[0]?.type,
    ).toBe('box-plot')
    expect(
      factory.histogram({ values: [1, 2, 3] }).props?.options?.series?.[0]
        ?.type,
    ).toBe('histogram')
    expect(
      factory.bubble({ data: [{ x: 1, y: 2, size: 3 }] }).props?.options
        ?.series?.[0]?.type,
    ).toBe('bubble')
    expect(
      factory.sunburst({ data: [{ name: 'a', value: 1 }] }).props?.options
        ?.series?.[0]?.type,
    ).toBe('sunburst')
    expect(
      factory.comboChart({
        labels: ['A'],
        datasets: [
          { label: 'bar', type: 'bar', data: [1] },
          { label: 'line', type: 'line', data: [2] },
        ],
      }).props?.options?.series?.map((s: { type: string }) => s.type),
    ).toEqual(['bar', 'line'])
  })

  it('throws not supported for bullet', () => {
    const factory = createAgChartFactory()
    expect(() => factory.bullet({ value: 1, target: 2 })).toThrow(
      'not supported: bullet',
    )
  })
})
