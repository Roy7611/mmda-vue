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
      service: { getApiClient: () => ({}) } as any,
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

  it('附件与模板走 doAction / postBlob，不调用 ApiClient 专用方法', async () => {
    const doAction = vi.fn(async () => ({ ok: true }))
    const postBlob = vi.fn(async () => new Blob(['xlsx']))
    const getAllTemplate = vi.fn(async () => [
      { templateName: '导入', templateFile: 'a.xlsx', templateID: 't1' },
    ])
    const logic = new OrderLogic(o => o as any, {
      service: {
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
