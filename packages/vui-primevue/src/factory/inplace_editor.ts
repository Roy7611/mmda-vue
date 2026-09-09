/*
 * chrome 就地编辑走 factory.inplaceEditor。
 * https://primevue.dev/inplace/
 */
import { defineComponent, h, ref, watch, type PropType } from 'vue'
import Inplace from 'primevue/inplace'
import type { UiInplaceEditorController, UiInplaceEditorProps, UiInplaceEditorSlots } from '@mmda/core'
import { htmlAttributesOf, inplaceEditorDisabledOf, inplaceEditorModifierClasses, noopInplaceEditorController } from '@mmda/vui'

const PrimeInplaceEditorHost = defineComponent({
  name: 'MmdaPrimeInplaceEditor',
  props: {
    disabled: Boolean,
    active: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  },
  emits: ['open', 'close', 'ready'],
  setup(props, { slots, emit }) {
    const open = ref(props.active === true)
    watch(
      () => props.active,
      (value) => {
        if (value === true || value === false) open.value = value
      },
    )
    const setOpen = (next: boolean) => {
      if (props.disabled) return
      if (open.value === next) return
      open.value = next
      if (next) emit('open')
      else emit('close')
    }
    const controller: UiInplaceEditorController = {
      open: () => setOpen(true),
      close: () => setOpen(false),
    }
    emit('ready', controller)

    return () => {
      if (props.disabled) {
        return h(
          'div',
          { class: inplaceEditorModifierClasses(props) },
          slots.display?.(),
        )
      }
      return h(
        Inplace,
        {
          class: inplaceEditorModifierClasses(props, { open: open.value }),
          active: open.value,
          'onUpdate:active': (value: boolean) => setOpen(value),
        },
        {
          display: () =>
            h(
              'span',
              { class: 'mmda-inplace-editor__display' },
              slots.display?.(),
            ),
          content: () =>
            h(
              'div',
              { class: 'mmda-inplace-editor__content' },
              slots.content?.(),
            ),
        },
      )
    }
  },
})

export function createInplaceEditor(
  props: UiInplaceEditorProps = {},
  slots?: UiInplaceEditorSlots,
) {
  if (inplaceEditorDisabledOf(props) && !slots?.display) {
    props.onReady?.(noopInplaceEditorController)
    return h('div', {
      class: inplaceEditorModifierClasses(props),
      ...htmlAttributesOf(props),
    })
  }
  return h(
    PrimeInplaceEditorHost,
    {
      disabled: inplaceEditorDisabledOf(props),
      active: props.active,
      class: props.class,
      ...htmlAttributesOf(props),
      onOpen: () => props.onOpen?.(),
      onClose: () => props.onClose?.(),
      onReady: (controller: UiInplaceEditorController) =>
        props.onReady?.(controller),
    },
    {
      display: () => slots?.display?.(),
      content: () => slots?.content?.(),
    },
  )
}
