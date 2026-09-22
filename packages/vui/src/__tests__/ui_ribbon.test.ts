import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  RIBBON_PLUGIN_NOT_INSTALLED,
  ribbonHookClass,
  unimplementedRibbonPlugin,
  UiPluginName,
  type UiPlugin,
} from '@mmda/core'
import { createStubUiBuilder } from '../ui/builder'
import { TestUiBuilder } from './test_builder'

const sampleTabs = [
  {
    header: 'Home',
    groups: [
      {
        header: 'Clipboard',
        collections: [
          {
            items: [{ type: 'button' as const, label: 'Paste' }],
          },
        ],
      },
    ],
  },
]

describe('ui ribbon contract', () => {
  it('throws until ribbon plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.requirePlugin(UiPluginName.ribbon)).toThrow(
      RIBBON_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedRibbonPlugin().ribbon).toBeTypeOf('function')
  })

  it('uses plugin().buildUi after use()', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPlugin = {
      name: UiPluginName.ribbon,
      buildUi: (_ctx, props) =>
        h('div', {
          class: 'mmda-ribbon',
          'data-tabs': (props as { tabs?: unknown[] })?.tabs?.length ?? 0,
        }),
    }
    ui.use(plugin)
    const node = ui.plugin(UiPluginName.ribbon)!.buildUi({} as any, {
      tabs: sampleTabs,
    } as any)
    expect(node.props?.['data-tabs']).toBe(1)
  })

  it('stub builder throws until a plugin is used', () => {
    const stub = createStubUiBuilder()
    expect(() => stub.requirePlugin(UiPluginName.ribbon)).toThrow(
      RIBBON_PLUGIN_NOT_INSTALLED,
    )
    stub.use({
      name: UiPluginName.ribbon,
      buildUi: () => h('div', { class: 'mmda-ribbon' }),
    })
    expect(
      stub.plugin(UiPluginName.ribbon)!.buildUi({} as any, { tabs: sampleTabs } as any)
        .props?.class,
    ).toBe('mmda-ribbon')
    expect(ribbonHookClass()).toEqual(['mmda-ribbon', undefined])
  })
})
