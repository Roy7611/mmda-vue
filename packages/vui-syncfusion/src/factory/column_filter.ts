import {
  combineCompareAndSet,
  SqlDataType,
  uiCssClass,
  MetaUiFilterType,
  type EntityFieldFilter,
  type EntityFilterModel,
  type EntitySetFieldFilter,
  type MetaUiField,
} from '@mmda/core'
import { columnFilterKindOf, hasFilterType } from './filter_kind'
import { createElement } from '@syncfusion/ej2-base'
import { DatePicker, DateTimePicker } from '@syncfusion/ej2-calendars'
import { h, render, type AppContext } from 'vue'
import {
  SfNumberColumnFilter,
  SfTimeColumnFilter,
  type CompareColumnVariant,
  type SfCompareColumnFilterHandle,
} from '../components/SfCompareColumnFilter'
import { getSyncfusionCulture } from '../syncfusion_i18n'
import { createDateSetTree } from './date_set_tree'
import { gridFilterOperator } from './utils'

export type { CompareColumnVariant, SfCompareColumnFilterHandle }

export type SfCompareColumnFilterExtras = {
  filterModel?: EntityFilterModel
  dateRangeLabels?: Partial<Record<string, string>>
  filterLabels?: Partial<Record<string, string>>
  loadPivotDates?: (field: MetaUiField) => Promise<unknown>
  store: CompareColumnFilterStore
  appContext?: AppContext | null
}

export type CompareColumnFilterStore = {
  models: Map<string, EntityFieldFilter>
  cleared: Set<string>
}

export function createCompareColumnFilterStore(): CompareColumnFilterStore {
  return { models: new Map(), cleared: new Set() }
}

export function compareColumnVariantOf(
  field: Pick<MetaUiField, 'dataType' | 'reference'>,
): CompareColumnVariant | undefined {
  if (field.dataType === SqlDataType.TIME) return 'time'
  if (SqlDataType.isDateTime(field.dataType)) return 'datetime'
  if (SqlDataType.isDate(field.dataType)) return 'date'
  if (SqlDataType.isNum(field.dataType) && !field.reference) return 'number'
  return undefined
}

export function usesCompareColumnFilter(
  field: MetaUiField,
  extras: Pick<SfCompareColumnFilterExtras, 'loadPivotDates'> = {},
) {
  if (hasFilterType(field, MetaUiFilterType.JOIN)) return false
  const variant = compareColumnVariantOf(field)
  if (!variant) return false
  if (variant === 'time') return true
  const kind = columnFilterKindOf(field)
  if (kind === 'range') return true
  if (
    (variant === 'date' || variant === 'datetime') &&
    extras.loadPivotDates &&
    hasFilterType(field, MetaUiFilterType.SET)
  ) {
    return true
  }
  return false
}

export function writeCompareColumnFilter(
  store: CompareColumnFilterStore,
  fieldName: string,
  filter?: EntityFieldFilter,
) {
  if (filter) {
    store.models.set(fieldName, filter)
    store.cleared.delete(fieldName)
    return
  }
  store.models.delete(fieldName)
  store.cleared.add(fieldName)
}

export function applyCompareColumnFilters(
  model: EntityFilterModel,
  store: CompareColumnFilterStore,
): EntityFilterModel {
  const next = { ...model }
  for (const [fieldName, filter] of store.models) {
    next[fieldName] = filter
  }
  for (const fieldName of store.cleared) {
    delete next[fieldName]
  }
  return next
}

export function highlightValueOf(filter: EntityFieldFilter): unknown {
  if (filter.filterType === 'multi') {
    const first = filter.filterModels[0]
    return first ? highlightValueOf(first) : true
  }
  if (filter.filterType === 'set') return filter.values?.[0] ?? true
  if (filter.operator === 'WITHIN') return filter.dateKind ?? filter.value ?? true
  if (filter.operator === 'BETWEEN') return filter.value ?? true
  if (
    filter.operator === 'IS_NULL' ||
    filter.operator === 'IS_NOT_NULL' ||
    filter.operator === 'IS_BLANK' ||
    filter.operator === 'IS_NOT_BLANK'
  ) {
    return null
  }
  return 'value' in filter ? (filter.value ?? true) : true
}

export function hideEj2MenuChrome(
  args: { target?: HTMLElement },
  { hideOperator = true }: { hideOperator?: boolean } = {},
) {
  const menu =
    args.target?.closest?.('.e-flmenu') instanceof HTMLElement
      ? args.target.closest('.e-flmenu')
      : args.target
  if (!(menu instanceof HTMLElement)) return
  const optr = menu.querySelector('.e-flm_optrdiv')
  if (hideOperator && optr instanceof HTMLElement) optr.hidden = true
  const keep = [
    uiCssClass('compare-column-filter'),
    uiCssClass('compare-column-filter-host'),
    uiCssClass('date-set-dropdown'),
    uiCssClass('column-filter-date'),
  ]
    .map(name => `.${name}`)
    .join(', ')
  for (const el of menu.querySelectorAll(
    '.e-flmenu-valuediv input, .e-flmenu-input, .e-flmenu-valuediv .e-input-group',
  )) {
    if (
      el instanceof HTMLElement &&
      !el.classList.contains('flm-input') &&
      !el.closest(keep)
    ) {
      el.hidden = true
    }
  }
}

const compareFrom = (filter?: EntityFieldFilter) => {
  if (!filter) return undefined
  if (filter.filterType === 'multi') {
    return filter.filterModels.find(item => item.filterType !== 'set')
  }
  if (filter.filterType === 'set') return undefined
  return filter
}

const setFrom = (filter?: EntityFieldFilter) => {
  if (!filter) return []
  if (filter.filterType === 'set') return filter.values
  if (filter.filterType === 'multi') {
    const set = filter.filterModels.find(item => item.filterType === 'set')
    return set && 'values' in set ? set.values : []
  }
  return []
}

