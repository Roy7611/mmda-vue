import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  RIBBON_PLUGIN_NOT_INSTALLED,
  ribbonHookClass,
  unimplementedRibbonPlugin,
  type UiRibbonPlugin,
} from '../ui/factory/ribbon'
import { createStubUiBuilder } from '../ui/builder/builder'
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
  it('throws until setRibbonPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.ribbonPlugin.ribbon({ tabs: sampleTabs })).toThrow(
      RIBBON_PLUGIN_NOT_INSTALLED,
    )
    expect(() => ui.buildRibbon({ tabs: sampleTabs })).toThrow(
      RIBBON_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedRibbonPlugin().ribbon).toBeTypeOf('function')
  })

  it('uses the plugin after setRibbonPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiRibbonPlugin = {
      ribbon: (props) =>
        h('div', {
          class: 'mmda-ribbon',
          'data-tabs': props.tabs.length,
        }),
    }
    ui.setRibbonPlugin(plugin)
    const node = ui.buildRibbon({ tabs: sampleTabs })
    expect(node.props?.['data-tabs']).toBe(1)
  })

  it('stub builder throws until a plugin is set', () => {
    const stub = createStubUiBuilder()
    expect(() => stub.buildRibbon({ tabs: sampleTabs })).toThrow(
      RIBBON_PLUGIN_NOT_INSTALLED,
    )
    stub.setRibbonPlugin({
      ribbon: () => h('div', { class: 'mmda-ribbon' }),
    })
    expect(stub.buildRibbon({ tabs: sampleTabs }).props?.class).toBe(
      'mmda-ribbon',
    )
    expect(ribbonHookClass()).toEqual(['mmda-ribbon', undefined])
  })
})
