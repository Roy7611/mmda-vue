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
})
