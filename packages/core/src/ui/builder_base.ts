import type { MetaUiField } from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { UiListProps } from './factory/list'
import type { UiTableProps } from './factory/table'
import type { UiGridProps, UiTreeGridProps } from './factory/grid'
import { MetaModel } from '../models/metamodel'
import { SqlDataType } from '../metaui/datatype'
import type { UiContext } from './context'
import { uiCssClass } from './css'
import type { UiFactory } from './factory'
import type { UiFieldFactory } from './field_factory'
import type { UiLayout, UiNodeProps } from './layout'
import type { UiProps } from './props'
import type { UiRenderer } from './renderer'
import { PluginHost } from './plugins/plugin_host'
import {
  getColumnFilterOps,
  simpleFilterTypeOf,
} from '../metaui/metaui_field'
import type { MetaUiFilterOpCode } from '../metaui/metaui_filter'
import {
  FieldFilter,
  isNoValueFilterOperator,
  type FieldFilterDraft,
} from '../models/entity_search'
import { DATE_RANGE_FILTER_KINDS } from '../models/date_range'
import { dateOf } from './factory/date_common'
import {
  applySearchDraft,
  resetSearchRows,
  searchFieldCandidates,
  type UiSearchFieldProps,
  type UiSearchRow,
  type UiSearchViewProps,
  type UiSearchViewSlots,
} from './builder/search_view'

/** 字段行 props：`UiProps` 外壳样式键 + 行级排法覆盖。 */
interface FieldRowProps extends UiProps {
  editing?: boolean
  isReadonly?: boolean
  direction?: 'vertical' | 'horizontal'
  orientation?: 'vertical' | 'horizontal'
  fieldVertical?: boolean
  gridColumn?: string
  gridRow?: string
}

/** 分组壳 props：`UiProps` + 区域 / 子表覆盖。 */
interface GroupShellProps extends UiProps {
  region?: string
  many?: boolean
  container?: string
  orientation?: 'vertical' | 'horizontal'
  cols?: number
}

/**
 * 拼屏抽象基类：实现能上移的 HTML 壳（标签 / 分组壳 / 字段行），
 * 平台组件（GroupCard / GroupTab / IndexPage 等）留给 vui / rui 皮肤。
 *
 * 与 {@link AbstractUiFactory} / {@link AbstractUiLayout} 同构：
 * constructor 注入 renderer，壳节点一律 `this.renderer.render(...)`。
 *
 * @typeParam TNode 框架节点。vui 为 Vue `VNode`，rui 为 React `ReactNode`。
 */
export abstract class AbstractUiBuilder<TNode = unknown> extends PluginHost<TNode> {
  constructor(
    public readonly factory: UiFactory<TNode>,
    public readonly fieldFactory: UiFieldFactory<TNode>,
    public readonly layout: UiLayout<TNode>,
    protected readonly renderer: UiRenderer<TNode, UiNodeProps>,
  ) {
    super()
  }

  /** 字段标签。裸标签，不带字段行布局。 */
  labelFor(field: MetaUiField, props?: UiProps): TNode {
    return this.renderer.render(
      'label',
      { attributes: { for: field.fieldName, ...props } },
      [String(field.displayLabel ?? '')],
    )
  }

  /** 组区域：secondary → summary/aside，其余 primary。 */
  static groupZone(group: MetaUiGroup): 'primary' | 'secondary' {
    return group.isSecondary() ? 'secondary' : 'primary'
  }

  /** 同区内排序：主表组在前按 groupName；子表组按 groupIdx。 */
  static sortViewGroups(groups: MetaUiGroup[]): MetaUiGroup[] {
    const compare = (a: MetaUiGroup, b: MetaUiGroup) => {
      if (a.many !== b.many) return a.many ? 1 : -1
      if (a.many) return (a.groupIdx ?? 0) - (b.groupIdx ?? 0)
      return a.groupName.localeCompare(b.groupName)
    }
    return [...groups].sort(compare)
  }

  /** 子表已删除行的行样式。 */
  static deletedSubRowStyle(data: unknown): { display: string } | undefined {
    return MetaModel.isEntity(data) && MetaModel.deleted(data)
      ? { display: 'none' }
      : undefined
  }

