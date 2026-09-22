import type { UiProps } from '../props'
import type { UiFileLinkProps } from './file_link'
import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'

export type UiFileUploadStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface UiFileUploadControl {
  signal: AbortSignal
  onProgress: (progress: number) => void
}

export interface UiFileUploaderController {
  choose: () => void
  upload: () => void
  cancel: () => void
  clear: () => void
  getFiles: () => File[]
}

export interface UiFileUploadItem {
  key: string
  file?: File
  url?: string
  status: UiFileUploadStatus
  progress: number
  error?: string
  previewUrl?: string
}

export interface UiFileUploaderProps extends UiProps {
  url?: string
  autoUpload?: boolean
  allowedExtensions?: string
  minFileSize?: number
  maxFileSize?: number
  droppable?: boolean
  disabled?: boolean
  readOnly?: boolean
  chooseText?: string
  reselectText?: string
  downloadable?: boolean
  preview?: boolean
  onUpload?: (file: File, control: UiFileUploadControl) => Promise<string>
  onSelected?: (file?: File) => void
  onReady?: (controller: UiFileUploaderController) => void
  editImage?: (src: string) => Promise<File | void>
  fileLink?: (props: UiFileLinkProps) => unknown
}

export interface UiFilesUploaderProps extends UiProps {
  urls?: string[]
  showDropArea?: boolean
  autoUpload?: boolean
  allowedExtensions?: string
  minFileSize?: number
  maxFileSize?: number
  directoryUpload?: boolean
  sequentialUpload?: boolean
  droppable?: boolean
  disabled?: boolean
  readOnly?: boolean
  dropText?: string
  downloadable?: boolean
  preview?: boolean
  onUpload?: (file: File, control: UiFileUploadControl) => Promise<string>
  onSelected?: (files: File[]) => void
  onReady?: (controller: UiFileUploaderController) => void
  onRemove?: (item: UiFileUploadItem) => void
  editImage?: (src: string) => Promise<File | void>
}

export function fileUploaderAutoUploadOf(
  props: Pick<UiFileUploaderProps, 'autoUpload'>,
  multiple: boolean,
): boolean {
  if (props.autoUpload != null) return props.autoUpload === true
  return !multiple
}

export function filesUploaderShowDropAreaOf(props: UiFilesUploaderProps): boolean {
  return props.showDropArea !== false
}

export function fileUploaderAcceptOf(
  allowedExtensions?: string,
): string | undefined {
  if (!allowedExtensions) return undefined
  return allowedExtensions
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(',')
}

export function fileUploaderTakeOne(files: File[]): File | undefined {
  return files[0]
}

export function fileKeyOf(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export type FileUploaderFieldContext = UiFieldBindContext & {
  uploadFile?: (
    file: File,
    options?: Record<string, unknown>,
  ) => Promise<unknown>
  getModuleAuth?: (
    entity?: Record<string, any>,
  ) => { allowDownload?: boolean } | undefined
  editing?: boolean
  uiBuilder?: any
}

function uploadedFileName(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const file = value as Record<string, unknown>
    return String(file.fileName ?? file.fileUrl ?? file.url ?? file.path ?? '')
  }
  return String(value ?? '')
}

export async function fileUploadResponseUrls(
  response: unknown,
): Promise<string[]> {
  if (response === false || response == null) return []
  if (Array.isArray(response)) return response.map(uploadedFileName)
  const record = response as Record<string, unknown>
  if (Array.isArray(record.data)) return record.data.map(uploadedFileName)
  if (typeof response === 'string') return [response]
  if (typeof record.text !== 'function') return []
  if ('ok' in record && !record.ok) {
    throw new Error(`upload failed with status ${record.status}`)
  }
  const text = await record.text()
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.map(uploadedFileName)
    if (Array.isArray(parsed.data)) return parsed.data.map(uploadedFileName)
    if (typeof parsed === 'string') return [parsed]
  } catch {
    return [text]
  }
  return []
}

export async function defaultUploadFileUrl(
  file: File,
  uploadFile?: FileUploaderFieldContext['uploadFile'],
): Promise<string> {
  if (!uploadFile) throw new Error('uploadFile is not available')
  const result = await uploadFile(file)
  const urls = await fileUploadResponseUrls(result)
  const url = urls[0]
  if (!url) throw new Error('upload returned no url')
  return url
}

export function fileUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
): UiFileUploaderProps {
  const raw = context.getFieldValue(field)
  const url = typeof raw === 'string' ? raw : String(raw ?? '')
  const auth = context.getModuleAuth?.()
  const readOnly = context.isFieldReadonly(field) || context.editing === false
  return {
    url: url || undefined,
    disabled: readOnly,
    readOnly,
    downloadable: auth?.allowDownload !== false,
    onUpload: async (file) => {
      const next = await defaultUploadFileUrl(file, context.uploadFile)
      context.setFieldValue(field, next)
      return next
    },
  }
}

export function filesUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
): UiFilesUploaderProps {
  const auth = context.getModuleAuth?.()
  return {
    disabled: context.isFieldReadonly(field),
    downloadable: auth?.allowDownload !== false,
    onUpload: (file) => defaultUploadFileUrl(file, context.uploadFile),
  }
}
