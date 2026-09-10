import { describe, expect, it } from 'vitest'
import { placeFields } from '../ui/layout'

describe('placeFields', () => {
  it('默认 1x1 按行填充', () => {
    const cells = placeFields(2, [{}, {}, {}])
    expect(cells).toEqual([
      { column: 0, row: 0, colSpan: 1, rowSpan: 1 },
      { column: 1, row: 0, colSpan: 1, rowSpan: 1 },
      { column: 0, row: 1, colSpan: 1, rowSpan: 1 },
    ])
  })

  it('整行备注占满列，colSpan 钳到组列数', () => {
    const cells = placeFields(2, [
      {},
      {},
      { colSpan: 3, rowSpan: 1 },
    ])
    expect(cells[2]).toEqual({ column: 0, row: 1, colSpan: 2, rowSpan: 1 })
  })

  it('跨行照片不与邻格重叠', () => {
    const cells = placeFields(3, [
      { colSpan: 1, rowSpan: 3 },
      {},
      {},
      {},
      {},
      {},
    ])
    expect(cells[0]).toEqual({ column: 0, row: 0, colSpan: 1, rowSpan: 3 })
    expect(cells[1]).toEqual({ column: 1, row: 0, colSpan: 1, rowSpan: 1 })
    expect(cells[2]).toEqual({ column: 2, row: 0, colSpan: 1, rowSpan: 1 })
    expect(cells[3]).toEqual({ column: 1, row: 1, colSpan: 1, rowSpan: 1 })
    expect(cells[4]).toEqual({ column: 2, row: 1, colSpan: 1, rowSpan: 1 })
    expect(cells[5]).toEqual({ column: 1, row: 2, colSpan: 1, rowSpan: 1 })
  })

  it('2 列与 3 列切换只改 gridCols 即可重排', () => {
    const spans = [{}, {}, { colSpan: 3 }, {}]
    const two = placeFields(2, spans)
    const three = placeFields(3, spans)
    expect(two[2].colSpan).toBe(2)
    expect(three[2].colSpan).toBe(3)
    expect(two[2].column).toBe(0)
    expect(three[2].column).toBe(0)
  })
})
