/*
 * chrome 就地编辑走 factory.inplaceEditor。
 * Naive 无厂商件：自绘 display ↔ content。
 */
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import type {
  UiInplaceEditorController,
  UiInplaceEditorProps,
  UiInplaceEditorSlots,
} from '@mmda/vui'
import {
  htmlAttributesOf,
  inplaceEditorDisabledOf,
  inplaceEditorModifierClasses,
  noopInplaceEditorController,
} from '@mmda/vui'

const NaiveInplaceEditorHost = defineComponent({
  name: 'MmdaNaiveInplaceEditor',
  props: {
    disabled: Boolean,
    active: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  },
  emits: ['open', 'close', 'ready'],
  setup(props, { slots, emit }) {
    const open = ref(props.active === true)
    const root = ref<HTMLElement>()
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

    const onDoc = (event: MouseEvent) => {
      if (!open.value || props.disabled) return
      const node = root.value
      if (node && !node.contains(event.target as Node)) setOpen(false)
    }
    onMounted(() => document.addEventListener('mousedown', onDoc))
    onBeforeUnmount(() => document.removeEventListener('mousedown', onDoc))

    return () => {
      const className = inplaceEditorModifierClasses(props, {
        open: open.value && !props.disabled,
      })
      if (props.disabled || !open.value) {
        return h(
          'div',
          {
            ref: root,
            class: className,
            onClick: props.disabled ? undefined : () => setOpen(true),
          },
          h(
            'div',
            { class: 'mmda-inplace-editor__display' },
            slots.display?.(),
          ),
        )
      }
      return h(
        'div',
        { ref: root, class: className },
        h(
          'div',
          { class: 'mmda-inplace-editor__content' },
          slots.content?.(),
        ),
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
    NaiveInplaceEditorHost,
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
