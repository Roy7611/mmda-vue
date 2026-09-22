import { createElement, type ReactNode } from 'react'
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
import { ReactPluginHost } from './plugins/host'
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
export class ReactUiBuilder extends ReactPluginHost implements UiBuilder<ReactNode> {

  constructor(
    public readonly factory: UiFactory<ReactNode>,
    public readonly fieldFactory: UiFieldFactory<ReactNode>,
  ) {
    super()
  }

  // —— 列表 / 表族（元数据驱动） ————

  list = UNIMPLEMENTED('list') as UiBuilder['list']
  table = UNIMPLEMENTED('table') as UiBuilder['table']
  grid = UNIMPLEMENTED('grid') as UiBuilder['grid']
  treeGrid = UNIMPLEMENTED('treeGrid') as UiBuilder['treeGrid']

  editFor(_field: MetaUiField, _context: UiContext): ReactNode {
    throw new Error('editFor requires fieldFactory + skin')
  }

  displayFor(_field: MetaUiField, _context: UiContext): ReactNode {
    throw new Error('displayFor requires fieldFactory + skin')
  }

  // —— Overlay ————————————————

  toast = noToast as UiBuilder['toast']
  message = noMessage as UiBuilder['message']
  confirm = noConfirm as UiBuilder['confirm']
  dialog = noDialog as UiBuilder['dialog']
  editDialog = UNIMPLEMENTED('editDialog') as UiBuilder['editDialog']
  detailsDialog = UNIMPLEMENTED('detailsDialog') as UiBuilder['detailsDialog']
  selectDialog = UNIMPLEMENTED('selectDialog') as UiBuilder['selectDialog']
  openNestEntityDialog = UNIMPLEMENTED('openNestEntityDialog') as UiBuilder['openNestEntityDialog']

  // —— 拼屏 ————————————————

  buildAppSideMenu = UNIMPLEMENTED('buildAppSideMenu') as UiBuilder['buildAppSideMenu']
  buildSigninForm = UNIMPLEMENTED('buildSigninForm') as UiBuilder['buildSigninForm']
  buildSignupForm = UNIMPLEMENTED('buildSignupForm') as UiBuilder['buildSignupForm']
  buildIndexView = UNIMPLEMENTED('buildIndexView') as UiBuilder['buildIndexView']
  buildSelectView = UNIMPLEMENTED('buildSelectView') as UiBuilder['buildSelectView']
  buildDetailsView = UNIMPLEMENTED('buildDetailsView') as UiBuilder['buildDetailsView']
  buildEditView = UNIMPLEMENTED('buildEditView') as UiBuilder['buildEditView']
  buildSearchField = UNIMPLEMENTED('buildSearchField') as UiBuilder['buildSearchField']
  buildIndexTopbar = UNIMPLEMENTED('buildIndexTopbar') as UiBuilder['buildIndexTopbar']
  buildDetailsTopbar = UNIMPLEMENTED('buildDetailsTopbar') as UiBuilder['buildDetailsTopbar']
  buildEditTopbar = UNIMPLEMENTED('buildEditTopbar') as UiBuilder['buildEditTopbar']
  buildModuleBreadcrumb = UNIMPLEMENTED('buildModuleBreadcrumb') as UiBuilder['buildModuleBreadcrumb']
  buildModuleSearchbar = UNIMPLEMENTED('buildModuleSearchbar') as UiBuilder['buildModuleSearchbar']
  buildFilterBar = UNIMPLEMENTED('buildFilterBar') as UiBuilder['buildFilterBar']
  buildFieldGroup = UNIMPLEMENTED('buildFieldGroup') as UiBuilder['buildFieldGroup']
  buildSubGroup = UNIMPLEMENTED('buildSubGroup') as UiBuilder['buildSubGroup']

  // —— 插件视图 ——————————————

  buildExplorer = UNIMPLEMENTED('buildExplorer') as UiBuilder['buildExplorer']
}
