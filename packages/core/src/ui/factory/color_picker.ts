import { uiCssClass } from '../css'
import type { UiProps } from '../props'

export type UiColorPickerMode = 'picker' | 'palette'

export interface UiColorPickerProps extends UiProps {
  /** 色值，默认 hex（3/6 位；含透明度 4/8 位）。可带或不带 `#` */
  value?: string
  mode?: UiColorPickerMode
  /** 是否显示 Picker↔Palette 切换。缺省 true */
  showModeSwitcher?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}

export function colorPickerModifierClasses(props: UiColorPickerProps): unknown[] {
  const mode =
    props.mode && props.mode !== 'picker'
      ? uiCssClass('colorpicker', undefined, props.mode)
      : undefined
  return [uiCssClass('colorpicker'), mode, props.class]
}
