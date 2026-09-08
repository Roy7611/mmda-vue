import { describe, expect, it } from 'vitest'
import { createEchartsFactory, echartsGaugeOptionOf, echartsOptionOf } from '../index'

const data = {
  labels: ['Q1', 'Q2'],
  datasets: [{ label: '产量', data: [10, 20] }],
}

describe('createEchartsFactory', () => {
  it('maps bar and gauge to echarts options', () => {
    expect(echartsOptionOf(data, { type: 'bar' }).series).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'bar' })]),
    )
    expect(echartsOptionOf(data, { type: 'area' }).series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'line', areaStyle: {} }),
      ]),
    )
    expect(echartsOptionOf(data, { type: 'doughnut' }).series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'pie', radius: ['45%', '70%'] }),
      ]),
    )
    expect(echartsGaugeOptionOf({ value: 80, min: 0, max: 100 }).series).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'gauge' })]),
    )
  })

  it('returns chart and gauge hosts', () => {
    const factory = createEchartsFactory()
    const bar = factory.barChart(data)
    expect(bar.type).toBeTruthy()
    expect(bar.props?.option?.series?.[0]?.type).toBe('bar')
    const gauge = factory.circularGauge({ value: 40, label: 'OEE' })
    expect(gauge.props?.kind).toBe('circular-gauge')
    expect(gauge.props?.option?.series?.[0]?.type).toBe('gauge')
    expect(() => factory.linearGauge({ value: 40 })).toThrow(
      'not supported: linearGauge',
    )
  })

  it('maps heatMap geo and calendar', () => {
    const factory = createEchartsFactory()
    const heat = factory.heatMap({
      xLabels: ['A', 'B'],
      yLabels: ['r'],
      values: [[1, 2]],
    })
    expect(heat.props?.kind).toBe('heat-map')
    expect(heat.props?.option?.series?.[0]?.type).toBe('heatmap')
    const geo = factory.geoHeatMap({
      map: { type: 'FeatureCollection', features: [] },
      points: [{ lng: 1, lat: 2, value: 3 }],
    })
    expect(geo.props?.kind).toBe('geo-heat-map')
    expect(geo.props?.option?.geo?.map).toBe('mmda-geo')
    expect(geo.props?.option?.series?.[0]?.coordinateSystem).toBe('geo')
    const cal = factory.calendarHeatMap({
      dates: [{ date: '2026-01-01', value: 4 }],
    })
    expect(cal.props?.kind).toBe('calendar-heat-map')
    expect(cal.props?.option?.series?.[0]?.coordinateSystem).toBe('calendar')
  })

  it('maps sankey', () => {
    const factory = createEchartsFactory()
    const vnode = factory.sankey({
      links: [{ source: 'a', target: 'b', value: 3 }],
      orientation: 'vertical',
    })
    expect(vnode.props?.kind).toBe('sankey')
    expect(vnode.props?.option?.series?.[0]?.type).toBe('sankey')
    expect(vnode.props?.option?.series?.[0]?.orient).toBe('vertical')
    expect(vnode.props?.option?.series?.[0]?.links?.[0]).toEqual({
      source: 'a',
      target: 'b',
      value: 3,
    })
  })

  it('throws not supported for smithChart', () => {
    const factory = createEchartsFactory()
    expect(() =>
      factory.smithChart({
        series: [{ points: [{ resistance: 1, reactance: 0 }] }],
      }),
    ).toThrow('not supported: smithChart')
  })

  it('throws not supported for sparkline', () => {
    const factory = createEchartsFactory()
    expect(() => factory.sparkline({ data: [1, 2] })).toThrow(
      'not supported: sparkline',
    )
  })

  it('renders stockChart candlestick series', () => {
    const factory = createEchartsFactory()
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
      type: 'ohlc',
    })
    expect(vnode.props?.kind).toBe('stock-chart')
    expect(vnode.props?.option?.series?.[0]?.type).toBe('candlestick')
  })

  it('renders treeMap series', () => {
    const factory = createEchartsFactory()
    const vnode = factory.treeMap({
      data: [{ name: 'a', value: 2 }],
    })
    expect(vnode.props?.kind).toBe('tree-map')
    expect(vnode.props?.option?.series?.[0]?.type).toBe('treemap')
  })

  it('renders funnel boxplot bubble sunburst combo', () => {
    const factory = createEchartsFactory()
    expect(
      factory.funnel({ data: [{ name: 'a', value: 1 }] }).props?.option
        ?.series?.[0]?.type,
    ).toBe('funnel')
    expect(
      factory.boxPlot({
        data: [{ name: 'a', min: 1, q1: 2, median: 3, q3: 4, max: 5 }],
      }).props?.option?.series?.[0]?.type,
    ).toBe('boxplot')
    expect(
      factory.bubble({ data: [{ x: 1, y: 2, size: 3 }] }).props?.option
        ?.series?.[0]?.type,
    ).toBe('scatter')
    expect(
      factory.sunburst({ data: [{ name: 'a', value: 1 }] }).props?.option
        ?.series?.[0]?.type,
    ).toBe('sunburst')
    expect(
      factory.comboChart({
        labels: ['A'],
        datasets: [
          { label: 'bar', type: 'bar', data: [1] },
          { label: 'line', type: 'line', data: [2] },
        ],
      }).props?.option?.series?.map((s: { type: string }) => s.type),
    ).toEqual(['bar', 'line'])
  })

  it('throws not supported for pyramid waterfall histogram bullet', () => {
    const factory = createEchartsFactory()
    expect(() =>
      factory.pyramid({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow('not supported: pyramid')
    expect(() =>
      factory.waterfall({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow('not supported: waterfall')
    expect(() => factory.histogram({ values: [1, 2] })).toThrow(
      'not supported: histogram',
    )
    expect(() => factory.bullet({ value: 1, target: 2 })).toThrow(
      'not supported: bullet',
    )
  })
})
