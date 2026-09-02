import { computed, reactive } from 'vue'
import {
  darkTheme,
  dateEnUS,
  dateZhCN,
  dateZhTW,
  enUS,
  zhCN,
  zhTW,
  type GlobalThemeOverrides,
  type NDateLocale,
  type NLocale,
} from 'naive-ui'
import { themeQuartz, type Theme } from 'ag-grid-community'

export const naiveSkinState = reactive({
  dark: false,
  locale: 'zh',
})

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export function cssColorToHex(value: string, fallback: string): string {
  const raw = value.trim()
  if (!raw) return fallback
  if (HEX.test(raw)) {
    if (raw.length === 4) {
      const [, r, g, b] = raw
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
    }
    return raw.toLowerCase()
  }
  const rgb = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgb) {
    const hex = [rgb[1], rgb[2], rgb[3]]
      .map(part => Number(part).toString(16).padStart(2, '0'))
      .join('')
    return `#${hex}`
  }
  return fallback
}

export function readMmdaColor(variable: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
  return cssColorToHex(value, fallback)
}

export function refreshNaiveThemeFromCss() {
  naiveSkinState.dark = document.documentElement.classList.contains('mmda-dark')
}

export function naiveLocaleOf(locale = naiveSkinState.locale): {
  locale: NLocale
  dateLocale: NDateLocale
} {
  const key = locale.toLowerCase()
  if (key.startsWith('en')) return { locale: enUS, dateLocale: dateEnUS }
  if (key.includes('hant') || key === 'zh-tw' || key === 'zh-hk')
    return { locale: zhTW, dateLocale: dateZhTW }
  return { locale: zhCN, dateLocale: dateZhCN }
}

export function buildNaiveThemeOverrides(): GlobalThemeOverrides {
  const primary = readMmdaColor('--mmda-primary-color', '#6750a4')
  const onPrimary = readMmdaColor('--mmda-on-primary', '#ffffff')
  const text = readMmdaColor('--mmda-text-color', '#1c1b1e')
  const muted = readMmdaColor('--mmda-text-muted-color', '#49454e')
  const card = readMmdaColor('--mmda-surface-card', '#ffffff')
  const ground = readMmdaColor('--mmda-surface-ground', '#f7f2f7')
  const border = readMmdaColor('--mmda-content-border-color', '#cac4cf')
  const danger = readMmdaColor('--mmda-danger-color', '#b3261e')
  const warning = readMmdaColor('--mmda-warning-color', '#914c00')
  const info = readMmdaColor('--mmda-info-color', '#01579b')
  return {
    common: {
      primaryColor: primary,
      primaryColorHover: primary,
      primaryColorPressed: primary,
      textColorBase: text,
      textColor1: text,
      textColor2: muted,
      textColor3: muted,
      bodyColor: ground,
      cardColor: card,
      modalColor: card,
      popoverColor: card,
      borderColor: border,
      errorColor: danger,
      warningColor: warning,
      infoColor: info,
      borderRadius: '8px',
      heightSmall: '28px',
      heightMedium: '32px',
    },
    Button: {
      textColorPrimary: onPrimary,
      textColorHoverPrimary: onPrimary,
      textColorPressedPrimary: onPrimary,
    },
  }
}

export const naiveThemeRef = computed(() =>
  naiveSkinState.dark ? darkTheme : null,
)

export const naiveOverridesRef = computed(() => buildNaiveThemeOverrides())

export function buildAgGridTheme(): Theme {
  return themeQuartz.withParams({
    accentColor: readMmdaColor('--mmda-primary-color', '#6750a4'),
    backgroundColor: readMmdaColor('--mmda-surface-card', '#ffffff'),
    foregroundColor: readMmdaColor('--mmda-text-color', '#1c1b1e'),
    borderColor: readMmdaColor('--mmda-content-border-color', '#cac4cf'),
    headerBackgroundColor: readMmdaColor('--mmda-surface-ground', '#f7f2f7'),
    headerTextColor: readMmdaColor('--mmda-text-color', '#1c1b1e'),
    oddRowBackgroundColor: readMmdaColor('--mmda-surface-ground', '#f7f2f7'),
    fontSize: 13,
    headerFontSize: 13,
    rowHeight: 32,
    headerHeight: 36,
  })
}