  /** 分组壳 class：primary / secondary + master / sub。 */
  groupWrapClass(group: MetaUiGroup, props: GroupShellProps = {}): string {
    const raw = String(props.region ?? AbstractUiBuilder.groupZone(group))
    const zone =
      raw === 'secondary' || raw === 'summary' ? 'secondary' : 'primary'
    const many = props.many === true || group.many
    return [uiCssClass('group'), many ? 'sub' : 'master', zone, props.class]
      .filter(Boolean)
      .join(' ')
  }

  /** 组内容容器：字段 / 表格布局归这里管，Card 只做外壳。 */
  wrapGroupContent(body: TNode | TNode[], props: UiProps = {}): TNode {
    const classValue = [uiCssClass('group', 'body'), props.class]
      .filter(Boolean)
      .join(' ')
    return this.renderer.render(
      'div',
      { class: classValue || undefined },
      Array.isArray(body) ? body : [body],
    )
  }

  /** FieldSet 外壳：骑边 legend（经典）。 */
  buildGroupFieldSet(
    group: MetaUiGroup,
    body: TNode | TNode[],
    props: GroupShellProps = {},
  ): TNode {
    const {
      container: _container,
      region: _region,
      many: _many,
      orientation: _orientation,
      cols: _cols,
      class: _class,
      ...rest
    } = props
    return this.renderer.render(
      'fieldset',
      { class: this.groupWrapClass(group, props), attributes: rest },
      [
        this.renderer.render(
          'legend',
          { class: uiCssClass('group', 'title') },
          [String(group.groupLabel ?? '')],
        ),
        this.wrapGroupContent(body),
      ],
    )
  }

  /** 字段行内的标签（带 `field-label` class），区别于 {@link labelFor}。 */
  protected fieldLabel(field: MetaUiField, props?: UiProps): TNode {
    return this.renderer.render(
      'label',
      { class: uiCssClass('field-label'), attributes: { for: field.fieldName, ...props } },
      [String(field.displayLabel ?? '')],
    )
  }

  /**
   * 裸编辑控件（不含标签布局）。
   * 选中顺序 `customEditor` ?? `field.editor` ?? `fallbackInput` —— 三者是同一个类型
   *（`UiFieldRenderer`），业务自定义控件与皮肤控件走同一条路，不需要断言。
   */
  protected editorFor(
    field: MetaUiField,
    context: UiContext,
  ): TNode {
    const renderer =
      context.getFieldLogic(field)?.customEditor ??
      (field.editor ? this.fieldFactory[field.editor] : undefined) ??
      this.fieldFactory.fallbackInput
    return renderer(field, context)
  }

  /** 裸展示控件（不含标签布局）。选中顺序 `customRenderer` ?? `field.renderer` ?? `fallbackDisplay`。 */
  protected displayRendererFor(
    field: MetaUiField,
    context: UiContext,
  ): TNode {
    const name = field.renderer
      ? field.renderer
      : SqlDataType.isBool(field.dataType)
        ? 'checkedIcon'
        : 'textSpan'
    const renderer =
      context.getFieldLogic(field)?.customRenderer ??
      this.fieldFactory[name] ??
      this.fieldFactory.fallbackDisplay
    return renderer(field, context)
  }

  /** 编辑 / 只读行共同外壳：剥掉行级 props，按 layout 横向或纵向排。 */
  protected wrapFieldRow(
    field: MetaUiField,
    context: UiContext,
    props: FieldRowProps = {},
    useEditor: boolean,
  ): TNode {
    const {
      direction,
      orientation,
      fieldVertical,
      gridColumn,
      gridRow,
    } = props
    const control = useEditor
      ? this.editorFor(field, context)
      : this.displayRendererFor(field, context)
    const useVert =
      fieldVertical === true ||
      orientation === 'vertical' ||
      direction === 'vertical'
    const slots = {
      label: this.fieldLabel(field),
      control,
      gridColumn,
      gridRow,
    }
    return useVert
      ? this.layout.layoutFieldVert(slots)
      : this.layout.layoutField(slots)
  }

  /** 按会话状态自动选编辑或显示。 */
  protected renderFieldRow(
    field: MetaUiField,
    context: UiContext,
    props: FieldRowProps = {},
  ): TNode {
    if (context.isFieldHidden(field)) {
      return this.renderer.render('span', { attributes: { htmlAttributes: { hidden: true } } }, [])
    }
    const editing = props.editing ?? context.editing
    const isReadonly = props.isReadonly
    const useEditor =
      Boolean(editing) &&
      !context.isFieldReadonly(field) &&
      !isReadonly
    return useEditor
      ? this.wrapFieldRow(field, context, props, true)
      : this.wrapFieldRow(field, context, props, false)
  }

