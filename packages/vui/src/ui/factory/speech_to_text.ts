/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/speech-to-text/vue-3-getting-started
 *
 * chrome 语音转写走 factory.speechToText。vui 名是 speechToText / value / interim / listening，
 * 不要 SpeechToTextComponent / ejs-speechtotext / transcript / allowInterimResults / listeningState。
 * 没有 fldFactory.speechToText。普通文本仍是 factory.textInput。不要和 aiAssistant 混。
 */
import type { PropData } from '../layout/layout'

export interface UiSpeechToTextController {
  start: () => void
  stop: () => void
  isListening: () => boolean
}

export interface UiSpeechToTextProps extends PropData {
  /** 转写。也认 modelValue。不要公开名 transcript */
  value?: string
  /** BCP 47，如 zh-CN / en-US */
  lang?: string
  /** 缺省 true。对应 EJ2 allowInterimResults */
  interim?: boolean
  disabled?: boolean
  /** 受控：是否在听。对应 listeningState === Listening */
  listening?: boolean
  onChange?: (value: string) => void
  onListening?: (listening: boolean) => void
  /** no-speech / not-allowed / unsupported-browser / … */
  onError?: (code: string) => void
  onReady?: (ctl: UiSpeechToTextController) => void
}

export function speechToTextValueOf(props: UiSpeechToTextProps): string {
  if (props.value !== undefined && props.value != null) return String(props.value)
  if (props.modelValue !== undefined && props.modelValue != null) {
    return String(props.modelValue)
  }
  return ''
}

export function speechToTextInterimOf(props: UiSpeechToTextProps): boolean {
  return props.interim !== false
}

export function emitSpeechToTextChange(
  props: UiSpeechToTextProps,
  value: unknown,
): void {
  const next = value == null ? '' : String(value)
  props.onChange?.(next)
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

export function speechToTextErrorCode(raw: unknown): string {
  if (raw == null || raw === '') return 'default'
  if (typeof raw === 'object') {
    const code = (raw as { error?: unknown }).error
    if (code != null && code !== '') return String(code)
  }
  return String(raw)
}

export function speechToTextModifierClasses(
  props: UiSpeechToTextProps = {},
): unknown[] {
  return [
    'mmda-speech-to-text',
    props.listening ? 'mmda-speech-to-text--listening' : undefined,
    props.disabled ? 'mmda-speech-to-text--disabled' : undefined,
    props.class,
  ]
}
