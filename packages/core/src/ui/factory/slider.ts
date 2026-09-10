import { uiCssClass } from '../css'
import type { UiProps } from '../props'

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
      props.value !== undefined ? props.value : props.modelValue
    if (Array.isArray(raw) && raw.length >= 2) type = 'Range'
  }
  return [
    uiCssClass('slider'),
    type === 'Range' ? uiCssClass('slider', undefined, 'range') : undefined,
    type === 'MinRange' ? uiCssClass('slider', undefined, 'minrange') : undefined,
    props.class,
  ]
}
