import { isObject, type MetaUiField } from '@mmda/core'
import { uiBuilder } from '@/mes'

/** 旧仓全局 factory 单例；现指向 Syncfusion 皮肤。 */
export const primeVueFactory = uiBuilder.factory

/** 列合计；无皮肤 helper。 */
export function defaultSummaryMethod(filed: MetaUiField, data: any[]) {
  if (!filed?.aggregationSet || !Array.isArray(data) || data.length === 0) return ''
  const sum = data.reduce((prev: number, curr: any) => {
    const raw = isObject(prev as any) ? (prev as any)[filed.fieldName] : prev
    return Number(raw || 0) + Number(curr?.[filed.fieldName] || 0)
  }, 0)
  const n = Number(sum)
  if (!Number.isFinite(n)) return ''
  if (filed.aggregationSet === 4) return (n / data.length).toString()
  return n.toString()
}
