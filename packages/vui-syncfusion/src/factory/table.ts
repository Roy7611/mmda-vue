// @ts-nocheck
/**
 * index 列表拼装（factory.table）：分页、选行、远程查。底层 SfGridHost。
 * 表头过滤 ↔ FilterModel 在 table_filter.ts；芯片条是 SfGridFilterBar。
 */
import { h, toRaw, unref, render, getCurrentInstance } from 'vue'
import { DEFAULT_PAGE_SIZE, MetaModel, MetaUiFilterType, SortOrder, SqlDataType, isDateRangeKind, uiCssClass, FieldFilter, type MetaUi, type MetaUiField, fieldCellEditorAllowsColumn, resolveFieldCellCanEdit } from '@mmda/core'
import { columnFilterKindOf, hasFilterType, isLazyChoiceFilterField, isRefOptionsComplete, simpleFilterTypeOf } from './filter_kind'
import { contextMenuItemsOf, findContextMenuItem, gridFreezeOf, invokeContextMenuItem, isPersistableListColumn, joinListColumnLabel, logListPaint, readStoredPageSize, translateMessage, type UiListPropsType, type UiPaginatorPropsType, settleRemoteListQuery } from '@mmda/vui'
import { NumericTextBox, TextBox } from '@syncfusion/ej2-inputs'
import { DatePicker, DateTimePicker } from '@syncfusion/ej2-calendars'
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns'
import {
  createCompareColumnFilterStore,
  sfCompareColumnFilter,
  usesCompareColumnFilter,
  writeCompareColumnFilter,
} from './column_filter'
import {
  filterModelFromGridEvent,
  paintFilterFunnels,
  sameFilterModel,
  selectedSetValuesOf,
} from './table_filter'
import { SplitButtonComponent } from '@syncfusion/ej2-vue-splitbuttons'
import { getSyncfusionCulture } from '../syncfusion_i18n'
import { SfGrid, SfGridLoadingHost, syncMetaUiFromGridColumns } from './grid'
import { createDateSetTree } from './date_set_tree'

MultiSelect.Inject(CheckBoxSelection)
import {
  AG_MENU_DATE_OPERATORS,
  AG_MENU_NUMBER_OPERATORS,
  AG_MENU_STRING_OPERATORS,
  EMPTY_SELECTION,
  VIRTUAL_ROW_PAGE_SIZE,
  DEFAULT_LIST_COLUMN_WIDTH,
  booleanFilterRowsOf,
  cellSlotName,
  choiceFilterDataSource,
  choiceFilterRowsOf,
  columnEditType,
  gridColumnFormat,
  gridColumnType,
  applyChoiceFilterExistingPredicate,
  gridFilterOperator,
  gridTextAlign,
  gridTextAlignCss,
  isChoiceFilterField,
  isHasOneSetField,
  applyMenuOperators,
  keepAgMenuOperators,
  listedFields,
  menuFilterOperators,
  normalizeAction,
  findAction,
  isEnumReference,
  referenceEditParams,
  refreshRefEditParams,
  resolveFieldUnit,
} from './utils'

export type TableFactoryDeps = {
  button: (props: any, slots?: any) => any
  paginator: (pagination: any, props: UiPaginatorPropsType) => any
  resolveIcon: (icon: string) => string
}

