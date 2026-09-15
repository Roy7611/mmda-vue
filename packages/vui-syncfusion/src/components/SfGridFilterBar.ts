import { defineComponent, h, type PropType } from 'vue'
import { type FilterModel, type MetaUi } from '@mmda/core'
import { filterModelChips, type ListFilterBarChip } from '@mmda/vui'

export type SfGridFilterBarLabels = {
  filter: string
  all: string
  clearFilters: string
  saveQuery?: string
  deleteQuery?: string
}

/**
 * 过滤芯片条。和 SfGrid 表头过滤共用同一份 FilterModel，不碰列布局。
 */
export const SfGridFilterBar = defineComponent({
  name: 'SfGridFilterBar',
  props: {
    filterModel: {
      type: Object as PropType<FilterModel | undefined>,
      default: undefined,
    },
    metaUi: {
      type: Object as PropType<MetaUi>,
      required: true,
    },
    labels: {
      type: Object as PropType<SfGridFilterBarLabels>,
      required: true,
    },
    t: {
      type: Function as PropType<(key: string) => string>,
      required: true,
    },
    chips: {
      type: Function as PropType<(props: Record<string, unknown>) => unknown>,
      required: true,
    },
    button: {
      type: Function as PropType<(props: Record<string, unknown>) => unknown>,
      required: true,
    },
    resolveIcon: {
      type: Function as PropType<(icon: string) => string>,
      default: (icon: string) => icon,
    },
    skipFields: {
      type: Object as PropType<Set<string>>,
      default: () => new Set<string>(),
    },
    extra: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    queryID: { type: String, default: undefined },
    canDeleteQuery: { type: Boolean, default: false },
  },
  emits: {
    filterModelChange: (_model: FilterModel) => true,
    saveQuery: () => true,
    deleteQuery: () => true,
  },
  setup(props, { emit }) {
    const iconButton = (
      className: string,
      icon: string,
      title: string,
      onClick: () => void,
    ) =>
      props.button({
        class: className,
        icon: props.resolveIcon(icon),
        tooltip: title,
        label: '',
        buttonType: 'text',
        colorRole: 'secondary',
        onClick,
      })

    const removeField = (fieldName: string) => {
      const next: FilterModel = { ...(props.filterModel ?? {}) }
      delete next[fieldName]
      emit('filterModelChange', next)
    }

    return () => {
      const chipItems: ListFilterBarChip[] = filterModelChips(
        props.filterModel,
        props.metaUi,
        props.t,
        props.skipFields,
      )
      const items = chipItems.map(chip => ({
        label: chip.label,
        value: chip.fieldName,
      }))
      const extraNodes = props.extra ?? []
      const chipList = items.length
        ? props.chips({
            kind: 'input',
            removable: true,
            outlined: true,
            items,
            onRemove: (item: { value?: unknown }) => {
              const name = String(item.value ?? '')
              if (name) removeField(name)
            },
          })
        : extraNodes.length
          ? null
          : props.chips({
              class: 'mmda-list-filter-bar__all',
              kind: 'action',
              items: [
                {
                  label: props.labels.all,
                  value: '__all__',
                },
              ],
              selected: '__all__',
            })
      const actions = h('div', { class: 'mmda-list-filter-bar__actions' }, [
        iconButton(
          'mmda-list-filter-bar__clear',
          'clear',
          props.labels.clearFilters,
          () => emit('filterModelChange', {}),
        ),
        props.labels.saveQuery
          ? iconButton(
              'mmda-list-filter-bar__save',
              'save',
              props.labels.saveQuery,
              () => emit('saveQuery'),
            )
          : null,
        props.canDeleteQuery && props.labels.deleteQuery
          ? iconButton(
              'mmda-list-filter-bar__delete-query',
              'delete',
              props.labels.deleteQuery,
              () => emit('deleteQuery'),
            )
          : null,
      ])
      const empty = !items.length && !extraNodes.length
      return h(
        'div',
        {
          class: empty
            ? 'mmda-list-filter-bar mmda-list-filter-bar--empty'
            : 'mmda-list-filter-bar',
        },
        [
          h(
            'span',
            { class: 'mmda-list-filter-bar__title' },
            props.labels.filter,
          ),
          chipList,
          ...extraNodes,
          actions,
        ],
      )
    }
  },
})
