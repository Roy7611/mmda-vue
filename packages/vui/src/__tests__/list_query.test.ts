import { describe, expect, it } from 'vitest'
import {
  settleRemoteListQuery,
  writeListFilterModel,
  writeListSorts,
} from '../ui/ui_list_query'
import { SortOrder, type EntitySearchParam } from '@mmda/core'

describe('list remote query', () => {
  it('排序只写 searchParam.pager.sorts 并把页码回到 1', () => {
    const searchParam: EntitySearchParam = {
      pager: { pageNo: 3, pageSize: 20, sorts: [] },
    }
    writeListSorts(searchParam, [
      { sortBy: 'code', sortOrder: SortOrder.ASC },
    ])
    expect(searchParam.pager.pageNo).toBe(1)
    expect(searchParam.pager.sorts).toEqual([
      { sortBy: 'code', sortOrder: SortOrder.ASC },
    ])
  })

  it('过滤只写 searchParam.filterModel 并把页码回到 1', () => {
    const searchParam: EntitySearchParam = {
      pager: { pageNo: 4, pageSize: 20 },
      filterModel: {
        old: { filterType: 'text', operator: 'CONTAINS', value: 'x' },
      },
    }
    writeListFilterModel(searchParam, {
      name: { filterType: 'text', operator: 'CONTAINS', value: '螺丝' },
    })
    expect(searchParam.pager.pageNo).toBe(1)
    expect(searchParam.filterModel).toEqual({
      name: { filterType: 'text', operator: 'CONTAINS', value: '螺丝' },
    })
  })

  it('空 filterModel 清掉字段过滤', () => {
    const searchParam: EntitySearchParam = {
      pager: { pageNo: 2, pageSize: 20 },
      filterModel: {
        name: { filterType: 'text', operator: 'CONTAINS', value: 'a' },
      },
    }
    writeListFilterModel(searchParam, {})
    expect(searchParam.filterModel).toBeUndefined()
    expect(searchParam.pager.pageNo).toBe(1)
  })

  it('settleRemoteListQuery 等 Promise 完成', async () => {
    let done = false
    await settleRemoteListQuery(
      Promise.resolve().then(() => {
        done = true
      }),
    )
    expect(done).toBe(true)
  })
})
