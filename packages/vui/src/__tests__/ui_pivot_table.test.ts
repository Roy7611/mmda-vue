import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  PIVOT_PLUGIN_NOT_INSTALLED,
  ej2PivotTypeOf,
  pivotAggregateOf,
  pivotHookClass,
  unimplementedPivotPlugin,
  type UiPivotPlugin,
} from '../ui/factory/pivot_table'
import { createStubUiBuilder } from '../ui/builder/builder'
import { TestUiBuilder } from './test_builder'

describe('ui pivot table contract', () => {
  it('maps AG aggregates onto EJ2 Pascal types', () => {
    expect(pivotAggregateOf(undefined)).toBe('sum')
    expect(ej2PivotTypeOf('sum')).toBe('Sum')
    expect(ej2PivotTypeOf('distinctCount')).toBe('DistinctCount')
    expect(ej2PivotTypeOf('avg')).toBe('Avg')
  })

  it('throws until setPivotPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.pivotPlugin.pivotTable({})).toThrow(
      PIVOT_PLUGIN_NOT_INSTALLED,
    )
    expect(() => ui.buildPivotTable({ data: [] })).toThrow(
      PIVOT_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedPivotPlugin().pivotTable).toBeTypeOf('function')
  })

  it('uses the plugin after setPivotPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPivotPlugin = {
      pivotTable: (props) =>
        h('div', {
          class: 'mmda-pivot',
          'data-rows': props.rows?.length ?? 0,
        }),
    }
    ui.setPivotPlugin(plugin)
    const node = ui.buildPivotTable({
      rows: [{ name: 'country' }],
      values: [{ name: 'amount', aggregate: 'sum' }],
    })
    expect(node.props?.['data-rows']).toBe(1)
  })

  it('stub builder throws until a plugin is set', () => {
    const stub = createStubUiBuilder()
    expect(() => stub.buildPivotTable({})).toThrow(PIVOT_PLUGIN_NOT_INSTALLED)
    stub.setPivotPlugin({
      pivotTable: () => h('div', { class: 'mmda-pivot' }),
    })
    expect(stub.buildPivotTable({}).props?.class).toBe('mmda-pivot')
    expect(pivotHookClass(undefined)).toEqual(['mmda-pivot', undefined])
  })
})
