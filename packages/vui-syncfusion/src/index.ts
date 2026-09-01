import type { App, Plugin } from 'vue'
import { registerLicense } from '@syncfusion/ej2-base'
import '@mmda/vui/fontawesome.css'
import '@mmda/vui/material-symbols.css'
import '@mmda/vui/theme.css'
import './style.css'
import { installSyncfusionLocale } from './syncfusion_i18n'

export * from './syncfusion_layout'
export * from './syncfusion_factory'
export * from './syncfusion_field_factory'
export * from './syncfusion_builder'
export * from './syncfusion_overlay'
export * from './syncfusion_i18n'
export * from './components/SyncfusionOverlayHost'
export * from './components/BpmnDiagram'
// GanttChart is loaded lazily via SyncfusionUiBuilder.buildGanttChart
export * from './components/Barcode'
export * from './components/HelpPanel'
export * from './components/SigninForm'
export * from './components/AppSideMenu'
export * from './components/SyncfusionAppMenu'
export * from './components/DropupMenuButton'
export * from './components/AttachmentPanel'
export * from './components/PhotoGallery'
export * from './components/FilesUploader'

export interface MmdaSyncfusionOptions {
  licenseKey?: string
  /** vui locale (`zh` / `en` / `zh-Hant`) or a raw EJ2 L10n pack */
  locale?: string | Record<string, unknown>
}

function resolveLicense(options: MmdaSyncfusionOptions) {
  if (options.licenseKey) return options.licenseKey
  try {
    return (import.meta as any).env?.VITE_SYNCFUSION_LICENSE as string | undefined
  } catch {
    return undefined
  }
}

/** Installs Syncfusion license, locale, and theme CSS. Overlay Host is mounted by MmdaApplication.install. */
export const mmdaSyncfusion: Plugin = {
  install(app: App, options: MmdaSyncfusionOptions = {}) {
    const key = resolveLicense(options)
    if (key) registerLicense(key)
    installSyncfusionLocale(app, options.locale)
  },
}
