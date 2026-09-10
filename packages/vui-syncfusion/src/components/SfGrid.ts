import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
} from 'vue'
import { SortOrder, type EntityFilterModel, type MetaUi, type MetaUiField, type Sort } from '@mmda/core'
import { gridFiltersToModel } from '../factory/utils'
import { SfGridHost } from '../factory/grid'
import {
  buildSfGridColumns,
  sfGridSceneDefaults,
  type SfGridScene,
} from '../sf_grid_column'

export type { SfGridScene }

/**
 * Syncfusion 皮肤的通用表格契约实现。
 *
 * - 不持有 UiContext；只吃 metaUi + dataSource + 回调
 * - 列过滤读 MetaUiField.filterTypes（TINYINT 位掩码；0 = 推断）
 * - 现网列表：**只**走 `factory.table`（`factory/table.ts`）。新功能加在那里。
 * - `components/SfGrid` 是目标契约控件；在 vui `buildTable` 改调 `factory.grid` 之前，不要两边同时加功能。
 */
export const SfGrid = defineComponent({
  name: 'SfGrid',
  props: {
    scene: {
      type: String as PropType<SfGridScene>,
      default: 'index',
    },
    metaUi: {
      type: Object as PropType<MetaUi>,
      required: true,
    },
    dataSource: {
      type: Array as PropType<object[]>,
      default: () => [],
    },
    height: {
      type: [String, Number] as PropType<string | number>,
      default: 400,
    },
    allowPaging: { type: Boolean, default: undefined },
    enableVirtualization: { type: Boolean, default: undefined },
    allowSorting: { type: Boolean, default: undefined },
    allowMultiSorting: { type: Boolean, default: undefined },
    allowFiltering: { type: Boolean, default: undefined },
    allowEditing: { type: Boolean, default: undefined },
    selectionMode: {
      type: String as PropType<'single' | 'multiple'>,
      default: undefined,
    },
    filterModel: {
      type: Object as PropType<EntityFilterModel>,
      default: undefined,
    },
    selectedItems: {
      type: Array as PropType<object[]>,
      default: undefined,
    },
    locale: { type: String, default: undefined },
  },
  emits: {
    filterModelChange: (_model: EntityFilterModel) => true,
    sort: (_sorts: Sort[]) => true,
    select: (_selection: object[]) => true,
    cellSave: (_row: object, _field: MetaUiField, _value: unknown) => true,
  },
  setup(props, { emit, expose, slots }) {
    const hostRef = ref<{ ej2Instances?: any } | null>(null)

    const defaults = computed(() => sfGridSceneDefaults(props.scene))

    const allowFiltering = computed(
      () => props.allowFiltering ?? defaults.value.allowFiltering,
    )
    const allowSorting = computed(
      () => props.allowSorting ?? defaults.value.allowSorting,
    )
    const allowMultiSorting = computed(
      () => props.allowMultiSorting ?? defaults.value.allowMultiSorting,
    )
    const allowEditing = computed(
      () => props.allowEditing ?? defaults.value.allowEditing,
    )
    const enableVirtualization = computed(
      () => props.enableVirtualization ?? defaults.value.enableVirtualization,
    )
    const selectionMode = computed(
      () => props.selectionMode ?? defaults.value.selectionMode,
    )

    const columns = computed(() =>
      buildSfGridColumns(props.metaUi, {
        allowFiltering: allowFiltering.value,
        allowSorting: allowSorting.value,
        allowEditing: allowEditing.value,
      }),
    )

    const emitFilterFromGrid = (ej2: any) => {
      const fields =
        props.metaUi.getListedFields?.() ??
        props.metaUi.groups
          ?.filter((group: any) => !group.many)
          .flatMap((group: any) => group.fields) ??
        []
      const model = gridFiltersToModel(ej2?.filterSettings?.columns, fields)
      emit('filterModelChange', model)
    }

    const toSort = (fieldName: string, direction: unknown): Sort => ({
      sortBy: fieldName,
      sortOrder:
        String(direction ?? '').toLowerCase() === 'descending'
          ? SortOrder.DESC
          : SortOrder.ASC,
    })

    const onActionComplete = (args: any) => {
      if (args?.requestType === 'filtering') {
        emitFilterFromGrid(hostRef.value?.ej2Instances)
      }
      if (args?.requestType === 'sorting') {
        const ej2 = hostRef.value?.ej2Instances
        const stacked = ej2?.sortSettings?.columns
        if (Array.isArray(stacked) && stacked.length) {
          emit(
            'sort',
            stacked.map((column: any) =>
              toSort(column.field, column.direction),
            ),
          )
          return
        }
        if (args.columnName) {
          emit('sort', [toSort(args.columnName, args.direction)])
        }
      }
    }

    const onRowSelected = () => {
      const ej2 = hostRef.value?.ej2Instances
      const rows = ej2?.getSelectedRecords?.() ?? []
      emit('select', rows)
    }

    watch(
      () => props.dataSource,
      data => {
        const ej2 = hostRef.value?.ej2Instances
        if (!ej2 || data === undefined) return
        ej2.dataSource = data
        ej2.dataBind?.()
      },
    )

    expose({
      get ej2Instances() {
        return hostRef.value?.ej2Instances
      },
      autoFitColumns(fieldNames?: string[]) {
        const ej2 = hostRef.value?.ej2Instances
        if (!ej2) return
        if (fieldNames?.length) ej2.autoFitColumns(fieldNames)
        else ej2.autoFitColumns()
      },
      refresh() {
        hostRef.value?.ej2Instances?.refresh?.()
      },
    })

    return () =>
      h(
        SfGridHost as any,
        {
          ref: hostRef,
          class: 'mmda-sf-grid',
          dataSource: props.dataSource,
          columns: columns.value,
          height: props.height,
          locale: props.locale,
          allowPaging: false,
          allowSorting: allowSorting.value,
          allowMultiSorting: allowMultiSorting.value,
          allowFiltering: allowFiltering.value,
          allowResizing: true,
          allowReordering: true,
          enableVirtualization: enableVirtualization.value,
          enableHover: props.scene !== 'index',
          filterSettings: allowFiltering.value
            ? { type: 'Menu', mode: 'OnEnter' }
            : undefined,
          selectionSettings: {
            type: selectionMode.value === 'multiple' ? 'Multiple' : 'Single',
            mode: allowEditing.value ? 'Cell' : 'Row',
          },
          editSettings: allowEditing.value
            ? {
                allowEditing: true,
                allowAdding: false,
                allowDeleting: false,
                mode: 'Batch',
                showConfirmDialog: false,
              }
            : { allowEditing: false },
          actionComplete: onActionComplete,
          rowSelected: onRowSelected,
          rowDeselected: onRowSelected,
        },
        slots,
      )
  },
})
