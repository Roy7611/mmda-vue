import {
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
} from 'vue'
import type { UiQrCodeProps } from '@mmda/vui'
import {
  codeSizeCss,
  codeSizePx,
  qrCodeModifierClasses,
  resolveBarcodeCaption,
} from '@mmda/vui'

const QrCanvas = defineComponent({
  name: 'MmdaQrCanvas',
  props: {
    value: { type: String, required: true },
    sizePx: { type: Number, required: true },
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement>()
    const draw = async () => {
      if (!canvas.value) return
      const { toCanvas } = await import('qrcode')
      await toCanvas(canvas.value, props.value, {
        width: props.sizePx,
        margin: 0,
      })
    }
    onMounted(() => void draw())
    watch(
      () => [props.value, props.sizePx],
      () => void draw(),
    )
    return () =>
      h('canvas', {
        ref: canvas,
        class: 'mmda-qrcode__canvas',
        role: 'img',
        'aria-label': props.value,
      })
  },
})

export function createQrCode(props: UiQrCodeProps) {
  const {
    value,
    format,
    width,
    height,
    showValue,
    displayText,
    class: className,
    htmlAttributes,
    ...rest
  } = props
  const caption = resolveBarcodeCaption(value, displayText, showValue, false)
  const classList = ['mmda-qrcode', qrCodeModifierClasses(format), className]
  const style = {
    width: codeSizeCss(width, '160px'),
    height: codeSizeCss(height, '160px'),
    ...(typeof rest.style === 'object' ? rest.style : {}),
  }
  if (format === 'dataMatrix') {
    return h(
      'span',
      {
        ...rest,
        ...htmlAttributes,
        class: [...classList, 'mmda-qrcode--unsupported'],
        style,
        role: 'img',
        'aria-label': value,
      },
      value,
    )
  }
  const canvas = h(QrCanvas as any, {
    value,
    sizePx: Math.min(codeSizePx(width, 160), codeSizePx(height, 160)),
  })
  return h(
    'span',
    {
      ...rest,
      ...htmlAttributes,
      class: classList,
      style,
    },
    caption.visible
      ? [canvas, h('span', { class: 'mmda-qrcode__text' }, caption.text)]
      : [canvas],
  )
}
