/*
 * 看板是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setKanbanPlugin(createSfKanbanPlugin())
 */
import {
  defineAsyncComponent,
  defineComponent,
  h,
  type PropType,
} from 'vue'
import type {
  UiKanbanCard,
  UiKanbanColumn,
  UiKanbanPlugin,
  UiKanbanViewProps,
} from '@mmda/vui'
import {
  htmlAttributesOf,
  kanbanDragEnabled,
  kanbanHookClass,
} from '@mmda/vui'

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

function cssSize(value: string | number | undefined, fallback: string) {
  if (value == null) return fallback
  return typeof value === 'number' ? `${value}px` : value
}

const KanbanImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-kanban')
    await import('@syncfusion/ej2-kanban/styles/material3.css')
    return { default: (mod as any).KanbanComponent }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h(
            'p',
            { class: 'mmda-sf-kanban-missing' },
            'Kanban requires @syncfusion/ej2-vue-kanban',
          ),
      }),
    }
  }
})

export const SfKanbanView = defineComponent({
  name: 'SfKanbanView',
  props: {
    cards: { type: Array as PropType<UiKanbanCard[]>, default: () => [] },
    columns: { type: Array as PropType<UiKanbanColumn[]>, default: () => [] },
    readonly: { type: Boolean, default: false },
    allowDragAndDrop: { type: Boolean, default: true },
    allowAddCard: { type: Boolean, default: false },
    virtualizing: { type: Boolean, default: false },
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '70vh' },
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    onCardChange: Function as PropType<UiKanbanViewProps['onCardChange']>,
    onCardClick: Function as PropType<UiKanbanViewProps['onCardClick']>,
    onCardDblClick: Function as PropType<UiKanbanViewProps['onCardDblClick']>,
    onColumnToggle: Function as PropType<UiKanbanViewProps['onColumnToggle']>,
  },
  setup(props) {
    let dragFrom: string | number | undefined

    function rowOf(data: unknown): Record<string, unknown> | undefined {
      const first = Array.isArray(data) ? data[0] : data
      return first && typeof first === 'object'
        ? (first as Record<string, unknown>)
        : undefined
    }

    function cardOf(data: unknown): UiKanbanCard | undefined {
      const row = rowOf(data)
      return row ? ej2RecordToUiCard(row) : undefined
    }

    function columnOf(key: unknown): UiKanbanColumn | undefined {
      return props.columns.find((column) => String(column.key) === String(key))
    }

    return () =>
      h(
        'div',
        {
          class: kanbanHookClass(
            ['mmda-sf-kanban', props.class],
            props.readonly,
          ),
          style: {
            width: cssSize(props.width, '100%'),
            height: cssSize(props.height, '70vh'),
          },
          ...htmlAttributesOf(props as any),
        },
        [
          h(KanbanImpl, {
            dataSource: props.cards.map(uiCardToEj2),
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
            dialogOpen: (args: { cancel?: boolean }) => {
              args.cancel = true
            },
            cardClick: (args: { data?: unknown }) => {
              const card = cardOf(args.data)
              if (card) props.onCardClick?.(card)
            },
            cardDoubleClick: (args: { data?: unknown; cancel?: boolean }) => {
              args.cancel = true
              const card = cardOf(args.data)
              if (card) props.onCardDblClick?.(card)
            },
            dragStart: (args: { data?: unknown }) => {
              dragFrom = rowOf(args.data)?.Status as string | number | undefined
            },
            dragStop: (args: { data?: unknown; cancel?: boolean }) => {
              const row = rowOf(args.data)
              const card = row ? ej2RecordToUiCard(row) : undefined
              if (!card) return
              const result = props.onCardChange?.({
                action: 'move',
                card,
                fromStatus: dragFrom,
                toStatus: card.status,
                native: args,
              })
              if (result === false) args.cancel = true
            },
            dataSourceChanged: (args: {
              requestType?: string
              changedRecords?: Record<string, unknown>[]
            }) => {
              if (args.requestType !== 'cardChanged') return
              for (const record of args.changedRecords ?? []) {
                void props.onCardChange?.({
                  action: 'update',
                  card: ej2RecordToUiCard(record),
                  native: args,
                })
              }
            },
            actionComplete: (args: {
              requestType?: string
              element?: HTMLElement
              cancel?: boolean
            }) => {
              if (args.requestType !== 'columnCollapse' && args.requestType !== 'columnExpand') {
                return
              }
              const key = args.element?.getAttribute?.('data-key')
              const column = columnOf(key)
              if (!column) return
              props.onColumnToggle?.(column, args.requestType === 'columnCollapse')
            },
          }),
        ],
      )
  },
})

export function createSfKanbanPlugin(): UiKanbanPlugin {
  return {
    kanbanView: (props) => h(SfKanbanView, props as any),
  }
}
