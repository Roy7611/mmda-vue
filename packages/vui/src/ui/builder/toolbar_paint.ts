import { h, type VNode } from 'vue'
import {
  moduleChain,
  moduleOf,
  resolveDetailsToolbarActions,
  resolveEditToolbarActions,
  resolveIndexToolbarActions,
  type UiToolbarActionGroups,
} from '@mmda/core'
import type { UiAction } from '../factory/action'
import type { UiFactory } from '../factory'
import { uiCssClass } from '@mmda/core'
import type { ModuleToolbarProps } from '../../app/app'
import type { UiContext } from './helpers'
import type { VueUiBuilder } from '../builder'
import type { UiSlots } from '../layout'
import { defaultToolbarMoreActions, paintModuleToolbar } from './module_toolbar'
import { joinListModeMenuItems } from './join_list_mode'

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

function wireAction(builder: VueUiBuilder, context: UiContext, action: UiAction): UiAction {
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

function toolbarButton(
  builder: VueUiBuilder,
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
  factory: UiFactory,
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
      },
      items.map((item, index) =>
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
    ),
  ]
}

function batchButtons(
  builder: VueUiBuilder,
  context: UiContext,
  actions: UiAction[],
  dense: boolean,
): VNode[] {
  if (!actions.length) return []
  if (actions.length === 1) {
    return [toolbarButton(builder, context, actions[0]!, dense)]
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
      },
      actions.map((action) => {
        const wired = wireAction(builder, context, action)
        return {
          name: wired.name,
          label: wired.label,
          icon: wired.icon,
          onAction: wired.onAction,
        }
      }),
    ),
  ]
}

function paintGroups(
  builder: VueUiBuilder,
  context: UiContext,
  props: ModuleToolbarProps,
  slots: UiSlots | undefined,
  groups: UiToolbarActionGroups,
  extraMore: UiAction[] = [],
): VNode {
  const module = moduleOf(context)
  const runtime = context as { many?: boolean; title?: string }
  return paintModuleToolbar(builder.factory, context, props, slots, {
    breadcrumb: () => {
      if (module) {
        return builder.buildModuleBreadcrumb(context, {
          module,
          label: props.breadcrumbLeaf || (runtime.many ? '' : context.title ?? ''),
        })
      }
      return h('strong', context.title)
    },
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
          toolbarButton(builder, context, action, dense === true),
        ),
        ...batchButtons(builder, context, groups.batch, dense === true),
        ...moreButton(builder.factory, context, moreItems, dense === true),
      ]
      return builder.factory.buttonGroup(() => children, {
        class: uiCssClass('toolbar-actions'),
        role: 'group',
      })
    },
    moreActions: () => defaultToolbarMoreActions(builder.actionFactory, context),
    navActions: () =>
      module
        ? moduleChain(module).map((item) => ({
            name: item.moduleCode,
            label: item.moduleLabel ?? item.moduleName,
            icon: item.moduleIcon,
          }))
        : [],
    openSearchPage: () => {
      if (props.onSearchPage) props.onSearchPage()
      else void builder.buildSearchView(context)
    },
  })
}

export function paintIndexToolbar(
  builder: VueUiBuilder,
  context: UiContext,
  props: ModuleToolbarProps = {},
  slots?: UiSlots,
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
    resolveIndexToolbarActions(context),
    more,
  )
}

export function paintDetailsToolbar(
  builder: VueUiBuilder,
  context: UiContext,
  props: ModuleToolbarProps = {},
  slots?: UiSlots,
  extraMore: UiAction[] = [],
): VNode {
  return paintGroups(
    builder,
    context,
    props,
    slots,
    resolveDetailsToolbarActions(context),
    extraMore,
  )
}

export function paintEditToolbar(
  builder: VueUiBuilder,
  context: UiContext,
  props: ModuleToolbarProps = {},
  slots?: UiSlots,
  extraMore: UiAction[] = [],
): VNode {
  const groups = resolveEditToolbarActions(context)
  const uploading = (context as { uploading?: { value?: boolean } }).uploading?.value
  if (uploading) {
    const save = groups.primary.find((action) => action.name === 'save')
    if (save) save.disabled = true
  }
  return paintGroups(builder, context, props, slots, groups, extraMore)
}
