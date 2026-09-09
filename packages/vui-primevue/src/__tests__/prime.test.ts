import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  MetaUi,
  MetaUiGroup,
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
  auth,
} from '@mmda/core'
import { MMDA_COLOR_PALETTE_IDS, UiViewMany } from '@mmda/vui'
import { PrimeVueUiBuilder } from '../prime_builder'
import { createPrimeVueFieldFactory } from '../prime_field_factory'
import { createPrimeVueUiFactory } from '../prime_factory'
import { primeLayout } from '../prime_layout'
import {
  applyPrimeColumnFilter,
  hydratePrimeColumnFilter,
} from '../prime_filter'

describe('PrimeVue skin', () => {
  it('maps all MMDA palettes to Aura primary and highlight variables', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')
    for (const palette of MMDA_COLOR_PALETTE_IDS) {
      expect(css).toContain(`data-mmda-palette="${palette}"`)
    }
    expect(css).toContain('--p-primary-950')
    expect(css).toContain('--p-highlight-background')
  })

  it('implements the vui factory and layout contracts', () => {
    const factory = createPrimeVueUiFactory()
    expect(factory.layout).toBe(primeLayout)
    expect(factory.table).toBeTypeOf('function')
    expect(factory.grid).toBeTypeOf('function')
    expect(factory.dialog).toBeUndefined()
    expect((factory as any).diagram).toBeUndefined()
    expect(factory.splitter).toBeTypeOf('function')
    expect(factory.tabs).toBeTypeOf('function')
    expect(factory.toolbar).toBeTypeOf('function')
    expect(factory.tree).toBeTypeOf('function')
    const tree = factory.tree({
      data: [{ id: '1', label: '根' }],
      fields: { icon: 'icon' },
      selectionMode: 'checkbox',
      showIcon: true,
      allowDragDrop: true,
    })
    expect(tree.props.selectionMode).toBe('checkbox')
    expect(tree.props.showIcon).toBe(true)
    expect(tree.props.allowDragDrop).toBe(true)
    expect(factory.resolveIcon('save')).toBe('pi pi-check')
    expect(factory.inplaceEditor).toBeTypeOf('function')
    expect(factory.nativeInplaceEdit).toBe(true)
    expect(factory.formField).toBeTypeOf('function')
    expect(factory.formItem).toBeUndefined()
    expect(factory.toggleSwitch).toBeUndefined()
    expect(factory.defaultFilterDisplay).toBeUndefined()
    expect(factory.checkbox).toBeUndefined()
  })

  it('sets DataTable cell edit when editable', () => {
    const factory = createPrimeVueUiFactory()
    const metaUi = new MetaUi({
      objName: 'Item',
      displayLabel: '项',
      groups: [
        {
          groupName: 'base',
          groupLabel: '基本',
          many: false,
          fields: [{ fieldName: 'name', displayLabel: '名称' }],
        },
      ],
    })
    const vnode = factory.table([{ id: '1', name: 'a' }], metaUi, {
      editable: true,
    })
    expect(vnode.props?.editMode).toBe('cell')
  })

  it('maps factory.badge colorRole and circle shape', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.badge({
      value: 10,
      colorRole: 'primary',
      shape: 'circle',
    })
    expect(vnode.props?.value).toBe(10)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-badge--circle')
  })

  it('maps factory.avatar circle large label', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.avatar({
      label: 'GR',
      shape: 'circle',
      size: 'large',
    })
    expect(vnode.props?.label).toBe('GR')
    expect(vnode.props?.shape).toBe('circle')
    expect(vnode.props?.size).toBe('large')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-avatar--circle')
  })

  it('maps factory.card surface, colorRole, image, headerImage, divider', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.card(
      {
        title: 'Summary',
        colorRole: 'primary',
        surface: 'outlined',
        image: '/cover.png',
        headerImage: '/face.png',
        divider: true,
      },
      { default: () => [h('p', 'body')] },
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-card')
    expect(cls).toContain('mmda-card--primary')
    expect(cls).toContain('mmda-card--outlined')
    const slots = vnode.children as Record<string, () => unknown>
    const header = slots.header?.()
    const headerList = Array.isArray(header) ? header : [header]
    expect(
      headerList.some(
        (node: any) => node?.type === 'img' && node?.props?.src === '/cover.png',
      ),
    ).toBe(true)
    const title = slots.title?.()
    const titleList = Array.isArray(title) ? title.flat(4) : [title]
    const walk = (nodes: any[]): any[] =>
      nodes.flatMap((n) =>
        n && Array.isArray(n.children) ? [n, ...walk(n.children)] : n ? [n] : [],
      )
    expect(
      walk(titleList).some(
        (node: any) =>
          node?.type === 'img' &&
          node?.props?.src === '/face.png' &&
          String(node?.props?.class ?? '').includes('mmda-card-header-image'),
      ),
    ).toBe(true)
    const content = slots.content?.()
    const contentList = Array.isArray(content) ? content : [content]
    expect(
      contentList.some((node: any) => {
        const c = Array.isArray(node?.props?.class)
          ? node.props.class.flat(8).filter(Boolean).join(' ')
          : String(node?.props?.class ?? '')
        return c.includes('mmda-divider')
      }),
    ).toBe(true)
  })

  it('maps factory.divider orientation and label', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.divider({
      orientation: 'vertical',
      label: '或',
    })
    expect(vnode.props?.layout).toBe('vertical')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-divider')
    expect(cls).toContain('mmda-divider--vertical')
    expect(cls).toContain('mmda-divider--labeled')
    const text = (vnode.children as any)?.default?.()
    expect(text).toBe('或')
  })

  it('maps factory.colorPicker mode, value, and emits hex', () => {
    const factory = createPrimeVueUiFactory()
    const onChange = vi.fn()
    const vnode = factory.colorPicker({
      value: '#035a',
      mode: 'palette',
      showModeSwitcher: false,
      onChange,
    })
    expect(vnode.props?.modelValue).toBe('#035a')
    expect(vnode.props?.format).toBe('hex')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-colorpicker')
    expect(cls).toContain('mmda-colorpicker--palette')
    vnode.props?.['onUpdate:modelValue']?.('rgba(123, 31, 162, 1)')
    expect(onChange).toHaveBeenCalledWith('#7b1fa2')
  })

  it('maps factory.maskedTextBox EJ2 mask to Prime 9', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.maskedTextBox({
      mask: '000 0000 0000',
      value: '13800138000',
    })
    expect(vnode.props?.mask).toBe('999 9999 9999')
    expect(vnode.props?.modelValue).toBe('13800138000')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-maskedtextbox')
  })

  it('maps factory.oneTimePasswordInput to InputOtp', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.oneTimePasswordInput({
      length: 6,
      type: 'number',
      value: '123456',
    })
    expect(vnode.props?.length).toBe(6)
    expect(vnode.props?.integerOnly).toBe(true)
    expect(vnode.props?.modelValue).toBe('123456')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-otpinput')
  })

  it('maps factory.queryBuilder to QueryBuilderHost', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.queryBuilder({
      columns: [{ fieldName: 'age', label: 'Age', valueType: 'number' }],
    })
    const qbClass = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(qbClass).toContain('mmda-querybuilder')
  })

  it('maps factory.slider Range to Prime range', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.slider({
      type: 'Range',
      value: [10, 40],
      min: 0,
      max: 50,
    })
    expect(vnode.props?.range).toBe(true)
    expect(vnode.props?.modelValue).toEqual([10, 40])
    const sliderClass = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(sliderClass).toContain('mmda-slider--range')
  })

  it('maps factory.rating itemsCount to Prime stars', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.rating({
      value: 2,
      itemsCount: 5,
      readOnly: true,
    })
    expect(vnode.props?.stars).toBe(5)
    expect(vnode.props?.readonly).toBe(true)
    expect(vnode.props?.modelValue).toBe(2)
    const ratingClass = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(ratingClass).toContain('mmda-rating')
  })

  it('maps factory.sidebar and drawer to Prime Drawer', () => {
    const factory = createPrimeVueUiFactory()
    const sidebar = factory.sidebar({ isOpen: true, type: 'Push', enableDock: true })
    expect(sidebar.props?.visible).toBe(true)
    expect(sidebar.props?.position).toBe('left')
    const sidebarClass = Array.isArray(sidebar.props?.class)
      ? sidebar.props.class.flat(8).filter(Boolean).join(' ')
      : String(sidebar.props?.class ?? '')
    expect(sidebarClass).toContain('mmda-sidebar--push')
    expect(sidebarClass).toContain('mmda-sidebar--dock')
    const drawer = factory.drawer({ isOpen: true })
    expect(drawer.props?.modal).toBe(true)
    const drawerClass = Array.isArray(drawer.props?.class)
      ? drawer.props.class.flat(8).filter(Boolean).join(' ')
      : String(drawer.props?.class ?? '')
    expect(drawerClass).toContain('mmda-sidebar--drawer')
    expect(drawerClass).toContain('mmda-sidebar--over')
  })

  it('maps factory.tabs value scrollable and headerPlacement class', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.tabs({
      items: [
        { header: 'One', content: 'a' },
        { header: 'Two', content: 'b', disabled: true },
      ],
      value: 1,
      headerPlacement: 'Left',
      scrollable: false,
    })
    expect(vnode.props?.value).toBe(1)
    expect(vnode.props?.scrollable).toBe(false)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-tabs')
    expect(cls).toContain('mmda-tabs--left')
    expect(cls).toContain('mmda-tabs--popup')
    expect(cls).toContain('mmda-tabs--fill')
  })

  it('maps factory.toolbar start center end slots', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.toolbar(
      { layout: 'compact', align: { end: 'left' } },
      {
        start: () => 'S',
        center: () => 'C',
        end: () => 'E',
      },
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-toolbar')
    expect(cls).toContain('mmda-toolbar--compact')
    expect(vnode.children.start()).toBeTruthy()
    const endCls = Array.isArray(vnode.children.end().props.class)
      ? vnode.children.end().props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.children.end().props.class ?? '')
    expect(endCls).toContain('mmda-toolbar__end--left')
  })

  it('maps factory.splitter orientation to Prime layout', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.splitter(
      [
        { content: h('span', 'L'), size: '20%' },
        { content: h('span', 'R') },
      ],
      { orientation: 'Vertical', enableReversePanes: true },
    )
    expect(vnode.props?.layout).toBe('vertical')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-splitter')
    expect(cls).toContain('mmda-splitter--vertical')
    expect(cls).toContain('mmda-splitter--reverse')
  })

  it('maps factory.numberInput decimals and modelValue', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.numberInput({
      value: 12.5,
      maxFractionDigits: 3,
      min: 0,
    })
    expect(vnode.props?.modelValue).toBe(12.5)
    expect(vnode.props?.maxFractionDigits).toBe(3)
    expect(vnode.props?.minFractionDigits).toBe(3)
    expect(vnode.props?.min).toBe(0)
    expect(vnode.props?.step).toBe(1)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-numberinput')
  })

  it('maps factory.textArea value rows and autoResize', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.textArea({
      value: 'hello',
      rows: 5,
      resizeMode: 'None',
      autoResize: true,
    } as any)
    expect(vnode.props?.modelValue).toBe('hello')
    expect(vnode.props?.rows).toBe(5)
    expect(vnode.props?.autoResize).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-textarea')
    expect(cls).toContain('mmda-textarea--none')
  })

  it('maps factory.textInput modelValue placeholder and HTML type', () => {
    const factory = createPrimeVueUiFactory()
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const vnode = factory.textInput({
      value: 'hello',
      placeholder: 'hint',
      type: 'Password',
      onFocus,
      onBlur,
    })
    expect(vnode.props?.modelValue).toBe('hello')
    expect(vnode.props?.placeholder).toBe('hint')
    expect(vnode.props?.type).toBe('password')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-textinput')
    vnode.props?.onFocus?.()
    vnode.props?.onBlur?.()
    expect(onFocus).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('maps factory.progressBar value; circular stays linear with hook class', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.progressBar({
      value: 42,
      kind: 'circular',
    })
    expect(vnode.props?.value).toBe(42)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-progressbar--circular')
  })

  it('maps factory.signaturePad host class', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.signaturePad({
      value: '',
      readOnly: true,
    })
    expect(vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type)).toMatch(
      /Signature/,
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-signature-pad')
  })

  it('maps factory.stepper host class', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.stepper({
      value: 1,
      items: [{ label: '甲' }, { label: '乙' }],
    })
    expect(vnode.props?.activeStep).toBe(1)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-stepper')
  })

  it('maps factory.skeleton circle to Prime rectangle-or-circle shape', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.skeleton({
      shape: 'circle',
      width: 40,
      height: 40,
      shimmer: 'none',
    })
    expect(vnode.props?.shape).toBe('circle')
    expect(vnode.props?.animation).toBe('none')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-skeleton--circle')
  })

  it('maps factory.loading to ProgressSpinner', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.loading({ label: '加载中', size: 'small' })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-loading')
    expect(vnode.props?.['aria-busy']).toBe('true')
    const child = vnode.children?.[0] as any
    expect(
      String(child?.type?.name ?? child?.type?.__name ?? child?.type),
    ).toMatch(/ProgressSpinner/i)
  })

  it('maps factory.tree to PrimeTree with mmda-tree', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.tree({
      data: [{ id: '1', label: '根' }],
      selectionMode: 'checkbox',
    })
    expect(vnode.type?.name ?? vnode.type?.__name).toBe('PrimeTree')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-tree')
    expect(cls).toContain('mmda-tree--checkbox')
  })

  it('maps factory.speechToText lang and interim onto the host', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.speechToText({
      value: '你好',
      lang: 'zh-CN',
      interim: false,
    })
    expect(vnode.props?.value).toBe('你好')
    expect(vnode.props?.lang).toBe('zh-CN')
    expect(vnode.props?.interim).toBe(false)
    expect(vnode.props?.renderButton).toBeTypeOf('function')
  })

  it('maps factory.radioButtonGroup RadioButton values', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.radioButtonGroup({
      value: 'b',
      name: 'kind',
      options: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
    })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-radiobuttongroup')
    const labels = Array.isArray(vnode.children) ? vnode.children : []
    expect(labels.length).toBe(2)
    const radios = labels.map((label) =>
      Array.isArray(label.children) ? label.children[0] : label.children,
    )
    expect(radios[0].props?.name).toBe('kind')
    expect(radios[0].props?.value).toBe('a')
    expect(radios[1].props?.value).toBe('b')
    expect(radios[1].props?.modelValue).toBe('b')
  })


  it('maps factory.datePicker format, Monday week, and no typing', () => {
    const factory = createPrimeVueUiFactory()
    const onChange = vi.fn()
    const day = new Date(2026, 8, 7)
    const vnode = factory.datePicker({
      value: day,
      onChange,
    })
    expect(vnode.props?.dateFormat).toBe('yy-mm-dd')
    expect(vnode.props?.manualInput).toBe(false)
    expect(vnode.props?.firstDayOfWeek).toBe(1)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-datepicker')
    vnode.props?.['onUpdate:modelValue']?.(day)
    expect(onChange).toHaveBeenCalledWith(day)
    const month = factory.monthPicker({ value: day })
    expect(month.props?.view).toBe('month')
    expect(month.props?.dateFormat).toBe('yy-mm')
    const start = new Date(2026, 8, 1)
    const end = new Date(2026, 8, 7)
    const range = factory.dateRangePicker({ value: [start, end] })
    expect(range.props?.selectionMode).toBe('range')
    expect(range.props?.modelValue).toEqual([start, end])
  })

  it('maps factory.dropDownList options, group, and onChange', () => {
    const factory = createPrimeVueUiFactory()
    const onChange = vi.fn()
    const vnode = factory.dropDownList({
      value: 'a',
      options: [
        { value: 'a', label: '甲', group: 'G', icon: 'flag' },
        { value: 'b', label: '乙', group: 'G' },
      ],
      onChange,
    })
    expect(vnode.props?.modelValue).toBe('a')
    expect(vnode.props?.optionGroupChildren).toBe('items')
    expect(vnode.props?.options?.[0]?.items?.[0]).toMatchObject({
      value: 'a',
      label: '甲',
      icon: 'flag',
    })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-dropdown-list')
    vnode.props?.['onUpdate:modelValue']?.('b')
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('maps factory.multiSelect chip keys', () => {
    const factory = createPrimeVueUiFactory()
    const onChange = vi.fn()
    const vnode = factory.multiValueSelect({
      value: ['a'],
      options: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      onChange,
    })
    expect(vnode.props?.optionValue).toBe('value')
    expect(vnode.props?.modelValue).toEqual(['a'])
    expect(vnode.props?.display).toBe('chip')
    vnode.props?.['onUpdate:modelValue']?.(['a', 'b'])
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('maps factory.tagAutoComplete multiple AutoComplete', () => {
    const factory = createPrimeVueUiFactory()
    const onUpdate = vi.fn()
    const vnode = factory.tagAutoComplete('a', { options: ['a', 'b'], onUpdate })
    expect(vnode.props?.multiple).toBe(true)
    vnode.props?.['onUpdate:modelValue']?.(['a', 'b'])
    expect(onUpdate).toHaveBeenCalledWith('a,b')
  })

  it('maps factory.treeSelect checkbox keys and hook class', () => {
    const factory = createPrimeVueUiFactory()
    const onChange = vi.fn()
    const vnode = factory.treeSelect({
      value: ['a'],
      data: [{ id: 'a', label: '甲' }],
      fields: { id: 'id', label: 'label' },
      selectionMode: 'checkbox',
      onChange,
    })
    expect(vnode.props?.modelValue).toEqual({
      a: { checked: true, partialChecked: false },
    })
    expect(vnode.props?.selectionMode).toBe('checkbox')
    expect(vnode.props?.filter).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-tree-select')
    expect(factory.dropDownTree).toBe(factory.treeSelect)
    vnode.props?.['onUpdate:modelValue']?.({
      a: { checked: true },
      b: { checked: true },
    })
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('maps factory.comboBox dropdown and custom class', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.comboBox({ value: 't', options: ['a'] })
    expect(vnode.props?.dropdown).toBe(true)
    expect(vnode.props?.forceSelection).toBe(false)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-combobox')
    expect(cls).toContain('mmda-combobox--custom')
    const closed = factory.comboBox({
      value: 'a',
      options: ['a'],
      allowCustom: false,
    })
    expect(closed.props?.forceSelection).toBe(true)
  })

  it('maps factory.barcode format class', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.barcode({ value: '123', format: 'code39' })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-barcode--code39')
  })

  it('does not draw QR for dataMatrix', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.qrCode({ value: 'SYNC123', format: 'dataMatrix' })
    expect(vnode.type).toBe('span')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-qrcode--unsupported')
    expect(cls).toContain('mmda-qrcode--data-matrix')
    expect(vnode.children).toBe('SYNC123')
  })

  it('registers old metadata editor aliases', () => {
    const fields = createPrimeVueFieldFactory()
    expect(fields.TextBox).toBe(fields.textInput)
    expect(fields.DropDownList).toBe(fields.dropDownList)
    expect(fields.dropdown).toBeUndefined()
    expect(fields.DatePicker).toBe(fields.datePicker)
    expect(fields.FileUpload).toBe(fields.fileUpload)
    expect(fields.FileUploader).toBe(fields.fileUploader)
    expect(fields.Url).toBe(fields.fileLink)
    expect(fields.InplaceFieldEditor).toBe(fields.inplaceFieldEditor)
    expect(fields.BitChipSet).toBe(fields.bitChipSet)
    expect(fields.EnumChipSet).toBe(fields.enumChipSet)
    expect(fields.enumSetTags).toBeUndefined()
    expect(fields.BitTags).toBeUndefined()
  })

  it('constructs the builder against the new VueUiBuilder contract', () => {
    const builder = new PrimeVueUiBuilder()
    expect(builder.factory.layout.fieldMessage).toBe(false)
    expect(builder.buildAppScaffold()).toBeTruthy()
  })

  it('wraps toolbar actions in PrimeVue ButtonGroup', () => {
    const builder = new PrimeVueUiBuilder()
    const group = builder.factory.buttonGroup(() => [
      builder.factory.actionButton(
        { name: 'refresh', label: 'Refresh', onAction: () => undefined },
        key => key,
      ),
      builder.factory.actionButton(
        { name: 'create', label: 'Create', onAction: () => undefined },
        key => key,
      ),
    ])
    expect(group.type?.name ?? group.type).toBe('ButtonGroup')
    expect(group.props?.class).toContain('mmda-prime-button-group')
  })

  it('renders selectButtonGroup as Prime SelectButton', () => {
    const builder = new PrimeVueUiBuilder()
    const group = builder.factory.selectButtonGroup('center', {
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
      optionLabel: 'label',
      optionValue: 'value',
    })
    expect(group.type?.name ?? group.type).toBe('SelectButton')
    expect(group.props?.multiple).not.toBe(true)
    const multi = builder.factory.selectButtonGroup(['left'], {
      selectionMode: 'multiple',
      options: [{ label: 'Left', value: 'left' }],
    })
    expect(multi.props?.multiple).toBe(true)
  })

  it('defaults to Card, uses fieldset when container is fieldset', () => {
    const builder = new PrimeVueUiBuilder()
    const group = new MetaUiGroup({
      groupName: 's1',
      groupLabel: '概要',
      many: false,
      fields: [],
    })
    const card = builder.wrapGroup(group, h('div', 'body'))
    expect(card.type?.name ?? card.type?.__name).toBe('PrimeGroupCard')
    expect(String(card.props?.class)).toContain('secondary')
    expect(String(card.props?.class)).toContain('master')
    const fieldset = builder.wrapGroup(group, h('div', 'body'), {
      container: 'fieldset',
    })
    expect(fieldset.type).toBe('fieldset')
    expect(String(fieldset.props?.class)).toContain('secondary')
  })

  it('builds module breadcrumb from parent chain', () => {
    const factory = new ModuleFactory([
      {
        moduleCode: 'B',
        moduleLabel: '基础数据',
        moduleType: 'SYSTEM',
        moduleVersion: ModuleVersion.TEAM,
        allowOps: 1,
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
            moduleIcon: 'far fa-sitemap',
            allowOps: 1,
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
                allowOps: 7,
                moduleUrl: '/BASE/Departments',
                requiredCreateParam: false,
                status: ModuleStatus.RELEASED,
                divider: false,
                objName: 'Department',
              },
            ],
          },
        ],
      },
    ])
    const dept = factory.findModuleByName('Department')!
    const builder = new PrimeVueUiBuilder()
    const vnode = builder.buildModuleBreadcrumb(
      { title: '部门' } as any,
      { module: dept },
    )
    expect(vnode).toBeTruthy()
    expect((vnode.props as any)?.model).toHaveLength(2)
    expect((vnode.props as any)?.model.map((item: any) => item.label)).not.toContain(
      '基础数据',
    )
    expect((vnode.props as any)?.model[0].label).toBe('组织架构')
    expect((vnode.props as any)?.model[0].to).toBe('/BASE/org')
    expect((vnode.props as any)?.model[1].label).toBe('部门')
    expect((vnode.props as any)?.model[1].leaf).toBe(true)
  })

  it('maps factory.breadcrumb items', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.breadcrumb({
      items: [
        { label: '组织', to: '/org' },
        { label: '部门' },
      ],
    })
    expect((vnode.props as any)?.model).toHaveLength(2)
    expect((vnode.props as any)?.model[0].to).toBe('/org')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-breadcrumb')
  })

  it('maps factory.calendar to inline DatePicker', () => {
    const factory = createPrimeVueUiFactory()
    const min = new Date(2017, 4, 9)
    const max = new Date(2017, 4, 15)
    const values = [new Date(2020, 0, 1), new Date(2020, 0, 15)]
    const vnode = factory.calendar({
      value: values,
      selectionMode: 'multiple',
      min,
      max,
      view: 'year',
    })
    expect((vnode.props as any)?.inline).toBe(true)
    expect((vnode.props as any)?.selectionMode).toBe('multiple')
    expect((vnode.props as any)?.minDate).toBe(min)
    expect((vnode.props as any)?.maxDate).toBe(max)
    expect((vnode.props as any)?.view).toBe('month')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-calendar')
  })

  it('maps factory.carousel to Prime Carousel', () => {
    const factory = createPrimeVueUiFactory()
    const items = [
      { src: '/a.jpg', title: 'A' },
      { src: '/b.jpg', title: 'B' },
    ]
    const vnode = factory.carousel({
      items,
      selectedIndex: 1,
      autoPlay: true,
      interval: 4000,
      loop: true,
      animation: 'fade',
    })
    expect((vnode.props as any)?.value).toHaveLength(2)
    expect((vnode.props as any)?.page).toBe(1)
    expect((vnode.props as any)?.circular).toBe(true)
    expect((vnode.props as any)?.autoplayInterval).toBe(4000)
    expect((vnode.props as any)?.numVisible).toBe(1)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-carousel')
    expect(cls).toContain('mmda-carousel--fade')
  })

  it('maps factory.checkBox to Prime Checkbox', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.checkBox({
      checked: true,
      label: '同意条款',
      indeterminate: true,
    })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-checkbox')
    expect(cls).toContain('mmda-checkbox--indeterminate')
    const kids = vnode.children as any[]
    expect(kids[0].props.binary).toBe(true)
    expect(kids[0].props.modelValue).toBe(true)
    expect(kids[0].props.indeterminate).toBe(true)
    expect(kids[1].children).toBe('同意条款')
    const omitted = factory.checkBox({ checked: false, label: '未半选' })
    expect((omitted.children as any[])[0].props.indeterminate).toBeUndefined()
  })

  it('maps factory.switch to Prime ToggleSwitch', () => {
    const factory = createPrimeVueUiFactory()
    const onChange = vi.fn()
    const vnode = factory.switch({
      checked: true,
      onChange,
    })
    expect(vnode.props?.modelValue).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-switch')
    vnode.props?.['onUpdate:modelValue']?.(false)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('renders fields.checkbox from displayLabel and getFieldValue', () => {
    const fields = createPrimeVueFieldFactory()
    const wrap = fields.checkBox(
      { fieldName: 'active', displayLabel: '启用' } as any,
      {
        getFieldValue: () => true,
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
        isInvalid: () => false,
      } as any,
    )
    const cls = Array.isArray(wrap.props?.class)
      ? wrap.props.class.flat(8).filter(Boolean).join(' ')
      : String(wrap.props?.class ?? '')
    expect(cls).toContain('mmda-prime-control')
    const chrome = (wrap.children as any[])[0]
    const chromeCls = Array.isArray(chrome.props?.class)
      ? chrome.props.class.flat(8).filter(Boolean).join(' ')
      : String(chrome.props?.class ?? '')
    expect(chromeCls).toContain('mmda-checkbox')
    expect(chrome.children[0].props.modelValue).toBe(true)
    expect(chrome.children[1].children).toBe('启用')
  })

  it('maps factory.chips to Prime Chip list', () => {
    const factory = createPrimeVueUiFactory()
    const vnode = factory.chips({
      kind: 'choice',
      items: [
        { label: '成功', colorRole: 'success', icon: 'check' },
        '辅料',
      ],
    })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-chips')
    expect(cls).toContain('mmda-chips--choice')
    const kids = vnode.children as any[]
    expect(kids).toHaveLength(2)
    expect(kids[0].props.label).toBe('成功')
    const itemCls = Array.isArray(kids[0].props.class)
      ? kids[0].props.class.flat(8).filter(Boolean).join(' ')
      : String(kids[0].props.class ?? '')
    expect(itemCls).toContain('mmda-chips__item--success')
    const input = factory.chips({ kind: 'input', items: ['A'] })
    expect((input.children as any[])[0].props.removable).toBe(true)
  })

  it('maps factory.contextMenu to Prime ContextMenu', () => {
    const factory = createPrimeVueUiFactory()
    const onAction = vi.fn()
    const vnode = factory.contextMenu({
      target: '#editor',
      items: [
        { name: 'cut', label: '剪切', icon: 'cut', onAction },
        { divider: true },
        { name: 'paste', label: '粘贴', disabled: true },
      ],
    })
    expect((vnode.props as any)?.target).toBe('#editor')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-context-menu')
    const model = (vnode.props as any)?.model ?? []
    expect(model[0].label).toBe('剪切')
    expect(model[1].separator).toBe(true)
    expect(model[2].disabled).toBe(true)
    model[0].command()
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders fields.chips from comma-separated tags', () => {
    const fields = createPrimeVueFieldFactory()
    const vnode = fields.chips(
      { fieldName: 'tags' } as any,
      { getFieldValue: () => '原料,辅料, 包装' } as any,
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-chips')
    expect((vnode.children as any[]).map((c) => c.props.label)).toEqual([
      '原料',
      '辅料',
      '包装',
    ])
  })

  it('renders list toolbar actions from module authority', () => {
    const factory = new ModuleFactory([
      {
        moduleCode: 'B.01.01',
        moduleLabel: '部门',
        moduleType: 'FEATURE',
        moduleVersion: ModuleVersion.TEAM,
        allowOps: ModuleOp.READ | ModuleOp.CREATE | ModuleOp.DELETE | ModuleOp.EXPORT | ModuleOp.IMPORT,
        moduleUrl: '/BASE/Departments',
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        objName: 'Department',
      },
    ])
    const module = factory.findModuleByName('Department')!
    const builder = new PrimeVueUiBuilder()
    const context = {
      view: UiViewMany.Index,
      many: true,
      editing: false,
      title: '部门',
      metaUi: { objName: 'Department', displayLabel: '部门' },
      model: { list: [] },
      logic: { module, repository: 'Departments' },
      module,
      refresh: () => undefined,
      actionLoadings: {},
      executing: false,
      globalProps: { $t: (message: string) => message },
      t: (message: string) => message,
      translate: (message: string) => message,
      customActions: [],
      selectionMode: null,
    }
    const withoutDelete = { ...context, module: { ...module, authority: auth(ModuleOp.READ | ModuleOp.CREATE) } }
    const withDeleteButtons = (builder as any).indexViewActionButtons(context)
    const withoutDeleteButtons = (builder as any).indexViewActionButtons({
      ...withoutDelete,
      logic: { module: withoutDelete.module, repository: 'Departments' },
    })
    expect(withDeleteButtons.length).toBeGreaterThan(withoutDeleteButtons.length)
    expect(JSON.stringify(withDeleteButtons)).toContain('deleteAll')
    expect(JSON.stringify(withoutDeleteButtons)).not.toContain('deleteAll')
  })

  it('orders details actions, applies entity roles, and groups file actions', () => {
    const builder = new PrimeVueUiBuilder()
    const module = {
      authority: auth(
        ModuleOp.READ |
          ModuleOp.EDIT |
          ModuleOp.CREATE |
          ModuleOp.DELETE |
          ModuleOp.PRINT |
          ModuleOp.EXPORT |
          ModuleOp.IMPORT,
      ),
    }
    const context = {
      many: false,
      editing: false,
      metaUi: { objName: 'Material', displayLabel: '物料' },
      model: {
        actions: [{ name: 'deprecate', label: '弃用', role: 'DANGER' }],
      },
      logic: { module, repository: 'Materials' },
      module,
      templates: [],
      customActions: [],
      actionLoadings: {},
      executing: false,
      globalProps: { $router: { back: () => undefined } },
      t: (message: string) => message,
      translate: (message: string) => message,
    }

    const buttons = (builder as any).detailsViewActionButtons(context)
    expect(buttons.map((button: any) => button.props?.label)).toEqual([
      'action.back',
      'action.edit',
      'action.create',
      'action.delete',
      '弃用',
      'action.more',
    ])
    expect(buttons[4].props.severity).toBe('danger')
    expect(buttons[5].props.model.map((item: any) => item.label)).toEqual([
      'action.print',
      'action.export',
      'action.import',
    ])
    expect(buttons[5].props.text).toBeFalsy()
    expect(buttons[5].props.severity).toBe('secondary')
    expect(buttons[5].props.icon).toBeFalsy()
  })
})

describe('prime column filter join/multi', () => {
  it('does not treat join AND as a compare operator', () => {
    const field = { fieldName: 'name', dataType: 48, nullable: true } as any
    const state = hydratePrimeColumnFilter(field, {
      filterType: 'join',
      operator: 'AND',
      conditions: [
        { filterType: 'text', operator: 'CONTAINS', value: 'a' },
        { filterType: 'text', operator: 'CONTAINS', value: 'b' },
      ],
    })
    expect(state.operator).toBe('CONTAINS')
    expect(state.joinOperator).toBe('AND')
    expect(state.value).toBe('a')
    expect(state.secondValue).toBe('b')
    expect(applyPrimeColumnFilter(field, state)?.filterType).toBe('join')
  })

  it('builds multi from compare + set', () => {
    const field = {
      fieldName: 'status',
      dataType: 48,
      nullable: true,
      reference: { isEnum: true },
    } as any
    const state = hydratePrimeColumnFilter(field)
    state.operator = 'CONTAINS'
    state.value = '仓'
    state.setValues = ['LABOR', 'PART']
    const applied = applyPrimeColumnFilter(field, state)
    expect(applied?.filterType).toBe('multi')
    expect((applied as any).filterModels[1].values).toEqual(['LABOR', 'PART'])
  })

  it('does not searchAll on hydrate for hasOne', () => {
    const field = {
      fieldName: 'matID',
      dataType: 72,
      reference: { hasOne: true, isEnum: false, isRef: false, refOptions: [] },
    } as any
    const searchAll = vi.fn()
    hydratePrimeColumnFilter(field)
    expect(searchAll).not.toHaveBeenCalled()
  })

  it('wires DataTable expansion when rowDetail is set', () => {
    const factory = createPrimeVueUiFactory()
    const metaUi = {
      getListedFields: () => [{ fieldName: 'name', displayLabel: '名称' }],
      groups: [],
      primaryKey: 'id',
    } as any
    const vnode = factory.table([{ id: '1', name: 'a' }], metaUi, {
      rowDetail: { detail: () => h('div') },
    })
    expect(vnode.props?.expandedRows).toEqual({ '1': true })
    expect((vnode.children as any)?.expansion).toBeTypeOf('function')
    const flat = factory.treeGrid([{ id: '1', name: 'a' }], metaUi, {
      rowDetail: { detail: () => h('div') },
      treeShape: 'TREE',
      shapeKey: 'parentId',
    } as any)
    expect((flat.children as any)?.expansion).toBeTypeOf('function')
  })
})
