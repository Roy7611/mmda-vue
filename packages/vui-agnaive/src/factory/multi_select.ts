import { h } from 'vue'
import { NSelect } from 'naive-ui'
import type { UiMultiSelectProps } from '@mmda/core'
import { applyAndEmitMultiSelectKeys, multiSelectChromeOptionsOf, multiSelectModifierClasses, multiSelectOptionKeyOf, multiSelectOptionLabelOf, multiSelectSelectedKeysOf, withMultiSelectBindMode } from '@mmda/core'
import { htmlAttributesOf } from '@mmda/vui'

function optionsOf(props: UiMultiSelectProps) {
  return multiSelectChromeOptionsOf(props).map(item => ({
    value: multiSelectOptionKeyOf(item, props),
    label: multiSelectOptionLabelOf(item, props),
  }))
}

export function createMultiSelect(props: UiMultiSelectProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    bindMode: _bindMode,
    valueField: _valueField,
    labelField: _labelField,
    separator: _separator,
    display,
    placeholder,
    disabled,
    allowFiltering,
    suggest: _suggest,
    reference: _reference,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  return h(NSelect, {
    ...rest,
    ...htmlAttributesOf(props),
    value: multiSelectSelectedKeysOf(props),
    options: optionsOf(props),
    multiple: true,
    placeholder,
    disabled,
    filterable: allowFiltering !== false,
    maxTagCount: display === 'text' ? undefined : 'responsive',
    class: [...multiSelectModifierClasses(props)].flat(),
    'onUpdate:value': (next: unknown) => {
      applyAndEmitMultiSelectKeys(props, Array.isArray(next) ? next : [])
    },
  })
}

export function createMultiItemSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, 'item_array'))
}

export function createMultiValueSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, 'value_array'))
}

export function createMultiTextSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, 'join_text'))
}

export function createMultiBitSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, 'or_bits'))
}
