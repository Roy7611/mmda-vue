import { h, reactive } from 'vue'
import { NSelect } from 'naive-ui'
import type { UiDropDownListProps, UiSelectOption } from '@mmda/core'
import { SELECT_DEBOUNCE_MS, SELECT_MIN_LENGTH, dropDownListModifierClasses, dropDownListValueOf, emitDropDownListChange, nestSelectOptionsByGroup, normalizeSelectOption, selectOptionsGrouped, selectOptionsHaveIcon, selectOptionsOf } from '@mmda/core'
import { htmlAttributesOf } from '@mmda/vui'

export function naiveSelectOptions(options: UiSelectOption[]) {
  if (!selectOptionsGrouped(options)) {
    return options.map(option => ({
      label: option.label,
      value: option.value,
      icon: option.icon,
    }))
  }
  return nestSelectOptionsByGroup(options).map(group => ({
    type: 'group' as const,
    label: group.label,
    key: group.label,
    children: group.options.map(option => ({
      label: option.label,
      value: option.value,
      icon: option.icon,
    })),
  }))
}

export function naiveSelectRenderLabel(options: UiSelectOption[]) {
  if (!selectOptionsHaveIcon(options)) return undefined
  return (option: { label?: string; icon?: string }) =>
    h('span', { class: 'mmda-dropdown-list__item' }, [
      option.icon ? h('i', { class: option.icon }) : null,
      option.label,
    ])
}

export function createDropDownList(props: UiDropDownListProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    placeholder,
    disabled,
    allowFiltering,
    suggest,
    minLength,
    debounceDelay,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  const local = selectOptionsOf(props)
  const state = reactive({ options: naiveSelectOptions(local) })
  const filterMin = minLength ?? SELECT_MIN_LENGTH
  let timer: ReturnType<typeof setTimeout> | undefined

  const applySuggest = (query: string) => {
    if (!suggest) return
    if (query.length < filterMin) {
      state.options = []
      return
    }
    void Promise.resolve(suggest(query)).then(rows => {
      state.options = naiveSelectOptions(
        (rows ?? []).map(item =>
          normalizeSelectOption(item as string | UiSelectOption),
        ),
      )
    })
  }

  return h(NSelect, {
    ...rest,
    ...htmlAttributesOf(props),
    value: dropDownListValueOf(props) ?? null,
    options: state.options,
    placeholder,
    disabled,
    filterable: allowFiltering !== false && !suggest,
    class: [...dropDownListModifierClasses(props)].flat(),
    renderLabel: naiveSelectRenderLabel(local),
    onSearch: suggest
      ? (query: string) => {
          const delay = debounceDelay ?? SELECT_DEBOUNCE_MS
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => applySuggest(query), delay)
        }
      : undefined,
    'onUpdate:value': (next: string | number | null) =>
      emitDropDownListChange(props, next ?? null),
  })
}
