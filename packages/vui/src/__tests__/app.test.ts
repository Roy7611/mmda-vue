import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, inject } from 'vue'
import { setupI18n } from '../i18n/i18n'
import { MmdaVueApp } from '../app/app'
import { createStubUiBuilder } from '../ui/builder'
import { UI_APP_KEY, UI_APP_KEY as VUI_UI_APP_KEY } from '../app/keys'
import { UI_APP_KEY as CORE_UI_APP_KEY } from '@mmda/core'
import { getFileInfo } from '../components/FileIcons'

describe('MmdaVueApp', () => {
  it('装配 DI、locale 和弹层转发，不依赖图表引擎', () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const app = new MmdaVueApp('https://example.test/api', 'wms', ui, i18n)

    expect(app.name).toBe('wms')
    expect(app.di.provide).toBeTypeOf('function')
    expect(app.canAccess).toBe(false)
    app.changeLocale('en')
    expect(app.locale).toBe('en')
  })

  it('confirmDialog 转发给 Builder', async () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const app = new MmdaVueApp('https://example.test/api', 'wms', ui, i18n)
    await expect(app.ui.dialog({} as any, {} as any, { title: 'x' })).resolves.toBe('cancel')
  })

  it('应用壳直接调用 layout.scaffold，不包 mmda-app', () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const sideBar = vi
      .spyOn(ui, 'buildAppSideBar')
      .mockReturnValue(h('aside', 'navigation'))
    const scaffold = vi
      .spyOn(ui.layout, 'scaffold')
      .mockImplementation(slots => h('main', [slots.nav, slots.page]))
    const mmda = new MmdaVueApp('https://example.test/api', 'wms', ui, i18n)
    const Root = defineComponent({
      setup() {
        const app = inject(UI_APP_KEY)! as MmdaVueApp
        const builder = app.ui
        return () =>
          builder.layout.scaffold({
            variant: 'sidebarLeft',
            nav: builder.buildAppSideBar({
              modules: app.modules,
              header: () => null,
            }),
            page: h('section', 'content'),
          })
      },
    })
    const host = document.createElement('div')
    document.body.append(host)
    const vueApp = createApp(Root)
    vueApp.use(mmda)
    vueApp.mount(host)

    expect(scaffold).toHaveBeenCalledOnce()
    expect(sideBar).toHaveBeenCalledWith(
      expect.objectContaining({ modules: mmda.modules }),
    )
    expect(host.textContent).toContain('content')

    vueApp.unmount()
    host.remove()
  })


  it('业务包从 core 拿的键，能取到 vui 提供的壳（同一 symbol）', () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const mmda = new MmdaVueApp('https://example.test/api', 'wms', ui, i18n)
    // 符号本体在 core（ui/app_keys.ts），vui 只是包成 InjectionKey；两边必须同一个对象，
    // 否则 base / mes 用 core 的键 inject 会拿到 undefined。
    expect(VUI_UI_APP_KEY).toBe(CORE_UI_APP_KEY)
    let seen: unknown
    const Root = defineComponent({
      setup() {
        seen = inject(CORE_UI_APP_KEY)
        return () => h('div')
      },
    })
    const host = document.createElement('div')
    document.body.append(host)
    const vueApp = createApp(Root)
    vueApp.use(mmda)
    vueApp.mount(host)
    expect(seen).toBe(mmda)
    vueApp.unmount()
    host.remove()
  })
  it('signin 使用应用级 OAuth client 配置', async () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const app = new MmdaVueApp('https://example.test/api', 'wms', ui, i18n, {
      clientId: 'app-client',
      clientSecret: 'app-secret',
    })
    const auth = vi.spyOn(app.api, 'authenticate').mockResolvedValue({
      userId: '1',
      username: 'admin',
      userType: 0,
      expiryOn: Date.now() + 3600_000,
    })
    vi.spyOn(app.meta, 'getModules').mockResolvedValue([])
    vi.spyOn(app, 'getSystems').mockResolvedValue(undefined)
    await app.signin('admin', 'pwd', false)
    expect(auth).toHaveBeenCalledWith(
      'admin',
      'pwd',
      'app-client',
      'app-secret',
      undefined,
    )
    auth.mockRestore()
  })
})

describe('FileIcons', () => {
  it('按扩展名解析文件图标', () => {
    expect(getFileInfo('/tmp/a.xlsx').fileExt).toBe('xlsx')
    expect(getFileInfo('/tmp/a.xlsx').fileIcon).toContain('excel')
  })
})
