import { createElement, type ReactNode } from 'react'
import {
  AbstractUiBuilder,
  FieldFilter,
  indexTopbarLayoutOf,
  indexTopbarModifierClasses,
  indexTopbarSlotAlignOf,
  indexTopbarSlotModifierClasses,
  isPagedList,
  moduleChain,
  moduleOf,
  normalizeActionColorRole,
  resolveDetailsTopbarActions,
  resolveEditTopbarActions,
  resolveIndexTopbarActions,
  twoSlotTopbarModifierClasses,
  twoSlotTopbarSlotAlignOf,
  twoSlotTopbarSlotModifierClasses,
  uiCssClass,
  writeListFilterModel,
  writeListSorts,
} from '@mmda/core'
import type {
  UiBuilder,
  UiContext,
  UiFactory,
  UiFieldFactory,
  UiConfirmProps,
  UiDialogAction,
  UiDialogProps,
  UiEntityDialogOptions,
  UiToastProps,
  UiMessageProps,
  UiViewProps,
  UiAppSideMenuProps,
  UiPlugin,
  UiProps,
  UiOverlay,
  UiIndexTopbarProps,
  UiIndexTopbarSlots,
  UiDetailsTopbarProps,
  UiDetailsTopbarSlots,
  UiEditTopbarProps,
  UiEditTopbarSlots,
  UiListViewProps,
  UiModuleBreadcrumbProps,
  UiFilterBarProps,
  UiAction,
  UiChipItem,
  UiHorzAlign,
  UiTextInputProps,
  UiTopbarActionGroups,
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
  FilterModel,
  PagedList,
  MetaUi,
  MetaUiField,
  MetaUiGroup,
  Sort,
} from '@mmda/core'
import { RuiLayout } from './layout'
import { reactRenderProps } from '../render_props'
import { placeFields, uiRenderProps, type UiRenderProps } from '@mmda/core'
import { RuiContext } from '../contexts/react_ui_context'

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
function noConfirm(_ctx: UiContext, _p: UiConfirmProps): Promise<boolean> {
  throw new Error('UiBuilder.confirm requires a skin package (@mmda/rui-*).')
}
function noDialog(_content: ReactNode, _ctx: UiContext, _p?: UiDialogProps): Promise<UiDialogAction> {
  throw new Error('UiBuilder.dialog requires a skin package (@mmda/rui-*).')
}

const noOverlay: UiOverlay<ReactNode> = {
  toast(): void {
    throw new Error('UiBuilder.overlay requires a skin package (@mmda/rui-*).')
  },
  message(): void {
    throw new Error('UiBuilder.overlay requires a skin package (@mmda/rui-*).')
  },
  async confirm(): Promise<boolean> {
    throw new Error('UiBuilder.overlay requires a skin package (@mmda/rui-*).')
  },
  async dialog(): Promise<UiDialogAction> {
    throw new Error('UiBuilder.overlay requires a skin package (@mmda/rui-*).')
  },
  async closeTopDialog(): Promise<void> {
    throw new Error('UiBuilder.overlay requires a skin package (@mmda/rui-*).')
  },
}

const UNIMPLEMENTED = (name: string) => () => {
  throw new Error(`UiBuilder.${name} requires a skin package (@mmda/rui-*).`)
}

/** 把 core 的 `UiClassValue` 数组形态收成 React 可用的 className 字符串。 */
function classNames(...parts: unknown[]): string {
  return parts.flat(Infinity).filter(Boolean).join(' ')
}

/** 只取 core `UiProps` 归一后的 DOM 属性（`data-*` / `aria-*` / `htmlAttributes`）。 */
function domAttributes(props?: UiProps): Record<string, unknown> {
  const { attributes } = uiRenderProps(props)
  return reactRenderProps({ props: {} as UiProps, attributes })
}

function topbarJustifyContent(align: UiHorzAlign): string {
  if (align === 'center') return 'center'
  if (align === 'right') return 'flex-end'
  return 'flex-start'
}

function indexTopbarHasCenter(slots?: UiIndexTopbarSlots<ReactNode>): boolean {
  return typeof slots?.center === 'function'
}

function indexTopbarRootStyle(
  slots?: UiIndexTopbarSlots<ReactNode>,
): Record<string, string> {
  const columns = indexTopbarHasCenter(slots)
    ? 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)'
    : 'minmax(0, 1fr) auto auto'
  return {
    display: 'grid',
    gridTemplateColumns: columns,
    alignItems: 'center',
    width: '100%',
    minWidth: '0',
  }
}

function indexTopbarSlotStyle(
  props: UiIndexTopbarProps,
  slot: 'start' | 'center' | 'end',
): Record<string, string> {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: topbarJustifyContent(indexTopbarSlotAlignOf(props, slot)),
    minWidth: '0',
  }
}

function twoSlotTopbarRootStyle(): Record<string, string> {
  return {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    width: '100%',
    minWidth: '0',
  }
}

