import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
} from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type FilterChangedEvent,
  type GridApi,
  type GridReadyEvent,
  type ICellEditorParams,
  type ICellRendererParams,
  type RowClickedEvent,
  type SelectionChangedEvent,
  type SortChangedEvent,
} from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import {
  NDatePicker,
  NInput,
  NInputNumber,
  NPagination,
  NSelect,
} from 'naive-ui'
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  SortOrder,
  SqlDataType,
  type MetaUi,
  type MetaUiField,
  type Pagination,
} from '@mmda/core'
import type { UiListPropsType } from '@mmda/vui'
import {
  agFilterModelToEntity,
  entityFilterToAgModel,
} from '../ag_filter'
import { buildAgGridTheme } from '../agnaive_theme'
import { buildColumnDefs, cellNodeFromParams, editorFieldOf } from '../ag_columns'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])

const MmdaAgGridCell = defineComponent({
  name: 'MmdaAgGridCell',
  props: {
    params: { type: Object as PropType<ICellRendererParams>, required: true },
  },
  setup(props) {
    return () => cellNodeFromParams(props.params)
  },
})

const MmdaAgGridEditor = defineComponent({
  name: 'MmdaAgGridEditor',
  props: {
    params: { type: Object as PropType<ICellEditorParams>, required: true },
  },
  setup(props) {
    const field = editorFieldOf(props.params)
    const value = ref(props.params.value)
    const getValue = () => value.value
    const isPopup = () => true
    const stop = () => props.params.stopEditing()

    const options = () => {
      const reference = field?.reference
      if (!reference?.refOptions?.length) return []
      return reference.refOptions.map(option => ({
        label: String(reference.labelOf(option)),
        value: reference.valueOf(option),
      }))
    }

    return {
      getValue,
      isPopup,
      render: () => {
        const common = {
          value: value.value,
          size: 'small' as const,
          class: 'ag-custom-component-popup',
          'onUpdate:value': (next: unknown) => {
            value.value = next
          },
          onBlur: stop,
        }
        if (field?.reference?.refOptions?.length) {
          return h(NSelect, {
            ...common,
            options: options(),
            filterable: true,
            onUpdateValue: (next: unknown) => {
              value.value = next
              stop()
            },
          })
        }
        if (field && SqlDataType.isBool(field.dataType)) {
          return h(NSelect, {
            ...common,
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ] as any,
            onUpdateValue: (next: unknown) => {
              value.value = next
              stop()
            },
          })
        }
        if (field && SqlDataType.isDate(field.dataType)) {
          const timestamp =
            value.value instanceof Date
              ? value.value.getTime()
              : typeof value.value === 'number'
                ? value.value
                : value.value
                  ? new Date(value.value as string).getTime()
                  : null
          return h(NDatePicker, {
            ...common,
            value: Number.isNaN(timestamp as number) ? null : timestamp,
            type: 'date',
            onUpdateValue: (next: unknown) => {
              value.value =
                typeof next === 'number' ? new Date(next) : next
              stop()
            },
          })
        }
        if (field && SqlDataType.isNum(field.dataType)) {
          return h(NInputNumber, common)
        }
        return h(NInput, common)
      },
    }
  },
  render() {
    return (this as any).render()
  },
})

