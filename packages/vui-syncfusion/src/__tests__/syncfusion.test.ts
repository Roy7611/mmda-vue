// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { h } from 'vue'
import { L10n } from '@syncfusion/ej2-base'
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
import { applySyncfusionLocale, resolveSyncfusionCulture } from '../syncfusion_i18n'
import { SyncfusionUiBuilder } from '../syncfusion_builder'
import { createSyncfusionFieldFactory } from '../syncfusion_field_factory'
import { createSyncfusionUiFactory } from '../syncfusion_factory'
import { syncfusionLayout } from '../syncfusion_layout'

/** 索引页 table()：pagable-table → loading-host → Grid；无分页时 loading-host → Grid。 */
const gridOf = (vnode: any) => {
  let node = vnode
  if (node?.props?.class === 'mmda-sf-pagable-table') {
    const kids = node.children
    node = Array.isArray(kids) ? kids[0] : kids
  }
  if (node && !node.props?.columns) {
    const kids = node.children
    const slot = typeof kids === 'function' ? kids : kids?.default
    const inner = typeof slot === 'function' ? slot() : slot
    if (inner != null) {
      node = Array.isArray(inner) ? inner[0] : inner
    }
  }
  return node
}

const pagerOf = (vnode: any) => {
  if (vnode?.props?.class !== 'mmda-sf-pagable-table') return null
  const kids = vnode.children
  return Array.isArray(kids) ? kids[1] : null
}

