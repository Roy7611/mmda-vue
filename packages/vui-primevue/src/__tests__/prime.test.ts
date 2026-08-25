import { describe, expect, it } from 'vitest'
import {
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
  auth,
} from '@mmda/core'
import { UiViewMany } from '@mmda/vui'
import { PrimeVueUiBuilder } from '../prime_builder'
import { createPrimeVueFieldFactory } from '../prime_field_factory'
import { createPrimeVueUiFactory } from '../prime_factory'
import { primeLayout } from '../prime_layout'

describe('PrimeVue skin', () => {
  it('implements the vui factory and layout contracts', () => {
    const factory = createPrimeVueUiFactory()
    expect(factory.layout).toBe(primeLayout)
    expect(factory.table).toBeTypeOf('function')
    expect(factory.dialog).toBeTypeOf('function')
    expect(factory.resolveIcon('save')).toBe('pi pi-check')
  })

  it('registers old metadata editor aliases', () => {
    const fields = createPrimeVueFieldFactory()
    expect(fields.TextBox).toBe(fields.textInput)
    expect(fields.DropdownList).toBe(fields.dropdown)
    expect(fields.DatePicker).toBe(fields.datePicker)
    expect(fields.FileUpload).toBe(fields.fileUpload)
  })

  it('constructs the builder against the new AbstractUiBuilder contract', () => {
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

  it('builds module breadcrumb from parent chain', () => {
    const factory = new ModuleFactory([
      {
        moduleCode: 'B.01',
        moduleLabel: '组织架构',
        moduleType: 'MODULE',
        moduleVersion: ModuleVersion.TEAM,
        moduleIcon: 'far fa-sitemap',
        allowOp: 1,
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
            allowOp: 7,
            moduleUrl: '/BASE/Departments',
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
            objName: 'Department',
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
        allowOp: ModuleOp.READ | ModuleOp.CREATE | ModuleOp.DELETE | ModuleOp.EXPORT | ModuleOp.IMPORT,
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
      metaui: { objName: 'Department', displayLabel: '部门' },
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
})
