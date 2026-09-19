import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import {
  vueClassName,
  vueRenderProps,
  vueUpdateOf,
} from '../ui/vue_ui_props'

describe('vueRenderProps：标准形态 → h 能直接吃的 props', () => {
  it('className / htmlFor 换回 Vue 的名字，其余直传', () => {
    const props = vueRenderProps({
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

  it('渲到 DOM：class 正确、无 [object Object]、无 htmlattributes 垃圾键', () => {
    const host = document.createElement('div')
    const app = createApp({
      render: () =>
        h(
          'input',
          vueRenderProps({
            class: ['mmda-text-input', 'mmda-text-input--dense'],
            style: { color: 'red', width: '100%' },
            htmlAttributes: { id: 'fld-name', 'data-kind': 'text' },
          }),
        ),
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
    app.unmount()
  })
})

describe('vueUpdateOf：v-model 写入回调的唯一出口', () => {
  it('优先 onUpdate，其次 onUpdate:modelValue', () => {
    const first = () => undefined
    const second = () => undefined
    expect(vueUpdateOf({ onUpdate: first, 'onUpdate:modelValue': second })).toBe(
      first,
    )
    expect(vueUpdateOf({ 'onUpdate:modelValue': second })).toBe(second)
    expect(vueUpdateOf({})).toBeUndefined()
    expect(vueUpdateOf(undefined)).toBeUndefined()
  })

  it('写回时把值交给袋里的回调', () => {
    const write = vi.fn()
    vueUpdateOf<string>({ onUpdate: write })?.('next')
    expect(write).toHaveBeenCalledWith('next')
  })
})

describe('vueClassName', () => {
  it('控件自算 class + 程序员 class 合并成一份字符串', () => {
    expect(vueClassName(['mmda-a', 'mmda-b'], 'mmda-c')).toBe(
      'mmda-a mmda-b mmda-c',
    )
  })
})
