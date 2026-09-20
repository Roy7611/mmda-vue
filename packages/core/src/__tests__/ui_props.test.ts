import { describe, expect, it } from 'vitest'
import { UI_CSS_PREFIX, uiClassName, uiClassModifiers, uiCssClass } from '../ui/css'
import { uiRenderProps } from '../ui/props'

type Bag = Record<string, unknown>

describe('class 名字工具', () => {
  it('uiCssClass 造一个 BEM 名（带 mmda- 前缀）', () => {
    expect(uiCssClass('page', 'header', 'sticky')).toBe(
      `${UI_CSS_PREFIX}-page__header--sticky`,
    )
  })

  it('uiClassModifiers 造 block + 一组修饰符名', () => {
    expect(uiClassModifiers('page', 'tabs', false, undefined)).toBe(
      `${UI_CSS_PREFIX}-page ${UI_CSS_PREFIX}-page--tabs`,
    )
  })

  it('uiClassName 合并多段（数组递归、假值丢掉），不造前缀', () => {
    expect(uiClassName('a', ['b', ['c', false, null]], '', undefined)).toBe(
      'a b c',
    )
    expect(uiClassName()).toBe('')
  })
})

describe('uiRenderProps：袋 → 渲染前标准形态', () => {
  it('class 收成字符串进 props.class，htmlAttributes 压平进 attributes，style 收成对象', () => {
    const std = uiRenderProps({
      value: 'abc',
      disabled: false,
      class: ['mmda-text-input', undefined, ['mmda-text-input--dense']],
      style: 'color: red; width: 100%',
      htmlAttributes: { id: 'fld-name', 'data-kind': 'text' },
    })

    expect(std.props).toMatchObject({ value: 'abc', disabled: false })
    expect(std.attributes).toEqual({ id: 'fld-name', 'data-kind': 'text' })
    expect(std.props.class).toBe('mmda-text-input mmda-text-input--dense')
    expect(std.props.style).toEqual({ color: 'red', width: '100%' })
  })

  it('袋键 htmlAttributes.class 并进 props.class，不留在 attributes', () => {
    const std = uiRenderProps({
      class: 'mmda-a',
      htmlAttributes: { class: 'mmda-b' },
    })
    expect(std.props.class).toBe('mmda-a mmda-b')
    expect(std.attributes.class).toBeUndefined()
  })

  it('Vue 别名 onUpdate / onUpdate:modelValue 不进标准形态，onXxx 具名事件保留', () => {
    const std = uiRenderProps({
      onChange: () => undefined,
      onUpdate: () => undefined,
      'onUpdate:modelValue': () => undefined,
    })
    expect(typeof std.props.onChange).toBe('function')
    expect((std.props as Bag).onUpdate).toBeUndefined()
    expect((std.props as Bag)['onUpdate:modelValue']).toBeUndefined()
  })

  it('`for` 保留平台原名（不做 htmlFor 改名；React 侧再译）', () => {
    const std = uiRenderProps({ for: 'fld-name', htmlAttributes: { id: 'x' } })
    expect((std.props as Bag).for).toBe('fld-name')
    expect((std.props as Bag).htmlFor).toBeUndefined()
  })

  it('函数型成员留在 props，绝不进 attributes（Vue 会把函数静默写成 DOM 属性）', () => {
    const renderer = () => 'x'
    const std = uiRenderProps({ itemRenderer: renderer, onChange: () => undefined })
    expect(std.props.itemRenderer).toBe(renderer)
    expect((std.attributes as Bag).itemRenderer).toBeUndefined()
    expect((std.attributes as Bag).onChange).toBeUndefined()
  })

  it('顶层 data-* / aria-* 进 attributes（只收标量，对象挡掉）', () => {
    const std = uiRenderProps({
      'data-testid': 'row',
      'aria-label': '名称',
      'data-bad': { nested: true },
    } as never)
    expect(std.attributes).toEqual({ 'data-testid': 'row', 'aria-label': '名称' })
  })

  it('对象型剩余键留在 props，不进 attributes（写进 DOM 就是 [object Object]）', () => {
    const std = uiRenderProps({ extra: { a: 1 } } as never)
    expect((std.props as Bag).extra).toEqual({ a: 1 })
    expect((std.attributes as Bag).extra).toBeUndefined()
  })

  it('style 对象只留 string / number，其余丢掉', () => {
    const std = uiRenderProps({ style: { width: 20, ok: '1px', bad: {} } } as never)
    expect((std.props as Bag).style).toEqual({ width: 20, ok: '1px' })
  })

  it('空袋不炸', () => {
    const std = uiRenderProps()
    expect(std.props).toEqual({})
    expect(std.attributes).toEqual({})
  })
})
