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
  htmlAttributesOf,
  noopTimelineController,
  tempisItemsOf,
  timelineModifierClasses,
  type UiTimelineController,
  type UiTimelinePlugin,
  type UiTimelineProps,
} from '@mmda/vui'
import { tempisOptionsOf } from './tempis_map'

export const TEMPIS_MISSING = 'Timeline requires @tempis/timeline'

type TempisInstance = {
  setItems?: (items: unknown[]) => void
  focus?: (options?: unknown) => void
  getRange?: () => { start?: Date; end?: Date }
  setSelection?: (ids: Array<string | number>) => void
  toImage?: (options?: unknown) => Promise<Blob>
  redraw?: () => void
  destroy?: () => void
}

type TempisCtor = new (
  el: string | HTMLCanvasElement,
  options: Record<string, unknown>,
) => TempisInstance

async function loadTempis(): Promise<TempisCtor | undefined> {
  try {
    const mod = (await import(/* @vite-ignore */ '@tempis/timeline')) as {
      TempisTimeline?: TempisCtor
      default?: TempisCtor
    }
    return mod.TempisTimeline ?? mod.default
  } catch {
    return undefined
  }
}

export const TempisTimelineHost = defineComponent({
  name: 'TempisTimelineHost',
  props: {
    source: { type: Object as PropType<UiTimelineProps>, required: true },
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null)
    const missing = ref(false)
    let instance: TempisInstance | undefined

    const controller = (): UiTimelineController => ({
      focus: (target) => instance?.focus?.(target),
      getRange: () => instance?.getRange?.(),
      setSelection: (ids) => instance?.setSelection?.(ids),
      toImage: async () => instance?.toImage?.(),
      redraw: () => instance?.redraw?.(),
    })

    const mountEngine = async () => {
      const Ctor = await loadTempis()
      if (!Ctor || !canvas.value) {
        missing.value = true
        props.source.onReady?.(noopTimelineController)
        return
      }
      missing.value = false
      instance = new Ctor(canvas.value, {
        ...tempisOptionsOf(props.source),
        onItemClick: props.source.onItemClick,
        onSelectionChange: (changes: Array<{ id?: string | number }>) => {
          props.source.onSelectionChange?.(
            changes.map((row) => row.id).filter((id) => id != null) as Array<
              string | number
            >,
          )
        },
        onRangeChange: props.source.onRangeChange,
      })
      props.source.onReady?.(controller())
    }

    onMounted(() => {
      void mountEngine()
    })

    watch(
      () => tempisItemsOf(props.source),
      (items) => {
        instance?.setItems?.(items)
      },
      { deep: true },
    )

    onBeforeUnmount(() => {
      instance?.destroy?.()
      instance = undefined
    })

    return () =>
      h(
        'div',
        {
          class: [
            ...timelineModifierClasses(props.source),
            'mmda-timeline--tempis',
            missing.value ? 'mmda-timeline--missing' : undefined,
          ],
          style: {
            height: props.source.height ?? 300,
            width: '100%',
          },
          ...htmlAttributesOf(props.source),
        },
        missing.value
          ? TEMPIS_MISSING
          : h('canvas', {
              ref: canvas,
              style: { width: '100%', height: '100%' },
            }),
      )
  },
})

export function createTempisTimelinePlugin(): UiTimelinePlugin {
  return {
    timeline: (props) => h(TempisTimelineHost, { source: props }),
  }
}
