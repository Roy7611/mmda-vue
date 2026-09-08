/*
 * chrome 单文件 fileUploader / 多文件 filesUploader。
 * 不要 ejs-uploader / FileUpload / NUpload 当 vui 名。
 * 件数由方法名固定。UploadFile.uploader 是上传人。
 * 本切片不组 FormData；onUpload 调 context.uploadFile。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'
import { getFileInfo } from '../../components/FileIcons'
import { uploadedFileNames } from '../builder/helpers'

export type UiFileUploadStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'error'

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

export interface UiFileUploaderProps extends PropData {
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
  /** 只读态走 fileLink；fld 传入 */
  fileLink?: (props: PropData) => unknown
}

export interface UiFilesUploaderProps extends PropData {
  /** 编辑回填：已有 URL 先成功态 */
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

export type FileUploaderFieldContext = {
  getFieldValue: (field: MetaUiField, row?: unknown) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
  uploadFile?: (file: File, options?: Record<string, unknown>) => Promise<unknown>
  getModuleAuth?: (entity?: Record<string, any>) =>
    | { allowDownload?: boolean }
    | undefined
  editing?: boolean
  uiBuilder?: {
    imageEditorPlugin?: { installed?: boolean }
    buildImageEditor?: (props: Record<string, unknown>) => unknown
    buildFilePreview?: (source: string, props?: Record<string, unknown>) => unknown
    buildDialog?: (content: unknown, props?: Record<string, unknown>) => unknown
  }
}

export function fileUploaderAutoUploadOf(
  props: Pick<UiFileUploaderProps, 'autoUpload'>,
  multiple: boolean,
): boolean {
  if (props.autoUpload != null) return props.autoUpload === true
  return !multiple
}

export function filesUploaderShowDropAreaOf(
  props: UiFilesUploaderProps,
): boolean {
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

export function fileUploaderModifierClasses(
  props: UiFileUploaderProps | UiFilesUploaderProps,
  extra?: { multiple?: boolean; kind?: 'file' | 'image' },
): unknown[] {
  const multiple = extra?.multiple === true
  const kind = extra?.kind ?? 'file'
  const disabled = props.disabled === true
  return [
    kind === 'image' ? 'mmda-image-uploader' : 'mmda-file-uploader',
    multiple ? 'mmda-files-uploader' : undefined,
    !multiple ? 'mmda-file-uploader--input' : undefined,
    disabled ? 'mmda-file-uploader--disabled' : undefined,
    props.class,
  ]
}

export async function defaultUploadFileUrl(
  file: File,
  uploadFile?: FileUploaderFieldContext['uploadFile'],
): Promise<string> {
  if (!uploadFile) throw new Error('uploadFile is not available')
  const result = await uploadFile(file)
  const urls = await uploadedFileNames(result)
  const url = urls[0]
  if (!url) throw new Error('upload returned no url')
  return url
}

export function fileUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
  extra: PropData = {},
): UiFileUploaderProps {
  const raw = context.getFieldValue(field, extra.row)
  const url = typeof raw === 'string' ? raw : String(raw ?? '')
  const auth = context.getModuleAuth?.()
  const readOnly =
    extra.readOnly === true ||
    context.isFieldReadonly(field) ||
    context.editing === false
  return {
    url: url || undefined,
    autoUpload: extra.autoUpload as boolean | undefined,
    allowedExtensions: extra.allowedExtensions as string | undefined,
    minFileSize: extra.minFileSize as number | undefined,
    maxFileSize: extra.maxFileSize as number | undefined,
    disabled: extra.disabled === true || readOnly,
    readOnly,
    downloadable:
      extra.downloadable !== undefined
        ? Boolean(extra.downloadable)
        : auth?.allowDownload !== false,
    preview: extra.preview as boolean | undefined,
    chooseText: extra.chooseText as string | undefined,
    class: extra.class,
    htmlAttributes: extra.htmlAttributes,
    onUpload:
      (extra.onUpload as UiFileUploaderProps['onUpload']) ??
      (async (file) => {
        const next = await defaultUploadFileUrl(file, context.uploadFile)
        context.setFieldValue(field, next)
        return next
      }),
    onSelected: extra.onSelected as UiFileUploaderProps['onSelected'],
  }
}

export function filesUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
  extra: PropData = {},
): UiFilesUploaderProps {
  const auth = context.getModuleAuth?.()
  return {
    showDropArea: extra.showDropArea as boolean | undefined,
    autoUpload: extra.autoUpload as boolean | undefined,
    allowedExtensions: extra.allowedExtensions as string | undefined,
    disabled:
      extra.disabled === true || context.isFieldReadonly(field),
    downloadable:
      extra.downloadable !== undefined
        ? Boolean(extra.downloadable)
        : auth?.allowDownload !== false,
    preview: extra.preview as boolean | undefined,
    dropText: extra.dropText as string | undefined,
    urls: extra.urls as string[] | undefined,
    class: extra.class,
    htmlAttributes: extra.htmlAttributes,
    onUpload:
      (extra.onUpload as UiFilesUploaderProps['onUpload']) ??
      ((file) => defaultUploadFileUrl(file, context.uploadFile)),
    onSelected: extra.onSelected as UiFilesUploaderProps['onSelected'],
  }
}

export function displayNameOfItem(item: UiFileUploadItem): string {
  if (item.url) return getFileInfo(item.url).fileName
  return item.file?.name ?? ''
}
