import { describe, expect, it, vi } from 'vitest'
import {
  emitSpeechToTextChange,
  speechToTextErrorCode,
  speechToTextInterimOf,
  speechToTextModifierClasses,
  speechToTextValueOf,
} from '../ui/factory/speech_to_text'

describe('speech to text chrome helpers', () => {
  it('reads value then modelValue and defaults interim true', () => {
    expect(speechToTextValueOf({ value: '你好' })).toBe('你好')
    expect(speechToTextValueOf({ modelValue: 1 } as any)).toBe('1')
    expect(speechToTextInterimOf({})).toBe(true)
    expect(speechToTextInterimOf({ interim: false })).toBe(false)
  })

  it('emits onChange and model updates; maps error codes', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const onModel = vi.fn()
    emitSpeechToTextChange(
      {
        onChange,
        onUpdate,
        'onUpdate:modelValue': onModel,
      },
      'ok',
    )
    expect(onChange).toHaveBeenCalledWith('ok')
    expect(onUpdate).toHaveBeenCalledWith('ok')
    expect(onModel).toHaveBeenCalledWith('ok')
    expect(speechToTextErrorCode({ error: 'not-allowed' })).toBe('not-allowed')
    expect(speechToTextErrorCode('no-speech')).toBe('no-speech')
  })

  it('hooks listening and disabled classes', () => {
    const classes = speechToTextModifierClasses({
      listening: true,
      disabled: true,
    })
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-speech-to-text')
    expect(classes).toContain('mmda-speech-to-text--listening')
    expect(classes).toContain('mmda-speech-to-text--disabled')
  })
})
