import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { ReactUiLayout } from '../ui/layout'

describe('ReactUiLayout', () => {
  it('cell 返回元素', () => {
    const layout = new ReactUiLayout()
    const el = layout.cell(createElement('span', null, 'x'))
    expect(el).toBeTruthy()
  })

  it('row 返回元素', () => {
    const layout = new ReactUiLayout()
    const el = layout.row(
      [createElement('span', null, 'a'), createElement('span', null, 'b')],
      [1, 1],
    )
    expect(el).toBeTruthy()
  })

  it('column 返回元素', () => {
    const layout = new ReactUiLayout()
    const el = layout.column([createElement('span', null, 'a')])
    expect(el).toBeTruthy()
  })

  it('scaffold 抛出（需皮肤包）', () => {
    const layout = new ReactUiLayout()
    expect(() => layout.scaffold({})).toThrow('skin package')
  })
})