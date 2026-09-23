/*
 * 页头 Topbar：壳、槽布局、动作绘制。不是 factory.toolbar。
 */
import {
  indexTopbarLayoutOf,
  indexTopbarModifierClasses,
  indexTopbarSlotAlignOf,
  indexTopbarSlotModifierClasses,
  moduleChain,
  moduleOf,
  resolveDetailsTopbarActions,
  resolveEditTopbarActions,
  resolveIndexTopbarActions,
  twoSlotTopbarModifierClasses,
  twoSlotTopbarSlotModifierClasses,
  uiCssClass,
  type UiClassValue,
  type UiDetailsTopbarProps,
  type UiDetailsTopbarSlots,
  type UiEditTopbarProps,
  type UiEditTopbarSlots,
  type UiHorzAlign,
  type UiIndexTopbarLayout,
  type UiIndexTopbarProps,
  type UiIndexTopbarSlotName,
  type UiIndexTopbarSlots,
  type UiTopbarActionGroups,
  type UiTwoSlotTopbarSlotName,
  uiRenderProps
} from '@mmda/core'
import { defineComponent, h, type VNode, type VNodeChild } from 'vue'
import { useCompactViewport } from '../../composables/useCompactViewport'
import type { VuiBuilder } from '../builder'
import type { UiAction } from '../factory/action'
import type { VuiFactory } from '../factory'
import type { VuiTileSlots } from '../layout'
import type { VuiActionFactory } from './actions'
import type { UiContext } from './helpers'
import { joinListModeMenuItems } from './join_list_mode'

export type {
  UiDetailsTopbarProps,
  UiDetailsTopbarSlots,
  UiEditTopbarProps,
  UiEditTopbarSlots,
  UiIndexTopbarProps,
  UiIndexTopbarLayout,
  UiIndexTopbarSlotName,
  UiIndexTopbarSlots,
  UiTopbarActionGroups,
} from '@mmda/core'

export {
  indexTopbarLayoutOf,
  indexTopbarModifierClasses,
  indexTopbarSlotAlignOf,
  indexTopbarSlotModifierClasses,
  resolveDetailsTopbarActions,
  resolveEditTopbarActions,
  resolveIndexTopbarActions,
  twoSlotTopbarModifierClasses,
  twoSlotTopbarSlotAlignOf,
  twoSlotTopbarSlotModifierClasses,
} from '@mmda/core'

export function topbarSlotJustifyContent(align: UiHorzAlign): string {
  if (align === 'center') return 'center'
  if (align === 'right') return 'flex-end'
  return 'flex-start'
}

export function indexTopbarHasCenter(
  slots?: UiIndexTopbarSlots<VNodeChild>,
): boolean {
  return typeof slots?.center === 'function'
}

export function indexTopbarRootStyle(
  slots?: UiIndexTopbarSlots<VNodeChild>,
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

export function indexTopbarSlotStyle(
  props: UiIndexTopbarProps = {},
  slot: UiIndexTopbarSlotName,
): Record<string, string> {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: topbarSlotJustifyContent(indexTopbarSlotAlignOf(props, slot)),
    minWidth: '0',
  }
}

function twoSlotRootStyle(): Record<string, string> {
  return {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    width: '100%',
    minWidth: '0',
  }
}

function twoSlotStyle(
  props: UiDetailsTopbarProps,
  slot: UiTwoSlotTopbarSlotName,
): Record<string, string> {
  const align = slot === 'end' ? (props.align?.end ?? 'right') : (props.align?.start ?? 'left')
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: topbarSlotJustifyContent(
      align === 'center' || align === 'right' || align === 'left' ? align : slot === 'end' ? 'right' : 'left',
    ),
    minWidth: '0',
  }
}

