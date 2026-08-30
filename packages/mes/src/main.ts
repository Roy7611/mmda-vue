import { createApp } from 'vue'
import {
  MmdaApplication,
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
import { MES_KEY } from './keys'
import { createMesRouter } from './router'
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
const mmda = new MmdaApplication(apiUrl, 'mes', builder, i18n, {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || 'mmda-mes',
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || '',
})
const router = createMesRouter(mmda)

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
vueApp.provide(MES_KEY, mmda)

void mmda.signinAuto().finally(() => {
  vueApp.mount('#app')
})
