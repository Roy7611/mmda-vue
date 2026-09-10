import { h } from 'vue'
import { NButton, NButtonGroup } from 'naive-ui'
import type { UiSelectButtonGroupProps } from '@mmda/core'
import { selectButtonGroupSelected, selectButtonOptionLabel, selectButtonOptionValue, toggleSelectButtonGroupValue } from '@mmda/core'
import { selectButtonGroupUpdateOf } from '@mmda/vui'
export function createSelectButtonGroup(
  value: unknown,
  props: UiSelectButtonGroupProps = {},
) {
  const {
    options = [],
    optionLabel,
    optionValue,
    selectionMode,
    modelValue,
    onUpdate: _onUpdate,
    htmlAttributes,
    class: className,
    orientation,
    ...rest
  } = props
  const current = modelValue ?? value
  const emit = selectButtonGroupUpdateOf(props)
  return h(
    NButtonGroup,
    {
      ...rest,
      ...htmlAttributes,
      vertical: orientation === 'vertical',
      class: [
        'mmda-select-button-group',
        'mmda-select-button-group',
        className,
      ].filter(Boolean),
    },
    {
      default: () =>
        options.map((option) => {
          const itemValue = selectButtonOptionValue(option, optionValue)
          const itemLabel = selectButtonOptionLabel(option, optionLabel)
          const selected = selectButtonGroupSelected(
            current,
            itemValue,
            selectionMode,
          )
          return h(
            NButton,
            {
              type: selected ? 'primary' : 'default',
              secondary: selected,
              onClick: () =>
                emit?.(
                  toggleSelectButtonGroupValue(
                    current,
                    itemValue,
                    selectionMode,
                  ),
                ),
            },
            { default: () => itemLabel },
          )
        }),
    },
  )
}
