import type { App, Plugin } from 'vue'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import Ripple from 'primevue/ripple'
import Tooltip from 'primevue/tooltip'
import Aura from '@primevue/themes/aura'
import { primeVueI18n } from './prime_i18n'
import '@mmda/vui/fontawesome.css'
import '@mmda/vui/material-symbols.css'
import '@mmda/vui/theme.css'
import './style.css'

export * from './prime_i18n'
export * from './prime_layout'
export * from './prime_factory'
export * from './prime_field_factory'
export * from './prime_builder'
export * from './components/PrimeVueOverlayHost'
export * from './components/BpmnModeler'
export * from './components/FilePreview'
export * from './components/CodeImage'
export * from './components/HelpPanel'
export * from './components/SigninForm'
export * from './components/AppSideMenu'

/** PrimeVue 4 默认 Aura 主题；与 Tailwind 共存时可传入带 cssLayer 的 theme 覆盖 */
export const primeVueThemeConfig = {
  preset: Aura,
  options: {
    darkModeSelector: '.p-dark',
  },
}

export interface MmdaPrimeVueOptions {
  locale?: string | Record<string, any>
  theme?: Record<string, any>
  ripple?: boolean
}

/** Installs PrimeVue and the overlay services required by PrimeVueUiBuilder. */
export const mmdaPrimeVue: Plugin = {
  install(app: App, options: MmdaPrimeVueOptions = {}) {
    const locale =
      typeof options.locale === 'string'
        ? primeVueI18n[options.locale] ?? primeVueI18n.en
        : options.locale ?? primeVueI18n.en
    app.use(PrimeVue, {
      ripple: options.ripple ?? true,
      locale,
      theme: options.theme ?? primeVueThemeConfig,
    })
    app.use(ConfirmationService)
    app.use(DialogService)
    app.use(ToastService)
    app.directive('ripple', Ripple)
    app.directive('tooltip', Tooltip)
  },
}

/** Old package export retained for a low-friction migration. */
export const mmdaUI = mmdaPrimeVue