  // —— MetaUi 驱动的列表族 ——
  /** 移动端简单列表。rows 从 props 取，列字段无需显式给。 */
  list<T>(metaUi: MetaUi, props: UiListProps<T>): TNode {
    return this.factory.list({
      ...props,
      rows: props.rows ?? [],
      primaryKey: props.primaryKey ?? metaUi.primaryKey,
    })
  }

  /** 只读桌面表。rows / fields 由 Builder 注入 factory props。 */
  table<T>(metaUi: MetaUi, props: UiTableProps<T, TNode>): TNode {
    return this.factory.table({
      ...props,
      rows: props.rows ?? [],
      fields: props.fields ?? metaUi.getListedFields(),
      primaryKey: props.primaryKey ?? metaUi.primaryKey,
      objName: props.objName ?? metaUi.objName,
    })
  }

  /** 可编桌面表。 */
  grid<T>(metaUi: MetaUi, props: UiGridProps<T, TNode>): TNode {
    return this.factory.grid({
      ...props,
      rows: props.rows ?? [],
      fields: props.fields ?? metaUi.getListedFields(),
      primaryKey: props.primaryKey ?? metaUi.primaryKey,
      objName: props.objName ?? metaUi.objName,
    })
  }

  /** 树形可编表。 */
  treeGrid<T>(metaUi: MetaUi, props: UiTreeGridProps<T, TNode>): TNode {
    return this.factory.treeGrid({
      ...props,
      rows: props.rows ?? [],
      fields: props.fields ?? metaUi.getListedFields(),
      primaryKey: props.primaryKey ?? metaUi.primaryKey,
      objName: props.objName ?? metaUi.objName,
    })
  }

  /** 对齐旧版 _tableColumnWidth：按字段语义给默认列宽。 */
  tableColumnWidth(field: MetaUiField): number {
    if (field.listSize && field.listSize > 0) {
      return Math.min(field.listSize, 400)
    }
    if (SqlDataType.isBool(field.dataType)) {
      return Math.max(field.displayLabel.length * 15, 70)
    }
    if (field.reference) {
      return field.reference.isEnum ? 120 : 150
    }
    return 200
  }
  // —— 搜索页（`UiViewOne.Search`）—————————————————>

