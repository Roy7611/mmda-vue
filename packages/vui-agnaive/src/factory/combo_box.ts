import { h, reactive } from 'vue'
import { NAutoComplete, NSelect } from 'naive-ui'
import type { UiComboBoxProps, UiSelectOption } from '@mmda/core'
import { SELECT_DEBOUNCE_MS, SELECT_MIN_LENGTH, comboBoxAllowCustom, comboBoxModifierClasses, comboBoxValueOf, emitComboBoxChange, normalizeSelectOption, selectOptionsOf } from '@mmda/core'
import { htmlAttributesOf } from '@mmda/vui'
import { naiveSelectOptions, naiveSelectRenderLabel } from './drop_down_list'

export function createComboBox(props: UiComboBoxProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    placeholder,
    disabled,
    allowFiltering,
    allowCustom: _allowCustom,
    suggest,
    minLength,
    debounceDelay,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  const local = selectOptionsOf(props)
  const custom = comboBoxAllowCustom(props)
  const className = [...comboBoxModifierClasses(props)].flat()
  const filterMin = minLength ?? SELECT_MIN_LENGTH

  if (!custom) {
    return h(NSelect as any, {
      ...rest,
      ...htmlAttributesOf(props),
      value: comboBoxValueOf(props) ?? null,
      options: naiveSelectOptions(local),
      placeholder,
      disabled: disabled,
      filterable: allowFiltering !== false,
      class: className,
      renderLabel: naiveSelectRenderLabel(local),
      'onUpdate:value': (next: string | number | null) =>
        emitComboBoxChange(props, next ?? null),
    })
  }

  const state = reactive({
    options: local.map(option => ({ label: option.label, value: option.value })),
  })
  let timer: ReturnType<typeof setTimeout> | undefined

  const applyQuery = (query: string) => {
    if (query.length < filterMin) {
      state.options = []
      return
    }
    if (suggest) {
      void Promise.resolve(suggest(query)).then(rows => {
        state.options = (rows ?? []).map(item => {
          const option = normalizeSelectOption(item as string | UiSelectOption)
          return { label: option.label, value: option.value }
        })
      })
      return
    }
    const q = query.toLowerCase()
    state.options = local
      .filter(
        option =>
          option.label.toLowerCase().includes(q) ||
          String(option.value).toLowerCase().includes(q),
      )
      .map(option => ({ label: option.label, value: option.value }))
  }

  return h(NAutoComplete as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: comboBoxValueOf(props) ?? null,
    options: state.options,
    placeholder,
    disabled: disabled,
    class: className,
    'onUpdate:value': (next: string | number | null) => {
      emitComboBoxChange(props, next ?? null)
      const delay = debounceDelay ?? SELECT_DEBOUNCE_MS
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => applyQuery(String(next ?? '')), delay)
    },
  })
}
