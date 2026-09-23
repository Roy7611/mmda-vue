/**
 * MES 首页 Dashboard 的数据结构。
 * 后端各 Dashboard 接口的返回形状，字段可空（接口可能只返回部分）。
 */

/** 产量柱状图：标签 + 实际 + 计划 三组等长数组。 */
export interface ProductionChartData {
  labels?: string[] | null
  actual?: number[] | null
  plan?: number[] | null
}
