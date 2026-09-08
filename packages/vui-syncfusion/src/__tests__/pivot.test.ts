import { describe, expect, it } from 'vitest'
import { PIVOT_PLUGIN_NOT_INSTALLED } from '@mmda/vui'
import { SyncfusionUiBuilder } from '../syncfusion_builder'
import {
  createSfPivotPlugin,
  toEj2DataSourceSettings,
} from '../factory/pivot_table'

describe('createSfPivotPlugin', () => {
  it('maps AG axes onto EJ2 dataSourceSettings', () => {
    const settings = toEj2DataSourceSettings({
      data: [{ country: 'CN', year: 2026, amount: 10 }],
      rows: [{ name: 'country', caption: 'Country' }],
      columns: [{ name: 'year' }],
      values: [{ name: 'amount', aggregate: 'sum' }],
      expandAll: true,
    })
    expect(settings.expandAll).toBe(true)
    expect(settings.rows).toEqual([{ name: 'country', caption: 'Country' }])
    expect(settings.columns).toEqual([{ name: 'year' }])
    expect(settings.values).toEqual([{ name: 'amount', type: 'Sum' }])
    expect(settings.dataSource).toHaveLength(1)
  })

  it('renders PivotView host with mapped settings', () => {
    const plugin = createSfPivotPlugin()
    const vnode = plugin.pivotTable({
      rows: [{ name: 'country' }],
      values: [{ name: 'amount', aggregate: 'sum' }],
    })
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Pivot/i)
    expect(vnode.props?.dataSourceSettings?.values?.[0]?.type).toBe('Sum')
    expect(String(vnode.props?.cssClass ?? '')).toContain('mmda-pivot')
  })

  it('throws until setPivotPlugin on the skin builder', () => {
    const builder = new SyncfusionUiBuilder()
    expect(() => builder.buildPivotTable({ data: [] })).toThrow(
      PIVOT_PLUGIN_NOT_INSTALLED,
    )
    builder.setPivotPlugin(createSfPivotPlugin())
    const vnode = builder.buildPivotTable({
      values: [{ name: 'amount', aggregate: 'sum' }],
    })
    expect(vnode.props?.dataSourceSettings?.values?.[0]?.type).toBe('Sum')
  })
})