  /**
   * 搜索页内容：字段行（Column）+ 动作行。承载（路由页 / 右侧抽屉）由调用方加。
   * 行来自 `context.searchRows` 草稿（`bindLogics` 按 `beforeSearch` / sortable 装配）；
   * 确定走 `props.onConfirm`（通常 `applySearchDraft` + `search()`），重置缺省只清值。
   */
  buildSearchView(
    context: UiContext,
    props: UiSearchViewProps = {},
    slots?: UiSearchViewSlots<TNode>,
  ): TNode {
    const metaUi = props.metaUi ?? context.metaUi
    const placement: 'page' | 'drawer' =
      props.placement === 'drawer' ? 'drawer' : 'page'
    const rows = context.searchRows
      .map((row) => ({ row, field: metaUi.getField(row.fieldName) }))
      .filter(
        (item): item is { row: UiSearchRow; field: MetaUiField } =>
          item.field != null,
      )
    const fields = rows.map(({ row, field }) =>
      this.buildSearchField(field, context, {
        filter: row.filter,
        onFilterChange: (next) => {
          row.filter = next
        },
      }),
    )
    const extras = slots?.default?.()
    const extraNodes =
      extras == null ? [] : Array.isArray(extras) ? extras : [extras]
    const candidates =
      props.candidates ?? searchFieldCandidates(metaUi, context.searchRows)
    const addField = candidates.length
      ? this.factory.dropDownList({
          class: uiCssClass('search-view', 'add-field'),
          value: null,
          placeholder: context.t('action.add'),
          allowFiltering: true,
          options: candidates.map((field) => ({
            value: field.fieldName,
            label: String(field.displayLabel ?? field.fieldName),
          })),
          onChange: (value) => {
            const fieldName = value == null ? '' : String(value)
            if (!fieldName) return
            context.searchRows.push({ fieldName })
          },
        })
      : undefined
    const showSearchWord =
      props.showSearchWord === true ||
      (props.showSearchWord !== false && placement === 'page')
    // 草稿里的模糊搜词：写搜索会话的 `searchParam.searchWord`，确定才随草稿带过去
    const searchWord = showSearchWord
      ? this.factory.textInput({
          class: uiCssClass('search-view', 'word'),
          type: 'Search',
          showClearButton: true,
          placeholder: context.t('action.search'),
          value: String(context.searchParam?.searchWord ?? ''),
          onChange: (value) => {
            if (context.searchParam) context.searchParam.searchWord = value
          },
        })
      : undefined
    const customActions = slots?.actions?.()
    const actions =
      customActions == null
        ? [
            this.factory.button({
              class: uiCssClass('search-view', 'reset'),
              label: context.t('action.reset'),
              buttonType: 'text',
              colorRole: 'secondary',
              onClick: () => {
                if (props.onReset) props.onReset()
                else resetSearchRows(context)
              },
            }),
            this.factory.button({
              class: uiCssClass('search-view', 'confirm'),
              label: context.t('action.confirm'),
              colorRole: 'primary',
              onClick: () => {
                void props.onConfirm?.()
              },
            }),
          ]
        : Array.isArray(customActions)
          ? customActions
          : [customActions]
    const body: TNode[] = [...fields, ...extraNodes]
    if (addField != null) body.push(addField)
    return this.renderer.render(
      'div',
      {
        class: [
          uiCssClass('search-view'),
          uiCssClass('search-view', undefined, placement),
          props.class,
        ]
          .filter(Boolean)
          .join(' '),
        attributes: {
          'data-placement': placement,
          ...(props.htmlAttributes ?? {}),
        },
      },
      [
        ...(searchWord == null ? [] : [searchWord]),
        this.layout.column(body, {
          class: uiCssClass('search-view', 'fields'),
        }),
        this.factory.buttonGroup(
          { class: uiCssClass('search-view', 'actions') },
          { default: () => actions },
        ),
      ],
    )
  }

  /**
   * 搜索条件行：字段标签 + 操作符 + 值 + 清除。
   * 操作符缺省 {@link getColumnFilterOps}（表头菜单口径）；值形态由算子决定
   * （无值 / 单值 / `BETWEEN` 双值 / `IN`·`NOT_IN` 多值），不按字段类型猜。
   */
  buildSearchField(
    field: MetaUiField,
    context: UiContext,
    props: UiSearchFieldProps = {},
  ): TNode {
    const operators = props.operators?.length
      ? props.operators
      : getColumnFilterOps(field)
    const current = props.filter?.operator
    const operator: MetaUiFilterOpCode =
      current != null && operators.includes(current)
        ? current
        : operators[0] ?? 'EQ'
    const draft = FieldFilter.draftOf(props.filter)
    const write = (next: FieldFilter | undefined) =>
      props.onFilterChange?.(next)
    const setDraft = (patch: FieldFilterDraft) =>
      write(FieldFilter.leaf(field, operator, { ...draft, ...patch }))

    const operatorControl =
      operators.length > 1
        ? this.factory.dropDownList({
            class: uiCssClass('search-field', 'operator'),
            value: operator,
            options: operators.map((code) => ({
              value: code,
              label: context.t(`matcher.${code}`),
            })),
            disabled: props.disabled,
            onChange: (value) => {
              if (value == null) return
              write(
                FieldFilter.leaf(
                  field,
                  String(value) as MetaUiFilterOpCode,
                  draft,
                ),
              )
            },
          })
        : this.factory.textSpan({
            class: uiCssClass('search-field', 'operator'),
            text: context.t(`matcher.${operator}`),
          })

    const values = this.searchFieldValueControls(
      field,
      context,
      operator,
      draft,
      setDraft,
      props,
    )
    const clear = this.factory.actionButton(
      {
        name: 'clear',
        label: '',
        icon: 'clear',
        tooltip: context.t('action.clear'),
        onAction: () => write(undefined),
      },
      (message) => context.t(message),
      true,
      {
        class: uiCssClass('search-field', 'clear'),
        buttonType: 'text',
        colorRole: 'secondary',
        size: 'small',
      },
    )

    return this.renderer.render(
      'div',
      {
        class: [uiCssClass('search-field'), props.class]
          .filter(Boolean)
          .join(' '),
        attributes: {
          'data-field': field.fieldName,
          ...(props.htmlAttributes ?? {}),
        },
      },
      [this.labelFor(field), operatorControl, ...values, clear],
    )
  }

