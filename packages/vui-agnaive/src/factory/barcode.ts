import {
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
} from 'vue'
import type { UiBarcodeFormat, UiBarcodeProps } from '@mmda/vui'
import {
  barcodeFormatClass,
  codeSizeCss,
  codeSizePx,
  resolveBarcodeCaption,
} from '@mmda/vui'

const JSBARCODE_FORMAT: Partial<Record<UiBarcodeFormat, string>> = {
  code128: 'CODE128',
  code128A: 'CODE128A',
  code128B: 'CODE128B',
  code128C: 'CODE128C',
  code39: 'CODE39',
  code93: 'CODE93',
  codabar: 'codabar',
  ean8: 'EAN8',
  ean13: 'EAN13',
  upcA: 'UPC',
  upcE: 'UPCE',
}

const BarcodeCanvas = defineComponent({
  name: 'MmdaBarcodeCanvas',
  props: {
    value: { type: String, required: true },
    jsFormat: { type: String, required: true },
    widthPx: { type: Number, required: true },
    displayValue: { type: Boolean, required: true },
    text: { type: String, required: true },
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement>()
    const draw = async () => {
      if (!canvas.value) return
      const { default: JsBarcode } = await import('jsbarcode')
      JsBarcode(canvas.value, props.value, {
        format: props.jsFormat,
        width: Math.max(1, props.widthPx / 128),
        displayValue: props.displayValue,
        text: props.text,
        margin: 0,
      })
    }
    onMounted(() => void draw())
    watch(
      () => [props.value, props.jsFormat, props.widthPx, props.displayValue, props.text],
      () => void draw(),
    )
    return () =>
      h('canvas', {
        ref: canvas,
        class: 'mmda-barcode__canvas',
        role: 'img',
        'aria-label': props.value,
      })
  },
})

export function createBarcode(props: UiBarcodeProps) {
  const {
    value,
    format = 'code128',
    width,
    height,
    showValue,
    displayText,
    class: className,
    htmlAttributes,
    ...rest
  } = props
  const jsFormat = JSBARCODE_FORMAT[format]
  const caption = resolveBarcodeCaption(value, displayText, showValue, true)
  const classList = [
    'mmda-barcode',
    barcodeFormatClass(format),
    jsFormat ? undefined : 'mmda-barcode--unsupported',
    className,
  ]
  const style = {
    width: codeSizeCss(width, '200px'),
    height: codeSizeCss(height, '80px'),
    ...(typeof rest.style === 'object' ? rest.style : {}),
  }
  if (!jsFormat) {
    return h(
      'span',
      {
        ...rest,
        ...htmlAttributes,
        class: classList,
        style,
        role: 'img',
        'aria-label': value,
      },
      value,
    )
  }
  return h(BarcodeCanvas as any, {
    ...rest,
    ...htmlAttributes,
    value,
    jsFormat,
    widthPx: codeSizePx(width, 200),
    displayValue: caption.visible,
    text: caption.text,
    class: classList,
    style,
  })
}
