import { describe, expect, it, vi } from 'vitest'
import { MetaUi, MetaUiField, SqlDataType } from '@mmda/core'
import { UiLogic } from '../ui/ui_logic'
import { UiBuildContext } from '../ui/ui_build_context'

const metaui = new MetaUi({
  objName: 'Order',
  displayLabel: '订单',
  groups: [
    {
      groupName: 'a1',
      groupLabel: '订单',
      many: false,
      fields: [
        new MetaUiField({
          fieldName: 'orderNo',
          displayLabel: '单号',
          fieldIdx: 0,
          dataType: SqlDataType.NVARCHAR,
          nullable: true,
        }),
      ],
    },
  ],
})

class OrderLogic extends UiLogic<any> {}

describe('UiBuildContext', () => {
  it('save 走 UiLogic 并在校验通过后提交', async () => {
    const save = vi.fn(async (model: any) => model)
    const logic = new OrderLogic(o => o as any, {
      metaUiService: { getApiClient: () => ({}) } as any,
      repository: 'Orders',
      meta: { metaui },
    })
    logic.save = save
    const ctx = new UiBuildContext({
      model: { id: '1', orderNo: 'SO-1' } as any,
      metaui,
      view: 'edit',
      logic,
    })
    await ctx.save()
    expect(save).toHaveBeenCalled()
  })

  it('工具栏 save 动作在编辑页成功后跳转详情', async () => {
    const { UiActionFactory } = await import('../ui/ui_builder')
    const push = vi.fn()
    const save = vi.fn(async (model: any) => ({ ...model, id: '42' }))
    const logic = new OrderLogic(o => o as any, {
      metaUiService: { getApiClient: () => ({}) } as any,
      repository: 'Orders',
      meta: { metaui },
      router: { push } as any,
    })
    logic.save = save
    const ctx = new UiBuildContext({
      model: { id: '42', orderNo: 'SO-1' } as any,
      metaui,
      view: 'edit',
      logic,
      app: {
        name: 'base',
        toast: async () => undefined,
        i18n: { global: { t: (k: string) => k } },
      } as any,
    })
    const factory = new UiActionFactory(
      { toast: async () => undefined } as any,
      (icon: string) => icon,
    )
    const action = factory.save(ctx as any)
    await action.onAction?.()
    expect(save).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/BASE/Orders/42')
  })

  it('routeTo 使用 logic.apiService，不误用统一宿主的 app.name', async () => {
    const push = vi.fn()
    const logic = new OrderLogic(o => o as any, {
      metaUiService: { getApiClient: () => ({}) } as any,
      repository: 'EquipmentChecklists',
      meta: { metaui },
      router: { push } as any,
      apiService: 'mes',
    })
    const ctx = new UiBuildContext({
      model: { id: '141' } as any,
      metaui,
      view: 'index',
      logic,
      app: { name: 'base' } as any,
    })
    ctx.details('141')
    expect(push).toHaveBeenCalledWith('/MES/EquipmentChecklists/141')
  })

  it('附件与模板走 doAction / postBlob，不调用 ApiClient 专用方法', async () => {
    const doAction = vi.fn(async () => ({ ok: true }))
    const postBlob = vi.fn(async () => new Blob(['xlsx']))
    const getAllTemplate = vi.fn(async () => [
      { templateName: '导入', templateFile: 'a.xlsx', templateID: 't1' },
    ])
    const logic = new OrderLogic(o => o as any, {
      metaUiService: {
        getApiClient: () => ({
          doAction,
          http: { postBlob },
          buildEntityURL: () => '/Orders/downloadTemplate',
        }),
        getAllTemplate,
      } as any,
      repository: 'Orders',
      meta: { metaui },
    })
    const ctx = new UiBuildContext({
      model: { id: '1', orderNo: 'SO-1' } as any,
      metaui,
      view: 'edit',
      logic,
    })

    await ctx.uploadAttachment({ fileName: 'a.pdf', fileSize: '1' } as any)
    await ctx.getTemplates()
    await ctx.downloadTemplate(ctx.templates[0])

    expect(doAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'uploadAttachment',
        path: '1',
        service: 'files',
      }),
      expect.objectContaining({ fileName: 'a.pdf' }),
    )
    expect(getAllTemplate).toHaveBeenCalledWith('Orders')
    expect(postBlob).toHaveBeenCalled()
    expect(ctx.templates[0].templateID).toBe('t1')
  })

  it('批量删除只提交 deletable 行：一条 deleteOne，多条 deleteAll', async () => {
    const deleteOne = vi.fn(async () => true)
    const deleteMany = vi.fn(async () => true)
    const logic = new OrderLogic(o => o as any, {
      metaUiService: { getApiClient: () => ({}) } as any,
      repository: 'Orders',
      meta: { metaui },
    })
    logic.delete = deleteOne
    logic.deleteAll = deleteMany
    const ctx = new UiBuildContext({
      model: { list: [] } as any,
      metaui,
      view: 'index',
      logic,
    })
    ctx.search = vi.fn(async () => undefined) as any

    ctx.selectedItems = [
      { id: '1', deletable: true },
      { id: '2', deletable: false },
    ]
    await ctx.deleteAll(['1', '2'])
    expect(deleteOne).toHaveBeenCalledWith('1')
    expect(deleteMany).not.toHaveBeenCalled()

    deleteOne.mockClear()
    ctx.selectedItems = [
      { id: '1', deletable: true },
      { id: '2' },
      { id: '3', deletable: false },
    ]
    await ctx.deleteAll(['1', '2', '3'])
    expect(deleteMany).toHaveBeenCalledWith(['1', '2'])
    expect(deleteOne).not.toHaveBeenCalled()
  })

  it('所选全不可删时不请求服务器', async () => {
    const deleteOne = vi.fn(async () => true)
    const deleteMany = vi.fn(async () => true)
    const logic = new OrderLogic(o => o as any, {
      metaUiService: { getApiClient: () => ({}) } as any,
      repository: 'Orders',
      meta: { metaui },
    })
    logic.delete = deleteOne
    logic.deleteAll = deleteMany
    const ctx = new UiBuildContext({
      model: { list: [] } as any,
      metaui,
      view: 'index',
      logic,
    })
    ctx.search = vi.fn(async () => undefined) as any
    ctx.selectedItems = [{ id: '9', deletable: false }]
    await expect(ctx.deleteAll(['9'])).resolves.toBe(false)
    expect(deleteOne).not.toHaveBeenCalled()
    expect(deleteMany).not.toHaveBeenCalled()
  })

  it('批量删除动作在 index 确认后提交，不依赖 selectMany', async () => {
    const toast = vi.fn()
    const confirm = vi.fn(async () => 'yes')
    const deleteAll = vi.fn(async () => true)
    const { UiActionFactory } = await import('../ui/ui_builder')
    const factory = new UiActionFactory(
      { toast, confirm } as any,
      (icon: string) => icon,
    )
    const ctx = {
      selectedItems: [
        { id: '1', deletable: true },
        { id: '2', deletable: false },
        { id: '3', deletable: true },
      ],
      metaui: { displayLabel: '订单' },
      t: (key: string) => key,
      translate: (key: string) => key,
      actionLoadings: {},
      executing: false,
      deleteAll,
    }
    await factory.deleteAll(ctx as any).onAction?.()
    expect(confirm).toHaveBeenCalled()
    expect(deleteAll).toHaveBeenCalledWith(['1', '3'])
    expect(toast).not.toHaveBeenCalled()
  })

  it('批量删除动作在全不可删时只提示不提交', async () => {
    const toast = vi.fn()
    const confirm = vi.fn(async () => 'yes')
    const deleteAll = vi.fn()
    const { UiActionFactory } = await import('../ui/ui_builder')
    const factory = new UiActionFactory(
      { toast, confirm } as any,
      (icon: string) => icon,
    )
    const ctx = {
      selectedItems: [{ id: '9', deletable: false }],
      metaui: { displayLabel: '订单' },
      t: (key: string) => key,
      translate: (key: string) => key,
      actionLoadings: {},
      executing: false,
      deleteAll,
    }
    await factory.deleteAll(ctx as any).onAction?.()
    expect(toast).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ detail: 'invalid.noDeletable' }),
    )
    expect(confirm).not.toHaveBeenCalled()
    expect(deleteAll).not.toHaveBeenCalled()
  })

  it('模块动作未配置 displayHint 时默认 warning', async () => {
    const { UiActionFactory } = await import('../ui/ui_builder')
    const factory = new UiActionFactory(
      { toast: async () => undefined } as any,
      (icon: string) => icon,
    )
    const ctx = {
      t: (key: string) => key,
      translate: (key: string) => key,
      actionLoadings: {},
      executing: false,
      doAction: vi.fn(),
    }
    expect(factory.action(ctx as any, { name: 'ship' }).colorRole).toBe(
      'warning',
    )
    expect(
      factory.action(ctx as any, { name: 'scrap', role: 'DANGER' }).colorRole,
    ).toBe('danger')
  })
})
