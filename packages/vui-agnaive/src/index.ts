import type { App, Plugin } from 'vue'
import { LicenseManager } from 'ag-grid-enterprise'
import '@mmda/vui/fontawesome.css'
import '@mmda/vui/material-symbols.css'
import '@mmda/vui/theme.css'
import './style.css'
import { installAgGridLocale } from './ag_grid_i18n'

export * from './agnaive_layout'
export * from './agnaive_factory'
export * from './agnaive_field_factory'
export * from './agnaive_builder'
export * from './agnaive_overlay'
export * from './agnaive_theme'
export * from './ag_filter'
export * from './ag_advanced_filter'
export * from './ag_columns'
export * from './ag_grid_i18n'
export * from './components/AgGrid'
export * from './components/AgNaiveVuiOverlayHost'
export * from './components/NaiveAppSideMenu'
export * from './components/NaiveDropupMenuButton'
export * from './components/NaiveSigninForm'
export * from './components/NaiveBpmnModeler'

export interface AgNaiveVuiOptions {
  licenseKey?: string
  locale?: string
}

function resolveLicense(options: AgNaiveVuiOptions) {
  if (options.licenseKey) return options.licenseKey
  try {
    return (import.meta as any).env?.VITE_AG_GRID_LICENSE as string | undefined
  } catch {
    return undefined
  }
}

export const mmdaAgNaive: Plugin = {
  install(_app: App, options: AgNaiveVuiOptions = {}) {
    const key = resolveLicense(options)
    if (key) LicenseManager.setLicenseKey(key)
    installAgGridLocale(_app, options.locale)
  },
}
