import { describe, expect, it } from 'vitest'
import { createSfRibbonPlugin } from '../factory/ribbon'

describe('createSfRibbonPlugin', () => {
  it('maps tabs, Button item type, and Simplified layout', () => {
    const plugin = createSfRibbonPlugin()
    const vnode = plugin.ribbon({
      layout: 'simplified',
      activeTab: 1,
      tabs: [
        {
          header: 'Home',
          groups: [
            {
              header: 'Clipboard',
              collections: [
                {
                  items: [
                    {
                      type: 'button',
                      label: 'Paste',
                      icon: 'e-icons e-paste',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          header: 'Insert',
          groups: [{ collections: [{ items: [] }] }],
        },
      ],
    })
    expect(vnode.props?.tabs?.[0]?.header).toBe('Home')
    expect(
      vnode.props?.tabs?.[0]?.groups?.[0]?.collections?.[0]?.items?.[0]?.type,
    ).toBe('Button')
    expect(vnode.props?.activeLayout).toBe('Simplified')
    expect(vnode.props?.selectedTab).toBe(1)
  })
})
