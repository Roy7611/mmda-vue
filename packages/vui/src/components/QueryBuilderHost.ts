import { computed, defineComponent, h, type PropType, type VNode } from 'vue'
import {
  compactAdvancedFilter,
  isAdvancedJoinFilter,
  type EntityAdvancedColumnFilter,
  type EntityAdvancedFilterModel,
  type EntityAdvancedJoinFilter,
  type EntityFilterOperator,
  type MetaUiField,
} from '@mmda/core'
import {
  defaultAdvancedColumn,
  defaultAdvancedJoin,
  defaultQueryBuilderOperators,
  emitQueryBuilderChange,
  queryBuilderColumnsOf,
  queryBuilderModifierClasses,
  queryBuilderValueOf,
  type UiQueryBuilderColumn,
  type UiQueryBuilderProps,
} from '../ui/factory/query_builder'

function asJoin(model?: EntityAdvancedFilterModel | null): EntityAdvancedJoinFilter {
  if (model && isAdvancedJoinFilter(model)) return model
  if (model) return { filterType: 'join', operator: 'AND', conditions: [model] }
  return defaultAdvancedJoin()
}

function patchAt(
  join: EntityAdvancedJoinFilter,
  index: number,
  next: EntityAdvancedFilterModel | undefined,
): EntityAdvancedJoinFilter {
  const conditions = join.conditions.slice()
  if (next == null) conditions.splice(index, 1)
  else conditions[index] = next
  return { ...join, conditions }
}

function operatorNeedsValue(op?: EntityFilterOperator): boolean {
  return op !== 'IS_NULL' && op !== 'IS_NOT_NULL' && op !== 'IS_TRUE' && op !== 'IS_FALSE'
}

function operatorNeedsRange(op?: EntityFilterOperator): boolean {
  return op === 'BETWEEN'
}

function operatorNeedsList(op?: EntityFilterOperator): boolean {
  return op === 'IN' || op === 'NOT_IN'
}

