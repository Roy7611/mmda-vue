/*
 * Prime / Naive 共用：Web Speech API + 皮肤传入的按钮。
 * 不在 Logic 里碰 webkitSpeechRecognition。测 props 时不要真开麦。
 */
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import type {
  UiSpeechToTextController,
  UiSpeechToTextProps,
} from './speech_to_text'
import {
  emitSpeechToTextChange,
  speechToTextErrorCode,
  speechToTextInterimOf,
  speechToTextModifierClasses,
  speechToTextValueOf,
} from './speech_to_text'

export type UiSpeechToTextButtonContext = {
  listening: boolean
  disabled?: boolean
  toggle: () => void
  class: unknown[]
}

export type UiSpeechToTextRenderButton = (
  ctx: UiSpeechToTextButtonContext,
) => VNode

/** DOM lib 不一定带 Web Speech；宿主里自管最小形状。 */
type MmdaSpeechRecognitionResult = {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: { transcript: string }
}
type MmdaSpeechRecognitionEvent = {
  readonly results: {
    readonly length: number
    [index: number]: MmdaSpeechRecognitionResult
  }
}
type MmdaSpeechRecognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: MmdaSpeechRecognitionEvent) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

function speechRecognitionCtor(): (new () => MmdaSpeechRecognition) | undefined {
  const w = globalThis as typeof globalThis & {
    SpeechRecognition?: new () => MmdaSpeechRecognition
    webkitSpeechRecognition?: new () => MmdaSpeechRecognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export const MmdaSpeechToTextHost = defineComponent({
  name: 'MmdaSpeechToTextHost',
  props: {
    value: { type: String, default: undefined },
    modelValue: { type: [String, Number], default: undefined },
    lang: { type: String, default: undefined },
    interim: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    listening: { type: Boolean, default: undefined },
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    onChange: Function as PropType<UiSpeechToTextProps['onChange']>,
    onUpdate: Function as PropType<UiSpeechToTextProps['onUpdate']>,
    'onUpdate:modelValue': Function as PropType<
      UiSpeechToTextProps['onUpdate:modelValue']
    >,
    onListening: Function as PropType<UiSpeechToTextProps['onListening']>,
    onError: Function as PropType<UiSpeechToTextProps['onError']>,
    onReady: Function as PropType<UiSpeechToTextProps['onReady']>,
    renderButton: Function as PropType<UiSpeechToTextRenderButton>,
  },
  setup(props) {
    const listening = ref(Boolean(props.listening))
    let rec: MmdaSpeechRecognition | null = null

    const vuiProps = () => props as unknown as UiSpeechToTextProps

    const setListening = (next: boolean) => {
      listening.value = next
      props.onListening?.(next)
    }

    const stop = () => {
      rec?.stop()
      rec = null
      setListening(false)
    }

    const start = () => {
      if (props.disabled) return
      const Ctor = speechRecognitionCtor()
      if (!Ctor) {
        props.onError?.('unsupported-browser')
        return
      }
      rec?.stop()
      rec = new Ctor()
      rec.lang = props.lang || 'zh-CN'
      rec.interimResults = speechToTextInterimOf(vuiProps())
      rec.continuous = true
      rec.onresult = (event: MmdaSpeechRecognitionEvent) => {
        let text = ''
        for (let i = 0; i < event.results.length; i += 1) {
          text += event.results[i]?.[0]?.transcript ?? ''
        }
        emitSpeechToTextChange(vuiProps(), text)
      }
      rec.onerror = (event: { error?: string }) => {
        props.onError?.(speechToTextErrorCode(event.error ?? event))
      }
      rec.onend = () => {
        rec = null
        setListening(false)
      }
      rec.start()
      setListening(true)
    }

    const toggle = () => {
      if (listening.value) stop()
      else start()
    }

    const controller: UiSpeechToTextController = {
      start,
      stop,
      isListening: () => listening.value,
    }

    watch(
      () => props.listening,
      (next) => {
        if (next === true && !listening.value) start()
        if (next === false && listening.value) stop()
      },
    )

    onMounted(() => {
      props.onReady?.(controller)
      if (!speechRecognitionCtor()) {
        props.onError?.('unsupported-browser')
      }
      if (props.listening === true) start()
    })

    onBeforeUnmount(() => {
      rec?.abort()
      rec = null
    })

    return () => {
      const classes = speechToTextModifierClasses({
        ...vuiProps(),
        listening: listening.value,
      })
      if (props.renderButton) {
        return props.renderButton({
          listening: listening.value,
          disabled: props.disabled,
          toggle,
          class: classes,
        })
      }
      return h(
        'button',
        {
          type: 'button',
          class: classes,
          disabled: props.disabled,
          'data-lang': props.lang,
          'data-interim': speechToTextInterimOf(vuiProps()),
          'data-value': speechToTextValueOf(vuiProps()),
          onClick: toggle,
        },
        listening.value ? 'stop' : 'mic',
      )
    }
  },
})
