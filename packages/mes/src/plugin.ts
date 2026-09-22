import { homeView } from './views/HomeView'
import { customPages } from './views/PlaceholderViews'
import { LOGIC_LOADERS } from './logics'
import type { UiContext, UiViewDeps } from '@mmda/core'
import { productionScheduleView } from './views/ProductionScheduleView'
import { projectScheduleView } from './views/ProjectScheduleView'
// 甘特页样式（原来由页面组件 import；页面已改成框架无关视图，样式在包入口带上）。
import './components/GanntView/GanntView.less'

/** 实体屏自定义页（框架无关）：实体名 → 视图函数。宿主用 `hostedEntityView(...)` 包成组件。 */
type MesEntityView = <TNode>(context: UiContext, deps: UiViewDeps<TNode>) => TNode
const entityViews: Record<string, MesEntityView> = {
  ProductionSchedule: productionScheduleView,
  ProductionSchedules: productionScheduleView,
  ProjectSchedule: projectScheduleView,
  ProjectSchedules: projectScheduleView,
}

/**
 * MES business contribution consumed by the single @mmda/app host.
 * 页面都是框架无关视图（core 的 `UiViewFn` / `UiEntityViewFn`）：普通屏由宿主按元数据拼，
 * 重页面（排产甘特）走 `resolveEntityView` → `context.uiBuilder.buildGantt(...)`。
 */
export const mesPlugin = {
  name: 'mes',
  service: 'mes',
  routePrefix: '/MES',
  // 页面是框架无关的 `UiViewFn`（core 契约）：宿主用 `hostedView(...)` 包成 Vue 组件。
  home: homeView,
  placeholderView: customPages,
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
  resolveEntityView(repository: string) {
    return entityViews[repository] ?? entityViews[repository.replace(/s$/, '')]
  },
}

export default mesPlugin
