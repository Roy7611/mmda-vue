import { h } from 'vue'
import { NInput } from 'naive-ui'
import type { UiOneTimePasswordInputProps } from '@mmda/vui'
import {
  emitOneTimePasswordChange,
  htmlAttributesOf,
  oneTimePasswordLengthOf,
  oneTimePasswordModifierClasses,
  oneTimePasswordTypeOf,
  oneTimePasswordValueOf,
} from '@mmda/vui'

export function createOneTimePasswordInput(
  props: UiOneTimePasswordInputProps,
) {
  const {
    value: _value,
    modelValue: _modelValue,
    length: _length,
    type: _type,
    separator,
    placeholder,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  const length = oneTimePasswordLengthOf(props)
  const type = oneTimePasswordTypeOf(props)
  const current = oneTimePasswordValueOf(props)
  const chars = current.split('')
  const isDisabled = disabled === true || disabled === 'true'
  const children = [] as ReturnType<typeof h>[]

  for (let i = 0; i < length; i += 1) {
    if (i > 0 && separator) {
      children.push(
        h('span', { class: 'mmda-otpinput__sep', key: `sep-${i}` }, separator),
      )
    }
    children.push(
      h(NInput, {
        key: i,
        ...rest,
        ...htmlAttributesOf(props),
        value: chars[i] ?? '',
        maxlength: 1,
        placeholder: i === 0 ? placeholder : undefined,
        disabled: isDisabled,
        type: type === 'password' ? 'password' : 'text',
        inputProps:
          type === 'number'
            ? { inputmode: 'numeric', pattern: '[0-9]*' }
            : undefined,
        class: 'mmda-otpinput__cell',
        'onUpdate:value': (next: string | null) => {
          let ch = next ?? ''
          if (type === 'number') ch = ch.replace(/\D/g, '')
          ch = ch.slice(-1)
          const nextChars: string[] = []
          for (let j = 0; j < length; j += 1) {
            nextChars[j] = j === i ? ch : (chars[j] ?? '')
          }
          emitOneTimePasswordChange(props, nextChars.join(''))
        },
      }),
    )
  }

  return h(
    'div',
    {
      class: [...oneTimePasswordModifierClasses(props)].flat(),
    },
    children,
  )
}
