import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
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
    expect(factory.dialog).toBeTypeOf('function')
    expect(factory.splitter).toBeTypeOf('function')
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

  it('registers old metadata editor aliases', () => {
    const fields = createPrimeVueFieldFactory()
    expect(fields.TextBox).toBe(fields.textInput)
    expect(fields.DropdownList).toBe(fields.dropdown)
    expect(fields.DatePicker).toBe(fields.datePicker)
    expect(fields.FileUpload).toBe(fields.fileUpload)
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
    expect((vnode.props as any)?.model[1].label).toBe('部门')
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
})
