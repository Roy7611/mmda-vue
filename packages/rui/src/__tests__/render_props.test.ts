/**
 * rui 适配层 — 跨框架对照（形状断言，无 DOM 渲染）。
 *
 * 判定口径来自 cross-framework-render-compat：
 * - `class` → `className`，原键不出现在输出中
 * - `for` → `htmlFor`，原键不出现在输出中
 * - `attributes` 被平铺进输出
 * - 函数键保留（给控件消费）
 * - `onUpdate` 别名已被 core 滤掉
 */
import { describe, expect, it } from 'vitest'
import { uiRenderProps, type UiProps } from '@mmda/core'
import { reactRenderProps } from '../render_props'

describe('reactRenderProps（形状）', () => {
  it('class 数组收成字符串 → className', () => {
    const std = uiRenderProps({ class: ['a', 'b', false, 'c'] })
    const rui = reactRenderProps(std)
    expect(rui.className).toBe('a b c')
    expect(rui).not.toHaveProperty('class')
  })

  it('class 空 → 无 className', () => {
    const std = uiRenderProps({})
    const rui = reactRenderProps(std)
    expect(rui).not.toHaveProperty('className')
  })

  it('style 对象保留', () => {
    const std = uiRenderProps({ style: { color: 'red' } })
    const rui = reactRenderProps(std)
    expect(rui.style).toEqual({ color: 'red' })
  })

  it('for → htmlFor，原键不出现在输出中', () => {
    const std = uiRenderProps({ for: 'input-id' } as UiProps)
    const rui = reactRenderProps(std)
    expect(rui.htmlFor).toBe('input-id')
    expect(rui).not.toHaveProperty('for')
  })

  it('htmlAttributes 压平进输出', () => {
    const std = uiRenderProps({ htmlAttributes: { tabIndex: 0, title: 'hi' } })
    const rui = reactRenderProps(std)
    expect(rui.tabIndex).toBe(0)
    expect(rui.title).toBe('hi')
  })

  it('data-* / aria-* 进 attributes（core 已分流）', () => {
    const std = uiRenderProps({ 'data-test': 'val', 'aria-label': 'lbl' } as UiProps)
    // data-* / aria-* 被 core 分流到 std.attributes，不在 std.props 里
    expect(std.attributes['data-test']).toBe('val')
    expect(std.attributes['aria-label']).toBe('lbl')
  })

  it('函数键保留在输出中（控件需要消费）', () => {
    const fn = (v: string) => {}
    const std = uiRenderProps({ onChange: fn } as unknown as UiProps)
    const rui = reactRenderProps(std)
    expect(rui.onChange).toBe(fn)
  })

  it('onUpdate 别名已被 core 滤掉', () => {
    const fn = () => {}
    const std = uiRenderProps({ 'onUpdate': fn, 'onUpdate:modelValue': fn } as unknown as UiProps)
    const rui = reactRenderProps(std)
    expect(rui).not.toHaveProperty('onUpdate')
    expect(rui).not.toHaveProperty('onUpdate:modelValue')
  })
})