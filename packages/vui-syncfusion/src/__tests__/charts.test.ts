import { describe, expect, it } from 'vitest'
import { createSfChartFactory } from '../factory/charts'

const data = {
  labels: ['A', 'B'],
  datasets: [{ label: 's', data: [1, 2] }],
}

describe('createSfChartFactory', () => {
  it('maps bar to EJ2 Column series', () => {
    const factory = createSfChartFactory()
    const vnode = factory.barChart(data)
    expect(vnode.props?.series?.[0]?.type).toBe('Column')
  })

  it('maps doughnut to Accumulation Doughnut', () => {
    const factory = createSfChartFactory()
    const vnode = factory.doughnutChart(data)
    expect(vnode.props?.series?.[0]?.type).toBe('Doughnut')
  })

  it('renders circular gauge axes', () => {
    const factory = createSfChartFactory()
    const vnode = factory.circularGauge({ value: 55, min: 0, max: 100 })
    expect(vnode.props?.axes?.[0]?.pointers?.[0]?.value).toBe(55)
  })

  it('renders linear gauge axes', () => {
    const factory = createSfChartFactory()
    const vnode = factory.linearGauge({
      value: 40,
      min: 0,
      max: 100,
      orientation: 'horizontal',
    })
    expect(vnode.props?.orientation).toBe('Horizontal')
    expect(vnode.props?.axes?.[0]?.pointers?.[0]?.value).toBe(40)
  })

  it('renders heatMap and maps geoHeatMap', () => {
    const factory = createSfChartFactory()
    const heat = factory.heatMap({
      xLabels: ['A', 'B'],
      yLabels: ['r'],
      values: [[1, 2]],
    })
    expect(heat.props?.dataSource).toEqual([[1, 2]])
    expect(heat.props?.xAxis?.labels).toEqual(['A', 'B'])
    const geo = factory.geoHeatMap({
      map: { type: 'FeatureCollection', features: [] },
      points: [{ lng: 1, lat: 2, value: 3 }],
    })
    expect(geo.props?.layers?.[0]?.bubbleSettings?.[0]?.dataSource?.[0]).toEqual(
      { longitude: 1, latitude: 2, value: 3 },
    )
    const cal = factory.calendarHeatMap({
      dates: [{ date: '2026-01-01', value: 4 }],
    })
    expect(cal.props?.xAxis?.valueType).toBe('DateTime')
    expect(cal.props?.dataSource).toBeTruthy()
  })

  it('renders sankey nodes and links', () => {
    const factory = createSfChartFactory()
    const vnode = factory.sankey({
      links: [{ source: 'a', target: 'b', value: 3 }],
      nodes: [{ id: 'a', label: 'A' }, { id: 'b' }],
    })
    expect(vnode.props?.links?.[0]).toEqual({
      sourceId: 'a',
      targetId: 'b',
      value: 3,
    })
    expect(vnode.props?.nodes?.[0]).toEqual({
      id: 'a',
      label: { text: 'A' },
    })
    expect(vnode.props?.orientation).toBe('Horizontal')
  })

  it('renders smithChart series and renderType', () => {
    const factory = createSfChartFactory()
    const vnode = factory.smithChart({
      type: 'admittance',
      title: 'Line',
      series: [
        {
          name: 'S1',
          points: [{ resistance: 10, reactance: 25 }],
        },
      ],
    })
    expect(vnode.props?.renderType).toBe('Admittance')
    expect(vnode.props?.series?.[0]).toEqual({
      name: 'S1',
      points: [{ resistance: 10, reactance: 25 }],
    })
    expect(vnode.props?.title).toEqual({ visible: true, text: 'Line' })
  })

  it('renders sparkline dataSource', () => {
    const factory = createSfChartFactory()
    const vnode = factory.sparkline({
      data: [3, 5],
      type: 'area',
      fill: '#123',
    })
    expect(vnode.props?.type).toBe('Area')
    expect(vnode.props?.dataSource).toEqual([
      { x: 0, y: 3 },
      { x: 1, y: 5 },
    ])
    expect(vnode.props?.xName).toBe('x')
    expect(vnode.props?.fill).toBe('#123')
  })

  it('renders stockChart Candle series', () => {
    const factory = createSfChartFactory()
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
      periodSelector: true,
    })
    expect(vnode.props?.series?.[0]?.type).toBe('OHLC')
    expect(vnode.props?.enablePeriodSelector).toBe(true)
    expect(vnode.props?.series?.[0]?.xName).toBe('date')
  })

  it('renders treeMap layoutType and drillDown', () => {
    const factory = createSfChartFactory()
    const vnode = factory.treeMap({
      data: [
        {
          name: 'p',
          children: [
            { name: 'a', value: 2 },
            { name: 'b', value: 3 },
          ],
        },
      ],
      layout: 'sliceAndDice',
      drillDown: true,
    })
    expect(vnode.props?.layoutType).toBe('SliceAndDiceAuto')
    expect(vnode.props?.enableDrillDown).toBe(true)
    expect(vnode.props?.weightValuePath).toBe('value')
  })

  it('renders funnel Pyramid Waterfall BoxAndWhisker Histogram Bubble Bullet combo', () => {
    const factory = createSfChartFactory()
    expect(
      factory.funnel({ data: [{ name: 'a', value: 1 }] }).props?.series?.[0]
        ?.type,
    ).toBe('Funnel')
    expect(
      factory.pyramid({ data: [{ name: 'a', value: 1 }] }).props?.series?.[0]
        ?.type,
    ).toBe('Pyramid')
    expect(
      factory.waterfall({ data: [{ name: 'a', value: 1 }] }).props?.series?.[0]
        ?.type,
    ).toBe('Waterfall')
    expect(
      factory.boxPlot({
        data: [{ name: 'a', min: 1, q1: 2, median: 3, q3: 4, max: 5 }],
      }).props?.series?.[0]?.type,
    ).toBe('BoxAndWhisker')
    expect(
      factory.histogram({ values: [1, 2, 3] }).props?.series?.[0]?.type,
    ).toBe('Histogram')
    expect(
      factory.bubble({ data: [{ x: 1, y: 2, size: 3 }] }).props?.series?.[0]
        ?.type,
    ).toBe('Bubble')
    expect(factory.bullet({ value: 72, target: 80 }).props?.value).toBe(72)
    expect(
      factory.comboChart({
        labels: ['A'],
        datasets: [
          { label: 'bar', type: 'bar', data: [1] },
          { label: 'line', type: 'line', data: [2] },
        ],
      }).props?.series?.map((s: { type: string }) => s.type),
    ).toEqual(['Column', 'Line'])
  })

  it('throws not supported for sunburst', () => {
    const factory = createSfChartFactory()
    expect(() =>
      factory.sunburst({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow('not supported: sunburst')
  })
})
