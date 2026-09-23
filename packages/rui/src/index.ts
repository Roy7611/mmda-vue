// @mmda/rui — React UI runtime for MMDA

// P1：适配层
export { reactRenderProps } from './render_props'

// P2：布局 + 插件宿主 + 响应式 + 会话
export { RuiLayout } from './ui/layout'
export { ReactPluginHost } from './ui/plugins/host'
export { useRuiContext } from './reactivity'
export { RuiContext } from './contexts/react_ui_context'
export { MmdaReactApp } from './app/app'
export type { RuiContextOptions } from './contexts/react_ui_context'
export { RuiBuilder } from './ui/builder'
export { RuiFactory } from './ui/factory'
export { RuiFieldFactory } from './ui/field_factory'