export function createTableRenderer(deps: TableFactoryDeps) {
  const { button, paginator } = deps
  const factory = {
    paginator,
    resolveIcon: deps.resolveIcon,
  }
  return <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaUi)
    const rowNumField = fields.find(field => field.fieldName === 'rowNum')
    const dataFields = fields.filter(field => field.fieldName !== 'rowNum')
    const restrictTemplates = Array.isArray(props.templateCellFields)
    const templateCellFieldNames = new Set(props.templateCellFields ?? [])
    const useTemplateCell = (field: MetaUiField) =>
      !restrictTemplates ||
      templateCellFieldNames.has(field.fieldName) ||
      Boolean(props.fieldCellRenderers?.[field.fieldName])
    const selectionMode = props.selectionMode
    const showColumnFilters =
      props.filterable !== false &&
      (props.filterDisplay === 'row' ||
        props.filterDisplay === 'menu' ||
        props.filterDisplay == null)
    const showGrouping = props.groupable !== false
    const pagination = props.pagination
    const liveFilterModel = () =>
      (typeof props.filterModelOf === 'function'
        ? props.filterModelOf()
        : undefined) ?? props.filterModel
    const fieldEditors = props.fieldCellEditors ?? {}
    const inplaceEdit = props.editable === true && !pagination
    const inplaceEditStart = props.inplaceEditStart ?? 'excel'
    const columnAllowsEdit = (fieldName: string) =>
      fieldCellEditorAllowsColumn(fieldEditors[fieldName])
    const rowAllowsEdit = (field: MetaUiField, row: T) =>
      !field.readOnly &&
      (row as { editable?: boolean })?.editable !== false &&
      resolveFieldCellCanEdit(fieldEditors[field.fieldName], field, row)
    const saveCellEdit = (
      field: MetaUiField,
      row: T,
      value: unknown,
      previousValue: unknown,
    ) => {
      const onSave =
        fieldEditors[field.fieldName]?.onSave ?? props.defaultCellSave
      return onSave?.(field, row, value, previousValue)
    }

    // dataSource 用快照（新引用才能驱动 EJ2 刷新）；写回用 sourceRows = 调用方传入的集合。
    const sourceRows = Array.isArray(model) ? (model as T[]) : []
    const rows = Array.isArray(model)
      ? (Array.from(toRaw(model) as T[]) as T[])
      : []
    logListPaint('table-factory', {
      rows: rows.length,
      host: getCurrentInstance()?.type?.name,
    })

    let ej2Grid: any = null
    let focusedEditCell: { rowIndex: number; field: string } | null = null
    let contentTable: HTMLElement | null = null
    let gridHost: HTMLElement | null = null
    const appContext = getCurrentInstance()?.appContext ?? null
    const rowDetail = props.rowDetail
    const virtualized =
      Boolean(pagination) && !rowDetail && rows.length > 100
    const detailHosts = new Set<Element>()
    const unmountRowDetails = () => {
      for (const host of detailHosts) {
        render(null, host)
      }
      detailHosts.clear()
    }
    const bindRowDetail = (args: any) => {
      const root = args?.detailElement as HTMLElement | undefined
      const host =
        (root?.querySelector?.('.mmda-row-detail-host') as Element | null) ??
        root
      if (!host || !rowDetail) return
      const row = (args?.data ?? args?.rowData) as T
      const vnode = rowDetail.detail(row) as any
      if (appContext && vnode && typeof vnode === 'object') vnode.appContext = appContext
      render(vnode, host)
      detailHosts.add(host)
    }
    const expandAllDetails = () => {
      if (rowDetail?.expandAll === false) return
      if (!rowDetail) return
      queueMicrotask(() => {
        ej2Grid?.detailRowModule?.expandAll?.()
      })
    }

    /** 原位编辑只认行号 → features[i]，不信任 Batch 的 rowData 副本。 */
    const rowIndexFrom = (args?: any) => {
      const candidates = [
        focusedEditCell?.rowIndex,
        args?.rowIndex,
        args?.cellIndex?.rowIndex,
        args?.cell?.closest?.('tr')?.getAttribute?.('data-rowindex'),
        args?.cell && ej2Grid?.getRowInfo?.(args.cell)?.rowIndex,
      ]
      for (const value of candidates) {
        const rowIndex = Number(value)
        if (
          Number.isFinite(rowIndex) &&
          rowIndex >= 0 &&
          rowIndex < sourceRows.length
        ) {
          return rowIndex
        }
      }
      return -1
    }

    const sourceRowAt = (args?: any) => {
      const rowIndex = rowIndexFrom(args)
      return rowIndex >= 0 ? sourceRows[rowIndex] : undefined
    }

    const flushPendingCellEdit = () => {
      if (!inplaceEdit || !ej2Grid) return
      try {
        ej2Grid.saveCell?.()
        ej2Grid.editModule?.saveCell?.()
      } catch {
        /* 销毁中可能已不可用 */
      }
    }

    const resolveCellTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null
      if (!el?.closest) return null
      // 自定义 cell template 时点击落在内部节点，需回找 EJ2 单元格
      return el.closest('.e-rowcell') as HTMLElement | null
    }

    const resolveCellEditTarget = (cell: HTMLElement | null) => {
      if (!cell || !ej2Grid) return null
      const row = cell.parentElement
      const rowIndex = Number(
        row?.getAttribute('data-rowindex') ??
          cell.getAttribute('index') ??
          cell.getAttribute('data-index') ??
          NaN,
      )
      const dataCol = cell.getAttribute('data-colindex')
      const ariaCol = cell.getAttribute('aria-colindex')
      const colIndex =
        dataCol != null
          ? Number(dataCol)
          : ariaCol != null
            ? Number(ariaCol) - 1
            : NaN
      const columns = ej2Grid.getColumns?.() ?? []
      const field = columns[colIndex]?.field as string | undefined
      if (!Number.isFinite(rowIndex) || !field || !columnAllowsEdit(field)) {
        return null
      }
      return { rowIndex, field }
    }

    const beginCellEdit = (rowIndex: number, field: string, seed?: string) => {
      if (!ej2Grid?.editModule?.editCell) return
      ej2Grid.editModule.editCell(rowIndex, field)
      if (seed == null) {
        // 进入编辑后全选，便于继续键入时覆盖
        queueMicrotask(() => {
          const input = ej2Grid?.element?.querySelector?.(
            '.e-editedbatchcell input, .e-editedbatchcell textarea, .e-input',
          ) as HTMLInputElement | null
          input?.select?.()
          input?.focus?.()
        })
        return
      }
      queueMicrotask(() => {
        const input = ej2Grid?.element?.querySelector?.(
          '.e-editedbatchcell input, .e-editedbatchcell textarea, .e-input',
        ) as HTMLInputElement | null
        if (!input) return
        input.focus()
        input.value = seed
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
    }

    const onInplaceCellClick = (event: Event) => {
      if (!inplaceEdit || inplaceEditStart === 'dblclick') return
      const cell = resolveCellTarget(event.target)
      const target = resolveCellEditTarget(cell)
      if (!target) return
      focusedEditCell = target
      if (inplaceEditStart === 'excel') {
        // 选中后把焦点留在表格，后续键入才能触发覆盖编辑
        const host = ej2Grid?.element as HTMLElement | undefined
        if (host && !host.hasAttribute('tabindex')) host.tabIndex = 0
        host?.focus?.({ preventScroll: true })
        return
      }
      beginCellEdit(target.rowIndex, target.field)
    }

    const onInplaceKeyDown = (event: KeyboardEvent) => {
      if (!inplaceEdit || inplaceEditStart !== 'excel') return
      if (ej2Grid?.isEdit) return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const target = focusedEditCell
      if (!target) return
      if (event.key === 'F2' || event.key === 'Enter') {
        event.preventDefault()
        beginCellEdit(target.rowIndex, target.field)
        return
      }
      if (event.key.length !== 1) return
      event.preventDefault()
      beginCellEdit(target.rowIndex, target.field, event.key)
    }

    const bindInplaceEditTriggers = () => {
      contentTable = ej2Grid?.getContentTable?.() ?? null
      gridHost = ej2Grid?.element ?? null
      contentTable?.addEventListener('click', onInplaceCellClick)
      gridHost?.addEventListener('keydown', onInplaceKeyDown)
    }

    const unbindInplaceEditTriggers = () => {
      contentTable?.removeEventListener('click', onInplaceCellClick)
      gridHost?.removeEventListener('keydown', onInplaceKeyDown)
      contentTable = null
      gridHost = null
      focusedEditCell = null
    }

    const compareFilterStore = createCompareColumnFilterStore()
    const compareFilterExtras = () => ({
      filterModel: props.filterModel,
      dateRangeLabels: props.dateRangeLabels,
      filterLabels: props.filterLabels,
      loadPivotDates: props.loadPivotDates,
      store: compareFilterStore,
      appContext,
    })

    /** 懒加载列筛页：不覆盖 refOptions。value → 实体，便于 labelOf / 已选项并回。 */
    const lazyPageByField = new Map<string, unknown[]>()
    const lazySeenByField = new Map<string, Map<string, unknown>>()

    const storeLazyRows = (field: MetaUiField, rows: unknown[]) => {
      const ref = field.reference
      lazyPageByField.set(field.fieldName, rows ?? [])
      if (!ref) return
      let seen = lazySeenByField.get(field.fieldName)
      if (!seen) {
        seen = new Map()
        lazySeenByField.set(field.fieldName, seen)
      }
      for (const row of rows ?? []) {
        seen.set(String(ref.valueOf(row)), row)
      }
    }

    const selectedSetValuesOfField = (field: MetaUiField) =>
      selectedSetValuesOf(
        props.filterModel?.[field.fieldName] as FieldFilter | undefined,
        field,
      )

    const findChoiceOption = (field: MetaUiField, raw: unknown) => {
      const ref = field.reference
      if (!ref) return undefined
      const key = String(raw)
      const seen = lazySeenByField.get(field.fieldName)?.get(key)
      if (seen) return seen
      return (ref.refOptions ?? []).find(item => String(ref.valueOf(item)) === key)
    }

    const choiceDataSourceOf = (field: MetaUiField) => {
      if (isLazyChoiceFilterField(field)) {
        const ref = field.reference
        const page =
          lazyPageByField.get(field.fieldName) ?? ref?.refOptions ?? []
        const seen = new Set(
          page.map(row => String(ref?.valueOf(row))),
        )
        const merged = [...page]
        for (const value of selectedSetValuesOfField(field)) {
          if (seen.has(String(value))) continue
          const row = lazySeenByField.get(field.fieldName)?.get(String(value))
          if (row) merged.push(row)
        }
        return choiceFilterRowsOf(field, merged)
      }
      return choiceFilterDataSource(field)
    }

    const loadLazyChoices = (field: MetaUiField, searchWord: string) =>
      Promise.resolve(props.searchRelative?.(field, searchWord) ?? []).then(
        rows => {
          storeLazyRows(field, rows ?? [])
          return choiceDataSourceOf(field)
        },
      )

    const openChoicePage = (field: MetaUiField, searchWord: string) => {
      const showHome = () => {
        storeLazyRows(field, field.reference?.refOptions ?? [])
        return choiceDataSourceOf(field)
      }
      if (searchWord && isLazyChoiceFilterField(field)) {
        return loadLazyChoices(field, searchWord)
      }
      const existing = field.reference?.refOptions ?? []
      if (existing.length === 0 && props.loadFilterOptions) {
        return Promise.resolve(props.loadFilterOptions(field)).then(() => {
          if (isRefOptionsComplete(field)) return choiceDataSourceOf(field)
          return showHome()
        })
      }
      if (isRefOptionsComplete(field) || !isLazyChoiceFilterField(field)) {
        return Promise.resolve(choiceDataSourceOf(field))
      }
      return Promise.resolve(showHome())
    }

    /** 首页 50 回来后写入已打开的 CheckBox（不要 getDistinct）。 */
    const bindOpenedChoiceList = (field: MetaUiField, items: unknown[], options?: any) => {
      if (options) options.dataSource = items
      const filterModule = ej2Grid?.filterModule?.filterModule
      if (filterModule?.options?.field === field.fieldName) {
        filterModule.options.dataSource = items
        filterModule.refreshCheckboxes?.()
      }
    }

    /** 引用列 CheckBox：数据与表单下拉相同（valueOf/labelOf）。
     * EJ2 默认用列值当勾选文字，Vue 下 itemTemplate 会把 label 清空。
     * 用 filter-cbox-value 把显示改成 labelOf 文本，勾选值仍是主键。 */
    const choiceCheckBoxFilter = (field: MetaUiField) => ({
      type: 'CheckBox',
      dataSource: choiceDataSourceOf(field),
    })

    const booleanCheckBoxFilter = (field: MetaUiField) => ({
      type: 'CheckBox',
      dataSource: booleanFilterRowsOf(field, props.filterLabels),
    })

    const onFilterCheckboxLabel = (args: any) => {
      const fieldName = args?.column?.field
      const field = fields.find(value => value.fieldName === fieldName)
      if (field && columnFilterKindOf(field) === 'boolean') {
        const raw =
          args?.data?.[fieldName] ??
          args?.data?.dataObj?.[fieldName] ??
          args?.value
        const text =
          args?.data?.text ??
          (raw === true || raw === 'true' || raw === 1
            ? props.filterLabels?.yes ?? '是'
            : raw === false || raw === 'false' || raw === 0
              ? props.filterLabels?.no ?? '否'
              : undefined)
        if (text != null && String(text).length) args.value = String(text)
        return
      }
      const ref = field?.reference
      const raw =
        args?.data?.[fieldName] ??
        args?.data?.dataObj?.[fieldName] ??
        args?.value
      const option = field ? findChoiceOption(field, raw) : undefined
      const text = option != null && ref ? ref.labelOf(option) : args?.data?.text
      if (text != null && String(text).length) args.value = String(text)
    }

    /** 引用选项按主键已唯一，跳过 EJ2 getDistinct。hasOne 搜索走远程。 */
    const onBeforeCheckboxRenderer = (args: any) => {
      const field = fields.find(value => value.fieldName === args?.field)
      if (!field) return
      if (columnFilterKindOf(field) === 'boolean') {
        args.executeQuery = false
        args.dataSource = booleanFilterRowsOf(field, props.filterLabels)
        return
      }
      if (!isChoiceFilterField(field)) return
      args.executeQuery = false
      if (isLazyChoiceFilterField(field)) {
        const current = choiceDataSourceOf(field)
        args.dataSource = current
        if (current.length === 0) {
          void openChoicePage(field, '').then(items => {
            args.dataSource = items
            bindOpenedChoiceList(field, items)
          })
        }
        return
      }
      const items = choiceDataSourceOf(field)
      const search = String(
        ej2Grid?.element?.querySelector?.('.e-searchinput')?.value ?? '',
      ).trim()
      args.dataSource = search
        ? items.filter(
            item =>
              String(item.text).includes(search) ||
              String(item[field.fieldName] ?? '').includes(search),
          )
        : items
    }


    /** MULTI+SET 才追加勾选。ref/hasOne 只走 CheckBox，不进比较段。 */
    const usesSetSlot = (field: MetaUiField) =>
      !field.reference?.isRef &&
      !field.reference?.hasOne &&
      hasFilterType(field, MetaUiFilterType.MULTI) &&
      hasFilterType(field, MetaUiFilterType.SET) &&
      (Boolean(field.reference?.isEnum) ||
        Boolean(props.loadFilterOptions) ||
        Boolean(
          simpleFilterTypeOf(field) === 'date' && props.loadPivotDates,
        ))

    const usesJoinSlot = (field: MetaUiField) =>
      hasFilterType(field, MetaUiFilterType.JOIN)

    type CompareControl = TextBox | NumericTextBox | DatePicker | DateTimePicker

    const numericFilterFormatOf = (field: MetaUiField) => {
      const raw =
        typeof field.formatter === 'object' && field.formatter
          ? (field.formatter as { format?: unknown }).format
          : field.formatter
      if (typeof raw !== 'string' || !raw.trim()) return undefined
      if (/^[nNcCpP](\d+)?$/.test(raw) || /[#0]/.test(raw)) return raw
      return undefined
    }

    const createCompareControl = (
      input: HTMLInputElement,
      field: MetaUiField,
    ): CompareControl => {
      const compareType = simpleFilterTypeOf(field)
      if (compareType === 'date') {
        const format = gridColumnFormat(field)
        const DateControl = SqlDataType.isDateTime(field.dataType)
          ? DateTimePicker
          : DatePicker
        const control = new DateControl({
          locale: getSyncfusionCulture(),
          format: typeof format === 'object' ? format.format : format,
          placeholder: SqlDataType.isDateTime(field.dataType)
            ? props.filterLabels?.datetime
            : props.filterLabels?.date,
          width: '100%',
        })
        control.appendTo(input)
        return control
      }
      if (compareType === 'number') {
        const control = new NumericTextBox({
          locale: getSyncfusionCulture(),
          format: numericFilterFormatOf(field),
          placeholder: '输入数值',
          showSpinButton: false,
          width: '100%',
        })
        control.appendTo(input)
        return control
      }
      const control = new TextBox({
        locale: getSyncfusionCulture(),
        width: '100%',
      })
      control.appendTo(input)
      return control
    }

    const readControlValue = (
      control?: CompareControl,
      input?: HTMLInputElement,
    ) => {
      if (control && control.value != null && control.value !== '') {
        return control.value
      }
      const inst = (input as any)?.ej2_instances?.[0] as CompareControl | undefined
      if (inst && inst.value != null && inst.value !== '') return inst.value
      const raw = input?.value?.trim()
      return raw ? raw : undefined
    }

    const writeControlValue = (
      control: CompareControl | undefined,
      input: HTMLInputElement | undefined,
      value: unknown,
      field: MetaUiField,
    ) => {
      const isDate = simpleFilterTypeOf(field) === 'date'
      const next = isDate
        ? value == null || value === ''
          ? null
          : value instanceof Date
            ? value
            : new Date(String(value))
        : value == null || value === ''
          ? ''
          : value
      if (control) {
        control.value = next as any
        control.dataBind()
        return
      }
      const inst = (input as any)?.ej2_instances?.[0] as CompareControl | undefined
      if (inst) {
        inst.value = next as any
        inst.dataBind?.()
        return
      }
      if (input) input.value = next == null ? '' : String(next)
    }

    /**
     * 只追加 EJ2 没有的：JOIN 第二段、MULTI 的 SET 勾选。第一段用 Menu 自带值框。
     */
    const multiMenuFilter = (field: MetaUiField) => {
      const kind = columnFilterKindOf(field)
      const compareType = simpleFilterTypeOf(field)
      const isNum = compareType === 'number'
      const lazySet = isLazyChoiceFilterField(field)
      const showCompare = kind !== 'set'
      const showSet = usesSetSlot(field) || (kind === 'set' && lazySet)
      const allowJoin = usesJoinSlot(field)
      let firstInput: HTMLInputElement | undefined
      let secondControl: CompareControl | undefined
      let joinSelect: HTMLSelectElement | undefined
      let setSelect: MultiSelect | undefined
      let selectedSetValues: unknown[] = []
      let dateTree: { destroy: () => void } | undefined
      let dateTreeHost: HTMLElement | undefined
      let dateTreeLoaded = false
      const isDateSet =
        compareType === 'date' && Boolean(props.loadPivotDates)
      const valuesLabel = props.filterLabels?.values

      const currentFilter = () =>
        props.filterModel?.[field.fieldName] as FieldFilter | undefined

      const compareFromCurrent = (current?: FieldFilter) => {
        if (!current || !showCompare) return undefined
        if (current.filterType === 'multi') {
          return current.filterModels.find(item => item.filterType !== 'set')
        }
        if (current.filterType === 'set') return undefined
        return current
      }

      const setFromCurrent = (current?: FieldFilter) => {
        if (!current || !showSet) return []
        if (current.filterType === 'set') return current.values
        if (current.filterType === 'multi') {
          const set = current.filterModels.find(item => item.filterType === 'set')
          return set && 'values' in set ? set.values : []
        }
        return []
      }

      const readCompare = (): FieldFilter | undefined => {
        if (!showCompare) return undefined
        const first = readControlValue(undefined, firstInput)
        const second = allowJoin
          ? readControlValue(secondControl)
          : undefined
        const op = String(argsOperator() ?? (compareType === 'text' ? 'contains' : 'equal'))
        const join = String(joinSelect?.value ?? 'and').toUpperCase() === 'OR' ? 'OR' : 'AND'
        const filterType = compareType
        const operator = gridFilterOperator(op, compareType)
        if (
          operator === 'IS_NULL' ||
          operator === 'IS_NOT_NULL' ||
          operator === 'IS_BLANK' ||
          operator === 'IS_NOT_BLANK'
        ) {
          return { filterType, operator }
        }
        if (operator === 'WITHIN') {
          return typeof first === 'string' && isDateRangeKind(first)
            ? FieldFilter.dateKind(first)
            : undefined
        }
        const toSimple = (value?: unknown) => {
          if (value == null || value === '') return undefined
          return {
            filterType,
            operator,
            value: isNum && value !== '' ? Number(value) : value,
          }
        }
        const a = toSimple(first)
        const b = toSimple(second)
        if (a && b) {
          return { filterType: 'join', operator: join, conditions: [a, b] }
        }
        return a
      }

      const setOptions = () =>
        choiceFilterDataSource(field).map(item => ({
          value: item[field.fieldName],
          label: item.text,
        }))

      let operatorDropDown: any
      const argsOperator = () => operatorDropDown?.value

      return {
        type: 'Menu',
        operator: compareType === 'text' ? 'contains' : 'equal',
        dataSource:
          showSet && !lazySet ? choiceFilterDataSource(field) : undefined,
        ui: {
          create: (args: any) => {
            operatorDropDown = args.getOptrInstance?.dropOptr
            if (
              operatorDropDown &&
              compareType === 'text' &&
              !compareFromCurrent(currentFilter())
            ) {
              operatorDropDown.value = 'contains'
              operatorDropDown.dataBind?.()
            }
            const host = document.createElement('div')
            host.className = 'mmda-filter-multi'
            const menu =
              args.target?.closest?.('.e-flmenu') instanceof HTMLElement
                ? args.target.closest('.e-flmenu')
                : args.target
            firstInput = [...(menu?.querySelectorAll?.('input') ?? [])].find(
              el => el instanceof HTMLInputElement,
            ) as HTMLInputElement | undefined
            if (showCompare && allowJoin) {
              const secondRow = document.createElement('div')
              secondRow.className = 'mmda-filter-multi__join'
              joinSelect = document.createElement('select')
              joinSelect.innerHTML =
                '<option value="and">AND</option><option value="or">OR</option>'
              const secondInput = document.createElement('input')
              secondRow.append(joinSelect, secondInput)
              host.appendChild(secondRow)
              secondControl = createCompareControl(secondInput, field)
            }

            if (showSet) {
              selectedSetValues = setFromCurrent(currentFilter())
              const setWrap = document.createElement('div')
              setWrap.className = 'mmda-filter-multi__set'
              const body = document.createElement('div')
              body.className = 'mmda-filter-multi__set-body'
              const collapse = showCompare
              const open = !collapse || selectedSetValues.length > 0
              if (collapse) {
                const toggle = document.createElement('button')
                toggle.type = 'button'
                toggle.className = 'mmda-filter-multi__set-toggle'
                toggle.textContent = valuesLabel
                toggle.setAttribute('aria-expanded', String(open))
                setWrap.classList.toggle('is-open', open)
                body.hidden = !open
                toggle.addEventListener('click', () => {
                  const next = body.hidden
                  body.hidden = !next
                  toggle.setAttribute('aria-expanded', String(next))
                  setWrap.classList.toggle('is-open', next)
                  if (next) mountDateTree()
                })
                setWrap.append(toggle, body)
              } else {
                setWrap.appendChild(body)
              }
              host.appendChild(setWrap)

              const mountDateTree = () => {
                if (!isDateSet || dateTreeLoaded || !dateTreeHost) return
                dateTreeLoaded = true
                void Promise.resolve(props.loadPivotDates?.(field)).then(
                  raw => {
                    if (!dateTreeHost) {
                      dateTreeLoaded = false
                      return
                    }
                    dateTree = createDateSetTree({
                      host: dateTreeHost,
                      days: raw,
                      checkedTokens: selectedSetValues,
                      monthLabel: props.dateRangeLabels?.month,
                      onChange: tokens => {
                        selectedSetValues = tokens
                      },
                    })
                  },
                  () => {
                    dateTreeLoaded = false
                  },
                )
              }

              if (isDateSet) {
                dateTreeHost = document.createElement('div')
                body.appendChild(dateTreeHost)
                setWrap.classList.add('is-open')
                body.hidden = false
                mountDateTree()
              } else {
                const setInput = document.createElement('input')
                setInput.className = 'mmda-filter-multi__set-input'
                body.appendChild(setInput)
                let debounce: ReturnType<typeof setTimeout> | undefined
                setSelect = new MultiSelect({
                  allowFiltering: true,
                  mode: 'CheckBox',
                  showSelectAll: true,
                  fields: { text: 'label', value: 'value' },
                  dataSource: lazySet ? [] : setOptions(),
                  value: selectedSetValues.map(value =>
                    value as string | number,
                  ),
                  placeholder: field.displayLabel,
                  locale: getSyncfusionCulture(),
                  filtering: lazySet
                    ? (e: any) => {
                        if (debounce) clearTimeout(debounce)
                        debounce = setTimeout(() => {
                          void openChoicePage(
                            field,
                            String(e.text ?? ''),
                          ).then(items => {
                            e.updateData(
                              items.map(item => ({
                                value: item[field.fieldName],
                                label: item.text,
                              })),
                            )
                          })
                        }, 300)
                      }
                    : undefined,
                  created: lazySet
                    ? () => {
                        void openChoicePage(field, '').then(items => {
                          if (!setSelect || setSelect.isDestroyed) return
                          setSelect.dataSource = items.map(item => ({
                            value: item[field.fieldName],
                            label: item.text,
                          }))
                          setSelect.dataBind?.()
                        })
                      }
                    : undefined,
                  change: (e: { value?: Array<string | number> }) => {
                    selectedSetValues = Array.isArray(e.value) ? e.value : []
                  },
                })
                setSelect.appendTo(setInput)
              }
            }
            args.target.appendChild(host)
          },
          write: () => {
            const current = currentFilter()
            const compare = compareFromCurrent(current)
            const values = setFromCurrent(current)
            if (compare?.filterType === 'join') {
              const first = compare.conditions[0]
              const second = compare.conditions[1]
              writeControlValue(
                undefined,
                firstInput,
                first && 'value' in first ? first.value : '',
                field,
              )
              writeControlValue(
                secondControl,
                undefined,
                second && 'value' in second ? second.value : '',
                field,
              )
              if (joinSelect) joinSelect.value = compare.operator.toLowerCase()
            } else if (
              compare &&
              'value' in compare &&
              isDateRangeKind(compare.value)
            ) {
              writeControlValue(undefined, firstInput, compare.value, field)
            } else if (compare && 'value' in compare) {
              writeControlValue(undefined, firstInput, compare.value, field)
            }
            if (setSelect) {
              selectedSetValues = [...values]
              setSelect.value = values.map(value => value as string | number)
              setSelect.dataBind?.()
            }
          },
          read: (args: any) => {
            const setValues = selectedSetValues
            const set =
              setValues.length
                ? { filterType: 'set' as const, operator: 'IN' as const, values: setValues }
                : undefined
            const compare = readCompare()
            const next = FieldFilter.combineCompareAndSet(compare, set)
            writeCompareColumnFilter(compareFilterStore, field.fieldName, next)
            if (!next) {
              args.fltrObj.removeFilteredColsByField?.(field.fieldName)
              return
            }
            const first =
              next.filterType === 'join'
                ? next.conditions[0]
                : next.filterType === 'multi'
                  ? next.filterModels[0]
                  : next
            const operator =
              first && 'operator' in first
                ? String(first.operator).toLowerCase()
                : 'equal'
            const value =
              first && 'value' in first
                ? first.value
                : first && 'values' in first
                  ? first.values[0]
                  : null
            args.fltrObj.filterByColumn(
              field.fieldName,
              operator === 'contains' ? 'contains' : operator,
              value ?? null,
              'and',
              true,
            )
          },
          destroy: () => {
            if (setSelect && !setSelect.isDestroyed) {
              try {
                setSelect.destroy()
              } catch {
                /* EJ2 已随筛选框拆掉 */
              }
            }
            setSelect = undefined
            selectedSetValues = []
            dateTree?.destroy()
            dateTree = undefined
            dateTreeHost = undefined
            dateTreeLoaded = false
            firstInput = undefined
            if (secondControl && !secondControl.isDestroyed) {
              try {
                secondControl.destroy()
              } catch {
                /* EJ2 已随筛选框拆掉 */
              }
            }
            secondControl = undefined
            joinSelect = undefined
          },
        },
      }
    }

    /** 列头过滤：0 走原生 Menu；ref/hasOne/enum 默认 CheckBox；JOIN / 日期 MULTI+SET 只追加增量。 */
    const columnFilter = (field: MetaUiField) => {
      const kind = columnFilterKindOf(field)
      if (kind === 'boolean') return booleanCheckBoxFilter(field)
      if (field.reference?.isRef || field.reference?.hasOne) {
        return choiceCheckBoxFilter(field)
      }
      if (usesJoinSlot(field)) return multiMenuFilter(field)
      if (usesCompareColumnFilter(field, compareFilterExtras())) {
        return sfCompareColumnFilter(field, compareFilterExtras())
      }
      if (usesSetSlot(field)) return multiMenuFilter(field)
      if (kind === 'set') {
        if (
          simpleFilterTypeOf(field) === 'date' &&
          Boolean(props.loadPivotDates)
        ) {
          return multiMenuFilter(field)
        }
        return choiceCheckBoxFilter(field)
      }
      if (field.reference?.isEnum) {
        return choiceCheckBoxFilter(field)
      }
      return simpleFilterTypeOf(field) === 'text'
        ? { type: 'Menu', operator: 'contains' }
        : { type: 'Menu' }
    }

    const formattedDisplayText = (field: MetaUiField, row: T) => {
      const text = MetaModel.displayField(row, field)
      if (text == null || text === '') return String(field.nullDisplayText ?? '')
      const prefix = field.prefix ?? ''
      const unit = resolveFieldUnit(field)
      if (field.renderer === 'QuantityUnit' && unit) {
        return `${prefix}${String(text)} ${unit}`
      }
      return `${prefix}${String(text)}${unit}`
    }

    const plainCellDisplay = (field: MetaUiField, row: T) =>
      // 索引大页：valueAccessor 可能对整页每行调用，禁止 rows.indexOf（O(n²)）。
      formattedDisplayText(field, row)

    const renderCellVNode = (field: MetaUiField, row: T) => {
      const mapped = props.fieldCellRenderers?.[field.fieldName]
      if (mapped) {
        const node = mapped(field, row)
        if (node !== undefined && node !== null) return node
      }
      if (props.renderCell) {
        const node = props.renderCell(field, row)
        if (node !== undefined && node !== null) return node
      }
      return plainCellDisplay(field, row)
    }

    // 行身份：defineEntityWithId 的 id getter。复合主键时 EJ2 只能认一列唯一键。
    const primaryKey = metaUi.primaryKey
    const compositePrimaryKey =
      typeof primaryKey === 'string' && primaryKey.includes(',')
    const listedIdField = dataFields.find(field => field.fieldName === 'id')
    const hasListedPk =
      !compositePrimaryKey &&
      dataFields.some(field => field.primaryKey === true)
    // EJ2 只认一列唯一键：有列出主键字段用它；否则用 id（已列出则标，未列出则隐藏列）
    const useIdAsEj2Pk = compositePrimaryKey || !hasListedPk
    const needHiddenIdPk = useIdAsEj2Pk && !listedIdField
    const useVirtualSelection = Boolean(pagination) && !rowDetail

    const gridColumns = [
      selectionMode === 'multiple'
        ? {
            type: 'checkbox',
            width: 36,
            minWidth: 36,
            maxWidth: 36,
            textAlign: 'Center',
            headerTextAlign: 'Center',
            allowResizing: false,
            allowGrouping: false,
            freeze: 'Left',
          }
        : null,
      {
        field: 'rowNum',
        headerText: rowNumField?.displayLabel ?? '序号',
        width: 48,
        minWidth: 44,
        maxWidth: 48,
        textAlign: 'Left',
        headerTextAlign: 'Left',
        allowSorting: false,
        allowFiltering: false,
        allowGrouping: false,
        allowEditing: false,
        freeze: 'Left',
        // EJ2 仍会插入排序/分组图标；用 class 藏掉（行号不可排、不可分组）
        customAttributes: { class: 'mmda-rownum-col' },
        // 直接绑服务器下发的 rowNum，无 template / valueAccessor
      },
      needHiddenIdPk
        ? {
            field: 'id',
            isPrimaryKey: true,
            visible: false,
            width: 0,
            minWidth: 0,
            maxWidth: 0,
            allowSorting: false,
            allowFiltering: false,
            allowGrouping: false,
            allowEditing: false,
            allowReordering: false,
          }
        : null,
      ...dataFields.map(field => {
        const textAlign = gridTextAlign(field)
        const freeze = gridFreezeOf(field)
        const templated = useTemplateCell(field)
        return {
          field: field.fieldName,
          headerText: joinListColumnLabel(field, Boolean(props.joinListMode)),
          // 列出列照抄 MetaUiField.primaryKey；复合 / 无主键列时 EJ2 只认 id
          isPrimaryKey: useIdAsEj2Pk
            ? field.fieldName === 'id'
            : field.primaryKey === true,
          type: gridColumnType(field),
          format: gridColumnFormat(field),
          textAlign,
          headerTextAlign: textAlign,
          clipMode: templated ? 'EllipsisWithTooltip' : 'Ellipsis',
          allowSorting:
            props.sortable !== false && field.sortable !== false,
          allowFiltering: showColumnFilters,
          allowGrouping: showGrouping && !pagination,
          allowReordering: Boolean(props.tableSettings),
          visible: field.listed !== false,
          freeze,
          allowEditing:
            inplaceEdit &&
            !field.readOnly &&
            columnAllowsEdit(field.fieldName),
          editType: columnEditType(field),
          edit: inplaceEdit ? referenceEditParams(field) : undefined,
          filter: columnFilter(field),
          width:
            field.listSize && field.listSize > 0
              ? field.listSize
              : DEFAULT_LIST_COLUMN_WIDTH,
          ...(templated
            ? { template: cellSlotName(field.fieldName) }
            : { valueAccessor: (_fieldName: string, data: T) =>
                plainCellDisplay(field, data),
              }),
        }
      }),
      props.showActionColumn !== false &&
      typeof (props as any).rowActions === 'function'
        ? {
            field: '__mmdaActions',
            headerText: '操作',
            // 三枚平铺按钮；showActions 时详情变为 SplitButton，略宽
            width: props.showActions === true ? 124 : 108,
            minWidth: props.showActions === true ? 124 : 108,
            maxWidth: props.showActions === true ? 124 : 108,
            textAlign: 'Right',
            headerTextAlign: 'Right',
            allowSorting: false,
            allowFiltering: false,
            allowGrouping: false,
            allowResizing: false,
            freeze: 'Right',
            customAttributes: { class: 'mmda-actions-col' },
            template: 'mmdaCell_actions',
          }
        : null,
    ].filter(Boolean)

    const cellSlots = Object.fromEntries(
      dataFields.filter(useTemplateCell).map(field => [
        cellSlotName(field.fieldName),
        (scope: { data?: T } | T) => {
          const row = ((scope as any)?.data ?? scope) as T
          const align = gridTextAlign(field)
          const content = renderCellVNode(field, row)
          // column.template 时 EJ2 的 textAlign 管不到自定义内容，需包一层对齐
          return h(
            'div',
            {
              class: [
                'mmda-cell',
                `mmda-cell--${gridTextAlignCss(align)}`,
              ],
              style: {
                textAlign: gridTextAlignCss(align),
                width: '100%',
              },
            },
            content as any,
          )
        },
      ]),
    )

    if (
      props.showActionColumn !== false &&
      typeof (props as any).rowActions === 'function'
    ) {
      cellSlots.mmdaCell_actions = (scope: { data?: T } | T) => {
        const row = ((scope as any)?.data ?? scope) as T
        const actions = (props as any).rowActions(row) as any[]
        const showActionMenu = props.showActions === true
        const dividerIndex = actions.findIndex(action => action?.divider)
        const standard =
          dividerIndex < 0 ? actions : actions.slice(0, dividerIndex)
        const custom =
          showActionMenu && dividerIndex >= 0
            ? actions.slice(dividerIndex + 1)
            : []
        const edit = standard.find(action => action?.name === 'edit')
        const remove = standard.find(action => action?.name === 'delete')
        const details = standard.find(action => action?.name === 'details')
        const remaining = showActionMenu
          ? standard.filter(
              action =>
                action?.name !== 'edit' &&
                action?.name !== 'delete' &&
                action?.name !== 'details',
            )
          : []
        const popupActions = [
          ...remaining,
          ...(remaining.length && custom.length ? [{ divider: true }] : []),
          ...custom,
        ]
        const run = (action?: any) => action?.onAction?.()
        const enabled = (action?: any) =>
          action == null ||
          !(
            action.disabled === true ||
            (typeof action.canDo === 'function' && action.canDo(row) === false) ||
            action.canDo === false
          )
        // 索引大页虚拟行仍会挂操作列：用原生 button，避免每行 3× EJ2 ButtonComponent。
        const flatIconButton = (
          action: any | undefined,
          name: 'edit' | 'delete' | 'details',
        ) => {
          if (!action) {
            return h('span', {
              class:
                name === 'details'
                  ? 'mmda-row-details-placeholder'
                  : 'mmda-row-action-placeholder',
              'aria-hidden': 'true',
            })
          }
          const iconCss = action.icon || factory.resolveIcon(name)
          return h(
            'button',
            {
              type: 'button',
              class: 'e-btn e-flat e-round mmda-row-action',
              title: action.label,
              disabled: !enabled(action),
              onClick: () => {
                if (!enabled(action)) return
                run(action)
              },
            },
            [h('span', { class: ['e-btn-icon', iconCss] })],
          )
        }

        const detailsNode =
          details && showActionMenu && popupActions.length
            ? h(SplitButtonComponent as any, {
                iconCss: details.icon || factory.resolveIcon('details'),
                cssClass:
                  'mmda-split--flat e-caret-hide-primary mmda-row-details',
                title: details.label,
                items: popupActions.map(action => normalizeAction(action)),
                click: () => run(details),
                select: (args: any) => {
                  const found = findAction(
                    popupActions,
                    args.item?.id ?? args.item?.text,
                  )
                  run(found)
                },
              })
            : flatIconButton(details, 'details')

        if (!edit && !details && remove) {
          return h(
            'div',
            {
              class: 'mmda-row-actions',
              onClick: (event: Event) => event.stopPropagation(),
              onMousedown: (event: Event) => event.stopPropagation(),
            },
            [flatIconButton(remove, 'delete')],
          )
        }

        return h(
          'div',
          {
            class: 'mmda-row-actions',
            onClick: (event: Event) => event.stopPropagation(),
            onMousedown: (event: Event) => event.stopPropagation(),
          },
          [
            flatIconButton(edit, 'edit'),
            flatIconButton(remove, 'delete'),
            detailsNode,
          ],
        )
      }
    }

    const rowIdOf = (row: any) => {
      if (row == null) return ''
      const id = row.id
      if (id != null && String(id) !== '') return String(id)
      if (!primaryKey) return ''
      if (compositePrimaryKey) {
        return primaryKey
          .split(',')
          .map(key => String(row[key.trim()] ?? ''))
          .join(',')
      }
      return String(row[primaryKey] ?? '')
    }

    const notifySelection = (records: T[]) => {
      props.onSelectionChange?.(records)
      props.onSelect?.(records)
    }

    /** 无虚拟化：用 getSelectedRecords 整表同步。 */
    const syncSelection = (records: T[]) => {
      const current = (props.selectedItems ?? EMPTY_SELECTION) as T[]
      if (
        current === records ||
        (current.length === records.length &&
          current.every((item, index) => item === records[index]))
      ) {
        return
      }
      if (Array.isArray(props.selectedItems)) {
        props.selectedItems.splice(0, props.selectedItems.length, ...records)
      }
      notifySelection(records)
    }

    /** 虚拟化：按 id 并入 selectedItems（索引与选择对话框共用，禁止整表替换）。 */
    const mergeSelectById = (added: T[]) => {
      if (!Array.isArray(props.selectedItems) || !added.length) return
      const list = props.selectedItems as T[]
      if (selectionMode === 'single') {
        const next = added[0]
        if (!next) return
        if (list.length === 1 && rowIdOf(list[0]) === rowIdOf(next)) return
        list.splice(0, list.length, next)
        notifySelection(list.slice())
        return
      }
      const have = new Set(list.map(rowIdOf).filter(Boolean))
      let changed = false
      for (const row of added) {
        const id = rowIdOf(row)
        if (!id || have.has(id)) continue
        have.add(id)
        list.push(row)
        changed = true
      }
      if (changed) notifySelection(list.slice())
    }

    /** 虚拟化：按 id 从 selectedItems 删掉（仅用户取消，非换窗卸行）。 */
    const mergeDeselectById = (removed: T[]) => {
      if (!Array.isArray(props.selectedItems) || !removed.length) return
      const removeIds = new Set(
        removed.map(rowIdOf).filter(id => id !== ''),
      )
      if (!removeIds.size) return
      const list = props.selectedItems as T[]
      let changed = false
      for (let i = list.length - 1; i >= 0; i--) {
        if (removeIds.has(rowIdOf(list[i]))) {
          list.splice(i, 1)
          changed = true
        }
      }
      if (changed) notifySelection(list.slice())
    }

    const eventRows = (args: any): T[] => {
      const data = args?.data
      if (Array.isArray(data)) return data as T[]
      if (data) return [data as T]
      return []
    }

    /** 表头全选：EJ2 只勾可视窗；业务层补齐/去掉当前服务端页。 */
    const syncHeaderPageSelection = (checked: boolean) => {
      if (!useVirtualSelection || selectionMode !== 'multiple') return
      if (checked) mergeSelectById(rows.slice() as T[])
      else mergeDeselectById(rows.slice() as T[])
    }

    const layoutRev = props.tableSettings?.rev?.value ?? 0
    const listGroupKey = String(metaUi.objName ?? primaryKey ?? 'list')
    const gridKey = `mmda-grid-${listGroupKey}-${layoutRev}`

    const resolveEj2Grid = () => {
      const grid = ej2Grid
      if (!grid) return null
      if (
        typeof grid.hideSpinner === 'function' ||
        typeof grid.getColumns === 'function'
      ) {
        return grid
      }
      return grid.ej2Instances ?? grid
    }

    /** custom binding（result/count）在 dataStateChange 后会转圈等待 dataSource 回写。
     * 索引页：count=当前服务端页行数；result 必须是虚拟窗口切片，
     * 若把整页 1000 行塞进 result，EJ2 会当“当前视图”几乎全量渲染，虚拟滚动形同失效。
     */
    let virtualSkip = 0
    const virtualWindow = (skip = virtualSkip, take = VIRTUAL_ROW_PAGE_SIZE) => {
      const start = Math.max(0, Number(skip) || 0)
      const size = Math.max(1, Number(take) || VIRTUAL_ROW_PAGE_SIZE)
      return {
        result: rows.slice(start, start + size),
        count: rows.length,
      }
    }
    const resolveCustomBinding = (state?: any) => {
      if (!virtualized) return
      const grid = resolveEj2Grid()
      if (!grid) return
      if (state && typeof state.skip === 'number') virtualSkip = state.skip
      const take =
        typeof state?.take === 'number' ? state.take : VIRTUAL_ROW_PAGE_SIZE
      // 换窗只换切片；勾选靠 persistSelection，不 selectRows / spinner / mask
      grid.dataSource = virtualWindow(virtualSkip, take)
    }

    const syncRowsFromSource = () => {
      rows.splice(0, rows.length, ...sourceRows)
    }
    const rebindDataSource = () => {
      const grid = resolveEj2Grid()
      if (!grid) return
      if (virtualized) {
        grid.dataSource = virtualWindow(virtualSkip)
      } else {
        grid.dataSource = rows.slice()
      }
    }
    const rebindPager = () => {
      if (!pagination) return
      const root =
        gridHost ??
        (resolveEj2Grid()?.element as HTMLElement | undefined)?.closest?.(
          '.mmda-pagable-table',
        )
      const pager = (root as HTMLElement | null | undefined)?.querySelector?.(
        '.e-pager',
      ) as { ej2_instances?: Array<{ currentPage?: number; pageSize?: number; totalRecordsCount?: number; dataBind?: () => void }> } | null
      const instance = pager?.ej2_instances?.[0]
      if (!instance) return
      instance.totalRecordsCount = pagination.recordCount ?? 0
      instance.pageSize = pagination.pageSize ?? instance.pageSize
      instance.currentPage = pagination.pageNo ?? 1
      instance.dataBind?.()
    }
    const listHost = {
      applyRow(entity: Record<string, unknown>) {
        const pk = String(primaryKey ?? 'id')
        const id = entity[pk] ?? entity.id
        if (id == null || String(id) === '') return
        if (!resolveEj2Grid()) return
        syncRowsFromSource()
        const key = String(id)
        const index = rows.findIndex(
          row => String((row as any)[pk] ?? (row as any).id) === key,
        )
        if (index >= 0) Object.assign(rows[index] as object, entity)
        // 详情/编辑回来只改当前行，不要把 virtualSkip 清零。
        rebindDataSource()
      },
      insertAtZero(_entity: Record<string, unknown>) {
        virtualSkip = 0
        syncRowsFromSource()
        rebindDataSource()
      },
      applyRemove(_id: string) {
        syncRowsFromSource()
        if (pagination) {
          virtualSkip = Math.min(virtualSkip, Math.max(0, rows.length - 1))
        }
        rebindDataSource()
      },
      rebind() {
        syncRowsFromSource()
        if (pagination) {
          virtualSkip = 0
        }
        rebindDataSource()
        rebindPager()
        paintFilterFunnels(resolveEj2Grid() ?? ej2Grid, liveFilterModel())
      },
    }
    props.onIndexTableHostReady?.(listHost)

    const runRemoteQuery = (work: unknown) => {
      void settleRemoteListQuery(work).finally(() => {
        // assignPagedList 改的是调用方 list；rows 是快照，不先同步会把本地筛过的表盖回全量。
        syncRowsFromSource()
        if (virtualized) void resolveCustomBinding()
        else rebindDataSource()
      })
    }

    const commitFilterModel = (model: ReturnType<typeof filterModelFromGridEvent>) => {
      if (model === undefined) return
      if (!props.onFilterModelChange) return
      if (sameFilterModel(model, liveFilterModel())) return
      virtualSkip = 0
      if (pagination) runRemoteQuery(props.onFilterModelChange(model))
      else props.onFilterModelChange(model)
    }

    const persistLayoutFromGrid = () => {
      if (!props.tableSettings) return
      const grid = resolveEj2Grid()
      if (!grid) return
      syncMetaUiFromGridColumns(grid, metaUi)
      props.tableSettings.persist()
    }

    const rowActionsOf = (props as any).rowActions
    const hasRowActions = typeof rowActionsOf === 'function'
    const autoFitVisibleColumns = () => {
      const grid = resolveEj2Grid()
      if (!grid) return
      const fields = (grid.getColumns?.() ?? [])
        .filter(
          (column: any) =>
            column.visible !== false &&
            isPersistableListColumn(column.field) &&
            column.type !== 'checkbox',
        )
        .map((column: any) => column.field)
      try {
        if (fields.length) grid.autoFitColumns(fields)
        else grid.autoFitColumns()
      } catch {
        /* ignore */
      }
      persistLayoutFromGrid()
    }
    const layoutActions = () => {
      const items: any[] = [
        {
          name: 'autoFitColumns',
          label: translateMessage('action.autoFitColumns'),
          icon: deps.resolveIcon('auto-fit-columns'),
          onAction: autoFitVisibleColumns,
        },
      ]
      if (props.tableSettings?.open) {
        items.push({
          name: 'tableSettings',
          label: translateMessage('action.tableSettings'),
          icon: deps.resolveIcon('settings'),
          onAction: () => props.tableSettings?.open?.(),
        })
      }
      return items
    }
    const menuActionsOf = (row?: T) => {
      const rowItems =
        row && hasRowActions ? (rowActionsOf(row) ?? []) : []
      const layout = layoutActions()
      if (!rowItems.length) return layout
      return [...rowItems, { divider: true }, ...layout]
    }
    const toGridMenuItems = (actions: any[], row?: T) =>
      contextMenuItemsOf({ items: actions }, row).map(item => {
        if (item.divider) return { separator: true, target: '.e-content' }
        const icon = item.icon
          ? deps.resolveIcon(item.icon) || item.icon
          : undefined
        return {
          id: String(item.name ?? item.id ?? item.label ?? ''),
          text: item.label,
          iconCss: icon,
          target: '.e-content',
          disabled: item.disabled === true,
        }
      })
    const hasContextMenu = hasRowActions || Boolean(props.tableSettings)
    const applyRowContextMenu = (args: any) => {
      const type = String(args?.type ?? '').toLowerCase()
      const row = args?.rowInfo?.rowData as T | undefined
      if (type === 'header' || type === 'pager' || !row) {
        args.cancel = true
        return
      }
      const items = toGridMenuItems(menuActionsOf(row), row)
      if (!items.length) {
        args.cancel = true
        return
      }
      const menu = ej2Grid?.contextMenuModule?.contextMenu
      if (menu) {
        menu.items = items
        menu.dataBind?.()
      }
      if (Array.isArray(args.items)) {
        args.items.splice(0, args.items.length, ...items)
      }
    }
    const invokeRowContextMenu = (args: any) => {
      const row = args?.rowInfo?.rowData as T | undefined
      const id = String(args?.item?.id ?? '')
      const text = String(args?.item?.text ?? '')
      const item = findContextMenuItem(
        contextMenuItemsOf({ items: menuActionsOf(row) }, row),
        entry =>
          entry.name === id || entry.id === id || entry.label === text,
      )
      if (item) invokeContextMenuItem({}, item)
    }

    const gridVNode = h(
      SfGrid,
      {
        key: gridKey,
        // 当前页超过 100 行才开虚拟滚动；否则本地数组。改行靠新 dataSource 引用刷新。
        dataSource: virtualized
          ? virtualWindow(0, VIRTUAL_ROW_PAGE_SIZE)
          : rows,
        locale: getSyncfusionCulture(),
        allowPaging: false,
        enableVirtualization: virtualized,
        // 本地窗口切片已瞬时可得，虚拟滚动勿闪 skeleton
        enableVirtualMaskRow: false,
        // Material 3 Theme Studio 默认无斑马纹，交替行会让分页器/表体色阶显得碎
        enableAltRow: false,
        // 索引页：占满父容器，行区内部滚动，分页条贴底（避免撑出页面滚动）
        height: pagination ? '100%' : props.height,
        pageSettings: virtualized
          ? {
              pageSize: VIRTUAL_ROW_PAGE_SIZE,
            }
          : undefined,
        allowSorting: props.sortable !== false,
        allowFiltering: showColumnFilters,
        allowGrouping: showGrouping && !pagination,
        editSettings: inplaceEdit
          ? {
              allowEditing: true,
              allowAdding: false,
              allowDeleting: false,
              mode: 'Batch',
              showConfirmDialog: false,
              allowNextRowEdit: true,
            }
          : undefined,
        groupSettings: undefined,
        // 普通字段 Filter Menu；枚举/引用列在 columns[].filter 覆盖为 CheckBox。
        filterSettings: showColumnFilters
          ? { type: 'Menu', operators: menuFilterOperators() }
          : undefined,
        // 用 columns 数组而非 ColumnDirective，避免 Vue 指令序列化丢掉 filter.ui 函数。
        columns: gridColumns,
        showColumnChooser: false,
        allowReordering: Boolean(props.tableSettings),
        allowResizing: true,
        allowSelection:
          Boolean(selectionMode) ||
          (inplaceEdit && inplaceEditStart === 'excel'),
        selectionSettings: selectionMode
          ? {
              type: selectionMode === 'multiple' ? 'Multiple' : 'Single',
              persistSelection: true,
              // false：点行可选；勿 checkboxOnly
              checkboxOnly: false,
              // ResetOnRowClick：无修饰点行替换选区；Ctrl/Shift 由 Grid 原生处理
              ...(selectionMode === 'multiple'
                ? { checkboxMode: 'ResetOnRowClick' }
                : {}),
            }
          : inplaceEdit && inplaceEditStart === 'excel'
            ? { mode: 'Cell', type: 'Single' }
            : { type: 'None' },
        cssClass: ['mmda-table', props.class].filter(Boolean).join(' '),
        ...(hasContextMenu
          ? {
              contextMenuItems: [
                { text: ' ', id: 'mmda-row-action', target: '.e-content' },
              ],
              contextMenuOpen: applyRowContextMenu,
              contextMenuClick: invokeRowContextMenu,
            }
          : {}),
        dataBound: () => {
          logListPaint('ej2-dataBound', { rows: rows.length })
          paintFilterFunnels(resolveEj2Grid() ?? ej2Grid, liveFilterModel())
          if (rowDetail) expandAllDetails()
        },
        ...(rowDetail
          ? {
              detailTemplate: '<div class="mmda-row-detail-host"></div>',
              detailDataBound: bindRowDetail,
            }
          : {}),
        ref: (comp: any) => {
          const grid = comp?.ej2Instances ?? comp ?? null
          if (ej2Grid && ej2Grid !== grid) {
            ej2Grid.off?.('filter-cbox-value', onFilterCheckboxLabel)
            ej2Grid.off?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          }
          ej2Grid = grid
          ej2Grid?.on?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.on?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
        },
        created: () => {
          logListPaint('ej2-created', { rows: rows.length })
          ej2Grid?.on?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.on?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          paintFilterFunnels(resolveEj2Grid() ?? ej2Grid, liveFilterModel())
          queueMicrotask(() => bindInplaceEditTriggers())
        },
        resizeStop: () => persistLayoutFromGrid(),
        destroyed: () => {
          ej2Grid?.off?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.off?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          flushPendingCellEdit()
          unbindInplaceEditTriggers()
          unmountRowDetails()
          props.onIndexTableHostReady?.(null)
        },
        rowSelected: (args: any) => {
          if (useVirtualSelection) {
            // 换窗卸行/程序化：isInteracted 非 true，忽略
            if (args?.isInteracted !== true) return
            mergeSelectById(eventRows(args))
            return
          }
          const grid = args.grid ?? args.sender
          const records = (grid?.getSelectedRecords?.() ??
            (args.data ? [args.data] : [])) as T[]
          syncSelection(records)
        },
        rowDeselected: (args: any) => {
          if (useVirtualSelection) {
            if (args?.isInteracted !== true) return
            mergeDeselectById(eventRows(args))
            return
          }
          const grid = args.grid ?? args.sender
          const records = (grid?.getSelectedRecords?.() ?? []) as T[]
          syncSelection(records)
        },
        checkBoxChange: (args: any) => {
          if (!useVirtualSelection || selectionMode !== 'multiple') return
          const target = args?.target as HTMLElement | undefined
          const isHeader =
            Boolean(target?.classList?.contains('e-checkselectall')) ||
            Boolean(target?.closest?.('.e-checkselectall'))
          if (!isHeader) return
          syncHeaderPageSelection(args?.checked === true)
        },
        cellSelected: (args: any) => {
          if (!inplaceEdit || inplaceEditStart !== 'excel') return
          const field = args?.columnName ?? args?.cellIndex?.cellIndex
          const rowIndex = Number(args?.rowIndex ?? args?.cellIndex?.rowIndex)
          const columns = ej2Grid?.getColumns?.() ?? []
          const resolvedField =
            typeof field === 'string'
              ? field
              : columns[Number(field)]?.field
          if (
            Number.isFinite(rowIndex) &&
            resolvedField &&
            columnAllowsEdit(resolvedField)
          ) {
            focusedEditCell = { rowIndex, field: resolvedField }
          }
        },
        cellEdit: (args: any) => {
          if (!inplaceEdit) return
          const fieldName = args?.column?.field ?? args?.columnName
          const field = fields.find(value => value.fieldName === fieldName)
          const rowIndex = rowIndexFrom(args)
          const row = rowIndex >= 0 ? sourceRows[rowIndex] : args.rowData
          if (rowIndex >= 0 && fieldName) {
            focusedEditCell = { rowIndex, field: fieldName }
          }
          if (!field || !rowAllowsEdit(field, row)) {
            args.cancel = true
            return
          }
          refreshRefEditParams(args?.column, field)
        },
        cellSave: (args: any) => {
          if (!inplaceEdit) return
          const fieldName = args?.column?.field ?? args?.columnName
          const field = fields.find(value => value.fieldName === fieldName)
          const row = sourceRowAt(args)
          if (!field || !row) return
          if (
            saveCellEdit(field, row, args.value, args.previousValue) === false
          ) {
            args.cancel = true
          }
        },
        actionBegin: (args: any) => {
          const requestType = args?.requestType
          if (
            requestType === 'filterchoicerequest' ||
            requestType === 'filtersearchbegin'
          ) {
            args.filterChoiceCount = Math.max(
              Number(args.filterChoiceCount) || 0,
              3000,
            )
          }
          if (requestType === 'filterBeforeOpen') {
            const fieldName = args?.filterModel?.options?.field
            const field = fields.find(value => value.fieldName === fieldName)
            if (!field || !args?.filterModel?.options) return
            const customOps = args.filterModel.customFilterOperators
            keepAgMenuOperators(customOps?.stringOperator, AG_MENU_STRING_OPERATORS)
            applyMenuOperators(customOps?.numberOperator, AG_MENU_NUMBER_OPERATORS)
            applyMenuOperators(customOps?.dateOperator, AG_MENU_DATE_OPERATORS)
            applyMenuOperators(customOps?.datetimeOperator, AG_MENU_DATE_OPERATORS)
            if (columnFilterKindOf(field) === 'boolean') {
              args.filterModel.options.dataSource = booleanFilterRowsOf(
                field,
                props.filterLabels,
              )
            } else if (isChoiceFilterField(field)) {
              applyChoiceFilterExistingPredicate(
                args.filterModel,
                field.fieldName,
                selectedSetValuesOfField(field),
              )
              void openChoicePage(field, '').then(items => {
                bindOpenedChoiceList(field, items, args.filterModel.options)
              })
            }
          }
        },
        dataStateChange: (state: any) => {
          const requestType = state?.action?.requestType
          if (requestType === 'virtualscroll') {
            void resolveCustomBinding(state)
            return
          }
          if (requestType === 'sorting' && props.sortable !== false) {
            runRemoteQuery(
              props.onSort?.(
                (state.sorted ?? []).map((sort: any) => ({
                  sortBy: sort.name,
                  sortOrder:
                    sort.direction === 'descending'
                      ? SortOrder.DESC
                      : SortOrder.ASC,
                })),
              ),
            )
            return
          }
          if (
            requestType === 'filterchoicerequest' ||
            requestType === 'filtersearchbegin' ||
            requestType === 'stringfilterrequest'
          ) {
            const fieldName =
              state?.action?.filterModel?.options?.field ??
              state?.filteredColumns?.[0]?.field ??
              state?.where?.[0]?.field
            if (typeof state.dataSource === 'function' && fieldName) {
              const field = fields.find(value => value.fieldName === fieldName)
              const search = String(
                state?.action?.filterModel?.searchValue ??
                  state?.action?.currentFilterObject?.value ??
                  ej2Grid?.element?.querySelector?.('.e-searchinput')?.value ??
                  '',
              ).trim()
              const respond = (items: unknown[]) => {
                state.dataSource(items)
              }
              if (field && columnFilterKindOf(field) === 'boolean') {
                const items = booleanFilterRowsOf(field, props.filterLabels)
                respond(
                  search
                    ? items.filter(item => String(item.text).includes(search))
                    : items,
                )
              } else if (field && isChoiceFilterField(field)) {
                void openChoicePage(field, search).then(respond)
              } else {
                respond([])
              }
            }
            return
          }
          if (requestType === 'filtering' && props.onFilterModelChange) {
            commitFilterModel(
              filterModelFromGridEvent(
                state,
                ej2Grid,
                fields,
                compareFilterStore,
              ),
            )
          }
        },
        actionComplete: (args: any) => {
          const requestType = args?.requestType
          if (requestType === 'reorder' || requestType === 'columnstate') {
            persistLayoutFromGrid()
          }
          if (
            !pagination &&
            requestType === 'sorting' &&
            props.sortable !== false
          ) {
            const sorts = args.columnName
              ? [
                  {
                    sortBy: args.columnName,
                    sortOrder:
                      args.direction === 'Descending'
                        ? SortOrder.DESC
                        : SortOrder.ASC,
                  },
                ]
              : []
            props.onSort?.(sorts)
          }
          if (requestType === 'filtering' && props.onFilterModelChange) {
            // 虚拟滚动走 dataStateChange；每页不足开虚拟时 EJ2 只本地筛，必须在这里写回。
            if (virtualized) return
            commitFilterModel(
              filterModelFromGridEvent(
                args,
                resolveEj2Grid() ?? ej2Grid,
                fields,
                compareFilterStore,
              ),
            )
          }
        },
        recordDoubleClick: (args: any) => {
          const fieldName = args?.column?.field ?? args?.columnName
          // 可编辑单元格的双击交给 EJ2 Batch 编辑；其它单元格仍打开完整弹窗。
          if (inplaceEdit && fieldName && columnAllowsEdit(fieldName)) return
          const rowIndex = rowIndexFrom(args)
          const row = rowIndex >= 0 ? sourceRows[rowIndex] : args.rowData
          props.onItemDoubleClick?.(row)
        },
        recordClick: (args: any) => {
          const rowIndex = rowIndexFrom(args)
          const row = rowIndex >= 0 ? sourceRows[rowIndex] : args.rowData
          props.onItemClick?.(row)
        },
      },
      cellSlots,
    )

    const withLoading = (node: VNode) =>
      h(
        SfGridLoadingHost as any,
        { loading: props.loading ?? false },
        () => node,
      )

    if (!pagination) return withLoading(gridVNode)

    // 服务端分页：Pager 与 Grid 分离（Grid 开虚拟滚动不能再用 allowPaging）
    return h(
      'div',
      { class: uiCssClass('pagable-table') },
      [
        withLoading(gridVNode),
        factory.paginator(pagination, {
          onPage: props.onPage ?? (() => undefined),
          pageSizeOptions: props.pageSizeOptions,
        }),
      ],
    )
  }
}
