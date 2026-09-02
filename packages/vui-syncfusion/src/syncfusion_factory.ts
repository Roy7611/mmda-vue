// @ts-nocheck
import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  unref,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import {
  MetaModel,
  MetaUiFieldAlignmentEnum,
  SqlDataType,
  SortOrder,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  ensureListFieldVisibleWhenFrozen,
  isListFrozen,
  MetaUiFieldFrozen,
  type EntityFilterModel,
  type EntityFilterOperator,
  type MetaUi,
  type MetaUiField,
  type Pagination,
} from '@mmda/core'
import type {
  PropData,
  SyncfusionUiFactory,
  UiAction,
  UiListPropsType,
  UiPaginatorPropsType,
  UiSlots,
  UiSplitterPane,
  UiSplitterProps,
} from '@mmda/vui'
import { gridFreezeOf, isPersistableListColumn, readStoredPageSize, createIconVNode, MATERIAL_SYMBOL_PREFIX, persistListPack, type UiViewContext } from '@mmda/vui'
import { resolveFieldUnit } from './syncfusion_field_factory'
import { NumericTextBox } from '@syncfusion/ej2-inputs'
import { createSpinner, hideSpinner, showSpinner } from '@syncfusion/ej2-popups'
import { ButtonComponent, SwitchComponent } from '@syncfusion/ej2-vue-buttons'
import { DatePicker, DateTimePicker } from '@syncfusion/ej2-calendars'
import { DatePickerComponent } from '@syncfusion/ej2-vue-calendars'
import { DropDownListComponent } from '@syncfusion/ej2-vue-dropdowns'
import {
  GridComponent,
  PagerComponent,
} from '@syncfusion/ej2-vue-grids'
import { getSyncfusionCulture } from './syncfusion_i18n'
import { Component } from '@syncfusion/ej2-base'
import {
  Edit,
  Filter,
  Grid,
  Group,
  Page,
  Pager,
  PagerDropDown,
  Resize,
  Selection,
  Sort,
  VirtualScroll,
  CheckBoxFilterBase,
} from '@syncfusion/ej2-grids'
import {
  TextBoxComponent,
  NumericTextBoxComponent,
  TextAreaComponent,
} from '@syncfusion/ej2-vue-inputs'
import {
  MenuComponent,
  AppBarComponent,
  AccordionComponent,
} from '@syncfusion/ej2-vue-navigations'
import { DialogComponent } from '@syncfusion/ej2-vue-popups'
import { SidebarComponent } from '@syncfusion/ej2-vue-navigations'
import { DropDownButtonComponent, SplitButtonComponent } from '@syncfusion/ej2-vue-splitbuttons'
import { ChartComponent } from '@syncfusion/ej2-vue-charts'
import { SplitterComponent } from '@syncfusion/ej2-vue-layouts'
import { syncfusionLayout } from './syncfusion_layout'
import { DropupMenuButton } from './components/DropupMenuButton'
import { PhotoGallery } from './components/PhotoGallery'
import { FilesUploader } from './components/FilesUploader'
import { MmdaSfTree } from './components/MmdaSfTree'

/**
 * Vue 属性 watcher 会在 appendTo/preRender 之前或 destroy 之后调用 dataBind→injectModules。
 * 此时 Grid.serviceLocator 仍为空，Selection 构造里 locator.getService 会炸。
 * Selection 是默认模块，只要 allowSelection 就会装载。
 */
const originalInjectModules = (Component.prototype as any).injectModules
if (typeof originalInjectModules === 'function') {
  ;(Component.prototype as any).injectModules = function injectModulesSafe(
    this: any,
  ) {
    if (
      typeof this.getModuleName === 'function' &&
      this.getModuleName() === 'grid' &&
      !this.serviceLocator
    ) {
      return
    }
    return originalInjectModules.call(this)
  }
}

const SF_GRID_MODULES = [
  Edit,
  Sort,
  Filter,
  Group,
  Selection,
  Page,
  Resize,
  VirtualScroll,
]

Grid.Inject(...SF_GRID_MODULES)
Pager.Inject(Page, PagerDropDown)

/**
 * 表单下拉有 fields.text，Grid CheckBox 筛选没有：
 * 它把列值（enum 的 code / 引用 id）写成勾选文字，还会 getDistinct + 按值排序。
 * 引用选项已经唯一且有顺序，这里只补两件事：用 labelOf 文本、保持 refOptions 原序。
 */
let choiceFilterPatched = false
const patchChoiceFilter = () => {
  if (choiceFilterPatched) return
  choiceFilterPatched = true
  const originalCreate = CheckBoxFilterBase.prototype.createCheckbox
  CheckBoxFilterBase.prototype.createCheckbox = function (
    value: unknown,
    checked: boolean,
    data: any,
  ) {
    const text = data?.text ?? data?.dataObj?.text
    if (text != null && String(text).length) value = String(text)
    return originalCreate.call(this, value, checked, data)
  }
  const originalDistinct = CheckBoxFilterBase.getDistinct
  CheckBoxFilterBase.getDistinct = function (
    json: any[],
    field: string,
    column: any,
    foreignKeyData: any,
    checkboxFilter: any,
  ) {
    if (
      Array.isArray(json) &&
      json.length > 0 &&
      json.every(item => item?.__mmdaChoice)
    ) {
      return {
        records: json.map(item => ({
          ...item,
          ejValue: item[field],
          dataObj: item,
        })),
      }
    }
    return originalDistinct.call(
      this,
      json,
      field,
      column,
      foreignKeyData,
      checkboxFilter,
    )
  }
}

/** 程序化 h() 下用 provide 注入模块，对齐 Syncfusion Vue 文档写法。 */
const MmdaSfGrid = defineComponent({
  name: 'MmdaSfGrid',
  inheritAttrs: false,
  provide: {
    grid: SF_GRID_MODULES,
  },
  setup(_, { attrs, slots, expose }) {
    const inner = ref(null)
    expose({
      get ej2Instances() {
        return inner.value?.ej2Instances ?? inner.value
      },
    })
    return () => h(GridComponent as any, { ...attrs, ref: inner }, slots)
  },
})

/** 稳定引用，避免 Pager 因 pageSizes 新数组而销毁重建下拉 */
const STABLE_PAGE_SIZE_OPTIONS = DEFAULT_PAGE_SIZE_OPTIONS.map(String)

/**
 * 行虚拟滚动的缓冲块大小（非服务端 pageSize）。
 * EJ2：enableVirtualization 与 allowPaging 互斥，大页（如 1000）只能靠虚拟滚动减 DOM。
 */
const VIRTUAL_ROW_PAGE_SIZE = 50

/**
 * 绑定 context.loading（Ref 或 boolean）：查询中盖住表格并用 EJ2 Spinner。
 * `e-icons e-spin` 不是有效字形，必须用 createSpinner/showSpinner。
 */
const MmdaSfGridLoadingHost = defineComponent({
  name: 'MmdaSfGridLoadingHost',
  props: {
    loading: { type: [Boolean, Object], default: false },
  },
  setup(props, { slots }) {
    const hostRef = ref<HTMLElement | null>(null)
    let spinnerReady = false

    const ensureSpinner = (el: HTMLElement) => {
      if (spinnerReady) return
      createSpinner({
        target: el,
        width: 42,
        type: 'Material3',
      })
      spinnerReady = true
    }

    const sync = () => {
      const el = hostRef.value
      if (!el) return
      ensureSpinner(el)
      if (Boolean(unref(props.loading as any))) showSpinner(el)
      else hideSpinner(el)
    }

    onMounted(() => {
      void nextTick(sync)
    })
    onBeforeUnmount(() => {
      const el = hostRef.value
      if (el && spinnerReady) hideSpinner(el)
    })
    watch(
      () => unref(props.loading as any),
      () => {
        void nextTick(sync)
      },
    )

    return () =>
      h(
        'div',
        {
          ref: hostRef,
          class: [
            'mmda-sf-grid-loading-host',
            Boolean(unref(props.loading as any)) ? 'is-loading' : null,
          ],
        },
        slots.default?.(),
      )
  },
})

const EMPTY_SELECTION: unknown[] = []
const invoke = (value: unknown) =>
  typeof value === 'function' ? (value as () => unknown)() : value


const listedFields = (metaui: MetaUi) => {
  const fields = metaui.getListedFields()
  return fields.length
    ? fields
    : metaui.groups
        .filter(group => !group.many)
        .flatMap(group => group.fields)
}

const gridColumnType = (field: MetaUiField) => {
  if (SqlDataType.isBool(field.dataType)) return 'boolean'
  if (SqlDataType.isDateTime(field.dataType)) return 'datetime'
  if (SqlDataType.isDate(field.dataType)) return 'date'
  if (SqlDataType.isNum(field.dataType) && !field.reference) return 'number'
  return 'string'
}

/**
 * 日期列必须给非 null 的 format。EJ2 getCustomDateFormat 对 `typeof null === 'object'`
 * 会走对象分支并读 format.type，直接抛错。
 */
const gridColumnFormat = (field: MetaUiField) => {
  if (field.formatter != null && field.formatter !== '') return field.formatter
  if (SqlDataType.isDateTime(field.dataType)) {
    return { type: 'dateTime', format: 'yyyy-MM-dd HH:mm:ss' }
  }
  if (SqlDataType.isDate(field.dataType)) {
    return { type: 'date', format: 'yyyy-MM-dd' }
  }
  return undefined
}

/** Left | Right | Center | Justify — 有 MetaUiField.align 用配置；否则数值右、枚举/其它左。 */
const gridTextAlign = (field: MetaUiField): 'Left' | 'Right' | 'Center' | 'Justify' => {
  if (field.align) {
    const mapped = MetaUiFieldAlignmentEnum.valueOf(field.align)
    if (mapped) {
      return `${mapped.charAt(0).toUpperCase()}${mapped.slice(1)}` as
        | 'Left'
        | 'Right'
        | 'Center'
        | 'Justify'
    }
  }
  // 枚举 / 关联显示文本 → 左对齐（即便底层是数值型）
  if (field.reference?.isEnum || field.reference?.isRef || field.reference?.hasOne) {
    return 'Left'
  }
  if (SqlDataType.isNum(field.dataType)) return 'Right'
  return 'Left'
}

const gridTextAlignCss = (align: 'Left' | 'Right' | 'Center' | 'Justify') =>
  align.toLowerCase()


