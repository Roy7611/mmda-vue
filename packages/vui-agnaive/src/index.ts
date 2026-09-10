import type { App, Plugin } from 'vue'
import { LicenseManager } from 'ag-grid-enterprise'
import '@mmda/vui/fontawesome.css'
import '@mmda/vui/material-symbols.css'
import '@mmda/vui/theme.css'
import './style.css'
import { naiveSkinState } from './agnaive_theme'

export * from './agnaive_layout'
export * from './agnaive_factory'
export * from './agnaive_field_factory'
export * from './agnaive_builder'
export * from './agnaive_overlay'
export * from './agnaive_theme'
export * from './ag_filter'
export * from './ag_columns'
export * from './components/AgGrid'
export * from './components/AgNaiveOverlayHost'
export * from './components/AgNaiveAppSideMenu'
export * from './components/SigninForm'
export * from './components/BpmnModeler'

export interface AgNaiveOptions {
  licenseKey?: string
  locale?: string
}

function resolveLicense(options: AgNaiveOptions) {
  if (options.licenseKey) return options.licenseKey
  try {
    return (import.meta as any).env?.VITE_AG_GRID_LICENSE as string | undefined
  } catch {
    return undefined
  }
}

export const mmdaAgNaive: Plugin = {
  install(_app: App, options: AgNaiveOptions = {}) {
    const key = resolveLicense(options)
    if (key) LicenseManager.setLicenseKey(key)
    if (options.locale) naiveSkinState.locale = options.locale
  },
}
