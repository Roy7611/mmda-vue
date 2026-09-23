import { createElement, type ReactNode } from 'react'
import { AbstractUiBuilder } from '@mmda/core'
import type {
  UiBuilder,
  UiContext,
  UiFactory,
  UiFieldFactory,
  UiConfirmProps,
  UiDialogAction,
  UiDialogProps,
  UiToastProps,
  UiMessageProps,
  UiViewProps,
  UiAppSideMenuProps,
  UiPlugin,
  UiProps,
  UiIndexTopbarProps,
  UiIndexTopbarSlots,
  UiDetailsTopbarProps,
  UiDetailsTopbarSlots,
  UiEditTopbarProps,
  UiEditTopbarSlots,
  UiListViewProps,
  UiModuleBreadcrumbProps,
  UiFilterBarProps,
  UiGanttProps,
  UiTimelineProps,
  UiSchedulerProps,
  UiKanbanProps,
  UiDiagramProps,
  UiListProps,
  UiTableProps,
  UiGridProps,
  UiTreeGridProps,
  UiExplorerProps,
  Entity,
  EntitySearchParam,
  MetaUi,
  MetaUiField,
  MetaUiGroup,
} from '@mmda/core'
import { ReactUiLayout } from './layout'
import { reactRenderProps } from '../render_props'
import { placeFields, uiRenderProps, type UiRenderProps } from '@mmda/core'
import { ReactUiContext } from '../contexts/react_ui_context'

/** 组壳入参：`UiProps` + 容器与排法。与 vui 的 `GroupShellProps` 同形。 */
interface GroupShellProps extends UiProps {
  container?: 'card' | 'fieldset' | 'tab' | 'none'
  region?: string
  many?: boolean
  orientation?: 'vertical' | 'horizontal'
  cols?: number
}

/** 组入参（`buildFieldGroup` / `buildSubGroup` 第三参）。与 vui 的 `BuildGroupProps` 同形。 */
interface BuildGroupProps extends UiProps {
  orientation?: 'vertical' | 'horizontal' | 'row' | 'column'
  direction?: 'vertical' | 'horizontal' | 'row' | 'column'
  cols?: number
  container?: 'card' | 'fieldset' | 'tab' | 'none'
  showGroupActions?: boolean
  skipRowDetail?: boolean
  fieldVertical?: boolean
}

/** 裸 builder toast（无皮肤覆盖时抛错）。 */
function noToast(_ctx: UiContext, _p: UiToastProps): void {
  throw new Error('UiBuilder.toast requires a skin package (@mmda/rui-*).')
}
function noMessage(_ctx: UiContext, _p: UiMessageProps): void {
  throw new Error('UiBuilder.message requires a skin package (@mmda/rui-*).')
}
function noConfirm(_ctx: UiContext, _p: UiConfirmProps): Promise<boolean> {
  throw new Error('UiBuilder.confirm requires a skin package (@mmda/rui-*).')
}
function noDialog(_content: ReactNode, _ctx: UiContext, _p?: UiDialogProps): Promise<UiDialogAction> {
  throw new Error('UiBuilder.dialog requires a skin package (@mmda/rui-*).')
}

const UNIMPLEMENTED = (name: string) => () => {
  throw new Error(`UiBuilder.${name} requires a skin package (@mmda/rui-*).`)
}

/**
 * React 拼屏骨架：实现 core `UiBuilder<ReactNode>`。
 * 皮肤 `extends ReactUiBuilder` 并覆盖抽象方法。
 */
export class ReactUiBuilder extends AbstractUiBuilder<ReactNode> implements UiBuilder<ReactNode> {

  constructor(
    public readonly factory: UiFactory<ReactNode>,
    public readonly fieldFactory: UiFieldFactory<ReactNode>,
    layout: ReactUiLayout = new ReactUiLayout(),
  ) {
    super(factory, fieldFactory, layout, layout)
  }

  // —— MetaUi 字段行（AbstractUiBuilder 提供标签 + 布局壳）——
  editFor(field: MetaUiField, context: UiContext): ReactNode {
    return this.wrapFieldRow(field, context, {}, true)
  }

  displayFor(field: MetaUiField, context: UiContext): ReactNode {
    return this.wrapFieldRow(field, context, {}, false)
  }

  // —— Overlay ————————————————

