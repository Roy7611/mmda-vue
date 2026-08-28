/**
 * 质量看板数据 DTO 类型定义
 * 字段名对齐后端 Jackson 序列化（小驼峰），Long 类型经全局 JacksonConfig 序列化为字符串
 */

/**
 * 汇总 KPI（后端 QualityKPI.java 序列化字段，派生 getter 按 JavaBeans 规则命名）
 */
export interface QualityKPI {
  producedQuantity?: number
  goodQuantity?: number
  aucQuantity?: number
  defectiveQuantity?: number
  ngQuantity?: number
  scrapQuantity?: number
  reworkQuantity?: number
  additionalProduction?: number
  qualifiedQuantity?: number
  unQualifiedQuantity?: number
  qualifiedRate?: number
  unQualifiedRate?: number
  firstPassQuantity?: number
  firstPassYield?: number
  goodRate?: number
  ngRate?: number
  defectiveRate?: number
  PPM?: number
  reworkRate?: number
  scrapRate?: number
}

/**
 * 站点质量明细（后端 /QualityKanban/siteQuality 返回，按产线分组各一行）
 */
export interface QualitySiteKPI {
  lineID?: string
  lineName?: string
  producedQuantity?: number
  goodQuantity?: number
  aucQuantity?: number
  defectiveQuantity?: number
  ngQuantity?: number
  scrapQuantity?: number
  reworkQuantity?: number
  additionalProduction?: number
}

/**
 * 质量趋势（后端 /QualityKanban/getAnalyzeQualityFluctuation 返回，按日期拆分每天一行）
 */
export interface QualityTrend {
  date?: string
  producedQuantity?: number
  defectiveQuantity?: number
  ngQuantity?: number
  scrapQuantity?: number
}

/**
 * 查询参数（对齐后端 QualityKanbanQueryParam）
 */
export interface QualityKanbanQueryParam {
  startTime?: string
  endTime?: string
  productCategoryID?: string
  productCode?: string
  siteID?: string
}
