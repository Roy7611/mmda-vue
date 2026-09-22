/*
 * chrome 单图 imageUploader / 多图 imagesUploader。
 * imagePicker / ImagePicker 别名到 imageUploader。
 * imageGallery 是详情只读，不要混。
 */
import {
  IMAGE_UPLOADER_EXTENSIONS,
  imageUploaderAcceptOf,
  type UiFileUploaderProps,
  type UiFilesUploaderProps,
  type UiImageUploaderProps,
  type UiImagesUploaderProps,
} from '@mmda/core'
import type {UiProps} from '@mmda/core'

export type { UiImageUploaderProps, UiImagesUploaderProps } from '@mmda/core'
export { IMAGE_UPLOADER_EXTENSIONS, imageUploaderAcceptOf } from '@mmda/core'
export {
  imageUploaderPropsFromField,
  imagesUploaderPropsFromField,
} from '@mmda/core'