  toast = noToast as UiBuilder['toast']
  message = noMessage as UiBuilder['message']
  confirm = noConfirm as UiBuilder['confirm']
  dialog = noDialog as UiBuilder['dialog']
  editDialog(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['editDialog']>[1],
  ): ReturnType<UiBuilder<ReactNode>['editDialog']> {
    throw new Error('UiBuilder.editDialog requires a skin package (@mmda/rui-*).')
  }
  detailsDialog(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['detailsDialog']>[1],
  ): ReturnType<UiBuilder<ReactNode>['detailsDialog']> {
    throw new Error('UiBuilder.detailsDialog requires a skin package (@mmda/rui-*).')
  }
  selectDialog(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['selectDialog']>[1],
  ): ReturnType<UiBuilder<ReactNode>['selectDialog']> {
    throw new Error('UiBuilder.selectDialog requires a skin package (@mmda/rui-*).')
  }
  openNestEntityDialog<E extends object = object>(
    _parent: UiContext,
    _view: 'create' | 'edit' | 'details',
    _item?: E,
  ): Promise<{ action: UiDialogAction; entity?: E }> {
    throw new Error('UiBuilder.openNestEntityDialog requires a skin package (@mmda/rui-*).')
  }

  // —— 拼屏 ————————————————

  buildAppSideMenu(
    props: Parameters<UiBuilder<ReactNode>['buildAppSideMenu']>[0],
  ): ReturnType<UiBuilder<ReactNode>['buildAppSideMenu']> {
    throw new Error('UiBuilder.buildAppSideMenu requires a skin package (@mmda/rui-*).')
  }
  buildSigninForm(
    props?: Parameters<UiBuilder<ReactNode>['buildSigninForm']>[0],
    slots?: Parameters<UiBuilder<ReactNode>['buildSigninForm']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildSigninForm']> {
    throw new Error('UiBuilder.buildSigninForm requires a skin package (@mmda/rui-*).')
  }
  buildSignupForm(
    props?: Parameters<NonNullable<UiBuilder<ReactNode>['buildSignupForm']>>[0],
    slots?: Parameters<NonNullable<UiBuilder<ReactNode>['buildSignupForm']>>[1],
  ): ReturnType<NonNullable<UiBuilder<ReactNode>['buildSignupForm']>> {
    throw new Error('UiBuilder.buildSignupForm requires a skin package (@mmda/rui-*).')
  }
  buildIndexView(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildIndexView']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildIndexView']> {
    throw new Error('UiBuilder.buildIndexView requires a skin package (@mmda/rui-*).')
  }
  buildSelectView(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildSelectView']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildSelectView']> {
    throw new Error('UiBuilder.buildSelectView requires a skin package (@mmda/rui-*).')
  }
  /** 详情页（只读表单）。 */
  buildDetailsView(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildDetailsView']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildDetailsView']> {
    return this.buildView(context, props ?? {})
  }
  /** 编辑页（create 走同一方法，由 `context.view` 区分）。 */
  buildEditView(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildEditView']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildEditView']> {
    return this.buildView(context, props ?? {})
  }

