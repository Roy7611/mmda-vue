/*
 * Tempis 二维时间轴画布宿主（Vue）。
 *
 * **只声明一个 prop `source`**：契约有三十多个字段，逐一声明就会长出第二份契约，
 * 而且没声明的键会走 attrs fallthrough 落进真实 DOM。壳元素只吃 `htmlAttributes`
 * 与 `class`，别的键一概不落 DOM。
 *
 * 生命周期：
 * - `onMounted`：动态 `import()` 引擎（optional peer）→ 构造 → `onReady(controller)`
 * - **数据**（items / categories / bands / dependencies / selectedIds）变了 → setter，不重建
 * - **结构**（range / legend / tooltip 标量 / style / …）变了 → `destroy()` + 重建 ——
 *   引擎只在构造时读这些
 * - 回调每次触发都读**最新** props：引擎活过很多次渲染，闭包不能钉死旧引用
 * - `onBeforeUnmount`：`destroy()` + 卸掉 tooltip 用的临时 Vue 应用
 */
import {
  createApp,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type App,
  type PropType,
  type VNodeChild,
} from 'vue'
import {
  htmlAttributesOf,
  noopTempisTimelineController,
  type UiTempisTimelineController,
  type UiTempisTimelineProps,
} from '@mmda/vui'
import type {
  ImageGenerationOptions,
  TempisTimeline,
  TempisTimelineCategory,
  TempisTimelineItem,
  TempisTimelineOptions,
} from '@tempis/timeline'
import {
  tempisItemOfEngine,
  tempisItemsForEngine,
  tempisItemsOfContract,
} from './tempis_items'
import {
  tempisBandsForEngine,
  tempisCategoriesForEngine,
  tempisDependenciesForEngine,
  tempisOptionsOf,
  tempisStructureOf,
  tempisTooltipNodeOf,
} from './tempis_options'

export const TEMPIS_MISSING = 'Timeline requires @tempis/timeline'

type TempisConstructor = new (
  context: string | HTMLCanvasElement,
  options: TempisTimelineOptions,
) => TempisTimeline

/**
 * 引擎是 optional peer：模块级缓存一次 import 结果，缺了就一直是缺的
 * （每个实例都去 try 一次 import 只会反复抛）。
 *
 * **不能加 `@vite-ignore`**（实测）：加了之后裸 specifier 会原样留在产物里，
 * 浏览器解析不了 `@tempis/timeline`，装没装都落到「缺引擎」分支。不带 ignore 时，
 * 消费者侧（Vite dev 预构建 / 生产打包）会正常解析并内联/外链，未安装才由 catch 兜住。
 */
let tempisEnginePromise: Promise<TempisConstructor | undefined> | undefined

function loadTempisEngine(): Promise<TempisConstructor | undefined> {
  tempisEnginePromise ??= import('@tempis/timeline')
    .then((mod) => mod.TempisTimeline as TempisConstructor)
    .catch(() => undefined)
  return tempisEnginePromise
}

