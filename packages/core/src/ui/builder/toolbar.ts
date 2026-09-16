import { hasBit } from '../../extensions/number_extensions'
import {
  ModuleActionMode,
  ModuleActionPromptType,
  type Module,
  type ModuleAction,
  type ModuleAuth,
} from '../../metaui/module'
import type { UiAction } from '../action'
import type { UiContext } from '../context'
import type { UiProps } from '../props'
import { UiViewMany } from '../view'

/** 模块面包屑（工具栏 start）。不是 chrome {@link import('../factory/breadcrumb').UiBreadcrumbProps}。 */
export interface UiModuleBreadcrumbProps extends UiProps {
  module?: Module
  /** 模块链后再加一级，例如当前页标题或选中分类。 */
  label?: string
}

/**
 * 模块工具栏三组动作。皮肤只画，不要再写 allowCreate / LIST 位。
 *
 * 画出来从左到右：primary 按钮 → batch（批量）→ more（⋯ 菜单）。
 */
export interface UiToolbarActionGroups {
  /**
   * 常显主按钮，不进菜单。
   * Index：新建；详情：返回 / 编辑 / 删除；编辑页：返回 / 保存。
   */
  primary: UiAction[]
  /**
   * 针对当前勾选行。Index：批量删除、`MULTIPLE_SELECT` 模块动作。
   * 多条收成「批量」下拉；一条就直接按钮。详情 / 编辑页为空。
   */
  batch: UiAction[]
  /**
   * 次要动作，收进 ⋯。
   * 导入 / 导出 / 打印、非多选的 LIST 模块动作、Logic `customActions`。
   */
  more: UiAction[]
}

type ToolbarSession = UiContext & {
  view?: string
  many?: boolean
  selectionMode?: string
  isInDialog?: boolean
  module?: Module
  logic?: { module?: Module }
  customActions?: UiAction[]
  getModuleAuth?: (model: unknown) => ModuleAuth | undefined
}

function sessionOf(context: UiContext): ToolbarSession {
  return context as ToolbarSession
}

export function moduleOf(context: UiContext): Module | undefined {
  const runtime = sessionOf(context)
  return runtime.module ?? runtime.logic?.module
}

export function moduleChain(module: Module): Module[] {
  const chain: Module[] = [module]
  let parent = (module as Module & { parent?: Module }).parent
  while (parent) {
    chain.unshift(parent)
    parent = (parent as Module & { parent?: Module }).parent
  }
  const withoutSystem = chain.filter((item) => item.moduleType !== 'SYSTEM')
  return withoutSystem.length ? withoutSystem : chain
}

export function moduleAuthOf(context: UiContext): ModuleAuth | undefined {
  return moduleOf(context)?.authority
}

function named(
  name: string,
  extras: Partial<UiAction> = {},
): UiAction {
  return { name, id: `${name}-button`, ...extras }
}

function listModuleActions(
  auth: ModuleAuth,
  multipleSelect: boolean,
): ModuleAction[] {
  return (auth.authorizedActions ?? []).filter(
    (action) =>
      hasBit(action.actionModes, ModuleActionMode.LIST) &&
      (multipleSelect
        ? action.promptType === ModuleActionPromptType.MULTIPLE_SELECT
        : action.promptType !== ModuleActionPromptType.MULTIPLE_SELECT),
  )
}

function moduleActionUi(action: ModuleAction): UiAction {
  return {
    id: `${action.actionName}-button`,
    name: action.actionName,
    icon: action.displayIcon,
    label: action.displayLabel,
    role: action.displayHint,
  }
}

function matchingCustomActions(
  auth: ModuleAuth,
  custom: UiAction[] | undefined,
): UiAction[] {
  if (!custom?.length || !auth.authorizedActions?.length) return []
  return custom.filter((action) =>
    auth.authorizedActions!.some((item) => item.actionName === action.name),
  )
}

function inIndexBatchMode(runtime: ToolbarSession): boolean {
  return (
    runtime.view === UiViewMany.SelectMany ||
    runtime.view === UiViewMany.EditMany ||
    runtime.selectionMode === 'multiple'
  )
}

/** 列表页（Index / Select）工具栏动作。 */
export function resolveIndexToolbarActions(
  context: UiContext,
): UiToolbarActionGroups {
  const runtime = sessionOf(context)
  const empty: UiToolbarActionGroups = { primary: [], batch: [], more: [] }
  const auth = moduleAuthOf(context)
  if (inIndexBatchMode(runtime)) {
    if (runtime.isInDialog) {
      return {
        primary: auth?.allowCreate ? [named('create')] : [],
        batch: [],
        more: [],
      }
    }
    return {
      primary: [named('cancel'), named('confirm')],
      batch: [],
      more: [],
    }
  }
  if (!auth) return empty

  const primary: UiAction[] = []
  const batch: UiAction[] = []
  const more: UiAction[] = []
  if (auth.allowCreate) primary.push(named('create'))
  if (auth.allowImport) more.push(named('import'))
  if (auth.allowExport) more.push(named('export'))
  if (auth.allowPrint) more.push(named('print'))
  if (auth.allowDelete) {
    batch.push(named('deleteAll', { colorRole: 'danger' }))
  }
  batch.push(...listModuleActions(auth, true).map(moduleActionUi))
  more.push(...listModuleActions(auth, false).map(moduleActionUi))
  more.push(...matchingCustomActions(auth, runtime.customActions))
  return { primary, batch, more }
}

/** 详情页工具栏动作。 */
export function resolveDetailsToolbarActions(
  context: UiContext,
): UiToolbarActionGroups {
  const runtime = sessionOf(context)
  const auth =
    runtime.getModuleAuth?.(runtime.model) ?? moduleAuthOf(context)
  const primary: UiAction[] = [named('back')]
  const more: UiAction[] = []
  if (!auth) return { primary, batch: [], more }
  const model = runtime.model as { editable?: boolean; deletable?: boolean; actions?: UiAction[] }
  if (auth.allowEdit && model?.editable !== false) primary.push(named('edit'))
  if (auth.allowCreate) primary.push(named('create'))
  if (auth.allowDelete && model?.deletable !== false) primary.push(named('delete'))
  if (model?.actions?.length) primary.push(...model.actions)
  primary.push(...matchingCustomActions(auth, runtime.customActions))
  if (auth.allowPrint) more.push(named('print'))
  if (auth.allowExport) more.push(named('export'))
  if (auth.allowImport) more.push(named('import'))
  return { primary, batch: [], more }
}

/** 编辑/新建页工具栏动作。 */
export function resolveEditToolbarActions(
  context: UiContext,
): UiToolbarActionGroups {
  const runtime = sessionOf(context)
  const auth = moduleAuthOf(context)
  const primary: UiAction[] = [named('back')]
  if (auth?.allowImport) primary.push(named('import'))
  primary.push(named('save'))
  if (auth) primary.push(...matchingCustomActions(auth, runtime.customActions))
  return { primary, batch: [], more: [] }
}
