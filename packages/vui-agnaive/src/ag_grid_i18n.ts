import { isRef, watch, type App } from 'vue'
import {
  AG_GRID_LOCALE_CN,
  AG_GRID_LOCALE_TW,
  AG_GRID_LOCALE_HK,
} from '@ag-grid-community/locale'
import { naiveSkinState } from './agnaive_theme'

/** Official AG Grid locale packs: en (built-in), zh-Hans, zh-Hant. */
export function resolveAgGridLocaleText(
  locale = naiveSkinState.locale,
): Record<string, string> | undefined {
  const key = String(locale ?? 'zh').toLowerCase().replaceAll('_', '-')
  if (key.startsWith('en')) return undefined
  if (key === 'zh-hk') return AG_GRID_LOCALE_HK as Record<string, string>
  if (key.includes('hant') || key === 'zh-tw')
    return AG_GRID_LOCALE_TW as Record<string, string>
  return AG_GRID_LOCALE_CN as Record<string, string>
}

export function agGridLocaleText(): Record<string, string> | undefined {
  return resolveAgGridLocaleText(naiveSkinState.locale)
}

function readLocale(locale: unknown): string | undefined {
  if (isRef(locale)) {
    const value = locale.value
    return typeof value === 'string' ? value : undefined
  }
  return typeof locale === 'string' ? locale : undefined
}

function i18nLocale(app: App): string | undefined {
  const i18n = app.config.globalProperties.$i18n as
    | { locale?: unknown }
    | undefined
  return i18n ? readLocale(i18n.locale) : undefined
}

/** Apply locale now, and follow vue-i18n when `app.changeLocale` updates it. */
export function installAgGridLocale(app: App, locale?: string): void {
  naiveSkinState.locale =
    locale ?? i18nLocale(app) ?? naiveSkinState.locale ?? 'zh'

  const i18n = app.config.globalProperties.$i18n as
    | { locale?: unknown }
    | undefined
  if (!i18n?.locale) return
  watch(
    () => readLocale(i18n.locale),
    next => {
      if (next) naiveSkinState.locale = next
    },
  )
}
