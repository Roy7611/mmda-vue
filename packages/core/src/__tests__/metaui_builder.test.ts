import { describe, expect, it } from 'vitest'
import {
  MetaUiBuilder,
  MetaUiFieldAlignment,
  SqlDataType,
} from '../index'
import { createMockField } from './helpers/metaui_mock'

describe('MetaUiBuilder', () => {
  it('名 + 标签再链式', () => {
    const metaUi = MetaUiBuilder.create('Batch')
      .field('qty', '数量')
      .listed()
      .listSize(120)
      .align(MetaUiFieldAlignment.CENTER)
      .build()
    const qty = metaUi.getField('qty')
    expect(qty?.displayLabel).toBe('数量')
    expect(qty?.listed).toBe(true)
    expect(qty?.listSize).toBe(120)
    expect(qty?.align).toBe(MetaUiFieldAlignment.CENTER)
  })

  it('对象 / 名+部分对象 / fields 数组', () => {
    const listed = createMockField({
      fieldName: 'toolNo',
      displayLabel: '工装号',
      listed: true,
    })
    const metaUi = MetaUiBuilder.create('Tools')
      .field({ fieldName: 'qty', displayLabel: '数量', listed: true, listSize: 80 })
      .field('name', { displayLabel: '名称', listed: true })
      .fields([listed])
      .build()
    expect(metaUi.getListedFields().map((f) => f.fieldName).sort()).toEqual(
      ['name', 'qty', 'toolNo'].sort(),
    )
    expect(metaUi.getField('qty')?.dataType).toBe(SqlDataType.NVARCHAR)
  })
})
