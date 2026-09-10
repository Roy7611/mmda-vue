import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  watch,
  type PropType,
} from 'vue'
import { createSpinner, hideSpinner, showSpinner } from '@syncfusion/ej2-popups'
import { loadingModifierClasses, loadingWidthOf, type UiLoadingProps, type UiLoadingSize } from '@mmda/vui'

/**
 * EJ2 Spinner 主机。无子节点 = 区域转圈；有 default slot = 盖住子节点。
 * `e-icons e-spin` 不是有效字形，必须用 createSpinner / showSpinner。
 */
export const SfLoadingHost = defineComponent({
  name: 'SfLoadingHost',
  inheritAttrs: false,
  props: {
    loading: { type: [Boolean, Object], default: true },
    label: { type: String, default: undefined },
    size: { type: String as PropType<UiLoadingSize>, default: undefined },
    class: { type: [String, Array, Object], default: undefined },
  },
  setup(props, { slots, attrs }) {
    const hostRef = ref<HTMLElement | null>(null)
    let spinnerReady = false

    const busy = () => Boolean(unref(props.loading as any))

    const ensureSpinner = (el: HTMLElement) => {
      if (spinnerReady) return
      const chrome: UiLoadingProps = { size: props.size, label: props.label }
      createSpinner({
        target: el,
        width: loadingWidthOf(chrome),
        label: props.label,
        type: 'Material3',
      })
      spinnerReady = true
    }

    const sync = () => {
      const el = hostRef.value
      if (!el) return
      ensureSpinner(el)
      if (busy()) showSpinner(el)
      else hideSpinner(el)
    }

    onMounted(() => {
      void nextTick(sync)
    })
    onBeforeUnmount(() => {
      const el = hostRef.value
      if (el && spinnerReady) hideSpinner(el)
    })
    watch(
      () => [unref(props.loading as any), props.label, props.size],
      () => {
        void nextTick(sync)
      },
    )

    return () => {
      const overlay = Boolean(slots.default)
      const chrome: UiLoadingProps = {
        size: props.size,
        label: props.label,
        class: props.class,
      }
      return h(
        'div',
        {
          ...attrs,
          ref: hostRef,
          class: [
            ...loadingModifierClasses(chrome).flat(),
            overlay ? 'mmda-loading--overlay' : 'mmda-page-loading-host',
            overlay ? 'mmda-grid-loading-host' : undefined,
            overlay && busy() ? 'is-loading' : undefined,
          ],
          role: 'status',
          'aria-busy': busy() ? 'true' : 'false',
        },
        slots.default?.(),
      )
    }
  },
})

/** @deprecated 使用 SfLoadingHost */
export const SfPageLoading = SfLoadingHost

/** 表格盖层：默认不转圈，由 loading 绑定。 */
export const SfGridLoadingHost = defineComponent({
  name: 'SfGridLoadingHost',
  props: {
    loading: { type: [Boolean, Object], default: false },
  },
  setup(props, { slots }) {
    return () =>
      h(SfLoadingHost, { loading: props.loading }, () => slots.default?.())
  },
})
