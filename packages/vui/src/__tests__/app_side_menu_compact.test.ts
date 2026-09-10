import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
} from '@mmda/core'
import { VueAppSideMenu } from '../components/AppSideMenu'
import { PageBody } from '../components/PageBody'
import { COMPACT_VIEWPORT_MEDIA } from '../composables/useCompactViewport'
import { UI_BUILDER_KEY } from '../app/keys'
import { TestUiBuilder } from './test_builder'

const sampleModules = new ModuleFactory([
  {
    moduleCode: 'B',
    moduleLabel: '基础数据',
    moduleType: 'SYSTEM',
    moduleVersion: ModuleVersion.TEAM,
    allowOps: 0,
    moduleUrl: '/BASE',
    requiredCreateParam: false,
    status: ModuleStatus.RELEASED,
    divider: false,
    subModules: [
      {
        moduleCode: 'B.01',
        moduleLabel: '组织架构',
        moduleType: 'MODULE',
        moduleVersion: ModuleVersion.TEAM,
        allowOps: 0,
        moduleUrl: '/BASE/org',
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        subModules: [
          {
            moduleCode: 'B.01.01',
            moduleLabel: '部门',
            moduleType: 'FEATURE',
            moduleVersion: ModuleVersion.TEAM,
            allowOps: ModuleOp.READ,
            moduleUrl: '/BASE/Departments',
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
          },
        ],
      },
    ],
  },
]).modules

const hosts: HTMLElement[] = []

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(ev: MediaQueryListEvent) => void>()
  window.matchMedia = ((query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_: string, fn: (ev: MediaQueryListEvent) => void) => {
        listeners.add(fn)
      },
      removeEventListener: (
        _: string,
        fn: (ev: MediaQueryListEvent) => void,
      ) => {
        listeners.delete(fn)
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    }) as MediaQueryList) as typeof window.matchMedia
  return listeners
}

async function mount(vnode: ReturnType<typeof h>, builder?: VueUiBuilder) {
  const host = document.createElement('div')
  hosts.push(host)
  document.body.append(host)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
  })
  await router.push('/')
  const app = createApp({
    setup() {
      return () => vnode
    },
  })
  app.use(router)
  if (builder) app.provide(UI_BUILDER_KEY, builder)
  app.mount(host)
  return { host, app }
}

afterEach(() => {
  for (const host of hosts) {
    host.remove()
  }
  hosts.length = 0
})

describe('VueAppSideMenu compact drawer', () => {
  it('exports 1024px media query', () => {
    expect(COMPACT_VIEWPORT_MEDIA).toBe('(max-width: 1024px)')
  })

  it('opens drawer on L1 click and closes on leaf click', async () => {
    mockMatchMedia(true)
    const drawer = vi.fn((props: any, slots: any) =>
      h(
        'div',
        {
          class: 'test-drawer',
          'data-open': String(props.isOpen),
        },
        props.isOpen ? slots?.default?.() : null,
      ),
    )
    const builder = new TestUiBuilder()
    builder.factory.drawer = drawer

    const { host, app } = await mount(
      h(VueAppSideMenu, { modules: sampleModules, compact: true }),
      builder,
    )
    expect(host.querySelector('.mmda-app-side-menu--compact')).not.toBeNull()
    const l1 = host.querySelector(
      '.mmda-app-side-menu__rail-item',
    ) as HTMLButtonElement
    l1.click()
    await nextTick()
    expect(drawer).toHaveBeenCalled()
    const opened = drawer.mock.calls.some((call) => call[0]?.isOpen === true)
    expect(opened).toBe(true)
    const drawerClass = String(drawer.mock.calls.at(-1)?.[0]?.class ?? '')
    expect(drawerClass).toContain('mmda-app-side-menu__drawer')

    const group = host.querySelector(
      '.mmda-side-menu__group',
    ) as HTMLButtonElement
    group?.click()
    await nextTick()
    const leaf = host.querySelector(
      '[role="app-module-feature"]',
    ) as HTMLElement
    expect(leaf).not.toBeNull()
    leaf.click()
    await nextTick()
    await nextTick()
    const last = drawer.mock.calls.at(-1)?.[0]
    expect(last?.isOpen).toBe(false)
    app.unmount()
  })
})

describe('PageBody compact summary', () => {
  it('collapses summary when viewport is compact', async () => {
    mockMatchMedia(true)
    const { host, app } = await mount(
      h(
        PageBody,
        { hasSummary: true, summaryExpanded: true },
        {
          primary: () => h('section', 'main'),
          summary: () => h('section', 'side'),
        },
      ),
    )
    await nextTick()
    const body = host.querySelector('.mmda-page-body')
    expect(body?.classList.contains('is-summary-collapsed')).toBe(true)
    expect(body?.classList.contains('mmda-page-body--compact')).toBe(true)
    app.unmount()
  })
})
