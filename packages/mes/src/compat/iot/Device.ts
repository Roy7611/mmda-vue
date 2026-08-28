import type { Entity } from '@mmda/core'

/** IoT Device 桩：本仓未移植 @mmda/iot，仅保留 MES 模型引用所需字段。 */
export interface Device extends Entity {
  deviceID?: string
  deviceNo?: string
  deviceName?: string
}
