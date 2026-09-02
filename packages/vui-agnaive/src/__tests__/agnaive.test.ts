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
import { MmdaAgGrid } from '../components/MmdaAgGrid'
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
    expect(factory.dialog).toBeTypeOf('function')
    expect(factory.splitter).toBeTypeOf('function')
    expect(factory.tree).toBeTypeOf('function')
    expect(factory.integratedTablePaging).toBe(true)
    expect(factory.nativeInplaceEdit).toBe(true)
    expect(factory.defaultFilterDisplay).toBe('menu')
    expect(factory.resolveIcon('save')).toBe('fas fa-check')
  })

  it('registers old metadata editor aliases', () => {
    const fields = createAgNaiveFieldFactory()
    expect(fields.TextBox).toBe(fields.textInput)
    expect(fields.DropdownList).toBe(fields.dropdown)
    expect(fields.DatePicker).toBe(fields.datePicker)
    expect(fields.FileUpload).toBe(fields.fileUpload)
    expect(fields.HasOneText).toBe(fields.externalLink)
  })

  it('constructs the builder against AbstractUiBuilder', () => {
    const builder = new AgNaiveUiBuilder()
    expect(builder.factory.layout.fieldMessage).toBe(false)
    expect(builder.buildAppScaffold()).toBeTruthy()
  })

  it('wraps table in MmdaAgGrid', () => {
    const factory = createAgNaiveUiFactory()
    const vnode = factory.table([], productMeta(), { selectionMode: 'multiple' })
    expect(vnode.type).toBe(MmdaAgGrid)
    expect(vnode.props?.metaui.objName).toBe('Product')
  })

  it('builds column defs from listed metadata', () => {
    const cols = buildColumnDefs(productMeta(), { filterDisplay: 'menu' })
    expect(cols.map(col => col.field)).toEqual(['code', 'name', 'price', 'enabled'])
    expect(cols.find(col => col.field === 'price')?.filter).toBe('agNumberColumnFilter')
    expect(cols.find(col => col.field === 'enabled')?.filter).toBe('agSetColumnFilter')
  })

  it('maps AG Grid FilterModel to EntityFilterModel and back', () => {
    const metaui = productMeta()
    const entity = agFilterModelToEntity(
      {
        name: { filterType: 'text', type: 'contains', filter: 'demo' },
        price: { filterType: 'number', type: 'inRange', filter: 1, filterTo: 9 },
        enabled: { filterType: 'set', values: ['true'] },
      },
      metaui,
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
    const ag = entityFilterToAgModel(entity, metaui)
    expect(ag.name.type).toBe('contains')
    expect(ag.price.type).toBe('inRange')
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
    const metaui = new MetaUi({
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
    const cols = buildColumnDefs(metaui, {})
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
    const metaui = new MetaUi({
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
    const listed = metaui.getListedFields()[0]!
    listed.reference!.refOptions.splice(
      0,
      listed.reference!.refOptions.length,
      { whID: 'W1', whName: '主仓' },
      { whID: 'W2', whName: '辅仓' },
    )
    const loadFilterOptions = vi.fn()
    const cols = buildColumnDefs(metaui, { loadFilterOptions })
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

  it('loads empty refOptions through loadFilterOptions', async () => {
    const material = new MetaUiField({
      fieldName: 'matID',
      displayLabel: '物料',
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      fieldIdx: 0,
      listed: true,
      selectOptions: 'HAS_ONE Material(matID,matName) AS material',
    })
    const metaui = new MetaUi({
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
    const cols = buildColumnDefs(metaui, { loadFilterOptions })
    let received: unknown[] = []
    await (cols[0]?.filterParams?.values as Function)({
      success: (values: unknown[]) => {
        received = values
      },
    })
    expect(loadFilterOptions).toHaveBeenCalledTimes(1)
    expect(received).toEqual(['M1'])
    expect(cols[0]?.filterParams?.valueFormatter({ value: 'M1' })).toBe('螺丝')
  })

  it('passes selection and filter callbacks through factory.table to MmdaAgGrid', () => {
    const factory = createAgNaiveUiFactory()
    const onFilterModelChange = vi.fn()
    const onSelectionChange = vi.fn()
    const vnode = factory.table([{ id: '1', code: 'P-001' }], productMeta(), {
      selectionMode: 'multiple',
      filterDisplay: 'menu',
      onFilterModelChange,
      onSelectionChange,
    })
    expect(vnode.type).toBe(MmdaAgGrid)
    expect(vnode.props?.selectionMode).toBe('multiple')
    expect(vnode.props?.onFilterModelChange).toBe(onFilterModelChange)
    expect(vnode.props?.onSelectionChange).toBe(onSelectionChange)
  })

  it('does not pull NDataTable or page-row distinct into the skin', () => {
    const sources = [
      'src/agnaive_factory.ts',
      'src/ag_columns.ts',
      'src/ag_filter.ts',
      'src/components/MmdaAgGrid.ts',
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
      metaui: { objName: 'Material', displayLabel: '物料' },
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
