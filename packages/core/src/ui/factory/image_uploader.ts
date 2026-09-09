import type { UiFileUploaderProps, UiFilesUploaderProps } from './file_uploader'

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
