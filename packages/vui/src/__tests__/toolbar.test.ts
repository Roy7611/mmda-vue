import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
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
        h('div', { class: 'tb', 'data-layout': props.layout }, [
          slots?.start?.(),
          slots?.center?.(),
          slots?.end?.(),
        ]),
      moreMenuButton: () => h('button', { class: 'more' }, 'more'),
      dropDownButton: () => h('button', { class: 'menu' }, 'menu'),
      button: (props: any) =>
        h('button', { class: 'search', onClick: props.onClick }, 'search'),
      buttonGroup: () => h('div', { class: 'actions' }),
      resolveIcon: (name: string) => name,
    } as any
  }

  const ctx = { title: 'Orders', t: (k: string) => k }

  it('full uses breadcrumb, search, action group', () => {
    const vnode = paintModuleToolbar(
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
    )
    expect(vnode.props['data-layout']).toBe('full')
    const kids = vnode.children as any[]
    expect(kids[0].type).toBe('nav')
    expect(kids[1].type).toBe('input')
    expect(kids[2].props.class).toBe('actions')
  })

  it('medium uses moreMenuButton; compact magnifier opens search page', () => {
    const medium = paintModuleToolbar(
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
    )
    expect((medium.children as any[])[2].props.class).toBe('more')

    const openSearchPage = vi.fn()
    const compact = paintModuleToolbar(
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
    )
    expect(compact.props['data-layout']).toBe('compact')
    const kids = compact.children as any[]
    expect(kids[0].props.class).toBe('menu')
    expect(kids[1].children).toBe('Orders')
    kids[2].props.onClick()
    expect(openSearchPage).toHaveBeenCalled()
  })
})