  /**
   * 详情 / 编辑页主体：按 `MetaUiGroup` 分区（primary / secondary / tails）逐个 {@link buildGroup}，
   * 交给 core 的 `layoutPage` 排壳。与 vui `buildView` 的 cards 路径同构。
   *
   * 待接（vui 有、这边先不做）：顶栏 `buildDetailsTopbar` / `buildEditTopbar`（批 5）、
   * `pageLayout: 'tabs'` + emphasized 字段条、附件面板、页面提示 banner、页脚动作条。
   */
  protected buildView(context: UiContext, props: UiViewProps): ReactNode {
    const groups = context.metaUi.groups.filter(
      (group) => !context.isGroupHidden(group),
    )
    // 行展开（rowDetail）里嵌的组由子表自己画，主视图不要再画一遍。
    const nested = new Set(
      groups
        .map((group) => context.getGroupLogic(group)?.rowDetailGroup)
        .filter((name): name is string => Boolean(name)),
    )
    const viewGroups = groups.filter((group) => !nested.has(group.groupName))
    const primaryCols = props.primaryCols ?? 2

    // 页级插槽（core `UiViewSlots`）：`content` 给了就整块接管主区，不再按组拼。
    const pagePrimary: ReactNode[] = [
      ...(props.header ? [props.header()] : []),
    ]
    const summary: ReactNode[] = []
    let tails: ReactNode[] = []
    if (props.content) {
      pagePrimary.push(props.content())
    } else {
      pagePrimary.push(
        ...AbstractUiBuilder.sortViewGroups(
          viewGroups.filter((group) => group.isPrimary()),
        ).map((group) =>
          this.buildGroup(group, context, undefined, {
            orientation: 'row',
            cols: primaryCols,
          }),
        ),
      )
      if (props.showSecondaryGroup !== false) {
        summary.push(
          ...AbstractUiBuilder.sortViewGroups(
            viewGroups.filter((group) => group.isSecondary()),
          ).map((group) =>
            this.buildGroup(group, context, undefined, {
              orientation: 'column',
              cols: 1,
            }),
          ),
        )
      }
      tails = AbstractUiBuilder.sortViewGroups(
        viewGroups.filter((group) => group.isTails()),
      ).map((group) =>
        this.buildGroup(group, context, undefined, {
          orientation: 'row',
          cols: primaryCols,
        }),
      )
    }

    // 默认顶栏（buildDetailsTopbar / buildEditTopbar）待批 5 —— core 现在只给了 `toolbar` 插槽。
    return this.layout.layoutPage({
      pageLayout: props.pageLayout === 'tabs' ? 'tabs' : 'cards',
      toolbar: props.toolbar?.(),
      primary: pagePrimary,
      summary,
      tails,
    })
  }
  buildSearchField(
    field: Parameters<UiBuilder<ReactNode>['buildSearchField']>[0],
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildSearchField']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildSearchField']> {
    throw new Error('UiBuilder.buildSearchField requires a skin package (@mmda/rui-*).')
  }
  buildIndexTopbar(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildIndexTopbar']>[1],
    slots?: Parameters<UiBuilder<ReactNode>['buildIndexTopbar']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildIndexTopbar']> {
    throw new Error('UiBuilder.buildIndexTopbar requires a skin package (@mmda/rui-*).')
  }
  buildDetailsTopbar(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildDetailsTopbar']>[1],
    slots?: Parameters<UiBuilder<ReactNode>['buildDetailsTopbar']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildDetailsTopbar']> {
    throw new Error('UiBuilder.buildDetailsTopbar requires a skin package (@mmda/rui-*).')
  }
  buildEditTopbar(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildEditTopbar']>[1],
    slots?: Parameters<UiBuilder<ReactNode>['buildEditTopbar']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildEditTopbar']> {
    throw new Error('UiBuilder.buildEditTopbar requires a skin package (@mmda/rui-*).')
  }
  buildModuleBreadcrumb(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildModuleBreadcrumb']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildModuleBreadcrumb']> {
    throw new Error('UiBuilder.buildModuleBreadcrumb requires a skin package (@mmda/rui-*).')
  }
  buildModuleSearchbar(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildModuleSearchbar']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildModuleSearchbar']> {
    throw new Error('UiBuilder.buildModuleSearchbar requires a skin package (@mmda/rui-*).')
  }
  buildFilterBar(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildFilterBar']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildFilterBar']> {
    throw new Error('UiBuilder.buildFilterBar requires a skin package (@mmda/rui-*).')
  }
  /** 主表字段组（`group.many === false`）。与 vui `buildFieldGroup` 同形。 */
  buildFieldGroup(
    group: Parameters<UiBuilder<ReactNode>['buildFieldGroup']>[0],
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildFieldGroup']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildFieldGroup']> {
    return this.buildGroup(group, context, undefined, props ?? {})
  }

  /** 子表组（`group.many === true`）。 */
  buildSubGroup(
    group: Parameters<UiBuilder<ReactNode>['buildSubGroup']>[0],
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildSubGroup']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildSubGroup']> {
    return this.buildGroup(group, context, undefined, props ?? {})
  }

  /**
   * 组拼屏：字段组拼字段行（`placeFields` 装箱 + `renderFieldRow`，编辑态自动选编辑/显示），
   * 子表走 `factory.grid`；两者都过 {@link wrapGroupSlots}（前后插片）与 {@link wrapGroup}（壳）。
   */
  protected buildGroup(
    group: MetaUiGroup,
    context: UiContext,
    children: ReactNode[] | null | undefined,
    props: BuildGroupProps,
  ): ReactNode {
    if (context.isGroupHidden(group)) {
      return this.renderer.render(
        'span',
        { attributes: { htmlAttributes: { hidden: true } } },
        [],
      )
    }
    // 三个位置正交：customEditor / customRenderer 换中间那块，插片由 wrapGroupSlots 包在外层。
    const groupLogic = context.getGroupLogic(group)
    const replaceView = context.editing
      ? (groupLogic?.customEditor ?? groupLogic?.customRenderer)
      : groupLogic?.customRenderer
    const body =
      typeof replaceView === 'function'
        ? replaceView(group, context, props)
        : group.many && group.groupUi
          ? this.buildSubGroupBody(group, context, props)
          : this.buildFieldGroupBody(group, context, children, props)
    return this.wrapGroup(
      group,
      this.wrapGroupSlots(group, context, props, body),
      {
        container: props.container ?? 'card',
        class: props.class,
        many: group.many,
        region: AbstractUiBuilder.groupZone(group),
      },
    )
  }

