import { homeView } from './views/HomeView'
import { customPages } from './views/PlaceholderViews'
import { LOGIC_LOADERS } from './logics'

/**
 * BASE business contribution consumed by the single @mmda/app host.
 * This package deliberately exports data/views only and never imports the host
 * package, keeping the dependency graph acyclic.
 *
 * 页面视图是**框架无关**的 `UiViewFn`（core 契约：给 `{ app, render, router }` 返回节点），
 * 宿主用 `hostedView(...)` 包成自己的组件 —— 所以本包不依赖 vue / vue-router / vue-i18n。
 */
export const basePlugin = {
  name: 'base',
  service: 'base',
  routePrefix: '/BASE',
  home: homeView,
  placeholderView: customPages,
  placeholders: ['DailyRecords', 'MaterialCats', 'PartnerCats'],
  logicLoaders: LOGIC_LOADERS,
}

export default basePlugin
