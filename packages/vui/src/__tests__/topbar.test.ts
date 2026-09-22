import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { paintModuleTopbar } from '../ui/builder/topbar'
import {
  indexTopbarLayoutOf,
  indexTopbarModifierClasses,
  indexTopbarSlotAlignOf,
  renderIndexTopbar,
  topbarSlotJustifyContent,
} from '../ui/builder/topbar'
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

describe('index topbar chrome helpers', () => {
  it('defaults layout full and slot align left / center / right', () => {
    expect(indexTopbarLayoutOf({})).toBe('full')
    expect(indexTopbarLayoutOf({ layout: 'compact' })).toBe('compact')
    expect(indexTopbarSlotAlignOf({}, 'start')).toBe('left')
    expect(indexTopbarSlotAlignOf({}, 'center')).toBe('center')
    expect(indexTopbarSlotAlignOf({}, 'end')).toBe('right')
    expect(indexTopbarSlotAlignOf({ align: { end: 'left' } }, 'end')).toBe('left')
    expect(topbarSlotJustifyContent('left')).toBe('flex-start')
    expect(topbarSlotJustifyContent('right')).toBe('flex-end')
  })

  it('hooks layout and with-center classes', () => {
    const classes = indexTopbarModifierClasses(
      { layout: 'medium', class: 'extra' },
      { center: () => 'q' as any },
    )
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-index-topbar')
    expect(classes).toContain('mmda-index-topbar--medium')
    expect(classes).toContain('mmda-index-topbar--with-center')
    expect(classes).toContain('extra')
  })

  it('omits --full for default layout', () => {
    const classes = indexTopbarModifierClasses({ layout: 'full' }, {})
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-index-topbar')
    expect(classes).not.toContain('mmda-index-topbar--full')
  })

  it('renders three slots', () => {
    const vnode = renderIndexTopbar(
      { layout: 'full' },
      {
        start: () => 'S' as any,
        center: () => 'C' as any,
        end: () => 'E' as any,
      },
    )
    expect(vnode.props?.class).toContain('mmda-index-topbar')
    const kids = vnode.children as any[]
    expect(kids).toHaveLength(3)
    expect(kids[0].children).toBe('S')
    expect(kids[1].children).toBe('C')
    expect(kids[2].children).toBe('E')
  })
})

describe('paintModuleTopbar', () => {
  function fakeFactory() {
    return {
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
      paintModuleTopbar(
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
    const tb = host.querySelector('.mmda-index-topbar') as HTMLElement
    expect(tb.className).toContain('mmda-index-topbar')
    expect(tb.querySelector('nav')).toBeTruthy()
    expect(tb.querySelector('input')).toBeTruthy()
    expect(tb.querySelector('.actions')).toBeTruthy()
    expect(tb.className).not.toContain('mmda-index-topbar--dense')
    app.unmount()
  })

  it('medium moreMenuButton always has more icon', async () => {
    mockMatchMedia(false)
    const { host, app } = await mount(
      paintModuleTopbar(
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
      paintModuleTopbar(
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
    expect(host.querySelector('.mmda-index-topbar')?.className).toContain(
      'mmda-index-topbar--dense',
    )
    expect(
      host.querySelector('.actions')?.getAttribute('data-dense'),
    ).toBe('true')
    app.unmount()

    const medium = await mount(
      paintModuleTopbar(
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
      paintModuleTopbar(
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
    const tb = host.querySelector('.mmda-index-topbar') as HTMLElement
    expect(tb.className).toContain('mmda-index-topbar--compact')
    expect(tb.querySelector('.menu')).toBeTruthy()
    expect(tb.textContent).toContain('Orders')
    ;(tb.querySelector('.search') as HTMLButtonElement).click()
    expect(openSearchPage).toHaveBeenCalled()
    app.unmount()
  })
})
