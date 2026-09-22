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
import { uiRenderProps, type UiRenderProps } from '@mmda/core'
import { ReactUiContext } from '../contexts/react_ui_context'

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
  buildDetailsView(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildDetailsView']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildDetailsView']> {
    throw new Error('UiBuilder.buildDetailsView requires a skin package (@mmda/rui-*).')
  }
  buildEditView(
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildEditView']>[1],
  ): ReturnType<UiBuilder<ReactNode>['buildEditView']> {
    throw new Error('UiBuilder.buildEditView requires a skin package (@mmda/rui-*).')
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
  buildFieldGroup(
    group: Parameters<UiBuilder<ReactNode>['buildFieldGroup']>[0],
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildFieldGroup']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildFieldGroup']> {
    throw new Error('UiBuilder.buildFieldGroup requires a skin package (@mmda/rui-*).')
  }
  buildSubGroup(
    group: Parameters<UiBuilder<ReactNode>['buildSubGroup']>[0],
    context: UiContext,
    props?: Parameters<UiBuilder<ReactNode>['buildSubGroup']>[2],
  ): ReturnType<UiBuilder<ReactNode>['buildSubGroup']> {
    throw new Error('UiBuilder.buildSubGroup requires a skin package (@mmda/rui-*).')
  }

  // —— 插件视图 ——————————————

  buildExplorer<T>(
    _context: UiContext,
    _props?: UiExplorerProps<T, ReactNode>,
  ): ReactNode {
    throw new Error('UiBuilder.buildExplorer requires a skin package (@mmda/rui-*).')
  }
}
