import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import { callUiPropFn, type UiProps } from '../props'

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
      : props.modelValue !== undefined
        ? Boolean(props.modelValue)
        : false
  return [
    uiCssClass('switch'),
    checked ? uiCssClass('switch', 'checked') : undefined,
    props.disabled ? uiCssClass('switch', 'disabled') : undefined,
    props.class,
  ]
}

export function switchArgs(
  valueOrProps?: boolean | UiSwitchProps | null,
  props: UiSwitchProps = {},
): UiSwitchProps {
  if (
    valueOrProps != null &&
    (typeof valueOrProps !== 'object' || Array.isArray(valueOrProps))
  ) {
    return { ...props, checked: Boolean(valueOrProps) }
  }
  return { ...(valueOrProps as UiSwitchProps | undefined), ...props }
}

export function switchCheckedOf(props: UiSwitchProps): boolean {
  if (props.checked !== undefined) return Boolean(props.checked)
  if (props.modelValue !== undefined) return Boolean(props.modelValue)
  return false
}

export function emitSwitchChange(
  props: UiSwitchProps,
  checked: boolean,
): void {
  props.onChange?.(checked)
  callUiPropFn(props, 'onUpdate:modelValue', checked)
  callUiPropFn(props, 'onUpdate', checked)
}

export function switchPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiSwitchProps {
  return {
    checked: Boolean(context.getFieldValue(field)),
    onLabel: extra.onLabel as string | undefined,
    offLabel: extra.offLabel as string | undefined,
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
