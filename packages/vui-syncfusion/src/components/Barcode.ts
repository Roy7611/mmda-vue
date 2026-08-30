import { defineComponent, defineAsyncComponent, h, type PropType } from 'vue'

const BarcodeImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-barcode-generator')
    return { default: mod.BarcodeGeneratorComponent as any }
  } catch {
    return {
      default: defineComponent({
        props: { value: String },
        setup: props => () => h('span', props.value),
      }),
    }
  }
})

const QrImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-barcode-generator')
    return { default: mod.QRCodeGeneratorComponent as any }
  } catch {
    return {
      default: defineComponent({
        props: { value: String },
        setup: props => () => h('span', props.value),
      }),
    }
  }
})

export const BarcodeGenerator = defineComponent({
  name: 'BarcodeGenerator',
  props: {
    value: { type: String, required: true },
    type: { type: String, default: 'Code128' },
    width: { type: [String, Number], default: '200px' },
    height: { type: [String, Number], default: '80px' },
  },
  setup(props) {
    return () => h(BarcodeImpl, { ...props })
  },
})

export const QRCodeGenerator = defineComponent({
  name: 'QRCodeGenerator',
  props: {
    value: { type: String, required: true },
    width: { type: [String, Number], default: '160px' },
    height: { type: [String, Number], default: '160px' },
  },
  setup(props) {
    return () => h(QrImpl, { ...props })
  },
})
