import { describe, expect, it } from 'vitest'
import { SqlDataType } from '../metaui/datatype'
import { MetaUiFilterType } from '../metaui/metaui_filter'
import type { UiContext } from '../ui/context'
import {
  applySearchDraft,
  defaultSearchFields,
  resetSearchRows,
  searchFieldCandidates,
  searchModelOf,
  searchRowsOf,
  seedSearchRows,
  type UiSearchRow,
} from '../ui/builder/search_view'
import { FieldFilter } from '../models/entity_search'
import { createMockField, createMockMetaUi } from './helpers/metaui_mock'

function fakeContext(rows: UiSearchRow[] = [], filterModel?: Record<string, unknown>) {
  const context = {
    searchRows: rows,
    searchParam: {
      pager: { pageNo: 3, pageSize: 20 },
      filterModel,
    },
  }
  return context as unknown as UiContext
}

describe('搜索条件行（search_view）', () => {
  it('默认行字段只出 sortable === true 的列', () => {
    const sortable = createMockField({
      fieldName: 'materialCode',
      sortable: true,
      filterTypes: MetaUiFilterType.TEXT,
    })
    const plain = createMockField({
      fieldName: 'remark',
      filterTypes: MetaUiFilterType.TEXT,
    })
    const metaUi = createMockMetaUi([sortable, plain])
    expect(defaultSearchFields(metaUi).map((field) => field.fieldName)).toEqual([
      'materialCode',
    ])
  })

  it('「添加字段」候选去掉已在列的', () => {
    const metaUi = createMockMetaUi([
      createMockField({ fieldName: 'a', listed: true }),
      createMockField({ fieldName: 'b', listed: true }),
    ])
    expect(searchFieldCandidates(metaUi, [{ fieldName: 'a' }]).map((f) => f.fieldName)).toEqual([
      'b',
    ])
  })

  it('FieldFilter.leaf 按算子形态给叶子', () => {
    const text = createMockField({
      fieldName: 'code',
      dataType: SqlDataType.NVARCHAR,
      filterTypes: MetaUiFilterType.TEXT,
    })
    expect(FieldFilter.leaf(text, 'CONTAINS', { value: 'A' })).toEqual({
      filterType: 'text',
      operator: 'CONTAINS',
      value: 'A',
    })
    expect(FieldFilter.leaf(text, 'IS_NOT_BLANK')).toEqual({
      filterType: 'text',
      operator: 'IS_NOT_BLANK',
    })

    const date = createMockField({
      fieldName: 'createdAt',
      dataType: SqlDataType.TIMESTAMP,
      filterTypes: MetaUiFilterType.DATE,
    })
    expect(
      FieldFilter.leaf(date, 'BETWEEN', { value: '2026-01-01', valueTo: '2026-01-31' }),
    ).toEqual({
      filterType: 'date',
      operator: 'BETWEEN',
      value: '2026-01-01',
      valueTo: '2026-01-31',
    })
    expect(FieldFilter.leaf(date, 'WITHIN', { value: 'THIS_MONTH' })).toEqual({
      filterType: 'date',
      operator: 'WITHIN',
      value: 'THIS_MONTH',
    })
    expect(FieldFilter.leaf(date, 'WITHIN', { value: 'nope' })).toBeUndefined()

    const enumField = createMockField({
      fieldName: 'status',
      dataType: SqlDataType.INT,
      filterTypes: MetaUiFilterType.SET,
      selectOptions: 'ENUM Status(1,New|2,Done)',
    })
    expect(FieldFilter.leaf(enumField, 'IN', { values: [1, 2] })).toEqual({
      filterType: 'set',
      operator: 'IN',
      values: [1, 2],
    })

    const boolField = createMockField({
      fieldName: 'enabled',
      dataType: SqlDataType.BIT,
      filterTypes: MetaUiFilterType.BOOLEAN,
    })
    expect(FieldFilter.leaf(boolField, 'IS_TRUE')).toEqual({
      filterType: 'boolean',
      value: true,
    })
    expect(FieldFilter.leaf(boolField, 'IS_NOT_NULL')).toEqual({
      filterType: 'boolean',
      operator: 'IS_NOT_NULL',
      value: null,
    })
    // 布尔列不吃文本算子
    expect(FieldFilter.leaf(boolField, 'CONTAINS', { value: 'x' })).toBeUndefined()
  })

  it('draftOf 取回值三槽（multi / join 取第一叶）', () => {
    expect(FieldFilter.draftOf(undefined)).toEqual({})
    expect(
      FieldFilter.draftOf({ filterType: 'set', operator: 'IN', values: [1] }),
    ).toEqual({ values: [1] })
    expect(
      FieldFilter.draftOf(FieldFilter.between('a', 'b')),
    ).toEqual({ value: 'a', valueTo: 'b' })
    expect(
      FieldFilter.draftOf(
        FieldFilter.multi([FieldFilter.eq('x'), FieldFilter.in([1])]),
      ),
    ).toEqual({ value: 'x' })
  })

  it('行 → FilterModel：单叶原样、多叶 multi、空叶丢弃', () => {
    const single = searchModelOf([
      { fieldName: 'code', filter: FieldFilter.eq('A', 'text') },
    ])
    expect(single).toEqual({ code: { filterType: 'text', operator: 'EQ', value: 'A' } })

    const multi = searchModelOf([
      { fieldName: 'code', filter: FieldFilter.eq('A', 'text') },
      { fieldName: 'code', filter: FieldFilter.in([1, 2]) },
      { fieldName: 'blank' },
    ])
    expect(multi).toEqual({
      code: {
        filterType: 'multi',
        filterModels: [
          { filterType: 'text', operator: 'EQ', value: 'A' },
          { filterType: 'set', operator: 'IN', values: [1, 2] },
        ],
      },
    })

    expect(searchModelOf([{ fieldName: 'code' }])).toBeUndefined()
  })

  it('同字段多行带 join 标记时收 join（保留 OR）', () => {
    const model = searchModelOf([
      { fieldName: 'code', filter: FieldFilter.eq('A', 'text'), join: 'OR' },
      { fieldName: 'code', filter: FieldFilter.eq('B', 'text'), join: 'OR' },
    ])
    expect(model).toEqual({
      code: {
        filterType: 'join',
        operator: 'OR',
        conditions: [
          { filterType: 'text', operator: 'EQ', value: 'A' },
          { filterType: 'text', operator: 'EQ', value: 'B' },
        ],
      },
    })
  })

  it('FilterModel → 行（multi / join 摊平），行 → FilterModel 能回来', () => {
    const model = {
      code: FieldFilter.multi([
        FieldFilter.eq('A', 'text'),
        FieldFilter.in([1, 2]),
      ]),
      status: FieldFilter.in([1, 2]),
    }
    const rows = searchRowsOf(model)
    expect(rows).toEqual([
      { fieldName: 'code', filter: { filterType: 'text', operator: 'EQ', value: 'A' } },
      { fieldName: 'code', filter: { filterType: 'set', operator: 'IN', values: [1, 2] } },
      { fieldName: 'status', filter: { filterType: 'set', operator: 'IN', values: [1, 2] } },
    ])
    expect(searchModelOf(rows)).toEqual(model)
    // 单叶 multi 摊平后收成叶子（不留空壳 multi）
    expect(
      searchModelOf(searchRowsOf({ code: FieldFilter.multi([FieldFilter.eq('A', 'text')]) })),
    ).toEqual({ code: { filterType: 'text', operator: 'EQ', value: 'A' } })
  })

  it('seedSearchRows 给声明行填值，多出来的字段追加在后面', () => {
    const context = fakeContext([
      { fieldName: 'code' },
      { fieldName: 'status' },
    ])
    seedSearchRows(context, {
      status: FieldFilter.in([2]),
      extra: FieldFilter.eq('x', 'text'),
    })
    expect(context.searchRows).toEqual([
      { fieldName: 'code' },
      { fieldName: 'status', filter: { filterType: 'set', operator: 'IN', values: [2] } },
      { fieldName: 'extra', filter: { filterType: 'text', operator: 'EQ', value: 'x' } },
    ])
  })

  it('applySearchDraft 写回目标会话并把页码置 1；不写自己的 searchParam 时返回它', () => {
    const list = fakeContext([], { old: FieldFilter.eq('1', 'text') })
    const search = fakeContext([
      { fieldName: 'code', filter: FieldFilter.eq('A', 'text') },
    ])
    search.searchParam!.searchWord = '螺丝'
    const target = applySearchDraft(search, list)
    expect(target).toBe(list)
    expect(list.searchParam!.filterModel).toEqual({
      code: { filterType: 'text', operator: 'EQ', value: 'A' },
    })
    expect(list.searchParam!.searchWord).toBe('螺丝')
    expect(list.searchParam!.pager.pageNo).toBe(1)
    // 草稿会话自己的 filterModel 不被碰
    expect(search.searchParam!.filterModel).toBeUndefined()
  })

  it('applySearchDraft 缺省写自己的会话；清空后 filterModel 归 undefined', () => {
    const context = fakeContext([{ fieldName: 'code' }], {
      code: FieldFilter.eq('A', 'text'),
    })
    applySearchDraft(context)
    expect(context.searchParam!.filterModel).toBeUndefined()
  })

  it('resetSearchRows 只清值、保留行', () => {
    const context = fakeContext([
      { fieldName: 'code', filter: FieldFilter.eq('A', 'text') },
      { fieldName: 'extra' },
    ])
    resetSearchRows(context)
    expect(context.searchRows).toEqual([
      { fieldName: 'code' },
      { fieldName: 'extra' },
    ])
  })
})
