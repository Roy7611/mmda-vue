import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
export interface UiSwitchProps extends UiProps {
  checked?: boolean
  onLabel?: string
  offLabel?: string
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function switchModifierClasses(props: UiSwitchProps): unknown[] {
  const checked =
    props.checked !== undefined
      ? Boolean(props.checked)

        : false
  return [
    uiCssClass('switch'),
    checked ? uiCssClass('switch', undefined, 'checked') : undefined,
    props.disabled ? uiCssClass('switch', undefined, 'disabled') : undefined,
    props.class,
  ]
}

export function switchCheckedOf(props: UiSwitchProps): boolean {
  if (props.checked !== undefined) return Boolean(props.checked)
  return false
  return false
}

export function switchPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext
): UiSwitchProps {
  return {
    checked: Boolean(context.getFieldValue(field)),
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
