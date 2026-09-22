import { createElement, type ReactElement } from 'react'
import {
  applyGanttLinksToTasks,
  ganttHookClass,
  UiPluginName,
  type UiGanttLink,
  type UiGanttProps,
  type UiGanttTask,
  type UiPlugin,
} from '@mmda/core'
import {
  GanttComponent,
  Inject,
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
} from '@syncfusion/ej2-react-gantt'
import { cssSize, joinClass, reactDomProps } from './utils'

export function mapUiTasksToEj2(
  tasks: UiGanttTask[] = [],
  links: UiGanttLink[] = [],
) {
  return applyGanttLinksToTasks(tasks, links).map((task) => ({
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
    type:
      record?.Milestone || record?.type === 'milestone'
        ? 'milestone'
        : record?.type,
    readonly: record?.isReadonly ?? record?.readonly,
  }
}

export function SfGanttChart(props: UiGanttProps): ReactElement {
  const tasks = mapUiTasksToEj2(props.tasks, props.links)
  const readonly = props.readonly === true

  return createElement(
    'div',
    {
      className: joinClass(ganttHookClass('mmda-gantt', readonly)),
      style: { height: cssSize(props.height, '100%') },
      ...reactDomProps(props),
    },
    createElement(
      GanttComponent as any,
      {
        dataSource: tasks,
        height: '100%',
        locale: props.locale ?? 'zh-Hans',
        enableVirtualization: (tasks.length ?? 0) > 200,
        allowFiltering: true,
        allowSorting: true,
        allowResizing: true,
        allowReordering: true,
        allowRowDragAndDrop: props.allowRowReorder && !readonly,
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
        columns: (props.columns ?? []).map((col) => ({
          field: col.field,
          headerText: col.header ?? col.field,
          width: col.width,
          minWidth: col.minWidth,
          allowEditing: !col.readonly,
        })),
        editSettings: {
          allowEditing: !readonly,
          allowAdding: !readonly,
          allowDeleting: !readonly,
          allowTaskbarEditing:
            !readonly && (props.allowTaskDrag || props.allowTaskResize),
        },
        rowSelected: (args: any) => {
          if (args?.data) {
            props.onTaskSelect?.([ej2RecordToUiTask(args.data).id])
          }
        },
        taskbarEdited: (args: any) => {
          void props.onTaskChange?.({
            action: 'update',
            task: ej2RecordToUiTask(args?.data),
          })
        },
        actionComplete: (args: any) => {
          const requestType = String(args?.requestType ?? '')
          if (requestType === 'save') {
            void props.onTaskChange?.({
              action: 'update',
              task: ej2RecordToUiTask(args?.data),
            })
          }
          if (requestType === 'delete') {
            void props.onTaskChange?.({
              action: 'delete',
              task: ej2RecordToUiTask(args?.data),
            })
          }
        },
      },
      createElement(Inject as any, {
        services: [
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
      }),
    ),
  )
}

export function createSfGanttPlugin(): UiPlugin {
  return {
    name: UiPluginName.gantt,
    buildUi(_context, props) {
      return SfGanttChart(props as UiGanttProps)
    },
  }
}
