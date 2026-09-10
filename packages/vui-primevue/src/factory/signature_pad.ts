/*
 * chrome 签名面板走 factory.signaturePad。vui 名是 signaturePad。
 * 非 SF：szimek signature_pad。velocity / persist / rtl / onBeforeSave / save / draw / jpeg|svg 忽略或 no-op。
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
import SignaturePad from 'signature_pad'
import type { UiSignaturePadAction, UiSignaturePadController, UiSignaturePadFileType, UiSignaturePadProps } from '@mmda/core'
import { signaturePadBlobOf, signaturePadModifierClasses, signaturePadSizeCss, signaturePadValueOf } from '@mmda/core'
import { emitSignaturePadChange } from '@mmda/vui'
import { htmlAttributesOf } from '@mmda/vui'

type Stroke = ReturnType<SignaturePad['toData']>[number]

const MmdaSignaturePad = defineComponent({
  name: 'MmdaSignaturePad',
  props: {
    value: { type: String, default: undefined },
    modelValue: { type: String, default: undefined },
    width: { type: [String, Number], default: undefined },
    height: { type: [String, Number], default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    strokeColor: { type: String, default: undefined },
    backgroundColor: { type: String, default: undefined },
    backgroundImage: { type: String, default: undefined },
    minStrokeWidth: { type: Number, default: undefined },
    maxStrokeWidth: { type: Number, default: undefined },
    saveWithBackground: { type: Boolean, default: undefined },
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    onChange: Function as PropType<UiSignaturePadProps['onChange']>,
    onUpdate: Function as PropType<UiSignaturePadProps['onUpdate']>,
    'onUpdate:modelValue': Function as PropType<
      UiSignaturePadProps['onUpdate:modelValue']
    >,
    onReady: Function as PropType<UiSignaturePadProps['onReady']>,
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement>()
    let pad: SignaturePad | null = null
    const redoStack: Stroke[] = []
    let skipEmit = false
    let applying = false

    const vuiProps = () => props as unknown as UiSignaturePadProps

    const resize = () => {
      const el = canvas.value
      if (!el) return
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const width = el.offsetWidth || 300
      const height = el.offsetHeight || 150
      el.width = width * ratio
      el.height = height * ratio
      const ctx = el.getContext('2d')
      ctx?.scale(ratio, ratio)
    }

    const pngOf = () => {
      if (!pad || pad.isEmpty()) return ''
      return pad.toDataURL('image/png')
    }

    const emitValue = (action?: UiSignaturePadAction) => {
      skipEmit = true
      emitSignaturePadChange(vuiProps(), pngOf(), action)
    }

    const applyValue = (raw: string) => {
      if (!pad) return
      applying = true
      redoStack.length = 0
      if (!raw) pad.clear()
      else pad.fromDataURL(raw)
      applying = false
    }

    const controller = (): UiSignaturePadController => ({
      clear: () => {
        pad?.clear()
        redoStack.length = 0
        emitValue('clear')
      },
      undo: () => {
        if (!pad) return
        const data = pad.toData()
        if (!data.length) return
        redoStack.push(data[data.length - 1])
        pad.fromData(data.slice(0, -1))
        emitValue('undo')
      },
      redo: () => {
        if (!pad) return
        const stroke = redoStack.pop()
        if (!stroke) return
        pad.fromData([...pad.toData(), stroke])
        emitValue('redo')
      },
      isEmpty: () => Boolean(pad?.isEmpty()),
      canUndo: () => Boolean(pad && pad.toData().length > 0),
      canRedo: () => redoStack.length > 0,
      refresh: () => {
        const data = pad?.toData() ?? []
        resize()
        pad?.fromData(data)
      },
      getDataUrl: (type?: UiSignaturePadFileType) => {
        if (type && type !== 'png') return ''
        return pngOf()
      },
      getBlob: () => signaturePadBlobOf(pngOf()),
      save: () => undefined,
      load: (dataUrl) => applyValue(dataUrl),
      draw: () => undefined,
    })

    onMounted(() => {
      const el = canvas.value
      if (!el) return
      resize()
      pad = new SignaturePad(el, {
        minWidth: props.minStrokeWidth ?? 0.5,
        maxWidth: props.maxStrokeWidth ?? 2,
        penColor: props.strokeColor ?? '#000000',
        backgroundColor: props.backgroundColor ?? 'rgba(0,0,0,0)',
      })
      pad.addEventListener('endStroke', () => {
        if (applying) return
        redoStack.length = 0
        emitValue('mouseUp')
      })
      applyValue(signaturePadValueOf(vuiProps()))
      props.onReady?.(controller())
    })

    onBeforeUnmount(() => {
      pad?.off()
      pad = null
    })

    watch(
      () => [props.value, props.modelValue],
      () => {
        if (skipEmit) {
          skipEmit = false
          return
        }
        applyValue(signaturePadValueOf(vuiProps()))
      },
    )

    watch(
      () => [props.strokeColor, props.minStrokeWidth, props.maxStrokeWidth, props.backgroundColor],
      () => {
        if (!pad) return
        pad.minWidth = props.minStrokeWidth ?? 0.5
        pad.maxWidth = props.maxStrokeWidth ?? 2
        pad.penColor = props.strokeColor ?? '#000000'
        pad.backgroundColor = props.backgroundColor ?? 'rgba(0,0,0,0)'
      },
    )

    return () => {
      const width = signaturePadSizeCss(props.width) ?? '100%'
      const height = signaturePadSizeCss(props.height) ?? '150px'
      const locked = Boolean(props.disabled || props.readOnly)
      return h('div', {
        ...htmlAttributesOf(vuiProps()),
        class: signaturePadModifierClasses(vuiProps()),
        style: {
          width,
          height,
          backgroundImage: props.backgroundImage
            ? `url(${props.backgroundImage})`
            : undefined,
          backgroundSize: props.backgroundImage ? 'cover' : undefined,
          pointerEvents: locked ? 'none' : undefined,
        },
      }, [
        h('canvas', {
          ref: canvas,
          class: 'mmda-signature-pad__canvas',
          style: { width: '100%', height: '100%', display: 'block' },
        }),
      ])
    }
  },
})

export function createSignaturePad(props: UiSignaturePadProps) {
  return h(MmdaSignaturePad, {
    value: props.value,
    modelValue: props.modelValue,
    width: props.width,
    height: props.height,
    disabled: props.disabled,
    readOnly: props.readOnly,
    strokeColor: props.strokeColor,
    backgroundColor: props.backgroundColor,
    backgroundImage: props.backgroundImage,
    minStrokeWidth: props.minStrokeWidth,
    maxStrokeWidth: props.maxStrokeWidth,
    saveWithBackground: props.saveWithBackground,
    class: signaturePadModifierClasses(props),
    htmlAttributes: props.htmlAttributes,
    onChange: props.onChange,
    onUpdate: props.onUpdate,
    'onUpdate:modelValue': props['onUpdate:modelValue'],
    onReady: props.onReady,
  })
}
