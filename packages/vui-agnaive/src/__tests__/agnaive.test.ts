import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { h } from 'vue'
import {
  MetaUi,
  MetaUiField,
  MetaUiGroup,
  ModuleFactory,
  SqlDataType,
  auth,
} from '@mmda/core'
import { UiViewMany } from '@mmda/vui'
import { AgNaiveUiBuilder } from '../agnaive_builder'
import { createAgNaiveFieldFactory } from '../agnaive_field_factory'
import { createAgNaiveUiFactory } from '../agnaive_factory'
import { agNaiveLayout } from '../agnaive_layout'
import { agFilterModelToEntity, entityFilterToAgModel } from '../ag_filter'
import { buildColumnDefs } from '../ag_columns'
import { AgGrid } from '../components/AgGrid'
import {
  buildAgGridTheme,
  cssColorToHex,
  naiveOverridesRef,
  naiveSkinState,
} from '../agnaive_theme'

const field = (
  fieldName: string,
  displayLabel: string,
  dataType = SqlDataType.NVARCHAR,
) =>
  new MetaUiField({
    fieldName,
    displayLabel,
    dataType,
    nullable: true,
    fieldIdx: 0,
    listed: true,
  })

const productMeta = () =>
  new MetaUi({
    objName: 'Product',
    displayLabel: '商品',
    primaryKey: 'id',
    uniqueKey: 'name',
    groups: [
      {
        groupName: 'base',
        groupLabel: '基本信息',
        many: false,
        fields: [
          field('code', '编码'),
          field('name', '名称'),
          field('price', '价格', SqlDataType.DECIMAL),
          field('enabled', '启用', SqlDataType.BIT),
        ],
      },
    ],
  })

