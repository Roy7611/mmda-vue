import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  kanbanDragEnabled,
  kanbanHookClass,
  UiPluginName,
  type UiKanbanCard,
  type UiKanbanColumn,
  type UiKanbanProps,
  type UiPlugin,
} from '@mmda/core'
import { cssSize, joinClass, reactDomProps } from './utils'

const KNOWN = new Set([
  'id',
  'title',
  'status',
  'summary',
  'tags',
  'assignee',
  'order',
  'priority',
  'progress',
  'dueDate',
])

export function tagsToString(tags: UiKanbanCard['tags']): string {
  if (tags == null) return ''
  return Array.isArray(tags) ? tags.join(',') : String(tags)
}

export function tagsFromString(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (value == null || value === '') return []
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function uiCardToEj2(card: UiKanbanCard): Record<string, unknown> {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(card)) {
    if (!KNOWN.has(key)) rest[key] = value
  }
  return {
    ...rest,
    Id: card.id,
    Title: card.title ?? String(card.id),
    Status: card.status,
    Summary: card.summary ?? '',
    Tags: tagsToString(card.tags),
    Assignee: card.assignee,
    RankId: card.order,
    Priority: card.priority,
    Progress: card.progress,
    DueDate: card.dueDate,
  }
}

export function ej2RecordToUiCard(row: Record<string, unknown>): UiKanbanCard {
  const {
    Id,
    Title,
    Status,
    Summary,
    Tags,
    Assignee,
    RankId,
    Priority,
    Progress,
    DueDate,
    ...rest
  } = row
  return {
    ...rest,
    id: Id as string | number,
    title: Title == null ? undefined : String(Title),
    status: Status as string | number | undefined,
    summary: Summary == null || Summary === '' ? undefined : String(Summary),
    tags: tagsFromString(Tags),
    assignee: Assignee as UiKanbanCard['assignee'],
    order: RankId as number | undefined,
    priority: Priority as UiKanbanCard['priority'],
    progress: Progress as number | undefined,
    dueDate: (DueDate as UiKanbanCard['dueDate']) ?? undefined,
  }
}

export function uiColumnsToEj2(
  columns: UiKanbanColumn[] | undefined,
): Array<Record<string, unknown>> {
  return (columns ?? []).map((column) => ({
    keyField: String(column.key),
    headerText: column.header,
    allowToggle: column.allowToggle !== false,
    isExpanded: column.collapsed !== true,
    maxCount: column.maxCount,
    showItemCount: column.showCount === true || column.maxCount != null,
  }))
}

function MissingKanban(): ReactElement {
  return createElement(
    'p',
    { className: 'mmda-kanban-missing' },
    'Kanban requires @syncfusion/ej2-react-kanban',
  )
}

const KanbanImpl = lazy(async (): Promise<{ default: ComponentType<any> }> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingKanban
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-kanban')
    return { default: mod.KanbanComponent as ComponentType<any> }
  } catch {
    return { default: MissingKanban }
  }
})

export function SfKanbanView(props: UiKanbanProps): ReactElement {
  const readonly = props.readonly === true
  return createElement(
    'div',
    {
      className: joinClass(kanbanHookClass(props.class, readonly)),
      style: {
        width: cssSize(props.width, '100%'),
        height: cssSize(props.height, '70vh'),
      },
      ...reactDomProps(props),
    },
    createElement(
      Suspense,
      { fallback: null },
      createElement(KanbanImpl as any, {
        dataSource: (props.cards ?? []).map(uiCardToEj2),
        keyField: 'Status',
        columns: uiColumnsToEj2(props.columns),
        cardSettings: {
          headerField: 'Title',
          contentField: 'Summary',
          tagsField: 'Tags',
        },
        sortSettings: { sortBy: 'Index', field: 'RankId' },
        allowDragAndDrop: kanbanDragEnabled(props),
        enableVirtualization: props.virtualizing === true,
        height: '100%',
        width: '100%',
        cardClick: (args: any) => {
          const card = ej2RecordToUiCard(args?.data ?? {})
          if (card.id != null) props.onCardClick?.(card)
        },
        cardDoubleClick: (args: any) => {
          args.cancel = true
          const card = ej2RecordToUiCard(args?.data ?? {})
          if (card.id != null) props.onCardDblClick?.(card)
        },
        dataSourceChanged: (args: any) => {
          if (args?.requestType !== 'cardChanged') return
          for (const record of args?.changedRecords ?? []) {
            void props.onCardChange?.({
              action: 'update',
              card: ej2RecordToUiCard(record),
            })
          }
        },
      }),
    ),
  )
}

export function createSfKanbanPlugin(): UiPlugin {
  return {
    name: UiPluginName.kanban,
    buildUi(_context, props) {
      return SfKanbanView(props as UiKanbanProps)
    },
  }
}