function twoSlotTopbarSlotStyle(
  props: UiDetailsTopbarProps,
  slot: 'start' | 'end',
): Record<string, string> {
  const align = twoSlotTopbarSlotAlignOf(props, slot)
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: topbarJustifyContent(align),
    minWidth: '0',
  }
}

function renderIndexTopbarShell(
  props: UiIndexTopbarProps,
  slots?: UiIndexTopbarSlots<ReactNode>,
): ReactNode {
  const names = ['start', 'center', 'end'] as const
  return createElement(
    'div',
    {
      ...domAttributes(props),
      className: classNames(indexTopbarModifierClasses(props, slots)),
      style: { ...indexTopbarRootStyle(slots), ...(props.style as object) },
    },
    names.map((slot) => {
      if (slot === 'center' && !indexTopbarHasCenter(slots)) {
        return createElement('div', {
          className: classNames(indexTopbarSlotModifierClasses(props, slot)),
          style: indexTopbarSlotStyle(props, slot),
        })
      }
      return createElement(
        'div',
        {
          className: classNames(indexTopbarSlotModifierClasses(props, slot)),
          style: indexTopbarSlotStyle(props, slot),
        },
        slots?.[slot]?.() ?? null,
      )
    }),
  )
}

function renderTwoSlotTopbarShell(
  block: 'details-topbar' | 'edit-topbar',
  props: UiDetailsTopbarProps,
  slots?: UiDetailsTopbarSlots<ReactNode>,
): ReactNode {
  const names = ['start', 'end'] as const
  return createElement(
    'div',
    {
      ...domAttributes(props),
      className: classNames(twoSlotTopbarModifierClasses(block, props)),
      style: { ...twoSlotTopbarRootStyle(), ...(props.style as object) },
    },
    names.map((slot) =>
      createElement(
        'div',
        {
          className: classNames(twoSlotTopbarSlotModifierClasses(block, props, slot)),
          style: twoSlotTopbarSlotStyle(props, slot),
        },
        slots?.[slot]?.() ?? null,
      ),
    ),
  )
}

const STANDARD_TOPbar_ACTIONS = new Set([
  'back',
  'create',
  'confirm',
  'cancel',
  'edit',
  'save',
  'delete',
  'deleteAll',
  'print',
  'import',
  'export',
  'refresh',
])

/**
 * React 拼屏骨架：实现 core `UiBuilder<ReactNode>`。
 * 皮肤 `extends RuiBuilder` 并覆盖抽象方法。
 */
export class RuiBuilder extends AbstractUiBuilder<ReactNode> implements UiBuilder<ReactNode> {