export const TempisTimelineView = defineComponent({
  name: 'TempisTimelineView',
  props: {
    source: {
      type: Object as PropType<UiTempisTimelineProps>,
      required: true,
    },
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null)
    const missing = ref(false)
    const failed = ref(false)
    /** tooltip 每次显示都会挂一个临时 Vue 应用，卸载时统一收掉。 */
    const tooltipApps: App[] = []
    let engine: TempisTimeline | undefined
    let unmounted = false

    const renderNode = (node: unknown): HTMLElement | string | null => {
      if (node == null || typeof node === 'string') {
        return tempisTooltipNodeOf(node)
      }
      const host = document.createElement('div')
      const app = createApp({ render: () => node as VNodeChild })
      app.mount(host)
      tooltipApps.push(app)
      return host
    }

    /**
     * 构造参数：结构 + 数据按当前 props 映射，回调与 tooltip 谓词**每次触发读最新 props**。
     */
    const engineOptions = (): TempisTimelineOptions => {
      const source = props.source
      const options = tempisOptionsOf(source, { renderNode })
      options.onItemClick = (id) => props.source.onItemClick?.(id)
      options.onItemDoubleClick = (id) => props.source.onItemDoubleClick?.(id)
      options.onItemContextClick = (id, position) =>
        props.source.onItemContextClick?.(id, position)
      options.onItemHover = (id) => props.source.onItemHover?.(id)
      options.onSelectionChange = (changes) =>
        props.source.onSelectionChange?.(changes)
      options.onRangeChange = (start, end) =>
        props.source.onRangeChange?.(start, end)
      options.onGroupToggle = (group, collapsed) =>
        props.source.onGroupToggle?.(group, collapsed)
      if (props.source.tooltip) {
        options.tooltip = {
          ...options.tooltip,
          template: (id) =>
            tempisTooltipNodeOf(props.source.tooltip?.template?.(id), renderNode),
          shouldShow: (id) => props.source.tooltip?.shouldShow?.(id) ?? true,
        }
      }
      return options
    }

    /** 命令式入口：永远指向当前实例（重建后自动跟上）。 */
    const controllerOf = (): UiTempisTimelineController => ({
      focus: (options) => {
        const target = engine
        if (!target) return
        if (options == null) {
          target.focus()
          return
        }
        if (
          options instanceof Date ||
          typeof options === 'string' ||
          typeof options === 'number'
        ) {
          target.focus({ date: options })
          return
        }
        target.focus(options)
      },
      getRange: () => engine?.getRange(),
      redraw: () => engine?.redraw(),
      toImage: async (options) => {
        try {
          // 契约承诺「失败给 undefined」；引擎在已销毁时是抛错。
          return await engine?.toImage(options as ImageGenerationOptions)
        } catch {
          return undefined
        }
      },
      getSelection: () => engine?.getSelection() ?? [],
      setSelection: (ids) => engine?.setSelection([...ids]),
      clearSelection: () => engine?.clearSelection(),
      getItems: () => (engine?.getItems() ?? []).map(tempisItemOfEngine),
      setItems: (items) => engine?.setItems(tempisItemsOfContract(items)),
      getCategories: () => engine?.getCategories() ?? [],
      setCategories: (categories) => engine?.setCategories([...categories]),
      setBands: (bands) => engine?.setBands(tempisBandsForEngine({ bands })),
      setDependencies: (dependencies) =>
        engine?.setDependencies(tempisDependenciesForEngine({ dependencies })),
      setGroupCollapsed: (group, collapsed) =>
        engine?.setGroupCollapsed(group, collapsed),
      isGroupCollapsed: (group) => engine?.isGroupCollapsed(group) ?? false,
    })

    const createEngine = async (): Promise<void> => {
      const Ctor = await loadTempisEngine()
      if (unmounted) return
      if (!Ctor || !canvas.value) {
        missing.value = true
        props.source.onReady?.(noopTempisTimelineController)
        return
      }
      missing.value = false
      try {
        engine = new Ctor(canvas.value, engineOptions())
      } catch (error) {
        // 引擎装了但构造失败（选项有问题 / 环境不支持）：别静默 —— 记下来并给 noop，
        // 业务代码仍然拿到 controller，不至于整棵树崩。
        console.error('[mmda-tempis-timeline] engine failed to start', error)
        failed.value = true
        props.source.onReady?.(noopTempisTimelineController)
        return
      }
      if (props.source.selectedIds) {
        engine.setSelection([...props.source.selectedIds])
      }
      props.source.onReady?.(controllerOf())
    }

    const destroyEngine = (): void => {
      engine?.destroy()
      engine = undefined
    }

    const rebuildEngine = async (): Promise<void> => {
      destroyEngine()
      await createEngine()
    }

    const syncCategories = (): void => {
      engine?.setCategories(tempisCategoriesForEngine(props.source))
    }
    const syncSelected = (ids: Array<string | number> | undefined): void => {
      if (ids) engine?.setSelection([...ids])
      else engine?.clearSelection()
    }

    onMounted(() => {
      void createEngine()
    })

    // 结构选项：引擎只在构造时读 → 变了重建。
    watch(
      () => tempisStructureOf(props.source),
      () => {
        void rebuildEngine()
      },
      { deep: true },
    )
    // 数据：走 setter，不重建。
    watch(
      () => tempisItemsForEngine(props.source),
      (items) => engine?.setItems(items),
      { deep: true },
    )
    watch(() => tempisCategoriesForEngine(props.source), syncCategories, {
      deep: true,
      // 分类只在引擎活着时同步；引擎重建时构造参数里已经带了。
      immediate: false,
    })
    watch(
      () => tempisBandsForEngine(props.source),
      (bands) => engine?.setBands(bands),
      { deep: true },
    )
    watch(
      () => tempisDependenciesForEngine(props.source),
      (dependencies) => engine?.setDependencies(dependencies),
      { deep: true },
    )
    watch(() => props.source.selectedIds, syncSelected, { deep: true })

    onBeforeUnmount(() => {
      unmounted = true
      destroyEngine()
      for (const app of tooltipApps) app.unmount()
      tooltipApps.length = 0
    })

    return () => {
      const shell = [
        'mmda-timeline',
        'mmda-timeline--tempis',
        missing.value ? 'mmda-timeline--missing' : undefined,
        failed.value ? 'mmda-timeline--failed' : undefined,
        props.source.class,
      ]
      return h(
        'div',
        {
          ...htmlAttributesOf(props.source),
          class: shell,
          style: {
            height: props.source.height ?? 300,
            width: '100%',
            position: 'relative',
            direction: props.source.rtl ? 'rtl' : undefined,
          },
        },
        missing.value
          ? [h('span', { class: 'mmda-timeline__missing' }, TEMPIS_MISSING)]
          : [
              h('canvas', {
                ref: canvas,
                class: 'mmda-timeline__canvas',
                style: { display: 'block', width: '100%', height: '100%' },
              }),
            ],
      )
    }
  },
})
