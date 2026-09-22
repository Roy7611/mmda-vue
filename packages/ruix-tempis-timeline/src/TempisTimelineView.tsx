/*
 * Tempis 二维时间轴画布宿主（React）。
 *
 * **只声明一个 prop `source`**：契约有三十多个字段，逐一声明就会长出第二份契约，
 * 而且没声明的键会落进 DOM。壳元素只吃 `uiRenderProps(...).attributes`（标量通道）
 * 与 class，别的键一概不落 DOM —— React 对「非标量属性落原生元素」是会告警的。
 *
 * 生命周期（React 19 StrictMode 会 挂载 → 清理 → 再挂载，所以每一步都要幂等）：
 * - 挂载：动态 `import()` 引擎（optional peer）→ 构造 → `onReady(controller)`
 * - **数据**（items / categories / bands / dependencies / selectedIds）变了 → setter，不重建
 * - **结构**（range / legend / tooltip 标量 / style / …）变了 → `destroy()` + 重建 ——
 *   引擎只在构造时读这些
 * - 回调与 tooltip 模板每次都读**最新** props（引擎活过很多次渲染，闭包不能钉死旧 props）
 * - 卸载：`destroy()` + 卸掉 tooltip 用的临时 React root
 *
 * 与 Vue 宿主的差异只在两处：`class → className`（借 `reactRenderProps`），
 * 以及 tooltip 节点用 `createRoot` + **`flushSync`**（React 的 render 默认批处理，
 * 不 flush 就拿不到已挂载的 DOM）。
 */
