/*
 * chrome 单图 imageUploader / 多图 imagesUploader。
 * imagePicker / ImagePicker 别名到 imageUploader。
 * imageGallery 是详情只读，不要混。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'
import {
  fileUploaderPropsFromField,
  filesUploaderPropsFromField,
  type FileUploaderFieldContext,
  type UiFileUploaderProps,
  type UiFilesUploaderProps,
} from './file_uploader'

export const IMAGE_UPLOADER_EXTENSIONS =
  '.bmp,.gif,.jpeg,.jpg,.png,.tif,.webp,.svg'

export interface UiImageUploaderProps extends UiFileUploaderProps {
  showImageEditor?: boolean
}

export interface UiImagesUploaderProps extends UiFilesUploaderProps {
  showImageEditor?: boolean
}

export function imageUploaderAcceptOf(allowedExtensions?: string): string {
  return allowedExtensions?.trim() || IMAGE_UPLOADER_EXTENSIONS
}

export function imageUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
  extra: PropData = {},
): UiImageUploaderProps {
  const base = fileUploaderPropsFromField(field, context, extra)
  return {
    ...base,
    allowedExtensions: imageUploaderAcceptOf(
      extra.allowedExtensions as string | undefined,
    ),
    showImageEditor: extra.showImageEditor === true,
    editImage: extra.editImage as UiImageUploaderProps['editImage'],
  }
}

export function imagesUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
  extra: PropData = {},
): UiImagesUploaderProps {
  const base = filesUploaderPropsFromField(field, context, extra)
  return {
    ...base,
    allowedExtensions: imageUploaderAcceptOf(
      extra.allowedExtensions as string | undefined,
    ),
    showImageEditor: extra.showImageEditor === true,
    editImage: extra.editImage as UiImagesUploaderProps['editImage'],
  }
}
