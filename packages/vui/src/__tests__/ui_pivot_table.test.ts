import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  PIVOT_TABLE_PLUGIN_NOT_INSTALLED,
  ej2PivotTypeOf,
  pivotAggregateOf,
  pivotHookClass,
  unimplementedPivotPlugin,
  UiPluginName,
  type UiPlugin,
} from '@mmda/core'
import { createStubUiBuilder } from '../ui/builder'
import { TestUiBuilder } from './test_builder'

describe('ui pivot table contract', () => {
  it('maps AG aggregates onto EJ2 Pascal types', () => {
    expect(pivotAggregateOf(undefined)).toBe('sum')
    expect(ej2PivotTypeOf('sum')).toBe('Sum')
    expect(ej2PivotTypeOf('distinctCount')).toBe('DistinctCount')
    expect(ej2PivotTypeOf('avg')).toBe('Avg')
  })

  it('throws until pivot-table plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.requirePlugin(UiPluginName.pivotTable)).toThrow(
      PIVOT_TABLE_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedPivotPlugin().pivotTable).toBeTypeOf('function')
  })

  it('uses plugin().buildUi after use()', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPlugin = {
      name: UiPluginName.pivotTable,
      buildUi: (_ctx, props) =>
        h('div', {
          class: 'mmda-pivot',
          'data-rows': (props as { rows?: unknown[] })?.rows?.length ?? 0,
        }),
    }
    ui.use(plugin)
    const node = ui.plugin(UiPluginName.pivotTable)!.buildUi({} as any, {
      rows: [{ name: 'country' }],
      values: [{ name: 'amount', aggregate: 'sum' }],
    } as any)
    expect(node.props?.['data-rows']).toBe(1)
  })

  it('stub builder throws until a plugin is used', () => {
    const stub = createStubUiBuilder()
    expect(() => stub.requirePlugin(UiPluginName.pivotTable)).toThrow(
      PIVOT_TABLE_PLUGIN_NOT_INSTALLED,
    )
    stub.use({
      name: UiPluginName.pivotTable,
      buildUi: () => h('div', { class: 'mmda-pivot' }),
    })
    expect(
      stub.plugin(UiPluginName.pivotTable)!.buildUi({} as any, {}).props?.class,
    ).toBe('mmda-pivot')
    expect(pivotHookClass(undefined)).toEqual(['mmda-pivot', undefined])
  })
})
