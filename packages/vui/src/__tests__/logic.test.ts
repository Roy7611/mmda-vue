import { describe, expect, it } from 'vitest'
import {
  MetaUi,
  MetaUiField,
  MetaUiFieldLogic,
  MetaUiGroupLogic,
  SqlDataType,
} from '@mmda/core'
import { UiLogic } from '../ui/ui_logic'
import { UiViewContext } from '../ui/ui_context'

const field = (fieldName: string, fieldIdx = 0) =>
  new MetaUiField({
    fieldName,
    displayLabel: fieldName,
    fieldIdx,
    dataType: SqlDataType.NVARCHAR,
    nullable: true,
  })

const metaui = new MetaUi({
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

class OrderLogic extends UiLogic<any> {}

const service = {
  getApiClient: (): Record<string, never> => ({}),
  getPack: async () => ({ metaui }),
  findModule: (): undefined => undefined,
  locale: 'zh',
} as any

describe('UiLogic', () => {
  it('beforeEdit 把 Field/Group Logic 挂到当前会话', async () => {
    const logic = new OrderLogic(o => o as any, {
      service,
      repository: 'Orders',
      meta: { metaui },
    })
    const { fields, groups } = logic.beforeEdit()
    fields.push(logic.field('orderNo').lock())
    groups.push(logic.group('items'))

    const ctx = new UiViewContext({
      model: { id: '1', orderNo: 'A', items: [] },
      metaui,
      view: 'edit',
    })
    await logic.applyTo(ctx, 'edit')

    expect(ctx.getFieldLogic('orderNo')?.readonlyFn).toBeTypeOf('function')
    expect(ctx.getGroupLogic('items')).toBeInstanceOf(MetaUiGroupLogic)
  })

  it('只加载并缓存当前视图的 Logic', async () => {
    let indexLoads = 0
    let editLoads = 0
    const logic = new OrderLogic(o => o as any, {
      service,
      repository: 'Orders',
      meta: { metaui },
    })
    logic.viewLogicLoaders = {
      index: async () => {
        indexLoads++
        return {
          beforeIndex(this: OrderLogic) {
            const result = UiLogic.prototype.beforeIndex.call(this)
            result.fields.push(this.field('orderNo').lock())
            return result
          },
        }
      },
      edit: async () => {
        editLoads++
        return () => UiLogic.prototype.beforeEdit.call(logic)
      },
    }

    const first = new UiViewContext({
      model: [],
      metaui,
      view: 'index',
    })
    await logic.applyTo(first, 'index')
    await logic.applyTo(first, 'index')
    const create = new UiViewContext({
      model: { id: '2' },
      metaui,
      view: 'create',
    })
    await logic.applyTo(create, 'create')

    expect(indexLoads).toBe(1)
    expect(editLoads).toBe(1)
    expect(first.getFieldLogic('orderNo')?.readonlyFn).toBeTypeOf('function')
  })
})

describe('_setupGroupLogic 隔离性', () => {
  it('不会将子表字段写入父级 fieldLogics', () => {
    const ctx = new UiViewContext({
      model: { id: '1', items: [] },
      metaui,
    })
    const childField = new MetaUiFieldLogic(field('childField'))
    const group = metaui.getGroup('items')!
    const grpLogic = new MetaUiGroupLogic(group)
    ;(grpLogic.fields as MetaUiFieldLogic<any>[]).push(childField)

    ctx.setupGroupLogic(grpLogic)

    expect(ctx.getFieldLogic('childField')).toBeUndefined()
    expect(ctx.getGroupLogic('items')).toBe(grpLogic)
  })

  it('合并时保留父 chain 的 cellEditable', () => {
    const parentFl = new MetaUiFieldLogic(field('qty')).inPlaceEdit()
    const childFl = new MetaUiFieldLogic(field('qty'))
    const renderFn = (): undefined => undefined
    childFl.setCustomCellRenderer(renderFn)
    const cellEditable = parentFl.cellEditable
    Object.assign(parentFl, childFl)
    parentFl.cellEditable = cellEditable ?? parentFl.cellEditable
    expect(parentFl.cellEditable).toBe(true)
    expect(parentFl.customCellRenderer).toBe(renderFn)
  })
})
