import type { MetaUi } from '@mmda/core'
import { UiViewMany } from '@mmda/core'
import type { VuiContext } from '../../contexts/vue_ui_context'

function joinListMetaUi(context: VuiContext<any>): MetaUi | undefined {
  return context.logic?.metaUi ?? context.metaUi
}

export function indexTableMetaUi(context: VuiContext<any>): MetaUi {
  if (context.joinListMode && context.logic?.viewUi) return context.logic.viewUi
  return context.metaUi
}

/** 联查表头：`移料清单.规格` → `.规格`。设置弹窗仍用完整 displayLabel。 */
export function joinListColumnLabel(
  field: { displayLabel?: string } | string | undefined,
  joinListMode = true,
): string {
  const label = typeof field === 'string' ? field : (field?.displayLabel ?? '')
  if (!joinListMode) return label
  const dot = label.lastIndexOf('.')
  return dot >= 0 ? label.slice(dot) : label
}

export async function toggleJoinListMode(context: VuiContext<any>) {
  if (context.joinListMode) {
    context.joinListMode = false
    context.listLayoutRev.value += 1
    await context.search()
    return
  }
  const logic = context.logic
  if (!logic?.metaUiService?.getViewUi || !logic.repository) return
  try {
    const viewUi = await logic.metaUiService.getViewUi({
      repository: logic.repository,
      service: logic.apiService ?? logic.serviceName,
    })
    logic.viewUi = viewUi
    context.joinListMode = true
    context.listLayoutRev.value += 1
    await context.search()
  } catch (err: any) {
    await context.uiBuilder?.toast?.(context, {
      severity: 'error',
      title: context.t('dialog.title.error'),
      message: err?.message ?? context.t('invalid.retry'),
      life: 3000,
    })
  }
}

/** Index more：仅 hasJoinList 时出现；勾选看 context.joinListMode。 */
export function joinListModeMenuItems(context: VuiContext<any>) {
  if (context.view !== UiViewMany.Index) return []
  const metaUi = joinListMetaUi(context)
  if (!metaUi?.hasJoinList?.()) return []
  return [
    {
      name: 'joinListMode',
      label: context.t('action.joinListMode'),
      icon: context.joinListMode ? 'check' : undefined,
      onAction: () => toggleJoinListMode(context),
      command: () => toggleJoinListMode(context),
    },
  ]
}
