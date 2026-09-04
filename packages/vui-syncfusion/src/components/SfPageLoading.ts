import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { createSpinner, hideSpinner, showSpinner } from '@syncfusion/ej2-popups'

/**
 * Full-area Syncfusion spinner for EntityView page switches.
 * `e-icons e-spin` is not a valid glyph — use createSpinner/showSpinner.
 */
export const SfPageLoading = defineComponent({
  name: 'SfPageLoading',
  setup(_, { attrs }) {
    const hostRef = ref<HTMLElement | null>(null)
    let ready = false

    const mountSpinner = () => {
      const el = hostRef.value
      if (!el || ready) return
      createSpinner({
        target: el,
        width: 48,
        type: 'Material3',
      })
      ready = true
      showSpinner(el)
    }

    onMounted(() => {
      void nextTick(mountSpinner)
    })
    onBeforeUnmount(() => {
      const el = hostRef.value
      if (el && ready) hideSpinner(el)
    })

    return () =>
      h('div', {
        ...attrs,
        ref: hostRef,
        class: ['mmda-sf-page-loading-host', attrs.class],
      })
  },
})
