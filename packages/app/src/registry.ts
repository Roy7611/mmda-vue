import { AppPluginRegistry } from './host'
import { hostedPlugin } from './view_adapter'
import { basePlugin } from '@mmda/base/src/plugin'
import { mesPlugin } from '@mmda/mes/src/plugin'

export const appPluginRegistry = new AppPluginRegistry()

// base / mes 的首页与占位页都是框架无关视图 → 统一过宿主适配（包成 Vue 组件）。
// 其余 `resolveCustomView` 还是 Vue 组件，原样带过去。
appPluginRegistry.register(hostedPlugin(basePlugin))
appPluginRegistry.register(hostedPlugin(mesPlugin))
