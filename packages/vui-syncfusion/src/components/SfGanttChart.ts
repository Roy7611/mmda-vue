import {
  defineAsyncComponent,
  defineComponent,
  h,
  onMounted,
  ref,
  shallowRef,
  watch,
  type PropType,
} from 'vue'
import {
  applyGanttLinksToTasks,
  createNoopGanttController,
  type UiGanttChartProps,
  type UiGanttController,
  type UiGanttLink,
  type UiGanttTask,
  type UiGanttViewMode,
} from '@mmda/vui'
import '@syncfusion/ej2-treegrid/styles/material3.css'
import '@syncfusion/ej2-gantt/styles/material3.css'

export const GANTT_VIEW_MODES: Record<
  UiGanttViewMode,
  { timelineViewMode: string; topTier?: unknown; bottomTier?: unknown }
> = {
  day: { timelineViewMode: 'Day' },
  week: { timelineViewMode: 'Week' },
  month: { timelineViewMode: 'Month' },
  quarter: {
    timelineViewMode: 'Month',
    topTier: { unit: 'Year', format: 'yyyy' },
    bottomTier: { unit: 'Month', count: 3, format: 'MMM' },
  },
  year: { timelineViewMode: 'Year' },
}

export function mapUiTasksToEj2(
  tasks: UiGanttTask[] = [],
  links: UiGanttLink[] = [],
) {
  return applyGanttLinksToTasks(tasks, links).map(task => ({
    ...task,
    TaskID: task.id,
    TaskName: task.name ?? '',
    StartDate: task.startDate ? new Date(task.startDate as any) : undefined,
    EndDate: task.endDate ? new Date(task.endDate as any) : undefined,
    Duration: task.duration,
    Progress: task.progress ?? 0,
    parentID: task.parentId ?? undefined,
    Predecessor: task.dependency,
    Milestone: task.type === 'milestone',
    isReadonly: !!task.readonly,
    taskColor: task.color,
  }))
}

export function ej2RecordToUiTask(record: any): UiGanttTask {
  return {
    ...(record ?? {}),
    id: record?.TaskID ?? record?.id,
    name: record?.TaskName ?? record?.name,
    startDate: record?.StartDate ?? record?.startDate,
    endDate: record?.EndDate ?? record?.endDate,
    duration: record?.Duration ?? record?.duration,
    parentId: record?.parentID ?? record?.parentId,
    progress: record?.Progress ?? record?.progress,
    type: record?.Milestone || record?.type === 'milestone' ? 'milestone' : record?.type,
    readonly: record?.isReadonly ?? record?.readonly,
  }
}

const GanttImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-gantt')
    const {
      GanttComponent,
      Edit,
      Selection,
      Toolbar,
      Filter,
      Sort,
      Resize,
      Reorder,
      ContextMenu,
      DayMarkers,
      UndoRedo,
      RowDD,
      VirtualScroll,
    } = mod as any
    return {
      default: defineComponent({
        name: 'SfGanttHost',
        components: { GanttComponent },
        provide: {
          gantt: [
            Edit,
            Selection,
            Toolbar,
            Filter,
            Sort,
            Resize,
            Reorder,
            ContextMenu,
            DayMarkers,
            UndoRedo,
            RowDD,
            VirtualScroll,
          ],
        },
        setup(_, { attrs }) {
          return () => h(GanttComponent as any, attrs)
        },
      }),
    }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h(
            'p',
            { class: 'mmda-sf-gantt-missing' },
            'Gantt requires @syncfusion/ej2-vue-gantt',
          ),
      }),
    }
  }
})

