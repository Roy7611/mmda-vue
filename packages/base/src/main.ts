import { createApp } from 'vue'
import {
  MmdaApplication,
  UI_BUILDER_KEY,
  resolveRepositoryModule,
  setupI18n,
  type UiLogicInit,
} from '@mmda/vui'
import {
  mmdaPrimeVue,
  PrimeVueUiBuilder,
} from '@mmda/vui-primevue'
import 'primeicons/primeicons.css'
import './style.css'
import { LOGIC_LOADERS } from './logic/registry'
import { MMDA_BASE_KEY } from './keys'
import { createBaseRouter } from './router'
import { AppShell } from './App'
import zh from './locales/zh'
import en from './locales/en'
import zhHant from './locales/zh-Hant'

const apiUrl = import.meta.env.VITE_BASE_API || '/api'
const builder = new PrimeVueUiBuilder()
const i18n = setupI18n(
  { zh, en, 'zh-Hant': zhHant },
  'zh',
)
const mmda = new MmdaApplication(apiUrl, 'base', builder, i18n, {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || 'mmda-base',
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || '',
})
const router = createBaseRouter(mmda)

for (const [repository, load] of Object.entries(LOGIC_LOADERS)) {
  mmda.di.provide(`${repository}Logic`, async () => {
    const init: UiLogicInit = {
      service: mmda.meta,
      repository,
      router,
      module: resolveRepositoryModule(mmda, repository),
    }
    const Ctor = await load()
    return new Ctor(init)
  })
}

const vueApp = createApp(AppShell)
vueApp.use(i18n)
vueApp.use(mmdaPrimeVue, { locale: 'zh' })
vueApp.use(mmda)
vueApp.use(router)
vueApp.provide(UI_BUILDER_KEY, builder)
vueApp.provide(MMDA_BASE_KEY, mmda)

void mmda.signinAuto().then(() => {
  vueApp.mount('#app')
})
