import type {
  ColDef,
  ICellEditorParams,
  ICellRendererParams,
  SetFilterValuesFuncParams,
  ValueFormatterParams,
} from 'ag-grid-community'
import {
  SqlDataType,
  type MetaUi,
  type MetaUiField,
} from '@mmda/core'
import { gridFreezeOf } from '@mmda/vui'
import type { UiListPropsType } from '@mmda/vui'
import { listedMetaFields, isReferenceSetField } from './ag_filter'

export function listedFieldsOf(metaui: MetaUi): MetaUiField[] {
  return listedMetaFields(metaui)
}

const headerName = (field: MetaUiField) => field.displayLabel || field.fieldName

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
      cellRenderer: 'MmdaAgGridCell',
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
      cellEditor: 'MmdaAgGridEditor',
      cellEditorPopup: true,
    }
    if (filterDisplay !== 'none') {
      if (isReferenceSetField(field)) {
        col.filter = 'agSetColumnFilter'
        col.filterParams = {
          values: (params: SetFilterValuesFuncParams) => {
            const apply = (options: unknown[]) => {
              const reference = field.reference!
              params.success(
                options.map(option => String(reference.valueOf(option))),
              )
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
        }
      } else if (SqlDataType.isBool(field.dataType)) {
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
      } else if (SqlDataType.isDate(field.dataType)) {
        col.filter = 'agDateColumnFilter'
        col.filterParams = { browserDatePicker: true }
      } else if (SqlDataType.isNum(field.dataType)) {
        col.filter = 'agNumberColumnFilter'
      } else {
        col.filter = 'agTextColumnFilter'
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
