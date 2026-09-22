/**
 * rui 的 i18n 薄封装。
 * 词条数据来自 @mmda/i18n，翻译引擎可替换（默认用简单的 interpolate）。
 */
import { zh as messages, type SupportedLocale, interpolate } from '@mmda/i18n'

let currentMessages: Record<string, any> = messages

/** 切换语言。皮肤 / App 在启动时调用。 */
export function setLocale(locale: SupportedLocale): void {
  // 动态加载对应词条
  if (locale === 'zh') currentMessages = messages
  else if (locale === 'en') {
    import('@mmda/i18n/src/en').then(m => { currentMessages = m.default })
  } else if (locale === 'zh-Hant') {
    import('@mmda/i18n/src/zh-Hant').then(m => { currentMessages = m.default })
  }
}

/** 翻译（无 i18n 库依赖，纯数据 + 插值）。 */
export function translate(key: string, params?: Record<string, unknown>): string {
  const value = key.split('.').reduce<unknown>((cur: any, part) => cur?.[part], currentMessages)
  const template = typeof value === 'string' ? value : key
  return interpolate(template, params)
}