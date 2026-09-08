import { h } from 'vue'
import {
  MmdaSpeechToTextHost,
  speechToTextInterimOf,
  speechToTextValueOf,
  type UiSpeechToTextProps,
} from '@mmda/vui'
import { createButton } from './button'

export function createSpeechToText(
  props: UiSpeechToTextProps = {},
  resolveIcon: (icon: string) => string = (icon) => icon,
) {
  const {
    value: _value,
    modelValue: _modelValue,
    class: _className,
    htmlAttributes,
    ...rest
  } = props

  return h(MmdaSpeechToTextHost, {
    ...rest,
    value: speechToTextValueOf(props),
    lang: props.lang,
    interim: speechToTextInterimOf(props),
    disabled: props.disabled,
    listening: props.listening,
    class: props.class,
    htmlAttributes,
    renderButton: (ctx) =>
      createButton(
        {
          type: 'button',
          disabled: ctx.disabled,
          colorRole: ctx.listening ? 'danger' : 'primary',
          icon: ctx.listening ? 'stop' : 'mic',
          class: ctx.class,
          onClick: ctx.toggle,
        },
        undefined,
        resolveIcon,
      ),
  })
}
