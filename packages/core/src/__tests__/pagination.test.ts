import { describe, expect, it } from 'vitest'
import {
  Paginator,
  SortOrder,
  assignPagedList,
  defaultPager,
  emptyPagedList,
  isNotPager,
  noPager,
  parseSorts,
} from '../models/pagination'

describe('pagination', () => {
  it('parseSorts 解析多列排序', () => {
    const sorts = parseSorts('whCode ASC,whName DESC')
    expect(sorts).toHaveLength(2)
    expect(sorts[0].sortBy).toBe('whCode')
    expect(sorts[0].sortOrder).toBe(SortOrder.ASC)
    expect(sorts[1].sortBy).toBe('whName')
    expect(sorts[1].sortOrder).toBe(SortOrder.DESC)
  })

  it('空串得到空排序列表', () => {
    expect(parseSorts('')).toEqual([])
  })

  it('Pager JSON 往返保留排序', () => {
    const pager = Paginator.pagerFromJson({
      pageSize: 20,
      pageNo: 3,
      sort: 'code DESC,name',
    })
    expect(pager.pageSize).toBe(20)
    expect(pager.pageNo).toBe(3)
    expect(Paginator.pagerToJson(pager)).toEqual({
      pageSize: 20,
      pageNo: 3,
      sort: 'code DESC,name ASC',
    })
  })

  it('defaultPager / noPager', () => {
    expect(defaultPager()).toMatchObject({ pageSize: 20, pageNo: 1 })
    expect(isNotPager(noPager())).toBe(true)
    expect(isNotPager(defaultPager())).toBe(false)
  })

  it('assignPagedList 覆盖列表和分页信息', () => {
    const target = emptyPagedList<number>()
    assignPagedList(target, {
      list: [1, 2],
      pagination: {
        pageSize: 5,
        pageNo: 2,
        recordCount: 12,
        pageCount: 3,
        from: 6,
        to: 10,
      },
    })
    expect(target.list).toEqual([1, 2])
    expect(target.pagination.recordCount).toBe(12)
    expect(target.pagination.pageNo).toBe(2)
  })
})
