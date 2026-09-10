import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  paintModuleToolbar,
} from '../ui/builder/module_toolbar'
import {
  renderToolbarChrome,
  toolbarLayoutOf,
  toolbarModifierClasses,
  toolbarSlotAlignOf,
  toolbarSlotJustifyContent,
} from '../ui/factory/toolbar'
import { COMPACT_VIEWPORT_MEDIA } from '../composables/useCompactViewport'

const hosts: HTMLElement[] = []

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: query === COMPACT_VIEWPORT_MEDIA ? matches : false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    }) as MediaQueryList) as typeof window.matchMedia
}

async function mount(vnode: ReturnType<typeof h>) {
  const host = document.createElement('div')
  hosts.push(host)
  document.body.append(host)
  const app = createApp({
    setup() {
      return () => vnode
    },
  })
  app.mount(host)
  await nextTick()
  return { host, app }
}

afterEach(() => {
  while (hosts.length) hosts.pop()?.remove()
})

describe('toolbar chrome helpers', () => {
  it('defaults layout full and slot align left / center / right', () => {
    expect(toolbarLayoutOf({})).toBe('full')
    expect(toolbarLayoutOf({ layout: 'compact' })).toBe('compact')
    expect(toolbarSlotAlignOf({}, 'start')).toBe('left')
    expect(toolbarSlotAlignOf({}, 'center')).toBe('center')
    expect(toolbarSlotAlignOf({}, 'end')).toBe('right')
    expect(toolbarSlotAlignOf({ align: { end: 'left' } }, 'end')).toBe('left')
    expect(toolbarSlotJustifyContent('left')).toBe('flex-start')
    expect(toolbarSlotJustifyContent('right')).toBe('flex-end')
  })

  it('hooks layout and with-center classes', () => {
    const classes = toolbarModifierClasses(
      { layout: 'medium', class: 'extra' },
      { center: () => 'q' },
    )
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-toolbar')
    expect(classes).toContain('mmda-toolbar--medium')
    expect(classes).toContain('mmda-toolbar--with-center')
    expect(classes).toContain('extra')
  })

  it('omits --full for default layout', () => {
    const classes = toolbarModifierClasses({ layout: 'full' }, {})
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-toolbar')
    expect(classes).not.toContain('mmda-toolbar--full')
    expect(toolbarModifierClasses({}, {}).flat().filter(Boolean)).not.toContain(
      'mmda-toolbar--full',
    )
  })

  it('renders three slots', () => {
    const vnode = renderToolbarChrome(
      { layout: 'full' },
      {
        start: () => 'S',
        center: () => 'C',
        end: () => 'E',
      },
    )
    expect(vnode.props.class).toContain('mmda-toolbar')
    const kids = vnode.children as any[]
    expect(kids).toHaveLength(3)
    expect(kids[0].children).toBe('S')
    expect(kids[1].children).toBe('C')
    expect(kids[2].children).toBe('E')
  })
})