export function renderIndexTopbar(
  props: UiIndexTopbarProps = {},
  slots?: UiIndexTopbarSlots<VNodeChild>,
): VNode {
  const {
    align: _align,
    layout: _layout,
    showBreadcrumb: _showBreadcrumb,
    showActions: _showActions,
    showSearchBar: _showSearchBar,
    breadcrumbLeaf: _breadcrumbLeaf,
    onSearchPage: _onSearchPage,
    htmlAttributes: _htmlAttributes,
    class: _className,
    ...rest
  } = props
  const names: UiIndexTopbarSlotName[] = ['start', 'center', 'end']
  return h(
    'div',
    {
      ...rest,
      ...uiRenderProps(props).attributes,
      class: indexTopbarModifierClasses(props, slots),
      style: { ...indexTopbarRootStyle(slots), ...(props.style as object) },
    },
    names.map((slot) => {
      if (slot === 'center' && !indexTopbarHasCenter(slots)) {
        return h('div', {
          class: indexTopbarSlotModifierClasses(props, slot),
          style: indexTopbarSlotStyle(props, slot),
        })
      }
      return h(
        'div',
        {
          class: indexTopbarSlotModifierClasses(props, slot),
          style: indexTopbarSlotStyle(props, slot),
        },
        slots?.[slot]?.() as any,
      )
    }),
  )
}

function renderTwoSlotTopbar(
  block: 'details-topbar' | 'edit-topbar',
  props: UiDetailsTopbarProps = {},
  slots?: UiDetailsTopbarSlots<VNodeChild>,
): VNode {
  const {
    align: _align,
    showBreadcrumb: _showBreadcrumb,
    showActions: _showActions,
    breadcrumbLeaf: _breadcrumbLeaf,
    htmlAttributes: _htmlAttributes,
    class: _className,
    ...rest
  } = props
  const names: UiTwoSlotTopbarSlotName[] = ['start', 'end']
  return h(
    'div',
    {
      ...rest,
      ...uiRenderProps(props).attributes,
      class: twoSlotTopbarModifierClasses(block, props),
      style: { ...twoSlotRootStyle(), ...(props.style as object) },
    },
    names.map((slot) =>
      h(
        'div',
        {
          class: twoSlotTopbarSlotModifierClasses(block, props, slot),
          style: twoSlotStyle(props, slot),
        },
        slots?.[slot]?.() as any,
      ),
    ),
  )
}

export function renderDetailsTopbar(
  props: UiDetailsTopbarProps = {},
  slots?: UiDetailsTopbarSlots<VNodeChild>,
): VNode {
  return renderTwoSlotTopbar('details-topbar', props, slots)
}

export function renderEditTopbar(
  props: UiEditTopbarProps = {},
  slots?: UiEditTopbarSlots<VNodeChild>,
): VNode {
  return renderTwoSlotTopbar('edit-topbar', props, slots)
}

export function defaultTopbarMoreActions(
  actionFactory: VuiActionFactory,
  context: any,
): UiAction[] {
  if (context?.editing) {
    return [actionFactory.save(context), actionFactory.cancel(context)]
  }
  if (context?.many) {
    return [actionFactory.create(context)]
  }
  return [actionFactory.back(context), actionFactory.edit(context)]
}

export type TopbarPaintParts = {
  className?: UiClassValue
  breadcrumb: () => VNodeChild
  actionGroup: (dense?: boolean) => VNodeChild
  moreActions: () => UiAction[]
  navActions: () => UiAction[]
  openSearchPage: () => void
}

type TopbarKind = 'index' | 'details' | 'edit'

type TopbarHostProps = {
  factory: VuiFactory
  context: { title?: string; t: (message: string) => string }
  topbarProps: UiIndexTopbarProps | UiDetailsTopbarProps | UiEditTopbarProps
  slots?: VuiTileSlots
  parts: TopbarPaintParts
  kind: TopbarKind
}

/**
 * 顶栏档位：`layout` 显式给了就钉死（`medium` / `compact` / `full` 都算显式，宿主说了算）；
 * 没给才按视口定档，窄视口降为 compact —— 移动端的搜索入口（放大镜 → 搜索页）只在
 * compact 档存在，默认全档会让它不可达。
 */
function resolvedIndexTopbarLayout(
  props: UiIndexTopbarProps,
  dense: boolean,
): UiIndexTopbarLayout {
  if (props.layout) return indexTopbarLayoutOf(props)
  return dense ? 'compact' : 'full'
}