export const QueryBuilderHost = defineComponent({
  name: 'MmdaQueryBuilder',
  props: {
    fields: { type: Array as PropType<MetaUiField[]>, default: undefined },
    columns: {
      type: Array as PropType<UiQueryBuilderColumn[]>,
      default: undefined,
    },
    value: {
      type: Object as PropType<EntityAdvancedFilterModel>,
      default: undefined,
    },
    modelValue: {
      type: Object as PropType<EntityAdvancedFilterModel>,
      default: undefined,
    },
    disabled: { type: [Boolean, String], default: false },
    onChange: {
      type: Function as PropType<UiQueryBuilderProps['onChange']>,
      default: undefined,
    },
    class: { type: [String, Array, Object], default: undefined },
  },
  setup(props) {
    const chrome = computed(() => props as UiQueryBuilderProps)
    const columns = computed(() => queryBuilderColumnsOf(chrome.value))
    const disabled = computed(
      () => props.disabled === true || props.disabled === 'true',
    )

    const emit = (model: EntityAdvancedFilterModel | undefined) => {
      emitQueryBuilderChange(chrome.value, model)
    }

    const renderLeaf = (
      leaf: EntityAdvancedColumnFilter,
      onPatch: (next: EntityAdvancedFilterModel | undefined) => void,
    ) => {
      const column =
        columns.value.find((item) => item.fieldName === leaf.fieldName) ??
        columns.value[0]
      const ops =
        column?.operators ??
        defaultQueryBuilderOperators(column?.valueType ?? 'text')
      const fieldOptions = columns.value.map((item) =>
        h('option', { value: item.fieldName }, item.label),
      )
      const opOptions = ops.map((op) => h('option', { value: op }, op))
      const setField = (fieldName: string) => {
        const nextCol = columns.value.find((item) => item.fieldName === fieldName)
        onPatch(nextCol ? defaultAdvancedColumn(nextCol) : { ...leaf, fieldName })
      }
      const setOp = (operator: EntityFilterOperator) => {
        if (operator === 'IN' || operator === 'NOT_IN') {
          onPatch({
            fieldName: leaf.fieldName,
            filterType: 'set',
            operator,
            values: leaf.values ?? (leaf.value != null ? [leaf.value] : []),
          })
          return
        }
        if (column?.valueType === 'boolean' || operator === 'IS_TRUE' || operator === 'IS_FALSE') {
          onPatch({
            fieldName: leaf.fieldName,
            filterType: 'boolean',
            value: operator === 'IS_FALSE' ? false : true,
          })
          return
        }
        const filterType =
          column?.valueType === 'number'
            ? 'number'
            : column?.valueType === 'date' || column?.valueType === 'datetime'
              ? 'date'
              : 'text'
        onPatch({
          fieldName: leaf.fieldName,
          filterType,
          operator,
          value: leaf.value,
          valueTo: leaf.valueTo,
        })
      }
      const children: ReturnType<typeof h>[] = [
        h(
          'select',
          {
            class: 'mmda-querybuilder__field',
            disabled: disabled.value,
            value: leaf.fieldName,
            onChange: (event: Event) =>
              setField((event.target as HTMLSelectElement).value),
          },
          fieldOptions,
        ),
        h(
          'select',
          {
            class: 'mmda-querybuilder__operator',
            disabled: disabled.value,
            value:
              leaf.filterType === 'boolean'
                ? leaf.value === false
                  ? 'IS_FALSE'
                  : 'IS_TRUE'
                : leaf.operator ?? ops[0],
            onChange: (event: Event) =>
              setOp((event.target as HTMLSelectElement).value as EntityFilterOperator),
          },
          opOptions,
        ),
      ]
      if (leaf.filterType !== 'boolean' && operatorNeedsValue(leaf.operator)) {
        if (operatorNeedsList(leaf.operator)) {
          children.push(
            h('input', {
              class: 'mmda-querybuilder__value',
              disabled: disabled.value,
              value: (leaf.values ?? []).join(','),
              onChange: (event: Event) => {
                const raw = (event.target as HTMLInputElement).value
                const values = raw
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
                onPatch({ ...leaf, filterType: 'set', values })
              },
            }),
          )
        } else if (operatorNeedsRange(leaf.operator)) {
          children.push(
            h('input', {
              class: 'mmda-querybuilder__value',
              disabled: disabled.value,
              value: leaf.value == null ? '' : String(leaf.value),
              onChange: (event: Event) =>
                onPatch({
                  ...leaf,
                  value: (event.target as HTMLInputElement).value,
                }),
            }),
            h('input', {
              class: 'mmda-querybuilder__value-to',
              disabled: disabled.value,
              value: leaf.valueTo == null ? '' : String(leaf.valueTo),
              onChange: (event: Event) =>
                onPatch({
                  ...leaf,
                  valueTo: (event.target as HTMLInputElement).value,
                }),
            }),
          )
        } else {
          const choices = column?.values
          if (choices?.length) {
            children.push(
              h(
                'select',
                {
                  class: 'mmda-querybuilder__value',
                  disabled: disabled.value,
                  value: leaf.value == null ? '' : String(leaf.value),
                  onChange: (event: Event) => {
                    const raw = (event.target as HTMLSelectElement).value
                    const hit = choices.find((item) => String(item.value) === raw)
                    onPatch({ ...leaf, value: hit ? hit.value : raw })
                  },
                },
                choices.map((item) =>
                  h('option', { value: String(item.value) }, item.label),
                ),
              ),
            )
          } else {
            children.push(
              h('input', {
                class: 'mmda-querybuilder__value',
                disabled: disabled.value,
                type: column?.valueType === 'number' ? 'number' : 'text',
                value: leaf.value == null ? '' : String(leaf.value),
                onChange: (event: Event) => {
                  const raw = (event.target as HTMLInputElement).value
                  onPatch({
                    ...leaf,
                    value:
                      column?.valueType === 'number' && raw !== ''
                        ? Number(raw)
                        : raw,
                  })
                },
              }),
            )
          }
        }
      }
      children.push(
        h(
          'button',
          {
            type: 'button',
            class: 'mmda-querybuilder__remove',
            disabled: disabled.value,
            onClick: () => onPatch(undefined),
          },
          '−',
        ),
      )
      return h('div', { class: 'mmda-querybuilder__rule' }, children)
    }

    const renderGroup = (
      join: EntityAdvancedJoinFilter,
      onPatch: (next: EntityAdvancedJoinFilter) => void,
    ): VNode => {
      const rows: VNode[] = join.conditions.map((item, index) => {
        const patchChild = (next: EntityAdvancedFilterModel | undefined) => {
          onPatch(patchAt(join, index, next))
        }
        if (isAdvancedJoinFilter(item)) {
          return h('div', { class: 'mmda-querybuilder__child', key: index }, [
            renderGroup(item, (next) => patchChild(next)),
          ])
        }
        return h(
          'div',
          { class: 'mmda-querybuilder__child', key: index },
          [renderLeaf(item, patchChild)],
        )
      })
      return h('div', { class: 'mmda-querybuilder__group' }, [
        h(
          'select',
          {
            class: 'mmda-querybuilder__condition',
            disabled: disabled.value,
            value: join.operator,
            onChange: (event: Event) =>
              onPatch({
                ...join,
                operator: (event.target as HTMLSelectElement).value as 'AND' | 'OR',
              }),
          },
          [
            h('option', { value: 'AND' }, 'AND'),
            h('option', { value: 'OR' }, 'OR'),
          ],
        ),
        ...rows,
        h('div', { class: 'mmda-querybuilder__actions' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'mmda-querybuilder__add-rule',
              disabled: disabled.value || !columns.value.length,
              onClick: () => {
                const column = columns.value[0]
                if (!column) return
                onPatch({
                  ...join,
                  conditions: [...join.conditions, defaultAdvancedColumn(column)],
                })
              },
            },
            '+',
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'mmda-querybuilder__add-group',
              disabled: disabled.value,
              onClick: () =>
                onPatch({
                  ...join,
                  conditions: [...join.conditions, defaultAdvancedJoin()],
                }),
            },
            '( )',
          ),
        ]),
      ])
    }

    return () => {
      const root = asJoin(queryBuilderValueOf(chrome.value))
      return h(
        'div',
        { class: queryBuilderModifierClasses(chrome.value).flat() },
        [
          renderGroup(root, (next) => {
            emit(compactAdvancedFilter(next) ?? defaultAdvancedJoin())
          }),
        ],
      )
    }
  },
})
