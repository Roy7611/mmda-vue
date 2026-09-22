// @mmda/rui — React UI runtime for MMDA

// P1：适配层
export { reactRenderProps } from './render_props'

// P2：布局 + 插件宿主 + 响应式 + 会话
export { ReactUiLayout } from './ui/layout'
export { mixPluginHost, ReactPluginHost } from './ui/plugins/host'
export { useReactUiContext } from './reactivity'
export { ReactUiContext } from './contexts/react_ui_context'
export { MmdaReactApp } from './app/app'
export type { RuiContextOptions } from './contexts/react_ui_context'
export { ReactUiBuilder } from './ui/builder'
export { ReactUiFactory } from './ui/factory'
