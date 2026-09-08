import type { EntityAction, UiContext } from '@mmda/core'

interface PropsData {
  title?: string
  message?: string
}

export const ConfirmFn = async (
  context: UiContext,
  action: EntityAction,
  repositoryName: string,
  props?: PropsData,
) => {
  const ok = await context.uiBuilder.confirm(context, {
    title: props?.title,
    message: props?.message ?? '',
  })
  if (!ok) return false
  return true
}
