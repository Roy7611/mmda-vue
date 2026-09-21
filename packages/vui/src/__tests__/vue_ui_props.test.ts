import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { uiRenderProps } from '@mmda/core'
import { vueUpdateOf } from '../ui/vue_ui_props'

/** vui 适配层的唯一两行：`{...std.props, ...std.attributes}`（标准形态已用平台原名）。 */
function vueProps(props: Parameters<typeof uiRenderProps>[0]) {
  const std = uiRenderProps(props)
  return { ...std.props, ...std.attributes }
}

describe('vui 适配：标准形态 → h 能直接吃的 props', () => {
  it('class / for 平台原名直传，其余原样', () => {
    const props = vueProps({
      value: 'abc',
      class: ['mmda-a', false, ['mmda-b']],
      style: { color: 'red' },
      htmlAttributes: { id: 'fld-name', 'data-kind': 'text' },
      for: 'fld-name',
      onChange: () => undefined,
    })

    expect(props.class).toBe('mmda-a mmda-b')
    expect(props.for).toBe('fld-name')
    expect(props.htmlFor).toBeUndefined()
    expect(props.className).toBeUndefined()
    expect(props.style).toEqual({ color: 'red' })
    expect(props.id).toBe('fld-name')
    expect(props['data-kind']).toBe('text')
    expect(props.value).toBe('abc')
    expect(typeof props.onChange).toBe('function')
  })

  it('原生元素只吃 attributes + class / style；函数 / 对象留在 props 给控件', () => {
    const std = uiRenderProps({
      class: ['mmda-text-input', 'mmda-text-input--dense'],
      style: { color: 'red', width: '100%' },
      htmlAttributes: { id: 'fld-name', 'data-kind': 'text' },
      itemRenderer: () => 'x',
      columns: [{ name: 'a' }],
    })

    // 通道约束：attributes 只收标量，函数 / 对象永不进 DOM 属性通道
    expect(std.attributes).toEqual({
      id: 'fld-name',
      'data-kind': 'text',
    })
    // 声明的委托留给控件消费
    expect(typeof (std.props as Record<string, unknown>).itemRenderer).toBe('function')

    const host = document.createElement('div')
    const app = createApp({
      render: () =>
        h('input', {
          ...std.attributes,
          class: std.props.class,
          style: std.props.style,
        }),
    })
    app.mount(host)

    const input = host.querySelector('input')!
    expect(input.getAttribute('class')).toBe(
      'mmda-text-input mmda-text-input--dense',
    )
    expect(input.getAttribute('style')).toBe('color: red; width: 100%;')
    expect(input.getAttribute('id')).toBe('fld-name')
    expect(input.getAttribute('data-kind')).toBe('text')
    expect(input.outerHTML).not.toContain('object Object')
    expect(input.outerHTML).not.toContain('itemrenderer')
    app.unmount()
  })

  it('label 的 for 落到 DOM 的 for（不是 htmlfor）', () => {
    const host = document.createElement('div')
    const app = createApp({
      render: () => h('label', vueProps({ for: 'fld-name' }), '名称'),
    })
    app.mount(host)
    expect(host.querySelector('label')!.getAttribute('for')).toBe('fld-name')
    app.unmount()
  })
})

describe('vueUpdateOf：v-model 写入回调的唯一出口', () => {
  it('两个通道都给时都写；只给一个就给那一个', () => {
    const updates: string[] = []
    const both = vueUpdateOf({
      onUpdate: () => updates.push('onUpdate'),
      'onUpdate:modelValue': () => updates.push('modelValue'),
    })
    both?.('v')
    expect(updates).toEqual(['onUpdate', 'modelValue'])

    const only = () => undefined
    expect(vueUpdateOf({ 'onUpdate:modelValue': only })).toBe(only)
    expect(vueUpdateOf({})).toBeUndefined()
    expect(vueUpdateOf(undefined)).toBeUndefined()
  })

  it('具名多 v-model：vueUpdateOf(props, name) 读 onUpdate:<name>', () => {
    const nodes = vi.fn()
    expect(vueUpdateOf({ 'onUpdate:nodes': nodes }, 'nodes')).toBe(nodes)
    expect(vueUpdateOf({ 'onUpdate:nodes': nodes })).toBeUndefined()
  })

  it('写回时把值交给回调', () => {
    const write = vi.fn()
    vueUpdateOf<string>({ onUpdate: write })?.('next')
    expect(write).toHaveBeenCalledWith('next')
  })
})