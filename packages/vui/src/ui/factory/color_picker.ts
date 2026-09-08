/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/color-picker/mode-and-value
 *
 * chrome 取色走 factory.colorPicker。值一律 hex。
 * 字段 fldFactory.colorPicker 译 MetaUiField 后再调本控件。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export type UiColorPickerMode = 'picker' | 'palette'

export interface UiColorPickerProps extends PropData {
  /** 色值，默认 hex（3/6 位；含透明度 4/8 位）。可带或不带 `#` */
  value?: string
  mode?: UiColorPickerMode
  /** 是否显示 Picker↔Palette 切换。缺省 true */
  showModeSwitcher?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}

export type ColorPickerFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

const pad = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')

const rgbToHex = (r: number, g: number, b: number, a?: number): string => {
  const hex = `#${pad(r)}${pad(g)}${pad(b)}`
  if (a == null || a >= 1) return hex
  return `${hex}${pad(a * 255)}`
}

const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const sat = s > 1 ? s / 100 : s
  const val = v > 1 ? v / 100 : v
  const c = val * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = val - c
  let rp = 0
  let gp = 0
  let bp = 0
  if (h < 60) [rp, gp, bp] = [c, x, 0]
  else if (h < 120) [rp, gp, bp] = [x, c, 0]
  else if (h < 180) [rp, gp, bp] = [0, c, x]
  else if (h < 240) [rp, gp, bp] = [0, x, c]
  else if (h < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]
  return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255]
}

/** 皮肤把厂商 rgba/hsb 转成 hex 再 emit。调用方不要用它当 rgba/hsb API。 */
export function colorPickerHexOf(raw: unknown): string {
  if (raw == null || raw === '') return ''
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (typeof o.hex === 'string') return colorPickerHexOf(o.hex)
    if ('r' in o && 'g' in o && 'b' in o) {
      return rgbToHex(Number(o.r), Number(o.g), Number(o.b), o.a as number | undefined)
    }
    if ('h' in o && 's' in o && ('b' in o || 'v' in o)) {
      const [r, g, b] = hsvToRgb(
        Number(o.h),
        Number(o.s),
        Number(o.b ?? o.v),
      )
      return rgbToHex(r, g, b, o.a as number | undefined)
    }
    return ''
  }
  const s = String(raw).trim()
  if (/^#?[0-9a-f]{3,8}$/i.test(s)) {
    return s.startsWith('#') ? s : `#${s}`
  }
  const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i)
  if (rgb) {
    return rgbToHex(
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
      rgb[4] == null ? undefined : Number(rgb[4]),
    )
  }
  const hsv = s.match(/^hsv[ab]?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?(?:\s*,\s*([\d.]+))?\s*\)$/i)
  if (hsv) {
    const [r, g, b] = hsvToRgb(Number(hsv[1]), Number(hsv[2]), Number(hsv[3]))
    return rgbToHex(r, g, b, hsv[4] == null ? undefined : Number(hsv[4]))
  }
  return s
}

export function colorPickerValueOf(props: UiColorPickerProps): string | undefined {
  if (props.value !== undefined) {
    const hex = colorPickerHexOf(props.value)
    return hex || undefined
  }
  if (props.modelValue !== undefined) {
    const hex = colorPickerHexOf(props.modelValue)
    return hex || undefined
  }
  return undefined
}

export function emitColorPickerChange(
  props: UiColorPickerProps,
  value: string,
): void {
  const hex = colorPickerHexOf(value)
  props.onChange?.(hex)
  props['onUpdate:modelValue']?.(hex)
  props.onUpdate?.(hex)
}

export function colorPickerModifierClasses(props: UiColorPickerProps): unknown[] {
  const mode =
    props.mode && props.mode !== 'picker'
      ? `mmda-colorpicker--${props.mode}`
      : undefined
  return ['mmda-colorpicker', mode, props.class]
}

export function colorPickerPropsFromField(
  field: MetaUiField,
  context: ColorPickerFieldContext,
  extra: PropData = {},
): UiColorPickerProps {
  return {
    value: colorPickerHexOf(context.getFieldValue(field)),
    mode: extra.mode,
    showModeSwitcher: extra.showModeSwitcher,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
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
