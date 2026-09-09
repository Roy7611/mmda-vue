import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export interface UiSpeechToTextController {
  start: () => void
  stop: () => void
  isListening: () => boolean
}

export interface UiSpeechToTextProps extends UiProps {
  value?: string
  lang?: string
  /** 缺省 true。对应 EJ2 allowInterimResults */
  interim?: boolean
  disabled?: boolean
  listening?: boolean
  onChange?: (value: string) => void
  onListening?: (listening: boolean) => void
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
    uiCssClass('speech-to-text'),
    props.listening ? uiCssClass('speech-to-text', 'listening') : undefined,
    props.disabled ? uiCssClass('speech-to-text', 'disabled') : undefined,
    props.class,
  ]
}
