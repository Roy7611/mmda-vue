import type { UiProps } from '../props'
/** 图片控件（`image`）的属性。 */
export interface UiImageProps extends UiProps {
  /** 图片地址。 */
  src?: string
  /** 是否走厂商的预览弹层（Prime `preview` / Naive `previewDisabled`）。 */
  preview?: boolean
  /** `<img>` 宽度。 */
  width?: string | number
  /** `<img>` 高度。 */
  height?: string | number
  /** `<img>` 是否可拖拽（HTML 标准属性）。 */
  draggable?: boolean
}
