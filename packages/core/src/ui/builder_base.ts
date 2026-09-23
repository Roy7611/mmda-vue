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
    props: UiProps = {},
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
    props: UiProps = {},
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
      editing: _e,
      direction,
      orientation,
      isReadonly: _r,
      fieldVertical,
      gridColumn,
      gridRow,
      ...controlProps
    } = props
    const control = useEditor
      ? this.editorFor(field, context, controlProps)
      : this.displayRendererFor(field, context, controlProps)
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
}