export const SfGanttChart = defineComponent({
  name: 'SfGanttChart',
  props: {
    tasks: { type: Array as PropType<UiGanttTask[]>, default: () => [] },
    links: { type: Array as PropType<UiGanttLink[]>, default: () => [] },
    columns: { type: Array as PropType<UiGanttChartProps['columns']>, default: () => [] },
    height: { type: [String, Number], default: '100%' },
    readonly: { type: Boolean, default: false },
    allowTaskDrag: { type: Boolean, default: true },
    allowTaskResize: { type: Boolean, default: true },
    allowLinks: { type: Boolean, default: true },
    allowRowReorder: { type: Boolean, default: false },
    viewMode: { type: String as PropType<UiGanttViewMode>, default: 'week' },
    loading: { type: Boolean, default: false },
    locale: { type: String, default: 'zh-Hans' },
    onReady: { type: Function as PropType<UiGanttChartProps['onReady']> },
    onTaskChange: { type: Function as PropType<UiGanttChartProps['onTaskChange']> },
    onLinkChange: { type: Function as PropType<UiGanttChartProps['onLinkChange']> },
    onTaskSelect: { type: Function as PropType<UiGanttChartProps['onTaskSelect']> },
    onTaskDblClick: { type: Function as PropType<UiGanttChartProps['onTaskDblClick']> },
    onRowReorder: { type: Function as PropType<UiGanttChartProps['onRowReorder']> },
  },
  setup(props) {
    const instance = shallowRef<any>()
    const snapshot = ref({
      tasks: props.tasks ?? [],
      links: props.links ?? [],
    })
    const dataSource = ref(mapUiTasksToEj2(props.tasks, props.links))

    const cloneState = () => ({
      tasks: JSON.parse(JSON.stringify(props.tasks ?? [])),
      links: JSON.parse(JSON.stringify(props.links ?? [])),
    })

    const restoreSnapshot = () => {
      dataSource.value = mapUiTasksToEj2(snapshot.value.tasks, snapshot.value.links)
      instance.value?.refresh?.()
    }

    const emitChange = async (
      kind: 'task' | 'link',
      action: string,
      payload: any,
    ) => {
      const handler = kind === 'task' ? props.onTaskChange : props.onLinkChange
      const ok = await handler?.({
        action,
        task: kind === 'task' ? ej2RecordToUiTask(payload.task ?? payload) : undefined,
        link: kind === 'link' ? payload.link ?? payload : undefined,
        native: payload,
      })
      if (ok === false) restoreSnapshot()
      else snapshot.value = cloneState()
      return ok
    }

    const controller: UiGanttController = {
      ...createNoopGanttController(),
      refresh: (tasks, links) => {
        dataSource.value = mapUiTasksToEj2(
          tasks ?? props.tasks,
          links ?? props.links,
        )
        instance.value?.refresh?.()
      },
      select: ids => instance.value?.selectRows?.(ids),
      expandAll: () => instance.value?.expandAll?.(),
      collapseAll: () => instance.value?.collapseAll?.(),
      setViewMode: mode => {
        const settings = GANTT_VIEW_MODES[mode] ?? GANTT_VIEW_MODES.week
        instance.value?.timelineModule?.changeTimelineSettings?.(settings)
      },
      fitToProject: () => instance.value?.fitToProject?.(),
      undo: () => instance.value?.undo?.() ?? restoreSnapshot(),
      scrollToDate: date =>
        instance.value?.scrollToDate?.(date instanceof Date ? date : new Date(date)),
      openEditor: id => instance.value?.openEditDialog?.(id),
    }

    onMounted(() => props.onReady?.(controller))

    watch(
      () => [props.tasks, props.links],
      () => {
        snapshot.value = cloneState()
        dataSource.value = mapUiTasksToEj2(props.tasks, props.links)
      },
      { deep: true },
    )

    return () =>
      h('div', { class: 'mmda-sf-gantt', 'data-loading': props.loading || undefined }, [
        h(GanttImpl, {
          ref: (el: any) => {
            instance.value = el?.ej2Instances ?? el
          },
          dataSource: dataSource.value,
          height:
            typeof props.height === 'number' ? `${props.height}px` : props.height,
          locale: props.locale,
          enableVirtualization: (props.tasks?.length ?? 0) > 200,
          allowFiltering: true,
          allowSorting: true,
          allowResizing: true,
          allowReordering: true,
          allowRowDragAndDrop: props.allowRowReorder && !props.readonly,
          highlightWeekends: true,
          taskFields: {
            id: 'TaskID',
            name: 'TaskName',
            startDate: 'StartDate',
            endDate: 'EndDate',
            duration: 'Duration',
            progress: 'Progress',
            parentID: 'parentID',
            dependency: 'Predecessor',
            milestone: 'Milestone',
          },
          columns: (props.columns ?? []).map(col => ({
            field: col.field,
            headerText: col.header ?? col.field,
            width: col.width,
            minWidth: col.minWidth,
            allowEditing: !col.readonly,
          })),
          editSettings: {
            allowEditing: !props.readonly,
            allowAdding: !props.readonly,
            allowDeleting: !props.readonly,
            allowTaskbarEditing:
              !props.readonly && (props.allowTaskDrag || props.allowTaskResize),
            mode: 'Auto',
          },
          toolbar: props.readonly
            ? []
            : ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'Undo', 'Redo', 'ExpandAll', 'CollapseAll'],
          timelineSettings: GANTT_VIEW_MODES[props.viewMode] ?? GANTT_VIEW_MODES.week,
          actionBegin: (args: any) => {
            if (args?.requestType === 'beforeOpenEditDialog' && args?.rowData?.isReadonly) {
              args.cancel = true
            }
          },
          actionComplete: (args: any) => {
            const type = String(args?.requestType ?? '')
            if (type.includes('RowDropped')) {
              void props.onRowReorder?.(ej2RecordToUiTask(args.data ?? args.rowData), {
                action: 'reorder',
                native: args,
              })
            }
          },
          taskbarEdited: (args: any) => {
            void emitChange('task', args?.taskBarEditAction ?? 'taskbarEdited', args)
          },
          endEdit: (args: any) => {
            void emitChange('task', 'endEdit', args)
          },
          rowSelected: (args: any) => {
            const ids = []
              .concat(args?.data ?? [])
              .map((row: any) => row?.TaskID ?? row?.id)
              .filter(Boolean)
            props.onTaskSelect?.(ids)
          },
          recordDoubleClick: (args: any) => {
            props.onTaskDblClick?.(ej2RecordToUiTask(args?.rowData ?? args?.taskBarData))
          },
        }),
      ])
  },
})
