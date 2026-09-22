/*
 * 已搬到 core（业务 Logic 要在 `beforeIndex` 里调用，且实现本来只用 core 类型）：
 * 这里再导出，旧名 `VuiGroupWatermark` 作为别名保留。
 */
export {
  type Watermark,
  type UiGroupWatermark,
  type UiGroupWatermark as VuiGroupWatermark,
  setGroupWatermark,
  getGroupWatermark,
} from '@mmda/core'
