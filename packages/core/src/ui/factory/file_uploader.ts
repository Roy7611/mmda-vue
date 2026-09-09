import type { UiProps } from '../props'
import type { UiFileLinkProps } from './file_link'

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
