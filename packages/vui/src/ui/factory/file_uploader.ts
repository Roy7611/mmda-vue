/*
 * chrome 单文件 fileUploader / 多文件 filesUploader。
 * 不要 ejs-uploader / FileUpload / NUpload 当 vui 名。
 * 件数由方法名固定。UploadFile.uploader 是上传人。
 * 本切片不组 FormData；onUpload 调 context.uploadFile。
 */
import type { MetaUiField } from '@mmda/core'
import {
  fileKeyOf,
  fileUploaderAcceptOf,
  fileUploaderAutoUploadOf,
  filesUploaderShowDropAreaOf,
  fileUploaderTakeOne,
  type UiFileUploadControl,
  type UiFileUploaderController,
  type UiFileUploadItem,
  type UiFileUploaderProps,
  type UiFilesUploaderProps,
  type UiFileUploadStatus,
} from '@mmda/core'
import type {UiProps, UiBagExtra} from '../layout/layout'
import { getFileInfo } from '../../components/FileIcons'
import { uploadedFileNames } from '../builder/helpers'

export type {
  UiFileUploadControl,
  UiFileUploaderController,
  UiFileUploadItem,
  UiFileUploaderProps,
  UiFilesUploaderProps,
  UiFileUploadStatus,
} from '@mmda/core'
export {
  fileKeyOf,
  fileUploaderAcceptOf,
  fileUploaderAutoUploadOf,
  filesUploaderShowDropAreaOf,
  fileUploaderTakeOne,
} from '@mmda/core'

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
  extra: UiBagExtra = {},
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
  extra: UiBagExtra = {},
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
