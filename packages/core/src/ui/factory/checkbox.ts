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
  return false
}

export function checkBoxPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext
): UiCheckBoxProps {
  const label =
    (field.displayLabel)
  return {
    checked: Boolean(context.getFieldValue(field)),
    label,
    disabled:
      context.isFieldReadonly(field),
    onChange: (checked) => {
      context.setFieldValue(field, checked)
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}
