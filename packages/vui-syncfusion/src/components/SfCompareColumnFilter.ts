import {
  DATE_RANGE_FILTER_KINDS,
  DatePeriodToken,
  isDateRangeKind,
  MetaUiFilterType,
  type DatePeriodTreeNode,
  type DateTimeRangeKind,
  FieldFilter,
  type SetFieldFilter,
  type MetaUiField,
} from '@mmda/core'
import { hasFilterType } from '../factory/filter_kind'
import { DatePickerComponent, DateRangePickerComponent, DateTimePickerComponent, TimePickerComponent } from '@syncfusion/ej2-vue-calendars'
import { DropDownListComponent } from '@syncfusion/ej2-vue-dropdowns'
import { NumericTextBoxComponent } from '@syncfusion/ej2-vue-inputs'
import { TreeViewComponent } from '@syncfusion/ej2-vue-navigations'
import { computed, defineComponent, h, nextTick, onMounted, ref, watch, type PropType } from 'vue'
import { dateSetNodesOf, dayTokensOfChecked, refreshFilterMenu } from '../factory/date_set_tree'
import { gridColumnFormat, gridFilterOperator, MENU_OPERATOR_TEXT } from '../factory/utils'
import { getSyncfusionCulture } from '../syncfusion_i18n'

export type CompareColumnVariant = 'date' | 'datetime' | 'time' | 'number'

export const COMPARE_FILTER_OPERATORS: Record<CompareColumnVariant, readonly string[]> = {
  date: [
    'equal',
    'notequal',
    'greaterthan',
    'greaterthanorequal',
    'lessthan',
    'lessthanorequal',
    'between',
    'within',
    'isnull',
    'notnull',
  ],
  datetime: [
    'equal',
    'notequal',
    'greaterthan',
    'greaterthanorequal',
    'lessthan',
    'lessthanorequal',
    'between',
    'within',
    'isnull',
    'notnull',
  ],
  time: [
    'equal',
    'notequal',
    'greaterthan',
    'greaterthanorequal',
    'lessthan',
    'lessthanorequal',
    'between',
    'isnull',
    'notnull',
  ],
  number: [
    'equal',
    'notequal',
    'greaterthan',
    'greaterthanorequal',
    'lessthan',
    'lessthanorequal',
    'between',
    'isnull',
    'notnull',
  ],
}

const FROM_ENTITY_OPERATOR: Record<string, string> = {
  EQ: 'equal',
  NEQ: 'notequal',
  GT: 'greaterthan',
  GE: 'greaterthanorequal',
  LT: 'lessthan',
  LE: 'lessthanorequal',
  BETWEEN: 'between',
  WITHIN: 'within',
  IS_NULL: 'isnull',
  IS_NOT_NULL: 'notnull',
  IS_BLANK: 'isnull',
  IS_NOT_BLANK: 'notnull',
}

export type SfCompareColumnFilterHandle = {
  getModel: () => FieldFilter | undefined
  setModel: (filter?: FieldFilter) => void
  setOperator: (operator: string) => void
}

