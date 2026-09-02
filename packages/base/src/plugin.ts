import { HomeView } from './views/HomeView'
import { Custompages } from './views/PlaceholderViews'
import { LOGIC_LOADERS } from './logics'

/**
 * BASE business contribution consumed by the single @mmda/app host.
 * This package deliberately exports data/components only and never imports
 * the host package, keeping the dependency graph acyclic.
 */
export const basePlugin = {
  name: 'base',
  service: 'base',
  routePrefix: '/BASE',
  home: HomeView,
  placeholderView: Custompages,
  placeholders: ['DailyRecords', 'MaterialCats', 'PartnerCats'],
  logicLoaders: LOGIC_LOADERS,
}

export default basePlugin
