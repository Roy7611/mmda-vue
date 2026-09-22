/*
 * chrome 单文件 fileUploader / 多文件 filesUploader。
 * 不要 ejs-uploader / FileUpload / NUpload 当 vui 名。
 * 件数由方法名固定。UploadFile.uploader 是上传人。
 * 本切片不组 FormData；onUpload 调 context.uploadFile。
 */
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
import type {UiProps} from '@mmda/core'
import { getFileInfo } from '../../components/FileIcons'

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
export {
  defaultUploadFileUrl,
  fileUploaderPropsFromField,
  filesUploaderPropsFromField,
  fileUploadResponseUrls,
  type FileUploaderFieldContext,
} from '@mmda/core'

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

export function displayNameOfItem(item: UiFileUploadItem): string {
  if (item.url) return getFileInfo(item.url).fileName
  return item.file?.name ?? ''
}