describe('vui-agnaive skin', () => {
  it('implements the vui factory and layout contracts', () => {
    const factory = createAgNaiveUiFactory()
    expect(factory.layout).toBe(agNaiveLayout)
    expect(factory.table).toBeTypeOf('function')
    expect(factory.grid).toBeTypeOf('function')
    expect(factory.dialog).toBeUndefined()
    expect((factory as any).diagram).toBeUndefined()
    expect(factory.splitter).toBeTypeOf('function')
    expect(factory.tabs).toBeTypeOf('function')
    expect(factory.toolbar).toBeTypeOf('function')
    expect(factory.tree).toBeTypeOf('function')
    expect(factory.paginator).toBeTypeOf('function')
    expect(factory.nativeInplaceEdit).toBe(true)
    expect(factory.defaultFilterDisplay).toBeUndefined()
    expect(factory.formField).toBeTypeOf('function')
    expect(factory.formItem).toBeUndefined()
    expect(factory.toggleSwitch).toBeUndefined()
    expect(factory.checkbox).toBeUndefined()
    expect(factory.resolveIcon('save')).toBe('fas fa-check')
    expect(factory.inplaceEditor).toBeTypeOf('function')
  })

  it('maps factory.badge colorRole and circle shape', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.badge({
      value: 10,
      colorRole: 'primary',
      shape: 'circle',
    })
    expect(vnode.props?.value).toBe(10)
    expect(vnode.props?.type).toBe('primary')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-badge--circle')
  })

  it('maps factory.avatar circle large label', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.avatar({
      label: 'GR',
      shape: 'circle',
      size: 'large',
    })
    expect(vnode.props?.round).toBe(true)
    expect(vnode.props?.size).toBe('large')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-avatar--circle')
  })

  it('maps factory.card surface, colorRole, image, headerImage, divider', () => {
    const factory = createAgNaiveUiFactory()
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
    expect(vnode.props?.bordered).toBe(true)
    const slots = vnode.children as Record<string, () => unknown>
    const cover = slots.cover?.()
    const coverList = Array.isArray(cover) ? cover : [cover]
    expect(
      coverList.some(
        (node: any) => node?.type === 'img' && node?.props?.src === '/cover.png',
      ),
    ).toBe(true)
    const header = slots.header?.()
    const walk = (node: any): any[] => {
      if (!node) return []
      const kids = Array.isArray(node.children) ? node.children.flatMap(walk) : []
      return [node, ...kids]
    }
    expect(
      walk(header).some(
        (node: any) =>
          node?.type === 'img' &&
          node?.props?.src === '/face.png' &&
          String(node?.props?.class ?? '').includes('mmda-card-header-image'),
      ),
    ).toBe(true)
    const body = slots.default?.()
    const bodyList = Array.isArray(body) ? body : [body]
    expect(
      bodyList.some((node: any) => {
        const c = Array.isArray(node?.props?.class)
          ? node.props.class.flat(8).filter(Boolean).join(' ')
          : String(node?.props?.class ?? '')
        return c.includes('mmda-divider')
      }),
    ).toBe(true)
  })

  it('maps factory.divider orientation and label', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.divider({
      orientation: 'vertical',
      label: '或',
    })
    expect(vnode.props?.vertical).toBe(true)
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
    const factory = createAgNaiveUiFactory()
    const onChange = vi.fn()
    const vnode = factory.colorPicker({
      value: '#035a',
      mode: 'palette',
      showModeSwitcher: false,
      onChange,
    })
    expect(vnode.props?.value).toBe('#035a')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-colorpicker')
    expect(cls).toContain('mmda-colorpicker--palette')
    vnode.props?.['onUpdate:value']?.('rgba(123, 31, 162, 1)')
    expect(onChange).toHaveBeenCalledWith('#7b1fa2')
  })

  it('maps factory.maskedTextBox to NInput without live mask', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.maskedTextBox({
      mask: '000 0000 0000',
      value: '13800138000',
    })
    expect(vnode.props?.placeholder).toBe('000 0000 0000')
    expect(vnode.props?.value).toBe('13800138000')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-maskedtextbox')
  })

  it('maps factory.oneTimePasswordInput to a row of NInput cells', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.oneTimePasswordInput({
      length: 4,
      type: 'number',
      value: '12',
    })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-otpinput')
    expect(vnode.children?.length).toBe(4)
  })

  it('maps factory.queryBuilder to QueryBuilderHost', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.queryBuilder({
      columns: [{ fieldName: 'age', label: 'Age', valueType: 'number' }],
    })
    const qbClass = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(qbClass).toContain('mmda-querybuilder')
  })

  it('maps factory.slider Range to NSlider range', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.slider({
      type: 'Range',
      value: [10, 40],
      min: 0,
      max: 50,
    })
    expect(vnode.props?.range).toBe(true)
    expect(vnode.props?.value).toEqual([10, 40])
    const sliderClass = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(sliderClass).toContain('mmda-slider--range')
  })

  it('maps factory.rating itemsCount to NRate count', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.rating({
      value: 2,
      itemsCount: 5,
      readOnly: true,
    })
    expect(vnode.props?.count).toBe(5)
    expect(vnode.props?.readonly).toBe(true)
    expect(vnode.props?.value).toBe(2)
    const ratingClass = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(ratingClass).toContain('mmda-rating')
  })

  it('maps factory.sidebar and drawer to NDrawer', () => {
    const factory = createAgNaiveUiFactory()
    const sidebar = factory.sidebar({ isOpen: true, type: 'Push', enableDock: true })
    expect(sidebar.props?.show).toBe(true)
    expect(sidebar.props?.placement).toBe('left')
    const sidebarClass = Array.isArray(sidebar.props?.class)
      ? sidebar.props.class.flat(8).filter(Boolean).join(' ')
      : String(sidebar.props?.class ?? '')
    expect(sidebarClass).toContain('mmda-sidebar--push')
    expect(sidebarClass).toContain('mmda-sidebar--dock')
    const drawer = factory.drawer({ isOpen: true })
    expect(drawer.props?.mask).toBe(true)
    const drawerClass = Array.isArray(drawer.props?.class)
      ? drawer.props.class.flat(8).filter(Boolean).join(' ')
      : String(drawer.props?.class ?? '')
    expect(drawerClass).toContain('mmda-sidebar--drawer')
    expect(drawerClass).toContain('mmda-sidebar--over')
  })

  it('maps factory.tabs value and Naive placement', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.tabs({
      items: [
        { header: 'One', content: 'a' },
        { header: 'Two', content: 'b' },
      ],
      value: 1,
      headerPlacement: 'Left',
      scrollable: false,
    })
    expect(vnode.props?.value).toBe(1)
    expect(vnode.props?.placement).toBe('left')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-tabs')
    expect(cls).toContain('mmda-tabs--left')
    expect(cls).toContain('mmda-tabs--popup')
    expect(cls).toContain('mmda-tabs--fill')
  })

  it('maps factory.toolbar slots and align', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.toolbar(
      { layout: 'medium', align: { end: 'left' } },
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
    expect(cls).toContain('mmda-toolbar--medium')
    const kids = vnode.children as any[]
    const endCls = Array.isArray(kids[2].props.class)
      ? kids[2].props.class.flat(8).filter(Boolean).join(' ')
      : String(kids[2].props.class ?? '')
    expect(endCls).toContain('mmda-toolbar__end--left')
  })

  it('maps factory.splitter orientation to NSplit direction', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.splitter(
      [
        { content: h('span', 'L'), size: '16rem' },
        { content: h('span', 'R') },
      ],
      { orientation: 'Vertical', enableReversePanes: true },
    )
    expect(vnode.props?.direction).toBe('vertical')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-splitter')
    expect(cls).toContain('mmda-splitter--vertical')
    expect(cls).toContain('mmda-splitter--reverse')
  })

  it('maps factory.numberInput precision and value', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.numberInput({
      value: 12.5,
      decimals: 2,
      showSpinButton: false,
    })
    expect(vnode.props?.value).toBe(12.5)
    expect(vnode.props?.precision).toBe(2)
    expect(vnode.props?.showButton).toBe(false)
    expect(vnode.props?.step).toBe(1)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-numberinput')
  })

  it('maps factory.textArea value to NInput textarea', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.textArea({
      value: 'hello',
      rows: 5,
      resizeMode: 'None',
      autoResize: true,
    } as any)
    expect(vnode.props?.type).toBe('textarea')
    expect(vnode.props?.value).toBe('hello')
    expect(vnode.props?.rows).toBe(5)
    expect(vnode.props?.autosize).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-textarea')
    expect(cls).toContain('mmda-textarea--none')
  })

  it('maps factory.textInput value placeholder and clearable', () => {
    const factory = createAgNaiveUiFactory()
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const vnode = factory.textInput({
      value: 'hello',
      placeholder: 'hint',
      type: 'Password',
      showClearButton: true,
      onFocus,
      onBlur,
    })
    expect(vnode.props?.value).toBe('hello')
    expect(vnode.props?.placeholder).toBe('hint')
    expect(vnode.props?.type).toBe('password')
    expect(vnode.props?.clearable).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-textinput')
    vnode.props?.onFocus?.()
    vnode.props?.onBlur?.()
    expect(onFocus).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('maps factory.progressBar percentage and circular type', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.progressBar({
      value: 42,
      kind: 'circular',
    })
    expect(vnode.props?.percentage).toBe(42)
    expect(vnode.props?.type).toBe('circle')
  })

  it('maps factory.signaturePad host class', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.signaturePad({
      value: '',
    })
    expect(vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type)).toMatch(
      /Signature/,
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-signature-pad')
  })

  it('maps factory.stepper current and vertical', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.stepper({
      value: 1,
      orientation: 'vertical',
      items: [{ label: '甲' }, { label: '乙' }],
    })
    expect(vnode.props?.current).toBe(1)
    expect(vnode.props?.vertical).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-stepper--vertical')
  })

  it('maps factory.skeleton text to NSkeleton text', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.skeleton({
      shape: 'text',
      width: '100%',
      height: 32,
      shimmer: 'none',
    })
    expect(vnode.props?.text).toBe(true)
    expect(vnode.props?.avatar).toBe(false)
    expect(vnode.props?.animated).toBe(false)
    expect(vnode.props?.height).toBe(32)
  })

  it('maps factory.loading to NSpin', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.loading({ label: '加载中', size: 'small' })
    expect(vnode.props?.size).toBe('small')
    expect(vnode.props?.description).toBe('加载中')
    expect(String(vnode.type?.name ?? vnode.type?.__name ?? vnode.type)).toMatch(
      /Spin/i,
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-loading')
  })

  it('maps factory.tree to NaiveTree with mmda-tree', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.tree({
      data: [{ id: '1', label: '根' }],
      selectionMode: 'checkbox',
    })
    expect(vnode.type?.name ?? vnode.type?.__name).toBe('NaiveTree')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-tree')
    expect(cls).toContain('mmda-tree--checkbox')
  })

  it('maps factory.speechToText lang and interim onto the host', () => {
    const factory = createAgNaiveUiFactory()
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

  it('maps factory.radioButtonGroup NRadioGroup value', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.radioButtonGroup({
      value: 'b',
      name: 'kind',
      options: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
    })
    expect(vnode.props?.value).toBe('b')
    expect(vnode.props?.name).toBe('kind')
    expect(vnode.props?.['onUpdate:value']).toBeTypeOf('function')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-radiobuttongroup')
  })

  it('maps factory.datePicker format, Monday week, and no typing', () => {
    const factory = createAgNaiveUiFactory()
    const onChange = vi.fn()
    const day = new Date(2026, 8, 7)
    const vnode = factory.datePicker({
      value: day,
      onChange,
    })
    expect(vnode.props?.format).toBe('YYYY-MM-DD')
    expect(vnode.props?.inputReadonly).toBe(true)
    expect(vnode.props?.firstDayOfWeek).toBe(0)
    expect(vnode.props?.type).toBe('date')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-datepicker')
    vnode.props?.['onUpdate:value']?.(day.getTime())
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date)
    const month = factory.monthPicker({ value: day })
    expect(month.props?.type).toBe('month')
    expect(month.props?.format).toBe('YYYY-MM')
    const start = new Date(2026, 8, 1)
    const end = new Date(2026, 8, 7)
    const range = factory.dateRangePicker({ value: [start, end] })
    expect(range.props?.type).toBe('daterange')
    expect(range.props?.value).toHaveLength(2)
  })

  it('maps factory.dropDownList options, group, and onChange', () => {
    const factory = createAgNaiveUiFactory()
    const onChange = vi.fn()
    const vnode = factory.dropDownList({
      value: 'a',
      options: [
        { value: 'a', label: '甲', group: 'G', icon: 'flag' },
        { value: 'b', label: '乙', group: 'G' },
      ],
      onChange,
    })
    expect(vnode.props?.value).toBe('a')
    expect(vnode.props?.options?.[0]?.type).toBe('group')
    expect(vnode.props?.options?.[0]?.children?.[0]).toMatchObject({
      value: 'a',
      label: '甲',
      icon: 'flag',
    })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-dropdown-list')
    vnode.props?.['onUpdate:value']?.('b')
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('maps factory.multiSelect multiple keys', () => {
    const factory = createAgNaiveUiFactory()
    const onChange = vi.fn()
    const vnode = factory.multiValueSelect({
      value: ['a'],
      options: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      onChange,
    })
    expect(vnode.props?.multiple).toBe(true)
    expect(vnode.props?.value).toEqual(['a'])
    vnode.props?.['onUpdate:value']?.(['a', 'b'])
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('maps factory.tagAutoComplete tag select', () => {
    const factory = createAgNaiveUiFactory()
    const onUpdate = vi.fn()
    const vnode = factory.tagAutoComplete('a', { options: ['a'], onUpdate })
    expect(vnode.props?.tag).toBe(true)
    expect(vnode.props?.multiple).toBe(true)
    vnode.props?.['onUpdate:value']?.(['a', 'b'])
    expect(onUpdate).toHaveBeenCalledWith('a,b')
  })

  it('maps factory.treeSelect multiple value and hook class', () => {
    const factory = createAgNaiveUiFactory()
    const onChange = vi.fn()
    const vnode = factory.treeSelect({
      value: 'a',
      data: [{ id: 'a', label: '甲' }],
      fields: { id: 'id', label: 'label' },
      selectionMode: 'checkbox',
      onChange,
    })
    expect(vnode.props?.value).toEqual(['a'])
    expect(vnode.props?.multiple).toBe(true)
    expect(vnode.props?.checkable).toBe(true)
    expect(vnode.props?.filterable).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-tree-select')
    expect(factory.dropDownTree).toBe(factory.treeSelect)
    vnode.props?.['onUpdate:value']?.(['a', 'b'])
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('maps factory.comboBox custom AutoComplete vs closed Select', () => {
    const factory = createAgNaiveUiFactory()
    const custom = factory.comboBox({ value: 't', options: ['a'] })
    const cls = Array.isArray(custom.props?.class)
      ? custom.props.class.flat(8).filter(Boolean).join(' ')
      : String(custom.props?.class ?? '')
    expect(cls).toContain('mmda-combobox')
    expect(cls).toContain('mmda-combobox--custom')
    const closed = factory.comboBox({
      value: 'a',
      options: ['a'],
      allowCustom: false,
    })
    expect(closed.props?.filterable).toBe(true)
    const closedCls = Array.isArray(closed.props?.class)
      ? closed.props.class.flat(8).filter(Boolean).join(' ')
      : String(closed.props?.class ?? '')
    expect(closedCls).not.toContain('mmda-combobox--custom')
  })

  it('maps factory.barcode format class', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.barcode({ value: '123', format: 'code39' })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-barcode--code39')
  })

  it('does not draw QR for dataMatrix', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.qrCode({ value: 'SYNC123', format: 'dataMatrix' })
    expect(vnode.type).toBe('span')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-qrcode--unsupported')
    expect(vnode.children).toBe('SYNC123')
  })

  it('maps factory.breadcrumb items', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.breadcrumb({
      items: [
        { label: '组织', to: '/org' },
        { label: '部门' },
      ],
      separator: '>',
    })
    expect(vnode.type).toBe('nav')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-breadcrumb')
    const kids = vnode.children as any[]
    expect(kids).toHaveLength(2)
    expect(kids[1].children?.[0]?.children).toBe('>')
  })

  it('maps factory.calendar to a date panel', () => {
    const factory = createAgNaiveUiFactory()
    const values = [new Date(2020, 0, 1), new Date(2020, 0, 15)]
    const vnode = factory.calendar({
      value: values,
      selectionMode: 'multiple',
      firstDayOfWeek: 1,
    })
    expect((vnode.props as any)?.panel).toBe(true)
    expect((vnode.props as any)?.type).toBe('dates')
    expect((vnode.props as any)?.firstDayOfWeek).toBe(1)
    expect(Array.isArray((vnode.props as any)?.value)).toBe(true)
    expect((vnode.props as any)?.value).toHaveLength(2)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-calendar')
  })

  it('maps factory.carousel to NCarousel', () => {
    const factory = createAgNaiveUiFactory()
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
    expect((vnode.props as any)?.defaultIndex).toBe(1)
    expect((vnode.props as any)?.autoplay).toBe(true)
    expect((vnode.props as any)?.interval).toBe(4000)
    expect((vnode.props as any)?.loop).toBe(true)
    expect((vnode.props as any)?.effect).toBe('fade')
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-carousel')
    const slides =
      typeof (vnode.children as any)?.default === 'function'
        ? (vnode.children as any).default()
        : vnode.children
    expect(slides).toHaveLength(2)
  })

  it('maps factory.checkBox to NCheckbox', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.checkBox({
      checked: true,
      label: '同意条款',
      indeterminate: true,
    })
    expect((vnode.props as any)?.checked).toBe(true)
    expect((vnode.props as any)?.indeterminate).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-checkbox')
    expect(cls).toContain('mmda-checkbox--indeterminate')
    const label =
      typeof (vnode.children as any)?.default === 'function'
        ? (vnode.children as any).default()
        : vnode.children
    expect(label).toBe('同意条款')
    const omitted = factory.checkBox({ checked: false, label: '未半选' })
    expect((omitted.props as any)?.indeterminate).toBeUndefined()
  })

  it('maps factory.switch to NSwitch', () => {
    const factory = createAgNaiveUiFactory()
    const onChange = vi.fn()
    const vnode = factory.switch({
      checked: true,
      onChange,
    })
    expect((vnode.props as any)?.value).toBe(true)
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-switch')
    vnode.props?.['onUpdate:value']?.(false)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('renders fields.checkbox from displayLabel and getFieldValue', () => {
    const fields = createAgNaiveFieldFactory()
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
    expect(cls).toContain('mmda-agnaive-control')
    const chrome = (wrap.children as any[])[0]
    const chromeCls = Array.isArray(chrome.props?.class)
      ? chrome.props.class.flat(8).filter(Boolean).join(' ')
      : String(chrome.props?.class ?? '')
    expect(chromeCls).toContain('mmda-checkbox')
    expect(chrome.props.checked).toBe(true)
    const label =
      typeof chrome.children?.default === 'function'
        ? chrome.children.default()
        : chrome.children
    expect(label).toBe('启用')
  })

  it('maps factory.chips to NTag list', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.chips({
      kind: 'filter',
      items: [{ label: '成功', colorRole: 'success' }, '辅料'],
    })
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-chips')
    expect(cls).toContain('mmda-chips--filter')
    const kids = vnode.children as any[]
    expect(kids).toHaveLength(2)
    expect(kids[0].props.type).toBe('success')
    expect(kids[0].props.checkable).toBe(true)
    const input = factory.chips({ kind: 'input', items: ['A'] })
    expect((input.children as any[])[0].props.closable).toBe(true)
  })

  it('maps factory.contextMenu to Naive dropdown host', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.contextMenu({
      target: '#editor',
      items: [
        { name: 'cut', label: '剪切' },
        { divider: true },
        { name: 'paste', label: '粘贴', disabled: true },
      ],
    })
    expect(vnode.props?.menuProps?.target).toBe('#editor')
    expect(vnode.props?.menuProps?.items?.[0]?.label).toBe('剪切')
    expect(String(vnode.type?.name ?? vnode.type)).toMatch(/ContextMenu/)
  })

  it('renders fields.tags from comma-separated text', () => {
    const fields = createAgNaiveFieldFactory()
    const vnode = fields.tags(
      { fieldName: 'tags' } as any,
      { getFieldValue: () => '原料,辅料, 包装' } as any,
    )
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(' ')
      : String(vnode.props?.class ?? '')
    expect(cls).toContain('mmda-chips')
    const labels = (vnode.children as any[]).map((child) =>
      typeof child.children?.default === 'function'
        ? child.children.default()
        : child.children,
    )
    expect(labels.map((part: any) => (Array.isArray(part) ? part[0] : part))).toEqual([
      '原料',
      '辅料',
      '包装',
    ])
    expect(fields.chips).toBe(fields.tags)
  })

  it('registers old metadata editor aliases', () => {
    const fields = createAgNaiveFieldFactory()
    expect(fields.TextBox).toBe(fields.textInput)
    expect(fields.DropDownList).toBe(fields.dropDownList)
    expect(fields.dropdown).toBeUndefined()
    expect(fields.DatePicker).toBe(fields.datePicker)
    expect(fields.FileUpload).toBe(fields.fileUpload)
    expect(fields.FileUploader).toBe(fields.fileUploader)
    expect(fields.Url).toBe(fields.fileLink)
    expect(fields.HasOneText).toBe(fields.externalLink)
    expect(fields.hasOneText).toBe(fields.externalLink)
    expect(fields.CheckBox).toBe(fields.checkBox)
    expect(fields.associationTable).toBeUndefined()
    expect(fields.InplaceFieldEditor).toBe(fields.inplaceFieldEditor)
    expect(fields.BitChipSet).toBe(fields.bitChipSet)
    expect(fields.EnumChipSet).toBe(fields.enumChipSet)
    expect(fields.enumSetTags).toBeUndefined()
    expect(fields.BitTags).toBeUndefined()
  })

  it('constructs the builder against VueUiBuilder', () => {
    const builder = new AgNaiveUiBuilder()
    expect(builder.factory.layout.fieldMessage).toBe(false)
    expect(builder.buildAppScaffold()).toBeTruthy()
  })

  it('wraps actions in NButtonGroup', () => {
    const factory = createAgNaiveUiFactory()
    const group = factory.buttonGroup(() => [
      factory.button({ label: 'A' }),
      factory.button({ label: 'B' }),
    ])
    expect(String(group.type?.name ?? group.type)).toMatch(/ButtonGroup/)
    const select = factory.selectButtonGroup('a', {
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    })
    expect(String(select.type?.name ?? select.type)).toMatch(/ButtonGroup/)
    expect(select.type).not.toBeUndefined()
  })

  it('wraps table in AgGrid', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.table([], productMeta(), { selectionMode: 'multiple' })
    expect(vnode.type).toBe(AgGrid)
    expect(vnode.props?.metaUi.objName).toBe('Product')
  })

  it('passes rowDetail through factory.table', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.table([{ id: '1', code: 'P-001' }], productMeta(), {
      rowDetail: { detail: () => h('div') },
    })
    expect(vnode.props?.rowDetail).toBeTruthy()
    const flat = factory.treeGrid([{ id: '1', code: 'P-001' }], productMeta(), {
      rowDetail: { detail: () => h('div') },
      treeShape: 'TREE',
      shapeKey: 'parentId',
    })
    expect(flat.type).toBe(AgGrid)
    expect(flat.props?.treeData).toBe(false)
  })

  it('builds column defs from listed metadata', () => {
    const cols = buildColumnDefs(productMeta(), { filterDisplay: 'menu' })
    expect(cols.map(col => col.field)).toEqual(['code', 'name', 'price', 'enabled'])
    expect(cols.find(col => col.field === 'price')?.filter).toBe('agNumberColumnFilter')
    expect(cols.find(col => col.field === 'enabled')?.filter).toBe('agSetColumnFilter')
  })

  it('maps AG Grid FilterModel to EntityFilterModel and back', () => {
    const metaUi = productMeta()
    const entity = agFilterModelToEntity(
      {
        name: { filterType: 'text', type: 'contains', filter: 'demo' },
        price: { filterType: 'number', type: 'inRange', filter: 1, filterTo: 9 },
        enabled: { filterType: 'set', values: ['true'] },
      },
      metaUi,
    )
    expect(entity.name).toEqual({
      filterType: 'text',
      operator: 'CONTAINS',
      value: 'demo',
      valueTo: undefined,
    })
    expect(entity.price?.filterType).toBe('number')
    expect((entity.price as any).operator).toBe('BETWEEN')
    expect(entity.enabled).toEqual({
      filterType: 'set',
      values: ['true'],
      operator: 'IN',
    })
    const ag = entityFilterToAgModel(entity, metaUi)
    expect(ag.name.type).toBe('contains')
    expect(ag.price.type).toBe('inRange')
  })

  it('maps AG AND/OR conditions to join and back', () => {
    const metaUi = productMeta()
    const entity = agFilterModelToEntity(
      {
        name: {
          filterType: 'text',
          operator: 'AND',
          conditions: [
            { filterType: 'text', type: 'contains', filter: 'a' },
            { filterType: 'text', type: 'contains', filter: 'b' },
          ],
        },
      },
      metaUi,
    )
    expect(entity.name).toEqual({
      filterType: 'join',
      operator: 'AND',
      conditions: [
        {
          filterType: 'text',
          operator: 'CONTAINS',
          value: 'a',
          valueTo: undefined,
        },
        {
          filterType: 'text',
          operator: 'CONTAINS',
          value: 'b',
          valueTo: undefined,
        },
      ],
    })
    const ag = entityFilterToAgModel(entity, metaUi)
    expect(ag.name.operator).toBe('AND')
    expect(ag.name.conditions).toHaveLength(2)
    expect(ag.name.conditions[1].filter).toBe('b')
  })

  it('maps AG multi filterModels to multi and back', () => {
    const metaUi = productMeta()
    const entity = agFilterModelToEntity(
      {
        name: {
          filterType: 'multi',
          filterModels: [
            { filterType: 'text', type: 'contains', filter: '仓' },
            { filterType: 'set', values: ['OPEN', 'CLOSED'] },
          ],
        },
      },
      metaUi,
    )
    expect(entity.name?.filterType).toBe('multi')
    expect((entity.name as any).filterModels).toHaveLength(2)
    const ag = entityFilterToAgModel(entity, metaUi)
    expect(ag.name.filterType).toBe('multi')
    expect(ag.name.filterModels).toHaveLength(2)
    expect(ag.name.filterModels[1].values).toEqual(['OPEN', 'CLOSED'])
  })

  it('maps dateKind and does not turn THIS_MONTH into a calendar month token', () => {
    const created = field('createdAt', '创建', SqlDataType.TIMESTAMP)
    const metaUi = new MetaUi({
      objName: 'Order',
      displayLabel: '订单',
      primaryKey: 'id',
      groups: [
        {
          groupName: 'base',
          groupLabel: 'base',
          many: false,
          fields: [created],
        },
      ],
    })
    const entity = agFilterModelToEntity(
      {
        createdAt: { filterType: 'date', type: 'THIS_MONTH' },
      },
      metaUi,
    )
    expect(entity.createdAt).toEqual({
      filterType: 'date',
      operator: 'BETWEEN',
      dateKind: 'THIS_MONTH',
    })
    const ag = entityFilterToAgModel(entity, metaUi)
    expect(ag.createdAt.filterType).toBe('multi')
    expect(ag.createdAt.filterModels[0].type).toBe('THIS_MONTH')
  })

  it('uses treeList Set Filter for date columns', () => {
    const created = field('createdAt', '创建', SqlDataType.TIMESTAMP)
    const metaUi = new MetaUi({
      objName: 'Order',
      displayLabel: '订单',
      primaryKey: 'id',
      groups: [
        {
          groupName: 'base',
          groupLabel: 'base',
          many: false,
          fields: [created],
        },
      ],
    })
    const cols = buildColumnDefs(metaUi, { filterDisplay: 'menu' })
    expect(cols[0]?.filter).toBe('agMultiColumnFilter')
    const setFilter = cols[0]?.filterParams?.filters?.find(
      (item: { filter?: string }) => item.filter === 'agSetColumnFilter',
    )
    expect(setFilter?.filterParams?.treeList).toBe(true)
    const dateFilter = cols[0]?.filterParams?.filters?.[0]
    expect(dateFilter?.filter).toBe('agDateColumnFilter')
    expect(dateFilter?.filterParams?.filterOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ displayKey: 'THIS_MONTH' }),
        expect.objectContaining({ displayKey: 'TOMORROW' }),
      ]),
    )
  })

  it('uses Set Filter for enum options from refOptions via valueOf', () => {
    const status = new MetaUiField({
      fieldName: 'status',
      displayLabel: '状态',
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      fieldIdx: 0,
      listed: true,
      selectOptions: 'OPEN;OPEN;打开|CLOSED;CLOSED;关闭',
    })
    const metaUi = new MetaUi({
      objName: 'Ticket',
      displayLabel: '工单',
      primaryKey: 'id',
      groups: [
        {
          groupName: 'base',
          groupLabel: 'base',
          many: false,
          fields: [status],
        },
      ],
    })
    const cols = buildColumnDefs(metaUi, {})
    expect(cols[0]?.filter).toBe('agSetColumnFilter')
    const valuesFn = cols[0]?.filterParams?.values as Function
    let received: unknown[] = []
    valuesFn({
      success: (values: unknown[]) => {
        received = values
      },
    })
    expect(received).toEqual(['OPEN', 'CLOSED'])
    expect(cols[0]?.filterParams?.valueFormatter({ value: 'OPEN' })).toBe('打开')
  })

  it('explicit filterTypes SET on string overrides text/multi infer', () => {
    const name = new MetaUiField({
      fieldName: 'name',
      displayLabel: '名称',
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      fieldIdx: 0,
      listed: true,
      filterTypes: 16, // SET
    })
    const metaUi = new MetaUi({
      objName: 'Item',
      displayLabel: '物料',
      primaryKey: 'id',
      groups: [
        {
          groupName: 'base',
          groupLabel: 'base',
          many: false,
          fields: [name],
        },
      ],
    })
    const cols = buildColumnDefs(metaUi, { filterDisplay: 'menu' })
    expect(cols[0]?.filter).toBe('agSetColumnFilter')
  })

  it('uses Set Filter for ref/hasOne from refOptions, not page distinct', () => {
    const warehouse = new MetaUiField({
      fieldName: 'whID',
      displayLabel: '仓库',
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      fieldIdx: 0,
      listed: true,
      selectOptions: 'REF Warehouse(whID,whName)',
    })
    const metaUi = new MetaUi({
      objName: 'Stock',
      displayLabel: '库存',
      primaryKey: 'id',
      groups: [
        {
          groupName: 'base',
          groupLabel: 'base',
          many: false,
          fields: [warehouse],
        },
      ],
    })
    const listed = metaUi.getListedFields()[0]!
    listed.reference!.refOptions.splice(
      0,
      listed.reference!.refOptions.length,
      { whID: 'W1', whName: '主仓' },
      { whID: 'W2', whName: '辅仓' },
    )
    const loadFilterOptions = vi.fn()
    const cols = buildColumnDefs(metaUi, { loadFilterOptions })
    expect(cols[0]?.filter).toBe('agSetColumnFilter')
    let received: unknown[] = []
    ;(cols[0]?.filterParams?.values as Function)({
      success: (values: unknown[]) => {
        received = values
      },
    })
    expect(received).toEqual(['W1', 'W2'])
    expect(loadFilterOptions).not.toHaveBeenCalled()
    expect(cols[0]?.filterParams?.valueFormatter({ value: 'W1' })).toBe('主仓')
  })

  it('uses searchable hasOne filter instead of dumping Set on mount', async () => {
    const material = new MetaUiField({
      fieldName: 'matID',
      displayLabel: '物料',
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      fieldIdx: 0,
      listed: true,
      selectOptions: 'HAS_ONE Material(matID,matName) AS material',
    })
    const metaUi = new MetaUi({
      objName: 'Order',
      displayLabel: '订单',
      primaryKey: 'id',
      groups: [
        {
          groupName: 'base',
          groupLabel: 'base',
          many: false,
          fields: [material],
        },
      ],
    })
    const loadFilterOptions = vi.fn(async (field: MetaUiField) => {
      field.reference!.refOptions.push({ matID: 'M1', matName: '螺丝' })
      return field.reference!.refOptions
    })
    const searchRelative = vi.fn(async () => [{ matID: 'M1', matName: '螺丝' }])
    const cols = buildColumnDefs(metaUi, { loadFilterOptions, searchRelative })
    expect(cols[0]?.filter).toBe('AgHasOneFilter')
    expect(cols[0]?.filterParams?.searchRelative).toBe(searchRelative)
    expect(loadFilterOptions).not.toHaveBeenCalled()
  })

  it('passes selection and filter callbacks through factory.table to AgGrid', () => {
    const factory = createAgNaiveUiFactory()
    const onFilterModelChange = vi.fn()
    const onSelectionChange = vi.fn()
    const vnode = factory.table([{ id: '1', code: 'P-001' }], productMeta(), {
      selectionMode: 'multiple',
      filterDisplay: 'menu',
      onFilterModelChange,
      onSelectionChange,
    })
    expect(vnode.type).toBe(AgGrid)
    expect(vnode.props?.selectionMode).toBe('multiple')
    expect(vnode.props?.onFilterModelChange).toBe(onFilterModelChange)
    expect(vnode.props?.onSelectionChange).toBe(onSelectionChange)
  })

  it('does not pull NDataTable or page-row distinct into the skin', () => {
    const sources = [
      'src/agnaive_factory.ts',
      'src/ag_columns.ts',
      'src/ag_filter.ts',
      'src/components/AgGrid.ts',
    ].map(file => readFileSync(resolve(process.cwd(), file), 'utf8'))
    const joined = sources.join('\n')
    expect(joined).not.toContain('NDataTable')
    expect(joined).not.toContain('NDataGrid')
    expect(joined).not.toContain('getDistinct')
    expect(joined).not.toContain('mmdaFilterLabel')
  })

  it('converts computed rgb colors to hex for Naive themeOverrides', () => {
    expect(cssColorToHex('rgb(103, 80, 164)', '#000')).toBe('#6750a4')
    expect(cssColorToHex('#abc', '#000')).toBe('#aabbcc')
  })

  it('rebuilds Naive overrides and AG Grid theme when dark mode changes', () => {
    naiveSkinState.dark = false
    naiveSkinState.themeRev += 1
    const lightOverrides = naiveOverridesRef.value
    const lightGrid = buildAgGridTheme()
    naiveSkinState.dark = true
    naiveSkinState.themeRev += 1
    const darkOverrides = naiveOverridesRef.value
    const darkGrid = buildAgGridTheme()
    expect(darkOverrides).not.toBe(lightOverrides)
    expect(darkGrid).not.toBe(lightGrid)
    expect(darkOverrides.Input?.border).toMatch(/1px solid/)
    expect(lightOverrides.Input?.border).toMatch(/1px solid/)
    naiveSkinState.dark = false
  })

  it('renders list toolbar actions from module authority', () => {
    const factory = new ModuleFactory([
      {
        moduleCode: 'B.01.01',
        moduleLabel: '部门',
        moduleType: 'FEATURE',
        moduleVersion: 2,
        allowOps: 1 | 4 | 8 | 32 | 64,
        moduleUrl: '/BASE/Departments',
        requiredCreateParam: false,
        status: 'RELEASED' as any,
        divider: false,
        objName: 'Department',
      },
    ])
    const module = factory.findModuleByName('Department')!
    const builder = new AgNaiveUiBuilder()
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
    const withoutDelete = {
      ...context,
      module: { ...module, authority: auth(1 | 4) },
    }
    const withDeleteButtons = (builder as any).indexViewActionButtons(context)
    const withoutDeleteButtons = (builder as any).indexViewActionButtons({
      ...withoutDelete,
      logic: { module: withoutDelete.module, repository: 'Departments' },
    })
    expect(withDeleteButtons.length).toBeGreaterThan(withoutDeleteButtons.length)
    expect(JSON.stringify(withDeleteButtons)).toContain('deleteAll')
    expect(JSON.stringify(withoutDeleteButtons)).not.toContain('deleteAll')
  })

  it('orders details actions and groups file actions', () => {
    const builder = new AgNaiveUiBuilder()
    const module = {
      authority: auth(1 | 2 | 4 | 8 | 16 | 32 | 64),
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
  })

  it('defaults group cards to MmdaGroupCard', () => {
    const builder = new AgNaiveUiBuilder()
    const group = new MetaUiGroup({
      groupName: 's1',
      groupLabel: '概要',
      many: false,
      fields: [],
    })
    const card = builder.wrapGroup(group, h('div', 'body'))
    expect((card.type as any)?.name ?? (card.type as any)?.__name).toBe(
      'MmdaGroupCard',
    )
  })
})
