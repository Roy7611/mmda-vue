import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
import { type UiProps } from '../props'
import { uiCssClass } from '../css'

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
  save: (type?: UiSignaturePadFileType, fileName?: string) => void
  load: (dataUrl: string, width?: number, height?: number) => void
  draw: (
    text: string,
    fontFamily?: string,
    fontSize?: number,
    x?: number,
    y?: number,
  ) => void
}

export interface UiSignaturePadProps extends UiProps {
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
  velocity?: number
  saveWithBackground?: boolean
  persist?: boolean
  locale?: string
  rtl?: boolean
  onChange?: (value: string, action?: UiSignaturePadAction) => void
  onUpdate?: (value: string) => void
  onBeforeSave?: (args: UiSignaturePadBeforeSave) => void
  onReady?: (controller: UiSignaturePadController) => void
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
    uiCssClass('signature-pad'),
    props.readOnly ? uiCssClass('signature-pad', undefined, 'readonly') : undefined,
    props.disabled ? uiCssClass('signature-pad', undefined, 'disabled') : undefined,
    props.class,
  ]
}

export function signaturePadSizeCss(
  value: string | number | undefined,
): string | undefined {
  if (value == null || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : String(value)
}


export function signaturePadPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiSignaturePadProps {
  return {
    value: signaturePadStringOf(context.getFieldValue(field)),
    width: extra.width as UiSignaturePadProps['width'],
    height: extra.height as UiSignaturePadProps['height'],
    disabled: extra.disabled as boolean | undefined,
    readOnly:
      (extra.readOnly as boolean | undefined) ?? context.isFieldReadonly(field),
    strokeColor: extra.strokeColor as string | undefined,
    backgroundColor: extra.backgroundColor as string | undefined,
    backgroundImage: extra.backgroundImage as string | undefined,
    minStrokeWidth: extra.minStrokeWidth as number | undefined,
    maxStrokeWidth: extra.maxStrokeWidth as number | undefined,
    velocity: extra.velocity as number | undefined,
    saveWithBackground: extra.saveWithBackground as boolean | undefined,
    persist: extra.persist as boolean | undefined,
    locale: extra.locale as string | undefined,
    rtl: extra.rtl as boolean | undefined,
    onChange: (value, action) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value, action)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    onBeforeSave: extra.onBeforeSave as UiSignaturePadProps['onBeforeSave'],
    onReady: extra.onReady as UiSignaturePadProps['onReady'],
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}
