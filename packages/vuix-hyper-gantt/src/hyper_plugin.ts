import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import {
  createNoopGanttController,
  ganttHookClass,
  htmlAttributesOf,
  type UiGanttController,
  type UiGanttLink,
  type UiGanttPlugin,
  type UiGanttPrintOptions,
  type UiGanttTask,
  type UiGanttViewMode,
  type UiGanttViewProps,
} from '@mmda/vui'
import {
  PROJECT_SERIALIZER_NOT_INSTALLED,
  hourWidthOf,
  hyperItemsToVui,
  hyperSettingsOf,
  printSettingsOf,
  projectRangeOf,
  scalesOf,
  vuiTasksToHyper,
  type HyperGanttItem,
} from './hyper_map'

export interface HyperGanttPluginOptions {
  license?: string
}

const MISSING = 'Gantt requires @dlhsoft/ganttcharthyperlibrary'

type DlhSoftApi = {
  Controls?: {
    GanttChartView?: {
      initialize: (
        el: HTMLElement,
        items: HyperGanttItem[],
        settings: Record<string, unknown>,
      ) => any
      getIconColumnTemplate?: (...args: any[]) => unknown
      ProjectSerializer?: {
        initialize: (el: any, settings?: Record<string, unknown>) => {
          getXml: () => string
          loadXml: (xml: string) => void
        }
      }
    }
  }
}

function dlhSoftOf(): DlhSoftApi | undefined {
  return (globalThis as any).DlhSoft as DlhSoftApi | undefined
}

async function loadDlhSoft(): Promise<DlhSoftApi | undefined> {
  const existing = dlhSoftOf()
  if (existing?.Controls?.GanttChartView) return existing
  const files = [
    '@dlhsoft/ganttcharthyperlibrary/DlhSoft.Data.HTML.Controls.js',
    '@dlhsoft/ganttcharthyperlibrary/DlhSoft.ProjectData.GanttChart.HTML.Controls.js',
    '@dlhsoft/ganttcharthyperlibrary/DlhSoft.ProjectData.GanttChart.HTML.Controls.Extras.js',
    '@dlhsoft/ganttcharthyperlibrary',
  ]
  for (const file of files) {
    try {
      await import(/* @vite-ignore */ file)
    } catch {
      /* optional peer */
    }
  }
  return dlhSoftOf()
}

function snapshotOf(tasks?: UiGanttTask[], links?: UiGanttLink[]) {
  return JSON.stringify({ tasks: tasks ?? [], links: links ?? [] })
}

