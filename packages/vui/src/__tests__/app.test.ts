import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, inject } from 'vue'
import { setupI18n } from '../i18n/i18n'
import { MmdaApplication } from '../ui/ui_app'
import { createStubUiBuilder } from '../ui/ui_builder'
import { UI_APP_KEY, UI_BUILDER_KEY } from '../ui/ui_keys'
import { getFileInfo } from '../ui/components/FileIcons'

describe('MmdaApplication', () => {
  it('装配 DI、locale 和弹层转发，不依赖 echarts', () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const app = new MmdaApplication('https://example.test/api', 'wms', ui, i18n)

    expect(app.name).toBe('wms')
    expect(app.di.provide).toBeTypeOf('function')
    expect(app.canAccess).toBe(false)
    app.changeLocale('en')
    expect(app.locale).toBe('en')
  })

  it('confirmDialog 转发给 Builder', async () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const app = new MmdaApplication('https://example.test/api', 'wms', ui, i18n)
    await expect(app.confirmDialog({} as any, {} as any, { name: 'x' })).resolves.toBe(
      false,
    )
  })

  it('应用壳直接调用 UiBuilder.buildAppScaffold', () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const sideBar = vi
      .spyOn(ui, 'buildAppSideBar')
      .mockReturnValue(h('aside', 'navigation'))
    const scaffold = vi
      .spyOn(ui, 'buildAppScaffold')
      .mockImplementation(props => h('main', [
        typeof props.sideBar === 'function' ? props.sideBar() : props.sideBar,
        typeof props.body === 'function' ? props.body() : props.body,
      ]))
    const mmda = new MmdaApplication('https://example.test/api', 'wms', ui, i18n)
    const Root = defineComponent({
      setup() {
        const app = inject(UI_APP_KEY)!
        const builder = inject(UI_BUILDER_KEY)!
        return () =>
          h('div', { class: 'mmda-app' }, [
            builder.buildAppScaffold({
              layout: 'sidebarLeft',
              sideBar: () =>
                builder.buildAppSideBar({
                  modules: app.modules,
                  header: () => null,
                }),
              body: () => h('section', 'content'),
            }),
          ])
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

  it('signin 使用应用级 OAuth client 配置', async () => {
    const i18n = setupI18n({}, 'zh')
    const ui = createStubUiBuilder()
    const app = new MmdaApplication('https://example.test/api', 'wms', ui, i18n, {
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
