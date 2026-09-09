/*
 * chrome 单图 imageUploader / 多图 imagesUploader。
 * imagePicker / ImagePicker 别名到 imageUploader。
 * imageGallery 是详情只读，不要混。
 */
import type { MetaUiField } from '@mmda/core'
import {
  IMAGE_UPLOADER_EXTENSIONS,
  imageUploaderAcceptOf,
  type UiFileUploaderProps,
  type UiFilesUploaderProps,
  type UiImageUploaderProps,
  type UiImagesUploaderProps,
} from '@mmda/core'
import type {UiProps} from '../layout/layout'
import {
  fileUploaderPropsFromField,
  filesUploaderPropsFromField,
  type FileUploaderFieldContext,
} from './file_uploader'

export type { UiImageUploaderProps, UiImagesUploaderProps } from '@mmda/core'
export { IMAGE_UPLOADER_EXTENSIONS, imageUploaderAcceptOf } from '@mmda/core'

export function imageUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
  extra: UiProps = {},
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
  extra: UiProps = {},
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
