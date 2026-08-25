import { Entity } from './entity'

/**
 * 挂在实体上的附件。形状来自后端生成模型，不是 HTTP 客户端的一部分。
 */
export interface Attachment extends Entity {
  fileName: string
  fileSize: string
}

/**
 * 导入 / 导出用的报表模板。形状来自后端生成模型，不是 HTTP 客户端的一部分。
 */
export interface ReportTemplate extends Entity {
  templateName: string
  templateFile: string
  templateID?: string
}
