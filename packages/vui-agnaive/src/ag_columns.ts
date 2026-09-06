import type {
  ColDef,
  ICellEditorParams,
  ICellRendererParams,
  IFilterOptionDef,
  SetFilterValuesFuncParams,
  ValueFormatterParams,
} from 'ag-grid-community'
import {
  DATE_RANGE_FILTER_KINDS,
  MetaUiFieldFilterType,
  SqlDataType,
  columnFilterKindOf,
  hasFilterType,
  normalizePivotDates,
  simpleFilterTypeOf,
  toDatePeriodToken,
  type DateTimeRangeKind,
  type MetaUi,
  type MetaUiField,
} from '@mmda/core'
import { gridFreezeOf } from '@mmda/vui'
import type { UiListPropsType } from '@mmda/vui'
import {
  listedMetaFields,
  isHasOneFilterField,
  isReferenceSetField,
  rememberPivotDays,
} from './ag_filter'

export function listedFieldsOf(metaui: MetaUi): MetaUiField[] {
  return listedMetaFields(metaui)
}

const headerName = (field: MetaUiField) => field.displayLabel || field.fieldName

const dateKindOptions = (
  labels?: Partial<Record<DateTimeRangeKind, string>>,
): IFilterOptionDef[] =>
  DATE_RANGE_FILTER_KINDS.map(kind => ({
    displayKey: kind,
    displayName: labels?.[kind] ?? kind,
    predicate: () => true,
    numberOfInputs: 0,
  }))

const simpleFilterOf = (
  field: MetaUiField,
  props: UiListPropsType<any> = {} as UiListPropsType<any>,
) => {
  const type = simpleFilterTypeOf(field)
  const maxNumConditions = hasFilterType(field, MetaUiFieldFilterType.JOIN)
    ? 2
    : 1
  if (type === 'date') {
    return {
      filter: 'agDateColumnFilter',
      filterParams: {
        browserDatePicker: true,
        maxNumConditions,
        filterOptions: [
          'equals',
          'notEqual',
          'greaterThan',
          'greaterThanOrEqual',
          'lessThan',
          'lessThanOrEqual',
          'inRange',
          'blank',
          'notBlank',
          ...dateKindOptions(props.dateRangeLabels),
        ],
      },
    }
  }
  if (type === 'number') {
    return {
      filter: 'agNumberColumnFilter',
      filterParams: { maxNumConditions },
    }
  }
  return {
    filter: 'agTextColumnFilter',
    filterParams: { maxNumConditions },
  }
}

const dateTreeFilterParamsOf = (
  field: MetaUiField,
  props: UiListPropsType<any>,
) => ({
  treeList: true,
  defaultToNothingSelected: true,
  excelMode: 'windows' as const,
  keyCreator: (params: { value: unknown }) =>
    toDatePeriodToken(params.value) ?? String(params.value ?? ''),
  treeListPathGetter: (value: string | null) => {
    const token = toDatePeriodToken(value) ?? value
    if (!token) return [null]
    const parts = String(token).split('-')
    return parts.length >= 3 ? parts.slice(0, 3) : [token]
  },
  treeListFormatter: (
    pathKey: string | null,
    level: number,
  ) => {
    if (pathKey == null) return ''
    if (level === 1) {
      const month = Number(pathKey)
      const suffix = props.dateRangeLabels?.month ?? ''
      return Number.isFinite(month) ? `${month}${suffix}` : pathKey
    }
    return pathKey
  },
  values: (params: SetFilterValuesFuncParams) => {
    const apply = (raw: unknown) => {
      const days = normalizePivotDates(raw)
      rememberPivotDays(field, days)
      params.success(days)
    }
    void Promise.resolve(
      props.loadPivotDates?.(field) ?? props.loadFilterOptions?.(field) ?? [],
    ).then(apply, () => apply([]))
  },
})

const setFilterParamsOf = (
  field: MetaUiField,
  props: UiListPropsType<any>,
) => ({
  values: (params: SetFilterValuesFuncParams) => {
    const apply = (options: unknown[]) => {
      const reference = field.reference!
      params.success(options.map(option => String(reference.valueOf(option))))
    }
    const current = field.reference?.refOptions ?? []
    if (current.length) {
      apply(current)
      return
    }
    void Promise.resolve(props.loadFilterOptions?.(field)).then(() => {
      apply(field.reference?.refOptions ?? [])
    })
  },
  valueFormatter: (params: { value: unknown }) => {
    const reference = field.reference
    if (!reference) return String(params.value ?? '')
    const match = (reference.refOptions ?? []).find(
      option => String(reference.valueOf(option)) === String(params.value),
    )
    return match ? String(reference.labelOf(match)) : String(params.value ?? '')
  },
  suppressMiniFilter: false,
  defaultToNothingSelected: true,
})

