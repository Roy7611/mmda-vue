import { describe, expect, it } from 'vitest'
import { EntityLogic, MetaUi, MetaUiField, MetaUiFieldLogic, MetaUiGroupLogic, SqlDataType, UiViewOne, UiViewMany } from '@mmda/core'
import { VuiContext } from '../contexts/vue_ui_context'

const field = (fieldName: string, fieldIdx = 0) =>
  new MetaUiField({
    fieldName,
    displayLabel: fieldName,
    fieldIdx,
    dataType: SqlDataType.NVARCHAR,
    nullable: true,
  })

const metaUi = new MetaUi({
  objName: 'Order',
  displayLabel: '订单',
  groups: [
    {
      groupName: 'a1',
      groupLabel: '订单',
      many: false,
      fields: [field('orderNo')],
    },
    {
      groupName: 'items',
      groupLabel: '明细',
      many: true,
      fields: [],
      joinOn: 'orderID=@id',
      groupUi: {
        objName: 'OrderItem',
        displayLabel: '订单行',
        groups: [
          {
            groupName: 'a1',
            groupLabel: '行',
            many: false,
            fields: [field('itemName')],
          },
        ],
      },
    },
  ],
})

class OrderLogic extends EntityLogic<any> {}

const service = {
  getApiClient: (): Record<string, never> => ({}),
  get: async () => metaUi,
  findModule: (): undefined => undefined,
  locale: 'zh',
} as any

describe('EntityLogic', () => {
  it('继承 EntityLogic', () => {
    const logic = new OrderLogic(o => o as any, {
      metaUiService: service,
      repository: 'Orders',
      metaUi,
    })
    expect(logic).toBeInstanceOf(EntityLogic)
  })

  it('beforeEdit 把 Field/Group Logic 挂到当前会话', async () => {
    const logic = new OrderLogic(o => o as any, {
      metaUiService: service,
      repository: 'Orders',
      metaUi,
    })
    const { fields, groups } = logic.beforeEdit()
    fields.push(logic.field('orderNo').lock())
    groups.push(logic.group('items'))

    const ctx = new VuiContext({
      model: { id: '1', orderNo: 'A', items: [] } as any,
      metaUi,
      view: UiViewOne.Edit,
    })
    await logic.applyTo(ctx, UiViewOne.Edit)

    expect(ctx.getFieldLogic('orderNo')?.readonlyFn).toBeTypeOf('function')
    expect(ctx.getGroupLogic('items')).toBeInstanceOf(MetaUiGroupLogic)
  })

  it('只加载并缓存当前视图的 Logic', async () => {
    let indexLoads = 0
    let editLoads = 0
    const logic = new OrderLogic(o => o as any, {
      metaUiService: service,
      repository: 'Orders',
      metaUi,
    })
    logic.viewLogicLoaders = {
      index: async () => {
        indexLoads++
        return {
          beforeIndex(this: OrderLogic) {
            const result = EntityLogic.prototype.beforeIndex.call(this)
            result.fields.push(this.field('orderNo').lock())
            return result
          },
        }
      },
      edit: async () => {
        editLoads++
        return () => EntityLogic.prototype.beforeEdit.call(logic)
      },
    }

    const first = new VuiContext({
      model: [] as any,
      metaUi,
      view: UiViewMany.Index,
    })
    await logic.applyTo(first, UiViewMany.Index)
    await logic.applyTo(first, UiViewMany.Index)
    const create = new VuiContext({
      model: { id: '2' } as any,
      metaUi,
      view: UiViewOne.Create,
    })
    await logic.applyTo(create, UiViewOne.Create)

    expect(indexLoads).toBe(1)
    expect(editLoads).toBe(1)
    expect(first.getFieldLogic('orderNo')?.readonlyFn).toBeTypeOf('function')
  })
})

describe('_setupGroupLogic 隔离性', () => {
  it('不会将子表字段写入父级 fieldLogics', () => {
    const ctx = new VuiContext({
      model: { id: '1', items: [] } as any,
      metaUi,
    })
    const childField = new MetaUiFieldLogic(field('childField'))
    const group = metaUi.getGroup('items')!
    const grpLogic = new MetaUiGroupLogic(group)
    ;(grpLogic.fields as MetaUiFieldLogic<any>[]).push(childField)

    ctx.setupGroupLogic(grpLogic)

    expect(ctx.getFieldLogic('childField')).toBeUndefined()
    expect(ctx.getGroupLogic('items')).toBe(grpLogic)
  })

  it('合并时保留父 chain 的 inplaceEditable', () => {
    const parentFl = new MetaUiFieldLogic(field('qty')).inplaceEdit()
    const childFl = new MetaUiFieldLogic(field('qty'))
    const renderFn = (): undefined => undefined
    childFl.setCustomCellRenderer(renderFn)
    const inplaceEditable = parentFl.inplaceEditable
    Object.assign(parentFl, childFl)
    parentFl.inplaceEditable = inplaceEditable ?? parentFl.inplaceEditable
    expect(parentFl.inplaceEditable).toBe(true)
    expect(parentFl.customCellRenderer).toBe(renderFn)
  })
})
