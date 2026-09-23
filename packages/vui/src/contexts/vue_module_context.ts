import type { InjectionKey } from 'vue'
import type { ModuleContext } from '@mmda/core'

/** core ModuleContext 的 Vue 侧别名（Index ↔ One 列表保活同步）。 */
export type VueModuleContext = ModuleContext

export { createModuleContext } from '@mmda/core'

export const MODULE_CONTEXT_KEY = Symbol(
  'VueModuleContext',
) as InjectionKey<VueModuleContext>

const moduleContexts = new WeakMap<object, VueModuleContext>()

/** 在 EntityView open 时把工作区 VueModuleContext 挂到 context，供 mixin 使用（非 setup 无法 inject）。 */
export function bindModuleContext(
  context: object,
  module: VueModuleContext | null | undefined,
) {
  if (module) {
    moduleContexts.set(context, module)
    ;(context as { moduleContext?: ModuleContext }).moduleContext = module
  } else {
    moduleContexts.delete(context)
    ;(context as { moduleContext?: ModuleContext }).moduleContext = undefined
  }
}

export function getModuleContext(
  context: object,
): VueModuleContext | undefined {
  return moduleContexts.get(context)
}
