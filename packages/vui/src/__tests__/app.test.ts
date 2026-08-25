import { describe, expect, it, vi } from 'vitest'
import { setupI18n } from '../i18n/i18n'
import { MmdaApplication } from '../ui/ui_app'
import { createStubUiBuilder } from '../ui/ui_builder'
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
