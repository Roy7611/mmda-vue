import type { UiFileUploaderProps, UiFilesUploaderProps } from './file_uploader'
import {
  fileUploaderPropsFromField,
  filesUploaderPropsFromField,
  type FileUploaderFieldContext,
} from './file_uploader'
import type { MetaUiField } from '../../metaui/metaui_field'

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
): UiImageUploaderProps {
  const base = fileUploaderPropsFromField(field, context)
  return {
    ...base,
    allowedExtensions: imageUploaderAcceptOf(),
  }
}

export function imagesUploaderPropsFromField(
  field: MetaUiField,
  context: FileUploaderFieldContext,
): UiImagesUploaderProps {
  const base = filesUploaderPropsFromField(field, context)
  return {
    ...base,
    allowedExtensions: imageUploaderAcceptOf(),
  }
}
