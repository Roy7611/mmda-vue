import { h } from 'vue'
import { NInput } from 'naive-ui'
import type { UiTextInputProps } from '@mmda/core'
import { emitTextInputBlur, emitTextInputChange, emitTextInputFocus, textInputAutocompleteOf, textInputDisabledOf, textInputMaxLengthOf, textInputModifierClasses, textInputPlaceholderOf, textInputReadonlyOf, textInputShowClearButtonOf, textInputTypeOf, textInputValueOf } from '@mmda/core'
import { htmlAttributesOf } from '@mmda/vui'

export function createTextInput(props: UiTextInputProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    placeholder: _placeholder,
    disabled: _disabled,
    readonly: _readonly,
    type: _type,
    maxLength: _maxLength,
    showClearButton: _showClear,
    autocomplete: _autocomplete,
    width,
    onChange: _onChange,
    onFocus: _onFocus,
    onBlur: _onBlur,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  const maxLength = textInputMaxLengthOf(props)
  const autocomplete = textInputAutocompleteOf(props)
  const type = textInputTypeOf(props)

  return h(NInput, {
    ...rest,
    ...htmlAttributesOf(props),
    value: textInputValueOf(props),
    placeholder: textInputPlaceholderOf(props),
    disabled: textInputDisabledOf(props),
    readonly: textInputReadonlyOf(props),
    ...(type === 'Password' ? { type: 'password' } : {}),
    ...(maxLength != null ? { maxlength: maxLength } : {}),
    clearable: textInputShowClearButtonOf(props),
    ...(autocomplete ? { inputProps: { autocomplete } } : {}),
    ...(width != null ? { style: { width } } : {}),
    class: textInputModifierClasses(props).flat(),
    'onUpdate:value': (next: unknown) => emitTextInputChange(props, next),
    onFocus: () => emitTextInputFocus(props),
    onBlur: () => emitTextInputBlur(props),
  })
}
