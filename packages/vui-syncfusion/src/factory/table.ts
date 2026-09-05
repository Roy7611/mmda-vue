// @ts-nocheck
import { h, nextTick, toRaw, unref } from 'vue'
import {
  DEFAULT_PAGE_SIZE,
  MetaModel,
  SortOrder,
  SqlDataType,
  type MetaUi,
  type MetaUiField,
} from '@mmda/core'
import {
  gridFreezeOf,
  readStoredPageSize,
  type UiListPropsType,
  type UiPaginatorPropsType,
} from '@mmda/vui'
import { NumericTextBox } from '@syncfusion/ej2-inputs'
import { DatePicker, DateTimePicker } from '@syncfusion/ej2-calendars'
import { SplitButtonComponent } from '@syncfusion/ej2-vue-splitbuttons'
import { getSyncfusionCulture } from '../syncfusion_i18n'
import { SfGrid, SfGridLoadingHost, syncMetaUiFromGridColumns } from './grid'
import {
  EMPTY_SELECTION,
  VIRTUAL_ROW_PAGE_SIZE,
  DEFAULT_LIST_COLUMN_WIDTH,
  cellSlotName,
  choiceFilterDataSource,
  columnEditType,
  gridColumnFormat,
  gridColumnType,
  gridFiltersToModel,
  gridTextAlign,
  gridTextAlignCss,
  isChoiceFilterField,
  listedFields,
  normalizeAction,
  findAction,
  isEnumReference,
  referenceEditParams,
  refreshReferenceEditParams,
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
  return <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaui)
    const rowNumField = fields.find(field => field.fieldName === 'rowNum')
    const dataFields = fields.filter(field => field.fieldName !== 'rowNum')
    const restrictTemplates = Array.isArray(props.templateCellFields)
    const templateCellFieldNames = new Set(props.templateCellFields ?? [])
    const useTemplateCell = (field: MetaUiField) =>
      !restrictTemplates ||
      templateCellFieldNames.has(field.fieldName) ||
      Boolean(props.customCellRenderers?.[field.fieldName])
    const selectionMode = props.selectionMode
    const showColumnFilters =
      props.filterDisplay === 'row' || props.filterDisplay === 'menu'
    const showGrouping = false
    const pagination = props.pagination
    const editableFields = new Set(props.editableFields ?? [])
    const inplaceEdit =
      props.inplaceEdit === true && !pagination && editableFields.size > 0
    const inplaceEditStart = props.inplaceEditStart ?? 'excel'

    // dataSource 用快照（新引用才能驱动 EJ2 刷新）；写回用 sourceRows = 调用方传入的集合。
    const sourceRows = Array.isArray(model) ? (model as T[]) : []
    const rows = Array.isArray(model)
      ? (Array.from(toRaw(model) as T[]) as T[])
      : []

    let ej2Grid: any = null
    let focusedEditCell: { rowIndex: number; field: string } | null = null
    let contentTable: HTMLElement | null = null
    let gridHost: HTMLElement | null = null

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
      if (!Number.isFinite(rowIndex) || !field || !editableFields.has(field)) {
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

    type RangeValue = { min?: unknown; max?: unknown }
    const pendingRanges = new Map<string, RangeValue>()

    /** 引用列 CheckBox：数据与表单下拉相同（valueOf/labelOf）。
     * EJ2 默认用列值当勾选文字，Vue 下 itemTemplate 会把 label 清空。
     * 用 filter-cbox-value 把显示改成 labelOf 文本，勾选值仍是主键。 */
    const choiceCheckBoxFilter = (field: MetaUiField) => ({
      type: 'CheckBox',
      dataSource: choiceFilterDataSource(field),
    })

    const onFilterCheckboxLabel = (args: any) => {
      const fieldName = args?.column?.field
      const field = fields.find(value => value.fieldName === fieldName)
      const ref = field?.reference
      const raw =
        args?.data?.[fieldName] ??
        args?.data?.dataObj?.[fieldName] ??
        args?.value
      const option = ref?.refOptions?.find(item => ref.valueOf(item) === raw)
      const text = option != null ? ref.labelOf(option) : args?.data?.text
      if (text != null && String(text).length) args.value = String(text)
    }

    /** 引用选项按主键已唯一，跳过 EJ2 getDistinct。 */
    const onBeforeCheckboxRenderer = (args: any) => {
      const field = fields.find(value => value.fieldName === args?.field)
      if (!field || !isChoiceFilterField(field)) return
      args.executeQuery = false
      const items = choiceFilterDataSource(field)
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

    /**
     * 数值/日期范围过滤：仍使用 EJ2 Menu 与原生输入控件；只有选择 BETWEEN
     * 时才显示第二个输入框。Grid 本身不认识 BETWEEN，因此 read 先发下界，
     * actionBegin 再补上界谓词。
     */
    const rangeMenuFilter = (field: MetaUiField) => {
      const isDate = SqlDataType.isDate(field.dataType)
      const isDateTime = SqlDataType.isDateTime(field.dataType)
      let firstControl: NumericTextBox | DatePicker | DateTimePicker | undefined
      let secondControl: NumericTextBox | DatePicker | DateTimePicker | undefined
      let secondWrap: HTMLElement | undefined
      let operatorDropDown: any
      const menuOperatorListeners: Array<{
        el: HTMLElement
        type: string
        fn: EventListener
      }> = []

      const setControlValue = (
        control: NumericTextBox | DatePicker | DateTimePicker | undefined,
        value: unknown,
      ) => {
        if (!control) return
        if (isDate) {
          const date =
            value == null || value === ''
              ? null
              : value instanceof Date
                ? value
                : new Date(String(value))
          control.value =
            date && !Number.isNaN(date.getTime()) ? date : null
        } else {
          control.value =
            value == null || value === '' ? null : Number(value)
        }
        control.dataBind()
      }

      /** 元数据 formatter 可能是展示串，不能直接喂给 NumericTextBox。 */
      const numericFilterFormat = () => {
        const raw =
          typeof field.formatter === 'object' && field.formatter
            ? (field.formatter as { format?: unknown }).format
            : field.formatter
        if (typeof raw !== 'string' || !raw.trim()) return undefined
        // EJ2 数字格式：n/c/p/#0.00 等；其它字符串常会抛 Format options invalid
        if (/^[nNcCpP](\d+)?$/.test(raw) || /[#0]/.test(raw)) return raw
        return undefined
      }

      const createControl = (input: HTMLInputElement) => {
        if (isDate) {
          const format = gridColumnFormat(field)
          const DateControl = isDateTime ? DateTimePicker : DatePicker
          const control = new DateControl({
            locale: getSyncfusionCulture(),
            format:
              typeof format === 'object'
                ? format.format
                : format,
            placeholder: isDateTime ? '选择日期时间' : '选择日期',
            width: '100%',
          })
          control.appendTo(input)
          return control
        }
        const control = new NumericTextBox({
          locale: getSyncfusionCulture(),
          format: numericFilterFormat(),
          placeholder: '输入数值',
          showSpinButton: false,
          width: '100%',
        })
        control.appendTo(input)
        return control
      }

      const syncBetweenVisibility = () => {
        if (!secondWrap) return
        secondWrap.hidden = operatorDropDown?.value !== 'between'
      }

      return {
        type: 'Menu',
        ui: {
          create: (args: any) => {
            const host = document.createElement('div')
            host.className = 'mmda-sf-filter-range'
            const firstWrap = document.createElement('div')
            firstWrap.className = 'mmda-sf-filter-range__value'
            const firstInput = document.createElement('input')
            firstInput.className = 'e-flmenu-input'
            firstWrap.appendChild(firstInput)

            secondWrap = document.createElement('div')
            secondWrap.className =
              'mmda-sf-filter-range__value mmda-sf-filter-range__value--to'
            const separator = document.createElement('span')
            separator.className = 'mmda-sf-filter-range__separator'
            separator.textContent = '至'
            const secondInput = document.createElement('input')
            secondWrap.append(separator, secondInput)
            host.append(firstWrap, secondWrap)
            args.target.appendChild(host)

            firstControl = createControl(firstInput)
            secondControl = createControl(secondInput)
            operatorDropDown = args.getOptrInstance?.dropOptr
            // 不要改 dropOptr.change：Vue 代理 set 会走进 EJ2 Observer.off(null)。
            const menu = args.target?.closest?.('.e-flmenu') ?? args.target
            if (menu instanceof HTMLElement) {
              const onOperatorUi = () => syncBetweenVisibility()
              menu.addEventListener('click', onOperatorUi)
              menu.addEventListener('change', onOperatorUi)
              menuOperatorListeners.push(
                { el: menu, type: 'click', fn: onOperatorUi },
                { el: menu, type: 'change', fn: onOperatorUi },
              )
            }

            const current = props.filterModel?.[field.fieldName]
            if (current?.operator === 'BETWEEN' && operatorDropDown) {
              operatorDropDown.value = 'between'
              operatorDropDown.dataBind?.()
            }
            syncBetweenVisibility()
          },
          write: (args: any) => {
            const current = props.filterModel?.[field.fieldName]
            if (current?.operator === 'BETWEEN') {
              setControlValue(firstControl, current.value)
              setControlValue(secondControl, current.valueTo)
              return
            }
            setControlValue(firstControl, args.filteredValue)
            setControlValue(secondControl, null)
          },
          read: (args: any) => {
            const operator = String(args.operator ?? 'equal').toLowerCase()
            const first = firstControl?.value ?? undefined
            const second = secondControl?.value ?? undefined
            pendingRanges.delete(field.fieldName)

            if (operator === 'between') {
              if (first == null && second == null) {
                args.fltrObj.removeFilteredColsByField?.(field.fieldName)
                return
              }
              if (first != null && second != null) {
                // Grid filterByColumn 同字段会替换；先缓存范围，dataStateChange
                // 再合成 BETWEEN body（不依赖 actionBegin 补上界是否成功）。
                pendingRanges.set(field.fieldName, {
                  min: first,
                  max: second,
                })
              }
              args.fltrObj.filterByColumn(
                field.fieldName,
                first != null ? 'greaterthanorequal' : 'lessthanorequal',
                first ?? second,
                'and',
                true,
              )
              return
            }

            args.fltrObj.filterByColumn(
              field.fieldName,
              operator,
              first ?? null,
              'and',
              true,
            )
          },
          destroy: () => {
            for (const { el, type, fn } of menuOperatorListeners) {
              el.removeEventListener(type, fn)
            }
            menuOperatorListeners.length = 0
            operatorDropDown = undefined
            const safeDestroy = (
              control?: NumericTextBox | DatePicker | DateTimePicker,
            ) => {
              if (!control || control.isDestroyed) return
              try {
                control.destroy()
              } catch {
                /* EJ2 已随筛选框拆掉 */
              }
            }
            safeDestroy(firstControl)
            safeDestroy(secondControl)
            firstControl = undefined
            secondControl = undefined
            secondWrap = undefined
          },
        },
      }
    }

    /** 布尔/文本走 EJ2 默认 Menu；枚举/关联用 CheckBox。 */
    const columnFilter = (field: MetaUiField) => {
      if (isChoiceFilterField(field)) return choiceCheckBoxFilter(field)
      if (
        SqlDataType.isDate(field.dataType) ||
        (SqlDataType.isNum(field.dataType) && !field.reference)
      ) {
        return rangeMenuFilter(field)
      }
      return { type: 'Menu' }
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
      if (props.renderCell) {
        const node = props.renderCell(field, row)
        if (node !== undefined && node !== null) return node
      }
      const custom = props.customCellRenderers?.[field.fieldName]
      if (custom) return custom(field, row)
      return plainCellDisplay(field, row)
    }

    const gridColumns = [
      selectionMode === 'multiple'
        ? {
            type: 'checkbox',
            width: 48,
            minWidth: 48,
            maxWidth: 48,
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
        width: rowNumField?.listSize ?? 60,
        minWidth: 60,
        textAlign: 'Left',
        headerTextAlign: 'Left',
        allowSorting: false,
        allowFiltering: false,
        allowGrouping: false,
        allowEditing: false,
        freeze: 'Left',
        // EJ2 仍会插入排序/分组图标；用 class 藏掉（行号不可排、不可分组）
        customAttributes: { class: 'mmda-sf-rownum-col' },
        // 直接绑服务器下发的 rowNum，无 template / valueAccessor
      },
      ...dataFields.map(field => {
        const textAlign = gridTextAlign(field)
        const freeze = gridFreezeOf(field)
        const templated = useTemplateCell(field)
        return {
          field: field.fieldName,
          headerText: field.displayLabel,
          isPrimaryKey: field.primaryKey === true,
          type: gridColumnType(field),
          format: gridColumnFormat(field),
          textAlign,
          headerTextAlign: textAlign,
          clipMode: templated ? 'EllipsisWithTooltip' : 'Ellipsis',
          allowSorting:
            props.enableSort !== false && field.sortable !== false,
          allowFiltering: showColumnFilters,
          allowGrouping: false,
          allowReordering: Boolean(props.onListLayoutChange),
          visible: field.listed !== false,
          freeze,
          allowEditing:
            inplaceEdit &&
            editableFields.has(field.fieldName) &&
            !field.readOnly,
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
      typeof (props as any).rowMenu === 'function'
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
            customAttributes: { class: 'mmda-sf-actions-col' },
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
                'mmda-sf-cell',
                `mmda-sf-cell--${gridTextAlignCss(align)}`,
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

    if (typeof (props as any).rowMenu === 'function') {
      cellSlots.mmdaCell_actions = (scope: { data?: T } | T) => {
        const row = ((scope as any)?.data ?? scope) as T
        const actions = (props as any).rowMenu(row) as any[]
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
        const run = (action?: any) =>
          action?.onAction?.() ?? action?.command?.()
        const enabled = (action?: any) =>
          action == null ||
          !(
            action.disabled === true ||
            action.disabled === 'true' ||
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
                  ? 'mmda-sf-row-details-placeholder'
                  : 'mmda-sf-row-action-placeholder',
              'aria-hidden': 'true',
            })
          }
          const iconCss = action.icon || factory.resolveIcon(name)
          return h(
            'button',
            {
              type: 'button',
              class: 'e-btn e-flat e-round mmda-sf-row-action',
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
                  'mmda-sf-split--flat e-caret-hide-primary mmda-sf-row-details',
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
              class: 'mmda-sf-row-actions',
              onClick: (event: Event) => event.stopPropagation(),
              onMousedown: (event: Event) => event.stopPropagation(),
            },
            [flatIconButton(remove, 'delete')],
          )
        }

        return h(
          'div',
          {
            class: 'mmda-sf-row-actions',
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
      props.onSelectionChange?.(records)
      props.onSelect?.(records)
    }

    const primaryKey = metaui.primaryKey
    const layoutRev = unref(props.layoutRev as any) ?? 0
    const listGroupKey = String(metaui.objName ?? primaryKey ?? 'list')
    const gridKey = `mmda-sf-grid-${listGroupKey}-${layoutRev}`

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
    const resolveCustomBinding = async (state?: any) => {
      if (!pagination) return
      await nextTick()
      const grid = resolveEj2Grid()
      if (!grid) return
      if (state && typeof state.skip === 'number') virtualSkip = state.skip
      const take =
        typeof state?.take === 'number' ? state.take : VIRTUAL_ROW_PAGE_SIZE
      grid.dataSource = virtualWindow(virtualSkip, take)
      grid.hideSpinner?.()
    }

    const runRemoteQuery = (work: unknown) => {
      void Promise.resolve(work)
        .catch(() => undefined)
        .finally(() => {
          void resolveCustomBinding()
        })
    }

    const persistLayoutFromGrid = () => {
      if (!props.onListLayoutChange) return
      const grid = resolveEj2Grid()
      if (!grid) return
      syncMetaUiFromGridColumns(grid, metaui)
      props.onListLayoutChange()
    }

    const gridVNode = h(
      SfGrid,
      {
        key: gridKey,
        // 索引页：当前页本地数组 + 行虚拟滚动（与 allowPaging 互斥）。
        // count=当前页长度，服务端总条数交给下方 Pager。
        dataSource: pagination
          ? virtualWindow(0, VIRTUAL_ROW_PAGE_SIZE)
          : rows,
        locale: getSyncfusionCulture(),
        allowPaging: false,
        enableVirtualization: Boolean(pagination),
        // Material 3 Theme Studio 默认无斑马纹，交替行会让分页器/表体色阶显得碎
        enableAltRow: false,
        // 索引页：占满父容器，行区内部滚动，分页条贴底（避免撑出页面滚动）
        height: pagination ? '100%' : props.height,
        pageSettings: pagination
          ? {
              pageSize: VIRTUAL_ROW_PAGE_SIZE,
            }
          : undefined,
        allowSorting: props.enableSort !== false,
        allowFiltering: showColumnFilters,
        allowGrouping: false,
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
        filterSettings: showColumnFilters ? { type: 'Menu' } : undefined,
        // 用 columns 数组而非 ColumnDirective，避免 Vue 指令序列化丢掉 filter.ui 函数。
        columns: gridColumns,
        showColumnChooser: false,
        allowReordering: Boolean(props.onListLayoutChange),
        allowResizing: props.resizableColumns !== false,
        allowSelection:
          Boolean(selectionMode) ||
          (inplaceEdit && inplaceEditStart === 'excel'),
        selectionSettings: selectionMode
          ? {
              type: selectionMode === 'multiple' ? 'Multiple' : 'Single',
              persistSelection: true,
              checkboxOnly: selectionMode === 'multiple',
            }
          : inplaceEdit && inplaceEditStart === 'excel'
            ? { mode: 'Cell', type: 'Single' }
            : { type: 'None' },
        cssClass: ['mmda-sf-table', props.class].filter(Boolean).join(' '),
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
          ej2Grid?.on?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.on?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          queueMicrotask(() => bindInplaceEditTriggers())
        },
        resizeStop: () => persistLayoutFromGrid(),
        actionComplete: (args: any) => {
          const requestType = args?.requestType
          if (requestType === 'reorder' || requestType === 'columnstate') {
            persistLayoutFromGrid()
          }
        },
        destroyed: () => {
          ej2Grid?.off?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.off?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          flushPendingCellEdit()
          unbindInplaceEditTriggers()
        },
        rowSelected: (args: any) => {
          const grid = args.grid ?? args.sender
          const records = (grid?.getSelectedRecords?.() ??
            (args.data ? [args.data] : [])) as T[]
          syncSelection(records)
        },
        rowDeselected: (args: any) => {
          const grid = args.grid ?? args.sender
          const records = (grid?.getSelectedRecords?.() ?? []) as T[]
          syncSelection(records)
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
            editableFields.has(resolvedField)
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
          if (
            !field ||
            !editableFields.has(field.fieldName) ||
            props.canEditCell?.(row, field) === false
          ) {
            args.cancel = true
            return
          }
          refreshReferenceEditParams(args?.column, field)
        },
        cellSave: (args: any) => {
          if (!inplaceEdit) return
          const fieldName = args?.column?.field ?? args?.columnName
          const field = fields.find(value => value.fieldName === fieldName)
          const row = sourceRowAt(args)
          if (!field || !row) return
          if (
            props.onCellSave?.(
              row,
              field,
              args.value,
              args.previousValue,
            ) === false
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
            const columnType = gridColumnType(field)
            if (
              columnType === 'number' ||
              columnType === 'date' ||
              columnType === 'datetime'
            ) {
              const operatorKey = `${columnType}Operator`
              const operators =
                args.filterModel.customFilterOperators?.[operatorKey]
              if (
                Array.isArray(operators) &&
                !operators.some((operator: any) => operator.value === 'between')
              ) {
                operators.push({ value: 'between', text: '在…之间' })
              }
            }
            if (isChoiceFilterField(field)) {
              const apply = (options?: unknown[]) => {
                if (
                  field.reference &&
                  field.reference.refOptions.length === 0 &&
                  Array.isArray(options)
                ) {
                  field.reference.refOptions.splice(0, 0, ...options)
                }
                args.filterModel.options.dataSource =
                  choiceFilterDataSource(field)
              }
              if (
                field.reference &&
                !isEnumReference(field.reference) &&
                field.reference.refOptions.length === 0 &&
                props.loadFilterOptions
              ) {
                void props.loadFilterOptions(field).then(apply)
              } else {
                apply()
              }
            }
          }
          if (requestType === 'filtering') {
            const fieldName = String(
              args.currentFilteringColumn ?? args.columns?.[0]?.field ?? '',
            )
            const range = pendingRanges.get(fieldName)
            const columns = Array.isArray(args.columns) ? args.columns : []
            const first = columns.find(
              (column: any) => column.field === fieldName,
            )
            if (range && first) {
              first.operator = 'greaterthanorequal'
              first.value = range.min
              first.predicate = 'and'
              columns.push({
                ...first,
                operator: 'lessthanorequal',
                predicate: 'and',
                value: range.max,
              })
              args.columns = columns
              pendingRanges.delete(fieldName)
            }
          }
        },
        dataStateChange: (state: any) => {
          const requestType = state?.action?.requestType
          if (requestType === 'virtualscroll') {
            void resolveCustomBinding(state)
            return
          }
          if (requestType === 'sorting' && props.enableSort !== false) {
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
              const respond = (options?: unknown[]) => {
                if (
                  field?.reference &&
                  field.reference.refOptions.length === 0 &&
                  Array.isArray(options)
                ) {
                  field.reference.refOptions.splice(0, 0, ...options)
                }
                state.dataSource(
                  field && isChoiceFilterField(field)
                    ? choiceFilterDataSource(field)
                    : [],
                )
              }
              if (
                field?.reference &&
                !isEnumReference(field.reference) &&
                field.reference.refOptions.length === 0 &&
                props.loadFilterOptions
              ) {
                void props.loadFilterOptions(field).then(respond)
              } else {
                respond()
              }
            }
            return
          }
          if (requestType === 'filtering' && props.onFilterModelChange) {
            const model = gridFiltersToModel(state.where, fields)
            // Menu BETWEEN：若 Grid where 只带了下界，用 read 时缓存的范围补全。
            for (const [fieldName, range] of [...pendingRanges.entries()]) {
              const field = fields.find(value => value.fieldName === fieldName)
              if (
                !field ||
                range.min == null ||
                range.max == null ||
                !(
                  SqlDataType.isDate(field.dataType) ||
                  SqlDataType.isNum(field.dataType)
                )
              ) {
                continue
              }
              model[fieldName] = {
                filterType: SqlDataType.isDate(field.dataType)
                  ? 'date'
                  : 'number',
                operator: 'BETWEEN',
                value: range.min,
                valueTo: range.max,
              }
              pendingRanges.delete(fieldName)
            }
            runRemoteQuery(props.onFilterModelChange(model))
          }
        },
        actionComplete: (args: any) => {
          if (
            !pagination &&
            args.requestType === 'sorting' &&
            props.enableSort !== false
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
          if (
            !pagination &&
            args.requestType === 'filtering' &&
            props.onFilterModelChange
          ) {
            props.onFilterModelChange(
              gridFiltersToModel(args?.columns, fields),
            )
          }
        },
        recordDoubleClick: (args: any) => {
          const fieldName = args?.column?.field ?? args?.columnName
          // 可编辑单元格的双击交给 EJ2 Batch 编辑；其它单元格仍打开完整弹窗。
          if (inplaceEdit && fieldName && editableFields.has(fieldName)) return
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
      { class: 'mmda-sf-pagable-table' },
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
