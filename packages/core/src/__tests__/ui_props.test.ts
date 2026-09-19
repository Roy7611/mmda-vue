import { describe, expect, it } from 'vitest'
import { UI_CSS_PREFIX, uiClassName, uiClassModifiers, uiCssClass } from '../ui/css'
import { uiRenderProps } from '../ui/props'

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
  it('class 收成字符串，htmlAttributes 压平，style 收成对象', () => {
    const std = uiRenderProps({
      value: 'abc',
      disabled: false,
      class: ['mmda-text-input', undefined, ['mmda-text-input--dense']],
      style: 'color: red; width: 100%',
      htmlAttributes: { id: 'fld-name', 'data-kind': 'text' },
    })

    // 具名参数原样（含 onXxx）
    expect(std.props).toMatchObject({ value: 'abc', disabled: false })
    // attrs 压平 + 字符串 class；style 是对象（React 见字符串会抛错）
    expect(std.attributes).toEqual({ id: 'fld-name', 'data-kind': 'text' })
    expect(std.className).toBe('mmda-text-input mmda-text-input--dense')
    expect(std.style).toEqual({ color: 'red', width: '100%' })
  })

  it('袋键 htmlAttributes.class 并进 className，不留在 attributes', () => {
    const std = uiRenderProps({
      class: 'mmda-a',
      htmlAttributes: { class: 'mmda-b' },
    })
    expect(std.className).toBe('mmda-a mmda-b')
    expect(std.attributes.class).toBeUndefined()
  })

  it('Vue 专属别名不进标准形态，onXxx 具名事件保留', () => {
    const std = uiRenderProps({
      onChange: () => undefined,
      onUpdate: () => undefined,
      'onUpdate:modelValue': () => undefined,
    })
    expect(typeof std.props.onChange).toBe('function')
    expect(std.props.onUpdate).toBeUndefined()
    expect(std.props['onUpdate:modelValue']).toBeUndefined()
  })

  it('`for` 规范成 `htmlFor`（两个运行时都不吃原名）', () => {
    const std = uiRenderProps({ for: 'fld-name', id: 'x' })
    expect(std.props.htmlFor).toBe('fld-name')
    expect(std.props.for).toBeUndefined()
  })

  it('style 对象只留 string / number，其余丢掉', () => {
    const std = uiRenderProps({ style: { width: 20, ok: '1px', bad: {} } })
    expect(std.style).toEqual({ width: 20, ok: '1px' })
  })

  it('空袋不炸', () => {
    const std = uiRenderProps()
    expect(std.props).toEqual({})
    expect(std.attributes).toEqual({})
    expect(std.className).toBeUndefined()
    expect(std.style).toBeUndefined()
  })
})