describe('Syncfusion skin', () => {
  it('maps all MMDA palettes to Material 3 accent and surface variables', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')
    for (const palette of MMDA_COLOR_PALETTE_IDS) {
      expect(css).toContain(`data-mmda-palette="${palette}"`)
    }
    expect(css).toContain('--color-sf-primary-container')
    expect(css).toContain('--color-sf-surface')
    expect(css).toContain('--color-sf-background')
    expect(css).toContain('--color-sf-outline-variant')
    expect(css).toContain('html.e-dark-mode[data-mmda-palette=')
    expect(css).toContain('html.mmda-dark[data-mmda-palette=')
  })

  it('implements the vui factory and layout contracts', () => {
    const factory = createSyncfusionUiFactory()
    expect(factory.layout).toBe(syncfusionLayout)
    expect(factory.table).toBeTypeOf('function')
    expect(factory.dialog).toBeTypeOf('function')
    expect(factory.resolveIcon('save')).toBe('e-icons e-save')
  })

  it('registers old metadata editor aliases', () => {
    const fields = createSyncfusionFieldFactory()
    expect(fields.TextBox).toBe(fields.textInput)
    expect(fields.DropdownList).toBe(fields.dropdown)
    expect(fields.DatePicker).toBe(fields.datePicker)
    expect(fields.FileUpload).toBe(fields.fileUpload)
  })

  it('constructs the builder against the new AbstractUiBuilder contract', () => {
    const builder = new SyncfusionUiBuilder()
    expect(builder.factory.layout.fieldMessage).toBe(false)
    expect(builder.buildAppScaffold()).toBeTruthy()
    expect(builder.overlayHost).toBeTruthy()
  })

  it('wraps toolbar actions in a button group', () => {
    const builder = new SyncfusionUiBuilder()
    const group = builder.factory.buttonGroup(
      () => [
        builder.factory.actionButton(
          { name: 'refresh', label: 'Refresh', onAction: () => undefined },
          key => key,
        ),
        builder.factory.actionButton(
          { name: 'create', label: 'Create', onAction: () => undefined },
          key => key,
        ),
      ],
      { class: 'mmda-sf-toolbar-actions' },
    )
    const className = Array.isArray(group.props?.class)
      ? group.props.class.join(' ')
      : String(group.props?.class ?? '')
    expect(className).toContain('e-btn-group')
    expect(className).toContain('mmda-sf-button-group')
    expect(className).toContain('mmda-sf-toolbar-actions')
  })

  it('renders the metadata name field as a details link', () => {
    const metaui = new MetaUi({
      objName: 'Material',
      displayLabel: '物料',
      primaryKey: 'materialID',
      labelKey: 'materialCode',
      groups: [
        {
          groupName: 'basic',
          groupLabel: '基础信息',
          many: false,
          fields: [
            {
              fieldIdx: 1,
              fieldName: 'materialCode',
              displayLabel: '物料编码',
              dataType: 12,
              nullable: false,
              listed: true,
            },
          ],
        },
      ],
    })
    const details = vi.fn()
    const context = {
      name: '.',
      editing: false,
      metaui,
      module: {},
      getFieldLogic: () => ({}),
      details,
    } as any
    const builder = new SyncfusionUiBuilder()
    const link = builder.displayCellFor(
      metaui.getField('materialCode')!,
      { materialID: 'm1', materialCode: 'M001' },
      context,
      { tableMetaui: metaui },
    ) as any

    expect(link.type).toBe('a')
    expect(link.props.class).toContain('mmda-table-link')
    expect(link.children).toBe('M001')
    link.props.onClick({ preventDefault: vi.fn() })
    expect(details).toHaveBeenCalledWith(
      expect.objectContaining({ materialID: 'm1' }),
    )
  })

  it('builds more actions as DropDownButton, not horizontal Menu', () => {
    const builder = new SyncfusionUiBuilder()
    const vnode = builder.moreMenuButton({ t: (k: string) => k } as any, [
      { name: 'import', label: '导入', onAction: () => undefined },
      { name: 'export', label: '导出', onAction: () => undefined },
      { name: 'print', label: '打印', onAction: () => undefined },
    ])[0]
    expect(vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type)).toMatch(
      /DropDownButton/i,
    )
    expect(vnode.props?.items).toHaveLength(3)
    expect(vnode.props?.items?.[0]?.text).toBe('导入')
    expect(vnode.props?.content).toBe('action.more')
    expect(vnode.props?.iconCss).toBeFalsy()
    expect(String(vnode.props?.cssClass ?? '')).toContain('mmda-btn-tonal')
    expect(String(vnode.props?.cssClass ?? '')).not.toContain('e-outline')
    expect(String(vnode.props?.cssClass ?? '')).not.toContain('e-flat')
  })

  it('defaults to e-card, uses fieldset when container is fieldset', () => {
    const builder = new SyncfusionUiBuilder()
    const group = new MetaUiGroup({
      groupName: 'base',
      groupLabel: '基本信息',
      many: false,
      fields: [],
    })
    const card = builder.wrapGroup(group, h('div', 'body'))
    expect(card.type?.name ?? card.type?.__name).toBe('MmdaGroupCard')
    expect(String(card.props?.class)).toContain('e-card')
    expect(String(card.props?.class)).toContain('mmda-group--primary')
    const fieldset = builder.wrapGroup(group, h('div', 'body'), {
      container: 'fieldset',
    })
    expect(fieldset.type).toBe('fieldset')
    expect(String(fieldset.props?.class)).toContain('mmda-group--primary')
  })

  it('uses EJ2 Sidebar dock menu when top-level module codes have no dot', () => {
    const modules = new ModuleFactory([
      {
        moduleCode: 'B',
        moduleLabel: '基础数据',
        moduleType: 'SYSTEM',
        moduleVersion: ModuleVersion.TEAM,
        allowOps: ModuleOp.READ,
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
            allowOps: ModuleOp.READ,
            moduleUrl: '/BASE/org',
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
            subModules: [
              {
                moduleCode: 'B.01.001',
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
    const builder = new SyncfusionUiBuilder()

    const automatic = builder.buildAppMenu(modules)
    expect(automatic.type).toMatchObject({
      name: 'SyncfusionAppMenu',
    })
    const systemsBar = builder.buildAppSideBar({
      modules,
      header: () => null,
    })
    expect(systemsBar.type).toMatchObject({
      name: 'SyncfusionAppMenu',
    })
    expect(systemsBar.props?.logo).toBeTypeOf('function')

    const scaffold = builder.buildAppScaffold({
      layout: 'sidebarLeft',
      sideBar: () => null,
      body: () => null,
    })
    expect(scaffold.props?.class).toBe('mmda-sf-shell')
    expect(scaffold.props?.id).toBe('mmda-sf-shell')

    expect(
      builder.buildAppSideBar({
        modules: modules[0]?.subModules ?? [],
        header: () => null,
      }).props?.class,
    ).toBe('mmda-sf-sidebar')
  })

  it('binds table dataSource as a plain array copy', () => {
    const factory = createSyncfusionUiFactory()
    const selectedItems: any[] = []
    const metaui = {
      getListedFields: () => [{ fieldName: 'name', displayLabel: '名称' }],
      groups: [],
      primaryKey: 'id',
    } as any
    const rows = [{ id: '1', name: 'a' }]
    const vnode = gridOf(
      factory.table(rows, metaui, {
        selectedItems,
        selectionMode: 'multiple',
      }),
    )
    expect(vnode.props?.dataSource).toEqual(rows)
    expect(vnode.props?.dataSource).not.toBe(rows)
    expect(vnode.key).toContain('mmda-sf-grid-')
  })

  it('enables Grid column grouping by default and can disable it', () => {
    const factory = createSyncfusionUiFactory()
    const metaui = {
      objName: 'Material',
      getListedFields: () => [
        { fieldName: 'categoryName', displayLabel: '物料类别' },
        { fieldName: 'materialCode', displayLabel: '物料编码' },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const enabledHost = factory.table([], metaui, {
      pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
    })
    const enabled = gridOf(enabledHost)
    expect(enabled.props?.allowGrouping).toBe(true)
    expect(enabled.props?.enableVirtualization).toBe(true)
    expect(enabled.props?.allowPaging).toBe(false)
    expect(enabled.props?.groupSettings).toEqual(
      expect.objectContaining({
        showDropArea: true,
        showGroupedColumn: false,
        disablePageWiseAggregates: true,
      }),
    )
    const category = enabled.props?.columns?.find(
      (column: any) => column?.field === 'categoryName',
    )
    expect(category?.allowGrouping).toBe(true)

    const disabled = gridOf(factory.table([], metaui, { enableGroup: false }))
    expect(disabled.props?.allowGrouping).toBe(false)
    expect(disabled.props?.groupSettings).toBeUndefined()
  })

  it('uses row virtualization and an external Pager for list pages', () => {
    const factory = createSyncfusionUiFactory()
    const onPage = vi.fn()
    const metaui = {
      objName: 'Product',
      getListedFields: () => [
        {
          fieldName: 'name',
          displayLabel: '名称',
          dataType: 48,
          nullable: false,
          sortable: true,
          listSize: 180,
          align: 'CENTER',
          renderer: 'textSpan',
        },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const rows = [{ id: '1', rowNum: '21', name: 'alpha' }]
    const host = factory.table(rows, metaui, {
      pagination: { pageNo: 3, pageSize: 10, recordCount: 45 },
      onPage,
      selectionMode: 'multiple',
      filterDisplay: 'menu',
      renderCell: (_field: any, row: any) => h('a', { href: `#${row.id}` }, row.name),
    })

    expect(host.props?.class).toBe('mmda-sf-pagable-table')
    const vnode = gridOf(host)
    expect(vnode.props?.allowPaging).toBe(false)
    expect(vnode.props?.enableVirtualization).toBe(true)
    expect(vnode.props?.height).toBe('100%')
    expect(vnode.props?.allowResizing).toBe(true)
    expect(vnode.props?.allowFiltering).toBe(true)
    expect(vnode.props?.filterSettings).toEqual({ type: 'Menu' })
    expect(vnode.props?.dataSource).toEqual({ result: rows, count: 1 })
    expect(vnode.props?.pageSettings).toMatchObject({
      pageSize: 50,
    })

    const pager = pagerOf(host)
    expect(pager?.props).toMatchObject({
      currentPage: 3,
      pageSize: 10,
      totalRecordsCount: 45,
    })
    pager.props.click({
      isInteracted: true,
      currentPage: 4,
      pageSize: 10,
    })
    expect(onPage).toHaveBeenCalledWith({ pageNo: 4, pageSize: 10 })

    const columns = vnode.props.columns
    expect(columns[0]).toMatchObject({
      type: 'checkbox',
      width: 48,
      minWidth: 48,
      maxWidth: 48,
      textAlign: 'Center',
      freeze: 'Left',
    })
    expect(columns.map((column: any) => column.field)).toEqual([
      undefined,
      'rowNum',
      'name',
    ])
    expect(columns[1]).toMatchObject({
      allowSorting: false,
      textAlign: 'Left',
      headerTextAlign: 'Left',
      template: 'mmdaCell_rowNum',
      customAttributes: { class: 'mmda-sf-rownum-col' },
      freeze: 'Left',
    })
    expect(columns[2]).toMatchObject({
      width: 180,
      textAlign: 'Center',
      headerTextAlign: 'Center',
      allowSorting: true,
      allowFiltering: true,
      template: 'mmdaCell_name',
    })
    const slots = vnode.children as any
    const cell = slots.mmdaCell_name({ data: rows[0] })
    expect(cell.props.style.textAlign).toBe('center')
    const link = Array.isArray(cell.children) ? cell.children[0] : cell.children
    expect(link.type).toBe('a')
    expect(link.props.href).toBe('#1')
    expect(link.children).toBe('alpha')

    const rowNumCell = slots.mmdaCell_rowNum({ data: rows[0] })
    expect(rowNumCell.props.class).toBe('mmda-sf-rownum__index')
    expect(rowNumCell.children).toBe('21')
  })

  it('renders three flat row actions by default without a dropdown', () => {
    const factory = createSyncfusionUiFactory()
    const metaui = {
      objName: 'Product',
      getListedFields: () => [
        {
          fieldName: 'name',
          displayLabel: '名称',
          dataType: 48,
          nullable: false,
        },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const details = vi.fn()
    const edit = vi.fn()
    const remove = vi.fn()
    const custom = vi.fn()
    const row = {
      id: '1',
      rowNum: '4',
      name: 'alpha',
      editable: true,
      deletable: false,
    }
    const vnode = gridOf(
      factory.table([row], metaui, {
        rowMenu: (item: any) => [
          ...(item.editable !== false
            ? [{ name: 'edit', label: '编辑', onAction: edit }]
            : []),
          ...(item.deletable !== false
            ? [{ name: 'delete', label: '删除', onAction: remove }]
            : []),
          { name: 'details', label: '详情', onAction: details },
          { divider: true },
          { name: 'custom', label: '派工', onAction: custom },
        ],
      }),
    )
    const columns = vnode.props.columns
    expect(columns.at(-1)).toMatchObject({
      field: '__mmdaActions',
      headerText: '操作',
      allowSorting: false,
      allowFiltering: false,
      allowGrouping: false,
      freeze: 'Right',
      template: 'mmdaCell_actions',
      width: 108,
    })
    const slots = vnode.children as any
    const cell = slots.mmdaCell_actions({ data: row })
    expect(cell.props.class).toBe('mmda-sf-row-actions')
    const [editButton, deletePlaceholder, detailsButton] = cell.children
    expect(editButton.props.title).toBe('编辑')
    expect(deletePlaceholder.props.class).toBe(
      'mmda-sf-row-action-placeholder',
    )
    expect(detailsButton.props.title).toBe('详情')
    expect(detailsButton.props.items).toBeUndefined()
    editButton.props.onClick()
    expect(edit).toHaveBeenCalledTimes(1)
    expect(remove).not.toHaveBeenCalled()
    detailsButton.props.onClick()
    expect(details).toHaveBeenCalledTimes(1)
    expect(custom).not.toHaveBeenCalled()
  })

  it('renders details SplitButton dropdown only when showActions is true', () => {
    const factory = createSyncfusionUiFactory()
    const metaui = {
      objName: 'Product',
      getListedFields: () => [
        {
          fieldName: 'name',
          displayLabel: '名称',
          dataType: 48,
          nullable: false,
        },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const details = vi.fn()
    const edit = vi.fn()
    const remove = vi.fn()
    const custom = vi.fn()
    const row = {
      id: '1',
      rowNum: '4',
      name: 'alpha',
      editable: true,
      deletable: false,
    }
    const vnode = gridOf(
      factory.table([row], metaui, {
        showActions: true,
        rowMenu: (item: any) => [
          ...(item.editable !== false
            ? [{ name: 'edit', label: '编辑', onAction: edit }]
            : []),
          ...(item.deletable !== false
            ? [{ name: 'delete', label: '删除', onAction: remove }]
            : []),
          { name: 'details', label: '详情', onAction: details },
          { divider: true },
          { name: 'custom', label: '派工', onAction: custom },
        ],
      }),
    )
    expect(vnode.props.columns.at(-1).width).toBe(124)
    const slots = vnode.children as any
    const cell = slots.mmdaCell_actions({ data: row })
    const [, , detailsSplit] = cell.children
    expect(detailsSplit.props.title).toBe('详情')
    expect(detailsSplit.props.items.map((item: any) => item.text)).toEqual([
      '派工',
    ])
    detailsSplit.props.click()
    expect(details).toHaveBeenCalledTimes(1)
    detailsSplit.props.select({ item: { id: 'custom' } })
    expect(custom).toHaveBeenCalledTimes(1)
  })

  it('defaults numeric columns to right and enum columns to left', () => {
    const factory = createSyncfusionUiFactory()
    const metaui = {
      objName: 'Product',
      getListedFields: () => [
        {
          fieldName: 'qty',
          displayLabel: '数量',
          dataType: 68,
          nullable: true,
        },
        {
          fieldName: 'status',
          displayLabel: '状态',
          dataType: 68,
          nullable: true,
          reference: { isEnum: true },
        },
        {
          fieldName: 'name',
          displayLabel: '名称',
          dataType: 48,
          nullable: true,
          align: 'RIGHT',
        },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const vnode = gridOf(
      factory.table([{ id: '1', qty: 12, status: 1, name: 'a' }], metaui, {}),
    )
    const columns = vnode.props.columns.filter(
      (column: any) => column?.field && column.field !== 'rowNum',
    )
    expect(columns[0].textAlign).toBe('Right')
    expect(columns[1].textAlign).toBe('Left')
    expect(columns[2].textAlign).toBe('Right')
    const slots = vnode.children as any
    expect(slots.mmdaCell_qty({ data: { qty: 12 } }).props.style.textAlign).toBe(
      'right',
    )
    expect(
      slots.mmdaCell_status({ data: { status: 1 } }).props.style.textAlign,
    ).toBe('left')
  })

  it('uses CheckBox choices for enum columns and Menu for other fields', () => {
    const factory = createSyncfusionUiFactory()
    const onFilterModelChange = vi.fn()
    const categoryOptions = [
      { value: 'RAW', label: '原材料' },
      { value: 'PART', label: '零件' },
    ]
    const metaui = {
      objName: 'Material',
      getListedFields: () => [
        {
          fieldName: 'category',
          displayLabel: '物料类别',
          dataType: 48,
          reference: {
            isEnum: true,
            isRef: false,
            hasOne: false,
            refOptions: categoryOptions,
            valueOf: (option: any) => option.value,
            labelOf: (option: any) => option.label,
          },
        },
        {
          fieldName: 'name',
          displayLabel: '物料名称',
          dataType: 48,
        },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const rows = [{ id: '1', category: 'RAW', name: 'a' }]
    const vnode = gridOf(
      factory.table(rows, metaui, {
        filterDisplay: 'menu',
        pagination: { pageNo: 1, pageSize: 20, recordCount: 1 },
        onFilterModelChange,
      }),
    )
    expect(vnode.props?.filterSettings).toEqual({ type: 'Menu' })
    const columns = vnode.props.columns.filter(
      (column: any) => column?.field && column.field !== 'rowNum',
    )
    expect(columns[0].filter).toMatchObject({
      type: 'CheckBox',
      itemTemplate: '${mmdaFilterLabel}',
    })
    expect(columns[0].filter.dataSource).toEqual([
      { category: 'RAW', mmdaFilterLabel: '原材料', mmdaFilterOrder: 0 },
      { category: 'PART', mmdaFilterLabel: '零件', mmdaFilterOrder: 1 },
    ])
    expect(columns[1].filter).toEqual({ type: 'Menu' })

    vnode.props.dataStateChange({
      action: { requestType: 'filtering' },
      where: [
        {
          field: 'category',
          operator: 'equal',
          value: ['RAW', 'PART'],
        },
      ],
    })
    expect(onFilterModelChange).toHaveBeenCalledWith({
      category: { filterType: 'set', operator: 'IN', values: ['RAW', 'PART'] },
    })
  })

  it('parses pipe enum selectOptions into CheckBox filter choices', async () => {
    const { MetaUiFieldRef } = await import('@mmda/core')
    const factory = createSyncfusionUiFactory()
    const selectOptions =
      '0;LABOR;劳动力|1;RAW_MATERIAL;原材料|16;TOOLS;机具设备'
    const reference = MetaUiFieldRef.parse(selectOptions)
    const metaui = {
      objName: 'Material',
      getListedFields: () => [
        {
          fieldName: 'materialType',
          displayLabel: '物料用途',
          dataType: 48,
          selectOptions,
          reference,
        },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const vnode = gridOf(
      factory.table([], metaui, {
        filterDisplay: 'menu',
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    )
    const column = vnode.props.columns.find(
      (item: any) => item?.field === 'materialType',
    )
    expect(column.filter.type).toBe('CheckBox')
    expect(column.filter.dataSource).toEqual([
      { materialType: 'LABOR', mmdaFilterLabel: '劳动力', mmdaFilterOrder: 0 },
      {
        materialType: 'RAW_MATERIAL',
        mmdaFilterLabel: '原材料',
        mmdaFilterOrder: 1,
      },
      { materialType: 'TOOLS', mmdaFilterLabel: '机具设备', mmdaFilterOrder: 2 },
    ])
  })

  it('keeps checkbox filter choices in refOptions order instead of value sort', async () => {
    const { MetaUiFieldRef } = await import('@mmda/core')
    const { CheckBoxFilterBase } = await import('@syncfusion/ej2-grids')
    const factory = createSyncfusionUiFactory()
    const selectOptions = '0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用'
    const reference = MetaUiFieldRef.parse(selectOptions)
    const metaui = {
      objName: 'Material',
      getListedFields: () => [
        {
          fieldName: 'status',
          displayLabel: '状态',
          dataType: 48,
          selectOptions,
          reference,
        },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const vnode = gridOf(
      factory.table([], metaui, {
        filterDisplay: 'menu',
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    )
    const column = vnode.props.columns.find(
      (item: any) => item?.field === 'status',
    )
    const dataSource = column.filter.dataSource
    expect(dataSource.map((row: any) => row.status)).toEqual([
      'NEW',
      'USED',
      'DEPRECATED',
    ])
    const grouped = CheckBoxFilterBase.getDistinct(
      dataSource,
      'status',
      column,
      {},
      { parent: { filterSettings: {} } },
    )
    // Without patch, ascending would be DEPRECATED, NEW, USED.
    expect(grouped.records.map((row: any) => row.status)).toEqual([
      'NEW',
      'USED',
      'DEPRECATED',
    ])
  })

  it('extends number/date Menu filters and keeps bool/text on default Menu', () => {
    const factory = createSyncfusionUiFactory()
    const onFilterModelChange = vi.fn()
    const metaui = {
      objName: 'Order',
      getListedFields: () => [
        { fieldName: 'amount', displayLabel: '金额', dataType: 68 },
        { fieldName: 'orderedAt', displayLabel: '日期', dataType: 184 },
        { fieldName: 'active', displayLabel: '启用', dataType: 113 },
        { fieldName: 'name', displayLabel: '名称', dataType: 48 },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const vnode = gridOf(
      factory.table([], metaui, {
        filterDisplay: 'menu',
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
        onFilterModelChange,
      }),
    )
    const columns = vnode.props.columns.filter(
      (column: any) => column?.field && column.field !== 'rowNum',
    )

    expect(columns[0].filter).toMatchObject({
      type: 'Menu',
      ui: {
        create: expect.any(Function),
        write: expect.any(Function),
        read: expect.any(Function),
        destroy: expect.any(Function),
      },
    })
    expect(columns[1].filter).toMatchObject({
      type: 'Menu',
      ui: {
        create: expect.any(Function),
        write: expect.any(Function),
        read: expect.any(Function),
        destroy: expect.any(Function),
      },
    })
    expect(columns[1].type).toBe('datetime')
    expect(columns[1].format).toEqual({
      type: 'dateTime',
      format: 'yyyy-MM-dd HH:mm:ss',
    })
    expect(columns[2].filter).toEqual({ type: 'Menu' })
    expect(columns[3].filter).toEqual({ type: 'Menu' })

    const start = new Date('2026-08-01')
    vnode.props.dataStateChange({
      action: { requestType: 'filtering' },
      where: [
        {
          predicates: [
            {
              field: 'amount',
              operator: 'greaterthanorequal',
              value: 10,
            },
            {
              field: 'orderedAt',
              operator: 'equal',
              value: start,
            },
            {
              field: 'active',
              operator: 'equal',
              value: true,
            },
          ],
        },
      ],
    })
    expect(onFilterModelChange).toHaveBeenCalledWith({
      amount: {
        filterType: 'number',
        operator: 'GE',
        value: 10,
      },
      orderedAt: {
        filterType: 'date',
        operator: 'EQ',
        value: start,
      },
      active: {
        filterType: 'boolean',
        value: true,
      },
    })
  })

  it('shows a second native input for BETWEEN and emits range predicates', () => {
    const factory = createSyncfusionUiFactory()
    const onFilterModelChange = vi.fn()
    const metaui = {
      objName: 'Order',
      getListedFields: () => [
        { fieldName: 'amount', displayLabel: '金额', dataType: 68 },
        { fieldName: 'orderedAt', displayLabel: '日期', dataType: 184 },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const vnode = gridOf(
      factory.table([], metaui, {
        filterDisplay: 'menu',
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
        onFilterModelChange,
      }),
    )
    const amountColumn = vnode.props.columns.find(
      (column: any) => column?.field === 'amount',
    )
    amountColumn.uid = 'amount-column'

    const numberOperators = [{ value: 'equal', text: '等于' }]
    vnode.props.actionBegin({
      requestType: 'filterBeforeOpen',
      filterModel: {
        options: { field: 'amount' },
        customFilterOperators: { numberOperator: numberOperators },
      },
    })
    expect(numberOperators).toEqual([
      { value: 'equal', text: '等于' },
      { value: 'between', text: '在…之间' },
    ])

    const previousChange = vi.fn()
    const operatorDropDown: any = {
      value: 'equal',
      change: previousChange,
    }
    const target = document.createElement('div')
    document.body.appendChild(target)
    amountColumn.filter.ui.create({
      target,
      column: amountColumn,
      getOptrInstance: { dropOptr: operatorDropDown },
    })

    const secondWrap = target.querySelector(
      '.mmda-sf-filter-range__value--to',
    ) as HTMLElement
    expect(secondWrap.hidden).toBe(true)
    operatorDropDown.value = 'between'
    operatorDropDown.change?.()
    expect(previousChange).toHaveBeenCalled()
    expect(secondWrap.hidden).toBe(false)

    const controls = Array.from(target.querySelectorAll('input'))
      .map((input: any) => input.ej2_instances?.[0])
      .filter(Boolean)
    expect(controls).toHaveLength(2)
    controls[0].value = 10
    controls[1].value = 99

    const filterByColumn = vi.fn()
    amountColumn.filter.ui.read({
      column: amountColumn,
      operator: 'between',
      fltrObj: {
        filterByColumn,
        removeFilteredColsByField: vi.fn(),
      },
    })
    expect(filterByColumn).toHaveBeenCalledWith(
      'amount',
      'greaterthanorequal',
      10,
      'and',
      true,
    )

    // where 若只带下界，dataStateChange 仍应用 pendingRanges 补成 BETWEEN
    vnode.props.dataStateChange({
      action: { requestType: 'filtering' },
      where: [
        {
          field: 'amount',
          operator: 'greaterthanorequal',
          value: 10,
        },
      ],
    })
    expect(onFilterModelChange).toHaveBeenLastCalledWith({
      amount: {
        filterType: 'number',
        operator: 'BETWEEN',
        value: 10,
        valueTo: 99,
      },
    })

    amountColumn.filter.ui.destroy()
    expect(operatorDropDown.change).toBe(previousChange)
    target.remove()
  })

  it('uses DateTimePicker controls for datetime BETWEEN', () => {
    const factory = createSyncfusionUiFactory()
    const metaui = {
      objName: 'Order',
      getListedFields: () => [
        { fieldName: 'orderedAt', displayLabel: '日期', dataType: 184 },
      ],
      groups: [],
      primaryKey: 'id',
    } as any
    const vnode = gridOf(
      factory.table([], metaui, {
        filterDisplay: 'menu',
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    )
    const dateColumn = vnode.props.columns.find(
      (column: any) => column?.field === 'orderedAt',
    )
    dateColumn.uid = 'ordered-at-column'
    const target = document.createElement('div')
    document.body.appendChild(target)
    dateColumn.filter.ui.create({
      target,
      column: dateColumn,
      getOptrInstance: {
        dropOptr: {
          value: 'between',
          change: undefined,
        },
      },
    })
    const controls = Array.from(target.querySelectorAll('input'))
      .map((input: any) => input.ej2_instances?.[0])
      .filter(Boolean)
    expect(controls.map((control: any) => control.getModuleName())).toEqual([
      'datetimepicker',
      'datetimepicker',
    ])
    dateColumn.filter.ui.destroy()
    target.remove()
  })

  it('builds module breadcrumb from parent chain', () => {
    const factory = new ModuleFactory([
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
    ])
    const dept = factory.findModuleByName('Department')!
    const builder = new SyncfusionUiBuilder()
    const vnode = builder.buildModuleBreadcrumb(
      { title: '部门' } as any,
      { module: dept },
    )
    expect(vnode.type).toBe('nav')
    expect((vnode.props as any)?.class).toContain('mmda-sf-breadcrumb')
    const kids = vnode.children as any[]
    const linkItem = kids.find((c) => c?.props?.class === 'e-breadcrumb-item')
    const link = linkItem?.children?.[0]
    expect(link?.props?.to).toBe('/BASE/org')
    expect(link?.type?.name ?? link?.type).toMatch(/RouterLink/)
    const leafItem = [...kids].reverse().find((c) => c?.props?.class === 'e-breadcrumb-item')
    const leafLabel = leafItem?.children?.[0]?.children?.[1]?.children
    expect(leafLabel).toBe('部门')
  })

  it('renders list toolbar actions from module authority', () => {
    const factory = new ModuleFactory([
      {
        moduleCode: 'B.01.01',
        moduleLabel: '部门',
        moduleType: 'FEATURE',
        moduleVersion: ModuleVersion.TEAM,
        allowOps:
          ModuleOp.READ |
          ModuleOp.CREATE |
          ModuleOp.DELETE |
          ModuleOp.EXPORT |
          ModuleOp.IMPORT,
        moduleUrl: '/BASE/Departments',
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        objName: 'Department',
      },
    ])
    const module = factory.findModuleByName('Department')!
    const builder = new SyncfusionUiBuilder()
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
      module: { ...module, authority: auth(ModuleOp.READ | ModuleOp.CREATE) },
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

  it('orders details actions, applies entity roles, and groups file actions', () => {
    const builder = new SyncfusionUiBuilder()
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
      globalProps: { $router: { back: vi.fn() } },
      t: (message: string) => message,
      translate: (message: string) => message,
    }

    const buttons = (builder as any).detailsViewActionButtons(context)
    expect(buttons.slice(0, 6).map((button: any) => button.props?.content)).toEqual([
      'action.back',
      'action.edit',
      'action.create',
      'action.delete',
      '弃用',
      'action.more',
    ])
    expect(buttons[4].props.cssClass).toContain('e-danger')
    expect(buttons[5].props.items.map((item: any) => item.text)).toEqual([
      'action.print',
      'action.export',
      'action.import',
    ])
    expect(String(buttons[5].props.cssClass ?? '')).toContain('mmda-btn-tonal')
    expect(buttons[5].props.iconCss).toBeFalsy()
    expect(String(buttons[0].props.cssClass ?? '')).toContain('mmda-btn-tonal')
  })

  it('maps vui locales onto EJ2 cultures and loads L10n', () => {
    expect(resolveSyncfusionCulture('zh')).toBe('zh-Hans')
    expect(resolveSyncfusionCulture('zh-CN')).toBe('zh-Hans')
    expect(resolveSyncfusionCulture('zh-Hans')).toBe('zh-Hans')
    expect(resolveSyncfusionCulture('zh-Hant')).toBe('zh-Hant')
    expect(resolveSyncfusionCulture('en')).toBe('en-US')
    expect(applySyncfusionLocale('zh')).toBe('zh-Hans')
    // 简体使用独立 zh-Hans；官方 zh 仅供 zh-Hant 使用。
    const l10n = new L10n('grid', {}, 'zh-Hans')
    expect(l10n.getConstant('StartsWith')).toBe('开头是')
    expect(l10n.getConstant('EndsWith')).toBe('结尾是')
    expect(l10n.getConstant('NotStartsWith')).toBe('开头不是')
    expect(l10n.getConstant('ClearFilter')).toBe('清除筛选')
    expect(applySyncfusionLocale('en')).toBe('en-US')
  })
})
