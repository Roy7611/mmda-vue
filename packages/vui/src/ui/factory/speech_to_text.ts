/*
 * chrome 语音转写走 factory.speechToText。
 * 契约在 @mmda/core ui/speech_to_text.ts。
 */
import type { UiSpeechToTextProps } from '@mmda/core'

export type { UiSpeechToTextController, UiSpeechToTextProps } from '@mmda/core'
export {
  speechToTextErrorCode,
  speechToTextInterimOf,
  speechToTextModifierClasses,
  speechToTextValueOf,
} from '@mmda/core'

export function emitSpeechToTextChange(
  props: UiSpeechToTextProps,
  value: unknown,
): void {
  const next = value == null ? '' : String(value)
  props.onChange?.(next)
  ;(props as { 'onUpdate:modelValue'?: (v: string) => void })['onUpdate:modelValue']?.(
    next,
  )
  ;(props as { onUpdate?: (v: string) => void }).onUpdate?.(next)
}
