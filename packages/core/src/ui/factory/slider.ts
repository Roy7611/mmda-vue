import { uiCssClass } from '../css'
import type { UiProps } from '../props'
import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
export type UiSliderType = 'Default' | 'MinRange' | 'Range'
export type UiSliderValue = number | number[] | null

export interface UiSliderProps extends UiProps {
  value?: UiSliderValue
  min?: number
  max?: number
  step?: number
  /** EJ2：Default / MinRange / Range。默认 Default。 */
  type?: UiSliderType
  disabled?: boolean
  onChange?: (value: UiSliderValue) => void
}

export function sliderModifierClasses(props: UiSliderProps): unknown[] {
  let type: UiSliderType = 'Default'
  if (
    props.type === 'MinRange' ||
    props.type === 'Range' ||
    props.type === 'Default'
  ) {
    type = props.type
  } else {
    const raw =
      props.value
    if (Array.isArray(raw) && raw.length >= 2) type = 'Range'
  }
  return [
    uiCssClass('slider'),
    type === 'Range' ? uiCssClass('slider', undefined, 'range') : undefined,
    type === 'MinRange' ? uiCssClass('slider', undefined, 'minrange') : undefined,
    props.class,
  ]
}

export const DEFAULT_SLIDER_MIN = 0
export const DEFAULT_SLIDER_MAX = 100
export const DEFAULT_SLIDER_STEP = 1

export function sliderPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
): UiSliderProps {
  const raw = context.getFieldValue(field)
  return {
    value: (raw ?? null) as UiSliderValue,
    min: DEFAULT_SLIDER_MIN,
    max: DEFAULT_SLIDER_MAX,
    step: DEFAULT_SLIDER_STEP,
    disabled: context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}
