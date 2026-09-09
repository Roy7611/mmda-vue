/**
 * 输入类扩展控件 Props（slider / rating / chips / masked / otp / color）。
 * 无 Vue。
 */
import type { UiColorRole, UiProps } from './props'
import { uiCssClass } from './css'

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
    type === 'Range' ? uiCssClass('slider', 'range') : undefined,
    type === 'MinRange' ? uiCssClass('slider', 'minrange') : undefined,
    props.class,
  ]
}

export type UiRatingTemplateContext = { value: number; index: number }

export type UiRatingTemplate<TNode = any> =
  | TNode
  | ((ctx: UiRatingTemplateContext) => TNode)

export interface UiRatingProps<TNode = any> extends UiProps {
  value?: number | null
  /** EJ2：格子数。默认 5。不要 vui 主名 stars */
  itemsCount?: number
  /** EJ2 拼写。不要 vui 主名 readonly */
  readOnly?: boolean
  disabled?: boolean
  emptyTemplate?: UiRatingTemplate<TNode>
  fullTemplate?: UiRatingTemplate<TNode>
  onChange?: (value: number | null) => void
}

export function ratingModifierClasses(props: UiRatingProps): unknown[] {
  return [uiCssClass('rating'), props.class]
}

export type UiChipsKind = 'action' | 'choice' | 'filter' | 'input'

export type UiChipItem = {
  label: string
  value?: string | number
  disabled?: boolean
  colorRole?: UiColorRole
  /** 前置图标（EJ2 leadingIconCss）。 */
  icon?: string
  /** 头像图（EJ2 avatarIconCss / leadingIconUrl）。 */
  avatarSrc?: string
  /** 头像字母（EJ2 avatarText）。 */
  avatarLabel?: string
  trailingIcon?: string
  outlined?: boolean
}

export interface UiChipsProps extends UiProps {
  items?: Array<string | UiChipItem>
  kind?: UiChipsKind
  selected?: string | number | Array<string | number>
  removable?: boolean
  disabled?: boolean
  colorRole?: UiColorRole
  outlined?: boolean
  onChange?: (
    selected: string | number | Array<string | number> | undefined,
  ) => void
  onClick?: (item: UiChipItem, index: number) => void
  onRemove?: (item: UiChipItem, index: number) => void
}

export function chipsModifierClasses(props: UiChipsProps): unknown[] {
  const kind = props.kind ?? 'action'
  const kindClass =
    kind !== 'action' ? uiCssClass('chips', kind) : undefined
  const removable =
    kind === 'input' || props.removable === true
      ? uiCssClass('chips', 'removable')
      : undefined
  return [uiCssClass('chips'), kindClass, removable, props.class]
}

export function chipItemModifierClasses(item: UiChipItem): unknown[] {
  const color = item.colorRole
    ? uiCssClass('chips__item', item.colorRole)
    : undefined
  const outlined = item.outlined
    ? uiCssClass('chips__item', 'outlined')
    : undefined
  return [color, outlined]
}

export interface UiMaskedTextBoxProps extends UiProps {
  value?: string
  /** EJ2 掩码元素：`0` 数字、`L` 字母、`A` 字母数字；字面量原样。 */
  mask: string
  placeholder?: string
  disabled?: boolean
  /** 未填位提示符。对应 EJ2 promptChar */
  promptChar?: string
  onChange?: (value: string) => void
}

export function maskedTextBoxModifierClasses(
  props: UiMaskedTextBoxProps,
): unknown[] {
  return [uiCssClass('maskedtextbox'), props.class]
}

export type UiOneTimePasswordType = 'number' | 'text' | 'password'

export interface UiOneTimePasswordInputProps extends UiProps {
  value?: string
  /** 格数。默认 4。 */
  length?: number
  /** EJ2：number / text / password。默认 number。 */
  type?: UiOneTimePasswordType
  /** 格间分隔符。对应 EJ2 separator */
  separator?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

export function oneTimePasswordModifierClasses(
  props: UiOneTimePasswordInputProps,
): unknown[] {
  return [uiCssClass('otpinput'), props.class]
}

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
      ? uiCssClass('colorpicker', props.mode)
      : undefined
  return [uiCssClass('colorpicker'), mode, props.class]
}
