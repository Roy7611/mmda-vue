import {
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'

export const CodeImage = defineComponent({
  name: 'MmdaCodeImage',
  props: {
    value: { type: String, required: true },
    type: {
      type: String as PropType<'qr' | 'barcode'>,
      default: 'qr',
    },
    width: { type: Number, default: 256 },
    margin: { type: Number, default: 2 },
    barcodeFormat: { type: String, default: 'CODE128' },
  },
  emits: ['error'],
  setup(props, { emit }) {
    const canvas = ref<HTMLCanvasElement>()

    const draw = async () => {
      if (!canvas.value) return
      try {
        if (props.type === 'barcode') {
          const { default: JsBarcode } = await import('jsbarcode')
          JsBarcode(canvas.value, props.value, {
            format: props.barcodeFormat,
            width: Math.max(1, props.width / 128),
            margin: props.margin,
          })
        } else {
          const { toCanvas } = await import('qrcode')
          await toCanvas(canvas.value, props.value, {
            width: props.width,
            margin: props.margin,
          })
        }
      } catch (error) {
        emit('error', error)
      }
    }

    onMounted(() => void draw())
    watch(
      () => [props.value, props.type, props.width, props.margin],
      () => void draw(),
    )

    return () =>
      h('canvas', {
        ref: canvas,
        class: ['mmda-code-image', `is-${props.type}`],
        role: 'img',
        'aria-label': props.value,
      })
  },
})
