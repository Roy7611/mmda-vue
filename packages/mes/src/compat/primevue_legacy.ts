import { isObject, type MetaUiField } from '@mmda/core'
import { createPrimeVueUiFactory } from '@mmda/vui-primevue'

/** 旧仓全局 factory 单例；新皮肤改为每次 create，这里给业务 Logic 一个兼容入口。 */
export const primeVueFactory = createPrimeVueUiFactory()

/** 旧 PrimeVue builder 的列合计；新皮肤未导出，MES 线边库仍在用。 */
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
