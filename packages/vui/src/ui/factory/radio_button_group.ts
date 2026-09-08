/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/radio-button/vue-3-getting-started
 *
 * chrome 单选组走 factory.radioButtonGroup。DropDownList 的平铺形态：少选项 enum / ref。
 * 不要 ejs-radiobutton / radioGroup / factory.radioButton。字段须显式 editor RadioButtonGroup。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData, UiDirection } from '../layout/layout'
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
  type DropDownListFieldContext,
  type UiSelectOption,
} from './drop_down_list'

export interface UiRadioButtonGroupProps extends PropData {
  value?: unknown
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  /** 缺省 horizontal */
  orientation?: UiDirection
  disabled?: boolean
  /** 同组 name；省略则皮肤生成稳定 id */
  name?: string
  onChange?: (value: unknown) => void
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

export function emitRadioButtonGroupChange(
  props: UiRadioButtonGroupProps,
  value: unknown,
): void {
  props.onChange?.(value)
  props['onUpdate:modelValue']?.(value)
  props.onUpdate?.(value)
}

export function radioButtonGroupNameOf(
  props: UiRadioButtonGroupProps,
): string {
  const named = props.name ?? props.htmlAttributes?.name
  if (named) return named
  radioGroupSeq += 1
  return `mmda-radiobuttongroup-${radioGroupSeq}`
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

export function radioButtonGroupModifierClasses(
  props: UiRadioButtonGroupProps,
): unknown[] {
  return [
    'mmda-radiobuttongroup',
    props.orientation === 'vertical'
      ? 'mmda-radiobuttongroup--vertical'
      : undefined,
    props.disabled ? 'mmda-radiobuttongroup--disabled' : undefined,
    props.class,
  ]
}

export function radioButtonGroupPropsFromField(
  field: MetaUiField,
  context: DropDownListFieldContext,
  extra: PropData = {},
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
    orientation: extra.orientation as UiDirection | undefined,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
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
      ...extra.htmlAttributes,
    },
  }
}
