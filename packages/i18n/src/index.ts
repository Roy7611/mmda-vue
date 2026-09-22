// @mmda/i18n — 共享词条数据 + 框架无关翻译辅助
export { default as zh } from './zh'
export { default as en } from './en'
export { default as zhHant } from './zh-Hant'
export { numberFormats, datetimeFormats } from './formats'

export type SupportedLocale = 'en' | 'zh' | 'zh-Hant'

export const supportedLocales: Record<string, string> = {
  en: 'locale.en',
  zh: 'locale.zh',
  'zh-Hant': 'locale.zhHant',
}

/** 插值：把 "{name}" 替换为 params.name */
export function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] == null ? `{${name}}` : String(params[name]),
  )
}

/** 从嵌套 messages 对象中按 "a.b.c" 路径查找 */
export function lookupMessage(messages: Record<string, any>, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[part]
    }
    return undefined
  }, messages)
  return typeof value === 'string' ? value : undefined
}