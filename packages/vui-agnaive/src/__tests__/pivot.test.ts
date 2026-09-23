import { describe, expect, it } from 'vitest'
import { AgNaiveVuiBuilder } from '../agnaive_builder'
import {
  createAgPivotPlugin,
  toAgPivotColumnDefs,
} from '../plugins/pivot_table'

describe('createAgPivotPlugin', () => {
  it('maps AG axes onto pivotMode column defs', () => {
    const defs = toAgPivotColumnDefs({
      data: [{ country: 'CN', year: 2026, amount: 10, extra: 'x' }],
      rows: [{ name: 'country' }],
      columns: [{ name: 'year' }],
      values: [{ name: 'amount', aggregate: 'sum' }],
    })
    const byField = Object.fromEntries(defs.map((col) => [col.field, col]))
    expect(byField.country?.rowGroup).toBe(true)
    expect(byField.year?.pivot).toBe(true)
    expect(byField.amount?.aggFunc).toBe('sum')
    expect(byField.extra?.enablePivot).toBe(true)
  })

  it('renders AgGridVue with pivotMode', () => {
    const plugin = createAgPivotPlugin()
    const vnode = plugin.buildUi({} as any, {
      rows: [{ name: 'country' }],
      values: [{ name: 'amount', aggregate: 'sum' }],
    } as any)
    expect(vnode.props?.pivotMode).toBe(true)
    expect(vnode.props?.columnDefs?.find((col: any) => col.field === 'amount')?.aggFunc).toBe(
      'sum',
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-pivot')
  })

  it('skin builder installs pivot-table by default', () => {
    const builder = new AgNaiveVuiBuilder()
    expect(builder.hasPlugin('pivot-table')).toBe(true)
    const vnode = builder.plugin('pivot-table')!.buildUi({} as any, {
      values: [{ name: 'amount', aggregate: 'sum' }],
    } as any)
    expect(vnode.props?.pivotMode).toBe(true)
  })
})
