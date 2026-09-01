import { AppPluginRegistry, type AppPlugin } from './host'
import { basePlugin } from '@mmda/base/src/plugin'
import { mesPlugin } from '@mmda/mes/src/plugin'

export const appPluginRegistry = new AppPluginRegistry()

appPluginRegistry.register(basePlugin as AppPlugin)
appPluginRegistry.register(mesPlugin as AppPlugin)