function paintIndexTopbarTree(
  factory: VuiFactory,
  context: { title?: string; t: (message: string) => string },
  props: UiIndexTopbarProps,
  slots: VuiTileSlots | undefined,
  parts: TopbarPaintParts,
  dense: boolean,
): VNode {
  const layout = resolvedIndexTopbarLayout(props, dense)
  const showBreadcrumb = props.showBreadcrumb !== false
  const showActions = props.showActions !== false
  const showSearchBar = props.showSearchBar !== false
  const t = (key: string) => context.t(key)
  const searchCenter =
    showSearchBar && slots?.center ? () => slots.center!() : undefined

  const startFull = () => {
    if (!showBreadcrumb) return undefined
    if (slots?.default) return slots.default()
    return parts.breadcrumb()
  }

  const moreMenu = () =>
    factory.moreMenuButton(
      {
        icon: factory.resolveIcon('more'),
        label: dense ? '' : t('action.more'),
        tooltip: t('action.more'),
        'aria-label': t('action.more'),
        hideCaret: dense,
        buttonType: 'tonal',
        colorRole: 'secondary',
        actions: parts.moreActions(),
      },
    )

  const compactMenu = () =>
    factory.dropDownButton(
      {
        icon: factory.resolveIcon('more'),
        tooltip: t('action.more'),
        buttonType: 'text',
        hideCaret: true,
        actions: [...parts.navActions(), ...parts.moreActions()],
      },
    )

  const magnifier = () =>
    factory.button({
      icon: factory.resolveIcon('search'),
      tooltip: t('action.search'),
      buttonType: 'text',
      onClick: () => parts.openSearchPage(),
    })

  let start: (() => VNodeChild) | undefined
  let center: (() => VNodeChild) | undefined
  let end: (() => VNodeChild) | undefined

  if (layout === 'compact') {
    start = showBreadcrumb || showActions ? compactMenu : undefined
    center = () => h('strong', context.title ?? '')
    end = showSearchBar ? magnifier : undefined
  } else if (layout === 'medium') {
    start = startFull
    center = searchCenter
    end = showActions ? moreMenu : undefined
  } else {
    start = startFull
    center = searchCenter
    end = showActions ? () => parts.actionGroup(dense) : undefined
  }

  return renderIndexTopbar(
    {
      layout,
      class: [
        parts.className,
        dense ? uiCssClass('index-topbar', undefined, 'dense') : undefined,
      ],
    },
    { start, center, end },
  )
}

function paintTwoSlotTopbarTree(
  kind: 'details' | 'edit',
  _factory: VuiFactory,
  _context: { title?: string; t: (message: string) => string },
  props: UiDetailsTopbarProps | UiEditTopbarProps,
  slots: VuiTileSlots | undefined,
  parts: TopbarPaintParts,
  dense: boolean,
): VNode {
  const showBreadcrumb = props.showBreadcrumb !== false
  const showActions = props.showActions !== false
  const start = () => {
    if (!showBreadcrumb) return undefined
    if (slots?.default) return slots.default()
    return parts.breadcrumb()
  }
  const end = showActions ? () => parts.actionGroup(dense) : undefined
  const className = [
    parts.className,
    dense
      ? uiCssClass(
          kind === 'edit' ? 'edit-topbar' : 'details-topbar',
          undefined,
          'dense',
        )
      : undefined,
  ]
  const shellProps = { class: className }
  const shellSlots = { start, end }
  return kind === 'edit'
    ? renderEditTopbar(shellProps, shellSlots)
    : renderDetailsTopbar(shellProps, shellSlots)
}

const MmdaModuleTopbarHost = defineComponent({
  name: 'MmdaModuleTopbar',
  props: {
    factory: { type: Object, required: true },
    context: { type: Object, required: true },
    topbarProps: { type: Object, required: true },
    slots: { type: Object, default: undefined },
    parts: { type: Object, required: true },
    kind: { type: String, required: true },
  },
  setup(rawProps) {
    const compact = useCompactViewport()
    return () => {
      const props = rawProps as unknown as TopbarHostProps
      if (props.kind === 'index') {
        return paintIndexTopbarTree(
          props.factory,
          props.context,
          props.topbarProps as UiIndexTopbarProps,
          props.slots,
          props.parts,
          compact.value,
        )
      }
      return paintTwoSlotTopbarTree(
        props.kind,
        props.factory,
        props.context,
        props.topbarProps as UiDetailsTopbarProps,
        props.slots,
        props.parts,
        compact.value,
      )
    }
  },
})

