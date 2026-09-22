import { describe, expect, it } from 'vitest'
import { AbstractUiFactory } from '../ui/factory_base'
import type { UiNodeProps } from '../ui/layout'
import type { UiRenderer } from '../ui/renderer'

type Node = {
  tag: string
  props?: UiNodeProps
  children?: Array<Node | string>
}

type Call = { tag: string; props?: UiNodeProps; children?: Array<Node | string> }

function spyRenderer(record: Call[]): UiRenderer<Node, UiNodeProps> {
  return {
    render: (tag, props, children) => {
      const node: Node = { tag, props, children }
      record.push({ tag, props, children })
      return node
    },
  }
}

/**
 * 测试只关注 5 个纯 HTML 壳方法；抽象平台控件不在运行时实现也不被调用，
 * 故用抽象子类 + 构造签名转换得到一个可实例化的 spy。
 */
abstract class SpyFactoryBase extends AbstractUiFactory<Node> {
  constructor(readonly calls: Call[]) {
    super(spyRenderer(calls))
  }
}

const SpyFactory = SpyFactoryBase as unknown as new (
  calls: Call[],
) => SpyFactoryBase

describe('AbstractUiFactory 纯 HTML 壳方法', () => {
  it('textSpan / label / title / subtitle 用对应标签并转文本子节点', () => {
    const calls: Call[] = []
    const factory = new SpyFactory(calls)

    factory.textSpan({ text: 'hi' })
    factory.label({ text: '姓名' })
    factory.title({ text: 'T' })
    factory.subtitle({ text: 'sub' })

    expect(calls.map((c) => c.tag)).toEqual(['span', 'label', 'h3', 'small'])
    expect(calls.map((c) => c.children)).toEqual([
      ['hi'],
      ['姓名'],
      ['T'],
      ['sub'],
    ])
  })

  it('icon 用 i 标签并把 iconClass 放进 class', () => {
    const calls: Call[] = []
    const factory = new SpyFactory(calls)

    factory.icon({ iconClass: 'fas fa-user' })

    expect(calls[0].tag).toBe('i')
    expect(calls[0].props?.class).toBe('fas fa-user')
    expect(calls[0].children).toEqual([])
  })

  it('text 之外的键（class / style）进 attributes', () => {
    const calls: Call[] = []
    const factory = new SpyFactory(calls)

    factory.textSpan({ text: 'hi', class: 'x', style: { color: 'red' } })

    expect(calls[0].props?.attributes).toMatchObject({
      class: 'x',
      style: { color: 'red' },
    })
  })
})