const asDate = (value: unknown) => {
  if (value == null || value === '') return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

/** 日期列走官方 Menu ui.create：input + appendTo，不要 SfDateColumnFilter。 */
function sfDateMenuFilter(
  field: MetaUiField,
  extras: SfCompareColumnFilterExtras,
  variant: 'date' | 'datetime',
) {
  let picker: DatePicker | DateTimePicker | undefined
  let dateSet: { destroy: () => void } | undefined
  let setTokens: unknown[] = setFrom(extras.filterModel?.[field.fieldName])
  let operatorDrop: { value?: string } | undefined
  const showSet =
    Boolean(extras.loadPivotDates) &&
    hasFilterType(field, MetaUiFilterType.SET)

  const getModel = () => {
    const op = String(operatorDrop?.value ?? 'equal')
    const filterType = 'date' as const
    let compare: EntityFieldFilter | undefined
    if (op === 'isnull' || op === 'notnull') {
      compare = { filterType, operator: gridFilterOperator(op, filterType) }
    } else if (picker?.value != null) {
      compare = {
        filterType,
        operator: gridFilterOperator(op, filterType),
        value: picker.value,
      }
    }
    const set: EntitySetFieldFilter | undefined = setTokens.length
      ? { filterType: 'set', operator: 'IN', values: [...setTokens] }
      : undefined
    return combineCompareAndSet(compare, set)
  }

  return {
    type: 'Menu' as const,
    ui: {
      getModel,
      create: (args: any) => {
        operatorDrop = args.getOptrInstance?.dropOptr
        hideEj2MenuChrome(args, { hideOperator: false })
        const dateInput = createElement('input', {
          className: 'flm-input',
        }) as HTMLInputElement
        args.target.appendChild(dateInput)
        const Ctor = variant === 'datetime' ? DateTimePicker : DatePicker
        picker = new Ctor({
          cssClass: uiCssClass('column-filter-date'),
          placeholder:
            extras.filterLabels?.[variant === 'datetime' ? 'datetime' : 'date'],
          width: '100%',
          showClearButton: true,
          locale: getSyncfusionCulture(),
        })
        picker.appendTo(dateInput)
        if (!showSet || !extras.loadPivotDates) return
        void Promise.resolve(extras.loadPivotDates(field)).then(
          raw => {
            const setInput = createElement('input', {
              className: 'flm-input',
            }) as HTMLInputElement
            args.target.appendChild(setInput)
            dateSet = createDateSetTree({
              input: setInput,
              days: raw,
              checkedTokens: setTokens,
              monthLabel: extras.dateRangeLabels?.month,
              placeholder: extras.filterLabels?.values,
              locale: getSyncfusionCulture(),
              onChange: tokens => {
                setTokens = tokens
              },
            })
          },
          () => {
            /* 选项树加载失败时只留比较框 */
          },
        )
      },
      write: () => {
        const filter = extras.filterModel?.[field.fieldName]
        const compare = compareFrom(filter)
        setTokens = setFrom(filter)
        if (picker && compare && 'value' in compare) {
          picker.value = asDate(compare.value)
        }
      },
      read: (args: any) => {
        const model = getModel()
        writeCompareColumnFilter(extras.store, field.fieldName, model)
        if (!model) {
          args.fltrObj.removeFilteredColsByField?.(field.fieldName)
          return
        }
        args.fltrObj.filterByColumn(
          field.fieldName,
          'equal',
          highlightValueOf(model),
          'and',
          true,
        )
      },
      destroy: () => {
        dateSet?.destroy()
        dateSet = undefined
        if (picker && !picker.isDestroyed) {
          try {
            picker.destroy()
          } catch {
            /* EJ2 已随筛选框拆掉 */
          }
        }
        picker = undefined
      },
    },
  }
}

export function sfCompareColumnFilter(
  field: MetaUiField,
  extras: SfCompareColumnFilterExtras,
) {
  const variant = compareColumnVariantOf(field)
  if (!variant) return { type: 'Menu' as const }
  if (variant === 'date' || variant === 'datetime') {
    return sfDateMenuFilter(field, extras, variant)
  }
  let host: HTMLElement | undefined
  const handle: SfCompareColumnFilterHandle = {
    getModel: () => extras.store.models.get(field.fieldName),
    setModel: () => {},
    setOperator: () => {},
  }

  return {
    type: 'Menu' as const,
    ui: {
      handle,
      create: (args: any) => {
        hideEj2MenuChrome(args)
        host = document.createElement('div')
        host.className = uiCssClass('compare-column-filter-host')
        args.target.appendChild(host)
        const vnode = h(
          variant === 'time' ? SfTimeColumnFilter : SfNumberColumnFilter,
          {
            field,
            filter: extras.filterModel?.[field.fieldName],
            handle,
            dateRangeLabels: extras.dateRangeLabels,
            filterLabels: extras.filterLabels,
            loadPivotDates: extras.loadPivotDates,
          },
        )
        if (extras.appContext) vnode.appContext = extras.appContext
        render(vnode, host)
      },
      write: () => {
        handle.setModel(extras.filterModel?.[field.fieldName])
      },
      read: (args: any) => {
        const model = handle.getModel()
        writeCompareColumnFilter(extras.store, field.fieldName, model)
        if (!model) {
          args.fltrObj.removeFilteredColsByField?.(field.fieldName)
          return
        }
        args.fltrObj.filterByColumn(
          field.fieldName,
          'equal',
          highlightValueOf(model),
          'and',
          true,
        )
      },
      destroy: () => {
        if (host) render(null, host)
        host = undefined
      },
    },
  }
}
