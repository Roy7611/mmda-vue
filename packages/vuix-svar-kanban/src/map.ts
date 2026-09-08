import type { UiKanbanCard, UiKanbanColumn } from '@mmda/vui'

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

export function usersOf(assignee: UiKanbanCard['assignee']): string[] {
  if (assignee == null || assignee === '') return []
  return Array.isArray(assignee) ? assignee.map(String) : [String(assignee)]
}

export function uiCardToSvar(card: UiKanbanCard): Record<string, unknown> {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(card)) {
    if (!KNOWN.has(key)) rest[key] = value
  }
  return {
    ...rest,
    id: card.id,
    label: card.title ?? String(card.id),
    column: card.status,
    description: card.summary,
    tags: card.tags,
    users: usersOf(card.assignee),
    priority: card.priority,
    progress: card.progress,
    deadline: card.dueDate,
  }
}

export function svarCardToUi(row: Record<string, unknown>): UiKanbanCard {
  const {
    id,
    label,
    column,
    description,
    tags,
    users,
    priority,
    progress,
    deadline,
    ...rest
  } = row
  const assignees = Array.isArray(users) ? users.map(String) : undefined
  return {
    ...rest,
    id: id as string | number,
    title: label == null ? undefined : String(label),
    status: column as string | number | undefined,
    summary:
      description == null || description === ''
        ? undefined
        : String(description),
    tags: tags as UiKanbanCard['tags'],
    assignee:
      assignees == null
        ? undefined
        : assignees.length <= 1
          ? assignees[0]
          : assignees,
    priority: priority as UiKanbanCard['priority'],
    progress: progress as number | undefined,
    dueDate: (deadline as UiKanbanCard['dueDate']) ?? undefined,
  }
}

export function uiColumnsToSvar(
  columns: UiKanbanColumn[] | undefined,
  allowAddCard: boolean,
): Array<Record<string, unknown>> {
  return (columns ?? []).map((column) => ({
    id: column.key,
    label: column.header,
    collapsed: column.collapsed === true,
    cardLimit:
      column.maxCount != null
        ? column.maxCount
        : column.showCount
          ? true
          : undefined,
    addCard: allowAddCard,
  }))
}
