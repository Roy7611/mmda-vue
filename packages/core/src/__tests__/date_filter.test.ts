import { describe, expect, it } from 'vitest'
import {
  DateRangeKind,
  dateTimeRange,
  isDateRangeKind,
} from '../models/date_range'
import {
  DatePeriodToken,
  DatePeriodTreeNode,
  HalfOpenDateRange,
} from '../models/date_filter'
import { FieldFilter, FilterModel } from '../models/entity'

describe('dateTimeRange extras', () => {
  it('TOMORROW 整段在今天之后', () => {
    const today = dateTimeRange[DateRangeKind.TODAY]()
    const tomorrow = dateTimeRange[DateRangeKind.TOMORROW]()
    expect(tomorrow.start.toMillis()).toBeGreaterThanOrEqual(today.end.toMillis())
  })

  it('LAST_90_DAYS 含今天共 90 个日历日', () => {
    const range = dateTimeRange[DateRangeKind.LAST_90_DAYS]()
    const days = range.end.startOf('day').diff(range.start.startOf('day'), 'days').days
    expect(days).toBe(89)
  })

  it('THIS_WEEK 从周一起', () => {
    const range = dateTimeRange[DateRangeKind.THIS_WEEK]()
    expect(range.start.weekday).toBe(1)
  })

  it('isDateRangeKind 不含 EARLIER', () => {
    expect(isDateRangeKind(DateRangeKind.NEXT_MONTH)).toBe(true)
    expect(isDateRangeKind(DateRangeKind.EARLIER)).toBe(false)
  })
})

describe('date period tokens', () => {
  it('相邻 5 月与 6 月合并成一段半开 BETWEEN', () => {
    const expanded = FilterModel.expandDates({
      createdAt: FieldFilter.in(['2026-05', '2026-06']),
    })
    expect(expanded?.createdAt).toEqual({
      filterType: 'date',
      operator: 'BETWEEN',
      value: '2026-05-01 00:00:00',
      valueTo: '2026-07-01 00:00:00',
    })
  })

  it('2026-05 + 2026-06-01 + 2025-12 合并成两段 OR', () => {
    const expanded = FilterModel.expandDates({
      createdAt: FieldFilter.in(['2026-05', '2026-06-01', '2025-12']),
    })
    expect(expanded?.createdAt).toMatchObject({
      filterType: 'join',
      operator: 'OR',
    })
    const conditions = (expanded!.createdAt as { conditions: unknown[] }).conditions
    expect(conditions).toEqual([
      {
        filterType: 'date',
        operator: 'BETWEEN',
        value: '2025-12-01 00:00:00',
        valueTo: '2026-01-01 00:00:00',
      },
      {
        filterType: 'date',
        operator: 'BETWEEN',
        value: '2026-05-01 00:00:00',
        valueTo: '2026-06-02 00:00:00',
      },
    ])
  })

  it('dateKind 不展开', () => {
    const kind = FieldFilter.dateKind(DateRangeKind.THIS_MONTH)
    expect(kind).toEqual({
      filterType: 'date',
      operator: 'WITHIN',
      value: DateRangeKind.THIS_MONTH,
    })
    expect(FilterModel.expandDates({ createdAt: kind })?.createdAt).toEqual(kind)
  })

  it('status set 不当地期 token 展开', () => {
    const status = FieldFilter.in(['OPEN', 'USED'])
    expect(FilterModel.expandDates({ status })?.status).toEqual(status)
  })

  it('DatePeriodToken.compact 对照 pivot 收成年月', () => {
    const pivot = ['2026-05-01', '2026-05-15', '2026-06-01']
    expect(DatePeriodToken.compact(['2026-05-01', '2026-05-15'], pivot)).toEqual(['2026-05'])
    expect(
      DatePeriodToken.compact(['2026-05-01', '2026-05-15', '2026-06-01'], pivot),
    ).toEqual(['2026'])
  })

  it('DatePeriodTreeNode.fromTokens 用服务端已排序的年/月/日 List<String>，不重排', () => {
    const tokens = [
      '2025',
      '2025-06',
      '2025-06-13',
      '2025-06-16',
      '2025-07',
      '2025-07-01',
    ]
    expect(DatePeriodTreeNode.fromTokens(tokens, { month: '月' })).toEqual([
      {
        id: '2025',
        text: '2025',
        children: [
          {
            id: '2025-06',
            text: '6月',
            children: [
              { id: '2025-06-13', text: '13' },
              { id: '2025-06-16', text: '16' },
            ],
          },
          {
            id: '2025-07',
            text: '7月',
            children: [{ id: '2025-07-01', text: '01' }],
          },
        ],
      },
    ])
    expect(DatePeriodToken.days(tokens)).toEqual(['2025-06-13', '2025-06-16', '2025-07-01'])
  })

  it('从日 token 拼树，全选月仍走 compact', () => {
    const days = ['2026-05-01', '2026-05-15', '2026-06-01']
    const tree = DatePeriodTreeNode.fromTokens(days, { month: '月' })
    expect(tree).toEqual([
      {
        id: '2026',
        text: '2026',
        children: [
          {
            id: '2026-05',
            text: '5月',
            children: [
              { id: '2026-05-01', text: '01' },
              { id: '2026-05-15', text: '15' },
            ],
          },
          {
            id: '2026-06',
            text: '6月',
            children: [{ id: '2026-06-01', text: '01' }],
          },
        ],
      },
    ])
    expect(DatePeriodToken.compact(['2026-05-01', '2026-05-15'], days)).toEqual(['2026-05'])
  })

  it('DatePeriodToken.expandLeaves 把月 token 展开成 pivot 日', () => {
    expect(
      DatePeriodToken.expandLeaves(['2026-05'], ['2026-05-01', '2026-05-15', '2026-06-01']),
    ).toEqual(['2026-05-01', '2026-05-15'])
  })

  it('半开相邻：5 月 next 等于 6 月 1 日 start', () => {
    const may = HalfOpenDateRange.fromToken('2026-05')!
    const day = HalfOpenDateRange.fromToken('2026-06-01')!
    const [merged] = HalfOpenDateRange.merge([may, day])
    expect(merged.start.toISODate()).toBe('2026-05-01')
    expect(merged.next.toISODate()).toBe('2026-06-02')
  })
})
