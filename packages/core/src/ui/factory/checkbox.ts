import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'

export interface UiCheckBoxProps extends UiProps {
  checked?: boolean
  label?: string
  indeterminate?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function checkBoxModifierClasses(props: UiCheckBoxProps): unknown[] {
  const indeterminate =
    props.indeterminate === true
      ? uiCssClass('checkbox', undefined, 'indeterminate')
      : undefined
  return [uiCssClass('checkbox'), indeterminate, props.class]
}

export function checkBoxCheckedOf(props: UiCheckBoxProps): boolean {
  if (props.checked !== undefined) return Boolean(props.checked)
  if (props.modelValue !== undefined) return Boolean(props.modelValue)
  return false
}

export function checkBoxPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiCheckBoxProps {
  const label =
    extra.label === '' ? '' : ((extra.label as string | undefined) ?? field.displayLabel)
  return {
    checked: Boolean(context.getFieldValue(field)),
    label,
    indeterminate: extra.indeterminate === true ? true : undefined,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    onChange: (checked) => {
      context.setFieldValue(field, checked)
      if (typeof extra.onChange === 'function') extra.onChange(checked)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(checked)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}