export function buildColumnDefs<T>(
  metaui: MetaUi,
  props: UiListPropsType<T> = {} as UiListPropsType<T>,
): ColDef<T>[] {
  const fields = listedFieldsOf(metaui)
  const enableSort = props.enableSort !== false
  const filterDisplay = props.filterDisplay ?? 'menu'
  const cols: ColDef<T>[] = fields.map(field => {
    const freeze = gridFreezeOf(field)
    const width = field.listSize && field.listSize > 0 ? Math.min(field.listSize, 400) : undefined
    const col: ColDef<T> = {
      colId: field.fieldName,
      field: field.fieldName as ColDef<T>['field'],
      headerName: headerName(field),
      sortable: enableSort && Boolean((field as any).sortable ?? true),
      resizable: props.resizableColumns !== false,
      hide: field.listed === false,
      width,
      minWidth: 72,
      pinned: freeze === 'Left' ? 'left' : freeze === 'Right' ? 'right' : undefined,
      context: { field },
      cellRenderer: 'AgGridCell',
      valueFormatter: (params: ValueFormatterParams<T>) => {
        const reference = field.reference
        if (!reference?.refOptions?.length) {
          const value = params.value
          return value == null ? '' : String(value)
        }
        const match = reference.refOptions.find(
          option => String(reference.valueOf(option)) === String(params.value),
        )
        return match ? String(reference.labelOf(match)) : String(params.value ?? '')
      },
      editable:
        props.inplaceEdit === true &&
        (!props.editableFields?.length ||
          props.editableFields.includes(field.fieldName)),
      cellEditor: 'AgGridEditor',
      cellEditorPopup: true,
    }
    if (filterDisplay !== 'none') {
      const kind = columnFilterKindOf(field)
      if (kind === 'boolean') {
        col.filter = 'agSetColumnFilter'
        col.valueGetter = params => {
          const row = params.data as Record<string, unknown> | undefined
          const value = row?.[field.fieldName]
          if (typeof value === 'boolean') return String(value)
          return value
        }
        col.filterParams = {
          values: ['true', 'false'],
          valueFormatter: (params: { value: unknown }) => {
            if (params.value === 'true') return props.filterLabels?.yes ?? 'Yes'
            if (params.value === 'false') return props.filterLabels?.no ?? 'No'
            return String(params.value ?? '')
          },
        }
      } else if (kind === 'range' || kind === 'text') {
        const simple = simpleFilterOf(field, props)
        col.filter = simple.filter
        col.filterParams = simple.filterParams
      } else if (kind === 'set') {
        if (isHasOneFilterField(field)) {
          col.filter = 'AgHasOneFilter'
          col.filterParams = {
            field,
            searchRelative: props.searchRelative,
          }
        } else if (isReferenceSetField(field) || field.reference) {
          col.filter = 'agSetColumnFilter'
          col.filterParams = setFilterParamsOf(field, props)
        } else {
          col.filter = 'agSetColumnFilter'
          col.filterParams = { defaultToNothingSelected: true }
        }
      } else {
        const simple = simpleFilterOf(field, props)
        const optionFilter = simpleFilterTypeOf(field) === 'date'
          ? {
              filter: 'agSetColumnFilter',
              filterParams: dateTreeFilterParamsOf(field, props),
            }
          : isHasOneFilterField(field)
          ? {
              filter: 'AgHasOneFilter',
              filterParams: {
                field,
                searchRelative: props.searchRelative,
              },
            }
          : isReferenceSetField(field)
            ? {
                filter: 'agSetColumnFilter',
                filterParams: setFilterParamsOf(field, props),
              }
            : {
                filter: 'agSetColumnFilter',
                filterParams: { defaultToNothingSelected: true },
              }
        col.filter = 'agMultiColumnFilter'
        col.filterParams = { filters: [simple, optionFilter] }
      }
    }
    return col
  })
  return cols
}

export function cellNodeFromParams(params: ICellRendererParams) {
  const field = params.colDef?.context?.field as MetaUiField | undefined
  const renderCell = params.context?.renderCell as
    | ((field: MetaUiField, row: any) => unknown)
    | undefined
  if (field && params.data && renderCell) return renderCell(field, params.data)
  return params.valueFormatted ?? params.value ?? ''
}

export function editorFieldOf(params: ICellEditorParams): MetaUiField | undefined {
  return params.colDef?.context?.field as MetaUiField | undefined
}
