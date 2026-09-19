import { describe, expect, it } from 'vitest'

/** Ribbon 是 optional peer，工作区未装 `@syncfusion/ej2-vue-ribbon` 时跳过。 */
describe.skip('createSfRibbonPlugin', () => {
  it('maps tabs, Button item type, and Simplified layout', async () => {
    const { createSfRibbonPlugin } = await import('../plugins/ribbon')
    const plugin = createSfRibbonPlugin()
    const vnode = plugin.buildUi({} as any, {
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
                      type: 'button' as const,
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