const gridFilterOperator = (operator?: string) => {
  const operators: Record<string, EntityFilterOperator> = {
    equal: 'EQ',
    notequal: 'NEQ',
    greaterthan: 'GT',
    greaterthanorequal: 'GE',
    lessthan: 'LT',
    lessthanorequal: 'LE',
    startswith: 'STARTS_WITH',
    endswith: 'ENDS_WITH',
    contains: 'CONTAINS',
    doesnotcontain: 'NOT_CONTAINS',
  }
  return operators[String(operator ?? '').toLowerCase()] ?? 'EQ'
}

const isChoiceFilterField = (field: MetaUiField) => {
  const reference = field.reference as
    | MetaUiField['reference']
    | { isEnum?: boolean; isRef?: boolean; hasOne?: boolean; refType?: string }
    | undefined
  if (!reference) return false
  // 兼容 MetaUiFieldRef 实例（getter）与被序列化后的 plain object（refType）。
  return Boolean(
    reference.isEnum ||
      reference.isRef ||
      reference.hasOne ||
      reference.refType === 'ENUM' ||
      reference.refType === 'REF' ||
      reference.refType === 'HAS_ONE',
  )
}

/** Column.template 名 ↔ Grid 命名 slot */
const cellSlotName = (fieldName: string) =>
  `mmdaCell_${String(fieldName).replace(/[^\w]/g, '_')}`

const isEnumReference = (
  ref: NonNullable<MetaUiField['reference']>,
) => Boolean(ref.isEnum || (ref as { refType?: string }).refType === 'ENUM')

/**
 * 三种引用与表单下拉同一套：
 * - enum：本地 refOptions 已是数组
 * - ref / hasOne：未查库时 refOptions 为空，打开筛选再 loadFilterOptions
 * 主键唯一，值 / 标签只走 valueOf / labelOf，不要 getDistinct。
 */
const choiceFilterDataSource = (field: MetaUiField) => {
  const ref = field.reference
  if (!ref) return []
  return (ref.refOptions ?? []).map(option => ({
    [field.fieldName]: ref.valueOf(option),
    text: String(ref.labelOf(option) ?? ''),
    __mmdaChoice: true,
  }))
}

const flattenFilterPredicates = (predicates: any[] | undefined): any[] => {
  const items: any[] = []
  for (const predicate of predicates ?? []) {
    if (Array.isArray(predicate?.predicates) && predicate.predicates.length) {
      items.push(...flattenFilterPredicates(predicate.predicates))
      continue
    }
    if (predicate?.field) items.push(predicate)
  }
  return items
}

const gridFiltersToModel = (
  predicates: any[] | undefined,
  fields: MetaUiField[],
): EntityFilterModel => {
  const grouped = new Map<string, any[]>()
  for (const item of flattenFilterPredicates(predicates)) {
    const name = String(item.field)
    const list = grouped.get(name) ?? []
    list.push(item)
    grouped.set(name, list)
  }

  const model: EntityFilterModel = {}
  for (const [fieldName, items] of grouped) {
    const field = fields.find(value => value.fieldName === fieldName)
    if (!field) continue
    if (SqlDataType.isBool(field.dataType)) {
      const item = items[items.length - 1]
      model[fieldName] = {
        filterType: 'boolean',
        value: item.value == null ? null : Boolean(item.value),
      }
      continue
    }
    const operators = items.map(item =>
      String(item.operator ?? '').toLowerCase(),
    )
    const values = items.flatMap(item =>
      Array.isArray(item.value) ? item.value : [item.value],
    )
    const choiceValues = items.flatMap(item =>
      Array.isArray(item.value) ? item.value : [],
    )
    const allEqual = operators.every(op => op === 'equal' || op === 'in')
    const allNotEqual = operators.every(
      op => op === 'notequal' || op === 'notin',
    )
    // CheckBox 可能给数组 value，也可能给多条 equal/or 谓词。
    if (isChoiceFilterField(field) && (choiceValues.length || values.length)) {
      model[fieldName] = {
        filterType: 'set',
        operator: allNotEqual ? 'NOT_IN' : 'IN',
        values: choiceValues.length ? choiceValues : values,
      }
      continue
    }
    const lower = items.find(item =>
      ['greaterthan', 'greaterthanorequal'].includes(
        String(item.operator ?? '').toLowerCase(),
      ),
    )
    const upper = items.find(item =>
      ['lessthan', 'lessthanorequal'].includes(
        String(item.operator ?? '').toLowerCase(),
      ),
    )
    if (
      (SqlDataType.isDate(field.dataType) ||
        SqlDataType.isNum(field.dataType)) &&
      lower &&
      upper
    ) {
      model[fieldName] = {
        filterType: SqlDataType.isDate(field.dataType) ? 'date' : 'number',
        operator: 'BETWEEN',
        value: lower.value,
        valueTo: upper.value,
      }
      continue
    }
    // Excel/CheckBox 多选 → set；单选 equal 对枚举也走 set，便于后端 IN
    if (
      values.length &&
      (allEqual || allNotEqual) &&
      (values.length > 1 || isChoiceFilterField(field))
    ) {
      model[fieldName] = {
        filterType: 'set',
        operator: allNotEqual ? 'NOT_IN' : 'IN',
        values,
      }
      continue
    }
    const item = items[items.length - 1]
    const filterType = SqlDataType.isDate(field.dataType)
      ? 'date'
      : SqlDataType.isNum(field.dataType)
        ? 'number'
        : 'text'
    model[fieldName] = {
      filterType,
      operator: gridFilterOperator(item.operator),
      value: item.value,
    }
  }
  return model
}

const cssClassFor = (role?: string) => {
  const roles: Record<string, string> = {
    primary: 'e-primary',
    // Material 3 secondary = tonal 浅底，不要默认成描边
    secondary: 'mmda-btn-tonal',
    success: 'e-success',
    info: 'e-info',
    warning: 'e-warning',
    warn: 'e-warning',
    danger: 'e-danger',
    error: 'e-danger',
  }
  return role ? roles[role] : 'e-primary'
}

/** EJ2 Vue Dialog：纯文本 header 经 compile 会渲染为空，需包一层 HTML。 */
const dialogHeaderHtml = (value?: string) => {
  if (!value) return value
  if (/<[^>]+>/.test(value)) return value
  return `<span class="mmda-sf-dialog__title">${value}</span>`
}

/** Button：text→e-flat（EJ2 文档 cssClass）；outlined→e-outline；tonal→浅底 */
const buttonSurfaceClass = (buttonType?: string) => {
  if (buttonType === 'text' || buttonType === 'link') return 'e-flat'
  if (buttonType === 'outlined') return 'e-outline'
  if (buttonType === 'tonal') return 'mmda-btn-tonal'
  return ''
}

/**
 * SplitButton 的 cssClass 只加在外层 .e-split-btn-wrapper，不会传给内部按钮。
 * e-flat / e-outline 对 SplitButton 无效，需用 wrapper 标记类 + CSS 选中 > .e-btn。
 */
const splitButtonSurfaceClass = (buttonType?: string) => {
  if (buttonType === 'text' || buttonType === 'link') return 'mmda-sf-split--flat'
  if (buttonType === 'outlined') return 'mmda-sf-split--outline'
  if (buttonType === 'tonal') return 'mmda-sf-split--tonal'
  return ''
}

const splitButtonRoleClass = (props: {
  buttonType?: string
  colorRole?: string
  severity?: string
  shape?: string
}) => {
  const flat = props.buttonType === 'text' || props.buttonType === 'link'
  const role = props.colorRole ?? props.severity
  if (
    flat &&
    props.shape !== 'round' &&
    props.shape !== 'circle'
  ) {
    if (role === 'secondary') return 'mmda-sf-split--secondary'
    return ''
  }
  if (props.buttonType === 'outlined') return ''
  return cssClassFor(role)
}

const buttonRoleClass = (props: {
  buttonType?: string
  colorRole?: string
  severity?: string
  shape?: string
}) => {
  const flat = props.buttonType === 'text' || props.buttonType === 'link'
  const role = props.colorRole ?? props.severity
  // 圆角图标按钮仍保留色相（如清除 danger / 添加 primary）
  if (
    flat &&
    props.shape !== 'round' &&
    props.shape !== 'circle'
  ) {
    if (role === 'secondary') return 'e-secondary'
    return ''
  }
  // outlined 只靠 e-outline，不要再叠 tonal
  if (props.buttonType === 'outlined') return ''
  return cssClassFor(props.colorRole ?? props.severity)
}

const normalizeAction = (action: any, t?: (key: string) => string): any => {
  if (action.divider === true) {
    return { separator: true }
  }
  return {
    text:
      action.label ??
      (action.name && t ? t(`action.${action.name}`) : action.name),
    iconCss: action.icon,
    disabled: action.disabled === true || action.disabled === 'true',
    separator: false,
    id: action.name,
    items: Array.isArray(action.items)
      ? action.items.map((child: any) => normalizeAction(child, t))
      : undefined,
  }
}

const findAction = (actions: any[], id?: string): any => {
  if (!id) return undefined
  for (const action of actions) {
    if (action.name === id || action.id === id || action.label === id)
      return action
    if (Array.isArray(action.items)) {
      const nested = findAction(action.items, id)
      if (nested) return nested
    }
  }
  return undefined
}

const normalizeMenuItem = (item: any): any => {
  if (!item || typeof item !== 'object') return item
  const children = Array.isArray(item.items)
    ? item.items.map((child: any) => normalizeMenuItem(child))
    : undefined
  return {
    id: item.key ?? item.moduleCode,
    text: item.label,
    iconCss: item.icon,
    url: item.url,
    route: item.route,
    moduleCode: item.moduleCode,
    disabled: item.disabled,
    items: children?.length ? children : undefined,
  }
}

/** 按钮点击（添加/清除）前先提交所有原位编辑单元格，避免 Batch 未落盘就被 dataSource 刷新冲掉。 */
const flushAllInplaceEdits = () => {
  if (typeof document === 'undefined') return
  document.querySelectorAll('.e-grid.mmda-sf-table').forEach(element => {
    const grid = (element as any).ej2_instances?.[0]
    if (!grid) return
    try {
      grid.saveCell?.()
      grid.editModule?.saveCell?.()
    } catch {
      /* ignore */
    }
  })
}

/** EJ2 autoFit 会把 width 写成 `180px`；Number('180px') 是 NaN，listSize 就写不回去。 */
const parseGridColumnWidth = (width: unknown): number | undefined => {
  if (width == null || width === '') return undefined
  const value = typeof width === 'number' ? width : parseFloat(String(width))
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined
}

