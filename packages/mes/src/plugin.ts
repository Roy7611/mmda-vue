import { HomeView } from './views/HomeView'
import { Custompages } from './views/PlaceholderViews'
import { LOGIC_LOADERS } from './logics'
import GanntView from './components/GanntView/GanntView'
import ProjectGanttView from './components/ProjectGanntView/ProjectGanttView'

const customViews: Record<string, any> = {
  ProductionSchedule: GanntView,
  ProductionSchedules: GanntView,
  ProjectSchedule: ProjectGanttView,
  ProjectSchedules: ProjectGanttView,
}

/**
 * MES business contribution consumed by the single @mmda/app host.
 * Heavy custom pages remain in this package and are selected lazily by the
 * host's generic EntityView contract.
 */
export const mesPlugin = {
  name: 'mes',
  service: 'mes',
  routePrefix: '/MES',
  home: HomeView,
  placeholderView: Custompages,
  placeholders: [
    'DocCategory',
    'WorkerPerformance',
    'OEE',
    'EnergyConsume',
    'CostAnalysis',
    'QualityFluctuations',
    'ProductionPlanItem',
    'ProductionReport',
    'ProductTrace',
    'Maintainable',
    'QualityKanban',
    'ProductionKanban',
    'Notifications',
  ],
  logicLoaders: LOGIC_LOADERS,
  resolveCustomView(repository: string) {
    return customViews[repository] ?? customViews[repository.replace(/s$/, '')]
  },
}

export default mesPlugin
