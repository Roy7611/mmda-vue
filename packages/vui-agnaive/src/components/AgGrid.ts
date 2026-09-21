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
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, SortOrder, SqlDataType, type MetaUi, type MetaUiField, type Pagination } from '@mmda/core'
import { wrapRowDetail, type UiListPropsType } from '@mmda/vui'
import {
  agFilterModelToEntity,
  entityFilterToAgModel,
} from '../ag_filter'
import { agGridLocaleText } from '../ag_grid_i18n'
import { buildAgGridTheme } from '../agnaive_theme'
import { buildColumnDefs, cellNodeFromParams, editorFieldOf } from '../ag_columns'
import { AgHasOneFilter } from './AgHasOneFilter'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])

const AgGridCell = defineComponent({
  name: 'AgGridCell',
  props: {
    params: { type: Object as PropType<ICellRendererParams>, required: true },
  },
  setup(props) {
    return () => cellNodeFromParams(props.params)
  },
})

const AgGridEditor = defineComponent({
  name: 'AgGridEditor',
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
          const labels = (props.params.context as { filterLabels?: { yes?: string; no?: string } } | undefined)
            ?.filterLabels
          return h(NSelect, {
            ...common,
            options: [
              { label: labels?.yes ?? 'Yes', value: true },
              { label: labels?.no ?? 'No', value: false },
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

const AgRowDetail = defineComponent({
  name: 'AgRowDetail',
  props: {
    params: { type: Object as PropType<ICellRendererParams>, required: true },
  },
  setup(props) {
    return () => {
      const spec = (props.params.context as { rowDetail?: UiListPropsType['rowDetail'] })
        ?.rowDetail
      const row = props.params.data
      return wrapRowDetail(spec?.detail?.(row))
    }
  },
})

export const AgGrid = defineComponent({
  name: 'AgGrid',
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<any[]>, default: () => [] },
    metaUi: { type: Object as PropType<MetaUi | null>, default: null },
    fields: { type: Array as PropType<MetaUiField[]>, default: () => [] },
    primaryKey: { type: String as PropType<string | undefined>, default: undefined },
  },
  setup(props, { attrs }) {
    const listProps = attrs as UiListPropsType<any>
    const api = ref<GridApi | null>(null)
    const applyingFilter = ref(false)
    const theme = computed(() => buildAgGridTheme())
    const effectiveMeta = computed<MetaUi>(() =>
      (props.fields?.length
        ? {
            primaryKey: props.primaryKey,
            getListedFields: () => props.fields,
            groups: [],
          }
        : props.metaUi) as MetaUi,
    )
    const columnDefs = computed(() =>
      buildColumnDefs(effectiveMeta.value, listProps),
    )

    const syncFilterModel = () => {
      const grid = api.value
      if (!grid) return
      applyingFilter.value = true
      try {
        grid.setFilterModel(
          entityFilterToAgModel(listProps.filterModel, effectiveMeta.value),
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
      () => listProps.tableSettings?.rev?.value,
      () => {
        api.value?.refreshCells({ force: true })
      },
    )
    watch(
      () => props.data,
      () => {
        const detail = listProps.rowDetail
        if (!detail || detail.expandAll === false) return
        api.value?.forEachNode(node => node.setExpanded(true))
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
      const detail = listProps.rowDetail
      if (detail && detail.expandAll !== false) {
        event.api.forEachNode(node => node.setExpanded(true))
      }
    }

    const onFilterChanged = (event: FilterChangedEvent) => {
      if (applyingFilter.value) return
      const model = agFilterModelToEntity(event.api.getFilterModel(), effectiveMeta.value)
      return listProps.onFilterModelChange?.(model)
    }

    const onSortChanged = (event: SortChangedEvent) => {
      const sorts = (event.api.getColumnState() ?? [])
        .filter(col => col.sort)
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
        .map(col => ({
          sortBy: col.colId as string,
          sortOrder: col.sort === 'desc' ? SortOrder.DESC : SortOrder.ASC,
        }))
      return listProps.onSort?.(sorts)
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
      const hasPager = Boolean(listProps.pagination)
      // 与 Syncfusion 一致：有分页（索引/树列表）才撑满父级；子表无高度链，用 autoHeight
      const autoHeight =
        rawHeight === 'auto' ||
        rawHeight === 'Auto' ||
        (!rawHeight && !hasPager)
      const height = autoHeight
        ? 'auto'
        : typeof rawHeight === 'number'
          ? `${rawHeight}px`
          : rawHeight
            ? String(rawHeight)
            : '100%'
      const fillParent = !autoHeight && height === '100%'
      const pageSize = pagination.value.pageSize ?? DEFAULT_PAGE_SIZE
      const pageNo = pagination.value.pageNo ?? 1
      const recordCount = pagination.value.recordCount ?? props.data.length

      return h(
        'div',
        {
          class: [
            'mmda-ag-grid',
            fillParent ? null : 'mmda-ag-grid--sized',
            autoHeight ? 'mmda-ag-grid--auto' : null,
          ]
            .filter(Boolean)
            .join(' '),
        },
        [
        h(
          'div',
          {
            class: 'mmda-ag-grid__body',
            style: fillParent
              ? { flex: '1 1 auto', minHeight: 0 }
              : autoHeight
                ? { height: 'auto' }
                : { height },
          },
          [
            h(AgGridVue, {
              class: 'mmda-ag-grid__table',
              style: autoHeight
                ? { width: '100%' }
                : { width: '100%', height: '100%' },
              theme: theme.value,
              localeText: agGridLocaleText(),
              rowData: props.data,
              columnDefs: columnDefs.value as ColDef[],
              defaultColDef: {
                filter: listProps.filterable !== false,
                suppressHeaderMenuButton: listProps.filterable === false,
                resizable: true,
                sortable: listProps.sortable !== false,
              },
              components: {
                AgGridCell,
                AgGridEditor,
                AgHasOneFilter,
                AgRowDetail,
              },
              context: {
                renderCell: listProps.renderCell,
                rowDetail: listProps.rowDetail,
                filterLabels: listProps.filterLabels,
              },
              domLayout: autoHeight ? 'autoHeight' : undefined,
              treeData: Boolean((listProps as any).treeData) && !listProps.rowDetail,
              getDataPath: listProps.rowDetail
                ? undefined
                : (listProps as any).getDataPath,
              masterDetail: Boolean(listProps.rowDetail),
              detailCellRenderer: listProps.rowDetail ? 'AgRowDetail' : undefined,
              detailRowAutoHeight: Boolean(listProps.rowDetail),
              isRowMaster: listProps.rowDetail ? () => true : undefined,
              animateRows: true,
              suppressCellFocus: false,
              getRowId: listProps.itemKey
                ? (params: { data: any }) => listProps.itemKey!(params.data)
                : effectiveMeta.value.primaryKey
                  ? (params: { data: any }) =>
                      String(params.data?.[effectiveMeta.value.primaryKey!] ?? '')
                  : undefined,
              rowSelection: selectionMode
                ? {
                    mode:
                      selectionMode === 'single' ? 'singleRow' : 'multiRow',
                    checkboxes: true,
                    headerCheckbox: selectionMode === 'multiple',
                    // 点行可选；multiRow 下 Shift 连选、Ctrl/Cmd 点选加减
                    enableClickSelection: true,
                  }
                : undefined,
              // checkbox leftmost; rowNum follows (also pinned left)
              selectionColumnDef: selectionMode
                ? {
                    pinned: 'left',
                    width: 48,
                    maxWidth: 48,
                    suppressHeaderMenuButton: true,
                    sortable: false,
                    resizable: false,
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
              onColumnMoved: () => listProps.tableSettings?.persist(),
              onColumnResized: () => listProps.tableSettings?.persist(),
              onColumnVisible: () => listProps.tableSettings?.persist(),
              onColumnPinned: () => listProps.tableSettings?.persist(),
              getContextMenuItems: listProps.rowActions
                ? (params: { node?: { data?: any } }) => {
                    const actions = listProps.rowActions?.(params.node?.data) ?? []
                    return actions.map(action => ({
                      name: String(action.label ?? action.name ?? ''),
                      action: () =>
                        action.onAction?.(params.node?.data),
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
      ],
      )
    }
  },
})