export const HyperGanttView = defineComponent({
  name: 'HyperGanttView',
  props: {
    tasks: { type: Array as PropType<UiGanttTask[]>, default: () => [] },
    links: { type: Array as PropType<UiGanttLink[]>, default: () => [] },
    columns: { type: Array as PropType<UiGanttViewProps['columns']>, default: () => [] },
    height: { type: [String, Number], default: '100%' },
    readonly: { type: Boolean, default: false },
    allowTaskDrag: { type: Boolean, default: true },
    allowTaskResize: { type: Boolean, default: true },
    allowLinks: { type: Boolean, default: true },
    allowRowReorder: { type: Boolean, default: false },
    viewMode: { type: String as PropType<UiGanttViewMode>, default: 'week' },
    loading: { type: Boolean, default: false },
    locale: { type: String, default: undefined },
    timelineStart: { type: [String, Date], default: undefined },
    timelineFinish: { type: [String, Date], default: undefined },
    currentTime: { type: [String, Date], default: undefined },
    hourWidth: { type: Number, default: undefined },
    gridVisible: { type: Boolean, default: true },
    gridWidth: { type: [String, Number], default: undefined },
    chartWidth: { type: [String, Number], default: undefined },
    virtualizing: { type: Boolean, default: true },
    dependencyConstraints: { type: Boolean, default: false },
    baselineVisible: { type: Boolean, default: false },
    workingWeekStart: { type: Number, default: undefined },
    workingWeekFinish: { type: Number, default: undefined },
    specialNonworkingDays: { type: Array as PropType<Array<string | Date>>, default: undefined },
    license: { type: String, default: undefined },
    assignableResources: { type: Array as PropType<string[]>, default: undefined },
    resourceHourCosts: { type: Object as PropType<Record<string, number>>, default: undefined },
    resourceQuantities: { type: Object as PropType<Record<string, number>>, default: undefined },
    onReady: { type: Function as PropType<UiGanttViewProps['onReady']> },
    onTaskChange: { type: Function as PropType<UiGanttViewProps['onTaskChange']> },
    onLinkChange: { type: Function as PropType<UiGanttViewProps['onLinkChange']> },
    onTaskSelect: { type: Function as PropType<UiGanttViewProps['onTaskSelect']> },
    onTaskDblClick: { type: Function as PropType<UiGanttViewProps['onTaskDblClick']> },
    onRowReorder: { type: Function as PropType<UiGanttViewProps['onRowReorder']> },
  },
  setup(props) {
    const host = ref<HTMLElement | null>(null)
    const missing = ref(false)
    const items = ref<HyperGanttItem[]>([])
    let instance: any
    let serializer: { getXml: () => string; loadXml: (xml: string) => void } | undefined
    const undoStack: string[] = []

    const propsAsView = () => props as unknown as UiGanttViewProps

    const emitTasks = (action: string) => {
      const mapped = hyperItemsToVui(items.value)
      void props.onTaskChange?.({
        action,
        tasks: mapped.tasks,
        native: items.value,
      })
    }

    const applyItems = (tasks?: UiGanttTask[], links?: UiGanttLink[]) => {
      items.value = vuiTasksToHyper(
        tasks ?? props.tasks,
        links ?? props.links,
      )
      if (instance?.refreshItems) instance.refreshItems()
    }

    const serializerOf = () => {
      if (serializer) return serializer
      const Ctor = dlhSoftOf()?.Controls?.GanttChartView?.ProjectSerializer
      if (!Ctor || !instance) {
        throw new Error(PROJECT_SERIALIZER_NOT_INSTALLED)
      }
      serializer = Ctor.initialize(instance, {
        assignableResources: props.assignableResources,
      })
      return serializer
    }

    const controller: UiGanttController = {
      ...createNoopGanttController(),
      refresh: (tasks, links) => applyItems(tasks, links),
      select: (ids) => {
        const set = new Set(ids.map(String))
        for (const item of items.value) {
          if (set.has(String(item.mmdaId))) instance?.selectItem?.(item)
          else instance?.unselectItem?.(item)
        }
      },
      expandAll: () => {
        for (const item of items.value) {
          if (item.hasChildren) instance?.expandItem?.(item)
        }
      },
      collapseAll: () => {
        for (const item of items.value) {
          if (item.hasChildren) instance?.collapseItem?.(item)
        }
      },
      setViewMode: (mode) => {
        if (!instance) return
        instance.settings.scales = scalesOf(mode)
        instance.settings.hourWidth = hourWidthOf({
          ...propsAsView(),
          viewMode: mode,
        })
        instance.refresh?.()
      },
      fitToProject: () => {
        if (!instance) return
        const range = projectRangeOf(hyperItemsToVui(items.value).tasks)
        if (range.start) instance.settings.timelineStart = range.start
        if (range.finish) instance.settings.timelineFinish = range.finish
        instance.refresh?.()
      },
      undo: () => {
        const previous = undoStack.pop()
        if (!previous) return
        const parsed = JSON.parse(previous) as {
          tasks: UiGanttTask[]
          links: UiGanttLink[]
        }
        applyItems(parsed.tasks, parsed.links)
      },
      scrollToDate: (date) => {
        if (!instance) return
        instance.settings.displayedTime =
          date instanceof Date ? date : new Date(date)
        instance.refresh?.()
      },
      print: (options?: UiGanttPrintOptions) => {
        instance?.print?.(printSettingsOf(options))
      },
      exportHtml: (options?: UiGanttPrintOptions) => {
        return String(instance?.exportContent?.(printSettingsOf(options)) ?? '')
      },
      getProjectXml: () => serializerOf().getXml(),
      loadProjectXml: (xml: string) => {
        serializerOf().loadXml(xml)
        const mapped = hyperItemsToVui(instance?.items ?? items.value)
        items.value = vuiTasksToHyper(mapped.tasks, mapped.links)
        emitTasks('loadXml')
      },
      setupBaseline: () => {
        instance?.setupBaseline?.()
        if (instance?.settings) instance.settings.isBaselineVisible = true
        emitTasks('baseline')
      },
      optimizeWork: () => {
        instance?.optimizeWork?.()
        emitTasks('optimize')
      },
      levelAllocations: () => {
        instance?.levelAllocations?.()
        emitTasks('levelAllocations')
      },
      levelResources: () => {
        instance?.levelResources?.()
        emitTasks('levelResources')
      },
      criticalTaskIds: () =>
        (instance?.getCriticalItems?.() ?? [])
          .map((item: HyperGanttItem) => item.mmdaId)
          .filter((id: unknown) => id != null),
    }

    const init = async () => {
      const api = await loadDlhSoft()
      const GanttChartView = api?.Controls?.GanttChartView
      if (!GanttChartView || !host.value) {
        missing.value = true
        return
      }
      items.value = vuiTasksToHyper(props.tasks, props.links)
      const settings = hyperSettingsOf(propsAsView())
      settings.itemPropertyChangeHandler = (
        item: HyperGanttItem,
        _propertyName: string,
        a?: boolean,
        b?: boolean,
      ) => {
        const flags = [a, b].filter((flag) => typeof flag === 'boolean')
        if (flags.includes(false)) return
        undoStack.push(snapshotOf(props.tasks, props.links))
        const mapped = hyperItemsToVui([item])
        if (_propertyName === 'predecessors') {
          void props.onLinkChange?.({
            action: 'predecessors',
            link: mapped.links[0],
            native: item,
          })
          return
        }
        void props.onTaskChange?.({
          action: _propertyName,
          task: mapped.tasks[0],
          native: item,
        })
      }
      settings.itemSelectionChangeHandler = (
        item: HyperGanttItem,
        isSelected: boolean,
      ) => {
        if (!isSelected) return
        props.onTaskSelect?.(item.mmdaId != null ? [item.mmdaId] : [])
      }
      settings.itemDoubleClickHandler = (
        _isOnChart: boolean,
        item: HyperGanttItem,
      ) => {
        const mapped = hyperItemsToVui([item])
        if (mapped.tasks[0]) props.onTaskDblClick?.(mapped.tasks[0])
      }
      if (props.allowRowReorder && GanttChartView.getIconColumnTemplate) {
        const columns = (settings.columns as any[]) ?? []
        columns.unshift({
          header: '',
          width: 32,
          cellTemplate: GanttChartView.getIconColumnTemplate(),
        })
        settings.columns = columns
      }
      instance = GanttChartView.initialize(host.value, items.value, settings)
      props.onReady?.(controller)
    }

    onMounted(() => {
      void init()
    })
    onBeforeUnmount(() => {
      instance = undefined
      serializer = undefined
    })
    watch(
      () => [props.tasks, props.links],
      () => applyItems(),
      { deep: true },
    )

    return () => {
      const height =
        typeof props.height === 'number' ? `${props.height}px` : props.height
      if (missing.value) {
        return h('p', { class: 'mmda-hyper-gantt-missing' }, MISSING)
      }
      return h('div', {
        ref: host,
        class: ganttHookClass('mmda-hyper-gantt', props.readonly),
        style: { height, minHeight: '16rem' },
        'data-loading': props.loading || undefined,
        ...htmlAttributesOf(props as any),
      })
    }
  },
})

export function createHyperGanttPlugin(
  options: HyperGanttPluginOptions = {},
): UiGanttPlugin {
  return {
    ganttView: (props) =>
      h(HyperGanttView, {
        ...props,
        license: props.license ?? options.license,
      } as any),
  }
}
