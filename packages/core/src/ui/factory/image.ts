import type { UiProps } from '../props'

/** 图片控件（`image`）的属性。 */
export interface UiImageProps extends UiProps {
  /** 是否走厂商的预览弹层（Prime `preview` / Naive `previewDisabled`）。 */
  preview?: boolean
}
