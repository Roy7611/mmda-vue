import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiOrientation } from '../layout'
import type { UiFieldBindContext } from '../field_factory'
import { type UiProps } from '../props'
import { uiCssClass, UI_CSS_PREFIX } from '../css'
import {
  selectButtonGroupSelected,
  selectButtonOptionLabel,
  selectButtonOptionValue,
} from './button'
import {
  isSelectOptionsGroupedField,
  selectFieldOptionSource,
  selectFieldValueOf,
  selectFieldWritebackOf,
  selectOptionFromSource,
  type UiSelectOption,
} from './select_common'

export interface UiRadioButtonGroupProps extends UiProps {
  value?: unknown
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  /** 缺省 horizontal */
  orientation?: UiOrientation
  disabled?: boolean
  name?: string
  onChange?: (value: unknown) => void
}

export function radioButtonGroupModifierClasses(
  props: UiRadioButtonGroupProps,
): unknown[] {
  return [
    uiCssClass('radiobuttongroup'),
    props.orientation === 'vertical'
      ? uiCssClass('radiobuttongroup', 'vertical')
      : undefined,
    props.disabled
      ? uiCssClass('radiobuttongroup', 'disabled')
      : undefined,
    props.class,
  ]
}

export type RadioButtonGroupItem = {
  value: unknown
  label: string
}

let radioGroupSeq = 0

export function radioButtonGroupValueOf(
  props: UiRadioButtonGroupProps,
): unknown {
  if (props.value !== undefined) return props.value ?? null
  if (props.modelValue !== undefined) return props.modelValue ?? null
  return undefined
}


export function radioButtonGroupNameOf(
  props: UiRadioButtonGroupProps,
): string {
  const html = props.htmlAttributes as Record<string, string> | undefined
  const named = props.name ?? html?.name
  if (named) return named
  radioGroupSeq += 1
  return `${UI_CSS_PREFIX}-radiobuttongroup-${radioGroupSeq}`
}

export function radioButtonGroupItemsOf(
  props: UiRadioButtonGroupProps,
): RadioButtonGroupItem[] {
  return (props.options ?? []).map((item) => ({
    value: selectButtonOptionValue(item, props.optionValue),
    label: selectButtonOptionLabel(item, props.optionLabel),
  }))
}

export function radioButtonGroupItemSelected(
  props: UiRadioButtonGroupProps,
  itemValue: unknown,
): boolean {
  return selectButtonGroupSelected(
    radioButtonGroupValueOf(props),
    itemValue,
    'single',
  )
}

export function radioButtonGroupPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiRadioButtonGroupProps {
  const reference = field.reference
  const grouped = isSelectOptionsGroupedField(reference)
  const source = selectFieldOptionSource(field, extra)
  const options: UiSelectOption[] = source.map((item) =>
    selectOptionFromSource(item, reference, grouped),
  )
  return {
    value: selectFieldValueOf(field, context.getFieldValue(field)),
    options,
    orientation: extra.orientation as UiRadioButtonGroupProps['orientation'],
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    name: (extra.name as string | undefined) ?? field.fieldName,
    onChange: (value) => {
      const scalar =
        value == null || value === ''
          ? null
          : typeof value === 'string' || typeof value === 'number'
            ? value
            : selectFieldValueOf(field, value)
      context.setFieldValue(field, selectFieldWritebackOf(field, extra, scalar))
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}