  /** 字段组内容：可见字段装箱后逐个成行；坐标写进字段行（与 vui 同一套 `placeFields`）。 */
  protected buildFieldGroupBody(
    group: MetaUiGroup,
    context: UiContext,
    children: ReactNode[] | null | undefined,
    props: BuildGroupProps,
  ): ReactNode {
    const gridCols = (props.cols as 1 | 2 | 3) ?? 2
    const visible = (group.fields ?? []).filter(
      (field) => !context.isFieldHidden(field),
    )
    const packed = placeFields(
      gridCols,
      visible.map((field) => ({
        colSpan: field.colSpan,
        rowSpan: field.rowSpan,
      })),
    )
    const fields =
      children ??
      visible.map((field, index) => {
        const cell = packed[index]!
        return this.renderFieldRow(field, context, {
          ...(props.fieldVertical ? { fieldVertical: true } : {}),
          gridColumn: `${cell.column + 1} / span ${cell.colSpan}`,
          gridRow: `${cell.row + 1} / span ${cell.rowSpan}`,
        })
      })
    const column = (props.orientation ?? props.direction) === 'column'
    this.layout.fieldGroupLayout = {
      type: column ? 'column' : 'grid',
      gridCols,
    }
    return this.layout.layoutFieldGroup({ fields })
  }

  /**
   * 子表内容：可编表格（core `grid(metaUi, { rows })` 注入 fields / 主键 / objName）。
   * 行展开、图片墙、树形子表、外键列等分支待接 —— 先给「能增删改的最小可用」。
   */
  protected buildSubGroupBody(
    group: MetaUiGroup,
    context: UiContext,
    _props: BuildGroupProps,
  ): ReactNode {
    const metaUi = group.groupUi
    if (!metaUi) return this.renderer.render('div', {}, [])
    const rows =
      ((context.model as Record<string, unknown>)[group.groupName] as
        | Entity[]
        | undefined) ?? []
    return this.grid(metaUi, { rows })
  }

  /**
   * 组内容前后插片：`prepend` + 内容 + `append`（编辑态用 `customEditPrepend` / `customEditAppend`）。
   * 与 `customEditor` / `customRenderer` **正交**，与 vui `wrapGroupSlots` 同形。
   */
  protected wrapGroupSlots(
    group: MetaUiGroup,
    context: UiContext,
    props: UiProps,
    body: ReactNode | ReactNode[],
  ): ReactNode[] {
    const groupLogic = context.getGroupLogic(group)
    const prependView = context.editing
      ? groupLogic?.customEditPrepend
      : groupLogic?.customPrepend
    const appendView = context.editing
      ? groupLogic?.customEditAppend
      : groupLogic?.customAppend
    return [
      ...(typeof prependView === 'function'
        ? [prependView(group, context, props)]
        : []),
      ...(Array.isArray(body) ? body : [body]),
      ...(typeof appendView === 'function'
        ? [appendView(group, context, props)]
        : []),
    ]
  }

  /** 组壳：`none` 直出、`fieldset` 走 core 的老式 legend、其余用 `factory.card`（`tab` 暂同 card）。 */
  protected wrapGroup(
    group: MetaUiGroup,
    body: ReactNode | ReactNode[],
    props: GroupShellProps,
  ): ReactNode {
    const shell = props.container ?? 'card'
    if (shell === 'none') {
      return Array.isArray(body)
        ? this.renderer.render('div', {}, body)
        : body
    }
    if (shell === 'fieldset') {
      return this.buildGroupFieldSet(group, body, props)
    }
    return this.factory.card(
      { title: group.groupLabel, class: this.groupWrapClass(group, props) },
      { default: () => [this.wrapGroupContent(body)] },
    )
  }

  // —— 插件视图 ——————————————

  buildExplorer<T>(
    _context: UiContext,
    _props?: UiExplorerProps<T, ReactNode>,
  ): ReactNode {
    throw new Error('UiBuilder.buildExplorer requires a skin package (@mmda/rui-*).')
  }
}