export function paintModuleTopbar(
  factory: VuiFactory,
  context: { title?: string; t: (message: string) => string },
  props: UiIndexTopbarProps | UiDetailsTopbarProps | UiEditTopbarProps,
  slots: VuiTileSlots | undefined,
  parts: TopbarPaintParts,
  kind: TopbarKind = 'index',
): VNode {
  return h(MmdaModuleTopbarHost, {
    factory,
    context,
    topbarProps: props,
    slots,
    parts,
    kind,
  } as any)
}

const STANDARD = new Set([
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
])

function wireAction(builder: VuiBuilder, context: UiContext, action: UiAction): UiAction {
  const name = action.name
  if (name && STANDARD.has(name)) {
    const make = (builder.actionFactory as unknown as Record<string, (ctx: UiContext) => UiAction>)[name]
    if (typeof make === 'function') {
      return { ...make.call(builder.actionFactory, context), ...pickPresent(action) }
    }
  }
  if (action.onAction) return action
  return builder.actionFactory.action(context, action as never)
}

function pickPresent(action: UiAction): Partial<UiAction> {
  const next: Partial<UiAction> = {}
  if (action.id) next.id = action.id
  if (action.label) next.label = action.label
  if (action.icon) next.icon = action.icon
  if (action.colorRole) next.colorRole = action.colorRole
  if (action.role) next.role = action.role
  if (action.disabled != null) next.disabled = action.disabled
  return next
}

function topbarButton(
  builder: VuiBuilder,
  context: UiContext,
  action: UiAction,
  dense: boolean,
): VNode {
  const wired = wireAction(builder, context, action)
  const label =
    wired.label ??
    (wired.name ? context.t(`action.${wired.name}`) : wired.name)
  const colorRole = (wired.colorRole ?? wired.role)?.toString().toLowerCase()
  const secondary = colorRole === 'secondary'
  return builder.factory.actionButton(
    wired,
    (message) => context.t(message),
    false,
    {
      size: 'small',
      ...(colorRole ? { colorRole: colorRole as UiAction['colorRole'] } : {}),
      ...(secondary ? { buttonType: 'tonal' } : {}),
      ...(dense
        ? { label: '', tooltip: wired.tooltip ?? label, 'aria-label': label }
        : {}),
    },
  )
}

function moreButton(
  factory: VuiFactory,
  context: UiContext,
  items: Array<UiAction & { divider?: boolean }>,
  dense: boolean,
): VNode[] {
  if (!items.length) return []
  const moreLabel = context.t('action.more')
  return [
    factory.moreMenuButton(
      {
        icon: factory.resolveIcon('more'),
        label: dense ? '' : moreLabel,
        tooltip: moreLabel,
        'aria-label': moreLabel,
        hideCaret: dense,
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
      },
    ),
  ]
}

function batchButtons(
  builder: VuiBuilder,
  context: UiContext,
  actions: UiAction[],
  dense: boolean,
): VNode[] {
  if (!actions.length) return []
  if (actions.length === 1) {
    return [topbarButton(builder, context, actions[0]!, dense)]
  }
  const batchLabel = context.t('action.batchOperation')
  return [
    builder.factory.dropDownButton(
      {
        label: dense ? '' : batchLabel,
        icon: dense
          ? builder.factory.resolveIcon(actions[0]?.icon ?? 'more')
          : undefined,
        tooltip: batchLabel,
        'aria-label': batchLabel,
        hideCaret: dense,
        class: 'mmda-batch-menu-button',
        buttonType: 'tonal',
        colorRole: 'secondary',
        actions: actions.map((action) => {
          const wired = wireAction(builder, context, action)
          return {
            name: wired.name,
            label: wired.label,
            icon: wired.icon,
            onAction: wired.onAction,
          }
        }),
      },
    ),
  ]
}

