import { describe, expect, it } from 'vitest'
import { chartNotSupportedMessage } from '@mmda/vui'
import { createPrimeChartFactory } from '../factory/charts'

const data = {
  labels: ['A', 'B'],
  datasets: [{ label: 's', data: [1, 2] }],
}

describe('createPrimeChartFactory', () => {
  it('renders Chart.js bar', () => {
    const factory = createPrimeChartFactory()
    const vnode = factory.barChart(data)
    expect(vnode.props?.type).toBe('bar')
    expect(vnode.props?.data).toEqual(data)
  })

  it('fills area as line', () => {
    const factory = createPrimeChartFactory()
    const vnode = factory.areaChart(data)
    expect(vnode.props?.type).toBe('line')
    expect(vnode.props?.data.datasets[0].fill).toBe(true)
  })

  it('throws not supported for gauge and heat maps', () => {
    const factory = createPrimeChartFactory()
    expect(() => factory.circularGauge({ value: 10 })).toThrow(
      chartNotSupportedMessage('circularGauge'),
    )
    expect(() => factory.linearGauge({ value: 10 })).toThrow(
      chartNotSupportedMessage('linearGauge'),
    )
    expect(() =>
      factory.heatMap({ xLabels: ['A'], yLabels: ['B'], values: [[1]] }),
    ).toThrow(chartNotSupportedMessage('heatMap'))
    expect(() => factory.geoHeatMap({})).toThrow(
      chartNotSupportedMessage('geoHeatMap'),
    )
    expect(() => factory.calendarHeatMap({ dates: [] })).toThrow(
      chartNotSupportedMessage('calendarHeatMap'),
    )
    expect(() =>
      factory.sankey({ links: [{ source: 'a', target: 'b', value: 1 }] }),
    ).toThrow(chartNotSupportedMessage('sankey'))
    expect(() =>
      factory.smithChart({
        series: [{ points: [{ resistance: 1, reactance: 0 }] }],
      }),
    ).toThrow(chartNotSupportedMessage('smithChart'))
    expect(() => factory.sparkline({ data: [1, 2] })).toThrow(
      chartNotSupportedMessage('sparkline'),
    )
    expect(() =>
      factory.stockChart({
        data: [{ date: '2026-01-01', open: 1, high: 2, low: 1, close: 2 }],
      }),
    ).toThrow(chartNotSupportedMessage('stockChart'))
    expect(() =>
      factory.treeMap({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(chartNotSupportedMessage('treeMap'))
    expect(() =>
      factory.funnel({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(chartNotSupportedMessage('funnel'))
    expect(() =>
      factory.pyramid({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(chartNotSupportedMessage('pyramid'))
    expect(() =>
      factory.waterfall({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(chartNotSupportedMessage('waterfall'))
    expect(() =>
      factory.boxPlot({
        data: [{ name: 'a', min: 1, q1: 2, median: 3, q3: 4, max: 5 }],
      }),
    ).toThrow(chartNotSupportedMessage('boxPlot'))
    expect(() => factory.histogram({ values: [1] })).toThrow(
      chartNotSupportedMessage('histogram'),
    )
    expect(() => factory.bullet({ value: 1, target: 2 })).toThrow(
      chartNotSupportedMessage('bullet'),
    )
    expect(() =>
      factory.sunburst({ data: [{ name: 'a', value: 1 }] }),
    ).toThrow(chartNotSupportedMessage('sunburst'))
  })

  it('renders bubble and comboChart', () => {
    const factory = createPrimeChartFactory()
    expect(
      factory.bubble({ data: [{ x: 1, y: 2, size: 8 }] }).props?.type,
    ).toBe('bubble')
    const combo = factory.comboChart({
      labels: ['A'],
      datasets: [
        { label: 'bar', type: 'bar', data: [1] },
        { label: 'line', type: 'line', data: [2] },
      ],
    })
    expect(combo.props?.data.datasets[1].type).toBe('line')
  })
})