import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import {
  noopTempisTimelineController,
  uiRenderProps,
  type UiTempisTimelineController,
  type UiTempisTimelineProps,
} from '@mmda/core'
import { reactRenderProps } from '@mmda/rui'
import type {
  ImageGenerationOptions,
  TempisTimeline,
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
 * 引擎是 optional peer：模块级缓存一次 import 结果，缺了就一直是缺的。
 * **不要加 `@vite-ignore`**：加了之后裸 specifier 原样留在产物里，浏览器解析不了，
 * 装没装都走「缺引擎」分支（Vue 侧实测过，React 侧同理）。
 */
let tempisEnginePromise: Promise<TempisConstructor | undefined> | undefined

function loadTempisEngine(): Promise<TempisConstructor | undefined> {
  tempisEnginePromise ??= import('@tempis/timeline')
    .then((mod) => mod.TempisTimeline as TempisConstructor)
    .catch(() => undefined)
  return tempisEnginePromise
}

/** 数字按像素，字符串原样，空值回退。 */
function cssSize(value: string | number | undefined, fallback: string): string {
  if (value == null || value === '') return fallback
  return typeof value === 'number' ? `${value}px` : value
}

/** 拼 class，过滤空值。 */
function joinClass(...parts: unknown[]): string {
  return parts
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim()
}

/**
 * React 的 props 是不可变快照，判「变了没」只能比签名。
 * 签名里只有数据与标量（函数一律不进签名）—— 和 Vue 侧 `tempisStructureOf` 的分工一致。
 */
const signatureOf = (value: unknown): string => JSON.stringify(value) ?? ''

export type TempisTimelineViewProps = {
  source: UiTempisTimelineProps
}

export function TempisTimelineView({
  source,
}: TempisTimelineViewProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<TempisTimeline | undefined>(undefined)
  const tooltipRootsRef = useRef<Root[]>([])
  const sourceRef = useRef(source)
  sourceRef.current = source
  const [failed, setFailed] = useState<'missing' | 'error' | null>(null)

  const signatures = {
    items: signatureOf(tempisItemsForEngine(source)),
    categories: signatureOf(tempisCategoriesForEngine(source)),
    bands: signatureOf(tempisBandsForEngine(source)),
    dependencies: signatureOf(tempisDependenciesForEngine(source)),
    structure: signatureOf(tempisStructureOf(source)),
    selected: signatureOf(source.selectedIds ?? null),
  }
  const signaturesRef = useRef(signatures)
  signaturesRef.current = signatures
  /** 构造时用的那份签名：effect 只在「跟已应用的不一样」时动手。 */
  const appliedRef = useRef(signatures)

  /** tooltip 节点（ReactNode）→ 元素；引擎把它塞进自己的 tooltip 层。 */
  const renderTooltipNode = useCallback(
    (node: unknown): HTMLElement | string | null => {
      if (node == null || typeof node === 'string') {
        return tempisTooltipNodeOf(node)
      }
      const host = document.createElement('div')
      const root = createRoot(host)
      // React 的 render 默认批处理异步提交 → 必须 flushSync 才能拿到已挂载的 DOM。
      flushSync(() => {
        root.render(node as ReactNode)
      })
      tooltipRootsRef.current.push(root)
      return host
    },
    [],
  )

  /** 构造参数：结构 + 数据按当前 props 映射，回调与 tooltip 谓词**每次触发读最新 props**。 */
  const buildOptions = useCallback((): TempisTimelineOptions => {
    const options = tempisOptionsOf(sourceRef.current, {
      renderNode: renderTooltipNode,
    })
    options.onItemClick = (id) => sourceRef.current.onItemClick?.(id)
    options.onItemDoubleClick = (id) => sourceRef.current.onItemDoubleClick?.(id)
    options.onItemContextClick = (id, position) =>
      sourceRef.current.onItemContextClick?.(id, position)
    options.onItemHover = (id) => sourceRef.current.onItemHover?.(id)
    options.onSelectionChange = (changes) =>
      sourceRef.current.onSelectionChange?.(changes)
    options.onRangeChange = (start, end) =>
      sourceRef.current.onRangeChange?.(start, end)
    options.onGroupToggle = (group, collapsed) =>
      sourceRef.current.onGroupToggle?.(group, collapsed)
    if (sourceRef.current.tooltip) {
      options.tooltip = {
        ...options.tooltip,
        template: (id) =>
          tempisTooltipNodeOf(
            sourceRef.current.tooltip?.template?.(id),
            renderTooltipNode,
          ),
        shouldShow: (id) => sourceRef.current.tooltip?.shouldShow?.(id) ?? true,
      }
    }
    return options
  }, [renderTooltipNode])

  /** 命令式入口：引用稳定（业务拿一次就够），内部永远指向当前实例。 */
  const controllerRef = useRef<UiTempisTimelineController | null>(null)
  if (controllerRef.current == null) {
    controllerRef.current = {
      focus: (options) => {
        const target = engineRef.current
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
      getRange: () => engineRef.current?.getRange(),
      redraw: () => engineRef.current?.redraw(),
      toImage: async (options) => {
        try {
          // 契约承诺「失败给 undefined」；引擎在已销毁时是抛错。
          return await engineRef.current?.toImage(
            options as ImageGenerationOptions,
          )
        } catch {
          return undefined
        }
      },
      getSelection: () => engineRef.current?.getSelection() ?? [],
      setSelection: (ids) => engineRef.current?.setSelection([...ids]),
      clearSelection: () => engineRef.current?.clearSelection(),
      getItems: () => (engineRef.current?.getItems() ?? []).map(tempisItemOfEngine),
      setItems: (items) =>
        engineRef.current?.setItems(tempisItemsOfContract(items)),
      getCategories: () => engineRef.current?.getCategories() ?? [],
      setCategories: (categories) =>
        engineRef.current?.setCategories([...categories]),
      setBands: (bands) =>
        engineRef.current?.setBands(tempisBandsForEngine({ bands })),
      setDependencies: (dependencies) =>
        engineRef.current?.setDependencies(
          tempisDependenciesForEngine({ dependencies }),
        ),
      setGroupCollapsed: (group, collapsed) =>
        engineRef.current?.setGroupCollapsed(group, collapsed),
      isGroupCollapsed: (group) =>
        engineRef.current?.isGroupCollapsed(group) ?? false,
    }
  }
  const controller = controllerRef.current

  const destroyEngine = useCallback((): void => {
    engineRef.current?.destroy()
    engineRef.current = undefined
  }, [])

  const createEngine = useCallback(async (): Promise<void> => {
    const Ctor = await loadTempisEngine()
    // StrictMode 会 挂载→清理→再挂载，两次 create 可能同时在飞：先到先建，后到的让位。
    if (engineRef.current) return
    const canvas = canvasRef.current
    if (!Ctor || !canvas) {
      setFailed('missing')
      sourceRef.current.onReady?.(noopTempisTimelineController)
      return
    }
    let engine: TempisTimeline
    try {
      engine = new Ctor(canvas, buildOptions())
    } catch (error) {
      // 引擎装了但构造失败（选项有问题 / 环境不支持）：别静默。
      console.error('[mmda-ruix-tempis-timeline] engine failed to start', error)
      setFailed('error')
      sourceRef.current.onReady?.(noopTempisTimelineController)
      return
    }
    engineRef.current = engine
    appliedRef.current = signaturesRef.current
    if (sourceRef.current.selectedIds) {
      engine.setSelection([...sourceRef.current.selectedIds])
    }
    setFailed(null)
    sourceRef.current.onReady?.(controller)
  }, [buildOptions, controller])

  // 挂载 / 卸载（StrictMode 双跑下也要幂等）
  useEffect(() => {
    void createEngine()
    return () => {
      destroyEngine()
      for (const root of tooltipRootsRef.current) root.unmount()
      tooltipRootsRef.current = []
    }
  }, [createEngine, destroyEngine])

  // 结构选项变了 → 重建（引擎只在构造时读它们）
  useEffect(() => {
    if (appliedRef.current.structure === signatures.structure) return
    appliedRef.current.structure = signatures.structure
    destroyEngine()
    void createEngine()
  }, [signatures.structure, createEngine, destroyEngine])

  // 数据 → setter，不重建
  useEffect(() => {
    if (appliedRef.current.items === signatures.items) return
    appliedRef.current.items = signatures.items
    engineRef.current?.setItems(tempisItemsForEngine(sourceRef.current))
  }, [signatures.items])

  useEffect(() => {
    if (appliedRef.current.categories === signatures.categories) return
    appliedRef.current.categories = signatures.categories
    engineRef.current?.setCategories(
      tempisCategoriesForEngine(sourceRef.current),
    )
  }, [signatures.categories])

  useEffect(() => {
    if (appliedRef.current.bands === signatures.bands) return
    appliedRef.current.bands = signatures.bands
    engineRef.current?.setBands(tempisBandsForEngine(sourceRef.current))
  }, [signatures.bands])

  useEffect(() => {
    if (appliedRef.current.dependencies === signatures.dependencies) return
    appliedRef.current.dependencies = signatures.dependencies
    engineRef.current?.setDependencies(
      tempisDependenciesForEngine(sourceRef.current),
    )
  }, [signatures.dependencies])

  useEffect(() => {
    if (appliedRef.current.selected === signatures.selected) return
    appliedRef.current.selected = signatures.selected
    const ids = sourceRef.current.selectedIds
    if (ids) engineRef.current?.setSelection([...ids])
    else engineRef.current?.clearSelection()
  }, [signatures.selected])

  // React 侧的键名翻译只有一处：`reactRenderProps` 把 class 折成 className。
  // 它的返回值里还带着给控件消费的具名键（items / 回调 / …），那些**不能**落原生 div，
  // 所以壳元素只取 attributes（标量通道）与 className。
  const reactProps = reactRenderProps(uiRenderProps(source))
  const domProps: Record<string, unknown> = {
    ...uiRenderProps(source).attributes,
    className: joinClass(
      'mmda-timeline',
      'mmda-timeline--tempis',
      failed === 'missing' ? 'mmda-timeline--missing' : undefined,
      failed === 'error' ? 'mmda-timeline--failed' : undefined,
      reactProps.className as string | undefined,
    ),
    style: {
      height: cssSize(source.height, '300px'),
      width: '100%',
      position: 'relative',
      direction: source.rtl ? 'rtl' : undefined,
    },
  }

  return createElement(
    'div',
    domProps,
    failed === 'missing'
      ? createElement(
          'span',
          { className: 'mmda-timeline__missing' },
          TEMPIS_MISSING,
        )
      : createElement('canvas', {
          ref: canvasRef,
          className: 'mmda-timeline__canvas',
          style: { display: 'block', width: '100%', height: '100%' },
        }),
  )
}