  /**
   * 行的值控件（按算子形态）：无值 → 空数组；`BETWEEN` → 两个输入；
   * `IN` / `NOT_IN` → 多选（set 过滤器）；其余 → 单值。
   */
  protected searchFieldValueControls(
    field: MetaUiField,
    context: UiContext,
    operator: MetaUiFilterOpCode,
    draft: FieldFilterDraft,
    setDraft: (patch: FieldFilterDraft) => void,
    props: UiSearchFieldProps,
  ): TNode[] {
    const disabled = props.disabled === true
    if (isNoValueFilterOperator(operator)) return []
    if (operator === 'IS_TRUE' || operator === 'IS_FALSE') return []
    if (operator === 'IN' || operator === 'NOT_IN') {
      const reference = field.reference
      return [
        this.factory.multiSelect({
          class: uiCssClass('search-field', 'value'),
          value: draft.values ?? [],
          options: reference?.refOptions ?? [],
          reference,
          bindMode: 'value_array',
          disabled,
          onChange: (bound) =>
            setDraft({ values: Array.isArray(bound) ? bound : [] }),
        }),
      ]
    }
    if (operator === 'WITHIN') {
      return [
        this.factory.dropDownList({
          class: uiCssClass('search-field', 'value'),
          value: typeof draft.value === 'string' ? draft.value : null,
          options: DATE_RANGE_FILTER_KINDS.map((kind) => ({
            value: kind,
            label: context.t(`dateRange.${kind}`),
          })),
          disabled,
          onChange: (value) => setDraft({ value: value ?? undefined }),
        }),
      ]
    }
    if (operator === 'BETWEEN') {
      return [
        this.searchFieldValueInput(
          field,
          context,
          draft.value,
          (value) => setDraft({ value }),
          disabled,
        ),
        this.searchFieldValueInput(
          field,
          context,
          draft.valueTo,
          (value) => setDraft({ valueTo: value }),
          disabled,
        ),
      ]
    }
    return [
      this.searchFieldValueInput(
        field,
        context,
        draft.value,
        (value) => setDraft({ value }),
        disabled,
      ),
    ]
  }

  /**
   * 单值输入：引用 / 枚举 → 选项下拉；布尔 → 是/否；日期 → datePicker；
   * 数字 → numberInput；其余 → textInput。
   */
  protected searchFieldValueInput(
    field: MetaUiField,
    context: UiContext,
    value: unknown,
    onChange: (value: unknown) => void,
    disabled: boolean,
  ): TNode {
    const className = uiCssClass('search-field', 'value')
    const reference = field.reference
    if (reference && !reference.hasOne) {
      return this.factory.dropDownList({
        class: className,
        value: (value ?? null) as string | number | null,
        options: (reference.refOptions ?? []).map((option) => ({
          value: reference.valueOf(option) as string | number,
          label: String(reference.labelOf(option) ?? ''),
        })),
        allowFiltering: true,
        disabled,
        onChange: (next) => onChange(next ?? undefined),
      })
    }
    if (SqlDataType.isBool(field.dataType)) {
      return this.factory.dropDownList({
        class: className,
        value: value === true ? 'true' : value === false ? 'false' : null,
        options: [
          { value: 'true', label: context.t('view.Yes') },
          { value: 'false', label: context.t('view.No') },
        ],
        disabled,
        onChange: (next) =>
          onChange(next == null ? undefined : next === 'true'),
      })
    }
    if (SqlDataType.isDate(field.dataType)) {
      return this.factory.datePicker({
        class: className,
        value: dateOf(value),
        disabled,
        onChange: (next) => onChange(next ?? undefined),
      })
    }
    if (SqlDataType.isNum(field.dataType)) {
      return this.factory.numberInput({
        class: className,
        value: typeof value === 'number' ? value : null,
        disabled,
        onChange: (next) => onChange(next ?? undefined),
      })
    }
    return this.factory.textInput({
      class: className,
      value: value == null ? '' : String(value),
      disabled,
      onChange: (next) => onChange(next ?? undefined),
    })
  }
}