export const MmdaAgGrid = defineComponent({
  name: 'MmdaAgGrid',
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<any[]>, default: () => [] },
    metaui: { type: Object as PropType<MetaUi>, required: true },
  },
  setup(props, { attrs }) {
    const listProps = attrs as UiListPropsType<any>
    const api = ref<GridApi | null>(null)
    const applyingFilter = ref(false)
    const theme = computed(() => buildAgGridTheme())
    const columnDefs = computed(() =>
      buildColumnDefs(props.metaui, listProps),
    )

    const syncFilterModel = () => {
      const grid = api.value
      if (!grid) return
      applyingFilter.value = true
      try {
        grid.setFilterModel(
          entityFilterToAgModel(listProps.filterModel, props.metaui),
        )
      } finally {
        applyingFilter.value = false
      }
    }

    watch(
      () => listProps.filterModel,
      () => syncFilterModel(),
      { deep: true },
    )
    watch(
      () => listProps.layoutRev && (listProps.layoutRev as any).value,
      () => {
        api.value?.refreshCells({ force: true })
      },
    )

    const onGridReady = (event: GridReadyEvent) => {
      api.value = event.api
      syncFilterModel()
      const selected = (listProps as any).selectedItems as any[] | undefined
      if (selected?.length) {
        event.api.forEachNode(node => {
          if (selected.includes(node.data)) node.setSelected(true)
        })
      }
    }

    const onFilterChanged = (event: FilterChangedEvent) => {
      if (applyingFilter.value) return
      const model = agFilterModelToEntity(event.api.getFilterModel(), props.metaui)
      listProps.onFilterModelChange?.(model)
    }

    const onSortChanged = (event: SortChangedEvent) => {
      const sorts = (event.api.getColumnState() ?? [])
        .filter(col => col.sort)
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
        .map(col => ({
          sortBy: col.colId as string,
          sortOrder: col.sort === 'desc' ? SortOrder.DESC : SortOrder.ASC,
        }))
      listProps.onSort?.(sorts)
    }

    const onSelectionChanged = (event: SelectionChangedEvent) => {
      const rows = event.api.getSelectedRows()
      listProps.onSelectionChange?.(rows)
      listProps.onSelect?.(rows)
    }

    const pagination = computed(
      () => (listProps.pagination ?? {}) as Pagination,
    )

    return () => {
      const selectionMode = listProps.selectionMode
      const rawHeight = listProps.height ?? listProps.maxHeight
      const height =
        typeof rawHeight === 'number'
          ? `${rawHeight}px`
          : rawHeight && rawHeight !== '100%'
            ? rawHeight
            : '28rem'
      const pageSize = pagination.value.pageSize ?? DEFAULT_PAGE_SIZE
      const pageNo = pagination.value.pageNo ?? 1
      const recordCount = pagination.value.recordCount ?? props.data.length

      return h('div', { class: 'mmda-ag-grid' }, [
        h(
          'div',
          {
            class: 'mmda-ag-grid__body',
            style: { height },
          },
          [
            h(AgGridVue, {
              class: 'mmda-ag-grid__table',
              style: { width: '100%', height: '100%' },
              theme: theme.value,
              rowData: props.data,
              columnDefs: columnDefs.value as ColDef[],
              defaultColDef: {
                filter: listProps.filterDisplay !== 'none',
                resizable: true,
                sortable: listProps.enableSort !== false,
              },
              components: {
                MmdaAgGridCell,
                MmdaAgGridEditor,
              },
              context: {
                renderCell: listProps.renderCell,
                gridCellRenderer: listProps.gridCellRenderer,
              },
              treeData: Boolean((listProps as any).treeData),
              getDataPath: (listProps as any).getDataPath,
              animateRows: true,
              suppressCellFocus: false,
              getRowId: listProps.itemKey
                ? (params: { data: any }) => listProps.itemKey!(params.data)
                : props.metaui.primaryKey
                  ? (params: { data: any }) =>
                      String(params.data?.[props.metaui.primaryKey!] ?? '')
                  : undefined,
              rowSelection: selectionMode
                ? {
                    mode:
                      selectionMode === 'single' ? 'singleRow' : 'multiRow',
                    checkboxes: true,
                    headerCheckbox: selectionMode === 'multiple',
                  }
                : undefined,
              loading: Boolean(
                typeof listProps.loading === 'object'
                  ? (listProps.loading as any).value
                  : listProps.loading,
              ),
              onGridReady,
              onFilterChanged,
              onSortChanged,
              onSelectionChanged,
              onRowClicked: (event: RowClickedEvent) =>
                listProps.onItemClick?.(event.data),
              onRowDoubleClicked: (event: any) =>
                listProps.onItemDoubleClick?.(event.data),
              onColumnMoved: () => listProps.onListLayoutChange?.(),
              onColumnResized: () => listProps.onListLayoutChange?.(),
              onColumnVisible: () => listProps.onListLayoutChange?.(),
              onColumnPinned: () => listProps.onListLayoutChange?.(),
              getContextMenuItems: listProps.rowMenu
                ? (params: { node?: { data?: any } }) => {
                    const actions = listProps.rowMenu?.(params.node?.data) ?? []
                    return actions.map(action => ({
                      name: String(action.label ?? action.name ?? ''),
                      action: () =>
                        (action.onAction ?? action.command)?.(params.node?.data),
                      disabled: action.disabled === true,
                    }))
                  }
                : undefined,
              stopEditingWhenCellsLoseFocus: true,
            } as any),
          ],
        ),
        listProps.pagination
          ? h(
              'div',
              { class: 'mmda-ag-grid__pager' },
              h(NPagination, {
                page: pageNo,
                pageSize,
                itemCount: recordCount,
                pageSizes: listProps.pageSizeOptions ?? [
                  ...DEFAULT_PAGE_SIZE_OPTIONS,
                ],
                showSizePicker: true,
                'onUpdate:page': (page: number) =>
                  listProps.onPage?.({ pageNo: page, pageSize }),
                'onUpdate:pageSize': (size: number) =>
                  listProps.onPage?.({ pageNo: 1, pageSize: size }),
              }),
            )
          : null,
      ])
    }
  },
})
