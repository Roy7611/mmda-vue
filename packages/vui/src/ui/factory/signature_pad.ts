/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/signature/vue-3-getting-started
 *
 * chrome 签名面板走 factory.signaturePad。vui 名是 signaturePad，不要 ejs-signature / SignatureComponent / npm signature_pad。
 * 字段 fldFactory.signaturePad 译 MetaUiField 后再调本控件。
 * 值字段是 PNG data URL。不要把 EJ2 SignatureFileType / SignatureChangeEventArgs 交给 Logic。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export type UiSignaturePadFileType = 'png' | 'jpeg' | 'svg'

export type UiSignaturePadAction = 'mouseUp' | 'undo' | 'redo' | 'clear'

export interface UiSignaturePadBeforeSave {
  fileName: string
  type: UiSignaturePadFileType
  cancel: boolean
}

export interface UiSignaturePadController {
  clear: () => void
  undo: () => void
  redo: () => void
  isEmpty: () => boolean
  canUndo: () => boolean
  canRedo: () => boolean
  refresh: () => void
  getDataUrl: (type?: UiSignaturePadFileType) => string
  getBlob: () => Blob | null
  /** EJ2 save：触发下载。非 SF no-op */
  save: (type?: UiSignaturePadFileType, fileName?: string) => void
  /** EJ2 load */
  load: (dataUrl: string, width?: number, height?: number) => void
  /** EJ2 draw(text, fontFamily, fontSize, x, y) */
  draw: (
    text: string,
    fontFamily?: string,
    fontSize?: number,
    x?: number,
    y?: number,
  ) => void
}

export interface UiSignaturePadProps extends PropData {
  value?: string
  width?: string | number
  height?: string | number
  disabled?: boolean
  readOnly?: boolean
  strokeColor?: string
  backgroundColor?: string
  backgroundImage?: string
  minStrokeWidth?: number
  maxStrokeWidth?: number
  /** EJ2 velocity。缺省 0.7。非 SF 忽略 */
  velocity?: number
  /** EJ2 saveWithBackground。缺省 true */
  saveWithBackground?: boolean
  /** EJ2 enablePersistence。非 SF 忽略 */
  persist?: boolean
  locale?: string
  /** EJ2 enableRtl。非 SF 忽略 */
  rtl?: boolean
  onChange?: (value: string, action?: UiSignaturePadAction) => void
  'onUpdate:modelValue'?: (value: string) => void
  onUpdate?: (value: string) => void
  /** EJ2 beforeSave（Ctrl+S）。非 SF 忽略 */
  onBeforeSave?: (args: UiSignaturePadBeforeSave) => void
  onReady?: (controller: UiSignaturePadController) => void
}

export type SignaturePadFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

export function signaturePadStringOf(raw: unknown): string {
  if (raw == null) return ''
  return String(raw)
}

export function signaturePadValueOf(props: UiSignaturePadProps): string {
  if (props.value !== undefined) return signaturePadStringOf(props.value)
  if (props.modelValue !== undefined) return signaturePadStringOf(props.modelValue)
  return ''
}

export function emitSignaturePadChange(
  props: UiSignaturePadProps,
  value: string,
  action?: UiSignaturePadAction,
): void {
  props.onChange?.(value, action)
  props['onUpdate:modelValue']?.(value)
  props.onUpdate?.(value)
}

export function signaturePadFileTypeOf(
  type?: UiSignaturePadFileType,
): 'Png' | 'Jpeg' | 'Svg' {
  if (type === 'jpeg') return 'Jpeg'
  if (type === 'svg') return 'Svg'
  return 'Png'
}

export function signaturePadFileTypeFromEj2(raw: unknown): UiSignaturePadFileType {
  const s = String(raw ?? '').toLowerCase()
  if (s === 'jpeg' || s === 'jpg') return 'jpeg'
  if (s === 'svg') return 'svg'
  return 'png'
}

export function signaturePadActionOf(raw: unknown): UiSignaturePadAction | undefined {
  const s = String(raw ?? '')
  if (s === 'mouseUp' || s === 'undo' || s === 'redo' || s === 'clear') return s
  const lower = s.toLowerCase()
  if (lower === 'mouseup') return 'mouseUp'
  if (lower === 'undo' || lower === 'redo' || lower === 'clear') {
    return lower as UiSignaturePadAction
  }
  return undefined
}

export function signaturePadBlobOf(dataUrl: string): Blob | null {
  if (!dataUrl) return null
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  const binary = atob(match[2])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: match[1] })
}

export function signaturePadModifierClasses(props: UiSignaturePadProps): unknown[] {
  return [
    'mmda-signature-pad',
    props.readOnly ? 'mmda-signature-pad--readonly' : undefined,
    props.disabled ? 'mmda-signature-pad--disabled' : undefined,
    props.class,
  ]
}

export function signaturePadSizeCss(value: string | number | undefined): string | undefined {
  if (value == null || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : String(value)
}

export function signaturePadPropsFromField(
  field: MetaUiField,
  context: SignaturePadFieldContext,
  extra: PropData = {},
): UiSignaturePadProps {
  return {
    value: signaturePadStringOf(context.getFieldValue(field)),
    width: extra.width,
    height: extra.height,
    disabled: extra.disabled,
    readOnly: extra.readOnly ?? context.isFieldReadonly(field),
    strokeColor: extra.strokeColor,
    backgroundColor: extra.backgroundColor,
    backgroundImage: extra.backgroundImage,
    minStrokeWidth: extra.minStrokeWidth,
    maxStrokeWidth: extra.maxStrokeWidth,
    velocity: extra.velocity,
    saveWithBackground: extra.saveWithBackground,
    persist: extra.persist,
    locale: extra.locale,
    rtl: extra.rtl,
    onChange: (value, action) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value, action)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    onBeforeSave: extra.onBeforeSave,
    onReady: extra.onReady,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}
