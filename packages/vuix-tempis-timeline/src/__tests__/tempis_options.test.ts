import { describe, expect, it } from 'vitest'
import {
  tempisBandsForEngine,
  tempisCategoriesForEngine,
  tempisDependenciesForEngine,
  tempisItemsForEngine,
  tempisOptionsOf,
  tempisStructureOf,
  tempisTooltipNodeOf,
} from '../index'

describe('tempisOptionsOf', () => {
  it('maps every option the engine reads (24 项一个不落)', () => {
    const options = tempisOptionsOf({
      items: [
        {
          id: 1,
          title: '设计',
          start: '2026-01-05',
          end: '2026-01-15',
          grouping: 'Frontend',
          category: 'plan',
          progress: 0.4,
        },
      ],
      keyField: 'id',
      labelField: 'title',
      startField: 'start',
      endField: 'end',
      groupingField: 'grouping',
      categoryField: 'category',
      progressField: 'progress',
      rtl: true,
      responsive: false,
      verticalFill: 'fill-canvas',
      stackMode: 'compact',
      selectionMode: 'multi',
      accessibility: { ariaLabel: '计划轴', keyboard: true },
      range: {
        start: '2026-01-01',
        end: '2026-02-01',
        position: 'bottom',
        fixed: false,
        min: '2025-01-01',
        max: '2026-12-31',
        minorUnit: { formats: { day: 'DD' } },
        majorUnit: { font: { size: 12 }, formats: { month: 'MMMM' } },
        zoom: { enabled: true, min: 1000, wheelSensitivity: 2 },
      },
      legend: { position: 'bottom', isFilterOnClick: true },
      tooltip: { enabled: true, delay: 120, dateFormat: 'D MMMM' },
      scrollbar: { visibility: 'hover' },
      minimap: { height: 40 },
      grouping: { collapsible: true },
      font: { size: 13, family: 'Inter' },
      itemStyle: { borderRadius: 6 },
      gridColor: '#ddd',
      categories: [{ name: 'plan', label: '计划' }],
      bands: [{ start: '2026-01-20', end: '2026-01-25' }],
      dependencies: [{ source: 1, target: 2 }],
    })

    // 与 TempisTimelineOptions 的键一一对上（契约没有的键不该冒出来）。
    expect(Object.keys(options).sort()).toEqual(
      [
        'accessibility',
        'bands',
        'categories',
        'dependencies',
        'grouping',
        'items',
        'legend',
        'minimap',
        'range',
        'responsive',
        'rtl',
        'scrollbar',
        'selection',
        'stackMode',
        'style',
        'tooltip',
        'verticalFill',
      ].sort(),
    )
    expect(options.responsive).toBe(false)
    expect(options.selection).toBe('multi')
    expect(options.verticalFill).toBe('fill-canvas')
    expect(options.stackMode).toBe('compact')
    expect(options.style).toEqual({
      font: { size: 13, family: 'Inter' },
      item: { borderRadius: 6 },
      gridColor: '#ddd',
    })
    expect(options.range).toEqual({
      start: '2026-01-01',
      end: '2026-02-01',
      position: 'bottom',
      fixed: false,
      min: '2025-01-01',
      max: '2026-12-31',
      minorUnit: { formats: { day: 'DD' } },
      majorUnit: { font: { size: 12 }, formats: { month: 'MMMM' } },
      zoom: { enabled: true, min: 1000, wheelSensitivity: 2 },
    })
    expect(options.items).toEqual([
      {
        id: 1,
        start: '2026-01-05',
        end: '2026-01-15',
        label: '设计',
        grouping: 'Frontend',
        category: 'plan',
        progress: 0.4,
      },
    ])
  })

  it('defaults responsive to true and omits options that were not given', () => {
    const options = tempisOptionsOf({ items: [] })
    expect(options).toEqual({ responsive: true, rtl: false, items: [] })
    expect(options.range).toBeUndefined()
    expect(options.style).toBeUndefined()
  })

  it('drops rows without start/time and translates key → id', () => {
    const items = tempisItemsForEngine({
      items: [
        { key: 'a', start: '2026-01-05' },
        { key: 7, time: '2026-01-06' },
        { key: 'c' },
      ],
    })
    expect(items).toEqual([
      // 没给 label 的行由 core 兜底成序号文案（引擎那边也要有东西可画）。
      { id: 'a', start: '2026-01-05', label: '1' },
      { id: 7, start: '2026-01-06', label: '2' },
    ])
  })

  it('maps axis level data and does not invent empty collections', () => {
    expect(tempisCategoriesForEngine({ items: [] })).toEqual([])
    expect(tempisBandsForEngine({ items: [] })).toEqual([])
    expect(tempisDependenciesForEngine({ items: [] })).toEqual([])
    expect(
      tempisCategoriesForEngine({
        items: [],
        categories: [{ name: 'plan', label: '计划', style: { padding: 4 } }],
      }),
    ).toEqual([{ name: 'plan', label: '计划', style: { padding: 4 } }])
    expect(
      tempisBandsForEngine({ items: [], bands: [{ start: 1, end: 2 }] }),
    ).toEqual([{ start: 1, end: 2 }])
    expect(
      tempisDependenciesForEngine({ items: [], dependencies: [{ source: 1, target: 2 }] }),
    ).toEqual([{ source: 1, target: 2 }])
  })

  it('keeps bands without end as a deadline line', () => {
    expect(tempisBandsForEngine({ items: [], bands: [{ start: '2026-02-01' }] })).toEqual([
      { start: '2026-02-01' },
    ])
  })

  it('translates the tooltip template: string 直传、节点走渲染委托', () => {
    const node = { __vnode: true }
    const rendered = document.createElement('div')
    const options = tempisOptionsOf(
      {
        items: [],
        tooltip: {
          template: (id) => (id === 1 ? '<b>raw</b>' : node),
          shouldShow: (id) => id !== 2,
        },
      },
      { renderNode: (value) => (value === node ? rendered : null) },
    )
    expect(options.tooltip?.template?.(1)).toBe('<b>raw</b>')
    expect(options.tooltip?.template?.(2)).toBe(rendered)
    expect(options.tooltip?.shouldShow?.(1)).toBe(true)
    expect(options.tooltip?.shouldShow?.(2)).toBe(false)
  })

  it('returns null for node tooltips when there is no renderer (engine falls back)', () => {
    expect(tempisTooltipNodeOf(undefined)).toBeNull()
    expect(tempisTooltipNodeOf({ __vnode: true })).toBeNull()
    const options = tempisOptionsOf({ items: [], tooltip: { template: () => ({}) } })
    expect(options.tooltip?.template?.(1)).toBeNull()
  })
})

describe('tempisStructureOf', () => {
  it('tracks construction time options only (数据不进签名)', () => {
    const base = { items: [{ start: '2026-01-05' }] }
    const before = tempisStructureOf(base)
    const withMoreItems = tempisStructureOf({
      items: [{ start: '2026-01-05' }, { start: '2026-01-06' }],
    })
    expect(withMoreItems).toEqual(before)

    const withLegend = tempisStructureOf({ ...base, legend: { position: 'top' } })
    expect(withLegend).not.toEqual(before)
    expect(withLegend.legend).toEqual({ position: 'top' })
  })

  it('ignores callback identities but keeps tooltip scalars', () => {
    const first = tempisStructureOf({
      items: [],
      onItemClick: () => undefined,
      tooltip: { enabled: true, template: () => '<b/>' },
    })
    const second = tempisStructureOf({
      items: [],
      onItemClick: () => undefined,
      tooltip: { enabled: false, template: () => '<i/>' },
    })
    expect(first.tooltip).toEqual({
      enabled: true,
      delay: null,
      dateFormat: null,
      overflowBehavior: null,
    })
    expect(second.tooltip).toMatchObject({ enabled: false })
  })
})