  constructor(
    public readonly factory: UiFactory<ReactNode>,
    public readonly fieldFactory: UiFieldFactory<ReactNode>,
    layout: RuiLayout = new RuiLayout(),
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

  readonly overlay: UiOverlay<ReactNode> = noOverlay
  toast = noToast as UiBuilder['toast']
  confirm = noConfirm as UiBuilder['confirm']
  dialog = noDialog as UiBuilder['dialog']

  /** 详情/编辑页写页内消息条（banner）；列表或无 pageNotice 时回落 toast。 */
  message(context: UiContext, props: UiMessageProps): void {
    const runtime = context as unknown as {
      many?: boolean
      pageNotice?: { value: UiMessageProps | null }
    }
    if (runtime.many || !runtime.pageNotice) {
      this.toast(context, { severity: props.severity, message: props.content })
      return
    }
    runtime.pageNotice.value = {
      ...props,
      content: props.content ?? '',
      severity: props.severity ?? 'info',
      showCloseIcon: props.showCloseIcon !== false,
      showIcon: props.showIcon !== false,
      variant: props.variant ?? 'filled',
      visible: props.visible !== false,
    }
  }
  async editDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<ReactNode, UiViewProps>,
  ): Promise<UiDialogAction> {
    const content = this.buildEditView(context, props?.viewProps)
    return this.dialog(content, context, {
      buttons: 'okCancel',
      showFooter: true,
      ...props?.dlgProps,
    } as UiDialogProps<ReactNode>)
  }
  async detailsDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<ReactNode, UiViewProps>,
  ): Promise<UiDialogAction> {
    const content = this.buildDetailsView(context, props?.viewProps)
    return this.dialog(
      content,
      context,
      props?.dlgProps as UiDialogProps<ReactNode>,
    )
  }
  async selectDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<ReactNode, UiListViewProps>,
  ): Promise<UiDialogAction> {
    const content = this.buildSelectView(context, props?.viewProps)
    return this.dialog(content, context, {
      buttons: 'okCancel',
      showFooter: true,
      ...props?.dlgProps,
    } as UiDialogProps<ReactNode>)
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
    props: UiAppSideMenuProps<ReactNode> = {},
  ): ReactNode {
    const modules = props.modules ?? []
    return createElement(
      'nav',
      { className: uiCssClass('app-side-menu') },
      modules.map((module) =>
        createElement(
          'a',
          {
            key: module.moduleCode,
            className: uiCssClass('app-side-menu', 'item'),
            href: module.moduleUrl ?? (module as unknown as { url?: string }).url,
          },
          module.moduleLabel ?? module.moduleName,
        ),
      ),
    )
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
    props?: UiListViewProps,
  ): ReactNode {
    const rows = Array.isArray(context.model) ? context.model : []
    const selectionMode = props?.selectionMode ?? context.selectionMode ?? undefined
    const searchbar =
      props?.showSearchbar === false ? null : this.buildModuleSearchbar(context)
    const toolbar =
      props?.showToolbar === false
        ? null
        : (props?.toolbar?.() ??
          this.buildIndexTopbar(
            context,
            {
              showBreadcrumb: props?.showBreadcrumb,
              showActions: props?.showActions,
            },
            { center: () => (searchbar ? [searchbar] : []) },
          ))
    const paginator = this.buildIndexPaginator(context)
    return this.layout.layoutIndexPage({
      toolbar: toolbar ?? undefined,
      filterBar: this.buildFilterBar(context),
      default: this.buildListBody(context, props, rows, selectionMode),
      footer: paginator ?? undefined,
    })
  }
  buildSelectView(
    context: UiContext,
    props?: UiListViewProps,
  ): ReactNode {
    return this.buildIndexView(context, {
      ...props,
      selectionMode: props?.selectionMode ?? context.selectionMode ?? undefined,
    })
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
   * 交给 core 的 `layoutPage` 排壳。与 vui `buildView` 的 cards / tabs 两条路径同构。
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
    const pageLayout =
      props.pageLayout === 'tabs' || props.pageLayout === 'cards'
        ? props.pageLayout
        : this.layout.pageLayout === 'tabs'
          ? 'tabs'
          : 'cards'
    const runtime = context as unknown as {
      editing: boolean
      pageNotice?: { value: UiMessageProps | null }
    }

    // 对话框内默认不画模块顶栏（与 vui 同形）；显式 showToolbar:true 可恢复。
    const toolbarVisible = props.showToolbar ?? !context.isInDialog
    const toolbar =
      toolbarVisible === false
        ? null
        : (props.toolbar?.() ??
          (context.editing
            ? this.buildEditTopbar(context, {
                showBreadcrumb: props.showBreadcrumb ?? true,
                showActions: props.showActions ?? true,
              })
            : this.buildDetailsTopbar(context, {
                showBreadcrumb: props.showBreadcrumb ?? true,
                showActions: props.showActions ?? true,
              })))

    // 页面消息条（banner）。`message()` 写 pageNotice，这里取出来渲染并支持关闭。
    const notice = runtime.pageNotice?.value
    const banner =
      notice && notice.visible !== false
        ? this.factory.message({
            ...notice,
            onClose: () => {
              notice.onClose?.()
              if (runtime.pageNotice) runtime.pageNotice.value = null
            },
          })
        : undefined

    let pagePrimary: ReactNode[]
    const summary: ReactNode[] = []
    let tails: ReactNode[] = []
    let emphasis: ReactNode | undefined

    if (props.content) {
      // 页级插槽：`content` 给了就整块接管主区，不再按组拼。
      pagePrimary = [
        ...(props.header ? [props.header()] : []),
        props.content(),
      ]
    } else if (pageLayout === 'tabs') {
      // emphasis：emphasized 字段只读展示；tabs 内同一字段仍可编辑。
      const seen = new Set<string>()
      const emphasizedFields: MetaUiField[] = []
      for (const group of viewGroups) {
        for (const field of group.fields ?? []) {
          if (
            field.emphasized &&
            !context.isFieldHidden(field) &&
            !seen.has(field.fieldName)
          ) {
            seen.add(field.fieldName)
            emphasizedFields.push(field)
          }
        }
      }
      if (emphasizedFields.length > 0) {
        emphasis = this.layout.row(
          emphasizedFields.map((field) =>
            this.wrapFieldRow(field, context, {}, false),
          ),
          emphasizedFields.map((field) => Math.max(1, field.colSpan ?? 1)),
        )
      }
      const tabGroups = AbstractUiBuilder.sortViewGroups([
        ...viewGroups.filter((group) => group.isPrimary()),
        ...(props.showSecondaryGroup !== false
          ? viewGroups.filter((group) => group.isSecondary())
          : []),
        ...viewGroups.filter((group) => group.isTails()),
      ])
      const tabItems = tabGroups.map((group) => ({
        name: group.groupName,
        header: group.groupLabel || group.groupName,
        content: this.buildGroup(group, context, undefined, {
          container: 'tab',
          orientation: 'row',
          cols: primaryCols,
        }),
      }))
      const attachments = (context.model as Record<string, any>).attachments
      if (
        !context.editing &&
        props.showAttachments !== false &&
        Array.isArray(attachments)
      ) {
        tabItems.push({
          name: 'attachments',
          header: context.t('attachments') || 'Attachments',
          content: this.buildAttachmentGroup(context),
        })
      }
      pagePrimary = [
        ...(props.header ? [props.header()] : []),
        this.factory.tabs({
          items: tabItems,
          headerPlacement: 'Top',
          scrollable: true,
          heightAdjustMode: 'Fill',
          loadOn: 'Demand',
          headerStyle: 'fill',
        }),
      ]
    } else {
      // cards：主区主表组 → 子表组；右边栏附件 + 概要；尾栏。
      const primary = AbstractUiBuilder.sortViewGroups(
        viewGroups.filter((group) => group.isPrimary()),
      ).map((group) =>
        this.buildGroup(group, context, undefined, {
          orientation: 'row',
          cols: primaryCols,
        }),
      )
      const attachments = (context.model as Record<string, any>).attachments
      if (
        !context.editing &&
        props.showAttachments !== false &&
        Array.isArray(attachments)
      ) {
        summary.push(this.buildAttachmentGroup(context))
      }
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
      pagePrimary = [
        ...(props.header ? [props.header()] : []),
        ...primary,
      ]
    }

    return this.layout.layoutPage({
      pageLayout,
      toolbar,
      banner,
      emphasis,
      primary: pagePrimary,
      summary,
      tails,
      footer: props.footer?.(),
    })
  }

  /** 附件面板：读 `model.attachments`，只在非编辑态展示。 */
  buildAttachmentGroup(context: UiContext, props?: UiProps): ReactNode {
    const attachments =
      ((context.model as Record<string, any>).attachments as
        { fileName?: string }[] | undefined) ?? []
    const title = context.t('attachments') || 'Attachments'
    const body = attachments.length
      ? createElement(
          'ul',
          null,
          attachments.map((item, index) =>
            createElement('li', { key: index }, item.fileName ?? ''),
          ),
        )
      : createElement(
          'p',
          null,
          context.t('empty.attachments') || 'No attachments',
        )
    return this.wrapGroup(
      {
        groupLabel: title,
        many: false,
        isSecondary: () => true,
        isTails: () => false,
      } as unknown as MetaUiGroup,
      body,
      { region: 'secondary', class: 'mmda-attachments', ...props },
    )
  }
  buildIndexTopbar(
    context: UiContext,
    props: UiIndexTopbarProps = {},
    slots?: UiIndexTopbarSlots<ReactNode>,
  ): ReactNode {
    return this.paintTopbar(
      context,
      props,
      slots,
      resolveIndexTopbarActions(context),
      [],
      'index',
    )
  }
  buildDetailsTopbar(
    context: UiContext,
    props: UiDetailsTopbarProps = {},
    slots?: UiDetailsTopbarSlots<ReactNode>,
  ): ReactNode {
    return this.paintTopbar(
      context,
      props,
      slots,
      resolveDetailsTopbarActions(context),
      [],
      'details',
    )
  }
  buildEditTopbar(
    context: UiContext,
    props: UiEditTopbarProps = {},
    slots?: UiEditTopbarSlots<ReactNode>,
  ): ReactNode {
    const groups = resolveEditTopbarActions(context)
    const uploading = (context as unknown as { uploading?: { value?: boolean } }).uploading?.value
    if (uploading) {
      const save = groups.primary.find((action) => action.name === 'save')
      if (save) save.disabled = true
    }
    return this.paintTopbar(context, props, slots, groups, [], 'edit')
  }

  private paintTopbar(
    context: UiContext,
    props: UiIndexTopbarProps | UiDetailsTopbarProps,
    slots: UiIndexTopbarSlots<ReactNode> | UiDetailsTopbarSlots<ReactNode> | undefined,
    groups: UiTopbarActionGroups,
    extraMore: UiAction[],
    kind: 'index' | 'details' | 'edit',
  ): ReactNode {
    const module = moduleOf(context)
    const runtime = context as { many?: boolean; title?: string }
    const breadcrumb = () =>
      this.buildModuleBreadcrumb(context, {
        module,
        label: props.breadcrumbLeaf || (runtime.many ? '' : context.title ?? ''),
      })
    if (kind === 'index') {
      return this.paintIndexTopbarTree(
        context,
        props as UiIndexTopbarProps,
        slots as UiIndexTopbarSlots<ReactNode> | undefined,
        groups,
        extraMore,
        breadcrumb,
      )
    }
    return this.paintTwoSlotTopbarTree(
      kind,
      context,
      props as UiDetailsTopbarProps,
      slots as UiDetailsTopbarSlots<ReactNode> | undefined,
      groups,
      extraMore,
      breadcrumb,
    )
  }

  private paintIndexTopbarTree(
    context: UiContext,
    props: UiIndexTopbarProps,
    slots: UiIndexTopbarSlots<ReactNode> | undefined,
    groups: UiTopbarActionGroups,
    extraMore: UiAction[],
    breadcrumb: () => ReactNode,
  ): ReactNode {
    const layout = indexTopbarLayoutOf(props)
    const showBreadcrumb = props.showBreadcrumb !== false
    const showActions = props.showActions !== false
    const showSearchBar = props.showSearchBar !== false
    const t = (key: string) => context.t(key)
    const searchCenter =
      showSearchBar && slots?.center ? () => slots.center!() : undefined

    const startFull = () => {
      if (!showBreadcrumb) return undefined
      if ((slots as UiIndexTopbarSlots<ReactNode> & { default?: () => ReactNode })?.default) {
        return (slots as UiIndexTopbarSlots<ReactNode> & { default?: () => ReactNode }).default!()
      }
      return breadcrumb()
    }

    const moreMenu = () =>
      this.factory.moreMenuButton({
        label: t('action.more'),
        tooltip: t('action.more'),
        'aria-label': t('action.more'),
        buttonType: 'tonal',
        colorRole: 'secondary',
        actions: this.defaultMoreActions(context),
      })

    const compactMenu = () =>
      this.factory.dropDownButton({
        label: t('action.more'),
        tooltip: t('action.more'),
        'aria-label': t('action.more'),
        hideCaret: true,
        actions: [
          ...this.navActions(context),
          ...this.defaultMoreActions(context),
        ],
      })

    const magnifier = () =>
      this.factory.button(
        {
          tooltip: t('action.search'),
          buttonType: 'text',
          onClick: () => {
            if (props.onSearchPage) props.onSearchPage()
            else context.routeToSearch()
          },
        },
        { default: () => [this.factory.icon({ iconClass: 'search' })] },
      )

    let start: (() => ReactNode) | undefined
    let center: (() => ReactNode) | undefined
    let end: (() => ReactNode) | undefined

    if (layout === 'compact') {
      start = showBreadcrumb || showActions ? compactMenu : undefined
      center = () => createElement('strong', null, context.title ?? '')
      end = showSearchBar ? magnifier : undefined
    } else if (layout === 'medium') {
      start = startFull
      center = searchCenter
      end = showActions ? moreMenu : undefined
    } else {
      start = startFull
      center = searchCenter
      end = showActions ? () => this.paintActionGroup(context, groups, extraMore) : undefined
    }

    return renderIndexTopbarShell(
      { ...props, layout },
      { start, center, end },
    )
  }

  private paintTwoSlotTopbarTree(
    kind: 'details' | 'edit',
    context: UiContext,
    props: UiDetailsTopbarProps,
    slots: UiDetailsTopbarSlots<ReactNode> | undefined,
    groups: UiTopbarActionGroups,
    extraMore: UiAction[],
    breadcrumb: () => ReactNode,
  ): ReactNode {
    const showBreadcrumb = props.showBreadcrumb !== false
    const showActions = props.showActions !== false
    const start = () => {
      if (!showBreadcrumb) return undefined
      if ((slots as UiDetailsTopbarSlots<ReactNode> & { default?: () => ReactNode })?.default) {
        return (slots as UiDetailsTopbarSlots<ReactNode> & { default?: () => ReactNode }).default!()
      }
      return breadcrumb()
    }
    const end = showActions ? () => this.paintActionGroup(context, groups, extraMore) : undefined
    return renderTwoSlotTopbarShell(
      kind === 'edit' ? 'edit-topbar' : 'details-topbar',
      props,
      { start, end },
    )
  }

  private paintActionGroup(
    context: UiContext,
    groups: UiTopbarActionGroups,
    extraMore: UiAction[],
  ): ReactNode {
    const children: ReactNode[] = [
      ...groups.primary.map((action) => this.topbarButton(context, action)),
      ...this.batchButtons(context, groups.batch),
      ...this.moreButton(context, this.wireMoreActions(context, groups, extraMore)),
    ]
    return this.factory.buttonGroup(
      { class: uiCssClass('topbar-actions'), role: 'group' },
      { default: () => children },
    )
  }

  private wireMoreActions(
    context: UiContext,
    groups: UiTopbarActionGroups,
    extraMore: UiAction[],
  ): UiAction[] {
    return [
      ...groups.more.map((action) => this.wireAction(context, action)),
      ...extraMore.map((action) => ({
        ...action,
        onAction:
          action.onAction ??
          (action as { command?: UiAction['onAction'] }).command,
      })),
    ]
  }

  private navActions(context: UiContext): UiAction[] {
    const module = moduleOf(context)
    if (!module) return []
    return moduleChain(module).map((item) => ({
      name: item.moduleCode,
      label: item.moduleLabel ?? item.moduleName,
      icon: item.moduleIcon,
    }))
  }

  private defaultMoreActions(context: UiContext): UiAction[] {
    const runtime = context as { editing?: boolean; many?: boolean }
    if (runtime.editing) {
      return [
        this.standardAction(context, 'save'),
        this.standardAction(context, 'cancel'),
      ]
    }
    if (runtime.many) return [this.standardAction(context, 'create')]
    return [
      this.standardAction(context, 'back'),
      this.standardAction(context, 'edit'),
    ]
  }

  private topbarButton(context: UiContext, action: UiAction): ReactNode {
    const wired = this.wireAction(context, action)
    const label =
      wired.label ??
      (wired.name ? context.t(`action.${wired.name}`) : wired.name)
    const colorRole = (wired.colorRole ?? wired.role)
      ?.toString()
      .toLowerCase()
    const secondary = colorRole === 'secondary'
    return this.factory.actionButton(
      wired,
      (message) => context.t(message),
      false,
      {
        size: 'small',
        ...(colorRole ? { colorRole: colorRole as UiAction['colorRole'] } : {}),
        ...(secondary ? { buttonType: 'tonal' } : {}),
      },
    )
  }

  private batchButtons(
    context: UiContext,
    actions: UiAction[],
  ): ReactNode[] {
    if (!actions.length) return []
    if (actions.length === 1) {
      return [this.topbarButton(context, actions[0]!)]
    }
    const label = context.t('action.batchOperation')
    return [
      this.factory.dropDownButton({
        label,
        tooltip: label,
        'aria-label': label,
        class: 'mmda-batch-menu-button',
        buttonType: 'tonal',
        colorRole: 'secondary',
        actions: actions.map((action) => {
          const wired = this.wireAction(context, action)
          return {
            name: wired.name,
            label: wired.label,
            icon: wired.icon,
            onAction: wired.onAction,
          }
        }),
      }),
    ]
  }

  private moreButton(context: UiContext, items: UiAction[]): ReactNode[] {
    if (!items.length) return []
    const label = context.t('action.more')
    return [
      this.factory.moreMenuButton({
        label,
        tooltip: label,
        'aria-label': label,
        buttonType: 'tonal',
        colorRole: 'secondary',
        actions: items.map((item, index) =>
          item.divider
            ? { divider: true }
            : {
                name: item.name ?? `more-${index}`,
                label: item.label,
                icon: item.icon,
                disabled: item.disabled === true,
                onAction: item.onAction,
                items: item.items,
              },
        ),
      }),
    ]
  }

  private wireAction(context: UiContext, action: UiAction): UiAction {
    const name = action.name
    if (name && STANDARD_TOPbar_ACTIONS.has(name)) {
      const wired = this.standardAction(context, name)
      return { ...wired, ...this.pickPresent(action) }
    }
    if (action.onAction) return action
    const next = { ...action }
    next.onAction = () =>
      (context as unknown as { doAction?: (action: UiAction) => unknown }).doAction?.(action)
    const raw =
      next.colorRole ??
      next.role ??
      (next as { displayHint?: string }).displayHint ??
      (next as { param?: { hint?: string | number } }).param?.hint
    next.colorRole =
      normalizeActionColorRole(
        raw == null || raw === '' ? undefined : String(raw),
      ) ?? next.colorRole
    return next
  }

  private pickPresent(action: UiAction): Partial<UiAction> {
    const next: Partial<UiAction> = {}
    if (action.id) next.id = action.id
    if (action.label) next.label = action.label
    if (action.icon) next.icon = action.icon
    if (action.colorRole) next.colorRole = action.colorRole
    if (action.role) next.role = action.role
    if (action.disabled != null) next.disabled = action.disabled
    return next
  }

  private standardAction(context: UiContext, name: string): UiAction {
    const runtime = context as unknown as {
      cancel?: (ctx?: UiContext) => unknown
      confirmAction?: () => unknown
      doAction?: (action: UiAction) => unknown
      importFile?: (options?: Record<string, unknown>) => Promise<unknown>
      importFiles?: (options?: Record<string, unknown>) => Promise<unknown>
      exportFile?: (options?: Record<string, unknown>) => Promise<unknown>
      exportFiles?: (options?: Record<string, unknown>) => Promise<unknown>
      deleteAll?: (ids: string[]) => Promise<unknown>
      print?: () => Promise<unknown>
      many?: boolean
    }
    switch (name) {
      case 'back':
        return {
          name,
          onAction: () =>
            runtime.cancel ? runtime.cancel(context) : context.routeToIndex(),
        }
      case 'create':
        return { name, onAction: () => context.routeToCreate() }
      case 'confirm':
        return { name, onAction: () => runtime.confirmAction?.() }
      case 'cancel':
        return { name, onAction: () => runtime.cancel?.(context) }
      case 'edit':
        return { name, onAction: () => context.routeToEdit() }
      case 'save':
        return {
          name,
          onAction: async () => {
            const result = await context.save()
            const editing = (context as unknown as { editing: boolean }).editing
            if (result !== false && result != null && editing) {
              const entity =
                result && typeof result === 'object'
                  ? (result as Record<string, unknown>)
                  : (context.model as Record<string, unknown>)
              const id = entity?.id ?? (context.model as Record<string, unknown>)?.id
              if (id != null && id !== '') context.routeToDetails(String(id))
            }
            return result
          },
        }
      case 'delete':
        return {
          name,
          onAction: async () => {
            const ok = await this.confirm(context, {
              message: context.t('confirmation.delete', {
                it: context.getModelTitle(),
              }),
            })
            if (ok) return context.delete()
          },
        }
      case 'deleteAll':
        return {
          name,
          colorRole: 'danger',
          onAction: async () => {
            const selected = context.selectedItems ?? []
            if (selected.length === 0) {
              this.toast(context, {
                severity: 'error',
                message: context.t('invalid.requiredSelectAny'),
              })
              return
            }
            const deletable = selected.filter(
              (item) => (item as { deletable?: boolean }).deletable !== false,
            )
            if (deletable.length === 0) {
              this.toast(context, {
                severity: 'error',
                message: context.t('invalid.noDeletable'),
              })
              return
            }
            const ok = await this.confirm(context, {
              message:
                deletable.length === 1
                  ? context.t('confirmation.delete', {
                      it: context.metaUi.displayLabel,
                    })
                  : context.t('confirmation.deleteAll', {
                      it: context.metaUi.displayLabel,
                    }),
            })
            if (!ok) return
            const ids = deletable
              .map((item) => String((item as { id?: unknown }).id))
              .filter((id) => id && id !== 'undefined')
            return runtime.deleteAll?.(ids)
          },
        }
      case 'print':
        return { name, onAction: () => runtime.print?.() }
      case 'import':
        return {
          name,
          onAction: () =>
            runtime.many ? runtime.importFiles?.() : runtime.importFile?.(),
        }
      case 'export':
        return {
          name,
          onAction: () =>
            runtime.many ? runtime.exportFiles?.() : runtime.exportFile?.(),
        }
      case 'refresh':
        return { name, onAction: () => context.refresh(true) }
      default:
        return {
          name,
          onAction: () => runtime.doAction?.({ name } as UiAction),
        }
    }
  }
  buildModuleBreadcrumb(
    context: UiContext,
    props: UiModuleBreadcrumbProps = {},
  ): ReactNode {
    const { module, label } = props
    if (!module) {
      return this.factory.breadcrumb({
        items: [{ label: label || context.title || '' }],
        class: 'mmda-breadcrumb',
      })
    }
    const chain = moduleChain(module)
    const items = chain.map((item, index) => {
      const leaf = index === chain.length - 1 && !label
      return {
        key: item.moduleCode,
        label: item.moduleLabel ?? item.moduleName,
        icon: item.moduleIcon || undefined,
        to: leaf || !item.moduleUrl ? undefined : item.moduleUrl,
      }
    })
    if (label) {
      items.push({
        key: `${module.moduleCode}-title`,
        label,
        icon: undefined,
        to: undefined,
      })
    }
    return this.factory.breadcrumb({
      items,
      class: 'mmda-breadcrumb',
    })
  }
  buildModuleSearchbar(
    context: UiContext,
    props: UiProps = {},
  ): ReactNode {
    return this.factory.textInput({
      placeholder: context.t('action.search'),
      value: context.searchParam?.searchWord ?? '',
      type: 'Search',
      showClearButton: true,
      onChange: (value) => {
        if (!context.searchParam) return
        context.searchParam.searchWord = value
        void context.search()
      },
      ...props,
    } as UiTextInputProps)
  }

  private filterValueText(value: unknown): string {
    if (value == null || value === '') return ''
    return String(value)
  }

  private filterLeafText(
    context: UiContext,
    field: MetaUiField | undefined,
    filter: FieldFilter,
  ): string {
    const rawOp = filter.operator ? context.t(`matcher.${filter.operator}`) : ''
    const operatorText =
      (rawOp === `matcher.${filter.operator}` ? filter.operator : rawOp) ?? ''
    if (filter.filterType === 'set') {
      const values = (filter.values ?? [])
        .map((item) => this.filterValueText(item))
        .filter(Boolean)
      return [operatorText, values.join('、')].filter(Boolean).join(' ')
    }
    if (filter.operator === 'BETWEEN') {
      const from = this.filterValueText(filter.value)
      const to = this.filterValueText(filter.valueTo)
      return [operatorText, [from, to].filter(Boolean).join(' ~ ')]
        .filter(Boolean)
        .join(' ')
    }
    if (
      filter.operator === 'IS_NULL' ||
      filter.operator === 'IS_NOT_NULL' ||
      filter.operator === 'IS_BLANK' ||
      filter.operator === 'IS_NOT_BLANK'
    ) {
      return operatorText
    }
    if (filter.filterType === 'join') {
      const join = operatorText
      return (filter.conditions ?? [])
        .filter((item) => !FieldFilter.isEmpty(item))
        .map((item) => this.filterLeafText(context, field, item))
        .join(` ${join} `)
    }
    if (filter.filterType === 'multi') {
      return (filter.filterModels ?? [])
        .filter((item) => !FieldFilter.isEmpty(item))
        .map((item) => this.filterLeafText(context, field, item))
        .join('；')
    }
    return [operatorText, this.filterValueText(filter.value)]
      .filter(Boolean)
      .join(' ')
  }

  private filterBarChips(context: UiContext): UiChipItem[] {
    const model = context.searchParam?.filterModel
    if (!model) return []
    const chips: UiChipItem[] = []
    for (const [fieldName, filter] of Object.entries(model)) {
      if (FieldFilter.isEmpty(filter)) continue
      const field = context.metaUi.getField(fieldName)
      const title = field?.displayLabel || fieldName
      const detail = this.filterLeafText(context, field, filter)
      chips.push({
        label: detail ? `${title} ${detail}` : title,
        value: fieldName,
      })
    }
    return chips
  }

  private removeFilterBarChip(context: UiContext, fieldName: string): void {
    const param = context.searchParam
    if (!param) return
    const model = { ...(param.filterModel ?? {}) }
    delete model[fieldName]
    writeListFilterModel(param, model)
    void context.search()
  }

  private clearFilterBar(context: UiContext): void {
    const param = context.searchParam
    if (!param) return
    writeListFilterModel(param, {})
    void context.search()
  }

  buildFilterBar(
    context: UiContext,
    props?: UiFilterBarProps<ReactNode>,
  ): ReactNode {
    const modelChips = this.filterBarChips(context)
    const chips =
      modelChips.length > 0
        ? this.factory.chips({
            kind: 'input',
            removable: true,
            outlined: true,
            items: modelChips,
            onRemove: (item) => {
              const name = String(item.value ?? '')
              if (name) this.removeFilterBarChip(context, name)
            },
          })
        : null
    const extra = props?.chips?.()
    const nodes = extra == null ? [] : Array.isArray(extra) ? extra : [extra]
    const clear =
      modelChips.length > 0
        ? this.factory.button({
            class: uiCssClass('list-filter-bar', 'clear'),
            label: context.t('action.clearFilters'),
            buttonType: 'text',
            onClick: () => this.clearFilterBar(context),
          })
        : null
    return createElement(
      'div',
      { className: uiCssClass('list-filter-bar') },
      createElement(
        'span',
        { className: uiCssClass('list-filter-bar', 'title') },
        context.t('action.filter'),
      ),
      chips,
      ...nodes,
      clear,
    )
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
    if (shell === 'tab') {
      // Tab 页内不再镜像标题 / 折叠，页签头已经承担标题。
      return this.renderer.render(
        'div',
        { class: this.groupWrapClass(group, props) },
        Array.isArray(body) ? body : [body],
      )
    }
    return this.factory.card(
      { title: group.groupLabel, class: this.groupWrapClass(group, props) },
      { default: () => [this.wrapGroupContent(body)] },
    )
  }

  // —— 列表页 ————————————————————————————————

  /** 列表数据区：按 `display` / `editable` 选 `factory.list|table|grid|treeGrid`。 */
  protected buildListBody(
    context: UiContext,
    props: UiListViewProps | undefined,
    rows: Entity[],
    selectionMode: UiListViewProps['selectionMode'],
  ): ReactNode {
    const display = props?.display ?? (props?.editable ? 'grid' : 'table')
    const queryWiring = {
      filterModel: context.searchParam?.filterModel,
      onFilterModelChange: (model: FilterModel) => {
        if (!context.searchParam) return
        writeListFilterModel(context.searchParam, model)
        return context.search()
      },
      onSort: (sorts: Sort[]) => {
        if (!context.searchParam) return
        writeListSorts(context.searchParam, sorts)
        return context.search()
      },
    }
    const listProps = {
      ...props,
      rows,
      selectionMode,
      ...queryWiring,
    } as Record<string, unknown>
    switch (display) {
      case 'grid':
        return this.grid(context.metaUi, listProps as UiGridProps<Entity, ReactNode>)
      case 'list':
        return this.list(context.metaUi, listProps as UiListProps<Entity>)
      case 'treeGrid':
        return this.treeGrid(context.metaUi, listProps as UiTreeGridProps<Entity, ReactNode>)
      default:
        return this.table(context.metaUi, listProps as UiTableProps<Entity, ReactNode>)
    }
  }

  /** 分页列表补 `factory.paginator`；改 pager 后走 `context.search()`。 */
  protected buildIndexPaginator(context: UiContext): ReactNode {
    if (!isPagedList(context.model)) return null
    const page = context.model as unknown as PagedList<Entity>
    return this.factory.paginator({
      pagination: page.pagination,
      onPage: async (pager) => {
        const param = context.searchParam
        if (!param) return
        if (!param.pager) param.pager = { pageNo: 1, pageSize: page.pagination.pageSize }
        if (pager.pageSize != null) param.pager.pageSize = pager.pageSize
        if (pager.pageNo != null) param.pager.pageNo = pager.pageNo
        await context.search()
      },
    })
  }

  // —— 插件视图 ——————————————

  buildExplorer<T>(
    context: UiContext,
    props?: UiExplorerProps<T, ReactNode>,
  ): ReactNode {
    const rawTree = props?.treeOption
    const treeOption = typeof rawTree === 'function' ? rawTree() : rawTree
    const tree = treeOption ? this.factory.tree(treeOption) : null
    const rows = Array.isArray(context.model) ? context.model : []
    const listProps = {
      ...(props?.listOption ?? {}),
      rows,
      selectionMode: props?.listOption?.selectionMode ?? context.selectionMode,
    }
    return createElement(
      'div',
      { className: uiCssClass('explorer') },
      tree
        ? createElement(
            'aside',
            { className: uiCssClass('explorer', 'tree') },
            tree,
          )
        : null,
      createElement(
        'div',
        { className: uiCssClass('explorer', 'table') },
        this.table(context.metaUi, listProps as UiTableProps<Entity, ReactNode>),
      ),
    )
  }
}