describe('paintModuleToolbar', () => {
  function fakeFactory() {
    return {
      toolbar: (props: any, slots?: any) =>
        h(
          'div',
          {
            class: ['tb', props.class].flat().filter(Boolean),
            'data-layout': props.layout,
          },
          [slots?.start?.(), slots?.center?.(), slots?.end?.()],
        ),
      moreMenuButton: (props: any) =>
        h(
          'button',
          {
            class: 'more',
            'data-icon': props.icon,
            'data-label': props.label ?? '',
            title: props.tooltip,
          },
          props.label || props.icon,
        ),
      dropDownButton: () => h('button', { class: 'menu' }, 'menu'),
      button: (props: any) =>
        h('button', { class: 'search', onClick: props.onClick }, 'search'),
      buttonGroup: () => h('div', { class: 'actions' }),
      resolveIcon: (name: string) => `icon:${name}`,
    } as any
  }

  const ctx = { title: 'Orders', t: (k: string) => k }

  it('full uses breadcrumb, search, action group', async () => {
    mockMatchMedia(false)
    const { host, app } = await mount(
      paintModuleToolbar(
        fakeFactory(),
        ctx,
        { layout: 'full' },
        { center: () => h('input') },
        {
          breadcrumb: () => h('nav', 'bc'),
          actionGroup: () => h('div', { class: 'actions' }),
          moreActions: () => [],
          navActions: () => [],
          openSearchPage: () => {},
        },
      ),
    )
    const tb = host.querySelector('.tb') as HTMLElement
    expect(tb.getAttribute('data-layout')).toBe('full')
    expect(tb.querySelector('nav')).toBeTruthy()
    expect(tb.querySelector('input')).toBeTruthy()
    expect(tb.querySelector('.actions')).toBeTruthy()
    expect(tb.className).not.toContain('mmda-toolbar--dense')
    app.unmount()
  })

  it('medium moreMenuButton always has more icon', async () => {
    mockMatchMedia(false)
    const { host, app } = await mount(
      paintModuleToolbar(
        fakeFactory(),
        ctx,
        { layout: 'medium' },
        { center: () => 'q' },
        {
          breadcrumb: () => h('nav'),
          actionGroup: () => h('div', { class: 'actions' }),
          moreActions: () => [],
          navActions: () => [],
          openSearchPage: () => {},
        },
      ),
    )
    const more = host.querySelector('.more') as HTMLElement
    expect(more.getAttribute('data-icon')).toBe('icon:more')
    expect(more.getAttribute('data-label')).toBe('action.more')
    app.unmount()
  })

  it('dense viewport densifies full actionGroup and medium more label', async () => {
    mockMatchMedia(true)
    const actionGroup = vi.fn((dense?: boolean) =>
      h('div', { class: 'actions', 'data-dense': String(!!dense) }),
    )
    const { host, app } = await mount(
      paintModuleToolbar(
        fakeFactory(),
        ctx,
        { layout: 'full' },
        { center: () => h('input') },
        {
          breadcrumb: () => h('nav', 'bc'),
          actionGroup,
          moreActions: () => [],
          navActions: () => [],
          openSearchPage: () => {},
        },
      ),
    )
    expect(actionGroup).toHaveBeenCalledWith(true)
    expect(host.querySelector('.tb')?.className).toContain('mmda-toolbar--dense')
    expect(
      host.querySelector('.actions')?.getAttribute('data-dense'),
    ).toBe('true')
    app.unmount()

    const medium = await mount(
      paintModuleToolbar(
        fakeFactory(),
        ctx,
        { layout: 'medium' },
        undefined,
        {
          breadcrumb: () => h('nav'),
          actionGroup: () => h('div'),
          moreActions: () => [],
          navActions: () => [],
          openSearchPage: () => {},
        },
      ),
    )
    const more = medium.host.querySelector('.more') as HTMLElement
    expect(more.getAttribute('data-icon')).toBe('icon:more')
    expect(more.getAttribute('data-label')).toBe('')
    medium.app.unmount()
  })

  it('compact magnifier opens search page', async () => {
    mockMatchMedia(false)
    const openSearchPage = vi.fn()
    const { host, app } = await mount(
      paintModuleToolbar(
        fakeFactory(),
        ctx,
        { layout: 'compact' },
        undefined,
        {
          breadcrumb: () => h('nav'),
          actionGroup: () => h('div'),
          moreActions: () => [],
          navActions: () => [],
          openSearchPage,
        },
      ),
    )
    const tb = host.querySelector('.tb') as HTMLElement
    expect(tb.getAttribute('data-layout')).toBe('compact')
    expect(tb.querySelector('.menu')).toBeTruthy()
    expect(tb.textContent).toContain('Orders')
    ;(tb.querySelector('.search') as HTMLButtonElement).click()
    expect(openSearchPage).toHaveBeenCalled()
    app.unmount()
  })
})
