import type { UiProps } from './props'

export type UiFileLinkPreviewKind = 'none' | 'app' | 'browser'

export const FILE_LINK_APP_PREVIEW_EXTS = ['xlsx', 'xls', 'docx', 'doc'] as const

export const FILE_LINK_BROWSER_PREVIEW_EXTS = ['pdf', 'txt', 'csv'] as const

export interface UiFileLinkProps extends UiProps {
  url?: string
  downloadable?: boolean
  preview?: boolean
  fileName?: string
  fileIcon?: string
  onPreview?: (url: string) => void
}

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

export interface UiImageUploaderProps extends UiFileUploaderProps {
  showImageEditor?: boolean
}

export interface UiImagesUploaderProps extends UiFilesUploaderProps {
  showImageEditor?: boolean
}

export const IMAGE_UPLOADER_EXTENSIONS =
  '.bmp,.gif,.jpeg,.jpg,.png,.tif,.webp,.svg'

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

export function imageUploaderAcceptOf(allowedExtensions?: string): string {
  return allowedExtensions?.trim() || IMAGE_UPLOADER_EXTENSIONS
}

export function fileLinkUrlOf(props: UiFileLinkProps): string {
  return String(props.url ?? '').trim()
}

export function fileLinkDownloadableOf(props: UiFileLinkProps): boolean {
  return props.downloadable !== false
}

export function fileLinkExtOf(url: string, fileName?: string): string {
  const name = fileName || url
  const slash = name.lastIndexOf('/')
  const base = slash >= 0 ? name.slice(slash + 1) : name
  const q = base.indexOf('?')
  const clean = q >= 0 ? base.slice(0, q) : base
  const dot = clean.lastIndexOf('.')
  if (dot < 0) return ''
  return clean.slice(dot + 1).toLowerCase()
}

export function fileLinkPreviewKindOf(
  props: UiFileLinkProps,
): UiFileLinkPreviewKind {
  if (props.preview !== true) return 'none'
  const ext = fileLinkExtOf(fileLinkUrlOf(props), props.fileName)
  if ((FILE_LINK_APP_PREVIEW_EXTS as readonly string[]).includes(ext)) return 'app'
  if ((FILE_LINK_BROWSER_PREVIEW_EXTS as readonly string[]).includes(ext)) {
    return 'browser'
  }
  return 'none'
}
