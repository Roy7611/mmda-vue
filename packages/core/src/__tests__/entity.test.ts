/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-07-01 15:29:27
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2026-06-10 16:57:44
 * @FilePath: /mmda-vue/packages/core/src/__tests__/entity.test.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { describe, expect, it, test } from 'vitest'
import { Entity } from '../models/entity'
import { MetaModel } from '../models/metamodel'
import {
  MetaRelationType,
  MetaUiField,
  type MetaUiFieldInit,
} from '../metaui/metaui_field'
import { MetaUi } from '../metaui/metaui_group'
class Warehouse extends Entity {
  whID!: string
  whName!: string
  constructor(o?: any) {
    super()
    Object.assign(this, o)
  }
}
function createEntity<E extends Entity>(c: { new(o?: any): E }, o?: any) {
  return new c(o)
}
const entity: any = {
  rowNum: '0',
  entityState: 1,
  assemblyState: 0,
  customProperties: {
    $parentCatID: '食品操作文档',
  },
  categoryID: '84442493013196801',
  categoryCode: 'N1002',
  categoryName: '操作文档',
  parentCatID: '84442493013197694',
  predefined: false,
  depth: 1,
  childrenCount: 2,
  hasChildren: true,
  tenantID: 300,
  deletable: true,
  editable: true,
}
const fldInit: MetaUiFieldInit = {
  fieldIdx: 4,
  fieldName: 'parentCatID',
  displayLabel: '上级类别标识',
  emphasized: false,
  listed: true,
  aggregationSet: 0,
  listSize: 250,
  sortable: false,
  renderer: 'RefText',
  readOnly: false,
  editor: 'SearchBox',
  selectOptions: 'REF DocCategory(categoryID,categoryName)',
  validationRules: '',
  hidden: false,
  primaryKey: false,
  dataType: 72,
  numericPrecision: 19,
  numericScale: 0,
  nullable: true,
  unsigned: false,
}
describe('entity factory', () => {
  it('create instance', () => {
    const w = createEntity<Warehouse>(Warehouse, { whID: '01', whName: '仓库' })
    expect(w.whID).toBe('01')
    expect(w.whName).toBe('仓库')
    expect(w instanceof Warehouse).toBe(true)
  })
  it('get field value test', () => {
    const fld = new MetaUiField(fldInit)
    const val = MetaModel.getFieldValue(entity, fld)
    const id = entity[fld.fieldName]
    const text = MetaModel.getRefProp(entity, 'parentCatID')
  })
})

describe('MetaUi name column', () => {
  it('marks the legacy nameCol field as the list details link', () => {
    const metaui = new MetaUi({
      objName: 'Material',
      displayLabel: '物料',
      primaryKey: 'materialID',
      nameCol: 'materialCode',
      groups: [
        {
          groupName: 'basic',
          groupLabel: '基础信息',
          many: false,
          fields: [
            {
              ...fldInit,
              fieldName: 'materialCode',
              displayLabel: '物料编码',
              selectOptions: undefined,
            },
          ],
        },
      ],
    })

    expect(metaui.labelField).toBe('materialCode')
    expect(metaui.getField('materialCode')?.linkable).toBe(true)
  })
})
