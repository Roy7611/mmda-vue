import { AppPluginRegistry, type AppPlugin } from './host'
import { hostedPlugin } from './view_adapter'
import { basePlugin } from '@mmda/base/src/plugin'
import { mesPlugin } from '@mmda/mes/src/plugin'

export const appPluginRegistry = new AppPluginRegistry()

// base 的页面是框架无关视图 → 宿主包成 Vue 组件；mes 的页面还是 Vue 组件 → 原样注册。
appPluginRegistry.register(hostedPlugin(basePlugin))
appPluginRegistry.register(mesPlugin as AppPlugin)
