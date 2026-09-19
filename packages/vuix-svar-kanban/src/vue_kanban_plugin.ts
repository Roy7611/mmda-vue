import {
  defineAsyncComponent,
  defineComponent,
  h,
  type PropType,
} from 'vue'
import type {
  UiKanbanCard,
  UiKanbanColumn,
  UiKanbanProps,
} from '@mmda/vui'
import {
  kanbanAddCardEnabled,
  kanbanDragEnabled,
  kanbanHookClass,
  UiPluginName,
  type UiPlugin
} from '@mmda/vui'
import { svarCardToUi, uiCardToSvar, uiColumnsToSvar } from './map'
import { uiRenderProps } from '@mmda/core'

function cssSize(value: string | number | undefined, fallback: string) {
  if (value == null) return fallback
  return typeof value === 'number' ? `${value}px` : value
}

const SvarBoard = defineAsyncComponent(async () => {
  try {
    const mod = await import('@svar-ui/vue-kanban')
    try {
      await import('@svar-ui/vue-kanban/style.css')
    } catch {
      /* theme may ship with Willow */
    }
    const Kanban = (mod as any).Kanban
    const Willow = (mod as any).Willow
    return {
      default: defineComponent({
        name: 'SvarKanbanHost',
        inheritAttrs: false,
        setup(_, { attrs }) {
          return () =>
            Willow
              ? h(Willow, null, { default: () => h(Kanban, attrs) })
              : h(Kanban, attrs)
        },
      }),
    }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h(
            'p',
            { class: 'mmda-vue-kanban-missing' },
            'Kanban requires @svar-ui/vue-kanban',
          ),
      }),
    }
  }
})

export const VueKanbanView = defineComponent({
  name: 'VueKanbanView',
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
    onCardChange: Function as PropType<UiKanbanProps['onCardChange']>,
    onCardClick: Function as PropType<UiKanbanProps['onCardClick']>,
    onCardDblClick: Function as PropType<UiKanbanProps['onCardDblClick']>,
    onColumnToggle: Function as PropType<UiKanbanProps['onColumnToggle']>,
  },
  setup(props) {
    function cardById(id: unknown): UiKanbanCard | undefined {
      return props.cards.find((card) => String(card.id) === String(id))
    }

    function columnByKey(key: unknown): UiKanbanColumn | undefined {
      return props.columns.find((column) => String(column.key) === String(key))
    }

    function bindApi(api: {
      intercept: (name: string, fn: (ev: any) => boolean | void) => void
    }) {
      api.intercept('select-card', (ev) => {
        if (ev.id == null) return
        const card = cardById(ev.id)
        if (card) props.onCardClick?.(card)
        return false
      })
      api.intercept('move-card', (ev) => {
        if (!kanbanDragEnabled(props)) return false
        const card = cardById(ev.id)
        if (!card) return false
        const result = props.onCardChange?.({
          action: 'move',
          card: { ...card, status: ev.column ?? card.status },
          fromStatus: card.status,
          toStatus: ev.column,
          beforeId: ev.before ?? null,
        })
        return result !== false
      })
      api.intercept('add-card', (ev) => {
        if (!kanbanAddCardEnabled(props)) return false
        const mapped = svarCardToUi({
          ...(ev.card ?? {}),
          id: ev.id ?? ev.card?.id,
        })
        const result = props.onCardChange?.({
          action: 'add',
          card: mapped,
        })
        return result !== false
      })
      api.intercept('delete-card', (ev) => {
        const card = cardById(ev.id)
        if (!card) return false
        const result = props.onCardChange?.({
          action: 'delete',
          card,
        })
        return result !== false
      })
      api.intercept('update-card', (ev) => {
        const card = cardById(ev.id)
        if (!card) return false
        const result = props.onCardChange?.({
          action: 'update',
          card: { ...card, ...svarCardToUi({ ...card, ...(ev.card ?? {}) }) },
        })
        return result !== false
      })
      api.intercept('update-column', (ev) => {
        const column = columnByKey(ev.id)
        if (column && typeof ev.column?.collapsed === 'boolean') {
          props.onColumnToggle?.(column, ev.column.collapsed)
        }
      })
    }

    return () =>
      h(
        'div',
        {
          class: kanbanHookClass(
            ['mmda-vue-kanban', props.class],
            props.readonly,
          ),
          style: {
            width: cssSize(props.width, '100%'),
            height: cssSize(props.height, '70vh'),
          },
          ...uiRenderProps(props as any).attributes,
          onDblclick: (event: MouseEvent) => {
            const host = (event.target as HTMLElement | null)?.closest?.(
              '[data-id]',
            )
            const id = host?.getAttribute('data-id')
            const card = id == null ? undefined : cardById(id)
            if (card) props.onCardDblClick?.(card)
          },
        },
        [
          h(SvarBoard, {
            cards: props.cards.map(uiCardToSvar),
            columns: uiColumnsToSvar(
              props.columns,
              kanbanAddCardEnabled(props),
            ),
            columnAccessor: 'column',
            readonly: props.readonly === true,
            render: { virtualizeCards: props.virtualizing === true },
            init: bindApi,
          }),
        ],
      )
  },
})

export function createVueKanbanPlugin(): UiPlugin {
  return {
    name: UiPluginName.kanban,
    buildUi(_context, props) {
      return h(VueKanbanView, props as any)
    },
  }
}