const syncMetaUiFromGridColumns = (ej2Grid: any, metaui: MetaUi) => {
  const columns = (ej2Grid.getColumns?.() ?? []).filter(
    (column: any) =>
      isPersistableListColumn(column.field) && column.type !== 'checkbox',
  )
  columns.forEach((column: any, index: number) => {
    const field = metaui.getField(column.field)
    if (!field) return
    field.listPos = index
    const width = parseGridColumnWidth(column.width)
    if (width != null) field.listSize = width
    const freeze = String(column.freeze ?? '')
    if (freeze === 'Left') field.frozen = MetaUiFieldFrozen.Left
    else if (freeze === 'Right') field.frozen = MetaUiFieldFrozen.Right
    else field.frozen = MetaUiFieldFrozen.None
    ensureListFieldVisibleWhenFrozen(field)
    if (!isListFrozen(field.frozen)) {
      field.listed = column.visible !== false
    }
  })
  metaui.getListedFields(true)
}

const waitForGridPaint = async () => {
  await nextTick()
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/** 工具栏「自动列宽」：EJ2 autoFitColumns + 回写 metaui.listSize 并缓存。 */
export async function autoFitSyncfusionListGrid(context: UiViewContext<any>) {
  if (typeof document === 'undefined') return
  const metaui = context.metaui
  if (!metaui) return
  const element = document.querySelector('.e-grid.mmda-sf-table')
  const ej2Grid = (element as any)?.ej2_instances?.[0]
  if (!ej2Grid) return

  const fields = (ej2Grid.getColumns?.() ?? [])
    .filter(
      (column: any) =>
        column.visible !== false &&
        isPersistableListColumn(column.field) &&
        column.type !== 'checkbox',
    )
    .map((column: any) => column.field)

  try {
    if (fields.length) ej2Grid.autoFitColumns(fields)
    else ej2Grid.autoFitColumns()
  } catch {
    /* ignore */
  }

  await waitForGridPaint()
  syncMetaUiFromGridColumns(ej2Grid, metaui)
  await persistListPack(context)
}

const paneSettingsKey = (panes: UiSplitterPane[]) =>
  JSON.stringify(
    panes.map((pane) => ({
      size: pane.size,
      min: pane.min,
      max: pane.max,
      collapsible: pane.collapsible,
      resizable: pane.resizable,
      cssClass: pane.cssClass,
    })),
  )

const toPaneSettings = (panes: UiSplitterPane[]) =>
  panes.map((pane) => ({
    size: pane.size,
    min: pane.min,
    max: pane.max,
    collapsible: pane.collapsible,
    collapsed: false,
    resizable: pane.resizable,
    cssClass: pane.cssClass,
  }))

/** EJ2 collapsed/expanded 的 index 是 `[prev, next]`，不能 Number(数组)。 */
export const splitterEventIndex = (args?: {
  index?: number | number[]
}) => {
  const raw = args?.index
  if (Array.isArray(raw)) return Number(raw[0] ?? 0)
  return Number(raw ?? 0)
}

/** paneSettings 只在尺寸配置变时更新。collapsed 不写回 EJ2，否则 search 重渲会把右栏算成 0。 */
const MmdaSfSplitter = defineComponent({
  name: 'MmdaSfSplitter',
  props: {
    panes: { type: Array as PropType<UiSplitterPane[]>, required: true },
    orientation: { type: String as PropType<UiSplitterProps['orientation']> },
    width: { type: String, default: '100%' },
    height: { type: String, default: '100%' },
    separatorSize: { type: Number, default: undefined },
    cssClass: { type: String, default: '' },
    collapseTick: { type: Number, default: 0 },
    onCollapsed: { type: Function as PropType<UiSplitterProps['onCollapsed']> },
    onExpanded: { type: Function as PropType<UiSplitterProps['onExpanded']> },
  },
  setup(props) {
    const splitterRef = ref<{
      collapse?: (index: number) => void
      ej2Instances?: { collapse?: (index: number) => void }
    } | null>(null)
    const paneSettings = ref(toPaneSettings(props.panes))
    watch(
      () => paneSettingsKey(props.panes),
      () => {
        paneSettings.value = toPaneSettings(props.panes)
      },
    )
    watch(
      () => props.collapseTick,
      (tick, prev) => {
        if (!prev || tick <= prev) return
        const inst = splitterRef.value?.ej2Instances ?? splitterRef.value
        inst?.collapse?.(0)
      },
    )
    const emitCollapse = (collapsed: boolean, args?: { index?: number | number[] }) => {
      const event = { index: splitterEventIndex(args), collapsed }
      if (collapsed) props.onCollapsed?.(event)
      else props.onExpanded?.(event)
    }
    return () =>
      h(
        SplitterComponent as any,
        {
          ref: splitterRef,
          orientation: props.orientation === 'Vertical' ? 'Vertical' : 'Horizontal',
          width: props.width,
          height: props.height,
          separatorSize: props.separatorSize,
          cssClass: ['mmda-sf-splitter', props.cssClass].filter(Boolean).join(' '),
          paneSettings: paneSettings.value,
          // 只走 Vue 监听。collapsed/expanded 传函数会被 EJ2 当成 pane.collapsed 为真，开局整栏收起。
          onCollapsed: (args: { index?: number | number[] }) =>
            emitCollapse(true, args),
          onExpanded: (args: { index?: number | number[] }) =>
            emitCollapse(false, args),
        },
        {
          default: () =>
            props.panes.map((pane) =>
              h('div', { class: 'mmda-sf-splitter-pane', style: { height: '100%' } }, [
                pane.content,
              ]),
            ),
        },
      )
  },
})

export function createSyncfusionUiFactory(): SyncfusionUiFactory {
  patchChoiceFilter()
  const button = (props: any, slots?: any) => {
    const onClick = props.onClick ?? props.onAction ?? props.command
    // EJ2 Vue Button 的 props 白名单不含 htmlAttributes；传对象会变成
    // htmlattributes="[object Object]"。type / aria-label 用原生透传字符串即可。
    const htmlAttributes =
      props.htmlAttributes && typeof props.htmlAttributes === 'object'
        ? props.htmlAttributes
        : {}
    return h(
      ButtonComponent as any,
      {
        id: props.id ?? htmlAttributes.id,
        content:
          props.label ??
          (typeof slots?.default === 'function' ? undefined : props.content),
        iconCss: props.icon,
        cssClass: [
          buttonRoleClass(props),
          buttonSurfaceClass(props.buttonType),
          props.shape === 'round' || props.shape === 'circle' ? 'e-round' : '',
          props.class,
        ]
          .filter(Boolean)
          .join(' '),
        disabled: props.disabled === true || props.disabled === 'true',
        isPrimary: (props.colorRole ?? props.severity) === 'primary',
        title: props.tooltip ?? htmlAttributes.title,
        type: props.type ?? htmlAttributes.type ?? 'button',
        'aria-label':
          props['aria-label'] ??
          htmlAttributes['aria-label'] ??
          props.tooltip,
        onClick: (event: Event) => {
          event.preventDefault()
          event.stopPropagation()
          // 添加/清除等会改 dataSource：先提交当前单元格到模型
          flushAllInplaceEdits()
          onClick?.(event)
        },
      },
      slots,
    )
  }

  const table = <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaui)
    const rowNumField = fields.find(field => field.fieldName === 'rowNum')
    const dataFields = fields.filter(field => field.fieldName !== 'rowNum')
    const selectionMode = props.selectionMode
    const showColumnFilters =
      props.filterDisplay === 'row' || props.filterDisplay === 'menu'
    const showGrouping = false
    const pagination = props.pagination
    const editableFields = new Set(props.editableFields ?? [])
    const inplaceEdit =
      props.inplaceEdit === true && !pagination && editableFields.size > 0
    const inplaceEditStart = props.inplaceEditStart ?? 'excel'

    // dataSource 用快照（新引用才能驱动 EJ2 刷新）；写回用 sourceRows = 调用方传入的集合。
    const sourceRows = Array.isArray(model) ? (model as T[]) : []
    const rows = Array.isArray(model)
      ? (Array.from(toRaw(model) as T[]) as T[])
      : []

    let ej2Grid: any = null
    let focusedEditCell: { rowIndex: number; field: string } | null = null
    let contentTable: HTMLElement | null = null
    let gridHost: HTMLElement | null = null

    /** 原位编辑只认行号 → features[i]，不信任 Batch 的 rowData 副本。 */
    const rowIndexFrom = (args?: any) => {
      const candidates = [
        focusedEditCell?.rowIndex,
        args?.rowIndex,
        args?.cellIndex?.rowIndex,
        args?.cell?.closest?.('tr')?.getAttribute?.('data-rowindex'),
        args?.cell && ej2Grid?.getRowInfo?.(args.cell)?.rowIndex,
      ]
      for (const value of candidates) {
        const rowIndex = Number(value)
        if (
          Number.isFinite(rowIndex) &&
          rowIndex >= 0 &&
          rowIndex < sourceRows.length
        ) {
          return rowIndex
        }
      }
      return -1
    }

    const sourceRowAt = (args?: any) => {
      const rowIndex = rowIndexFrom(args)
      return rowIndex >= 0 ? sourceRows[rowIndex] : undefined
    }

    const flushPendingCellEdit = () => {
      if (!inplaceEdit || !ej2Grid) return
      try {
        ej2Grid.saveCell?.()
        ej2Grid.editModule?.saveCell?.()
      } catch {
        /* 销毁中可能已不可用 */
      }
    }

    const resolveCellTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null
      if (!el?.closest) return null
      // 自定义 cell template 时点击落在内部节点，需回找 EJ2 单元格
      return el.closest('.e-rowcell') as HTMLElement | null
    }

    const resolveCellEditTarget = (cell: HTMLElement | null) => {
      if (!cell || !ej2Grid) return null
      const row = cell.parentElement
      const rowIndex = Number(
        row?.getAttribute('data-rowindex') ??
          cell.getAttribute('index') ??
          cell.getAttribute('data-index') ??
          NaN,
      )
      const dataCol = cell.getAttribute('data-colindex')
      const ariaCol = cell.getAttribute('aria-colindex')
      const colIndex =
        dataCol != null
          ? Number(dataCol)
          : ariaCol != null
            ? Number(ariaCol) - 1
            : NaN
      const columns = ej2Grid.getColumns?.() ?? []
      const field = columns[colIndex]?.field as string | undefined
      if (!Number.isFinite(rowIndex) || !field || !editableFields.has(field)) {
        return null
      }
      return { rowIndex, field }
    }

    const beginCellEdit = (rowIndex: number, field: string, seed?: string) => {
      if (!ej2Grid?.editModule?.editCell) return
      ej2Grid.editModule.editCell(rowIndex, field)
      if (seed == null) {
        // 进入编辑后全选，便于继续键入时覆盖
        queueMicrotask(() => {
          const input = ej2Grid?.element?.querySelector?.(
            '.e-editedbatchcell input, .e-editedbatchcell textarea, .e-input',
          ) as HTMLInputElement | null
          input?.select?.()
          input?.focus?.()
        })
        return
      }
      queueMicrotask(() => {
        const input = ej2Grid?.element?.querySelector?.(
          '.e-editedbatchcell input, .e-editedbatchcell textarea, .e-input',
        ) as HTMLInputElement | null
        if (!input) return
        input.focus()
        input.value = seed
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
    }

    const onInplaceCellClick = (event: Event) => {
      if (!inplaceEdit || inplaceEditStart === 'dblclick') return
      const cell = resolveCellTarget(event.target)
      const target = resolveCellEditTarget(cell)
      if (!target) return
      focusedEditCell = target
      if (inplaceEditStart === 'excel') {
        // 选中后把焦点留在表格，后续键入才能触发覆盖编辑
        const host = ej2Grid?.element as HTMLElement | undefined
        if (host && !host.hasAttribute('tabindex')) host.tabIndex = 0
        host?.focus?.({ preventScroll: true })
        return
      }
      beginCellEdit(target.rowIndex, target.field)
    }

    const onInplaceKeyDown = (event: KeyboardEvent) => {
      if (!inplaceEdit || inplaceEditStart !== 'excel') return
      if (ej2Grid?.isEdit) return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const target = focusedEditCell
      if (!target) return
      if (event.key === 'F2' || event.key === 'Enter') {
        event.preventDefault()
        beginCellEdit(target.rowIndex, target.field)
        return
      }
      if (event.key.length !== 1) return
      event.preventDefault()
      beginCellEdit(target.rowIndex, target.field, event.key)
    }

    const bindInplaceEditTriggers = () => {
      contentTable = ej2Grid?.getContentTable?.() ?? null
      gridHost = ej2Grid?.element ?? null
      contentTable?.addEventListener('click', onInplaceCellClick)
      gridHost?.addEventListener('keydown', onInplaceKeyDown)
    }

    const unbindInplaceEditTriggers = () => {
      contentTable?.removeEventListener('click', onInplaceCellClick)
      gridHost?.removeEventListener('keydown', onInplaceKeyDown)
      contentTable = null
      gridHost = null
      focusedEditCell = null
    }

    type RangeValue = { min?: unknown; max?: unknown }
    const pendingRanges = new Map<string, RangeValue>()

    /** 引用列 CheckBox：数据与表单下拉相同（valueOf/labelOf）。
     * EJ2 默认用列值当勾选文字，Vue 下 itemTemplate 会把 label 清空。
     * 用 filter-cbox-value 把显示改成 labelOf 文本，勾选值仍是主键。 */
    const choiceCheckBoxFilter = (field: MetaUiField) => ({
      type: 'CheckBox',
      dataSource: choiceFilterDataSource(field),
    })

    const onFilterCheckboxLabel = (args: any) => {
      const fieldName = args?.column?.field
      const field = fields.find(value => value.fieldName === fieldName)
      const ref = field?.reference
      const raw =
        args?.data?.[fieldName] ??
        args?.data?.dataObj?.[fieldName] ??
        args?.value
      const option = ref?.refOptions?.find(item => ref.valueOf(item) === raw)
      const text = option != null ? ref.labelOf(option) : args?.data?.text
      if (text != null && String(text).length) args.value = String(text)
    }

    /** 引用选项按主键已唯一，跳过 EJ2 getDistinct。 */
    const onBeforeCheckboxRenderer = (args: any) => {
      const field = fields.find(value => value.fieldName === args?.field)
      if (!field || !isChoiceFilterField(field)) return
      args.executeQuery = false
      const items = choiceFilterDataSource(field)
      const search = String(
        ej2Grid?.element?.querySelector?.('.e-searchinput')?.value ?? '',
      ).trim()
      args.dataSource = search
        ? items.filter(
            item =>
              String(item.text).includes(search) ||
              String(item[field.fieldName] ?? '').includes(search),
          )
        : items
    }

    /**
     * 数值/日期范围过滤：仍使用 EJ2 Menu 与原生输入控件；只有选择 BETWEEN
     * 时才显示第二个输入框。Grid 本身不认识 BETWEEN，因此 read 先发下界，
     * actionBegin 再补上界谓词。
     */
    const rangeMenuFilter = (field: MetaUiField) => {
      const isDate = SqlDataType.isDate(field.dataType)
      const isDateTime = SqlDataType.isDateTime(field.dataType)
      let firstControl: NumericTextBox | DatePicker | DateTimePicker | undefined
      let secondControl: NumericTextBox | DatePicker | DateTimePicker | undefined
      let secondWrap: HTMLElement | undefined
      let operatorDropDown: any
      const menuOperatorListeners: Array<{
        el: HTMLElement
        type: string
        fn: EventListener
      }> = []

      const setControlValue = (
        control: NumericTextBox | DatePicker | DateTimePicker | undefined,
        value: unknown,
      ) => {
        if (!control) return
        if (isDate) {
          const date =
            value == null || value === ''
              ? null
              : value instanceof Date
                ? value
                : new Date(String(value))
          control.value =
            date && !Number.isNaN(date.getTime()) ? date : null
        } else {
          control.value =
            value == null || value === '' ? null : Number(value)
        }
        control.dataBind()
      }

      /** 元数据 formatter 可能是展示串，不能直接喂给 NumericTextBox。 */
      const numericFilterFormat = () => {
        const raw =
          typeof field.formatter === 'object' && field.formatter
            ? (field.formatter as { format?: unknown }).format
            : field.formatter
        if (typeof raw !== 'string' || !raw.trim()) return undefined
        // EJ2 数字格式：n/c/p/#0.00 等；其它字符串常会抛 Format options invalid
        if (/^[nNcCpP](\d+)?$/.test(raw) || /[#0]/.test(raw)) return raw
        return undefined
      }

      const createControl = (input: HTMLInputElement) => {
        if (isDate) {
          const format = gridColumnFormat(field)
          const DateControl = isDateTime ? DateTimePicker : DatePicker
          const control = new DateControl({
            locale: getSyncfusionCulture(),
            format:
              typeof format === 'object'
                ? format.format
                : format,
            placeholder: isDateTime ? '选择日期时间' : '选择日期',
            width: '100%',
          })
          control.appendTo(input)
          return control
        }
        const control = new NumericTextBox({
          locale: getSyncfusionCulture(),
          format: numericFilterFormat(),
          placeholder: '输入数值',
          showSpinButton: false,
          width: '100%',
        })
        control.appendTo(input)
        return control
      }

      const syncBetweenVisibility = () => {
        if (!secondWrap) return
        secondWrap.hidden = operatorDropDown?.value !== 'between'
      }

      return {
        type: 'Menu',
        ui: {
          create: (args: any) => {
            const host = document.createElement('div')
            host.className = 'mmda-sf-filter-range'
            const firstWrap = document.createElement('div')
            firstWrap.className = 'mmda-sf-filter-range__value'
            const firstInput = document.createElement('input')
            firstInput.className = 'e-flmenu-input'
            firstWrap.appendChild(firstInput)

            secondWrap = document.createElement('div')
            secondWrap.className =
              'mmda-sf-filter-range__value mmda-sf-filter-range__value--to'
            const separator = document.createElement('span')
            separator.className = 'mmda-sf-filter-range__separator'
            separator.textContent = '至'
            const secondInput = document.createElement('input')
            secondWrap.append(separator, secondInput)
            host.append(firstWrap, secondWrap)
            args.target.appendChild(host)

            firstControl = createControl(firstInput)
            secondControl = createControl(secondInput)
            operatorDropDown = args.getOptrInstance?.dropOptr
            // 不要改 dropOptr.change：Vue 代理 set 会走进 EJ2 Observer.off(null)。
            const menu = args.target?.closest?.('.e-flmenu') ?? args.target
            if (menu instanceof HTMLElement) {
              const onOperatorUi = () => syncBetweenVisibility()
              menu.addEventListener('click', onOperatorUi)
              menu.addEventListener('change', onOperatorUi)
              menuOperatorListeners.push(
                { el: menu, type: 'click', fn: onOperatorUi },
                { el: menu, type: 'change', fn: onOperatorUi },
              )
            }

            const current = props.filterModel?.[field.fieldName]
            if (current?.operator === 'BETWEEN' && operatorDropDown) {
              operatorDropDown.value = 'between'
              operatorDropDown.dataBind?.()
            }
            syncBetweenVisibility()
          },
          write: (args: any) => {
            const current = props.filterModel?.[field.fieldName]
            if (current?.operator === 'BETWEEN') {
              setControlValue(firstControl, current.value)
              setControlValue(secondControl, current.valueTo)
              return
            }
            setControlValue(firstControl, args.filteredValue)
            setControlValue(secondControl, null)
          },
          read: (args: any) => {
            const operator = String(args.operator ?? 'equal').toLowerCase()
            const first = firstControl?.value ?? undefined
            const second = secondControl?.value ?? undefined
            pendingRanges.delete(field.fieldName)

            if (operator === 'between') {
              if (first == null && second == null) {
                args.fltrObj.removeFilteredColsByField?.(field.fieldName)
                return
              }
              if (first != null && second != null) {
                // Grid filterByColumn 同字段会替换；先缓存范围，dataStateChange
                // 再合成 BETWEEN body（不依赖 actionBegin 补上界是否成功）。
                pendingRanges.set(field.fieldName, {
                  min: first,
                  max: second,
                })
              }
              args.fltrObj.filterByColumn(
                field.fieldName,
                first != null ? 'greaterthanorequal' : 'lessthanorequal',
                first ?? second,
                'and',
                true,
              )
              return
            }

            args.fltrObj.filterByColumn(
              field.fieldName,
              operator,
              first ?? null,
              'and',
              true,
            )
          },
          destroy: () => {
            for (const { el, type, fn } of menuOperatorListeners) {
              el.removeEventListener(type, fn)
            }
            menuOperatorListeners.length = 0
            operatorDropDown = undefined
            const safeDestroy = (
              control?: NumericTextBox | DatePicker | DateTimePicker,
            ) => {
              if (!control || control.isDestroyed) return
              try {
                control.destroy()
              } catch {
                /* EJ2 已随筛选框拆掉 */
              }
            }
            safeDestroy(firstControl)
            safeDestroy(secondControl)
            firstControl = undefined
            secondControl = undefined
            secondWrap = undefined
          },
        },
      }
    }

    /** 布尔/文本走 EJ2 默认 Menu；枚举/关联用 CheckBox。 */
    const columnFilter = (field: MetaUiField) => {
      if (isChoiceFilterField(field)) return choiceCheckBoxFilter(field)
      if (
        SqlDataType.isDate(field.dataType) ||
        (SqlDataType.isNum(field.dataType) && !field.reference)
      ) {
        return rangeMenuFilter(field)
      }
      return { type: 'Menu' }
    }

    const gridColumns = [
      selectionMode === 'multiple'
        ? {
            type: 'checkbox',
            width: 48,
            minWidth: 48,
            maxWidth: 48,
            textAlign: 'Center',
            headerTextAlign: 'Center',
            allowResizing: false,
            allowGrouping: false,
            freeze: 'Left',
          }
        : null,
      {
        field: 'rowNum',
        headerText: rowNumField?.displayLabel ?? '序号',
        width: rowNumField?.listSize ?? 60,
        minWidth: 60,
        textAlign: 'Left',
        headerTextAlign: 'Left',
        allowSorting: false,
        allowFiltering: false,
        allowGrouping: false,
        allowEditing: false,
        freeze: 'Left',
        // EJ2 仍会插入排序/分组图标；用 class 藏掉（行号不可排、不可分组）
        customAttributes: { class: 'mmda-sf-rownum-col' },
        template: 'mmdaCell_rowNum',
      },
      ...dataFields.map(field => {
        const textAlign = gridTextAlign(field)
        const freeze = gridFreezeOf(field)
        return {
          field: field.fieldName,
          headerText: field.displayLabel,
          type: gridColumnType(field),
          format: gridColumnFormat(field),
          textAlign,
          headerTextAlign: textAlign,
          clipMode: 'EllipsisWithTooltip',
          allowSorting:
            props.enableSort !== false && field.sortable !== false,
          allowFiltering: showColumnFilters,
          allowGrouping: false,
          allowReordering: Boolean(props.onListLayoutChange),
          visible: field.listed !== false,
          freeze,
          allowEditing:
            inplaceEdit &&
            editableFields.has(field.fieldName) &&
            !field.readOnly,
          editType: field.reference
            ? 'dropdownedit'
            : SqlDataType.isBool(field.dataType)
              ? 'booleanedit'
              : SqlDataType.isDateTime(field.dataType)
                ? 'datetimepickeredit'
                : SqlDataType.isDate(field.dataType)
                  ? 'datepickeredit'
                  : SqlDataType.isNum(field.dataType)
                    ? 'numericedit'
                    : 'defaultedit',
          edit:
            inplaceEdit &&
            field.reference &&
            field.reference.refFlds?.length
            ? {
                params: {
                  dataSource: field.reference.refOptions,
                  fields: {
                    value: field.reference.refFlds[0],
                    text:
                      field.reference.refFlds[1] ??
                      field.reference.refFlds[0],
                  },
                  allowFiltering: true,
                },
              }
            : undefined,
          filter: columnFilter(field),
          width:
            field.listSize && field.listSize > 0
              ? field.listSize
              : undefined,
          template: cellSlotName(field.fieldName),
        }
      }),
      typeof (props as any).rowMenu === 'function'
        ? {
            field: '__mmdaActions',
            headerText: '操作',
            // 三枚平铺按钮；showActions 时详情变为 SplitButton，略宽
            width: props.showActions === true ? 124 : 108,
            minWidth: props.showActions === true ? 124 : 108,
            maxWidth: props.showActions === true ? 124 : 108,
            textAlign: 'Right',
            headerTextAlign: 'Right',
            allowSorting: false,
            allowFiltering: false,
            allowGrouping: false,
            allowResizing: false,
            freeze: 'Right',
            customAttributes: { class: 'mmda-sf-actions-col' },
            template: 'mmdaCell_actions',
          }
        : null,
    ].filter(Boolean)

    const renderCellVNode = (field: MetaUiField, row: T) => {
      if (props.renderCell) return props.renderCell(field, row)
      const custom = props.customCellRenderers?.[field.fieldName]
      if (custom) return custom(field, row)
      const text = MetaModel.displayField(row, field)
      if (text == null || text === '') return String(field.nullDisplayText ?? '')
      const prefix = field.prefix ?? ''
      const unit = resolveFieldUnit(field)
      if (field.renderer === 'QuantityUnit' && unit) {
        return `${prefix}${String(text)} ${unit}`
      }
      return `${prefix}${String(text)}${unit}`
    }

    const cellSlots = Object.fromEntries(
      dataFields.map(field => [
        cellSlotName(field.fieldName),
        (scope: { data?: T } | T) => {
          const row = ((scope as any)?.data ?? scope) as T
          const align = gridTextAlign(field)
          const content = renderCellVNode(field, row)
          // column.template 时 EJ2 的 textAlign 管不到自定义内容，需包一层对齐
          return h(
            'div',
            {
              class: ['mmda-sf-cell', `mmda-sf-cell--${gridTextAlignCss(align)}`],
              style: { textAlign: gridTextAlignCss(align), width: '100%' },
            },
            content as any,
          )
        },
      ]),
    )

    cellSlots.mmdaCell_rowNum = (scope: { data?: T } | T) => {
      const row = ((scope as any)?.data ?? scope) as T
      return h(
        'span',
        { class: 'mmda-sf-rownum__index' },
        String((row as any)?.rowNum ?? ''),
      )
    }

    cellSlots.mmdaCell_actions = (scope: { data?: T } | T) => {
      const row = ((scope as any)?.data ?? scope) as T
      const actions = (props as any).rowMenu(row) as any[]
      const showActionMenu = props.showActions === true
      const dividerIndex = actions.findIndex(action => action?.divider)
      const standard =
        dividerIndex < 0 ? actions : actions.slice(0, dividerIndex)
      const custom =
        showActionMenu && dividerIndex >= 0
          ? actions.slice(dividerIndex + 1)
          : []
      const edit = standard.find(action => action?.name === 'edit')
      const remove = standard.find(action => action?.name === 'delete')
      const details = standard.find(action => action?.name === 'details')
      const remaining = showActionMenu
        ? standard.filter(
            action =>
              action?.name !== 'edit' &&
              action?.name !== 'delete' &&
              action?.name !== 'details',
          )
        : []
      const popupActions = [
        ...remaining,
        ...(remaining.length && custom.length ? [{ divider: true }] : []),
        ...custom,
      ]
      const run = (action?: any) =>
        action?.onAction?.() ?? action?.command?.()
      const flatIconButton = (
        action: any | undefined,
        name: 'edit' | 'delete' | 'details',
      ) =>
        action
          ? h(ButtonComponent as any, {
              iconCss: action.icon || factory.resolveIcon(name),
              cssClass: 'e-flat e-round mmda-sf-row-action',
              title: action.label,
              onClick: () => run(action),
            })
          : h('span', {
              class:
                name === 'details'
                  ? 'mmda-sf-row-details-placeholder'
                  : 'mmda-sf-row-action-placeholder',
              'aria-hidden': 'true',
            })

      const detailsNode =
        details && showActionMenu && popupActions.length
          ? h(SplitButtonComponent as any, {
              iconCss: details.icon || factory.resolveIcon('details'),
              cssClass:
                'mmda-sf-split--flat e-caret-hide-primary mmda-sf-row-details',
              title: details.label,
              items: popupActions.map(action => normalizeAction(action)),
              click: () => run(details),
              select: (args: any) => {
                const found = findAction(
                  popupActions,
                  args.item?.id ?? args.item?.text,
                )
                run(found)
              },
            })
          : flatIconButton(details, 'details')

      return h(
        'div',
        {
          class: 'mmda-sf-row-actions',
          onClick: (event: Event) => event.stopPropagation(),
          onMousedown: (event: Event) => event.stopPropagation(),
        },
        [
          flatIconButton(edit, 'edit'),
          flatIconButton(remove, 'delete'),
          detailsNode,
        ],
      )
    }

    const syncSelection = (records: T[]) => {
      const current = (props.selectedItems ?? EMPTY_SELECTION) as T[]
      if (
        current === records ||
        (current.length === records.length &&
          current.every((item, index) => item === records[index]))
      ) {
        return
      }
      if (Array.isArray(props.selectedItems)) {
        props.selectedItems.splice(0, props.selectedItems.length, ...records)
      }
      props.onSelectionChange?.(records)
      props.onSelect?.(records)
    }

    const primaryKey = metaui.primaryKey
    const layoutRev = unref(props.layoutRev as any) ?? 0
    const listGroupKey = String(metaui.objName ?? primaryKey ?? 'list')
    const gridKey = `mmda-sf-grid-${listGroupKey}-${layoutRev}`

    const resolveEj2Grid = () => {
      const grid = ej2Grid
      if (!grid) return null
      if (
        typeof grid.hideSpinner === 'function' ||
        typeof grid.getColumns === 'function'
      ) {
        return grid
      }
      return grid.ej2Instances ?? grid
    }

    /** custom binding（result/count）在 dataStateChange 后会转圈等待 dataSource 回写。
     * 索引页用虚拟滚动时 count 必须是当前页行数（不是总记录数），否则会按总数撑虚拟高度。
     */
    const resolveCustomBinding = async (state?: any) => {
      if (!pagination) return
      await nextTick()
      const grid = resolveEj2Grid()
      if (!grid) return
      const source = Array.from(rows)
      grid.dataSource = { result: source, count: source.length }
      grid.hideSpinner?.()
    }

    const runRemoteQuery = (work: unknown) => {
      void Promise.resolve(work)
        .catch(() => undefined)
        .finally(() => {
          void resolveCustomBinding()
        })
    }

    const persistLayoutFromGrid = () => {
      if (!props.onListLayoutChange) return
      const grid = resolveEj2Grid()
      if (!grid) return
      syncMetaUiFromGridColumns(grid, metaui)
      props.onListLayoutChange()
    }

    const gridVNode = h(
      MmdaSfGrid,
      {
        key: gridKey,
        // 索引页：当前页本地数组 + 行虚拟滚动（与 allowPaging 互斥）。
        // count=当前页长度，服务端总条数交给下方 Pager。
        dataSource: pagination
          ? {
              result: rows,
              count: rows.length,
            }
          : rows,
        locale: getSyncfusionCulture(),
        allowPaging: false,
        enableVirtualization: Boolean(pagination),
        // Material 3 Theme Studio 默认无斑马纹，交替行会让分页器/表体色阶显得碎
        enableAltRow: false,
        // 索引页：占满父容器，行区内部滚动，分页条贴底（避免撑出页面滚动）
        height: pagination ? '100%' : props.height,
        pageSettings: pagination
          ? {
              pageSize: VIRTUAL_ROW_PAGE_SIZE,
            }
          : undefined,
        allowSorting: props.enableSort !== false,
        allowFiltering: showColumnFilters,
        allowGrouping: false,
        editSettings: inplaceEdit
          ? {
              allowEditing: true,
              allowAdding: false,
              allowDeleting: false,
              mode: 'Batch',
              showConfirmDialog: false,
              allowNextRowEdit: true,
            }
          : undefined,
        groupSettings: undefined,
        // 普通字段 Filter Menu；枚举/引用列在 columns[].filter 覆盖为 CheckBox。
        filterSettings: showColumnFilters ? { type: 'Menu' } : undefined,
        // 用 columns 数组而非 ColumnDirective，避免 Vue 指令序列化丢掉 filter.ui 函数。
        columns: gridColumns,
        showColumnChooser: false,
        allowReordering: Boolean(props.onListLayoutChange),
        allowResizing: props.resizableColumns !== false,
        allowSelection:
          Boolean(selectionMode) ||
          (inplaceEdit && inplaceEditStart === 'excel'),
        selectionSettings: selectionMode
          ? {
              type: selectionMode === 'multiple' ? 'Multiple' : 'Single',
              persistSelection: true,
              checkboxOnly: selectionMode === 'multiple',
            }
          : inplaceEdit && inplaceEditStart === 'excel'
            ? { mode: 'Cell', type: 'Single' }
            : { type: 'None' },
        cssClass: ['mmda-sf-table', props.class].filter(Boolean).join(' '),
        ref: (comp: any) => {
          const grid = comp?.ej2Instances ?? comp ?? null
          if (ej2Grid && ej2Grid !== grid) {
            ej2Grid.off?.('filter-cbox-value', onFilterCheckboxLabel)
            ej2Grid.off?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          }
          ej2Grid = grid
          ej2Grid?.on?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.on?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
        },
        created: () => {
          ej2Grid?.on?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.on?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          queueMicrotask(() => bindInplaceEditTriggers())
          if (!props.onListLayoutChange) return
          queueMicrotask(() => {
            void (async () => {
              const missing = dataFields.filter(
                field => !field.listSize || field.listSize <= 0,
              )
              if (!missing.length) return
              try {
                ej2Grid?.autoFitColumns?.(
                  missing.map(field => field.fieldName),
                )
              } catch {
                /* ignore */
              }
              await waitForGridPaint()
              persistLayoutFromGrid()
            })()
          })
        },
        resizeStop: () => persistLayoutFromGrid(),
        actionComplete: (args: any) => {
          const requestType = args?.requestType
          if (requestType === 'reorder' || requestType === 'columnstate') {
            persistLayoutFromGrid()
          }
        },
        destroyed: () => {
          ej2Grid?.off?.('filter-cbox-value', onFilterCheckboxLabel)
          ej2Grid?.off?.('beforeCheckboxRenderer', onBeforeCheckboxRenderer)
          flushPendingCellEdit()
          unbindInplaceEditTriggers()
        },
        rowSelected: (args: any) => {
          const grid = args.grid ?? args.sender
          const records = (grid?.getSelectedRecords?.() ??
            (args.data ? [args.data] : [])) as T[]
          syncSelection(records)
        },
        rowDeselected: (args: any) => {
          const grid = args.grid ?? args.sender
          const records = (grid?.getSelectedRecords?.() ?? []) as T[]
          syncSelection(records)
        },
        cellSelected: (args: any) => {
          if (!inplaceEdit || inplaceEditStart !== 'excel') return
          const field = args?.columnName ?? args?.cellIndex?.cellIndex
          const rowIndex = Number(args?.rowIndex ?? args?.cellIndex?.rowIndex)
          const columns = ej2Grid?.getColumns?.() ?? []
          const resolvedField =
            typeof field === 'string'
              ? field
              : columns[Number(field)]?.field
          if (
            Number.isFinite(rowIndex) &&
            resolvedField &&
            editableFields.has(resolvedField)
          ) {
            focusedEditCell = { rowIndex, field: resolvedField }
          }
        },
        cellEdit: (args: any) => {
          if (!inplaceEdit) return
          const fieldName = args?.column?.field ?? args?.columnName
          const field = fields.find(value => value.fieldName === fieldName)
          const rowIndex = rowIndexFrom(args)
          const row = rowIndex >= 0 ? sourceRows[rowIndex] : args.rowData
          if (rowIndex >= 0 && fieldName) {
            focusedEditCell = { rowIndex, field: fieldName }
          }
          if (
            !field ||
            !editableFields.has(field.fieldName) ||
            props.canEditCell?.(row, field) === false
          ) {
            args.cancel = true
          }
        },
        cellSave: (args: any) => {
          if (!inplaceEdit) return
          const fieldName = args?.column?.field ?? args?.columnName
          const field = fields.find(value => value.fieldName === fieldName)
          const row = sourceRowAt(args)
          if (!field || !row) return
          if (
            props.onCellSave?.(
              row,
              field,
              args.value,
              args.previousValue,
            ) === false
          ) {
            args.cancel = true
          }
        },
        actionBegin: (args: any) => {
          const requestType = args?.requestType
          if (
            requestType === 'filterchoicerequest' ||
            requestType === 'filtersearchbegin'
          ) {
            args.filterChoiceCount = Math.max(
              Number(args.filterChoiceCount) || 0,
              3000,
            )
          }
          if (requestType === 'filterBeforeOpen') {
            const fieldName = args?.filterModel?.options?.field
            const field = fields.find(value => value.fieldName === fieldName)
            if (!field || !args?.filterModel?.options) return
            const columnType = gridColumnType(field)
            if (
              columnType === 'number' ||
              columnType === 'date' ||
              columnType === 'datetime'
            ) {
              const operatorKey = `${columnType}Operator`
              const operators =
                args.filterModel.customFilterOperators?.[operatorKey]
              if (
                Array.isArray(operators) &&
                !operators.some((operator: any) => operator.value === 'between')
              ) {
                operators.push({ value: 'between', text: '在…之间' })
              }
            }
            if (isChoiceFilterField(field)) {
              const apply = (options?: unknown[]) => {
                if (
                  field.reference &&
                  field.reference.refOptions.length === 0 &&
                  Array.isArray(options)
                ) {
                  field.reference.refOptions.splice(0, 0, ...options)
                }
                args.filterModel.options.dataSource =
                  choiceFilterDataSource(field)
              }
              if (
                field.reference &&
                !isEnumReference(field.reference) &&
                field.reference.refOptions.length === 0 &&
                props.loadFilterOptions
              ) {
                void props.loadFilterOptions(field).then(apply)
              } else {
                apply()
              }
            }
          }
          if (requestType === 'filtering') {
            const fieldName = String(
              args.currentFilteringColumn ?? args.columns?.[0]?.field ?? '',
            )
            const range = pendingRanges.get(fieldName)
            const columns = Array.isArray(args.columns) ? args.columns : []
            const first = columns.find(
              (column: any) => column.field === fieldName,
            )
            if (range && first) {
              first.operator = 'greaterthanorequal'
              first.value = range.min
              first.predicate = 'and'
              columns.push({
                ...first,
                operator: 'lessthanorequal',
                predicate: 'and',
                value: range.max,
              })
              args.columns = columns
              pendingRanges.delete(fieldName)
            }
          }
        },
        dataStateChange: (state: any) => {
          const requestType = state?.action?.requestType
          if (requestType === 'virtualscroll') {
            void resolveCustomBinding(state)
            return
          }
          if (requestType === 'sorting' && props.enableSort !== false) {
            runRemoteQuery(
              props.onSort?.(
                (state.sorted ?? []).map((sort: any) => ({
                  sortBy: sort.name,
                  sortOrder:
                    sort.direction === 'descending'
                      ? SortOrder.DESC
                      : SortOrder.ASC,
                })),
              ),
            )
            return
          }
          if (
            requestType === 'filterchoicerequest' ||
            requestType === 'filtersearchbegin' ||
            requestType === 'stringfilterrequest'
          ) {
            const fieldName =
              state?.action?.filterModel?.options?.field ??
              state?.filteredColumns?.[0]?.field ??
              state?.where?.[0]?.field
            if (typeof state.dataSource === 'function' && fieldName) {
              const field = fields.find(value => value.fieldName === fieldName)
              const respond = (options?: unknown[]) => {
                if (
                  field?.reference &&
                  field.reference.refOptions.length === 0 &&
                  Array.isArray(options)
                ) {
                  field.reference.refOptions.splice(0, 0, ...options)
                }
                state.dataSource(
                  field && isChoiceFilterField(field)
                    ? choiceFilterDataSource(field)
                    : [],
                )
              }
              if (
                field?.reference &&
                !isEnumReference(field.reference) &&
                field.reference.refOptions.length === 0 &&
                props.loadFilterOptions
              ) {
                void props.loadFilterOptions(field).then(respond)
              } else {
                respond()
              }
            }
            return
          }
          if (requestType === 'filtering' && props.onFilterModelChange) {
            const model = gridFiltersToModel(state.where, fields)
            // Menu BETWEEN：若 Grid where 只带了下界，用 read 时缓存的范围补全。
            for (const [fieldName, range] of [...pendingRanges.entries()]) {
              const field = fields.find(value => value.fieldName === fieldName)
              if (
                !field ||
                range.min == null ||
                range.max == null ||
                !(
                  SqlDataType.isDate(field.dataType) ||
                  SqlDataType.isNum(field.dataType)
                )
              ) {
                continue
              }
              model[fieldName] = {
                filterType: SqlDataType.isDate(field.dataType)
                  ? 'date'
                  : 'number',
                operator: 'BETWEEN',
                value: range.min,
                valueTo: range.max,
              }
              pendingRanges.delete(fieldName)
            }
            runRemoteQuery(props.onFilterModelChange(model))
          }
        },
        actionComplete: (args: any) => {
          if (
            !pagination &&
            args.requestType === 'sorting' &&
            props.enableSort !== false
          ) {
            const sorts = args.columnName
              ? [
                  {
                    sortBy: args.columnName,
                    sortOrder:
                      args.direction === 'Descending'
                        ? SortOrder.DESC
                        : SortOrder.ASC,
                  },
                ]
              : []
            props.onSort?.(sorts)
          }
          if (
            !pagination &&
            args.requestType === 'filtering' &&
            props.onFilterModelChange
          ) {
            props.onFilterModelChange(
              gridFiltersToModel(args?.columns, fields),
            )
          }
        },
        recordDoubleClick: (args: any) => {
          const fieldName = args?.column?.field ?? args?.columnName
          // 可编辑单元格的双击交给 EJ2 Batch 编辑；其它单元格仍打开完整弹窗。
          if (inplaceEdit && fieldName && editableFields.has(fieldName)) return
          const rowIndex = rowIndexFrom(args)
          const row = rowIndex >= 0 ? sourceRows[rowIndex] : args.rowData
          props.onItemDoubleClick?.(row)
        },
        recordClick: (args: any) => {
          const rowIndex = rowIndexFrom(args)
          const row = rowIndex >= 0 ? sourceRows[rowIndex] : args.rowData
          props.onItemClick?.(row)
        },
      },
      cellSlots,
    )

    const withLoading = (node: VNode) =>
      h(
        MmdaSfGridLoadingHost as any,
        { loading: props.loading ?? false },
        () => node,
      )

    if (!pagination) return withLoading(gridVNode)

    // 服务端分页：Pager 与 Grid 分离（Grid 开虚拟滚动不能再用 allowPaging）
    return h(
      'div',
      { class: 'mmda-sf-pagable-table' },
      [
        withLoading(gridVNode),
        factory.paginator(pagination, {
          onPage: props.onPage ?? (() => undefined),
          pageSizeOptions: props.pageSizeOptions,
        }),
      ],
    )
  }

  const factory: any = {
    layout: syncfusionLayout,
    nativeInplaceEdit: true,
    integratedTablePaging: true,
    defaultFilterDisplay: 'menu',
    actionIcons: {
      details: 'e-icons e-eye',
      create: 'e-icons e-plus',
      edit: 'e-icons e-edit',
      save: 'e-icons e-save',
      cancel: 'e-icons e-close',
      delete: 'e-icons e-trash',
      // 清除 ≠ 删除：eraser 比垃圾桶更接近“清空子表”
      clear: 'e-icons e-erase',
      add: 'e-icons e-plus',
      refresh: 'e-icons e-refresh',
      search: 'e-icons e-search',
      reset: 'e-icons e-filter-clear',
      back: 'e-icons e-chevron-left',
      import: 'e-icons e-upload-1',
      export: 'e-icons e-download',
      'auto-fit-columns': 'e-icons e-auto-fit-all-column',
      settings: 'e-icons e-settings',
      more: 'e-icons e-more-vertical-1',
      file: 'e-icons e-file',
      'eye-slash': 'fas fa-eye-slash',
      'dnd-vert': `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      'drag-indicator': `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      'freeze-column-right': 'e-icons e-spacing-before',
      'freeze-column-left': 'e-icons e-spacing-after',
      unlock: 'e-icons e-unlock',
    },
    viewIcons: {
      index: 'e-icons e-list-unordered',
      details: 'e-icons e-eye',
      create: 'e-icons e-plus',
      edit: 'e-icons e-edit',
    },
    dialogIcons: {
      success: 'e-icons e-circle-check',
      info: 'e-icons e-circle-info',
      warning: 'e-icons e-warning',
      error: 'e-icons e-circle-close',
    },
    resolveIcon(icon: string) {
      if (!icon) return ''
      if (icon.startsWith('e-icons') || icon.startsWith('e-')) return icon
      if (/\bfa[srbld]?\b|fa-/.test(icon)) return icon
      if (icon.startsWith('pi ')) {
        const name = icon.replace(/^pi pi-/, '')
        return factory.actionIcons[name] ?? `e-icons e-${name}`
      }
      return factory.actionIcons[icon] ?? `e-icons e-${icon}`
    },
    textSpan: (text, props) => h('span', props, text),
    label: (text, props) => h('label', props, text),
    image: (src, props) => h('img', { src, ...props }),
    photoGallery: (items, props) =>
      h(PhotoGallery, {
        items,
        ...props,
      }),
    filesUploader: props => h(FilesUploader, props),
    icon: (name, props) => createIconVNode(factory.resolveIcon(name), props),
    badge: (props) =>
      h(
        'span',
        {
          class: [
            'e-badge',
            props.severity === 'danger'
              ? 'e-badge-danger'
              : props.severity === 'warning'
                ? 'e-badge-warning'
                : props.severity === 'success'
                  ? 'e-badge-success'
                  : 'e-badge-info',
            props.class,
          ],
        },
        String(props.value),
      ),
    title: (text, props) => h('h2', props, text),
    subtitle: (text, props) => h('h3', props, text),
    link: (props, slots) =>
      h(
        'a',
        { ...props, class: ['e-link', props.class] },
        slots?.default?.() ?? props.text,
      ),
    input: (value, props = {}) =>
      h(TextBoxComponent as any, {
        value: props.modelValue ?? value,
        input: (args: any) =>
          (props['onUpdate:modelValue'] ?? props.onUpdate)?.(args.value),
        change: (args: any) =>
          (props['onUpdate:modelValue'] ?? props.onUpdate)?.(args.value),
        ...props,
      }),
    iconField: (value, props = {}) =>
      h('span', { class: 'e-input-group' }, [
        props.icon && h('span', { class: factory.resolveIcon(props.icon) }),
        factory.input(value, props),
      ]),
    dropdown: (value, props = {}) =>
      h(DropDownListComponent as any, {
        value: props.modelValue ?? value,
        dataSource: props.options ?? props.dataSource,
        change: (args: any) =>
          (props['onUpdate:modelValue'] ?? props.onUpdate)?.(args.value),
        ...props,
      }),
    button,
    buttonGroup: (buttons, props) => {
      const { class: className, ...rest } = props ?? {}
      return h(
        'div',
        {
          ...rest,
          // props.class 不能盖掉 e-btn-group，否则只剩工具栏自定义类、看不出按钮组
          class: ['e-btn-group', 'mmda-sf-button-group', className].filter(
            Boolean,
          ),
        },
        buttons().filter(Boolean),
      )
    },
    splitButton: (props, slots) =>
      h(
        SplitButtonComponent as any,
        {
          content: props.label,
          iconCss: props.icon,
          disabled: props.disabled === true || props.disabled === 'true',
          cssClass: [
            splitButtonRoleClass(props),
            splitButtonSurfaceClass(props.buttonType),
            props.class,
          ]
            .filter(Boolean)
            .join(' '),
          items: (props.actions ?? []).map(action =>
            normalizeAction(action),
          ),
          select: (args: any) => {
            const found = findAction(
              props.actions ?? [],
              args.item?.id ?? args.item?.text,
            )
            found?.onAction?.()
            found?.command?.()
          },
          onClick: props.onAction ?? props.command,
        },
        slots,
      ),
    menuButton: (props, actions, slots) => {
      const hideCaret =
        props.hideCaret === true ||
        props.shape === 'circle' ||
        (!props.label && Boolean(props.icon))
      const placement = String(props.popupPlacement ?? '')
      const openUp =
        placement === 'top' || placement === 'top-end'
      const cssClass = [
        buttonRoleClass(props),
        buttonSurfaceClass(props.buttonType),
        props.shape === 'round' || props.shape === 'circle' ? 'e-round' : '',
        hideCaret ? 'e-caret-hide' : '',
        props.class,
      ]
        .filter(Boolean)
        .join(' ')

      // 向上弹：不用 EJ2 DropDownButton（无可靠 upward API，首次打开易错位）
      if (openUp) {
        return h(DropupMenuButton, {
          label: props.label,
          icon: props.icon,
          cssClass,
          title: props.tooltip,
          ariaLabel: props['aria-label'] ?? props.tooltip,
          hideCaret,
          placement: placement === 'top' ? 'top' : 'top-end',
          items: actions.map(action => ({
            id: action.name,
            label: action.label ?? action.name,
            icon: action.icon,
            disabled: action.disabled === true || action.disabled === 'true',
            divider: action.divider === true,
            onAction: action.onAction,
            command: action.command,
          })),
        })
      }

      return h(
        DropDownButtonComponent as any,
        {
          content: props.label,
          iconCss: props.icon,
          // icon-only / circle：隐藏箭头，避免把 2rem 圆形按钮撑破导致 footer 布局乱
          cssClass,
          title: props.tooltip,
          items: actions.map(action => normalizeAction(action)),
          select: (args: any) => {
            const found = findAction(actions, args.item?.id ?? args.item?.text)
            found?.onAction?.()
            found?.command?.()
            // nested Syncfusion items may only carry text
            if (!found && args.item?.text) {
              const byLabel = actions
                .flatMap(a => [a, ...(a.items ?? [])])
                .find(a => a.label === args.item.text)
              byLabel?.onAction?.()
              byLabel?.command?.()
            }
          },
        },
        slots,
      )
    },
    floatingActionButton: props =>
      button({
        ...props,
        cssClass: ['e-round mmda-sf-fab', props.class].filter(Boolean).join(' '),
      }),
    selectButton: (value, props, _slots) =>
      h(
        'div',
        { class: 'e-btn-group mmda-sf-select-button' },
        (props.options ?? []).map((option: any) =>
          h(ButtonComponent as any, {
            content: option.label ?? option,
            cssClass: (props.modelValue ?? value) === (option.value ?? option) ? 'e-active' : '',
            onClick: () =>
              (props['onUpdate:modelValue'] ?? props.onUpdate)?.(
                option.value ?? option,
              ),
          }),
        ),
      ),
    actionButton: (action, t, _resolve, props) =>
      button({
        ...action,
        ...normalizeAction(action, t),
        label: normalizeAction(action, t).text,
        ...props,
        icon: factory.resolveIcon(action.icon ?? action.name ?? ''),
        onClick: action.onAction ?? action.command,
      }),
    paginator: (pagination: Pagination, props: UiPaginatorPropsType) => {
      // 必须稳定引用：每次新数组会让 EJ2 销毁/重建 pageSizes 下拉，表现为一点开就关
      const pageSizeOptions = props.pageSizeOptions
        ? props.pageSizeOptions.map(String)
        : STABLE_PAGE_SIZE_OPTIONS
      const currentPage = pagination.pageNo ?? 1
      const currentSize = pagination.pageSize ?? readStoredPageSize()
      const notifyPage = (pageNo: number, pageSize: number) => {
        const nextNo = Math.max(1, Number(pageNo) || 1)
        const nextSize = Number(pageSize) || currentSize
        if (nextNo === currentPage && nextSize === currentSize) return
        props.onPage({ pageNo: nextNo, pageSize: nextSize })
      }
      return h(PagerComponent as any, {
        currentPage,
        pageSize: currentSize,
        totalRecordsCount: pagination.recordCount ?? 0,
        locale: getSyncfusionCulture(),
        pageSizes: pageSizeOptions,
        // 数字页：click；每页条数：dropDownChanged
        // props 同步也会触发 click（isInteracted=false），必须忽略以免查询→重渲染死循环
        click: (args: any) => {
          if (args?.cancel || args?.isInteracted === false) return
          notifyPage(
            args.currentPage ?? currentPage,
            args.pageSize ?? currentSize,
          )
        },
        dropDownChanged: (args: any) => {
          const nextSize =
            args?.pageSize ?? args?.value ?? currentSize
          notifyPage(1, nextSize)
        },
      })
    },
    tree: (props) => h(MmdaSfTree, props as any),
    list: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) =>
      h('div', { class: 'mmda-sf-list' }, [
        model.length
          ? model.map((item, index) =>
              h(
                'article',
                {
                  key:
                    props.itemKey?.(item) ??
                    String(
                      metaui.primaryKey
                        ? (item as any)[metaui.primaryKey]
                        : index,
                    ),
                  class: ['mmda-sf-list__item', props.itemClass?.(item)],
                  style: props.itemStyle?.(item),
                  onClick: () => props.onItemClick?.(item),
                  onDblclick: () => props.onItemDoubleClick?.(item),
                },
                invoke(props.item?.(item, index)) as any,
              ),
            )
          : (props.empty?.() ?? ''),
      ]),
    table,
    pagableTable: (loader, metadata, props) =>
      h('div', { class: 'mmda-sf-pagable-table' }, [
        table(loader.model.list as any[], metadata.metaui, props as any),
        factory.paginator(loader.model.pagination, props),
      ]),
    loading: props => h('div', { class: 'mmda-sf-loading e-icons e-spin', ...props }),
    scrollbar: (content, props) =>
      h('div', { class: 'mmda-sf-scrollbar', ...props }, content as any),
    menu: (items, props) =>
      h(MenuComponent as any, {
        items: items.map(item => normalizeMenuItem(item)),
        select: (args: any) => args.item?.command?.(),
        ...props,
      }),
    panelMenu: (items, props, slots) =>
      h(
        AccordionComponent as any,
        {
          items: items.map(item => ({
            header: item.label,
            content: item.items,
            iconCss: item.icon,
          })),
          ...props,
        },
        slots,
      ),
    menubar: (items, props, slots) =>
      h(
        AppBarComponent as any,
        { class: 'mmda-sf-menubar', ...props },
        {
          default: () =>
            h(MenuComponent as any, {
              items: items.map(item => normalizeMenuItem(item)),
            }),
          ...slots,
        },
      ),
    dialog: (
      props: PropData & {
        visible: boolean
        onUpdateVisible: (value: boolean) => void
      },
      slots?: UiSlots,
    ) => {
      const {
        visible,
        onUpdateVisible,
        header,
        title,
        name,
        modal,
        width,
        allowDragging,
        enableResize,
        showCloseIcon,
        closeOnEscape,
        open,
        ...rest
      } = props
      const headerText = String(header ?? title ?? name ?? '')
      const dialogBodySlots = slots?.default
        ? { default: slots.default }
        : undefined
      return h(
        DialogComponent as any,
        {
          ...rest,
          isModal: modal ?? true,
          width: width ?? 'min(90vw, 60rem)',
          allowDragging: allowDragging ?? true,
          enableResize: enableResize ?? true,
          showCloseIcon: showCloseIcon ?? true,
          closeOnEscape: closeOnEscape ?? true,
          close: () => onUpdateVisible(false),
          visible,
          header: dialogHeaderHtml(headerText),
          open: (args: { element?: HTMLElement }) => {
            const headerEl = args?.element?.querySelector?.('.e-dlg-header')
            if (headerEl && headerText && !headerEl.textContent?.trim()) {
              headerEl.textContent = headerText
            }
            open?.(args)
          },
        },
        dialogBodySlots,
      )
    },
    drawer: (props, slots) =>
      h(
        SidebarComponent as any,
        {
          isOpen: props.visible,
          position: props.position ?? 'Left',
          close: () => props.onUpdateVisible?.(false),
          ...props,
        },
        slots,
      ),
    splitter: (panes, props) =>
      h(MmdaSfSplitter, {
        panes,
        orientation: props?.orientation,
        width: props?.width,
        height: props?.height,
        separatorSize: props?.separatorSize,
        cssClass: props?.class,
        collapseTick: props?.collapseTick,
        onCollapsed: props?.onCollapsed,
        onExpanded: props?.onExpanded,
      }),
    searchForRelative: (props, slots) =>
      factory.dialog(
        {
          visible: props.visible,
          header: props.title,
          onUpdateVisible: props.onUpdateVisible,
        },
        slots,
      ),
    chart: (data: any, props: PropData = {}) =>
      h(ChartComponent as any, { ...chartProps(data, props) }),
    barChart: (data: any, props: PropData = {}) =>
      h(ChartComponent as any, { ...chartProps(data, { ...props, type: 'Column' }) }),
    lineChart: (data: any, props: PropData = {}) =>
      h(ChartComponent as any, { ...chartProps(data, { ...props, type: 'Line' }) }),
    pieChart: (data: any, props: PropData = {}) =>
      h(ChartComponent as any, { ...chartProps(data, { ...props, type: 'Pie' }) }),
    doughnutChart: (data: any, props: PropData = {}) =>
      h(ChartComponent as any, { ...chartProps(data, { ...props, type: 'Doughnut' }) }),
    polarAreaChart: (data: any, props: PropData = {}) =>
      h(ChartComponent as any, { ...chartProps(data, { ...props, type: 'Polar' }) }),
    radarChart: (data: any, props: PropData = {}) =>
      h(ChartComponent as any, { ...chartProps(data, { ...props, type: 'Radar' }) }),
    formItem: (props: PropData = {}, slots?: UiSlots) =>
      h(
        'div',
        { class: ['mmda-sf-form-item', props.class], style: props.style },
        [
          props.label
            ? h('label', { class: 'mmda-sf-form-item__label' }, String(props.label))
            : null,
          slots?.default?.() ??
            factory.input(props.modelValue, {
              ...props,
              onUpdate: props.onUpdate ?? props['onUpdate:modelValue'],
            }),
        ],
      ),
    column: (props: PropData = {}, slots?: UiSlots) => ({
      ...props,
      header: props.header,
      field: props.field,
      body: slots?.body ?? props.body,
    }),
    primeVueTable: (data: any[] = [], columns: any[] = [], props: PropData = {}) =>
      factory.dataTable(data, columns, props),
    dataTable: (data: any[] = [], columns: any[] = [], props: PropData = {}) =>
      h(
        'div',
        { class: ['mmda-sf-data-table', 'e-grid', props.class], style: props.style },
        [
          h('table', { class: 'e-table' }, [
            h(
              'thead',
              h(
                'tr',
                columns.map((col, i) =>
                  h(
                    'th',
                    { key: col.field ?? i, style: col.style },
                    typeof col.header === 'function' ? col.header() : col.header ?? col.field,
                  ),
                ),
              ),
            ),
            h(
              'tbody',
              (data ?? []).map((row, index) =>
                h(
                  'tr',
                  { key: row?.id ?? index, onDblclick: () => props.onItemDoubleClick?.(row) },
                  columns.map((col, i) =>
                    h(
                      'td',
                      { key: col.field ?? i, style: col.style },
                      col.body
                        ? col.body({ data: row, index })
                        : row?.[col.field],
                    ),
                  ),
                ),
              ),
            ),
          ]),
        ],
      ),
    datePicker: (props: PropData = {}) =>
      h(DatePickerComponent as any, {
        value: props.modelValue ?? props.value,
        change: (args: any) =>
          (props.onUpdatePicker ?? props.onUpdate ?? props['onUpdate:modelValue'])?.(
            args.value,
          ),
        ...props,
      }),
    numberInput: (props: PropData = {}) =>
      h(NumericTextBoxComponent as any, {
        value: props.modelValue ?? props.value,
        change: (args: any) =>
          (props.onUpdate ?? props['onUpdate:modelValue'])?.(args.value),
        ...props,
      }),
    select: (props: PropData = {}) =>
      factory.dropdown(props.modelValue, {
        ...props,
        fields: props.optionLabel
          ? { text: props.optionLabel, value: props.dataKey ?? 'value' }
          : props.fields,
      }),
    toggleSwitch: (value: any, props: PropData = {}) =>
      h(SwitchComponent as any, {
        checked: props.modelValue ?? value,
        change: (args: any) =>
          (props.onUpdate ?? props['onUpdate:modelValue'])?.(args.checked),
        ...props,
      }),
    textarea: (value: any, props: PropData = {}) =>
      h(TextAreaComponent as any, {
        value: props.modelValue ?? value,
        input: (args: any) =>
          (props.onUpdate ?? props['onUpdate:modelValue'])?.(args.value),
        ...props,
      }),
    dataViewBox: (props: PropData = {}, slots?: UiSlots) =>
      h(
        'div',
        { class: ['mmda-sf-data-view', props.class], style: props.listStyle ?? props.style },
        (props.value ?? []).map((item: any, index: number) =>
          h(
            'div',
            { key: item?.id ?? index, class: 'mmda-sf-data-view__item' },
            slots?.item?.(item, index) ?? String(item),
          ),
        ),
      ),
  }

  return factory as SyncfusionUiFactory
}

function chartProps(data: any, props: PropData) {
  return {
    primaryXAxis: { valueType: 'Category' },
    series: data?.datasets
      ? data.datasets.map((set: any) => ({
          type: props.type ?? 'Column',
          dataSource: (data.labels ?? []).map((label: string, i: number) => ({
            x: label,
            y: set.data?.[i],
          })),
          xName: 'x',
          yName: 'y',
          name: set.label,
        }))
      : data?.series ?? [],
    ...props,
  }
}