const asDate = (value: unknown) => {
  if (value == null || value === '') return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

const compareFrom = (filter?: FieldFilter) => {
  if (!filter) return undefined
  if (filter.filterType === 'multi') {
    return filter.filterModels?.find(item => item.filterType !== 'set')
  }
  if (filter.filterType === 'set') return undefined
  return filter
}

const setFrom = (filter?: FieldFilter) => {
  if (!filter) return []
  if (filter.filterType === 'set') return filter.values ?? []
  if (filter.filterType === 'multi') {
    const set = filter.filterModels?.find(item => item.filterType === 'set')
    return set && 'values' in set ? set.values ?? [] : []
  }
  return []
}

const filterTypeOf = (variant: CompareColumnVariant) =>
  variant === 'number' ? 'number' : 'date'

export const SfCompareColumnFilter = defineComponent({
  name: 'SfCompareColumnFilter',
  props: {
    field: { type: Object as PropType<MetaUiField>, required: true },
    variant: { type: String as PropType<CompareColumnVariant>, required: true },
    filter: { type: Object as PropType<FieldFilter>, default: undefined },
    handle: { type: Object as PropType<SfCompareColumnFilterHandle>, required: true },
    dateRangeLabels: {
      type: Object as PropType<Partial<Record<string, string>>>,
      default: undefined,
    },
    filterLabels: {
      type: Object as PropType<Partial<Record<string, string>>>,
      default: undefined,
    },
    loadPivotDates: {
      type: Function as PropType<(field: MetaUiField) => Promise<unknown>>,
      default: undefined,
    },
  },
  setup(props) {
    const operator = ref('equal')
    const value = ref<unknown>(null)
    const valueTo = ref<unknown>(null)
    const dateKind = ref<string | undefined>()
    const setTokens = ref<unknown[]>([])
    const treeNodes = ref<DatePeriodTreeNode[]>([])
    const pivotDays = ref<string[]>([])
    const treeHint = ref('')
    const treeRef = ref<any>()
    const treeHost = ref<HTMLElement | null>(null)
    let treeLoaded = false

    const operators = computed(() =>
      COMPARE_FILTER_OPERATORS[props.variant].map(item => ({
        value: item,
        text: MENU_OPERATOR_TEXT[item] ?? item,
      })),
    )
    const kindOptions = computed(() =>
      DATE_RANGE_FILTER_KINDS.map(kind => ({
        value: kind,
        label: props.dateRangeLabels?.[kind] ?? kind,
      })),
    )
    const showSet = computed(
      () =>
        (props.variant === 'date' || props.variant === 'datetime') &&
        Boolean(props.loadPivotDates) &&
        hasFilterType(props.field, MetaUiFilterType.SET),
    )
    const showValue = computed(
      () => operator.value !== 'isnull' && operator.value !== 'notnull',
    )
    const format = computed(() => {
      const raw = gridColumnFormat(props.field)
      return typeof raw === 'object' ? raw.format : raw
    })
    const locale = getSyncfusionCulture()

    const applyFilter = (filter?: FieldFilter) => {
      const compare = compareFrom(filter)
      const tokens = setFrom(filter)
      setTokens.value = [...tokens]
      if (
        compare &&
        (compare.operator === 'WITHIN' || isDateRangeKind(compare.value))
      ) {
        operator.value = 'within'
        dateKind.value = isDateRangeKind(compare.value)
          ? String(compare.value)
          : undefined
        value.value = null
        valueTo.value = null
        return
      }
      if (compare?.operator === 'BETWEEN') {
        operator.value = 'between'
        dateKind.value = undefined
        value.value =
          props.variant === 'number' ? compare.value : asDate(compare.value)
        valueTo.value =
          props.variant === 'number' ? compare.valueTo : asDate(compare.valueTo)
        return
      }
      if (compare?.operator) {
        operator.value =
          FROM_ENTITY_OPERATOR[compare.operator] ??
          String(compare.operator).toLowerCase()
        dateKind.value = undefined
        value.value =
          props.variant === 'number'
            ? (compare.value ?? null)
            : asDate(compare.value)
        valueTo.value = null
        return
      }
      operator.value = 'equal'
      dateKind.value = undefined
      value.value = null
      valueTo.value = null
    }

    const compareModel = (): FieldFilter | undefined => {
      const filterType = filterTypeOf(props.variant)
      if (operator.value === 'within') {
        const kind = isDateRangeKind(dateKind.value)
          ? dateKind.value
          : isDateRangeKind(value.value)
            ? (value.value as DateTimeRangeKind)
            : undefined
        return kind ? FieldFilter.dateKind(kind) : undefined
      }
      if (operator.value === 'isnull' || operator.value === 'notnull') {
        return {
          filterType,
          operator: gridFilterOperator(operator.value, filterType),
        }
      }
      if (operator.value === 'between') {
        if (value.value == null || valueTo.value == null) return undefined
        return FieldFilter.between(value.value, valueTo.value, filterType)
      }
      if (value.value == null || value.value === '') return undefined
      return {
        filterType,
        operator: gridFilterOperator(operator.value, filterType),
        value: value.value,
      }
    }

    const getModel = () => {
      const set: SetFieldFilter | undefined = setTokens.value.length
        ? { filterType: 'set', operator: 'IN', values: [...setTokens.value] }
        : undefined
      return FieldFilter.combineCompareAndSet(compareModel(), set)
    }

    const checkedNodes = computed(() =>
      DatePeriodToken.expandLeaves(setTokens.value, pivotDays.value),
    )

    const onNodeChecked = () => {
      const inst = treeRef.value?.ej2Instances ?? treeRef.value
      const ids = inst?.getAllCheckedNodes?.() ?? inst?.checkedNodes ?? []
      setTokens.value = dayTokensOfChecked(ids, pivotDays.value)
    }

    const loadTree = () => {
      if (!showSet.value || treeLoaded || !props.loadPivotDates) return
      treeLoaded = true
      treeHint.value = '加载中…'
      void Promise.resolve(props.loadPivotDates(props.field)).then(
        raw => {
          const next = dateSetNodesOf(raw, props.dateRangeLabels?.month)
          pivotDays.value = next.pivotDays
          treeNodes.value = next.nodes
          treeHint.value = next.nodes.length ? '' : '暂无日期'
          void nextTick(() => {
            if (treeHost.value) refreshFilterMenu(treeHost.value)
          })
        },
        () => {
          treeLoaded = false
          treeHint.value = '日期选项加载失败'
        },
      )
    }

    const bindHandle = () => {
      props.handle.getModel = getModel
      props.handle.setModel = applyFilter
      props.handle.setOperator = next => {
        operator.value = next
      }
    }

    onMounted(() => {
      bindHandle()
      applyFilter(props.filter)
      loadTree()
    })
    watch(() => props.filter, applyFilter)

    const onOperatorChange = (args: { value?: string | null }) => {
      operator.value = String(args.value ?? 'equal')
    }
    const onKindChange = (args: { value?: string | null }) => {
      dateKind.value =
        args.value && isDateRangeKind(args.value) ? args.value : undefined
    }
    const onSingleChange = (args: { value?: unknown }) => {
      value.value = args.value ?? null
    }
    const onToChange = (args: { value?: unknown }) => {
      valueTo.value = args.value ?? null
    }
    const onRangeChange = (args: {
      startDate?: Date | null
      endDate?: Date | null
      value?: Date[] | null
    }) => {
      const start = args.startDate ?? args.value?.[0] ?? null
      const end = args.endDate ?? args.value?.[1] ?? null
      value.value = start
      valueTo.value = end
    }

    const pickerProps = () => ({
      locale,
      format: format.value,
      width: '100%',
      showClearButton: true,
    })

    const singlePicker = () => {
      if (props.variant === 'number') {
        return h(NumericTextBoxComponent as any, {
          ...pickerProps(),
          value: value.value,
          showSpinButton: false,
          placeholder: '输入数值',
          change: onSingleChange,
        })
      }
      if (props.variant === 'time') {
        return h(TimePickerComponent as any, {
          ...pickerProps(),
          value: value.value,
          placeholder: '选择时间',
          change: onSingleChange,
        })
      }
      if (props.variant === 'datetime') {
        return h(DateTimePickerComponent as any, {
          ...pickerProps(),
          value: value.value,
          placeholder: '选择日期时间',
          change: onSingleChange,
        })
      }
      return h(DatePickerComponent as any, {
        ...pickerProps(),
        value: value.value,
        placeholder: '选择日期',
        change: onSingleChange,
      })
    }

    const betweenPickers = () => {
      if (props.variant === 'date') {
        return h(DateRangePickerComponent as any, {
          ...pickerProps(),
          startDate: value.value ?? null,
          endDate: valueTo.value ?? null,
          placeholder: '选择日期范围',
          change: onRangeChange,
        })
      }
      if (props.variant === 'number') {
        return h('div', { class: 'mmda-compare-column-filter__pair' }, [
          h(NumericTextBoxComponent as any, {
            ...pickerProps(),
            value: value.value,
            showSpinButton: false,
            placeholder: '起始',
            change: onSingleChange,
          }),
          h('span', { class: 'mmda-compare-column-filter__sep' }, '至'),
          h(NumericTextBoxComponent as any, {
            ...pickerProps(),
            value: valueTo.value,
            showSpinButton: false,
            placeholder: '结束',
            change: onToChange,
          }),
        ])
      }
      const Start = props.variant === 'time' ? TimePickerComponent : DateTimePickerComponent
      const End = Start
      const placeholder = props.variant === 'time' ? '选择时间' : '选择日期时间'
      return h('div', { class: 'mmda-compare-column-filter__pair' }, [
        h(Start as any, {
          ...pickerProps(),
          value: value.value,
          placeholder,
          change: onSingleChange,
        }),
        h('span', { class: 'mmda-compare-column-filter__sep' }, '至'),
        h(End as any, {
          ...pickerProps(),
          value: valueTo.value,
          placeholder,
          change: onToChange,
        }),
      ])
    }

    const valueControl = () => {
      if (!showValue.value) return null
      if (operator.value === 'within') {
        return h(DropDownListComponent as any, {
          locale,
          dataSource: kindOptions.value,
          fields: { text: 'label', value: 'value' },
          value: dateKind.value ?? null,
          showClearButton: true,
          allowFiltering: true,
          placeholder: props.dateRangeLabels?.WITHIN ?? '属于期间',
          width: '100%',
          change: onKindChange,
        })
      }
      if (operator.value === 'between') return betweenPickers()
      return singlePicker()
    }

    return () =>
      h('div', { class: 'mmda-compare-column-filter' }, [
        h('div', { class: 'mmda-compare-column-filter__op' }, [
          h(DropDownListComponent as any, {
            locale,
            dataSource: operators.value,
            fields: { text: 'text', value: 'value' },
            value: operator.value,
            width: '100%',
            change: onOperatorChange,
          }),
        ]),
        showValue.value
          ? h('div', { class: 'mmda-compare-column-filter__value' }, [valueControl()])
          : null,
        showSet.value
          ? h('div', { class: 'mmda-filter-multi__set is-open' }, [
              h('div', { class: 'mmda-filter-multi__set-body' }, [
                h(
                  'div',
                  { class: 'mmda-filter-multi__set-tree', ref: treeHost },
                  treeNodes.value.length
                    ? h(TreeViewComponent as any, {
                        ref: treeRef,
                        cssClass: 'mmda-date-set-tree',
                        fields: {
                          dataSource: treeNodes.value,
                          id: 'id',
                          text: 'text',
                          child: 'children',
                        },
                        showCheckBox: true,
                        autoCheck: true,
                        expandedNodes: treeNodes.value.map(node => node.id),
                        checkedNodes: checkedNodes.value,
                        nodeChecked: onNodeChecked,
                      })
                    : h(
                        'div',
                        { class: 'mmda-filter-multi__set-empty' },
                        treeHint.value,
                      ),
                ),
              ]),
            ])
          : null,
      ])
  },
})

const wrapVariant = (name: string, variant: CompareColumnVariant) =>
  defineComponent({
    name,
    props: {
      field: { type: Object as PropType<MetaUiField>, required: true },
      filter: { type: Object as PropType<FieldFilter>, default: undefined },
      handle: { type: Object as PropType<SfCompareColumnFilterHandle>, required: true },
      dateRangeLabels: {
        type: Object as PropType<Partial<Record<string, string>>>,
        default: undefined,
      },
      filterLabels: {
        type: Object as PropType<Partial<Record<string, string>>>,
        default: undefined,
      },
      loadPivotDates: {
        type: Function as PropType<(field: MetaUiField) => Promise<unknown>>,
        default: undefined,
      },
    },
    setup: props => () => h(SfCompareColumnFilter, { ...props, variant }),
  })

export const SfDateColumnFilter = wrapVariant('SfDateColumnFilter', 'date')
export const SfDateTimeColumnFilter = wrapVariant(
  'SfDateTimeColumnFilter',
  'datetime',
)
export const SfTimeColumnFilter = wrapVariant('SfTimeColumnFilter', 'time')
export const SfNumberColumnFilter = wrapVariant('SfNumberColumnFilter', 'number')