function paintGroups(
  builder: VuiBuilder,
  context: UiContext,
  props: UiIndexTopbarProps | UiDetailsTopbarProps | UiEditTopbarProps,
  slots: VuiTileSlots | undefined,
  groups: UiTopbarActionGroups,
  extraMore: UiAction[] = [],
  kind: TopbarKind = 'index',
): VNode {
  const module = moduleOf(context)
  const runtime = context as { many?: boolean; title?: string }
  return paintModuleTopbar(
    builder.factory,
    context,
    props,
    slots,
    {
    breadcrumb: () =>
      builder.buildModuleBreadcrumb(context, {
        module,
        label: props.breadcrumbLeaf || (runtime.many ? '' : context.title ?? ''),
      }),
    actionGroup: (dense) => {
      const moreItems: UiAction[] = [
        ...groups.more.map((action) => wireAction(builder, context, action)),
        ...extraMore.map((action) => ({
          ...action,
          onAction: action.onAction ?? (action as { command?: UiAction['onAction'] }).command,
        })),
      ]
      const children: VNode[] = [
        ...groups.primary.map((action) =>
          topbarButton(builder, context, action, dense === true),
        ),
        ...batchButtons(builder, context, groups.batch, dense === true),
        ...moreButton(builder.factory, context, moreItems, dense === true),
      ]
      return builder.factory.buttonGroup(
        {
          class: uiCssClass('topbar-actions'),
          role: 'group',
        },
        { default: () => children },
      )
    },
    moreActions: () => defaultTopbarMoreActions(builder.actionFactory, context),
    navActions: () =>
      module
        ? moduleChain(module).map((item) => ({
            name: item.moduleCode,
            label: item.moduleLabel ?? item.moduleName,
            icon: item.moduleIcon,
          }))
        : [],
    openSearchPage: () => {
      // 缺省进搜索页路由（`UiViewOne.Search`）：移动端全屏页，桌面端右侧抽屉由承载决定
      if ('onSearchPage' in props && props.onSearchPage) props.onSearchPage()
      else context.routeToSearch()
    },
    },
    kind,
  )
}

export function paintIndexTopbar(
  builder: VuiBuilder,
  context: UiContext,
  props: UiIndexTopbarProps = {},
  slots?: VuiTileSlots,
  extraMore: UiAction[] = [],
): VNode {
  const joinItems = joinListModeMenuItems(context as never).map((item) => ({
    name: item.name,
    label: item.label,
    icon: item.icon ? builder.factory.resolveIcon(item.icon) : undefined,
    onAction: item.command ?? item.onAction,
  }))
  const more = extraMore.length || joinItems.length
    ? [
        ...extraMore,
        ...(extraMore.length && joinItems.length
          ? [{ name: 'divider', divider: true } as UiAction]
          : []),
        ...joinItems,
      ]
    : extraMore
  return paintGroups(
    builder,
    context,
    props,
    slots,
    resolveIndexTopbarActions(context),
    more,
    'index',
  )
}

export function paintDetailsTopbar(
  builder: VuiBuilder,
  context: UiContext,
  props: UiDetailsTopbarProps = {},
  slots?: VuiTileSlots,
  extraMore: UiAction[] = [],
): VNode {
  return paintGroups(
    builder,
    context,
    props,
    slots,
    resolveDetailsTopbarActions(context),
    extraMore,
    'details',
  )
}

export function paintEditTopbar(
  builder: VuiBuilder,
  context: UiContext,
  props: UiEditTopbarProps = {},
  slots?: VuiTileSlots,
  extraMore: UiAction[] = [],
): VNode {
  const groups = resolveEditTopbarActions(context)
  const uploading = (context as { uploading?: { value?: boolean } }).uploading?.value
  if (uploading) {
    const save = groups.primary.find((action) => action.name === 'save')
    if (save) save.disabled = true
  }
  return paintGroups(builder, context, props, slots, groups, extraMore, 'edit')
}
